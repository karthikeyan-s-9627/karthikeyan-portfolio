"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { CopyrightFooter } from "@/components/CopyrightFooter"; // Import the new component

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background elements for the futuristic theme */}
      <div className="background-grid"></div>
      <div className="background-radial-gradient"></div>

      <Navbar />
      <main className="flex-grow pt-20 pb-10 px-4 sm:px-8 lg:px-16 relative z-10">
        {children}
      </main>
      <CopyrightFooter /> {/* Use the new CopyrightFooter component */}
    </div>
  );
};

export default MainLayout;