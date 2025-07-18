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
import { PlusCircle, Trash2, Edit } from "lucide-react";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  link?: string;
  image?: string;
}

const CertificatesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [newCertificate, setNewCertificate] = React.useState<Omit<Certificate, "id">>({
    title: "",
    issuer: "",
    date: "",
    description: "",
    link: "",
    image: "",
  });
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingCertificate, setEditingCertificate] = React.useState<Certificate | null>(null);

  const { data: certificates, isLoading, error } = useQuery<Certificate[], Error>({
    queryKey: ["certificates"],
    queryFn: async () => {
      const { data, error } = await supabase.from("certificates").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addCertificateMutation = useMutation({
    mutationFn: async (certificate: Omit<Certificate, "id">) => {
      const { data, error } = await supabase.from("certificates").insert(certificate).select();
      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      showSuccess("Certificate added successfully!");
      setNewCertificate({ title: "", issuer: "", date: "", description: "", link: "", image: "" });
      setIsDialogOpen(false);
    },
    onError: (err: Error) => {
      showError(`Error adding certificate: ${err.message}`);
    },
  });

  const updateCertificateMutation = useMutation<null, Error, Certificate, unknown>({
    mutationFn: async (certificate) => {
      const { error } = await supabase.from("certificates").update({
        title: certificate.title,
        issuer: certificate.issuer,
        date: certificate.date,
        description: certificate.description,
        link: certificate.link,
        image: certificate.image,
      }).eq("id", certificate.id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      showSuccess("Certificate updated successfully!");
      setIsDialogOpen(false);
      setEditingCertificate(null);
    },
    onError: (err) => {
      showError(`Error updating certificate: ${err.message}`);
    },
  });

  const deleteCertificateMutation = useMutation<null, Error, string, unknown>({
    mutationFn: async (id) => {
      const { error } = await supabase.from("certificates").delete().eq("id", id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      showSuccess("Certificate deleted successfully!");
    },
    onError: (err) => {
      showError(`Error deleting certificate: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCertificate) {
      updateCertificateMutation.mutate({ ...editingCertificate, ...newCertificate });
    } else {
      addCertificateMutation.mutate(newCertificate);
    }
  };

  const handleEditClick = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setNewCertificate({
      title: certificate.title,
      issuer: certificate.issuer,
      date: certificate.date,
      description: certificate.description,
      link: certificate.link || "",
      image: certificate.image || "",
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCertificate(null);
    setNewCertificate({ title: "", issuer: "", date: "", description: "", link: "", image: "" });
  };

  if (isLoading) return <div className="text-center text-muted-foreground">Loading certificates...</div>;
  if (error) return <div className="text-center text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Manage Certificates</h2>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>{editingCertificate ? "Edit Certificate" : "Add New Certificate"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input
                  id="title"
                  value={newCertificate.title}
                  onChange={(e) => setNewCertificate({ ...newCertificate, title: e.target.value })}
                  className="col-span-3 bg-input/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="issuer" className="text-right">Issuer</Label>
                <Input
                  id="issuer"
                  value={newCertificate.issuer}
                  onChange={(e) => setNewCertificate({ ...newCertificate, issuer: e.target.value })}
                  className="col-span-3 bg-input/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">Date</Label>
                <Input
                  id="date"
                  value={newCertificate.date}
                  onChange={(e) => setNewCertificate({ ...newCertificate, date: e.target.value })}
                  className="col-span-3 bg-input/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea
                  id="description"
                  value={newCertificate.description}
                  onChange={(e) => setNewCertificate({ ...newCertificate, description: e.target.value })}
                  className="col-span-3 bg-input/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="link" className="text-right">Link (Optional)</Label>
                <Input
                  id="link"
                  value={newCertificate.link}
                  onChange={(e) => setNewCertificate({ ...newCertificate, link: e.target.value })}
                  className="col-span-3 bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">Image URL (Optional)</Label>
                <Input
                  id="image"
                  value={newCertificate.image}
                  onChange={(e) => setNewCertificate({ ...newCertificate, image: e.target.value })}
                  className="col-span-3 bg-input/50 border-border/50 focus:border-primary"
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addCertificateMutation.isPending || updateCertificateMutation.isPending}>
                  {editingCertificate ? (updateCertificateMutation.isPending ? "Saving..." : "Save Changes") : (addCertificateMutation.isPending ? "Adding..." : "Add Certificate")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-border/50 shadow-lg overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Title</TableHead>
              <TableHead className="w-[150px]">Issuer</TableHead>
              <TableHead className="w-[100px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates?.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-medium">{cert.title}</TableCell>
                <TableCell>{cert.issuer}</TableCell>
                <TableCell>{cert.date}</TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{cert.description}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(cert)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteCertificateMutation.mutate(cert.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CertificatesManagement;