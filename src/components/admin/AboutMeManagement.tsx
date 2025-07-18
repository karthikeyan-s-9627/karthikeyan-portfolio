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

interface AboutMeContent {
  id: string;
  content: string;
  image_url?: string;
  updated_at: string;
}

const ABOUT_ME_SINGLETON_ID = "00000000-0000-0000-0000-000000000001"; // Matches the default ID in SQL

const AboutMeManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [content, setContent] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");

  const { data, isLoading, error } = useQuery<AboutMeContent, Error>({
    queryKey: ["about_me"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_me")
        .select("*")
        .eq("id", ABOUT_ME_SINGLETON_ID)
        .single();
      if (error) {
        // If no record exists, return a default structure
        if (error.code === 'PGRST116') { // No rows found
          return {
            id: ABOUT_ME_SINGLETON_ID,
            content: "",
            image_url: "",
            updated_at: new Date().toISOString(),
          };
        }
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      setContent(data.content || "");
      setImageUrl(data.image_url || "");
    },
  });

  const upsertAboutMeMutation = useMutation<null, Error, Omit<AboutMeContent, "updated_at">, unknown>({
    mutationFn: async (aboutMeData) => {
      const { error } = await supabase
        .from("about_me")
        .upsert({ id: ABOUT_ME_SINGLETON_ID, content: aboutMeData.content, image_url: aboutMeData.image_url })
        .eq("id", ABOUT_ME_SINGLETON_ID); // Ensure we update the specific singleton row
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about_me"] });
      showSuccess("About Me content updated successfully!");
    },
    onError: (err) => {
      showError(`Error updating About Me content: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertAboutMeMutation.mutate({ id: ABOUT_ME_SINGLETON_ID, content, image_url: imageUrl });
  };

  if (isLoading) return <div className="text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading About Me content...</div>;
  if (error && error.code !== 'PGRST116') return <div className="text-center text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Manage About Me Section</h2>
      <Card className="bg-card shadow-lg border border-border/50">
        <CardHeader>
          <CardTitle>Edit Your Introduction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="content">About Me Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            <div>
              <Label htmlFor="image_url">Image URL (Optional)</Label>
              <Input
                id="image_url"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/your-image.jpg"
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
              />
            </div>
            <Button type="submit" disabled={upsertAboutMeMutation.isPending}>
              {upsertAboutMeMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutMeManagement;