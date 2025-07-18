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
  const numCertificates = certificates.length;
  const angle = 360 / numCertificates;
  const radius = 250; // Adjusted radius for a tighter circle

  const carouselVariants = {
    animate: {
      rotateY: 360, // Changed back to rotateY for horizontal revolution
      transition: {
        duration: 15, // Faster rotation speed
        ease: "linear",
        repeat: Infinity,
      },
    },
  };

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
    <div className="relative w-full h-[500px] flex justify-center items-center perspective-1000"> {/* Increased height and explicit perspective class */}
      <motion.div
        className="relative w-full h-full preserve-3d"
        variants={carouselVariants}
        initial="animate" // Start animation immediately
        animate="animate"
      >
        {certificates.map((cert, index) => (
          <motion.div
            key={index}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[350px] flex justify-center items-center backface-hidden"
            style={{
              transform: `rotateY(${index * angle}deg) translateZ(${radius}px)`, // Changed back to rotateY
            }}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1, duration: 0.5 }}
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
        ))}
      </motion.div>
    </div>
  );
};

export default CertificatesCarousel;