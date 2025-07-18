"use client";

import React from "react";
import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showError } from "@/utils/toast";

const AdminDashboard: React.FC = () => {
  const [session, setSession] = React.useState<any>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loadingAdminCheck, setLoadingAdminCheck] = React.useState(true);

  React.useEffect(() => {
    const checkSessionAndAdminStatus = async () => {
      setLoadingAdminCheck(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          showError("Failed to load user profile.");
          setIsAdmin(false);
        } else if (profileData?.is_admin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          // Optionally, log out non-admin users if they somehow reach here
          // await supabase.auth.signOut();
          // showError("You do not have admin privileges.");
        }
      } else {
        setIsAdmin(false);
      }
      setLoadingAdminCheck(false);
    };

    checkSessionAndAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkSessionAndAdminStatus(); // Re-check admin status on auth state change
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-12 text-center text-foreground drop-shadow-lg">
        Dashboard <span className="text-primary">Overview</span>
      </h1>

      <div className="flex justify-center mb-8">
        <AuthForm />
      </div>

      {loadingAdminCheck ? (
        <Card className="bg-card shadow-lg border border-border/50 mt-8">
          <CardContent className="text-muted-foreground p-6 text-center">
            Loading admin status...
          </CardContent>
        </Card>
      ) : session && isAdmin ? (
        <Card className="bg-card shadow-lg border border-border/50 mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Content Management</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>This is where you will manage your portfolio content.</p>
            <p>You are logged in as an administrator. We can now proceed to build out the sections for managing skills, certificates, and projects.</p>
            {/* Future content management links/components will go here */}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card shadow-lg border border-border/50 mt-8">
          <CardContent className="text-muted-foreground p-6 text-center">
            Please log in with an administrator account to access the content management features.
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;