'use client';

import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { Project, Event } from "@/lib/types";
import HeroSection from '@/components/sections/hero-section';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import Image from "next/image";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeIn } from "@/components/fade-in";
import AboutSection from "./about-section";

const RecentItemSkeleton = () => (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 h-full flex flex-col">
        <CardHeader>
            <Skeleton className="h-8 w-1/2" />
        </CardHeader>
        <CardContent className="flex-grow">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-5 w-3/4 mt-4" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-5/6 mt-2" />
        </CardContent>
        <CardFooter>
            <Skeleton className="h-10 w-1/3" />
        </CardFooter>
    </Card>
);


export default function HomeContent({ onTabChange }: { onTabChange: (tabId: string) => void }) {
    const firestore = useFirestore();

    const recentProjectQuery = useMemoFirebase(() =>
        firestore
            ? query(collection(firestore, 'projects'), orderBy('createdAt', 'desc'), limit(1))
            : null,
        [firestore]
    );

    const recentEventQuery = useMemoFirebase(() =>
        firestore
            ? query(collection(firestore, 'events'), orderBy('createdAt', 'desc'), limit(1))
            : null,
        [firestore]
    );

    const { data: recentProjects, isLoading: isLoadingProjects } = useCollection<Project>(recentProjectQuery);
    const { data: recentEvents, isLoading: isLoadingEvents } = useCollection<Event>(recentEventQuery);

    const recentProject = recentProjects?.[0];
    const recentEvent = recentEvents?.[0];

    return (
        <>
            <HeroSection />
            <FadeIn>
                <section className="py-20 sm:py-24">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight mb-8">
                                    Latest <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Project</span>
                                </h2>
                                {isLoadingProjects ? (
                                    <RecentItemSkeleton />
                                ) : recentProject ? (
                                    <Card className="group overflow-hidden bg-card/50 backdrop-blur-sm border-primary/20 h-full flex flex-col">
                                        <CardHeader className="p-0">
                                            <div className="overflow-hidden relative h-56 w-full">
                                                <Image
                                                    src={recentProject.imageUrl}
                                                    alt={recentProject.title}
                                                    fill
                                                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                                                />
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 flex-grow">
                                            <CardTitle className="mb-2">{recentProject.title}</CardTitle>
                                            <CardDescription>{recentProject.description}</CardDescription>
                                        </CardContent>
                                        <CardFooter className="p-6 pt-0">
                                            <Button variant="outline" onClick={() => onTabChange('projects')}>
                                                View All Projects <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ) : (
                                    <div className="border rounded-md flex items-center justify-center h-full min-h-[200px]">
                                        <p className="text-muted-foreground p-4 text-center">No projects found.</p>
                                    </div>
                                )}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight mb-8">
                                    Most Recent <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Event</span>
                                </h2>
                                {isLoadingEvents ? (
                                    <RecentItemSkeleton />
                                ) : recentEvent ? (
                                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20 h-full flex flex-col">
                                        <CardHeader>
                                            <CardTitle className="text-2xl text-accent">{recentEvent.title}</CardTitle>
                                            <CardDescription>{recentEvent.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="grid grid-cols-1 gap-4 text-sm flex-grow">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-5 h-5 text-primary" />
                                                <span><span className="font-semibold">Date:</span> {format(recentEvent.date.toDate(), 'PPP')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-5 h-5 text-primary" />
                                                <span><span className="font-semibold">Time:</span> {recentEvent.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-5 h-5 text-primary" />
                                                <span><span className="font-semibold">Location:</span> {recentEvent.location}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="p-6 pt-0">
                                             <Button variant="outline" onClick={() => onTabChange('events')}>View All Events</Button>
                                        </CardFooter>
                                    </Card>
                                ) : (
                                    <div className="border rounded-md flex items-center justify-center h-full min-h-[200px]">
                                        <p className="text-muted-foreground p-4 text-center">No recent events found.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </FadeIn>
            <FadeIn>
                <AboutSection />
            </FadeIn>
        </>
    );
}
