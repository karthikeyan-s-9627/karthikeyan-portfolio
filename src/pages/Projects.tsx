"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const projectsData = [
  {
    title: "E-commerce Platform",
    description: "A full-stack e-commerce application with user authentication, product listings, shopping cart, and payment integration.",
    technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe", "Tailwind CSS"],
    githubLink: "#", // Placeholder link
    liveLink: "#", // Placeholder link
  },
  {
    title: "AI Chatbot Assistant",
    description: "An intelligent chatbot powered by natural language processing, capable of answering queries and performing tasks.",
    technologies: ["Python", "Flask", "OpenAI API", "React", "TypeScript"],
    githubLink: "#", // Placeholder link
    liveLink: "#", // Placeholder link
  },
  {
    title: "Personal Blog Site",
    description: "A responsive blog platform with a rich text editor, comment section, and admin panel for content management.",
    technologies: ["Next.js", "TypeScript", "Sanity.io", "GraphQL", "Tailwind CSS"],
    githubLink: "#", // Placeholder link
    liveLink: "#", // Placeholder link
  },
  {
    title: "Task Management App",
    description: "A simple and intuitive task management application with drag-and-drop functionality and user-specific dashboards.",
    technologies: ["React", "Redux", "Firebase", "Chakra UI"],
    githubLink: "#", // Placeholder link
    liveLink: "#", // Placeholder link
  },
];

const Projects = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, rotateX: 90, transformOrigin: "bottom" },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateY: 45 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  return (
    <motion.div
      className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-4xl md:text-6xl font-extrabold mb-8 text-foreground drop-shadow-lg"
        variants={itemVariants}
      >
        My <span className="text-primary">Projects</span>
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {projectsData.map((project, index) => (
          <motion.div
            key={index}
            className="perspective-1000"
            variants={cardVariants}
            custom={index}
          >
            <Card className="h-full bg-card/70 backdrop-blur-md shadow-2xl border border-border/50 rounded-xl overflow-hidden
              hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-500 ease-in-out
              hover:rotate-x-3 hover:rotate-y-3 transform-gpu"
            >
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xl font-bold text-primary mb-2">{project.title}</CardTitle>
                <CardDescription className="text-muted-foreground">{project.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="bg-secondary/80 text-secondary-foreground">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-3">
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" className="w-full glow-button-outline">
                        <Github className="mr-2 h-4 w-4" /> GitHub
                      </Button>
                    </a>
                  )}
                  {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full glow-button">
                        <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Projects;