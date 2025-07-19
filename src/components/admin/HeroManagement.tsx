"use client";

import React from "react";
import { supabase } from "@/lib/supabase"; // Keep importing the base supabase client
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UploadCloud, Image, Link, Trash2, Edit } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ImageEditorDialog from "@/components/ImageEditorDialog"; // Import the new component
import { createClient } from '@supabase/supabase-js'; // Import createClient for authenticated calls

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
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageSourceType, setImageSourceType] = React.useState<'url' | 'upload'>('url');
  const [isImageEditorOpen, setIsImageEditorOpen] = React.useState(false);

  React.useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? null);
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
      setImageSourceType(profile.hero_image_url ? 'url' : 'upload'); // Set initial source type
    }
  }, [profile]);

  const updateProfileMutation = useMutation<null, Error, Partial<Profile> & { email?: string }, unknown>({
    mutationFn: async (profileData) => {
      if (!userId) throw new Error("User ID not available for update.");
      const dataToUpdate: any = { ...profileData };
      if (userEmail) {
        dataToUpdate.email = userEmail;
      }
      const { error } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...dataToUpdate })
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

  const uploadFileMutation = useMutation<string, Error, File, unknown>({
    mutationFn: async (file) => {
      if (!userId) throw new Error("User ID not available for upload.");
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated.");

      const authenticatedSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        }
      );

      const fileExtension = file.name.split('.').pop();
      const fileName = `${userId}-hero.${fileExtension}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await authenticatedSupabase.storage
        .from("images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = authenticatedSupabase.storage
        .from("images")
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for the uploaded file.");
      }
      
      setHeroImageUrl(publicUrlData.publicUrl);
      await updateProfileMutation.mutateAsync({ hero_image_url: publicUrlData.publicUrl });

      return publicUrlData.publicUrl;
    },
    onSuccess: () => {
      showSuccess("Image uploaded successfully!");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsImageEditorOpen(false); // Close editor after successful upload
    },
    onError: (err) => {
      showError(`Error uploading file: ${err.message}`);
    },
  });

  const deleteImageMutation = useMutation<null, Error, string, unknown>({
    mutationFn: async (filePath) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated.");

      const authenticatedSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        {
          global: {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          },
        }
      );

      if (filePath.includes(authenticatedSupabase.storage.from("images").getPublicUrl("").data.publicUrl)) {
        const fileName = filePath.split('/').pop();
        if (fileName) {
          const { error: deleteError } = await authenticatedSupabase.storage
            .from("images")
            .remove([fileName]);
          if (deleteError) throw deleteError;
        }
      }
      await updateProfileMutation.mutateAsync({ hero_image_url: null });
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      showSuccess("Image deleted successfully!");
      setHeroImageUrl("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsImageEditorOpen(false); // Close editor after deletion
    },
    onError: (err) => {
      showError(`Error deleting image: ${err.message}`);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      uploadFileMutation.mutate(selectedFile);
    } else {
      showError("Please select a file to upload.");
    }
  };

  const handleImageEditorSave = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], `${userId}-hero-cropped.jpeg`, { type: "image/jpeg" });
    uploadFileMutation.mutate(croppedFile);
  };

  const handleImageEditorDelete = () => {
    if (heroImageUrl) {
      deleteImageMutation.mutate(heroImageUrl);
    }
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
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
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
              />
            </div>
            <div>
              <Label>Hero Image Source</Label>
              <RadioGroup
                value={imageSourceType}
                onValueChange={(value: 'url' | 'upload') => setImageSourceType(value)}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="url" id="hero-image-source-url" />
                  <Label htmlFor="hero-image-source-url" className="flex items-center gap-1">
                    <Link className="h-4 w-4" /> URL
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upload" id="hero-image-source-upload" />
                  <Label htmlFor="hero-image-source-upload" className="flex items-center gap-1">
                    <UploadCloud className="h-4 w-4" /> Upload
                  </Label>
                </div>
              </RadioGroup>

              {imageSourceType === 'url' ? (
                <div className="mt-4">
                  <Label htmlFor="heroImageUrl">Hero Image URL</Label>
                  <Input
                    id="heroImageUrl"
                    type="url"
                    value={heroImageUrl}
                    onChange={(e) => setHeroImageUrl(e.target.value)}
                    className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <Label htmlFor="heroImageFile">Upload Hero Image</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Input
                      id="heroImageFile"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-grow bg-input/50 border-border/50 focus:border-primary"
                      ref={fileInputRef}
                    />
                    <Button
                      type="button"
                      onClick={handleUploadClick}
                      disabled={uploadFileMutation.isPending || !selectedFile}
                    >
                      <UploadCloud className="mr-2 h-4 w-4" />
                      {uploadFileMutation.isPending ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                </div>
              )}

              {heroImageUrl && (
                <div className="mt-4 flex flex-col items-start gap-2">
                  <Label>Current Hero Image Preview</Label>
                  <img src={heroImageUrl} alt="Hero preview" className="rounded-full w-48 h-48 object-cover border border-border/50" />
                  <div className="flex gap-2 mt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsImageEditorOpen(true)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Image
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => deleteImageMutation.mutate(heroImageUrl)} disabled={deleteImageMutation.isPending}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Image
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Button type="submit" disabled={updateProfileMutation.isPending}>
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {heroImageUrl && (
        <ImageEditorDialog
          isOpen={isImageEditorOpen}
          onClose={() => setIsImageEditorOpen(false)}
          imageUrl={heroImageUrl}
          onSave={handleImageEditorSave}
          onDelete={handleImageEditorDelete}
          isSaving={uploadFileMutation.isPending || deleteImageMutation.isPending}
        />
      )}
    </div>
  );
};

export default HeroManagement;