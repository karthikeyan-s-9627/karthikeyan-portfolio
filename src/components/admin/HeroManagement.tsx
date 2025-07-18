"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  tagline?: string;
  hero_image_url?: string;
}

const DEFAULT_HERO_PROFILE = {
  first_name: "John",
  last_name: "Doe",
  tagline: "A passionate college student building innovative solutions and exploring the frontiers of technology.",
  hero_image_url: "https://via.placeholder.com/400x400/0000FF/FFFFFF?text=Your+Image",
};

const HeroManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [tagline, setTagline] = React.useState("");
  const [heroImageUrl, setHeroImageUrl] = React.useState("");
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    getSession();
  }, []);

  const { data: profile, isLoading, error } = useQuery<Profile, Error>({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available.");
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, tagline, hero_image_url")
        .eq("id", userId)
        .single();
      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return {
            id: userId,
            ...DEFAULT_HERO_PROFILE,
          };
        }
        throw error;
      }
      return data;
    },
    enabled: !!userId,
  });

  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? DEFAULT_HERO_PROFILE.first_name);
      setLastName(profile.last_name ?? DEFAULT_HERO_PROFILE.last_name);
      setTagline(profile.tagline ?? DEFAULT_HERO_PROFILE.tagline);
      setHeroImageUrl(profile.hero_image_url ?? DEFAULT_HERO_PROFILE.hero_image_url);
    }
  }, [profile]);

  const updateProfileMutation = useMutation<null, Error, Partial<Profile>, unknown>({
    mutationFn: async (profileData) => {
      if (!userId) throw new Error("User ID not available for update.");
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...profileData })
        .eq("id", userId);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      showSuccess("Hero section updated successfully!");
    },
    onError: (err) => {
      showError(`Error updating hero section: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({
      first_name: firstName,
      last_name: lastName,
      tagline: tagline,
      hero_image_url: heroImageUrl,
    });
  };

  if (isLoading) return <div className="text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading hero section content...</div>;
  if (error && error.code !== 'PGRST116') return <div className="text-center text-destructive">Error: {error.message}</div>;
  if (!userId) return <div className="text-center text-muted-foreground">Please log in to manage the hero section.</div>;


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Manage Hero Section</h2>
      <Card className="bg-card shadow-lg border border-border/50">
        <CardHeader>
          <CardTitle>Edit Your Hero Content</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea
                id="tagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                rows={3}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            <div>
              <Label htmlFor="heroImageUrl">Hero Image URL (Optional)</Label>
              <Input
                id="heroImageUrl"
                type="url"
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="https://example.com/your-hero-image.jpg"
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default HeroManagement;