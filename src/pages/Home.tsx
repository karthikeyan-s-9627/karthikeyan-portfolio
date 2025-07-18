"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Github, Mail, Phone, MapPin, Award, Code, Lightbulb, Briefcase, User, Linkedin, Twitter, Instagram, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { showSuccess } from "@/utils/toast";
import CertificatesCarousel from "@/components/CertificatesCarousel";
import ProjectsSlider from "@/components/ProjectsSlider";
import { supabase } from "@/lib/supabase"; // Import supabase
import { useQuery } from "@tanstack/react-query"; // Import useQuery

// Data for sections (moved from individual pages)
// skillsData will now be fetched from Supabase

const certificatesData = [
  {
    title: "Full Stack Web Development Bootcamp",
    issuer: "Udemy",
    date: "May 2023",
    description: "Comprehensive course covering MERN stack development, including React, Node.js, Express, and MongoDB.",
    link: "#", // Placeholder link
    image: "https://via.placeholder.com/300x200/1A202C/66FCF1?text=Certificate+1",
  },
  {
    title: "Machine Learning Specialization",
    issuer: "Coursera (DeepLearning.AI)",
    date: "August 2023",
    description: "Specialization focused on supervised learning, unsupervised learning, and neural networks.",
    link: "#", // Placeholder link
    image: "https://via.placeholder.com/300x200/1A202C/66FCF1?text=Certificate+2",
  },
  {
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services (AWS)",
    date: "November 2023",
    description: "Foundational understanding of AWS cloud concepts, services, security, architecture, pricing, and support.",
    link: "#", // Placeholder link
    image: "https://via.placeholder.com/300x200/1A202C/66FCF1?text=Certificate+3",
  },
  {
    title: "Data Science with Python",
    issuer: "IBM",
    date: "January 2024",
    description: "Hands-on course covering data analysis, visualization, machine learning, and deep learning using Python.",
    link: "#", // Placeholder link
    image: "https://via.placeholder.com/300x200/1A202C/66FCF1?text=Certificate+4",
  },
  {
    title: "Google Project Management",
    issuer: "Google",
    date: "March 2024",
    description: "Professional certificate covering foundational project management skills, agile methodologies, and Scrum.",
    link: "#", // Placeholder link
    image: "https://via.placeholder.com/300x200/1A202C/66FCF1?text=Certificate+5",
  },
  {
    title: "Cybersecurity Fundamentals",
    issuer: "CompTIA",
    date: "April 2024",
    description: "Introduction to cybersecurity concepts, threats, vulnerabilities, and security controls.",
    link: "#", // Placeholder link
    image: "https://via.placeholder.com/300x200/1A202C/66FCF1?text=Certificate+6",
  },
];

const projectsData = [
  {
    title: "E-commerce Platform",
    description: "A full-stack e-commerce application with user authentication, product listings, shopping cart, and payment integration.",
    technologies: ["React", "Node.js", "Express", "MongoDB", "Stripe", "Tailwind CSS"],
    githubLink: "#", // Placeholder link
    liveLink: "#", // Placeholder link
    image: "https://via.placeholder.com/400x250/1A202C/66FCF1?text=Project+1",
  },
  {
    title: "AI Chatbot Assistant",
    description: "An intelligent chatbot powered by natural language processing, capable of answering queries and performing tasks.",
    technologies: ["Python", "Flask", "OpenAI API", "React", "TypeScript"],
    githubLink: "#", // Placeholder link
    liveLink: "#", // Placeholder link
    image: "https://via.placeholder.com/400x250/1A202C/66FCF1?text=Project+2",
  },
  {
    title: "Personal Blog Site",
    description: "A responsive blog platform with a rich text editor, comment section, and admin panel for content management.",
    technologies: ["Next.js", "TypeScript", "Sanity.io", "GraphQL", "Tailwind CSS"],
    githubLink: "#", // Placeholder link
    liveLink: "#", // Placeholder link
    image: "https://via.placeholder.com/400x250/1A202C/66FCF1?text=Project+3",
  },
  {
    title: "Task Management App",
    description: "A simple and intuitive task management application with drag-and-drop functionality and user-specific dashboards.",
    technologies: ["React", "Redux", "Firebase", "Chakra UI"],
    githubLink: "#", // Placeholder link
    liveLink: "#", // Placeholder link
    image: "https://via.placeholder.com/400x250/1A202C/66FCF1?text=Project+4",
  },
];

