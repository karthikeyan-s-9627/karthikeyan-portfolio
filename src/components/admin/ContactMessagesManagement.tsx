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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Eye, Trash2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ContactMessagesManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewingMessage, setViewingMessage] = React.useState<ContactMessage | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);

  const { data: messages, isLoading, error } = useQuery<ContactMessage[], Error>({
    queryKey: ["contact_messages"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateMessageStatusMutation = useMutation<null, Error, { id: string; is_read: boolean }, unknown>({
    mutationFn: async ({ id, is_read }) => {
      const { error } = await supabase.from("contact_messages").update({ is_read }).eq("id", id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_messages"] });
      showSuccess("Message status updated!");
    },
    onError: (err) => {
      showError(`Error updating message status: ${err.message}`);
    },
  });

  const deleteMessageMutation = useMutation<null, Error, string, unknown>({
    mutationFn: async (id) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
      return null;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact_messages"] });
      showSuccess("Message deleted successfully!");
      setIsViewDialogOpen(false); // Close dialog if the viewed message is deleted
    },
    onError: (err) => {
      showError(`Error deleting message: ${err.message}`);
    },
  });

  const handleViewMessage = (message: ContactMessage) => {
    setViewingMessage(message);
    setIsViewDialogOpen(true);
    if (!message.is_read) {
      updateMessageStatusMutation.mutate({ id: message.id, is_read: true });
    }
  };

  const handleDialogClose = () => {
    setIsViewDialogOpen(false);
    setViewingMessage(null);
  };

  if (isLoading) return <div className="text-center text-muted-foreground">Loading messages...</div>;
  if (error) return <div className="text-center text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Manage Contact Messages</h2>

      <div className="rounded-md border border-border/50 shadow-lg overflow-auto max-h-[calc(100vh-350px)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Name</TableHead>
              <TableHead className="w-[200px]">Email</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead>Message Snippet</TableHead>
              <TableHead className="w-[150px]">Received At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages?.map((message) => (
              <TableRow key={message.id} className={message.is_read ? "text-muted-foreground" : "font-semibold"}>
                <TableCell className="font-medium">{message.name}</TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell>
                  <Badge variant={message.is_read ? "outline" : "default"}>
                    {message.is_read ? "Read" : "New"}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm max-w-[300px] truncate">{message.message}</TableCell>
                <TableCell>{format(new Date(message.created_at), "MMM dd, yyyy HH:mm")}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewMessage(message)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  {!message.is_read && (
                    <Button variant="secondary" size="sm" onClick={() => updateMessageStatusMutation.mutate({ id: message.id, is_read: true })}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => deleteMessageMutation.mutate(message.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border/50">
          <DialogHeader>
            <DialogTitle>Message from {viewingMessage?.name}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {viewingMessage?.email} | {viewingMessage?.created_at ? format(new Date(viewingMessage.created_at), "MMM dd, yyyy HH:mm") : ""}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-foreground whitespace-pre-wrap">{viewingMessage?.message}</p>
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={() => viewingMessage && deleteMessageMutation.mutate(viewingMessage.id)}>
              Delete Message
            </Button>
            <Button onClick={handleDialogClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactMessagesManagement;