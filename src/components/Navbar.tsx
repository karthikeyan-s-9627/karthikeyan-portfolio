"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);

  const navLinks = [
    { name: "Home", path: "#home" },
    { name: "About", path: "#about" },
    { name: "Skills", path: "#skills" },
    { name: "Certificates", path: "#certificates" },
    { name: "Projects", path: "#projects" },
    { name: "Contact", path: "#contact" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      if (isMobile) {
        setIsSheetOpen(false); // Close the sheet after clicking a link on mobile
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 shadow-lg py-4 px-4 sm:px-8 lg:px-16 flex justify-between items-center border-b border-border/50">
      <div className="text-2xl font-bold text-primary cursor-pointer" onClick={() => scrollToSection("home")}>
        My Portfolio
      </div>

      {isMobile ? (
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="focus-visible:ring-offset-0 focus-visible:ring-transparent">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-background/95 backdrop-blur-md border-l border-border/50 p-6 flex flex-col">
              <div className="text-2xl font-bold text-primary mb-8 cursor-pointer" onClick={() => scrollToSection("home")}>
                My Portfolio
              </div>
              <ul className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.path}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(link.path.substring(1)); // Remove '#'
                      }}
                      className={cn(
                        "text-foreground hover:text-primary transition-colors duration-300 relative group text-lg font-medium inline-block py-2" // Added inline-block
                      )}
                    >
                      {link.name}
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                    </a>
                  </li>
                ))}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      ) : (
        <div className="flex items-center space-x-6">
          <ul className="flex space-x-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.path}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(link.path.substring(1)); // Remove '#'
                  }}
                  className={cn(
                    "text-foreground hover:text-primary transition-colors duration-300 relative group inline-block" // Added inline-block
                  )}
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                </a>
              </li>
            ))}
          </ul>
          <ThemeToggle />
        </div>
      )}
    </nav>
  );
};

export default Navbar;