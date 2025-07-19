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
import { PlusCircle, Trash2, Edit, GripVertical } from "lucide-react";
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
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Skill {
  id: string;
  category: string;
  name: string;
  position: number | null;
}

const SortableSkillRow: React.FC<{ skill: Skill; onEdit: (skill: Skill) => void; onDelete: (id: string) => void; }> = ({ skill, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: skill.id });

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
      <TableCell className="font-medium">{skill.category}</TableCell>
      <TableCell>{skill.name}</TableCell>
      <TableCell className="text-right flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(skill)}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(skill.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

const SkillsManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [displaySkills, setDisplaySkills] = React.useState<Skill[]>([]);
  const [newSkillCategory, setNewSkillCategory] = React.useState("");
  const [newSkillName, setNewSkillName] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingSkill, setEditingSkill] = React.useState<Skill | null>(null);

  const { data: skills, isLoading, error } = useQuery<Skill[], Error>({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("position", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  const updateOrderMutation = useMutation<null, Error, { id: string; position: number }[], unknown>({
    mutationFn: async (updates) => {
      const { error } = await supabase.rpc('update_skill_positions', { updates });
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      showSuccess("Skill order updated!");
    },
    onError: (err) => {
      showError(`Error updating order: ${err.message}`);
    },
  });

  React.useEffect(() => {
    if (skills) {
      const itemsWithNullPosition = skills.filter(s => s.position === null);
      if (itemsWithNullPosition.length > 0) {
        const updates = skills.map((skill, index) => ({
          id: skill.id,
          position: skill.position ?? index,
        }));
        updateOrderMutation.mutate(updates);
      }
      setDisplaySkills(skills);
    }
  }, [skills]);

  React.useEffect(() => {
    if (!isDialogOpen) {
      setEditingSkill(null);
      setNewSkillCategory("");
      setNewSkillName("");
    }
  }, [isDialogOpen]);

  const addSkillMutation = useMutation({
    mutationFn: async (skill: Omit<Skill, "id">) => {
      const { data, error } = await supabase.from("skills").insert(skill).select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      showSuccess("Skill added successfully!");
      setIsDialogOpen(false);
    },
    onError: (err: Error) => {
      showError(`Error adding skill: ${err.message}`);
    },
  });

  const updateSkillMutation = useMutation<null, Error, Omit<Skill, 'position'>, unknown>({
    mutationFn: async (skill) => {
      const { error } = await supabase.from("skills").update({ category: skill.category, name: skill.name }).eq("id", skill.id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["skills"] });
      showSuccess("Skill updated successfully!");
      setIsDialogOpen(false);
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
      const maxPosition = displaySkills.length > 0 ? Math.max(...displaySkills.map(s => s.position || 0)) : -1;
      const newPosition = maxPosition + 1;
      addSkillMutation.mutate({ category: newSkillCategory, name: newSkillName, position: newPosition });
    }
  };

  const handleEditClick = (skill: Skill) => {
    setEditingSkill(skill);
    setNewSkillCategory(skill.category);
    setNewSkillName(skill.name);
    setIsDialogOpen(true);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = displaySkills.findIndex((item) => item.id === active.id);
      const newIndex = displaySkills.findIndex((item) => item.id === over.id);
      const newOrder = arrayMove(displaySkills, oldIndex, newIndex);
      setDisplaySkills(newOrder);

      const updates = newOrder.map((item, index) => ({
        id: item.id,
        position: index,
      }));
      updateOrderMutation.mutate(updates);
    }
  };

  if (isLoading) return <div className="text-center text-muted-foreground">Loading skills...</div>;
  if (error) return <div className="text-center text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">Manage Skills</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border/50">
            <DialogHeader>
              <DialogTitle>{editingSkill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Input id="category" value={newSkillCategory} onChange={(e) => setNewSkillCategory(e.target.value)} className="col-span-3 bg-input/50 border-border/50 focus:border-primary" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Skill Name</Label>
                <Input id="name" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} className="col-span-3 bg-input/50 border-border/50 focus:border-primary" />
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
              <TableHead className="w-12"></TableHead>
              <TableHead className="w-[200px]">Category</TableHead>
              <TableHead>Skill Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={displaySkills.map(s => s.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {displaySkills.map((skill) => (
                  <SortableSkillRow key={skill.id} skill={skill} onEdit={handleEditClick} onDelete={deleteSkillMutation.mutate} />
                ))}
              </TableBody>
            </SortableContext>
          </DndContext>
        </Table>
      </div>
    </div>
  );
};

export default SkillsManagement;