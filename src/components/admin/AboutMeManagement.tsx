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
import { Loader2, UploadCloud, Image, Link, Trash2, Edit } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ImageEditorDialog from "@/components/ImageEditorDialog";

interface AboutMeContent {
  id: string;
  content: string;
  image_url?: string;
  updated_at: string;
}

const ABOUT_ME_SINGLETON_ID = "00000000-0000-0000-0000-000000000001";

const DEFAULT_ABOUT_ME_CONTENT = {
  content: "Hello! I'm John Doe, a dedicated and enthusiastic college student with a passion for software development and problem-solving. Currently pursuing a Bachelor's degree in Computer Science, I am constantly seeking opportunities to learn and grow in the ever-evolving tech landscape.\n\nMy academic journey has equipped me with a strong foundation in data structures, algorithms, and various programming paradigms. I thrive on challenges and enjoy transforming complex ideas into functional and elegant solutions.\n\nOutside of my studies, I actively participate in coding competitions, open-source projects, and tech meetups to expand my knowledge and collaborate with fellow enthusiasts. I believe in continuous learning and am always eager to explore new technologies and methodologies.",
  image_url: "https://via.placeholder.com/400x400/0000FF/FFFFFF?text=About+Image",
};

const AboutMeManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [content, setContent] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageSourceType, setImageSourceType] = React.useState<'url' | 'upload'>('url');
  const [isImageEditorOpen, setIsImageEditorOpen] = React.useState(false);

  const { data, isLoading, error } = useQuery<AboutMeContent, Error>({
    queryKey: ["about_me"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("about_me")
        .select("*")
        .eq("id", ABOUT_ME_SINGLETON_ID)
        .single();
      if (error) {
        if (error.code === 'PGRST116') {
          return {
            id: ABOUT_ME_SINGLETON_ID,
            ...DEFAULT_ABOUT_ME_CONTENT,
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
      setContent(data.content ?? DEFAULT_ABOUT_ME_CONTENT.content);
      setImageUrl(data.image_url ?? DEFAULT_ABOUT_ME_CONTENT.image_url);
      setImageSourceType(data.image_url ? 'url' : 'upload');
    }
  }, [data]);

  const upsertAboutMeMutation = useMutation<null, Error, Partial<Omit<AboutMeContent, "updated_at">>, unknown>({
    mutationFn: async (aboutMeData) => {
      const { error } = await supabase
        .from("about_me")
        .upsert({ id: ABOUT_ME_SINGLETON_ID, ...aboutMeData })
        .eq("id", ABOUT_ME_SINGLETON_ID);
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

  const uploadFileMutation = useMutation<string, Error, File, unknown>({
    mutationFn: async (file) => {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${ABOUT_ME_SINGLETON_ID}-about.${fileExtension}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for the uploaded file.");
      }
      
      setImageUrl(publicUrlData.publicUrl);
      await upsertAboutMeMutation.mutateAsync({ image_url: publicUrlData.publicUrl, content: content });

      return publicUrlData.publicUrl;
    },
    onSuccess: () => {
      showSuccess("Image uploaded successfully!");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsImageEditorOpen(false);
    },
    onError: (err) => {
      showError(`Error uploading file: ${err.message}`);
    },
  });

  const deleteImageMutation = useMutation<null, Error, string, unknown>({
    mutationFn: async (filePath) => {
      if (filePath.includes(supabase.storage.from("images").getPublicUrl("").data.publicUrl)) {
        const fileName = filePath.split('/').pop();
        if (fileName) {
          const { error: deleteError } = await supabase.storage
            .from("images")
            .remove([fileName]);
          if (deleteError) throw deleteError;
        }
      }
      // Pass current content along with null image_url to avoid not-null constraint violation
      await upsertAboutMeMutation.mutateAsync({ image_url: null, content: content });
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["about_me"] });
      showSuccess("Image deleted successfully!");
      setImageUrl("");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsImageEditorOpen(false);
    },
    onError: (err) => {
      showError(`Error deleting image: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertAboutMeMutation.mutate({ content, image_url: imageUrl });
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
    const croppedFile = new File([croppedBlob], `${ABOUT_ME_SINGLETON_ID}-about-cropped.jpeg`, { type: "image/jpeg" });
    uploadFileMutation.mutate(croppedFile);
  };

  const handleImageEditorDelete = () => {
    if (imageUrl) {
      deleteImageMutation.mutate(imageUrl);
    }
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
              />
            </div>
            <div>
              <Label>Image Source</Label>
              <RadioGroup
                value={imageSourceType}
                onValueChange={(value: 'url' | 'upload') => setImageSourceType(value)}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="url" id="image-source-url" />
                  <Label htmlFor="image-source-url" className="flex items-center gap-1">
                    <Link className="h-4 w-4" /> URL
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upload" id="image-source-upload" />
                  <Label htmlFor="image-source-upload" className="flex items-center gap-1">
                    <UploadCloud className="h-4 w-4" /> Upload
                  </Label>
                </div>
              </RadioGroup>

              {imageUrl && (
                <div className="mt-4 flex flex-col items-start gap-2">
                  <Label>Current Image Preview</Label>
                  <img src={imageUrl} alt="About me preview" className="rounded-md w-48 h-48 object-cover border border-border/50" />
                  <div className="flex gap-2 mt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsImageEditorOpen(true)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Image
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => deleteImageMutation.mutate(imageUrl)} disabled={deleteImageMutation.isPending}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Image
                    </Button>
                  </div>
                </div>
              )}
              {imageSourceType === 'url' ? (
                <div className="mt-4">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                  />
                </div>
              ) : (
                <div className="mt-4">
                  <Label htmlFor="imageFile">Upload Image</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <Input
                      id="imageFile"
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
            </div>
            <Button type="submit" disabled={upsertAboutMeMutation.isPending}>
              {upsertAboutMeMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {imageUrl && (
        <ImageEditorDialog
          isOpen={isImageEditorOpen}
          onClose={() => setIsImageEditorOpen(false)}
          imageUrl={imageUrl}
          onSave={handleImageEditorSave}
          onDelete={handleImageEditorDelete}
          isSaving={uploadFileMutation.isPending || deleteImageMutation.isPending}
        />
      )}
    </div>
  );
};

export default AboutMeManagement;