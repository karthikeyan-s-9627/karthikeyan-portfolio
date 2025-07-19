"use client";

import React from "react";
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
import { PlusCircle, Trash2, Edit, GripVertical, UploadCloud, Link } from "lucide-react";
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

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  link?: string;
  image?: string;
  position: number | null;
}

const SortableCertificateRow: React.FC<{ certificate: Certificate; onEdit: (cert: Certificate) => void; onDelete: (id: string) => void; }> = ({ certificate, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: certificate.id });

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
      <TableCell className="font-medium">{certificate.title}</TableCell>
      <TableCell>{certificate.issuer}</TableCell>
      <TableCell>{certificate.date}</TableCell>
      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{certificate.description}</TableCell>
      <TableCell className="text-right flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(certificate)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(certificate.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const CertificatesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [displayCertificates, setDisplayCertificates] = React.useState<Certificate[]>([]);
  const [newCertificate, setNewCertificate] = React.useState<Omit<Certificate, "position">>({
    id: "", title: "", issuer: "", date: "", description: "", link: "", image: "",
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCertificate, setEditingCertificate] = React.useState<Certificate | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageSourceType, setImageSourceType] = React.useState<'url' | 'upload'>('url');
  const [isImageEditorOpen, setIsImageEditorOpen] = React.useState(false);

  const { data: certificates, isLoading, error } = useQuery<Certificate[], Error>({
    queryKey: ["certificates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("certificates").select("*").order("position", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const updateOrderMutation = useMutation<null, Error, { id: string; position: number }[], unknown>({
    mutationFn: async (updates) => {
      const { error } = await supabase.rpc('update_certificate_positions', { updates });
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      showSuccess("Certificate order updated!");
    },
    onError: (err) => {
      showError(`Error updating order: ${err.message}`);
    },
  });

  React.useEffect(() => {
    if (certificates) {
      const itemsWithNullPosition = certificates.filter(c => c.position === null);
      if (itemsWithNullPosition.length > 0) {
        const updates = certificates.map((cert, index) => ({
          id: cert.id,
          position: cert.position ?? index,
        }));
        updateOrderMutation.mutate(updates);
      }
      setDisplayCertificates(certificates);
    }
  }, [certificates]);

  React.useEffect(() => {
    if (!isDialogOpen) {
      setEditingCertificate(null);
      setNewCertificate({ id: "", title: "", issuer: "", date: "", description: "", link: "", image: "" });
      setSelectedFile(null);
      if(fileInputRef.current) fileInputRef.current.value = "";
      setImageSourceType('url');
    }
  }, [isDialogOpen]);

  const addCertificateMutation = useMutation({
    mutationFn: async (certificate: Omit<Certificate, "id">) => {
      const { data, error } = await supabase.from("certificates").insert(certificate).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      showSuccess("Certificate added successfully!");
      setIsDialogOpen(false);
    },
    onError: (err: Error) => {
      showError(`Error adding certificate: ${err.message}`);
    },
  });

  const updateCertificateMutation = useMutation<null, Error, Omit<Certificate, 'position'>, unknown>({
    mutationFn: async (certificate) => {
      const { error } = await supabase.from("certificates").update({
        title: certificate.title, issuer: certificate.issuer, date: certificate.date, description: certificate.description, link: certificate.link, image: certificate.image,
      }).eq("id", certificate.id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      showSuccess("Certificate updated successfully!");
      setIsDialogOpen(false);
    },
    onError: (err) => {
      showError(`Error updating certificate: ${err.message}`);
    },
  });

  const deleteCertificateMutation = useMutation<null, Error, string, unknown>({
    mutationFn: async (id) => {
      const certificateToDelete = displayCertificates.find(c => c.id === id);
      if (certificateToDelete?.image && certificateToDelete.image.includes(supabase.storage.from("images").getPublicUrl("").data.publicUrl)) {
        const fileName = certificateToDelete.image.split('/').pop();
        if (fileName) {
          const { error: deleteError } = await supabase.storage
            .from("images")
            .remove([fileName]);
          if (deleteError) throw deleteError;
        }
      }
      const { error } = await supabase.from("certificates").delete().eq("id", id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      showSuccess("Certificate deleted successfully!");
      setIsImageEditorOpen(false);
    },
    onError: (err) => {
      showError(`Error deleting certificate: ${err.message}`);
    },
  });

  const deleteCertificateImageMutation = useMutation<null, Error, string, unknown>({
    mutationFn: async (certificateId) => {
      const certificateToUpdate = displayCertificates.find(c => c.id === certificateId);
      if (!certificateToUpdate) throw new Error("Certificate not found.");

      if (certificateToUpdate.image && certificateToUpdate.image.includes(supabase.storage.from("images").getPublicUrl("").data.publicUrl)) {
        const fileName = certificateToUpdate.image.split('/').pop();
        if (fileName) {
          const { error: deleteError } = await supabase.storage
            .from("images")
            .remove([fileName]);
          if (deleteError) throw deleteError;
        }
      }
      // Update the certificate record to set image to null
      const { error: updateError } = await supabase.from("certificates").update({ image: null }).eq("id", certificateId);
      if (updateError) throw updateError;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      showSuccess("Certificate image deleted successfully!");
      setNewCertificate(prev => ({ ...prev, image: "" })); // Clear image in form state
      setIsImageEditorOpen(false);
    },
    onError: (err) => {
      showError(`Error deleting certificate image: ${err.message}`);
    },
  });

  const uploadFileMutation = useMutation<string, Error, { file: File; certificateId: string }, unknown>({
    mutationFn: async ({ file, certificateId }) => {
      const fileExtension = file.name.split('.').pop();
      const fileName = `${certificateId}-certificate.${fileExtension}`;
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
      
      setNewCertificate(prev => ({ ...prev, image: publicUrlData.publicUrl }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCertificate) {
      updateCertificateMutation.mutate({ ...editingCertificate, ...newCertificate });
    } else {
      const maxPosition = displayCertificates.length > 0 ? Math.max(...displayCertificates.map(c => c.position || 0)) : -1;
      const newPosition = maxPosition + 1;
      addCertificateMutation.mutate({ ...newCertificate, position: newPosition });
    }
  };

  const handleEditClick = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setNewCertificate({
      id: certificate.id, title: certificate.title, issuer: certificate.issuer, date: certificate.date, description: certificate.description, link: certificate.link || "", image: certificate.image || "",
    });
    setImageSourceType(certificate.image ? 'url' : 'upload');
    setIsDialogOpen(true);
  };

  const handleOpenNewDialog = () => {
    setEditingCertificate(null);
    setNewCertificate({
      id: crypto.randomUUID(), title: "", issuer: "", date: "", description: "", link: "", image: "",
    });
    setImageSourceType('upload');
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
    if (selectedFile && newCertificate.id) {
      uploadFileMutation.mutate({ file: selectedFile, certificateId: newCertificate.id });
    } else {
      showError("Please select a file to upload.");
    }
  };

  const handleImageEditorSave = (croppedBlob: Blob) => {
    if (newCertificate.id) {
      const croppedFile = new File([croppedBlob], `${newCertificate.id}-certificate-cropped.jpeg`, { type: "image/jpeg" });
      uploadFileMutation.mutate({ file: croppedFile, certificateId: newCertificate.id });
    } else {
      showError("Certificate ID is missing for image upload.");
    }
  };

  const handleImageEditorDelete = () => {
    if (newCertificate.id) {
      deleteCertificateImageMutation.mutate(newCertificate.id);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = displayCertificates.findIndex((item) => item.id === active.id);
      const newIndex = displayCertificates.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(displayCertificates, oldIndex, newIndex);
      setDisplayCertificates(newOrder);

      const updates = newOrder.map((item, index) => ({
        id: item.id,
        position: index,
      }));
      updateOrderMutation.mutate(updates);
    }
  };

  if (isLoading) return <div className="text-center text-muted-foreground">Loading certificates...</div>;
  if (error) return <div className="text-center text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Manage Certificates</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button onClick={handleOpenNewDialog}><PlusCircle className="mr-2 h-4 w-4" /> Add New Certificate</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border/50">
            <DialogHeader><DialogTitle>{editingCertificate ? "Edit Certificate" : "Add New Certificate"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="title" className="text-right">Title</Label><Input id="title" value={newCertificate.title} onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })} className="col-span-3 bg-input/50 border-border/50 focus:border-primary" /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="issuer" className="text-right">Issuer</Label><Input id="issuer" value={newCertificate.issuer} onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })} className="col-span-3 bg-input/50 border-border/50 focus:border-primary" /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="date" className="text-right">Date</Label><Input id="date" value={newCertificate.date} onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })} className="col-span-3 bg-input/50 border-border/50 focus:border-primary" /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="description" className="text-right">Description</Label><Textarea id="description" value={newCertificate.description} onChange={(e) => setNewCertificate({ ...newCertificate, description: e.target.value })} className="col-span-3 bg-input/50 border-border/50 focus:border-primary" /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="link" className="text-right">Link</Label><Input id="link" value={newCertificate.link} onChange={(e) => setNewCertificate({ ...newCertificate, link: e.target.value })} className="col-span-3 bg-input/50 border-border/50 focus:border-primary" /></div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Image Source</Label>
                <div className="col-span-3">
                  <RadioGroup
                    value={imageSourceType}
                    onValueChange={(value: 'url' | 'upload') => setImageSourceType(value)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="url" id="cert-image-source-url" />
                      <Label htmlFor="cert-image-source-url" className="flex items-center gap-1">
                        <Link className="h-4 w-4" /> URL
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upload" id="cert-image-source-upload" />
                      <Label htmlFor="cert-image-source-upload" className="flex items-center gap-1">
                        <UploadCloud className="h-4 w-4" /> Upload
                      </Label>
                    </div>
                  </RadioGroup>

                  {newCertificate.image && (
                    <div className="mt-4 flex flex-col items-start gap-2">
                      <Label>Current Image Preview</Label>
                      <img src={newCertificate.image} alt="Certificate preview" className="rounded-md w-32 h-32 object-cover border border-border/50" />
                      <div className="flex gap-2 mt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setIsImageEditorOpen(true)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit Image
                        </Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => deleteCertificateImageMutation.mutate(newCertificate.id)} disabled={deleteCertificateImageMutation.isPending}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Image
                        </Button>
                      </div>
                    </div>
                  )}
                  {imageSourceType === 'url' ? (
                    <div className="mt-4">
                      <Label htmlFor="certImageUrl">Image URL</Label>
                      <Input
                        id="certImageUrl"
                        type="url"
                        value={newCertificate.image}
                        onChange={(e) => setNewCertificate({ ...newCertificate, image: e.target.value })}
                        className="mt-1 bg-input/50 border-border/50 focus:border-primary"
                      />
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Label htmlFor="certImageFile">Upload Image</Label>
                      <div className="mt-2 flex items-center gap-4">
                        <Input
                          id="certImageFile"
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
              </div>

              <DialogFooter><Button type="submit" disabled={addCertificateMutation.isPending || updateCertificateMutation.isPending}>{editingCertificate ? (updateCertificateMutation.isPending ? "Saving..." : "Save Changes") : (addCertificateMutation.isPending ? "Adding..." : "Add Certificate")}</Button></DialogFooter>
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
              <TableHead className="w-[150px]">Issuer</TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displayCertificates.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {displayCertificates.map((cert) => (
                  <SortableCertificateRow key={cert.id} certificate={cert} onEdit={handleEditClick} onDelete={deleteCertificateMutation.mutate} />
                ))}
              </TableBody>
            </SortableContext>
          </DndContext>
        </Table>
      </div>

      {newCertificate.image && (
        <ImageEditorDialog
          isOpen={isImageEditorOpen}
          onClose={() => setIsImageEditorOpen(false)}
          imageUrl={newCertificate.image}
          onSave={handleImageEditorSave}
          onDelete={handleImageEditorDelete}
          isSaving={uploadFileMutation.isPending || deleteCertificateImageMutation.isPending}
        />
      )}
    </div>
  );
};

export default CertificatesManagement;