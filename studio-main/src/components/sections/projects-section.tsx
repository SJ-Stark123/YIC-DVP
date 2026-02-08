'use client';
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Project } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const ProjectCardSkeleton = () => (
  <Card className="overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20">
    <Skeleton className="h-56 w-full" />
    <CardContent className="p-6">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full mt-2" />
    </CardContent>
    <CardFooter className="p-6 pt-0">
      <Skeleton className="h-10 w-full" />
    </CardFooter>
  </Card>
);

const ProjectsSection = () => {
  const firestore = useFirestore();
  const projectsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'projects') : null, [firestore]);
  const { data: projects, isLoading } = useCollection<Project>(projectsQuery);

  return (
    <section id="projects" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Innovation Lab <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Projects</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Explore some of the groundbreaking projects designed and built by our members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </>
          ) : (
            projects?.map((project) => (
              <Card key={project.id} className="group overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader className="p-0">
                  <div className="overflow-hidden relative h-56 w-full">
                      <Image
                        src={project.imageUrl}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                      />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <CardTitle className="mb-2">{project.title}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={project.detailsUrl} target="_blank" rel="noopener noreferrer">
                      View Details <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;
    