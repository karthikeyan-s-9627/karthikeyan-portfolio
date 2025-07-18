"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, rotateX: 90, transformOrigin: "bottom" },
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
      className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1
        className="text-5xl md:text-7xl font-extrabold mb-4 text-foreground drop-shadow-lg"
        variants={itemVariants}
      >
        Hi, I'm <span className="text-primary">John Doe</span>
      </motion.h1>
      <motion.p
        className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl"
        variants={itemVariants}
      >
        A passionate college student building innovative solutions and exploring the frontiers of technology.
      </motion.p>

      <motion.div
        className="perspective-1000"
        variants={itemVariants}
      >
        <Card className="w-full max-w-md mx-auto bg-card/70 backdrop-blur-md shadow-2xl border border-border/50 rounded-xl overflow-hidden
          hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-500 ease-in-out
          hover:rotate-x-3 hover:rotate-y-3 transform-gpu"
        >
          <CardHeader className="p-6">
            <CardTitle className="text-3xl font-bold text-primary mb-2">Welcome to My Portfolio</CardTitle>
            <CardDescription className="text-muted-foreground">
              Explore my journey, projects, and skills.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              <Link to="/projects">
                <Button className="w-full sm:w-auto px-8 py-3 text-lg font-semibold rounded-full shadow-lg
                  bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300
                  hover:shadow-primary/70 hover:scale-105 glow-button">
                  View Projects
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg font-semibold rounded-full shadow-lg
                  border-primary text-primary hover:bg-primary/10 transition-all duration-300
                  hover:shadow-primary/30 hover:scale-105 glow-button-outline">
                  Get in Touch
                </Button>
              </Link>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Home;