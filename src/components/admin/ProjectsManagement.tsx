"use client";

import React, { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusCircle, Trash2, Edit, GripVertical, UploadCloud, Link, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ImageEditorDialog from "@/components/ImageEditorDialog";
import { createClient } from '@supabase/supabase-js';

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github_link?: string;
  live_link?: string;
  image?: string;
  image_width?: string; // Added
  image_height?: string; // Added
  position: number | null;
}

const SortableProjectRow: React.FC<{ project: Project; onEdit: (proj: Project) => void; onDelete: (id: string) => void; }> = ({ project, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-12">
        <Button variant="ghost" size="icon" {...attributes} {...listeners} className="cursor-grab">
          <GripVertical className="h-4 w-4" />
        </Button>
      </TableCell>
      <TableCell className="font-medium">{project.title}</TableCell>
      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{project.description}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {project.technologies?.map((tech, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">{tech}</Badge>
          ))}
        </div>
      </TableCell>
      <TableCell className="text-right flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(project)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(project.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const ProjectsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [displayProjects, setDisplayProjects] = React.useState<Project[]>([]);
  const [newProject, setNewProject] = React.useState<Omit<Project, "position">>({
    id: "", title: "", description: "", technologies: [], github_link: "", live_link: "", image: "", image_width: "", image_height: "", // Added
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [techInput, setTechInput] = React.useState("");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageSourceType, setImageSourceType] = React.useState<'url' | 'upload' | 'local'>('url'); // Added 'local'
  const [localImageFileName, setLocalImageFileName] = React.useState(""); // For local path input
  const [isImageEditorOpen, setIsImageEditorOpen] = React.useState(false);

  const { data: projects, isLoading, error } = useQuery<Project[], Error>({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await supabase.from("projects").select("*, image_width, image_height").order("position", { ascending: true, nullsFirst: false }); // Added image_width, image_height
      if (error) throw error;
      return data;
    },
  });

  const updateOrderMutation = useMutation<null, Error, { id: string; position: number }[], unknown>({
    mutationFn: async (updates) => {
      const { error } = await supabase.rpc('update_project_positions', { updates });
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showSuccess("Project order updated!");
    },
    onError: (err) => {
      showError(`Error updating order: ${err.message}`);
    },
  });

  React.useEffect(() => {
    if (projects) {
      const itemsWithNullPosition = projects.filter(p => p.position === null);
      if (itemsWithNullPosition.length > 0) {
        const updates = projects.map((proj, index) => ({
          id: proj.id,
          position: proj.position ?? index,
        }));
        updateOrderMutation.mutate(updates);
      }
      setDisplayProjects(projects);
    }
  }, [projects]);

  React.useEffect(() => {
    if (!isDialogOpen) {
      setEditingProject(null);
      setNewProject({ id: "", title: "", description: "", technologies: [], github_link: "", live_link: "", image: "", image_width: "", image_height: "" }); // Reset image dimensions
      setTechInput("");
      setSelectedFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      setImageSourceType('url');
      setLocalImageFileName(""); // Clear local filename
    }
  }, [isDialogOpen]);

  // Effect to update newProject.image when localImageFileName changes
  React.useEffect(() => {
    if (imageSourceType === 'local') {
      setNewProject(prev => ({ ...prev, image: localImageFileName ? `/images/${localImageFileName}` : "" }));
    }
  }, [localImageFileName, imageSourceType]);

  const addProjectMutation = useMutation({
    mutationFn: async (project: Omit<Project, "position">) => {
      const { data, error } = await supabase.from("projects").insert(project).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showSuccess("Project added successfully!");
      setIsDialogOpen(false);
    },
    onError: (err: Error) => {
      showError(`Error adding project: ${err.message}`);
    },
  });

  const updateProjectMutation = useMutation<null, Error, Omit<Project, 'position'>, unknown>({
    mutationFn: async (project) => {
      const { error } = await supabase.from("projects").update({
        title: project.title, description: project.description, technologies: project.technologies, github_link: project.github_link, live_link: project.live_link, image: project.image, image_width: project.image_width, image_height: project.image_height, // Added
      }).eq("id", project.id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showSuccess("Project updated successfully!");
      setIsDialogOpen(false);
    },
    onError: (err) => {
      showError(`Error updating project: ${err.message}`);
    },
  });

  const deleteProjectMutation = useMutation<null, Error, string, unknown>({
    mutationFn: async (id) => {
      const projectToDelete = displayProjects.find(p => p.id === id);
      if (projectToDelete?.image && projectToDelete.image.startsWith('http') && projectToDelete.image.includes(supabase.storage.from("images").getPublicUrl("").data.publicUrl)) {
        const fileName = projectToDelete.image.split('/').pop();
        if (fileName) {
          const { error: deleteError } = await supabase.storage
            .from("images")
            .remove([fileName]);
          if (deleteError) throw deleteError;
        }
      }
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showSuccess("Project deleted successfully!");
      setIsImageEditorOpen(false);
    },
    onError: (err) => {
      showError(`Error deleting project: ${err.message}`);
    },
  });

  const deleteProjectImageMutation = useMutation<null, Error, string, unknown>({
    mutationFn: async (projectId) => {
      const projectToUpdate = displayProjects.find(p => p.id === projectId);
      if (!projectToUpdate) throw new Error("Project not found.");

      // If it's a Supabase Storage URL, delete from storage
      if (projectToUpdate.image && projectToUpdate.image.startsWith('http') && projectToUpdate.image.includes(supabase.storage.from("images").getPublicUrl("").data.publicUrl)) {
        const fileName = projectToUpdate.image.split('/').pop();
        if (fileName) {
          const { error: deleteError } = await supabase.storage
            .from("images")
            .remove([fileName]);
          if (deleteError) throw deleteError;
        }
      }
      // Update the project record to set image to null regardless of source
      const { error: updateError } = await supabase.from("projects").update({ 
        image: null, 
        title: projectToUpdate.title, 
        description: projectToUpdate.description, 
        technologies: projectToUpdate.technologies, 
        github_link: projectToUpdate.github_link, 
        live_link: projectToUpdate.live_link,
        image_width: projectToUpdate.image_width, // Preserve existing dimensions
        image_height: projectToUpdate.image_height, // Preserve existing dimensions
      }).eq("id", projectId);
      if (updateError) throw updateError;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      showSuccess("Project image deleted successfully!");
      setNewProject(prev => ({ ...prev, image: "" })); // Clear image in form state
      setLocalImageFileName(""); // Clear local filename
      setIsImageEditorOpen(false);
    },
    onError: (err) => {
      showError(`Error deleting project image: ${err.message}`);
    },
  });

  const uploadFileMutation = useMutation<string, Error, { file: File; projectId: string }, unknown>({
    mutationFn: async ({ file, projectId }) => {
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
      const fileName = `${projectId}-project.${fileExtension}`;
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
      
      setNewProject(prev => ({ ...prev, image: publicUrlData.publicUrl }));
      return publicUrlData.publicUrl;
    },
    onSuccess: () => {
      showSuccess("Image uploaded successfully!");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsImageEditorOpen(false);
    },
    onError: (err) => {
      showError(`Error uploading file: ${err.message}`);
    },
  });

  const handleAddTechnology = () => {
    if (techInput.trim() && !newProject.technologies.includes(techInput.trim())) {
      setNewProject({ ...newProject, technologies: [...newProject.technologies, techInput.trim()] });
      setTechInput("");
    }
  };

  const handleRemoveTechnology = (techToRemove: string) => {
    setNewProject({ ...newProject, technologies: newProject.technologies.filter((tech) => tech !== techToRemove) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      updateProjectMutation.mutate({ ...editingProject, ...newProject });
    } else {
      const maxPosition = displayProjects.length > 0 ? Math.max(...displayProjects.map(p => p.position || 0)) : -1;
      const newPosition = maxPosition + 1;
      addProjectMutation.mutate({ ...newProject, position: newPosition });
    }
  };

  const handleEditClick = (project: Project) => {
    setEditingProject(project);
    setNewProject({
      id: project.id, 
      title: project.title, 
      description: project.description, 
      technologies: project.technologies || [], 
      github_link: project.github_link || "", 
      live_link: project.live_link || "", 
      image: project.image || "",
      image_width: project.image_width || "", // Added
      image_height: project.image_height || "", // Added
    });
    // Determine image source type based on fetched URL
    if (project.image?.startsWith('/images/')) {
      setImageSourceType('local');
      setLocalImageFileName(project.image.replace('/images/', ''));
    } else if (project.image?.startsWith('http')) {
      setImageSourceType('url');
    } else {
      setImageSourceType('upload');
    }
    setIsDialogOpen(true);
  };

  const handleOpenNewDialog = () => {
    setEditingProject(null);
    setNewProject({
      id: crypto.randomUUID(), title: "", description: "", technologies: [], github_link: "", live_link: "", image: "", image_width: "", image_height: "", // Reset image dimensions
    });
    setImageSourceType('upload'); // Default to upload for new projects
    setLocalImageFileName("");
    setIsDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile && newProject.id) {
      uploadFileMutation.mutate({ file: selectedFile, projectId: newProject.id });
    } else {
      showError("Please select a file to upload.");
    }
  };

  const handleImageEditorSave = (croppedBlob: Blob) => {
    // Only allow editing if it's not a local image
    if (imageSourceType === 'local') {
      showError("Local assets cannot be edited directly. Please upload to Supabase to enable editing.");
      return;
    }
    if (newProject.id) {
      const croppedFile = new File([croppedBlob], `${newProject.id}-project-cropped.jpeg`, { type: "image/jpeg" });
      uploadFileMutation.mutate({ file: croppedFile, projectId: newProject.id });
    } else {
      showError("Project ID is missing for image upload.");
    }
  };

  const handleImageEditorDelete = () => {
    if (newProject.id) {
      deleteProjectImageMutation.mutate(newProject.id);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = displayProjects.findIndex((item) => item.id === active.id);
      const newIndex = displayProjects.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(displayProjects, oldIndex, newIndex);
      setDisplayProjects(newOrder);

      const updates = newOrder.map((item, index) => ({
        id: item.id,
        position: index,
      }));
      updateOrderMutation.mutate(updates);
    }
  };

  if (isLoading) return <div className="text-center text-muted-foreground">Loading projects...</div>;
  if (error) return <div className="text-center text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Manage Projects</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={handleOpenNewDialog}><PlusCircle className="mr-2 h-4 w-4" /> Add New Project</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border/50">
            <DialogHeader><DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="title" className="text-right">Title</Label><Input id="title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className="col-span-3 bg-input/50 border-border/50 focus:border-primary" /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description" className="text-right">Description</Label><Textarea id="description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="col-span-3 bg-input/50 border-border/50 focus:border-primary" /></div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="technologies" className="text-right">Technologies</Label>
                <div className="col-span-3 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Input id="technologies" value={techInput} onChange={(e) => setTechInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTechnology(); } }} placeholder="Add technology (e.g., React)" className="flex-grow bg-input/50 border-border/50 focus:border-primary" />
                    <Button type="button" onClick={handleAddTechnology} variant="outline">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">{newProject.technologies.map((tech, index) => (<Badge key={index} variant="secondary" className="flex items-center gap-1">{tech}<Button type="button" variant="ghost" size="sm" className="h-auto p-0.5" onClick={() => handleRemoveTechnology(tech)}>&times;</Button></Badge>))}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="github_link" className="text-right">GitHub Link</Label><Input id="github_link" value={newProject.github_link} onChange={(e) => setNewProject({ ...newProject, github_link: e.target.value })} className="col-span-3 bg-input/50 border-border/50 focus:border-primary" /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="live_link" className="text-right">Live Link</Label><Input id="live_link" value={newProject.live_link} onChange={(e) => setNewProject({ ...newProject, live_link: e.target.value })} className="col-span-3 bg-input/50 border-border/50 focus:border-primary" /></div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Image Source</Label>
                <div className="col-span-3">
                  <RadioGroup
                    value={imageSourceType}
                    onValueChange={(value: 'url' | 'upload' | 'local') => {
                      setImageSourceType(value);
                      // Clear other inputs when changing source type
                      if (value === 'url') {
                        setLocalImageFileName("");
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      } else if (value === 'upload') {
                        setLocalImageFileName("");
                        if (!newProject.image?.startsWith('http')) setNewProject(prev => ({ ...prev, image: "" }));
                      } else if (value === 'local') {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                        if (!newProject.image?.startsWith('/images/')) setNewProject(prev => ({ ...prev, image: "" }));
                      }
                    }}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="url" id="project-image-source-url" />
                      <Label htmlFor="project-image-source-url" className="flex items-center gap-1">
                        <Link className="h-4 w-4" /> External URL
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upload" id="project-image-source-upload" />
                      <Label htmlFor="project-image-source-upload" className="flex items-center gap-1">
                        <UploadCloud className="h-4 w-4" /> Upload to Supabase
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="local" id="project-image-source-local" />
                      <Label htmlFor="project-image-source-local" className="flex items-center gap-1">
                        <Image className="h-4 w-4" /> Local Asset
                      </Label>
                    </div>
                  </RadioGroup>

                  {newProject.image && (
                    <div className="mt-4 flex flex-col items-start gap-2">
                      <Label>Current Image Preview</Label>
                      <img src={newProject.image} alt="Project preview" className="rounded-md w-32 h-32 object-cover border border-border/50" />
                      <div className="flex gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsImageEditorOpen(true)}
                          disabled={imageSourceType === 'local'} // Disable edit for local assets
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit Image
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleImageEditorDelete}
                          disabled={deleteProjectImageMutation.isPending}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Image
                        </Button>
                      </div>
                    </div>
                  )}
                  {imageSourceType === 'url' && (
                    <div className="mt-4">
                      <Label htmlFor="projectImageUrl">Image URL</Label>
                      <Input
                        id="projectImageUrl"
                        type="url"
                        value={newProject.image}
                        onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
                        className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                      />
                    </div>
                  )}
                  {imageSourceType === 'upload' && (
                    <div className="mt-4">
                      <Label htmlFor="projectImageFile">Upload Image</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <Input
                          id="projectImageFile"
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
                  {imageSourceType === 'local' && (
                    <div className="mt-4">
                      <Label htmlFor="localImageFileName">Local Asset Path</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-muted-foreground">/images/</span>
                        <Input
                          id="localImageFileName"
                          value={localImageFileName}
                          onChange={(e) => setLocalImageFileName(e.target.value)}
                          placeholder="my-project-image.jpg"
                          className="flex-grow bg-input/50 border-border/50 focus:border-primary"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Place your image file in the `public/images/` folder of your project.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {newProject.image && ( // Only show size inputs if an image is present
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Image Size</Label>
                  <div className="col-span-3 grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="imageWidth">Width</Label>
                      <Input
                        id="imageWidth"
                        value={newProject.image_width}
                        onChange={(e) => setNewProject({ ...newProject, image_width: e.target.value })}
                        className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                        placeholder="e.g., 300px"
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageHeight">Height</Label>
                      <Input
                        id="imageHeight"
                        value={newProject.image_height}
                        onChange={(e) => setNewProject({ ...newProject, image_height: e.target.value })}
                        className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                        placeholder="e.g., 200px"
                      />
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter><Button type="submit" disabled={addProjectMutation.isPending || updateProjectMutation.isPending}>{editingProject ? (updateProjectMutation.isPending ? "Saving..." : "Save Changes") : (addProjectMutation.isPending ? "Adding..." : "Add Project")}</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border border-border/50 shadow-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-[150px]">Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[200px]">Technologies</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayProjects.map(p => p.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {displayProjects.map((project) => (
                  <SortableProjectRow key={project.id} project={project} onEdit={handleEditClick} onDelete={deleteProjectMutation.mutate} />
                ))}
              </TableBody>
            </SortableContext>
          </DndContext>
        </Table>
      </div>

      {newProject.image && (
        <ImageEditorDialog
          isOpen={isImageEditorOpen}
          onClose={() => setIsImageEditorOpen(false)}
          imageUrl={newProject.image}
          onSave={handleImageEditorSave}
          onDelete={handleImageEditorDelete}
          isSaving={uploadFileMutation.isPending || deleteProjectImageMutation.isPending}
        />
      )}
    </div>
  );
};

export default ProjectsManagement;