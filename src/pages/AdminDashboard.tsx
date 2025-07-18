"use client";

import React from "react";
import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showError } from "@/utils/toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkillsManagement from "@/components/admin/SkillsManagement";
import CertificatesManagement from "@/components/admin/CertificatesManagement";
import ProjectsManagement from "@/components/admin/ProjectsManagement";
import ContactMessagesManagement from "@/components/admin/ContactMessagesManagement"; // Import new component

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
        <Tabs defaultValue="skills" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-4"> {/* Changed to 4 columns */}
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger> {/* New tab */}
          </TabsList>
          <TabsContent value="skills">
            <Card className="bg-card shadow-lg border border-border/50">
              <CardContent className="p-6">
                <SkillsManagement />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="certificates">
            <Card className="bg-card shadow-lg border border-border/50">
              <CardContent className="p-6">
                <CertificatesManagement />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="projects">
            <Card className="bg-card shadow-lg border border-border/50">
              <CardContent className="p-6">
                <ProjectsManagement />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="messages"> {/* New tab content */}
            <Card className="bg-card shadow-lg border border-border/50">
              <CardContent className="p-6">
                <ContactMessagesManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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