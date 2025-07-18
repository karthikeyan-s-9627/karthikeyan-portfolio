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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { PlusCircle, Trash2, Edit } from "lucide-react";

interface Skill {
  id: string;
  category: string;
  name: string;
}

const SkillsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [newSkillCategory, setNewSkillCategory] = React.useState("");
  const [newSkillName, setNewSkillName] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSkill, setEditingSkill] = React.useState<Skill | null>(null);

  const { data: skills, isLoading, error } = useQuery<Skill[], Error>({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("category").order("name");
      if (error) throw error;
      return data;
    },
  });

  const addSkillMutation = useMutation<null, Error, Omit<Skill, "id">, unknown>({
    mutationFn: async (skill) => {
      const { error } = await supabase.from("skills").insert(skill);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      showSuccess("Skill added successfully!");
      setNewSkillCategory("");
      setNewSkillName("");
      setIsDialogOpen(false);
    },
    onError: (err) => {
      showError(`Error adding skill: ${err.message}`);
    },
  });

  const updateSkillMutation = useMutation<null, Error, Skill, unknown>({
    mutationFn: async (skill) => {
      const { error } = await supabase.from("skills").update({ category: skill.category, name: skill.name }).eq("id", skill.id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      showSuccess("Skill updated successfully!");
      setIsDialogOpen(false);
      setEditingSkill(null);
    },
    onError: (err) => {
      showError(`Error updating skill: ${err.message}`);
    },
  });

  const deleteSkillMutation = useMutation<null, Error, string, unknown>({
    mutationFn: async (id) => {
      const { error } = await supabase.from("skills").delete().eq("id", id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      showSuccess("Skill deleted successfully!");
    },
    onError: (err) => {
      showError(`Error deleting skill: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSkill) {
      updateSkillMutation.mutate({ ...editingSkill, category: newSkillCategory, name: newSkillName });
    } else {
      addSkillMutation.mutate({ category: newSkillCategory, name: newSkillName });
    }
  };

  const handleEditClick = (skill: Skill) => {
    setEditingSkill(skill);
    setNewSkillCategory(skill.category);
    setNewSkillName(skill.name);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingSkill(null);
    setNewSkillCategory("");
    setNewSkillName("");
  };

  if (isLoading) return <div className="text-center text-muted-foreground">Loading skills...</div>;
  if (error) return <div className="text-center text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Manage Skills</h2>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>{editingSkill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  id="category"
                  value={newSkillCategory}
                  onChange={(e) => setNewSkillCategory(e.target.value)}
                  className="col-span-3 bg-input/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Skill Name
                </Label>
                <Input
                  id="name"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="col-span-3 bg-input/50 border-border/50 focus:border-primary"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={addSkillMutation.isPending || updateSkillMutation.isPending}>
                  {editingSkill ? (updateSkillMutation.isPending ? "Saving..." : "Save Changes") : (addSkillMutation.isPending ? "Adding..." : "Add Skill")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border border-border/50 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Category</TableHead>
              <TableHead>Skill Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills?.map((skill) => (
              <TableRow key={skill.id}>
                <TableCell className="font-medium">{skill.category}</TableCell>
                <TableCell>{skill.name}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(skill)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => deleteSkillMutation.mutate(skill.id)}>
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

export default SkillsManagement;