"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { MapPin, Mail, Phone, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  message: z.string().min(10, "Message must be at least 10 characters."),
});

const contactInfo = [
  {
    icon: <MapPin className="w-8 h-8 text-accent" />,
    title: "Visit Us",
    details: "Dharmapala Vidyalaya, High Level Rd, Pannipitiya 10230, Sri Lanka",
  },
  {
    icon: <Mail className="w-8 h-8 text-accent" />,
    title: "Email Us",
    details: "innovators@dharmapala.edu.lk",
  },
  {
    icon: <Phone className="w-8 h-8 text-accent" />,
    title: "Call Us",
    details: "+94 112 345 678",
  },
];

const ContactSection = () => {
  const { toast } = useToast();
  const firestore = useFirestore();
  const form = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  async function onSubmit(values: z.infer<typeof contactSchema>) {
    if (!firestore) {
      toast({ variant: 'destructive', title: "Error", description: "Database not available." });
      return;
    }
    
    const submissionsCollection = collection(firestore, 'contact_form_submissions');
    addDocumentNonBlocking(submissionsCollection, {
      ...values,
      submittedAt: serverTimestamp(),
    });

    toast({
      title: "Message Sent!",
      description: "Thanks for reaching out. We'll get back to you soon.",
    });
    form.reset();
  }

  return (
    <section id="contact" className="py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Get In <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Touch</span>
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Have a question or a project idea? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {contactInfo.map((item, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader className="flex flex-row items-center gap-4">
                    {item.icon}
                    <div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription className="text-base">{item.details}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="p-0 rounded-lg overflow-hidden">
                <iframe
                  src="https://maps.google.com/maps?q=Dharmapala%20Vidyalaya%2C%20Pannipitiya&t=k&z=17&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full h-64"
                ></iframe>
              </CardContent>
            </Card>

          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>Shoot us a Message</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="your.email@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us what's on your mind..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity">
                    <Send className="mr-2 h-4 w-4" /> Shoot Message
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
