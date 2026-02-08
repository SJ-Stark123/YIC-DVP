import type { Timestamp } from 'firebase/firestore';

export type Project = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  detailsUrl: string;
  createdAt?: Timestamp;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
};

export type Event = {
  id: string;
  title: string;
  date: Timestamp;
  time: string;
  location: string;
  description?: string;
  createdAt?: Timestamp;
};

export type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
};

export type Subscriber = {
  id: string;
  email: string;
  subscribedAt: Timestamp;
};

export type ContactFormSubmission = {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: Timestamp;
};

export type EnrollmentFormSubmission = {
  id: string;
  fullName: string;
  gradeClass: string;
  emailAddress: string;
  phoneNumber: string;
  interestArea: string;
  reasonForJoining: string;
  consentGiven: boolean;
  submittedAt: Timestamp;
  status: 'pending' | 'approved' | 'rejected';
};

export type Tutorial = {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: 'Beginner' | 'Intermediate' | 'Advanced';
  imageUrl: string;
  imageHint?: string;
  videoUrl?: string;
  blueprintUrl?: string;
};

export type Member = {
    id: string;
    fullName: string;
    gradeClass: string;
    emailAddress: string;
    interestArea: string;
    applicationId: string;
    joinedAt: Timestamp;
};

export type AdminAccess = {
  id: string;
  role: 'Top Board';
  grantedAt: Timestamp;
};

    