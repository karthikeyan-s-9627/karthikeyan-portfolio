"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ExternalLink, Github } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Project = {
  title: string;
  description: string;
  technologies: string[];
  github_link?: string;
  live_link?: string;
  image: string;
};

interface ProjectsSliderProps {
  projects: Project[];
}

const ProjectsSlider: React.FC<ProjectsSliderProps> = ({ projects }) => {
  // Duplicate projects for a seamless, infinite loop
  const duplicatedProjects = [...projects, ...projects];

  const formatUrl = (url?: string): string => {
    if (!url) return '#';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  return (
    <div className="w-full overflow-hidden continuous-scroll-container">
      <div className="flex continuous-scroll-content">
        {duplicatedProjects.map((project, index) => (
          <div className="project-slide" key={index}>
            <Card className="h-full bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl overflow-hidden flex flex-col
              shadow-[0_20px_40px_-10px_rgba(0,0,0,0.6)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:shadow-[0_30px_60px_-15px_hsl(var(--primary)/0.6)] hover:scale-[1.02] transition-all duration-300">
              <div className="relative h-[250px]">
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
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies?.map((tech) => (
                      <Badge key={tech} variant="secondary" className="px-3 py-1 text-sm rounded-full bg-secondary/80 text-secondary-foreground shadow-md border border-primary/20">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 mt-auto">
                  {project.github_link && (
                    <a href={formatUrl(project.github_link)} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Github className="mr-2 h-4 w-4" /> View Source
                      </Button>
                    </a>
                  )}
                  {project.live_link && (
                    <a href={formatUrl(project.live_link)} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full">
                        <ExternalLink className="mr-2 h-4 w-4" /> Live Link
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