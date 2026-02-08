
"use client";

import { useState, useEffect, type FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface NavbarProps {
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
}

const Navbar: FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'projects', label: 'Projects' },
    { id: 'team', label: 'Team' },
    { id: 'events', label: 'Events' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'learn', label: 'Learn' },
    { id: 'contact', label: 'Contact' },
  ];
  
  const handleTabChange = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    setIsMobileMenuOpen(false);
  };
  
  const handleHomeClick = () => {
      if (onTabChange) {
        onTabChange('home');
      } else {
        router.push('/');
      }
      setIsMobileMenuOpen(false);
  }

  const NavLinkItems = ({ isMobile = false }) => (
    <>
      {navLinks.map((link) => (
        <Button
          key={link.id}
          variant="ghost"
          className={cn(
            'transition-all duration-300 hover:bg-transparent',
            activeTab === link.id
              ? 'text-primary [text-shadow:0_0_8px_hsl(var(--primary))]'
              : 'text-muted-foreground hover:text-primary hover:[text-shadow:0_0_8px_hsl(var(--primary))]',
            isMobile ? 'justify-start w-full py-2 text-lg' : 'text-sm px-3'
          )}
          onClick={() => handleTabChange(link.id)}
        >
          {link.label}
        </Button>
      ))}
    </>
  );

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-border/50 bg-background/80 backdrop-blur-sm' : 'bg-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <button onClick={handleHomeClick} className="flex items-center gap-2 text-lg font-bold">
            <Image
              src="https://i.imgur.com/NNU2gbL.png"
              alt="Innovators Hub Logo"
              width={120}
              height={30}
            />
          </button>

          <nav className="hidden md:flex items-center gap-1">
            <NavLinkItems />
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <>
                <Button asChild>
                  <Link href="/admin">Admin Panel</Link>
                </Button>
                <Button variant="outline" size="icon" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => onTabChange && onTabChange('join')} className="hidden sm:inline-flex relative overflow-hidden bg-gradient-to-r from-primary to-accent text-primary-foreground hover:from-primary/90 hover:to-accent/90 animate-glow">
                  Join Us
                </Button>
                <Button asChild variant="outline">
                    <Link href="/login">
                        <Lock />
                        Admin
                    </Link>
                </Button>
              </>
            )}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="p-6">
                  <button onClick={handleHomeClick} className="flex items-center gap-2 text-xl font-bold mb-8">
                     <Image
                        src="https://i.imgur.com/NNU2gbL.png"
                        alt="Innovators Hub Logo"
                        width={120}
                        height={30}
                     />
                  </button>
                  <nav className="flex flex-col gap-4">
                    <NavLinkItems isMobile />
                     {user ? (
                        <>
                        <Link href="/admin" className="transition-colors hover:text-primary block py-2 text-lg" onClick={() => setIsMobileMenuOpen(false)}>Admin</Link>
                        <a onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="transition-colors hover:text-primary block py-2 text-lg cursor-pointer">Logout</a>
                        </>
                    ) : (
                        <Link href="/login" className="transition-colors hover:text-primary block py-2 text-lg" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
