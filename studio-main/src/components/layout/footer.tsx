"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Github, Twitter, Instagram, Send } from 'lucide-react';
import Marquee from '@/components/marquee';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const newsletterSchema = z.object({
  email: z.string().email("Invalid email address."),
});


const Footer = () => {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onNewsletterSubmit = (values: z.infer<typeof newsletterSchema>) => {
    if (!firestore) {
      toast({ variant: 'destructive', title: "Error", description: "Database not available." });
      return;
    }
    
    const subscribersCollection = collection(firestore, 'subscribers');
    addDocumentNonBlocking(subscribersCollection, {
      ...values,
      subscribedAt: serverTimestamp(),
    });

    toast({
      title: "Subscribed!",
      description: "Thanks for subscribing to our newsletter.",
    });
    form.reset();
  }


  const quickLinks = [
    { href: '#about', text: 'About' },
    { href: '#projects', text: 'Projects' },
    { href: '#team', text: 'Team' },
    { href: '#events', text: 'Events' },
  ];

  const socialLinks = [
    { href: '#', icon: <Twitter className="h-5 w-5" /> },
    { href: '#', icon: <Github className="h-5 w-5" /> },
    { href: '#', icon: <Instagram className="h-5 w-5" /> },
  ];

  const marqueeContent = Array(10).fill("✨ Cultivating future innovators").join(" • ");

  return (
    <footer className="bg-background/80 border-t border-border/50 backdrop-blur-sm mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Innovators Hub</h3>
            <p className="text-muted-foreground mb-4 max-w-md">Subscribe to our newsletter to get the latest updates on our projects, events, and workshops.</p>
            <form onSubmit={form.handleSubmit(onNewsletterSubmit)} className="flex gap-2 max-w-sm">
              <Input type="email" placeholder="Enter your email" className="bg-background/50" {...form.register("email")} />
              <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {form.formState.errors.email && <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.email.message}</p>}
          </div>
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <Button key={index} variant="outline" size="icon" asChild>
                  <a href={social.href} target="_blank" rel="noopener noreferrer">
                    {social.icon}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 text-center text-muted-foreground text-sm">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} Young Innovation Club, Dharmapala Vidyalaya Pannipitiya. All Rights Reserved.</p>
        </div>
      </div>
      <Marquee>
        <div className="py-2 text-sm text-muted-foreground">{marqueeContent}</div>
      </Marquee>
    </footer>
  );
};

export default Footer;
