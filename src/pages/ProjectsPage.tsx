"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Github, Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  github_link?: string;
  live_link?: string;
  image?: string;
  image_width?: string;
  image_height?: string;
}

const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  useScrollToTop(); // Use the new hook

  // Fetch ALL projects data from Supabase
  const { data: projects, isLoading, error } = useQuery<Project[], Error>({
    queryKey: ["projects_all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
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

  const formatUrl = (url?: string): string => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
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
          All <span className="text-primary">Projects</span>
        </h1>
        <p className="text-center text-lg text-muted-foreground mt-2">A comprehensive showcase of my work and personal projects.</p>
      </motion.div>

      {isLoading ? (
        <div className="text-center text-muted-foreground flex items-center justify-center gap-2 mt-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" /> Loading all projects...
        </div>
      ) : error ? (
        <div className="text-center text-destructive mt-20">Error loading projects: {error.message}</div>
      ) : projects && projects.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {projects.map((project, index) => (
            <motion.div key={project.id} variants={cardVariants} custom={index}>
              <Card className="h-full flex flex-col bg-card shadow-xl border border-border/50 rounded-xl overflow-hidden
                hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-300">
                <CardHeader className="p-0">
                  <img 
                    src={project.image || "https://via.placeholder.com/500x300/0000FF/FFFFFF?text=Project"} 
                    alt={project.title} 
                    className="w-full h-40 object-cover rounded-t-xl border-b border-border/50" 
                  />
                  <div className="p-4 pb-2">
                    <CardTitle className="text-lg font-bold text-primary mb-1">{project.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex flex-col justify-between flex-grow">
                    <CardDescription className="text-muted-foreground mb-3 text-sm flex-grow">{project.description}</CardDescription>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies?.map((tech) => (
                        <Badge key={tech} variant="secondary" className="px-3 py-1 text-xs rounded-full bg-secondary/80 text-secondary-foreground shadow-md border border-primary/20">
                          {tech}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-3 mt-auto">
                      {project.github_link && (
                        <a href={formatUrl(project.github_link)} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Github className="mr-2 h-3 w-3" /> Source
                          </Button>
                        </a>
                      )}
                      {project.live_link && (
                        <a href={formatUrl(project.live_link)} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button size="sm" className="w-full">
                            <ExternalLink className="mr-2 h-3 w-3" /> Live
                          </Button>
                        </a>
                      )}
                    </div>
                  </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center text-muted-foreground mt-20">No projects have been added yet.</div>
      )}
    </div>
  );
};

export default ProjectsPage;