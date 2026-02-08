"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Rocket, Users, Award, Calendar } from "lucide-react";
import { FadeIn } from "@/components/fade-in";
import { useState, useEffect } from "react";

const words = ["Innovate", "Create", "Transform", "Build", "Design"];

const HeroSection = () => {
  const stats = [
    { value: "50+", label: "Projects", icon: <Rocket className="w-6 h-6 text-accent" /> },
    { value: "100+", label: "Members", icon: <Users className="w-6 h-6 text-accent" /> },
    { value: "15+", label: "Awards", icon: <Award className="w-6 h-6 text-accent" /> },
    { value: "5+", label: "Years Strong", icon: <Calendar className="w-6 h-6 text-accent" /> },
  ];

  const [wordIndex, setWordIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    const typeSpeed = isDeleting ? 75 : 150;

    const handleTyping = () => {
      if (isDeleting) {
        setText(currentWord.substring(0, text.length - 1));
      } else {
        setText(currentWord.substring(0, text.length + 1));
      }

      if (!isDeleting && text === currentWord) {
        // Pause at end of word
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      }
    };

    const typingTimeout = setTimeout(handleTyping, typeSpeed);

    return () => clearTimeout(typingTimeout);
  }, [text, isDeleting, wordIndex]);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 pb-12">
      <div className="container mx-auto px-4 text-center">
        <FadeIn>
          <Badge variant="outline" className="mb-6 py-2 px-4 border-primary/50 text-primary bg-primary/10">
            Innovation Club 2025 • Dharmapala Vidyalaya
          </Badge>
        </FadeIn>
        
        <FadeIn className="delay-200">
           <div className="text-4xl sm:text-5xl md:text-6xl font-bold h-20 mb-0">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary pr-1">
              {text}
            </span>
            <span className="animate-typing-cursor text-accent">|</span>
          </div>
        </FadeIn>

        <FadeIn className="delay-300">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              The Future.
            </span>
          </h1>
        </FadeIn>
        
        <FadeIn className="delay-400">
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground mb-10">
            Where young minds build tomorrow through STEM innovation, creative problem-solving, and collaborative learning.
          </p>
        </FadeIn>

        <FadeIn className="delay-600">
          <div className="flex justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Join Our Club <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Explore Projects
            </Button>
          </div>
        </FadeIn>
        
        <FadeIn className="delay-800">
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                {stat.icon}
                <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default HeroSection;