"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
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
        About <span className="text-primary">Me</span>
      </motion.h1>

      <motion.div
        className="w-full max-w-3xl perspective-1000"
        variants={itemVariants}
      >
        <Card className="bg-card/70 backdrop-blur-md shadow-2xl border border-border/50 rounded-xl overflow-hidden
          hover:shadow-primary/50 hover:scale-[1.01] transition-all duration-500 ease-in-out
          hover:rotate-x-2 hover:rotate-y-2 transform-gpu"
        >
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-bold text-primary mb-2">My Journey So Far</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 text-lg text-muted-foreground leading-relaxed">
            <motion.p variants={itemVariants} className="mb-4">
              Hello! I'm John Doe, a dedicated and enthusiastic college student with a passion for software development and problem-solving. Currently pursuing a Bachelor's degree in Computer Science, I am constantly seeking opportunities to learn and grow in the ever-evolving tech landscape.
            </motion.p>
            <motion.p variants={itemVariants} className="mb-4">
              My academic journey has equipped me with a strong foundation in data structures, algorithms, and various programming paradigms. I thrive on challenges and enjoy transforming complex ideas into functional and elegant solutions.
            </motion.p>
            <motion.p variants={itemVariants}>
              Outside of my studies, I actively participate in coding competitions, open-source projects, and tech meetups to expand my knowledge and collaborate with fellow enthusiasts. I believe in continuous learning and am always eager to explore new technologies and methodologies.
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default About;