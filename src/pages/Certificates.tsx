"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const certificatesData = [
  {
    title: "Full Stack Web Development Bootcamp",
    issuer: "Udemy",
    date: "May 2023",
    description: "Comprehensive course covering MERN stack development, including React, Node.js, Express, and MongoDB.",
    link: "#", // Placeholder link
  },
  {
    title: "Machine Learning Specialization",
    issuer: "Coursera (DeepLearning.AI)",
    date: "August 2023",
    description: "Specialization focused on supervised learning, unsupervised learning, and neural networks.",
    link: "#", // Placeholder link
  },
  {
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services (AWS)",
    date: "November 2023",
    description: "Foundational understanding of AWS cloud concepts, services, security, architecture, pricing, and support.",
    link: "#", // Placeholder link
  },
];

const Certificates = () => {
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
        My <span className="text-primary">Certificates</span>
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {certificatesData.map((cert, index) => (
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
                <CardTitle className="text-xl font-bold text-primary mb-1">{cert.title}</CardTitle>
                <CardDescription className="text-muted-foreground text-sm">
                  {cert.issuer} | {cert.date}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-muted-foreground mb-4">{cert.description}</p>
                {cert.link && (
                  <a href={cert.link} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full glow-button-outline">
                      View Credential <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Certificates;