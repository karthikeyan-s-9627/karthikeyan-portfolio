"use client";

import React from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "@/components/admin/AdminSidebar"; // Import AdminSidebar
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile

interface AdminLayoutProps {
  children: React.ReactNode;
  currentSection: string; // Add currentSection prop
  onSectionChange: (section: string) => void; // Add onSectionChange prop
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentSection, onSectionChange }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col relative bg-background text-foreground">
      {/* Background elements for the futuristic theme */}
      <div className="background-grid"></div>
      <div className="background-radial-gradient"></div>

      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 shadow-lg py-4 px-4 sm:px-8 lg:px-16 flex justify-between items-center border-b border-border/50">
        <div className="flex items-center gap-4">
          {isMobile && (
            <AdminSidebar currentSection={currentSection} onSectionChange={onSectionChange} />
          )}
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="focus-visible:ring-offset-0 focus-visible:ring-transparent">
            <ArrowLeft className="h-6 w-6" />
            <span className="sr-only">Back to Portfolio</span>
          </Button>
          <div className="text-2xl font-bold text-primary">
            Admin Dashboard
          </div>
        </div>
        {!isMobile && <ThemeToggle />} {/* ThemeToggle moved to sidebar on mobile */}
      </nav>

      <div className="flex flex-grow">
        {!isMobile && (
          <AdminSidebar currentSection={currentSection} onSectionChange={onSectionChange} />
        )}
        <main className="flex-grow pt-24 pb-10 px-4 sm:px-8 lg:px-16 relative z-10 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;