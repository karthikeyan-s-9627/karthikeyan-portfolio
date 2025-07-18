"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const skillsData = {
  "Programming Languages": ["TypeScript", "JavaScript", "Python", "Java", "C++"],
  "Frontend Development": ["React", "Next.js", "HTML5", "CSS3", "Tailwind CSS", "Shadcn/UI", "Framer Motion"],
  "Backend Development": ["Node.js", "Express.js", "REST APIs", "GraphQL"],
  "Databases": ["PostgreSQL", "MongoDB", "MySQL", "Supabase"],
  "Tools & Technologies": ["Git", "Docker", "VS Code", "Jira", "Figma"],
  "Concepts": ["Object-Oriented Programming", "Data Structures & Algorithms", "Responsive Design", "Agile Methodologies"],
};

const Skills = () => {
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
        My <span className="text-primary">Skills</span>
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {Object.entries(skillsData).map(([category, skills], index) => (
          <motion.div
            key={category}
            className="perspective-1000"
            variants={cardVariants}
            custom={index}
          >
            <Card className="h-full bg-card/70 backdrop-blur-md shadow-2xl border border-border/50 rounded-xl overflow-hidden
              hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-500 ease-in-out
              hover:rotate-x-3 hover:rotate-y-3 transform-gpu"
            >
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-xl font-bold text-primary">{category}</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="px-3 py-1 text-sm rounded-full bg-secondary/80 text-secondary-foreground
                      hover:bg-secondary/100 hover:scale-105 transition-transform duration-200
                      shadow-md hover:shadow-lg"
                  >
                    {skill}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Skills;