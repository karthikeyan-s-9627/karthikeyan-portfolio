"use client";

import React from "react";
import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminDashboard: React.FC = () => {
  const [session, setSession] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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

      {session && (
        <Card className="bg-card shadow-lg border border-border/50 mt-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-primary">Content Management</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>This is where you will manage your portfolio content.</p>
            <p>Currently, you are logged in. We can now proceed to build out the sections for managing skills, certificates, and projects.</p>
            {/* Future content management links/components will go here */}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;