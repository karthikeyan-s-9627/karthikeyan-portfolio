"use client";

import React from "react";

export const CopyrightFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="p-4 text-center text-sm text-muted-foreground border-t border-border/50 mt-auto">
      <p>&copy; {currentYear} My Portfolio. All rights reserved.</p>
    </footer>
  );
};