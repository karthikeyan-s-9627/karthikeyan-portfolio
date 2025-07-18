"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UploadCloud, FileText, Trash2 } from "lucide-react";

interface Resume {
  id: string;
  title: string;
  file_path: string;
  updated_at: string;
}

const RESUME_SINGLETON_ID = "00000000-0000-0000-0000-000000000003"; // Matches the default ID in SQL

const DEFAULT_RESUME = {
  title: "My Resume",
  file_path: "",
};

const ResumeManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [resumeTitle, setResumeTitle] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data: resume, isLoading, error } = useQuery<Resume, Error>({
    queryKey: ["resume"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resumes")
        .select("*")
        .eq("id", RESUME_SINGLETON_ID)
        .single();
      if (error) {
        if (error.code === 'PGRST116') { // No rows found
          return {
            id: RESUME_SINGLETON_ID,
            ...DEFAULT_RESUME,
            updated_at: new Date().toISOString(),
          };
        }
        throw error;
      }
      return data;
    },
  });

  React.useEffect(() => {
    if (resume) {
      setResumeTitle(resume.title ?? DEFAULT_RESUME.title);
    }
  }, [resume]);

  const upsertResumeMutation = useMutation<null, Error, Partial<Resume>, unknown>({
    mutationFn: async (resumeData) => {
      const dataToUpsert = {
        id: RESUME_SINGLETON_ID,
        title: resume?.title ?? DEFAULT_RESUME.title,
        file_path: resume?.file_path ?? DEFAULT_RESUME.file_path,
        ...resumeData,
      };
      const { error } = await supabase
        .from("resumes")
        .upsert(dataToUpsert)
        .eq("id", RESUME_SINGLETON_ID);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume"] });
      showSuccess("Resume details updated successfully!");
    },
    onError: (err) => {
      showError(`Error updating resume details: ${err.message}`);
    },
  });

  const uploadFileMutation = useMutation<string, Error, File, unknown>({
    mutationFn: async (file) => {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${RESUME_SINGLETON_ID}.${fileExtension}`;
      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, file, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("resumes")
        .getPublicUrl(fileName);

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for the uploaded file.");
      }

      await upsertResumeMutation.mutateAsync({ file_path: publicUrlData.publicUrl });

      return publicUrlData.publicUrl;
    },
    onSuccess: () => {
      showSuccess("Resume file uploaded successfully!");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (err) => {
      showError(`Error uploading file: ${err.message}`);
    },
  });

  const deleteFileMutation = useMutation<null, Error, string, unknown>({
    mutationFn: async (filePath) => {
      const fileName = filePath.split('/').pop();
      if (!fileName) throw new Error("Invalid file path.");

      const { error: deleteError } = await supabase.storage
        .from("resumes")
        .remove([fileName]);

      if (deleteError) throw deleteError;

      await upsertResumeMutation.mutateAsync({ file_path: "" });
      return null;
    },
    onSuccess: () => {
      showSuccess("Resume file deleted successfully!");
    },
    onError: (err) => {
      showError(`Error deleting file: ${err.message}`);
    },
  });

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertResumeMutation.mutate({ title: resumeTitle });
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

  const handleDeleteClick = () => {
    if (resume?.file_path) {
      deleteFileMutation.mutate(resume.file_path);
    } else {
      showError("No resume file to delete.");
    }
  };

  if (isLoading) return <div className="text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading resume content...</div>;
  if (error && error.code !== 'PGRST116') return <div className="text-center text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Manage Resume/CV</h2>
      <Card className="bg-card shadow-lg border border-border/50">
        <CardHeader>
          <CardTitle>Resume Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTitleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="resumeTitle">Resume Title</Label>
              <Input
                id="resumeTitle"
                value={resumeTitle}
                onChange={(e) => setResumeTitle(e.target.value)}
                className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                required
              />
            </div>
            <Button type="submit" disabled={upsertResumeMutation.isPending}>
              {upsertResumeMutation.isPending ? "Saving..." : "Save Title"}
            </Button>
          </form>

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Upload/Update Resume File</h3>
            <div className="flex items-center gap-4">
              <Input
                id="resumeFile"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="flex-grow bg-input/50 border-border/50 focus:border-primary"
                ref={fileInputRef}
              />
              <Button
                onClick={handleUploadClick}
                disabled={uploadFileMutation.isPending || !selectedFile}
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                {uploadFileMutation.isPending ? "Uploading..." : "Upload File"}
              </Button>
            </div>

            {resume?.file_path ? (
              <div className="flex items-center justify-between p-4 border border-border/50 rounded-md bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="text-foreground font-medium">
                    Current Resume: <a href={resume.file_path} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      {resume.title || "View Resume"}
                    </a>
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteClick}
                  disabled={deleteFileMutation.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleteFileMutation.isPending ? "Deleting..." : "Delete File"}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">No resume file currently uploaded.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeManagement;