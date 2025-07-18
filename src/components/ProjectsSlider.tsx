"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ExternalLink, Github } from 'lucide-react';

type Project = {
  title: string;
  description: string;
  technologies: string[];
  githubLink?: string;
  liveLink?: string;
  image: string;
};

interface ProjectsSliderProps {
  projects: Project[];
}

const ProjectsSlider: React.FC<ProjectsSliderProps> = ({ projects }) => {
  // Duplicate projects for a seamless, infinite loop
  const duplicatedProjects = [...projects, ...projects];

  return (
    <div className="w-full overflow-hidden continuous-scroll-container">
      <div className="flex continuous-scroll-content">
        {duplicatedProjects.map((project, index) => (
          <div className="project-slide" key={index}>
            <Card className="h-full bg-card/80 backdrop-blur-sm shadow-2xl border border-border/50 rounded-xl overflow-hidden flex flex-col
              hover:shadow-primary/50 hover:scale-[1.02] transition-all duration-300">
              <div className="relative h-[60%]">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between flex-grow p-6">
                <div>
                  <CardTitle className="text-2xl font-bold text-primary mb-2">{project.title}</CardTitle>
                  <CardDescription className="text-muted-foreground mb-4">{project.description}</CardDescription>
                </div>
                <div className="flex gap-3 mt-auto">
                  {project.githubLink && (
                    <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Github className="mr-2 h-4 w-4" /> GitHub
                      </Button>
                    </a>
                  )}
                  {project.liveLink && (
                    <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsSlider;