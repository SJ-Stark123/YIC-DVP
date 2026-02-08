'use client';
import Image from "next/image";
import { Card, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { TeamMember } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const TeamMemberCardSkeleton = () => (
    <Card className="text-center bg-card/50 backdrop-blur-sm border-primary/20 pt-6">
        <CardContent>
            <Skeleton className="w-32 h-32 mx-auto rounded-full mb-4" />
            <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
        </CardContent>
    </Card>
);

const TeamSection = () => {
    const firestore = useFirestore();
    const teamQuery = useMemoFirebase(() => firestore ? collection(firestore, 'team_members') : null, [firestore]);
    const { data: teamMembers, isLoading } = useCollection<TeamMember>(teamQuery);

  return (
    <section id="team" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Our <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Leadership</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Meet the dedicated team guiding the Young Innovators Club to success.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {isLoading ? (
            Array.from({ length: 7 }).map((_, i) => <TeamMemberCardSkeleton key={i} />)
          ) : (
            teamMembers?.map((member) => (
              <Card key={member.id} className="text-center bg-card/50 backdrop-blur-sm border-primary/20 pt-6">
                <CardContent>
                  <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-primary/50 mb-4">
                      <Image
                        src={member.imageUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <CardDescription className="text-accent">{member.role}</CardDescription>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
    