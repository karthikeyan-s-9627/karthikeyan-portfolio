"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, LayoutDashboard, User, Code, Award, Briefcase, Mail, FileText, Info } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface AdminSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentSection, onSectionChange }) => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const navItems = [
    { name: "Hero", section: "hero-section", icon: LayoutDashboard },
    { name: "About Me", section: "about-me", icon: User },
    { name: "Skills", section: "skills", icon: Code },
    { name: "Certificates", section: "certificates", icon: Award },
    { name: "Projects", section: "projects", icon: Briefcase },
    { name: "Contact Info", section: "contact-info", icon: Info },
    { name: "Resume", section: "resume", icon: FileText },
    { name: "Messages", section: "messages", icon: Mail },
  ];

  const handleItemClick = (section: string) => {
    onSectionChange(section);
    if (isMobile) {
      setIsSheetOpen(false); // Close the sheet after clicking a link on mobile
    }
  };

  const sidebarContent = (
    <ul className="flex flex-col space-y-2 p-4">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = currentSection === item.section;
        return (
          <li key={item.section}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start text-lg font-medium transition-colors duration-200",
                isActive
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : "text-foreground hover:bg-muted/50"
              )}
              onClick={() => handleItemClick(item.section)}
            >
              <IconComponent className="mr-3 h-5 w-5" />
              {item.name}
            </Button>
          </li>
        );
      })}
    </ul>
  );

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="focus-visible:ring-offset-0 focus-visible:ring-transparent">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Open menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] sm:w-[300px] bg-background/95 backdrop-blur-md border-r border-border/50 p-0 flex flex-col">
          <div className="p-6 pb-4 flex items-center justify-between border-b border-border/50">
            <div className="text-2xl font-bold text-primary">Admin Menu</div>
            <ThemeToggle />
          </div>
          {sidebarContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <nav className="w-64 flex-shrink-0 bg-sidebar border-r border-sidebar-border shadow-lg flex flex-col pt-24">
      {sidebarContent}
      <div className="mt-auto p-4 border-t border-sidebar-border flex justify-center">
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default AdminSidebar;