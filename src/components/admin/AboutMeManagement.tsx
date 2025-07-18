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

const DEFAULT_ABOUT_ME_CONTENT = {
  content: "Hello! I'm John Doe, a dedicated and enthusiastic college student with a passion for software development and problem-solving. Currently pursuing a Bachelor's degree in Computer Science, I am constantly seeking opportunities to learn and grow in the ever-evolving tech landscape.\n\nMy academic journey has equipped me with a strong foundation in data structures, algorithms, and various programming paradigms. I thrive on challenges and enjoy transforming complex ideas into functional and elegant solutions.\n\nOutside of my studies, I actively participate in coding competitions, open-source projects, and tech meetups to expand my knowledge and collaborate with fellow enthusiasts. I believe in continuous learning and am always eager to explore new technologies and methodologies.",
  image_url: "https://via.placeholder.com/400x400/0000FF/FFFFFF?text=About+Image",
};

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
            ...DEFAULT_ABOUT_ME_CONTENT,
            updated_at: new Date().toISOString(), // Add updated_at for type consistency
          };
        }
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      setContent(data.content ?? DEFAULT_ABOUT_ME_CONTENT.content);
      setImageUrl(data.image_url ?? DEFAULT_ABOUT_ME_CONTENT.image_url);
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