"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const Contact = () => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, you would send this data to a backend service
    console.log("Form submitted!");
    showSuccess("Your message has been sent!");
    // You might want to clear the form here
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
        Get in <span className="text-primary">Touch</span>
      </motion.h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
        <motion.div
          className="perspective-1000"
          variants={itemVariants}
        >
          <Card className="h-full bg-card/70 backdrop-blur-md shadow-2xl border border-border/50 rounded-xl overflow-hidden
            hover:shadow-primary/50 hover:scale-[1.01] transition-all duration-500 ease-in-out
            hover:rotate-x-2 hover:rotate-y-2 transform-gpu"
          >
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-2xl font-bold text-primary mb-2">Contact Information</CardTitle>
              <CardDescription className="text-muted-foreground">
                Feel free to reach out through any of these channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4 text-lg text-muted-foreground">
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <Mail className="h-6 w-6 text-primary" />
                <span>johndoe@example.com</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <Phone className="h-6 w-6 text-primary" />
                <span>+1 (123) 456-7890</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-primary" />
                <span>Anytown, USA</span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="perspective-1000"
          variants={itemVariants}
        >
          <Card className="h-full bg-card/70 backdrop-blur-md shadow-2xl border border-border/50 rounded-xl overflow-hidden
            hover:shadow-primary/50 hover:scale-[1.01] transition-all duration-500 ease-in-out
            hover:rotate-x-2 hover:rotate-y-2 transform-gpu"
          >
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-2xl font-bold text-primary mb-2">Send a Message</CardTitle>
              <CardDescription className="text-muted-foreground">
                I'll get back to you as soon as possible.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={itemVariants}>
                  <Label htmlFor="name" className="text-foreground">Name</Label>
                  <Input id="name" placeholder="Your Name" className="mt-1 bg-input/50 border-border/50 focus:border-primary" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" className="mt-1 bg-input/50 border-border/50 focus:border-primary" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Label htmlFor="message" className="text-foreground">Message</Label>
                  <Textarea id="message" placeholder="Your message..." rows={5} className="mt-1 bg-input/50 border-border/50 focus:border-primary" />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <Button type="submit" className="w-full glow-button">
                    Send Message
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;