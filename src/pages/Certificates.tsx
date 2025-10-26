"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  date: string;
  description: string;
  link?: string;
  image?: string;
  image_width?: string;
  image_height?: string;
}

const CertificatesPage: React.FC = () => {
  const navigate = useNavigate();
  useScrollToTop(); // Use the new hook

  // Fetch ALL certificates data from Supabase
  const { data: certificates, isLoading, error } = useQuery<Certificate[], Error>({
    queryKey: ["certificates_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*, image_width, image_height")
        .order("position", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data || [];
    },
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen pt-10 pb-20">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4 text-lg text-primary hover:text-primary/80">
          <ArrowLeft className="mr-2 h-5 w-5" /> Back to Portfolio
        </Button>
        <h1 className="text-4xl md:text-6xl font-extrabold text-foreground drop-shadow-lg text-center">
          All <span className="text-primary">Certificates</span>
        </h1>
        <p className="text-center text-lg text-muted-foreground mt-2">A complete list of my professional achievements and certifications.</p>
      </motion.div>

      {isLoading ? (
        <div className="text-center text-muted-foreground flex items-center justify-center gap-2 mt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading all certificates...
        </div>
      ) : error ? (
        <div className="text-center text-destructive mt-20">Error loading certificates: {error.message}</div>
      ) : certificates && certificates.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {certificates.map((cert, index) => (
            <motion.div key={cert.id} variants={cardVariants} custom={index}>
              <Card className="h-full flex flex-col bg-card shadow-xl border border-border/50 rounded-xl overflow-hidden
                hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-300">
                <CardHeader className="p-0">
                  <img 
                    src={cert.image || "https://via.placeholder.com/300x200/0000FF/FFFFFF?text=Certificate"} 
                    alt={cert.title} 
                    className="w-full h-40 object-cover rounded-t-xl border-b border-border/50" 
                  />
                  <div className="p-4 pb-2">
                    <CardTitle className="text-lg font-bold text-primary mb-1 flex items-center gap-2">
                      <Award className="h-5 w-5" /> {cert.title}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground text-sm">
                      {cert.issuer} | {cert.date}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex flex-col justify-between flex-grow">
                    <p className="text-muted-foreground mb-4 text-sm flex-grow">{cert.description}</p>
                    {cert.link && (
                      <a href={cert.link} target="_blank" rel="noopener noreferrer" className="mt-auto">
                        <Button variant="outline" size="sm" className="w-full">
                          View Credential <ExternalLink className="ml-2 h-3 w-3" />
                        </Button>
                      </a>
                    )}
                  </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center text-muted-foreground mt-20">No certificates have been added yet.</div>
      )}
    </div>
  );
};

export default CertificatesPage;