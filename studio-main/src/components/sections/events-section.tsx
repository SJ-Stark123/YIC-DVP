'use client';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin } from "lucide-react";
import Marquee from "@/components/marquee";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, orderBy, query, limit } from "firebase/firestore";
import type { Event } from "@/lib/types";
import { format } from "date-fns";
import { Skeleton } from "../ui/skeleton";


const EventCardSkeleton = () => (
    <Card className="mt-6 bg-card/50 backdrop-blur-sm border-primary/20">
        <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-5 w-1/2" />
        </CardContent>
    </Card>
);

const EventsSection = () => {
  const marqueeContent = Array(5).fill("Registration for the Annual Science Fair is now OPEN!").join(" • ");
  const firestore = useFirestore();
  
  const eventsQuery = useMemoFirebase(() => 
    firestore 
      ? query(collection(firestore, 'events'), orderBy('date', 'desc'), limit(5)) 
      : null, 
    [firestore]
  );
  const { data: events, isLoading } = useCollection<Event>(eventsQuery);

  return (
    <section id="events" className="py-20 sm:py-32 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-12 py-3 bg-primary/10 border-y border-primary/20 overflow-hidden">
          <Marquee>
            <div className="text-primary font-semibold">{marqueeContent}</div>
          </Marquee>
        </div>
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Club <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Happenings</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Stay up-to-date with our latest events, workshops, and meetings.
          </p>
        </div>

        <Tabs defaultValue="upcoming" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="schedule">Club Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming">
            {isLoading && <EventCardSkeleton />}
            {!isLoading && events?.map(event => (
                <Card key={event.id} className="mt-6 bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-2xl text-accent">{event.title}</CardTitle>
                        <CardDescription>{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span><span className="font-semibold">Date:</span> {format(event.date.toDate(), 'PPP')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <span><span className="font-semibold">Time:</span> {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <span><span className="font-semibold">Location:</span> {event.location}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
             {!isLoading && (!events || events.length === 0) && (
                <p className="text-muted-foreground p-4 text-center mt-6">No upcoming events scheduled.</p>
            )}
          </TabsContent>
          <TabsContent value="schedule">
            <Card className="mt-6 bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle>Weekly Club Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Mondays:</strong> Robotics Group Meeting (14:00 - 16:00)</li>
                  <li><strong>Tuesdays:</strong> Programming & Design Session (14:00 - 16:00)</li>
                  <li><strong>Wednesdays:</strong> Open Lab Hours (13:00 - 15:00)</li>
                  <li><strong>Thursdays:</strong> Environmental & Solar Projects (14:00 - 16:00)</li>
                  <li><strong>First Friday of Month:</strong> General Meeting</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default EventsSection;
    