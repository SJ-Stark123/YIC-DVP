import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, Telescope, Rocket, Users, Award } from "lucide-react";
import Image from "next/image";

const aboutItems = [
  {
    icon: <Telescope className="w-8 h-8 text-accent" />,
    title: "Expert Mentorship",
    description: "Direct guidance from industry professionals.",
    className: "md:col-span-1",
  },
  {
    icon: <Rocket className="w-8 h-8 text-accent" />,
    title: "Future Ready",
    description: "Equipping students with adaptability.",
    className: "md:col-span-1",
  },
  {
    icon: <BrainCircuit className="w-12 h-12 text-white/80" />,
    title: "Immersive Project-Based Learning",
    description: "Go beyond theory with hands-on projects that solve real-world problems.",
    className: "md:col-span-2 md:row-span-2",
    imageUrl: "https://i.imgur.com/nPrY6ks.jpeg",
    imageHint: "smart irrigation"
  },
  {
    icon: <Users className="w-8 h-8 text-accent" />,
    title: "Collaborative Innovation",
    description: "Work in teams to brainstorm, build, and bring ideas to life.",
    className: "md:col-span-1",
  },
  {
    icon: <Award className="w-8 h-8 text-accent" />,
    title: "High Standards & Success",
    description: "Our members consistently achieve excellence.",
    className: "md:col-span-1",
  },
];

const AboutSection = () => {
  return (
    <section id="about" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Us</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            We are more than just a club; we are a community of creators, thinkers, and innovators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aboutItems.map((item, index) => (
             <Card key={index} className={`group bg-card/50 backdrop-blur-sm border-primary/20 transition-transform hover:-translate-y-2 ${item.className} ${item.imageUrl ? 'relative overflow-hidden' : ''}`}>
             {item.imageUrl ? (
               <>
                 <Image
                   src={item.imageUrl}
                   alt={item.title}
                   fill
                   className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                   data-ai-hint={item.imageHint}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
                 <div className="relative flex flex-col justify-end h-full p-6">
                   <div className="mb-4">{item.icon}</div>
                   <CardTitle className="text-2xl text-white">{item.title}</CardTitle>
                   <CardDescription className="pt-2 text-white/90">{item.description}</CardDescription>
                 </div>
               </>
             ) : (
               <CardHeader>
                 <div className="mb-4">{item.icon}</div>
                 <CardTitle className="text-xl">{item.title}</CardTitle>
                 <CardDescription className="pt-2">{item.description}</CardDescription>
               </CardHeader>
             )}
           </Card>
          ))}
          <Card className="bg-primary/10 backdrop-blur-sm border-primary/20 md:col-span-3">
             <CardHeader className="text-center">
                <CardTitle className="text-2xl">Our Mission</CardTitle>
                <CardDescription className="text-lg text-foreground/80 mt-2 max-w-3xl mx-auto">
                "To cultivate a generation of innovative thinkers by providing a dynamic platform for exploring STEM, fostering creativity, collaboration, and a passion for lifelong learning."
                </CardDescription>
              </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
