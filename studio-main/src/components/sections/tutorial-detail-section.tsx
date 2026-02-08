'use client';

import { useState, useEffect } from 'react';
import type { Tutorial } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Video } from 'lucide-react';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, orderBy, query } from 'firebase/firestore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface TutorialDetailSectionProps {
  tutorial: Tutorial;
  onBack: () => void;
}

const TutorialDetailSection = ({ tutorial: initialTutorial, onBack }: TutorialDetailSectionProps) => {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial>(initialTutorial);

  const firestore = useFirestore();
  const tutorialsQuery = useMemoFirebase(() => 
    firestore 
      ? query(collection(firestore, 'tutorials'), orderBy('title')) 
      : null, 
    [firestore]
  );
  const { data: allTutorials, isLoading: isLoadingTutorials } = useCollection<Tutorial>(tutorialsQuery);

  useEffect(() => {
    setActiveTutorial(initialTutorial);
    window.scrollTo(0, 0);
  }, [initialTutorial]);
  
  const getEmbedUrl = (url: string) => {
    try {
      const urlObject = new URL(url);
      if (urlObject.hostname.includes('youtube.com') && urlObject.pathname.includes('watch')) {
        const videoId = urlObject.searchParams.get('v');
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (urlObject.hostname.includes('youtu.be')) {
        const videoId = urlObject.pathname.slice(1);
        return `https://www.youtube.com/embed/${videoId}`;
      }
    } catch (e) {
      return url;
    }
    return url;
  };

  const hasVideo = activeTutorial.videoUrl && activeTutorial.videoUrl.trim() !== '';
  const hasBlueprint = activeTutorial.blueprintUrl && activeTutorial.blueprintUrl.trim() !== '';

  return (
    <section id="tutorial-hub" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <Button 
          onClick={onBack} 
          variant="ghost" 
          className="mb-8 text-muted-foreground hover:bg-transparent hover:text-primary hover:[text-shadow:0_0_8px_hsl(var(--primary))]"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Categories
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Tutorial List */}
          <div className="lg:col-span-1">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20 sticky top-24">
                <CardHeader>
                    <CardTitle className='text-xl'>All Tutorials</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-[60vh] -mx-6 px-4">
                        <div className="flex flex-col gap-1">
                            {isLoadingTutorials && (
                                <div className='space-y-2'>
                                    <Skeleton className="h-9 w-full" />
                                    <Skeleton className="h-9 w-full" />
                                    <Skeleton className="h-9 w-full" />
                                    <Skeleton className="h-9 w-full" />
                                </div>
                            )}
                            {allTutorials?.map(tut => (
                                <Button
                                    key={tut.id}
                                    variant={activeTutorial.id === tut.id ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start text-left h-auto py-2 px-2 transition-all transform",
                                        "hover:bg-transparent hover:text-primary hover:[text-shadow:0_0_8px_hsl(var(--primary))] hover:scale-105",
                                        activeTutorial.id === tut.id && "text-primary [text-shadow:0_0_8px_hsl(var(--primary))] scale-105"
                                    )}
                                    onClick={() => setActiveTutorial(tut)}
                                >
                                    {tut.title}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
          </div>

          {/* Right Column: Tutorial Content */}
          <div className="lg:col-span-3">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <p className="text-sm text-accent font-semibold">{activeTutorial.category}</p>
                <CardTitle className="text-3xl font-bold tracking-tight sm:text-4xl">{activeTutorial.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {hasVideo ? (
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-border">
                    <iframe
                      width="100%"
                      height="100%"
                      src={getEmbedUrl(activeTutorial.videoUrl!)}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      key={activeTutorial.id} // Re-mount iframe when tutorial changes
                    ></iframe>
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Video className="w-16 h-16 mx-auto" />
                      <p className="mt-2">No video available</p>
                    </div>
                  </div>
                )}
                
                <div className="prose prose-invert max-w-none mt-8 text-foreground/80 space-y-4">
                  <h3 className="text-xl font-semibold text-foreground">About this tutorial</h3>
                  <p>{activeTutorial.description}</p>
                  {activeTutorial.longDescription && <p>{activeTutorial.longDescription}</p>}
                </div>
                
                {hasBlueprint ? (
                    <Button asChild className="w-full sm:w-auto mt-6">
                        <a href={activeTutorial.blueprintUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Download Blueprint
                        </a>
                    </Button>
                ) : (
                     <Button disabled className="w-full sm:w-auto mt-6">
                        <Download className="mr-2 h-4 w-4" />
                        No Blueprint Available
                    </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TutorialDetailSection;
