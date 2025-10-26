"use client";

import React from "react";

export function useScrollToTop() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
}