"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { MadeWithDyad } from "@/components/made-with-dyad";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted animate-gradient-shift">
      <Navbar />
      <main className="flex-grow pt-20 pb-10 px-4 sm:px-8 lg:px-16">
        {children}
      </main>
      <MadeWithDyad />
    </div>
  );
};

export default MainLayout;