const Home = () => {
  const sectionTitleVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.1,
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

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
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

  const skillCardVariants = {
    hidden: { opacity: 0, rotateY: -180 },
    visible: (i: number) => ({
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15,
        delay: i * 0.07,
      },
    }),
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted!");
    showSuccess("Your message has been sent!");
  };

  // Fetch skills data from Supabase
  const { data: skills, isLoading: isLoadingSkills, error: skillsError } = useQuery<Array<{ id: string; category: string; name: string }>, Error>({
    queryKey: ["skills"],
    queryFn: async () => {
      const { data, error } = await supabase.from("skills").select("*").order("category").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Group skills by category for display
  const groupedSkills = React.useMemo(() => {
    if (!skills) return {};
    return skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill.name);
      return acc;
    }, {} as Record<string, string[]>);
  }, [skills]);

  // Map string icons to Lucide components
  const skillCategoryIcons: Record<string, React.ElementType> = {
    "Programming Languages": Code,
    "Frontend Development": Lightbulb,
    "Backend Development": Briefcase,
    "Databases": Code, // Using Code for database, you can change this
    "Tools & Technologies": Briefcase, // Using Briefcase for tools, you can change this
    "Concepts": Lightbulb, // Using Lightbulb for concepts, you can change this
  };


  return (
    <div className="space-y-24 lg:space-y-32">
      {/* Hero Section */}
      <section id="home" className="min-h-[calc(100vh-120px)] flex flex-col lg:flex-row items-center justify-center text-center lg:text-left p-4 pt-20 lg:pt-0">
        <div className="flex-1 flex flex-col items-center lg:items-start justify-center">
          <motion.h1
            className="text-5xl md:text-7xl font-extrabold mb-4 text-foreground drop-shadow-lg"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            Hi, I'm <span className="text-primary">John Doe</span>
          </motion.h1>
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl"
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2, ...itemVariants.visible.transition }}
          >
            A passionate college student building innovative solutions and exploring the frontiers of technology.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <a href="#projects">
              <Button className="w-full sm:w-auto px-8 py-3 text-lg font-semibold rounded-full shadow-lg
                bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300
                hover:scale-105">
                View Projects
              </Button>
            </a>
            <a href="#contact">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg font-semibold rounded-full shadow-lg
                border-primary text-primary hover:bg-primary/10 hover:text-foreground transition-all duration-300
                hover:scale-105">
                Get in Touch
              </Button>
            </a>
          </motion.div>
        </div>
        <motion.div
          className="flex-1 flex justify-center lg:justify-end mt-12 lg:mt-0"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.6 }}
        >
          <img
            src="https://via.placeholder.com/400x400/0000FF/FFFFFF?text=Your+Image" // Placeholder image
            alt="John Doe"
            className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full object-cover
              border-4 border-primary/30
              hover:scale-105 transition-transform duration-500 ease-in-out neon-shadow-primary"
          />
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold mb-8 text-foreground drop-shadow-lg"
          variants={sectionTitleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          About <span className="text-primary">Me</span>
        </motion.h1>

        <motion.div
          className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={cardVariants}>
            <Card className="h-full bg-card shadow-2xl border border-border/50 rounded-xl overflow-hidden
              hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-300"
            >
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-2xl font-bold text-primary mb-2 flex items-center gap-2">
                  <User className="h-6 w-6" /> My Journey So Far
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 text-lg text-muted-foreground leading-relaxed">
                <p className="mb-4">
                  Hello! I'm John Doe, a dedicated and enthusiastic college student with a passion for software development and problem-solving. Currently pursuing a Bachelor's degree in Computer Science, I am constantly seeking opportunities to learn and grow in the ever-evolving tech landscape.
                </p>
                <p className="mb-4">
                  My academic journey has equipped me with a strong foundation in data structures, algorithms, and various programming paradigms. I thrive on challenges and enjoy transforming complex ideas into functional and elegant solutions.
                </p>
                <p>
                  Outside of my studies, I actively participate in coding competitions, open-source projects, and tech meetups to expand my knowledge and collaborate with fellow enthusiasts. I believe in continuous learning and am always eager to explore new technologies and methodologies.
                </p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={cardVariants} className="hidden md:flex items-center justify-center">
            <img
              src="https://via.placeholder.com/400x400/0000FF/FFFFFF?text=About+Image" // Placeholder image for About section
              alt="About John Doe"
              className="w-full max-w-sm rounded-lg object-cover shadow-2xl border-4 border-primary/50
                hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold mb-8 text-foreground drop-shadow-lg"
          variants={sectionTitleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          My <span className="text-primary">Skills</span>
        </motion.h1>

        {isLoadingSkills ? (
          <div className="text-center text-muted-foreground">Loading skills...</div>
        ) : skillsError ? (
          <div className="text-center text-destructive">Error loading skills: {skillsError.message}</div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl [perspective:1200px]"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {Object.entries(groupedSkills).map(([category, skillsList], index) => {
              const IconComponent = skillCategoryIcons[category] || Code; // Default to Code icon
              return (
                <motion.div
                  key={category}
                  variants={skillCardVariants}
                  custom={index}
                  whileHover={{ scale: 1.05, rotateY: 10, z: 40 }}
                  className="[transform-style:preserve-3d]"
                >
                  <Card className="h-full bg-card shadow-2xl border border-border/50 rounded-xl overflow-hidden
                    hover:shadow-primary/50 transition-shadow duration-300"
                  >
                    <CardHeader className="p-6 pb-4 flex flex-row items-center gap-3">
                      {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                      <CardTitle className="text-xl font-bold text-primary">{category}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 flex flex-wrap gap-2">
                      {skillsList.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="px-3 py-1 text-sm rounded-full bg-secondary/80 text-secondary-foreground
                            hover:bg-secondary/100 hover:scale-105 transition-transform duration-200
                            shadow-md hover:shadow-lg border border-primary/20"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>

      {/* Certificates Section */}
      <section id="certificates" className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold mb-8 text-foreground drop-shadow-lg"
          variants={sectionTitleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          My <span className="text-primary">Certificates</span>
        </motion.h1>

        {/* Use the new CertificatesCarousel component */}
        <CertificatesCarousel certificates={certificatesData} />
      </section>

      {/* Projects Section */}
      <section id="projects" className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold mb-12 text-foreground drop-shadow-lg"
          variants={sectionTitleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          My <span className="text-primary">Projects</span>
        </motion.h1>

        <ProjectsSlider projects={projectsData} />
      </section>

      {/* Contact Section */}
      <section id="contact" className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-4">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold mb-8 text-foreground drop-shadow-lg"
          variants={sectionTitleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          Get in <span className="text-primary">Touch</span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl">
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card className="h-full bg-card shadow-2xl border border-border/50 rounded-xl overflow-hidden
              hover:shadow-primary/50 hover:scale-[1.01] transition-all duration-300"
            >
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-2xl font-bold text-primary mb-2">Contact Information</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Feel free to reach out through any of these channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-4 text-lg text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Mail className="h-6 w-6 text-primary" />
                  <a href="mailto:johndoe@example.com" className="hover:text-primary transition-colors">johndoe@example.com</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-primary" />
                  <a href="tel:+11234567890" className="hover:text-primary transition-colors">+1 (123) 456-7890</a>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-6 w-6 text-primary" />
                  <a href="https://www.google.com/maps/search/?api=1&query=Anytown,USA" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Anytown, USA</a>
                </div>
                <div className="flex items-center gap-3">
                  <Linkedin className="h-6 w-6 text-primary" />
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">linkedin.com/in/johndoe</a>
                </div>
                <div className="flex items-center gap-3">
                  <Github className="h-6 w-6 text-primary" />
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">github.com/johndoe</a>
                </div>
                <div className="flex items-center gap-3">
                  <Twitter className="h-6 w-6 text-primary" />
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">twitter.com/johndoe</a>
                </div>
                <div className="flex items-center gap-3">
                  <Instagram className="h-6 w-6 text-primary" />
                  <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">instagram.com/johndoe</a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-6 w-6 text-primary" />
                  <a href="https://wa.me/11234567890" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">WhatsApp</a>
                </div>
                <div className="flex items-center gap-3">
                  <Send className="h-6 w-6 text-primary" />
                  <a href="https://t.me/johndoe" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Telegram</a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <Card className="h-full bg-card shadow-2xl border border-border/50 rounded-xl overflow-hidden
              hover:shadow-primary/50 hover:scale-[1.01] transition-all duration-300"
            >
              <CardHeader className="p-6 pb-4">
                <CardTitle className="text-2xl font-bold text-primary mb-2">Send a Message</CardTitle>
                <CardDescription className="text-muted-foreground">
                  I'll get back to you as soon as possible.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-foreground">Name</Label>
                    <Input id="name" placeholder="Your Name" className="mt-1 bg-input/50 border-border/50 focus:border-primary" />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-foreground">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="mt-1 bg-input/50 border-border/50 focus:border-primary" />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-foreground">Message</Label>
                    <Textarea id="message" placeholder="Your message..." rows={5} className="mt-1 bg-input/50 border-border/50 focus:border-primary" />
                  </div>
                  <div>
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;