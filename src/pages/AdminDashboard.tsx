"use client";

import React from "react";
import AuthForm from "@/components/AuthForm";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { showError } from "@/utils/toast";
import SkillsManagement from "@/components/admin/SkillsManagement";
import CertificatesManagement from "@/components/admin/CertificatesManagement";
import ProjectsManagement from "@/components/admin/ProjectsManagement";
import ContactMessagesManagement from "@/components/admin/ContactMessagesManagement";
import AboutMeManagement from "@/components/admin/AboutMeManagement";
import HeroManagement from "@/components/admin/HeroManagement";
import ContactInfoManagement from "@/components/admin/ContactInfoManagement";
import ResumeManagement from "@/components/admin/ResumeManagement";
import AdminLayout from "@/components/layout/AdminLayout";
import MaintenanceManagement from "@/components/admin/MaintenanceManagement";

const AdminDashboard: React.FC = () => {
  const [session, setSession] = React.useState<any>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loadingAdminCheck, setLoadingAdminCheck] = React.useState(true);
  const [currentSection, setCurrentSection] = React.useState("hero-section");

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
        }
      } else {
        setIsAdmin(false);
      }
      setLoadingAdminCheck(false);
    };

    checkSessionAndAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkSessionAndAdminStatus();
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderManagementComponent = () => {
    switch (currentSection) {
      case "hero-section":
        return <HeroManagement />;
      case "about-me":
        return <AboutMeManagement />;
      case "skills":
        return <SkillsManagement />;
      case "certificates":
        return <CertificatesManagement />;
      case "projects":
        return <ProjectsManagement />;
      case "contact-info":
        return <ContactInfoManagement />;
      case "resume":
        return <ResumeManagement />;
      case "messages":
        return <ContactMessagesManagement />;
      case "maintenance":
        return <MaintenanceManagement />;
      default:
        return <HeroManagement />;
    }
  };

  if (loadingAdminCheck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-12 text-center text-foreground drop-shadow-lg">
          Dashboard <span className="text-primary">Overview</span>
        </h1>
        <Card className="bg-card shadow-lg border border-border/50 mt-8 w-full max-w-md">
          <CardContent className="text-muted-foreground p-6 text-center">
            Loading admin status...
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session && isAdmin) {
    return (
      <AdminLayout currentSection={currentSection} onSectionChange={setCurrentSection}>
        <div className="w-full max-w-4xl mx-auto p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-12 text-center text-foreground drop-shadow-lg">
            Dashboard <span className="text-primary">Overview</span>
          </h1>
          <Card className="bg-card shadow-lg border border-border/50 mt-8">
            <CardContent className="p-6">
              {renderManagementComponent()}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-foreground">
      <h1 className="text-4xl md:text-6xl font-extrabold mb-12 text-center text-foreground drop-shadow-lg">
        Dashboard <span className="text-primary">Overview</span>
      </h1>
      <div className="flex justify-center mb-8">
        <AuthForm />
      </div>
      <Card className="bg-card shadow-lg border border-border/50 mt-8 w-full max-w-md">
        <CardContent className="text-muted-foreground p-6 text-center">
          Please log in with an administrator account to access the content management features.
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;