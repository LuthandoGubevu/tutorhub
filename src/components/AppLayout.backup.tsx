
"use client";

import { type ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Sigma,
  Atom,
  CalendarDays,
  ShieldCheck,
  LogOut,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
// Custom hook for media queries
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  role?: 'student' | 'tutor' | 'all';
}

const navItemsData: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, role: 'student' },
  { href: '/tutor-dashboard', label: 'Tutor Dashboard', icon: <ShieldCheck size={20} />, role: 'tutor' },
  { href: '/mathematics', label: 'Mathematics', icon: <Sigma size={20} />, role: 'all' },
  { href: '/physics', label: 'Physics', icon: <Atom size={20} />, role: 'all' },
  { href: '/book-session', label: 'Book a Session', icon: <CalendarDays size={20} />, role: 'student' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { userRole, logoutUser, currentUser, isLoadingAuth } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Close sidebar when navigating or when mobile view changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isSidebarOpen && !target.closest('aside') && !target.closest('button[aria-label="Toggle sidebar"]')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen, isMobile]);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  useEffect(() => {
    if (!isLoadingAuth && !currentUser) {
      const protectedBasePaths = ['/dashboard', '/tutor-dashboard', '/mathematics', '/physics', '/book-session'];
      if (protectedBasePaths.some(basePath => pathname.startsWith(basePath))) {
        if (pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
          router.replace('/login');
        }
      }
    }
  }, [isLoadingAuth, currentUser, pathname, router]);
    return item.role === userRole;
  });

  return (
    <nav className="p-4 space-y-2">
      {filteredNavItems.map((item) => (
        <Button
          key={item.label}
          variant="ghost"
          className={cn(
            "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            currentPath === item.href || (item.href !== '/' && currentPath.startsWith(item.href))
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : ""
          )}
          onClick={() => {
            if (onLinkClick) onLinkClick();
          }}
          asChild
        >
          <Link href={item.href} className="flex items-center space-x-3 p-3 rounded-md">
            {item.icon}
            <span>{item.label}</span>
          </Link>
        </Button>
      ))}
    </nav>
  );
};


export default function AppLayout({ children }: { children: ReactNode }) {
  const { userRole, logoutUser, currentUser, isLoadingAuth } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && !currentUser) {
      const protectedBasePaths = ['/dashboard', '/tutor-dashboard', '/mathematics', '/physics', '/book-session'];
      if (protectedBasePaths.some(basePath => pathname.startsWith(basePath))) {
        if (pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
          router.replace('/login');
        }
      }
    }
  }, [isLoadingAuth, currentUser, pathname, router]);

  const handleLogout = async () => {
    await logoutUser();
    // Redirection to '/' is handled by AuthContext on logout.
  };

  const shouldShowLoader = isLoadingAuth && !currentUser && pathname !== '/login' && pathname !== '/register' && pathname !== '/';

  if (shouldShowLoader) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-foreground">Loading User Data...</p>
      </div>
    );
  }

  if (!currentUser && !isLoadingAuth && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
     const protectedBasePaths = ['/dashboard', '/tutor-dashboard', '/mathematics', '/physics', '/book-session'];
      if (protectedBasePaths.some(basePath => pathname.startsWith(basePath))) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-lg text-foreground">Redirecting to login...</p>
          </div>
        );
      }
  }


  return (
<<<<<<< HEAD
    <div className="flex min-h-screen bg-background relative">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card fixed top-0 left-0 right-0 z-40 h-16">
        <Link 
          href={userRole === 'tutor' ? "/tutor-dashboard" : "/dashboard"} 
          className="flex items-center"
          onClick={() => setIsSidebarOpen(false)}
        >
          <Image
            src="/tutorhub-logo.png"
            alt="TutorHub Online Academy Logo"
            width={120}
            height={36}
            className="rounded-md"
          />
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-accent"
          aria-label="Toggle sidebar"
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:sticky top-0 left-0 h-screen w-64 bg-sidebar text-sidebar-foreground shadow-lg flex flex-col z-30 transition-transform duration-300 ease-in-out",
          isMobile ? (isSidebarOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0',
          !isMobile && 'md:translate-x-0'
        )}
        aria-label="Sidebar"
      >
        <div className="p-4 flex items-center border-b border-sidebar-border h-16 md:h-auto">
          <Link 
            href={userRole === 'tutor' ? "/tutor-dashboard" : "/dashboard"} 
            className="flex items-center group w-full"
            onClick={() => setIsSidebarOpen(false)}
          >
            <Image
              src="/tutorhub-logo.png" 
              alt="TutorHub Online Academy Logo"
              width={150} 
              height={45} 
              className="rounded-md hidden md:block" 
            />
            <span className="text-lg font-semibold md:hidden">TutorHub</span>
          </Link>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-2">
            {filteredNavItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href)) 
                    ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                    : ""
                )}
                asChild
              >
                <Link 
                  href={item.href} 
                  className="flex items-center space-x-3 p-3 rounded-md"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>
=======
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 h-screen w-64 bg-sidebar text-sidebar-foreground shadow-lg flex-col hidden md:flex">
        <SidebarHeaderContent userRole={userRole} />
        <ScrollArea className="flex-1">
          <SidebarNavigation userRole={userRole} currentPath={pathname} />
>>>>>>> origin/main
        </ScrollArea>
        {currentUser && <SidebarFooterContent onLogout={handleLogout} />}
      </aside>
<<<<<<< HEAD
      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto mt-16 md:mt-0">
        {children}
      </main>
=======

      <div className="flex-1 flex flex-col min-h-screen"> {/* Ensure this container takes full height */}
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 bg-sidebar text-sidebar-foreground shadow-md md:hidden flex flex-row items-center justify-between p-4 h-20"> {/* Changed to flex-row and justify-between, fixed height */}
          <Link href={userRole === 'tutor' ? "/tutor-dashboard" : "/dashboard"} className="flex items-center group">
            <Image src="/tutorhub-logo.png" alt="TutorHub Online Academy Logo" width={150} height={45} />
          </Link>
          {currentUser && (
            <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:bg-sidebar-accent">
                  <MenuIcon size={24} />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-sidebar text-sidebar-foreground p-0 flex flex-col"> {/* Ensure flex-col for SheetContent */}
                <SidebarHeaderContent userRole={userRole} />
                <ScrollArea className="flex-1">
                  <SidebarNavigation userRole={userRole} currentPath={pathname} onLinkClick={() => setIsMobileSheetOpen(false)} />
                </ScrollArea>
                <SidebarFooterContent onLogout={async () => {
                  await handleLogout();
                  setIsMobileSheetOpen(false);
                }} />
              </SheetContent>
            </Sheet>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto"> {/* Changed to overflow-y-auto */}
          {children}
        </main>
      </div>
>>>>>>> origin/main
    </div>
  );
}
