"use server";

import { z } from 'zod';

const joinSchema = z.object({
  fullName: z.string().min(2),
  grade: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  interestArea: z.enum(["Robotics", "Solar", "Environmental", "Programming", "Design"]),
  reason: z.string().min(10),
  consent: z.literal(true),
});

export async function handleJoinForm(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData);
  const validatedFields = joinSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Submit.',
    };
  }
  
  // In a real application, you would save this to a database
  console.log("New Join Application:", validatedFields.data);

  return { message: "Application submitted successfully!", errors: {} };
}

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function handleContactForm(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const validatedFields = contactSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to send message.',
        };
      }
    
    // In a real application, you would save this or send an email
    console.log("New Contact Message:", validatedFields.data);
    
    return { message: "Message sent successfully!", errors: {} };
}

const newsletterSchema = z.object({
    email: z.string().email(),
});

export async function handleNewsletterSubscription(prevState: any, formData: FormData) {
    const data = Object.fromEntries(formData);
    const validatedFields = newsletterSchema.safeParse(data);

    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Invalid email.',
        };
      }
    
    // In a real application, you would save this to your mailing list
    console.log("New Newsletter Subscription:", validatedFields.data);
    
    return { message: "Thank you for subscribing!", errors: {} };
}
