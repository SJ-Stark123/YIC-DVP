"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Rocket, FileText, Briefcase, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, addDocumentNonBlocking } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";

const joinSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters."),
  grade: z.string().min(1, "Please enter your grade/class."),
  email: z.string().email("Invalid email address."),
  phone: z.string().optional(),
  interestArea: z.enum(["Robotics", "Solar", "Environmental", "Programming", "Design"]),
  reason: z.string().min(10, "Please tell us a bit more about why you want to join."),
  consent: z.boolean().refine(val => val === true, { message: "You must agree to the terms." }),
});

const benefits = [
  { icon: <Rocket className="w-6 h-6 text-primary" />, text: "Hands-on experience with cutting-edge STEM projects." },
  { icon: <FileText className="w-6 h-6 text-primary" />, text: "Receive a certificate of participation and recognition." },
  { icon: <Briefcase className="w-6 h-6 text-primary" />, text: "Build a strong portfolio for your future academic and career goals." },
];

const JoinSection = () => {
  const { toast } = useToast();
  const firestore = useFirestore();

  const form = useForm<z.infer<typeof joinSchema>>({
    resolver: zodResolver(joinSchema),
    defaultValues: { fullName: "", grade: "", email: "", phone: "", reason: "", consent: false },
  });

  async function onSubmit(values: z.infer<typeof joinSchema>) {
    if (!firestore) {
      toast({ variant: 'destructive', title: "Error", description: "Database not available." });
      return;
    }

    const submissionsCollection = collection(firestore, 'applications');
    addDocumentNonBlocking(submissionsCollection, {
      fullName: values.fullName,
      gradeClass: values.grade,
      emailAddress: values.email,
      phoneNumber: values.phone || '',
      interestArea: values.interestArea,
      reasonForJoining: values.reason,
      consentGiven: values.consent,
      submittedAt: serverTimestamp(),
      status: 'pending',
    });

    toast({
      title: "Application Submitted!",
      description: "We've received your application and will be in touch soon.",
    });
    form.reset();
  }

  return (
    <section id="join" className="py-20 sm:py-32 bg-background/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              Why <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Join Us?</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Become part of a community that's shaping the future. Unlock your potential, learn new skills, and make a real-world impact.
            </p>
            <ul className="space-y-6">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full">{benefit.icon}</div>
                  <span className="mt-1">{benefit.text}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle>Enrollment Form</CardTitle>
              <CardDescription>Ready to innovate? Fill out the form below to get started.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="grade" render={({ field }) => (
                      <FormItem><FormLabel>Grade/Class</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="interestArea" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Area of Interest</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select an area" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Robotics">Robotics</SelectItem>
                          <SelectItem value="Solar">Solar Technology</SelectItem>
                          <SelectItem value="Environmental">Environmental Science</SelectItem>
                          <SelectItem value="Programming">Programming</SelectItem>
                          <SelectItem value="Design">Design & 3D Printing</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="reason" render={({ field }) => (
                    <FormItem><FormLabel>Reason for joining</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="consent" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>I agree to the club's code of conduct.</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )} />
                  <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground">Submit Application</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default JoinSection;
