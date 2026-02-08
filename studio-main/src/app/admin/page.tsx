

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useDoc, useCollection, useFirestore, useStorage, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { collection, doc, serverTimestamp, query, where, getDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import type { EnrollmentFormSubmission, ContactFormSubmission, Subscriber, Project, TeamMember, Event, GalleryItem, Tutorial, Member, AdminAccess } from '@/lib/types';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, PlusCircle, Calendar as CalendarIcon, User as UserIcon, MoreHorizontal, Eye, Printer } from 'lucide-react';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import QRCode from 'react-qr-code';

// Schemas for validation
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.any().refine(val => val, "Image is required."),
  detailsUrl: z.string().url('Invalid URL'),
});

const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  imageUrl: z.any().optional(),
});

const eventSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    location: z.string().min(1, 'Location is required'),
    time: z.string().min(1, 'Time is required'),
    date: z.date({ required_error: 'A date is required.' }),
});

const galleryItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  imageUrl: z.any().refine(val => val, "Image is required."),
});

const tutorialSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    longDescription: z.string().optional(),
    category: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    imageUrl: z.any().refine(val => val, "Image is required."),
    imageHint: z.string().optional(),
    videoUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
    blueprintUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
});

function PrintableLearnSectionLink() {
  const [url, setUrl] = useState('');
  
  useEffect(() => {
    setUrl(window.location.origin);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!url) return null;

  return (
      <Card className="mt-6 bg-card/50 backdrop-blur-sm border-primary/20 printable-container">
        <div className="printable-area">
          <CardHeader>
            <CardTitle>Shareable Link to Learn Section</CardTitle>
            <CardDescription>Print this section and share the QR code or link with students.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <div className="p-2 bg-white rounded-md">
              <QRCode value={url} size={128} />
            </div>
            <div className="flex-grow space-y-2">
              <p className="font-semibold text-lg">Link to Learning Portal:</p>
              <Input readOnly value={url} className="font-mono"/>
              <p className="text-xs text-muted-foreground">Students will land on the homepage and can navigate to the 'Learn' tab.</p>
            </div>
          </CardContent>
        </div>
        <CardFooter className="no-print justify-end">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2" />
              Print QR Code & Link
            </Button>
        </CardFooter>
      </Card>
  );
}


function AdminDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState('projects');
  const [viewingApplication, setViewingApplication] = useState<EnrollmentFormSubmission | null>(null);

  const applicationsQuery = useMemoFirebase(() => (firestore && user) ? query(collection(firestore, 'applications'), where('status', '==', 'pending')) : null, [firestore, user]);
  const contactsQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'contact_form_submissions') : null, [firestore, user]);
  const subscribersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'subscribers') : null, [firestore, user]);
  const membersQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'yic_members_details') : null, [firestore, user]);

  const { data: applications, isLoading: isLoadingApplications } = useCollection<EnrollmentFormSubmission>(applicationsQuery);
  const { data: contacts, isLoading: isLoadingContacts } = useCollection<ContactFormSubmission>(contactsQuery);
  const { data: subscribers, isLoading: isLoadingSubscribers } = useCollection<Subscriber>(subscribersQuery);
  const { data: members, isLoading: isLoadingMembers } = useCollection<Member>(membersQuery);

  const handleAddTestApplication = () => {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Firestore not available',
      });
      return;
    }

    const testApplication = {
      fullName: 'John Doe (Test)',
      gradeClass: '12',
      emailAddress: 'johndoe.test@example.com',
      phoneNumber: '123-456-7890',
      interestArea: 'Robotics',
      reasonForJoining: 'This is a test application to check the approval workflow.',
      consentGiven: true,
      submittedAt: serverTimestamp(),
      status: 'pending',
    };

    addDocumentNonBlocking(collection(firestore, 'applications'), testApplication);

    toast({
      title: 'Test Application Sent',
      description: 'A test application has been added to the queue.',
    });
  };

  const handleSeedDatabase = () => {
    if (!firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
      return;
    }
    setIsSeeding(true);

    try {
      // Team Members
      const teamMembers = PlaceHolderImages.filter(p => p.id.startsWith('team-'));
      for (const member of teamMembers) {
        const memberData = {
          name: member.description.split(',')[0],
          role: member.description.split(',')[1]?.trim() || 'Member',
          imageUrl: member.imageUrl
        };
        const docRef = doc(firestore, 'team_members', member.id);
        setDocumentNonBlocking(docRef, memberData, { merge: true });
      }

      // Projects
      const projects = PlaceHolderImages.filter(p => p.id.startsWith('project-'));
      for (const project of projects) {
        const projectData = {
          title: project.description,
          description: 'A brief description of this innovative project goes here. Discover the challenges we overcame and the technology we used.',
          imageUrl: project.imageUrl,
          detailsUrl: '#',
          createdAt: serverTimestamp()
        };
        const docRef = doc(firestore, 'projects', project.id);
        setDocumentNonBlocking(docRef, projectData, { merge: true });
      }

      // Gallery Items
      const galleryItems = PlaceHolderImages.filter(p => p.id.startsWith('gallery-'));
      for (const item of galleryItems) {
        const galleryData = {
          title: item.description,
          imageUrl: item.imageUrl
        };
        const docRef = doc(firestore, 'gallery_items', item.id);
        setDocumentNonBlocking(docRef, galleryData, { merge: true });
      }

      // Tutorials
      const tutorials = PlaceHolderImages.filter(p => p.id.startsWith('learn-'));
      const categories = ['Beginner', 'Intermediate', 'Advanced'];
      let i = 0;
      for (const item of tutorials) {
        const tutorialData = {
          title: item.description,
          description: 'Dive into this tutorial to expand your skills and knowledge in the world of technology and innovation.',
          longDescription: 'This is a more detailed description of the tutorial. It covers the objectives, materials required, and step-by-step instructions to complete the project. This section can be as long as needed to provide comprehensive guidance.',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          blueprintUrl: '#',
          category: categories[i % categories.length],
          imageUrl: item.imageUrl,
          imageHint: item.imageHint
        };
        const docRef = doc(firestore, 'tutorials', item.id);
        setDocumentNonBlocking(docRef, tutorialData, { merge: true });
        i++;
      }

      // Events
      const eventsData = [
        { id: 'event-1', title: 'Annual Science Fair', date: new Date('2024-10-26'), time: '9:00 AM - 3:00 PM', location: 'Main Auditorium', description: 'Showcasing the best and brightest projects from our members.', createdAt: serverTimestamp() },
        { id: 'event-2', title: 'Robotics Workshop', date: new Date('2024-11-15'), time: '1:00 PM - 4:00 PM', location: 'Tech Lab', description: 'A hands-on workshop on building and programming robots.', createdAt: serverTimestamp() }
      ];
      for (const event of eventsData) {
        const docRef = doc(firestore, 'events', event.id);
        setDocumentNonBlocking(docRef, event, { merge: true });
      }

      toast({ title: 'Success', description: 'Database has been seeded with sample data.' });
    } catch (error: any) {
      console.error("Seeding failed", error);
      toast({ variant: 'destructive', title: 'Seeding Failed', description: error.message || 'An unknown error occurred.' });
    } finally {
      setIsSeeding(false);
    }
  };


  const handleApproval = (applicationId: string, userData: Omit<Member, 'id' | 'joinedAt'>) => {
    if (!firestore) return;

    // 1. Use setDoc to add the userData to a collection called yic_members_details.
    addDocumentNonBlocking(collection(firestore, 'yic_members_details'), {
      ...userData,
      joinedAt: serverTimestamp(),
    });

    // 2. Use updateDoc to change the status in the applications collection to approved.
    const appRef = doc(firestore, 'applications', applicationId);
    updateDocumentNonBlocking(appRef, { status: 'approved' });

    // 3. Alert with a message
    toast({
      title: 'Application Approved!',
      description: `${userData.fullName} has been added as a member.`,
    });
  };

  const handleRejection = (applicationId: string) => {
    if (!firestore) return;
    const appRef = doc(firestore, 'applications', applicationId);
    updateDocumentNonBlocking(appRef, { status: 'rejected' });
    toast({
      title: 'Application Rejected',
      description: 'The application has been marked as rejected.',
      variant: 'destructive',
    });
  };

  const applicationColumns: { key: keyof EnrollmentFormSubmission, label: string }[] = [
    { key: 'fullName', label: 'Name' },
  ];

  const contactColumns: { key: keyof ContactFormSubmission, label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'message', label: 'Message' },
  ];

  const subscriberColumns: { key: keyof Subscriber, label: string }[] = [
    { key: 'email', label: 'Email' },
  ];

  const memberColumns: { key: keyof Member, label: string }[] = [
    { key: 'fullName', label: 'Full Name' },
    { key: 'gradeClass', label: 'Grade' },
    { key: 'emailAddress', label: 'Email' },
    { key: 'interestArea', label: 'Interest' },
  ];
  
  const imageFormField = (form: any, uploadProgress: number | null) => (
    <FormField
      control={form.control}
      name="imageUrl"
      render={({ field: { onChange, value } }) => (
        <FormItem>
          <FormLabel>Image</FormLabel>
          {value && typeof value === 'string' && (
            <div className="my-2 w-24 h-24 relative">
              <Image src={value} alt="Current image" fill className="rounded-md object-cover" />
            </div>
          )}
          <FormControl>
            <Input
              type="file"
              accept="image/png, image/jpeg, image/gif"
              onChange={(e) => onChange(e.target.files?.[0])}
            />
          </FormControl>
          <FormDescription>
            {value instanceof File ? `Selected: ${value.name}` : (value ? 'Upload a new file to replace.' : 'Upload a file.')}
          </FormDescription>
          <FormMessage />
          {uploadProgress !== null && <Progress value={uploadProgress} className="w-full mt-2" />}
        </FormItem>
      )}
    />
  );
  
  const mainTabs = [
    { value: 'projects', label: 'Projects' },
    { value: 'team', label: 'Team' },
    { value: 'events', label: 'Events' },
    { value: 'gallery', label: 'Gallery' },
    { value: 'learn', label: 'Learn' },
  ];
  
  const moreTabs = [
    { value: 'applications', label: 'Applications' },
    { value: 'members', label: 'Members' },
    { value: 'contacts', label: 'Contacts' },
    { value: 'subscribers', label: 'Subscribers' },
    { value: 'admins', label: 'Admins' },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-24">
        <div className="text-left mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Admin Dashboard</h1>
            <p className="mt-4 text-lg text-muted-foreground">
                {user ? `Welcome, ${user.email}. Manage your site content and view submissions here.` : 'Loading user...'}
            </p>
            <div className="flex gap-4 mt-4">
              <Button onClick={handleAddTestApplication}>Send Test Application</Button>
              <Button onClick={handleSeedDatabase} disabled={isSeeding} variant="secondary">
                {isSeeding ? 'Seeding...' : 'Seed Sample Data'}
              </Button>
            </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center border-b">
                <div className="overflow-x-auto">
                    <TabsList className="bg-transparent p-0 border-none justify-start rounded-none">
                        {mainTabs.map((tab) => (
                            <TabsTrigger key={tab.value} value={tab.value} className="shrink-0">{tab.label}</TabsTrigger>
                        ))}
                    </TabsList>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className={cn('ml-auto shrink-0', moreTabs.some(t => t.value === activeTab) && 'bg-muted')}>
                            <MoreHorizontal className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {moreTabs.map((tab) => (
                            <DropdownMenuItem key={tab.value} onSelect={() => setActiveTab(tab.value)}>
                                {tab.label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <TabsContent value="projects">
                <CrudSection<Project>
                    collectionName="projects"
                    itemTitle={(item) => item?.title || 'Project'}
                    columns={[
                        { key: 'title', label: 'Title' },
                        { key: 'description', label: 'Description' },
                        { key: 'imageUrl', label: 'Image', render: (item) => <a href={item.imageUrl} target="_blank" rel="noopener noreferrer" className="underline truncate">{item.imageUrl}</a> },
                    ]}
                    formSchema={projectSchema}
                    renderForm={(form, uploadProgress) => (
                        <>
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            {imageFormField(form, uploadProgress)}
                            <FormField control={form.control} name="detailsUrl" render={({ field }) => (<FormItem><FormLabel>Details URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </>
                    )}
                />
            </TabsContent>
            <TabsContent value="team">
                <CrudSection<TeamMember>
                    collectionName="team_members"
                    itemTitle={(item) => item?.name || 'Team Member'}
                    columns={[
                        { key: 'imageUrl', label: 'Image', render: (item) => item.imageUrl ? <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><UserIcon className="w-6 h-6"/></div> },
                        { key: 'name', label: 'Name' },
                        { key: 'role', label: 'Role' },
                    ]}
                    formSchema={teamMemberSchema}
                    renderForm={(form, uploadProgress) => (
                        <>
                            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            {imageFormField(form, uploadProgress)}
                        </>
                    )}
                />
            </TabsContent>
            <TabsContent value="events">
                 <CrudSection<Event>
                    collectionName="events"
                    itemTitle={(item) => item?.title || 'Event'}
                    columns={[
                        { key: 'title', label: 'Title' },
                        { key: 'date', label: 'Date', render: (item) => format(item.date.toDate(), 'PPP') },
                        { key: 'time', label: 'Time' },
                        { key: 'location', label: 'Location' },
                    ]}
                    formSchema={eventSchema}
                    renderForm={(form) => (
                        <>
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="time" render={({ field }) => (<FormItem><FormLabel>Time</FormLabel><FormControl><Input {...field} placeholder="e.g., 2:00 PM" /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="date" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Date</FormLabel>
                                <Popover><PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                                            {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                                </PopoverContent></Popover>
                                <FormMessage />
                            </FormItem>)}
                            />
                        </>
                    )}
                />
            </TabsContent>
            <TabsContent value="gallery">
                 <CrudSection<GalleryItem>
                    collectionName="gallery_items"
                    itemTitle={(item) => item?.title || 'Gallery Item'}
                    columns={[
                        { key: 'imageUrl', label: 'Image', render: (item) => <Image src={item.imageUrl} alt={item.title} width={80} height={60} className="rounded-md object-cover" /> },
                        { key: 'title', label: 'Title' },
                    ]}
                    formSchema={galleryItemSchema}
                    renderForm={(form, uploadProgress) => (
                        <>
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            {imageFormField(form, uploadProgress)}
                        </>
                    )}
                />
            </TabsContent>
            <TabsContent value="learn">
                <PrintableLearnSectionLink />
                <CrudSection<Tutorial>
                    collectionName="tutorials"
                    itemTitle={(item) => item?.title || 'Tutorial'}
                    columns={[
                        { key: 'title', label: 'Title' },
                        { key: 'category', label: 'Category' },
                        { key: 'description', label: 'Description' },
                    ]}
                    formSchema={tutorialSchema}
                    renderForm={(form, uploadProgress) => (
                        <>
                            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="longDescription" render={({ field }) => (<FormItem><FormLabel>Detailed Description</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} rows={5} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Beginner">Beginner</SelectItem>
                                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                                        <SelectItem value="Advanced">Advanced</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )} />
                            {imageFormField(form, uploadProgress)}
                            <FormField control={form.control} name="imageHint" render={({ field }) => (<FormItem><FormLabel>Image Hint (for AI)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="videoUrl" render={({ field }) => (<FormItem><FormLabel>Video URL</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="https://www.youtube.com/watch?v=..."/></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="blueprintUrl" render={({ field }) => (<FormItem><FormLabel>Blueprint URL</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                        </>
                    )}
                />
            </TabsContent>
            <TabsContent value="admins">
              <AdminManagement />
            </TabsContent>

            <TabsContent value="applications">
                <SubmissionsTable 
                    data={applications} 
                    isLoading={isLoadingApplications} 
                    columns={applicationColumns} 
                    renderActions={(application) => (
                       <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setViewingApplication(application)}>
                                <Eye className="h-4 w-4" />
                                <span className="sr-only">View Application</span>
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => {
                                    const userData = {
                                        fullName: application.fullName,
                                        gradeClass: application.gradeClass,
                                        emailAddress: application.emailAddress,
                                        interestArea: application.interestArea,
                                        applicationId: application.id,
                                    };
                                    handleApproval(application.id, userData);
                                }}
                            >
                                Approve
                            </Button>
                            <Button 
                                variant="destructive"
                                onClick={() => handleRejection(application.id)}
                            >
                                Reject
                            </Button>
                        </div>
                    )}
                />
            </TabsContent>
            <TabsContent value="members">
                <SubmissionsTable 
                    data={members?.map(m => ({ ...m, submittedAt: m.joinedAt })) || []} 
                    isLoading={isLoadingMembers} 
                    columns={memberColumns} 
                />
            </TabsContent>
            <TabsContent value="contacts">
                <SubmissionsTable data={contacts} isLoading={isLoadingContacts} columns={contactColumns} />
            </TabsContent>
            <TabsContent value="subscribers">
                <SubmissionsTable data={subscribers} isLoading={isLoadingSubscribers} columns={subscriberColumns} />
            </TabsContent>
        </Tabs>
        
      </main>
       <Dialog open={!!viewingApplication} onOpenChange={(isOpen) => { if (!isOpen) setViewingApplication(null) }}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Application Details</DialogTitle>
                    <DialogDescription>
                        Reviewing application from {viewingApplication?.fullName}.
                    </DialogDescription>
                </DialogHeader>
                {viewingApplication && (
                    <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                        <div className="space-y-3 text-sm py-4">
                            <div className="flex justify-between"><strong>Name:</strong> <span>{viewingApplication.fullName}</span></div>
                            <div className="flex justify-between"><strong>Grade/Class:</strong> <span>{viewingApplication.gradeClass}</span></div>
                            <div className="flex justify-between"><strong>Email:</strong> <span>{viewingApplication.emailAddress}</span></div>
                            <div className="flex justify-between"><strong>Phone:</strong> <span>{viewingApplication.phoneNumber || 'N/A'}</span></div>
                            <div className="flex justify-between"><strong>Interest Area:</strong> <span>{viewingApplication.interestArea}</span></div>
                            <div className="flex justify-between"><strong>Submitted:</strong> <span>{format(viewingApplication.submittedAt.toDate(), 'PPP p')}</span></div>
                            <div className="flex flex-col gap-1 pt-2">
                                <strong>Reason for Joining:</strong> 
                                <p className='text-muted-foreground bg-muted/50 p-3 rounded-md'>{viewingApplication.reasonForJoining}</p>
                            </div>
                        </div>
                    </ScrollArea>
                )}
                <DialogFooter>
                    <Button variant="secondary" onClick={() => setViewingApplication(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      <Footer />
    </div>
  );
}


function SubmissionsTable<T extends { id: string, submittedAt?: any, email?: string, emailAddress?: string, name?: string, fullName?: string, status?: string }>({ data, isLoading, columns, renderActions }: { data: T[] | null, isLoading: boolean, columns: { key: keyof T, label: string }[], renderActions?: (item: T) => React.ReactNode }) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-4 border rounded-md">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return <p className="text-muted-foreground p-4 text-center">No submissions yet.</p>;
  }

  return (
    <ScrollArea className="h-[400px] border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(col => <TableHead key={String(col.key)}>{col.label}</TableHead>)}
            <TableHead>Submitted At</TableHead>
            {renderActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              {columns.map(col => <TableCell key={String(col.key)} className="py-4 max-w-[200px] truncate">{String(item[col.key])}</TableCell>)}
              <TableCell>
                {item.submittedAt ? format(item.submittedAt.toDate(), 'PPP p') : 'N/A'}
              </TableCell>
              {renderActions && <TableCell className="text-right">{renderActions(item)}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}


function CrudSection<T extends { id: string }>({
  collectionName,
  columns,
  formSchema,
  renderForm,
  itemTitle,
}: {
  collectionName: string;
  columns: { key: keyof T; label: string; render?: (item: T) => React.ReactNode }[];
  formSchema: z.ZodObject<any, any, any>;
  renderForm: (form: any, uploadProgress: number | null) => React.ReactNode;
  itemTitle: (item: T | null) => string;
}) {
  const { user } = useUser();
  const firestore = useFirestore();
  const storage = useStorage();
  const { toast } = useToast();
  const query = useMemoFirebase(() => (firestore && user) ? collection(firestore, collectionName) : null, [firestore, user, collectionName]);
  const { data, isLoading } = useCollection<T>(query);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<T | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (dialogOpen) {
      if (currentItem) {
        const defaultValues = { ...currentItem };
        if ('date' in defaultValues && defaultValues.date instanceof Object && 'toDate' in defaultValues.date) {
          // @ts-ignore
          defaultValues.date = defaultValues.date.toDate();
        }
        form.reset(defaultValues);
      } else {
        form.reset(formSchema.defaultValues);
      }
    }
  }, [currentItem, dialogOpen, form, formSchema]);
  

  const handleEdit = (item: T) => {
    setCurrentItem(item);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setCurrentItem(null);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!firestore) return;
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteDocumentNonBlocking(doc(firestore, collectionName, id));
      toast({ title: 'Success', description: 'Item has been deleted from the database.' });
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore || !storage) {
      toast({ variant: 'destructive', title: 'Error', description: 'Database not available.' });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const sanitizedValues = Object.fromEntries(
        Object.entries(values).map(([key, value]) => [key, value === undefined ? null : value])
      );
      
      let finalValues: Record<string, any> = { ...sanitizedValues };
      const imageFile = finalValues.imageUrl;

      if (imageFile instanceof File) {
        const storageRef = ref(storage, `images/${collectionName}/${Date.now()}_${imageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, imageFile);

        const downloadURL = await new Promise<string>((resolve, reject) => {
            uploadTask.on('state_changed', 
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
              }, 
              (error) => {
                console.error("Upload failed", error);
                reject(error);
              }, 
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              }
            );
        });
        finalValues.imageUrl = downloadURL;
      }

      if (currentItem) {
        // Update
        const docRef = doc(firestore, collectionName, currentItem.id);
        setDocumentNonBlocking(docRef, finalValues, { merge: true });
        toast({ title: 'Success', description: `${itemTitle(currentItem)} has been updated in the database.` });
      } else {
        // Create
        addDocumentNonBlocking(collection(firestore, collectionName), { ...finalValues, createdAt: serverTimestamp() });
        toast({ title: 'Success', description: `${itemTitle(null)} has been created in the database.` });
      }
      setDialogOpen(false);
      setCurrentItem(null);
    } catch (error) {
        console.error("Form submission error", error);
        toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during upload.' });
    } finally {
        setIsUploading(false);
        setUploadProgress(null);
    }
  }

  return (
    <Card className="mt-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader className="flex-row items-center justify-between">
        <div>
            <CardTitle>{collectionName.charAt(0).toUpperCase() + collectionName.slice(1).replace(/_/g, ' ')}</CardTitle>
            <CardDescription>Manage your {collectionName.toLowerCase().replace(/_/g, ' ')}.</CardDescription>
        </div>
        <Button onClick={handleAdd}><PlusCircle className="mr-2" /> Add New</Button>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading && (
            <div className="space-y-2 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )}
        {!isLoading && (!data || data.length === 0) && (
            <p className="text-muted-foreground p-4 text-center">No items yet.</p>
        )}
        {!isLoading && data && data.length > 0 && (
            <ScrollArea className="h-[400px]">
                <Table>
                <TableHeader>
                    <TableRow>
                    {columns.map(col => <TableHead key={String(col.key)}>{col.label}</TableHead>)}
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((item) => (
                    <TableRow key={item.id}>
                        {columns.map(col => (
                        <TableCell key={String(col.key)} className="py-2 max-w-[200px] truncate">
                            {col.render ? col.render(item) : String(item[col.key])}
                        </TableCell>
                        ))}
                        <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </ScrollArea>
        )}

        <Dialog open={dialogOpen} onOpenChange={(isOpen) => { if (!isUploading) setDialogOpen(isOpen)}}>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{currentItem ? 'Edit' : 'Add'} {itemTitle(currentItem)}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {renderForm(form, uploadProgress)}
                        <DialogFooter>
                            <Button type="submit" disabled={isUploading}>
                               {isUploading ? `Uploading... ${uploadProgress?.toFixed(0)}%` : 'Save'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}


function AdminManagement() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const adminsQuery = useMemoFirebase(() => (firestore && user) ? collection(firestore, 'admin_access') : null, [firestore, user]);
  const { data: admins, isLoading } = useCollection<AdminAccess>(adminsQuery);

  const form = useForm({
    resolver: zodResolver(z.object({ uid: z.string().min(1, "UID is required.") })),
    defaultValues: { uid: "" }
  });

  const handleAddAdmin = (values: { uid: string }) => {
    if (!firestore) return;
    const adminRef = doc(firestore, 'admin_access', values.uid);
    setDocumentNonBlocking(adminRef, { role: 'Top Board', grantedAt: serverTimestamp() }, { merge: true });
    toast({ title: "Admin Added", description: `User ${values.uid} has been granted admin access.` });
    form.reset();
  };

  const handleDeleteAdmin = (uid: string) => {
    if (!firestore) return;
    if (window.confirm('Are you sure you want to remove this admin?')) {
      deleteDocumentNonBlocking(doc(firestore, 'admin_access', uid));
      toast({ title: "Admin Removed", description: `User ${uid} no longer has admin access.` });
    }
  };

  return (
    <Card className="mt-6 bg-card/50 backdrop-blur-sm border-primary/20">
      <CardHeader>
        <CardTitle>Manage Admins</CardTitle>
        <CardDescription>Add or remove users with Top Board access.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAddAdmin)} className="flex items-end gap-4 mb-6">
            <FormField
              control={form.control}
              name="uid"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormLabel>New Admin User ID (UID)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter user's Firebase UID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Add Admin</Button>
          </form>
        </Form>
        
        <h3 className="mb-4 font-semibold">Current Admins</h3>
        {isLoading ? <Skeleton className="h-24 w-full" /> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID (UID)</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Granted At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins?.map(admin => (
                <TableRow key={admin.id}>
                  <TableCell className="font-mono">{admin.id}</TableCell>
                  <TableCell>{admin.role}</TableCell>
                  <TableCell>{admin.grantedAt ? format(admin.grantedAt.toDate(), 'PPP p') : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteAdmin(admin.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
         {!isLoading && (!admins || admins.length === 0) && (
            <p className="text-muted-foreground p-4 text-center">No admins found. Add one above.</p>
         )}
      </CardContent>
    </Card>
  );
}


function AdminPageContent() {
    const { user } = useUser();
    if (!user) return null; // Should not happen if checks are done correctly
    return <AdminDashboard />;
}


export default function AdminPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    const checkAdminStatus = async () => {
      if (!firestore) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Firestore is not available.',
        });
        router.push('/');
        return;
      };
      
      try {
        const adminRef = doc(firestore, 'admin_access', user.uid);
        const adminDoc = await getDoc(adminRef);
        if (adminDoc.exists()) {
          setIsAdmin(true);
        } else {
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'You do not have permission to access the admin panel.',
          });
          router.push('/');
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        toast({
            variant: 'destructive',
            title: 'Access Error',
            description: 'An error occurred while verifying your permissions.',
        });
        router.push('/');
      } finally {
        setIsVerifying(false);
      }
    };

    checkAdminStatus();

  }, [user, isUserLoading, firestore, router, toast]);

  if (isUserLoading || isVerifying) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <AdminPageContent />;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground">Redirecting...</p>
        </div>
    </div>
  );
}
