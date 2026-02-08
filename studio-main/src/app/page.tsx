'use client';
import { useState } from 'react';
import Navbar from '@/components/layout/navbar';
import HomeContent from '@/components/sections/home-content';
import AboutSection from '@/components/sections/about-section';
import ProjectsSection from '@/components/sections/projects-section';
import TeamSection from '@/components/sections/team-section';
import EventsSection from '@/components/sections/events-section';
import GallerySection from '@/components/sections/gallery-section';
import LearnSection from '@/components/sections/learn-section';
import JoinSection from '@/components/sections/join-section';
import ContactSection from '@/components/sections/contact-section';
import Footer from '@/components/layout/footer';
import { FadeIn } from '@/components/fade-in';
import type { Tutorial } from '@/lib/types';
import TutorialDetailSection from '@/components/sections/tutorial-detail-section';

export default function Home() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);

  const onTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSelectedTutorial(null);
    // Scroll to top when tab changes
    window.scrollTo(0, 0);
  }

  const handleSelectTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    window.scrollTo(0, 0);
  };
  
  const handleBackToLearn = () => {
    setSelectedTutorial(null);
  }

  const renderContent = () => {
    if (activeTab === 'learn' && selectedTutorial) {
        return <FadeIn><TutorialDetailSection tutorial={selectedTutorial} onBack={handleBackToLearn} /></FadeIn>;
    }
  
    switch (activeTab) {
      case 'home':
        return <HomeContent onTabChange={onTabChange} />;
      case 'about':
        return <FadeIn><AboutSection /></FadeIn>;
      case 'projects':
        return <FadeIn><ProjectsSection /></FadeIn>;
      case 'team':
        return <FadeIn><TeamSection /></FadeIn>;
      case 'events':
        return <FadeIn><EventsSection /></FadeIn>;
      case 'gallery':
        return <FadeIn><GallerySection /></FadeIn>;
      case 'learn':
        return <FadeIn><LearnSection onSelectTutorial={handleSelectTutorial} /></FadeIn>;
      case 'join':
        return <FadeIn><JoinSection /></FadeIn>;
      case 'contact':
        return <FadeIn><ContactSection /></FadeIn>;
      default:
        return <HomeContent onTabChange={onTabChange} />;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar activeTab={activeTab} onTabChange={onTabChange} />
      <main className="flex-grow">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

    