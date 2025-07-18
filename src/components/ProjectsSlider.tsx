"use client";

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel, { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel-react';
import { motion } from 'framer-motion';
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
  options?: EmblaOptionsType;
}

const TWEEN_FACTOR = 1.2;

const numberWithinRange = (number: number, min: number, max: number): number =>
  Math.min(Math.max(number, min), max);

const ProjectsSlider: React.FC<ProjectsSliderProps> = ({ projects, options }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ ...options, loop: true });
  const [tweenValues, setTweenValues] = useState<number[]>([]);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;

    const engine = emblaApi.internalEngine();
    const scrollProgress = emblaApi.scrollProgress();

    const getTweenValues = (emblaApi: EmblaCarouselType) => {
      return emblaApi.scrollSnapList().map((scrollSnap, index) => {
        let diffToTarget = scrollSnap - scrollProgress;

        if (engine.options.loop) {
          engine.slideLooper.loopPoints.forEach((loopItem) => {
            const target = loopItem.target();
            if (index === loopItem.index && target !== 0) {
              const sign = Math.sign(target);
              if (sign === -1) diffToTarget = scrollSnap - (1 + scrollProgress);
              if (sign === 1) diffToTarget = scrollSnap + (1 - scrollProgress);
            }
          });
        }
        const tweenValue = 1 - Math.abs(diffToTarget * TWEEN_FACTOR);
        return numberWithinRange(tweenValue, 0, 1);
      });
    };

    setTweenValues(getTweenValues(emblaApi));
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll();
    emblaApi.on('scroll', onScroll).on('reInit', onScroll);
  }, [emblaApi, onScroll]);

  return (
    <div className="embla w-full">
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {projects.map((project, index) => (
            <div className="embla__slide" key={index}>
              <motion.div
                style={{
                  scale: tweenValues[index] ? 0.8 + tweenValues[index] * 0.2 : 0.8,
                  opacity: tweenValues[index] ? 0.5 + tweenValues[index] * 0.5 : 0.5,
                }}
                className="h-full w-full transition-transform duration-200 ease-out"
              >
                <Card className="h-full bg-card/80 backdrop-blur-sm shadow-2xl border border-border/50 rounded-xl overflow-hidden flex flex-col">
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
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsSlider;