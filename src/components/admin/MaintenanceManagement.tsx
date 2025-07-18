"use client";

import React from "react";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/utils/toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface SiteSettings {
  id: string;
  maintenance_mode: boolean;
}

const SETTINGS_SINGLETON_ID = "00000000-0000-0000-0000-000000000004";

const MaintenanceManagement: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading, error } = useQuery<SiteSettings, Error>({
    queryKey: ["site_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("id", SETTINGS_SINGLETON_ID)
        .single();
      if (error) {
        if (error.code === 'PGRST116') { // No rows found, should not happen with the seed
          return { id: SETTINGS_SINGLETON_ID, maintenance_mode: false };
        }
        throw error;
      }
      return data;
    },
  });

  const updateMaintenanceMutation = useMutation<null, Error, boolean, unknown>({
    mutationFn: async (newStatus) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ maintenance_mode: newStatus, updated_at: new Date().toISOString() })
        .eq("id", SETTINGS_SINGLETON_ID);
      if (error) throw error;
      return null;
    },
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ["site_settings"] });
      // Also invalidate the public query key used by the home page
      queryClient.invalidateQueries({ queryKey: ["maintenance_status"] });
      showSuccess(`Maintenance mode ${newStatus ? 'enabled' : 'disabled'}.`);
    },
    onError: (err) => {
      showError(`Error updating status: ${err.message}`);
    },
  });

  const handleToggle = (checked: boolean) => {
    updateMaintenanceMutation.mutate(checked);
  };

  if (isLoading) return <div className="text-center text-muted-foreground flex items-center justify-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /> Loading settings...</div>;
  if (error) return <div className="text-center text-destructive">Error: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Maintenance Mode</h2>
      <Card className="bg-card shadow-lg border border-border/50">
        <CardHeader>
          <CardTitle>Site Status</CardTitle>
          <CardDescription>
            Enable maintenance mode to show a temporary message on the home page instead of the full portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 rounded-md border p-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Enable Maintenance Mode
              </p>
              <p className="text-sm text-muted-foreground">
                When enabled, visitors will see a maintenance page.
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={settings?.maintenance_mode ?? false}
              onCheckedChange={handleToggle}
              disabled={updateMaintenanceMutation.isPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceManagement;