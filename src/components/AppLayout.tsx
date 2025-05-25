
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Sigma, Atom, CalendarDays, ShieldCheck, LogOut, Menu as MenuIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'; // SheetClose removed as it's typically handled by onOpenChange or explicitly
import { Loader2 } from 'lucide-react';

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

// Reusable Sidebar Header
const SidebarHeaderContent = ({ userRole }: { userRole: 'student' | 'tutor' | null }) => (
  <div className="p-4 flex items-center border-b border-sidebar-border">
    <Link href={userRole === 'tutor' ? "/tutor-dashboard" : "/dashboard"} className="flex items-center group w-full">
      <Image
        src="/tutorhub-logo.png"
        alt="TutorHub Online Academy Logo"
        width={150}
        height={45}
        className="rounded-md"
      />
    </Link>
  </div>
);

// Reusable Sidebar Footer
const SidebarFooterContent = ({ onLogout }: { onLogout: () => Promise<void> }) => (
  <div className="p-4 border-t border-sidebar-border space-y-2">
    <Button
      variant="ghost"
      onClick={onLogout}
      className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
    >
      <LogOut size={20} className="mr-3" />
      <span>Logout</span>
    </Button>
    <p className="text-xs text-sidebar-foreground/70 text-center">© {new Date().getFullYear()} TutorHub Online Academy</p>
  </div>
);

// Reusable Navigation Links
const SidebarNavigation = ({ userRole, currentPath, onLinkClick }: { userRole: 'student' | 'tutor' | null, currentPath: string, onLinkClick?: () => void }) => {
  const filteredNavItems = navItemsData.filter(item => {
    if (item.role === 'all') return true;
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
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 h-screen w-64 bg-sidebar text-sidebar-foreground shadow-lg flex-col hidden md:flex">
        <SidebarHeaderContent userRole={userRole} />
        <ScrollArea className="flex-1">
          <SidebarNavigation userRole={userRole} currentPath={pathname} />
        </ScrollArea>
        {currentUser && <SidebarFooterContent onLogout={handleLogout} />}
      </aside>

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
    </div>
  );
}
