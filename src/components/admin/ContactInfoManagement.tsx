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

interface ContactInfo {
  id: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  github_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  whatsapp_url?: string;
  telegram_url?: string;
  updated_at: string;
}

const CONTACT_INFO_SINGLETON_ID = "00000000-0000-0000-0000-000000000002"; // Matches the default ID in SQL

const DEFAULT_CONTACT_INFO = {
  email: "johndoe@example.com",
  phone: "+1 (123) 456-7890",
  location: "Anytown, USA",
  linkedin_url: "#",
  github_url: "#",
  twitter_url: "#",
  instagram_url: "#",
  whatsapp_url: "#",
  telegram_url: "#",
};

const ContactInfoManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [contactInfo, setContactInfo] = React.useState<Omit<ContactInfo, "id" | "updated_at">>({
    email: "",
    phone: "",
    location: "",
    linkedin_url: "",
    github_url: "",
    twitter_url: "",
    instagram_url: "",
    whatsapp_url: "",
    telegram_url: "",
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
        if (error.code === 'PGRST116') { // No rows found
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
        location: data.location ?? DEFAULT_CONTACT_INFO.location,
        linkedin_url: data.linkedin_url ?? DEFAULT_CONTACT_INFO.linkedin_url,
        github_url: data.github_url ?? DEFAULT_CONTACT_INFO.github_url,
        twitter_url: data.twitter_url ?? DEFAULT_CONTACT_INFO.twitter_url,
        instagram_url: data.instagram_url ?? DEFAULT_CONTACT_INFO.instagram_url,
        whatsapp_url: data.whatsapp_url ?? DEFAULT_CONTACT_INFO.whatsapp_url,
        telegram_url: data.telegram_url ?? DEFAULT_CONTACT_INFO.telegram_url,
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
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                value={contactInfo.location}
                onChange={(e) => setContactInfo({ ...contactInfo, location: e.target.value })}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="linkedin_url">LinkedIn URL (Optional)</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={contactInfo.linkedin_url}
                onChange={(e) => setContactInfo({ ...contactInfo, linkedin_url: e.target.value })}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="github_url">GitHub URL (Optional)</Label>
              <Input
                id="github_url"
                type="url"
                value={contactInfo.github_url}
                onChange={(e) => setContactInfo({ ...contactInfo, github_url: e.target.value })}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="twitter_url">Twitter URL (Optional)</Label>
              <Input
                id="twitter_url"
                type="url"
                value={contactInfo.twitter_url}
                onChange={(e) => setContactInfo({ ...contactInfo, twitter_url: e.target.value })}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="instagram_url">Instagram URL (Optional)</Label>
              <Input
                id="instagram_url"
                type="url"
                value={contactInfo.instagram_url}
                onChange={(e) => setContactInfo({ ...contactInfo, instagram_url: e.target.value })}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="whatsapp_url">WhatsApp URL (Optional)</Label>
              <Input
                id="whatsapp_url"
                type="url"
                value={contactInfo.whatsapp_url}
                onChange={(e) => setContactInfo({ ...contactInfo, whatsapp_url: e.target.value })}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
            <div>
              <Label htmlFor="telegram_url">Telegram URL (Optional)</Label>
              <Input
                id="telegram_url"
                type="url"
                value={contactInfo.telegram_url}
                onChange={(e) => setContactInfo({ ...contactInfo, telegram_url: e.target.value })}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
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