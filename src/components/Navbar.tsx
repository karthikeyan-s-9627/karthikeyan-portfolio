"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

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
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/80 shadow-lg py-4 px-8 flex justify-between items-center border-b border-border/50">
      <div className="text-2xl font-bold text-primary cursor-pointer" onClick={() => scrollToSection("home")}>
        My Portfolio
      </div>
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
                "text-foreground hover:text-primary transition-colors duration-300 relative group"
              )}
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
            </a>
          </li>
        ))}
      </ul>
      <ThemeToggle />
    </nav>
  );
};

export default Navbar;