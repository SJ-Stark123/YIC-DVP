'use client';
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { Tutorial } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const TutorialCardSkeleton = () => (
    <Card className="group overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 flex flex-col">
        <CardHeader className="p-0">
            <Skeleton className="h-56 w-full" />
        </CardHeader>
        <CardContent className="p-6 flex-grow">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-5/6 mt-2" />
        </CardContent>
        <CardFooter className="p-6 pt-0">
            <Skeleton className="h-10 w-full" />
        </CardFooter>
    </Card>
);

interface LearnSectionProps {
  onSelectTutorial: (tutorial: Tutorial) => void;
}

const LearnSection = ({ onSelectTutorial }: LearnSectionProps) => {
  const categories: Tutorial['category'][] = ["Beginner", "Intermediate", "Advanced"];
  const firestore = useFirestore();
  const tutorialsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'tutorials') : null, [firestore]);
  const { data: tutorials, isLoading } = useCollection<Tutorial>(tutorialsQuery);

  return (
    <section id="learn" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Learn with <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Us</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Dive into the world of electronics and programming with our hands-on Arduino tutorials.
          </p>
        </div>

        <Tabs defaultValue="Beginner" className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-3">
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
                {isLoading ? (
                    <>
                        <TutorialCardSkeleton />
                        <TutorialCardSkeleton />
                    </>
                ) : (
                    tutorials
                    ?.filter((tutorial) => tutorial.category === category)
                    .map((tutorial) => (
                        <Card key={tutorial.id} className="group overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 flex flex-col">
                            <CardHeader className="p-0">
                                <div className="overflow-hidden relative h-56 w-full">
                                <Image
                                    src={tutorial.imageUrl}
                                    alt={tutorial.title}
                                    data-ai-hint={tutorial.imageHint}
                                    fill
                                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 flex-grow">
                            <CardTitle className="mb-2">{tutorial.title}</CardTitle>
                            <CardDescription>{tutorial.description}</CardDescription>
                            </CardContent>
                            <CardFooter className="p-6 pt-0">
                                <Button variant="outline" className="w-full" onClick={() => onSelectTutorial(tutorial)}>
                                    <BookOpen className="mr-2 h-4 w-4" />
                                    Start Learning
                                </Button>
                            </CardFooter>
                        </Card>
                        ))
                    )
                }
                {!isLoading && tutorials?.filter(t => t.category === category).length === 0 && (
                    <p className="text-muted-foreground md:col-span-3 text-center">No {category.toLowerCase()} tutorials yet.</p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};

export default LearnSection;

    