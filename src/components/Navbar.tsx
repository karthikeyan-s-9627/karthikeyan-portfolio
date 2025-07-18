"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

const Navbar = () => {
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
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 shadow-lg py-3 px-4 sm:px-8 flex justify-between items-center border-b border-border/50">
      <div className="text-xl sm:text-2xl font-bold text-primary cursor-pointer" onClick={() => scrollToSection("home")}>
        My Portfolio
      </div>
      
      {/* Desktop Navigation */}
      <ul className="hidden md:flex space-x-6">
        {navLinks.map((link) => (
          <li key={link.name}>
            <a
              href={link.path}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(link.path.substring(1));
              }}
              className={cn(
                "text-foreground hover:text-primary transition-colors duration-300 relative group"
              )}
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-1 sm:gap-2">
        <ThemeToggle />

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-background/95 border-l-border/50">
              <nav className="flex flex-col h-full justify-center items-center">
                <ul className="flex flex-col items-center space-y-8">
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <SheetClose asChild>
                        <a
                          href={link.path}
                          onClick={(e) => {
                            e.preventDefault();
                            scrollToSection(link.path.substring(1));
                          }}
                          className="text-2xl text-foreground hover:text-primary transition-colors"
                        >
                          {link.name}
                        </a>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;