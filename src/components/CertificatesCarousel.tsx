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
  const radius = 450; // Increased from 300

  return (
    <div className="relative w-full h-[500px]">
      <div className="carousel-slider">
        {certificates.map((cert, index) => (
          <div
            key={index}
            className="carousel-item"
            style={{
              transform: `rotateY(${index * angle}deg) translateZ(${radius}px)`,
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="w-full h-full bg-card shadow-2xl border border-border/50 rounded-xl overflow-hidden
                hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-300">
                <CardHeader className="p-0">
                  <img src={cert.image} alt={cert.title} className="w-full h-32 object-cover rounded-t-xl border-b border-border/50" />
                  <div className="p-4 pb-2">
                    <CardTitle className="text-lg font-bold text-primary mb-1 flex items-center gap-2">
                      <Award className="h-5 w-5" /> {cert.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-xs">
                      {cert.issuer} | {cert.date}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                    <p className="text-muted-foreground mb-3 text-xs">{cert.description}</p>
                    {cert.link && (
                      <a href={cert.link} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="w-full">
                          View Credential <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </a>
                    )}
                  </CardContent>
              </Card>
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificatesCarousel;