"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, ExternalLink } from "lucide-react";

interface Certificate {
  title: string;
  issuer: string;
  date: string;
  description: string;
  link: string;
  image: string;
}

interface CertificatesCarouselProps {
  certificates: Certificate[];
}

const CertificatesCarousel: React.FC<CertificatesCarouselProps> = ({ certificates }) => {
  // Ensure there's at least one certificate to display
  if (!certificates || certificates.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No certificates to display.</div>;
  }

  const cert = certificates[0]; // Only show the first certificate

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <div className="relative w-full h-[500px] flex justify-center items-center">
      <motion.div
        className="w-[300px] h-[350px] flex justify-center items-center"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Card className="w-full h-full bg-card shadow-2xl border border-border/50 rounded-xl overflow-hidden
          hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="p-0">
            <img src={cert.image} alt={cert.title} className="w-full h-40 object-cover rounded-t-xl border-b border-border/50" />
            <div className="p-6 pb-4">
              <CardTitle className="text-xl font-bold text-primary mb-1 flex items-center gap-2">
                <Award className="h-5 w-5" /> {cert.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {cert.issuer} | {cert.date}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
              <p className="text-muted-foreground mb-4 text-sm">{cert.description}</p>
              {cert.link && (
                <a href={cert.link} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full">
                    View Credential <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              )}
            </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CertificatesCarousel;