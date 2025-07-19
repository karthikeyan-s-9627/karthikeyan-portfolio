"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ContactInfo {
  id: string;
  email: string;
  phone?: string;
  phone_enabled?: boolean;
  location?: string;
  location_enabled?: boolean;
  linkedin_url?: string;
  linkedin_url_enabled?: boolean;
  github_url?: string;
  github_url_enabled?: boolean;
  twitter_url?: string;
  twitter_url_enabled?: boolean;
  instagram_url?: string;
  instagram_url_enabled?: boolean;
  whatsapp_url?: string;
  whatsapp_url_enabled?: boolean;
  telegram_url?: string;
  telegram_url_enabled?: boolean;
  updated_at: string;
}

const CONTACT_INFO_SINGLETON_ID = "00000000-0000-0000-0000-000000000002";

const DEFAULT_CONTACT_INFO = {
  email: "johndoe@example.com",
  phone: "+1 (123) 456-7890",
  phone_enabled: true,
  location: "Anytown, USA",
  location_enabled: true,
  linkedin_url: "#",
  linkedin_url_enabled: true,
  github_url: "#",
  github_url_enabled: true,
  twitter_url: "#",
  twitter_url_enabled: true,
  instagram_url: "#",
  instagram_url_enabled: true,
  whatsapp_url: "#",
  whatsapp_url_enabled: true,
  telegram_url: "#",
  telegram_url_enabled: true,
};

const ContactInfoManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [contactInfo, setContactInfo] = React.useState<Omit<ContactInfo, "id" | "updated_at">>({
    email: "",
    phone: "",
    phone_enabled: true,
    location: "",
    location_enabled: true,
    linkedin_url: "",
    linkedin_url_enabled: true,
    github_url: "",
    github_url_enabled: true,
    twitter_url: "",
    twitter_url_enabled: true,
    instagram_url: "",
    instagram_url_enabled: true,
    whatsapp_url: "",
    whatsapp_url_enabled: true,
    telegram_url: "",
    telegram_url_enabled: true,
  });

  const { data, isLoading, error } = useQuery<ContactInfo, Error>({
    queryKey: ["contact_info"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_info")
        .select("*")
        .eq("id", CONTACT_INFO_SINGLETON_ID)
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          return {
            id: CONTACT_INFO_SINGLETON_ID,
            ...DEFAULT_CONTACT_INFO,
            updated_at: new Date().toISOString(),
          };
        }
        throw error;
      }
      return data;
    },
  });

  React.useEffect(() => {
    if (data) {
      setContactInfo({
        email: data.email ?? DEFAULT_CONTACT_INFO.email,
        phone: data.phone ?? DEFAULT_CONTACT_INFO.phone,
        phone_enabled: data.phone_enabled ?? DEFAULT_CONTACT_INFO.phone_enabled,
        location: data.location ?? DEFAULT_CONTACT_INFO.location,
        location_enabled: data.location_enabled ?? DEFAULT_CONTACT_INFO.location_enabled,
        linkedin_url: data.linkedin_url ?? DEFAULT_CONTACT_INFO.linkedin_url,
        linkedin_url_enabled: data.linkedin_url_enabled ?? DEFAULT_CONTACT_INFO.linkedin_url_enabled,
        github_url: data.github_url ?? DEFAULT_CONTACT_INFO.github_url,
        github_url_enabled: data.github_url_enabled ?? DEFAULT_CONTACT_INFO.github_url_enabled,
        twitter_url: data.twitter_url ?? DEFAULT_CONTACT_INFO.twitter_url,
        twitter_url_enabled: data.twitter_url_enabled ?? DEFAULT_CONTACT_INFO.twitter_url_enabled,
        instagram_url: data.instagram_url ?? DEFAULT_CONTACT_INFO.instagram_url,
        instagram_url_enabled: data.instagram_url_enabled ?? DEFAULT_CONTACT_INFO.instagram_url_enabled,
        whatsapp_url: data.whatsapp_url ?? DEFAULT_CONTACT_INFO.whatsapp_url,
        whatsapp_url_enabled: data.whatsapp_url_enabled ?? DEFAULT_CONTACT_INFO.whatsapp_url_enabled,
        telegram_url: data.telegram_url ?? DEFAULT_CONTACT_INFO.telegram_url,
        telegram_url_enabled: data.telegram_url_enabled ?? DEFAULT_CONTACT_INFO.telegram_url_enabled,
      });
    }
  }, [data]);

  const upsertContactInfoMutation = useMutation<null, Error, Omit<ContactInfo, "updated_at">, unknown>({
    mutationFn: async (infoData) => {
      const { error } = await supabase
        .from("contact_info")
        .upsert({ id: CONTACT_INFO_SINGLETON_ID, ...infoData })
        .eq("id", CONTACT_INFO_SINGLETON_ID);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_info"] });
      showSuccess("Contact information updated successfully!");
    },
    onError: (err) => {
      showError(`Error updating contact information: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertContactInfoMutation.mutate({ id: CONTACT_INFO_SINGLETON_ID, ...contactInfo });
  };

  if (isLoading) return <div className="text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading contact information...</div>;
  if (error && error.code !== 'PGRST116') return <div className="text-center text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Manage Contact Information</h2>
      <Card className="bg-card shadow-lg border border-border/50">
        <CardHeader>
          <CardTitle>Edit Your Contact Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email (Cannot be disabled)</Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
            
            {[
              { key: 'phone', label: 'Phone', type: 'tel' },
              { key: 'location', label: 'Location', type: 'text' },
              { key: 'linkedin_url', label: 'LinkedIn URL', type: 'url' },
              { key: 'github_url', label: 'GitHub URL', type: 'url' },
              { key: 'twitter_url', label: 'Twitter URL', type: 'url' },
              { key: 'instagram_url', label: 'Instagram URL', type: 'url' },
              { key: 'whatsapp_url', label: 'WhatsApp URL', type: 'url' },
              { key: 'telegram_url', label: 'Telegram URL', type: 'url' },
            ].map(field => {
              const enabledKey = `${field.key}_enabled` as keyof typeof contactInfo;
              const valueKey = field.key as keyof typeof contactInfo;

              return (
                <div key={field.key}>
                  <Label htmlFor={field.key}>{field.label} (Optional)</Label>
                  <div className="flex items-center gap-4 mt-1">
                    <Input
                      id={field.key}
                      type={field.type}
                      value={contactInfo[valueKey] as string || ''}
                      onChange={(e) => setContactInfo({ ...contactInfo, [valueKey]: e.target.value })}
                      className="flex-grow bg-input/50 border-border/50 focus:border-primary"
                      disabled={!contactInfo[enabledKey]}
                    />
                    <Switch
                      checked={!!contactInfo[enabledKey]}
                      onCheckedChange={(checked) => setContactInfo({ ...contactInfo, [enabledKey]: checked })}
                      aria-label={`Enable ${field.label}`}
                    />
                  </div>
                </div>
              );
            })}

            <Button type="submit" disabled={upsertContactInfoMutation.isPending}>
              {upsertContactInfoMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactInfoManagement;