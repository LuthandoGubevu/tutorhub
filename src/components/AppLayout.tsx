
"use client"; 

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home, BookOpenText, Users, CalendarDays, Atom, Sigma, LayoutDashboard, LogOut, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext'; 
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react'; // Import useEffect

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  role?: 'student' | 'tutor' | 'all'; 
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, role: 'student' },
  { href: '/tutor-dashboard', label: 'Tutor Dashboard', icon: <ShieldCheck size={20} />, role: 'tutor' },
  { href: '/mathematics', label: 'Mathematics', icon: <Sigma size={20} />, role: 'all' }, 
  { href: '/physics', label: 'Physics', icon: <Atom size={20} />, role: 'all' }, 
  { href: '/book-session', label: 'Book a Session', icon: <CalendarDays size={20} />, role: 'student' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { userRole, logoutUser, currentUser, isLoadingAuth } = useAuth(); 
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!isLoadingAuth && !currentUser && pathname !== '/login') {
      // If auth is done loading, there's no user, and we're not on the login page,
      // redirect to login. This protects all pages using AppLayout.
      console.log(`AppLayout: No user, on ${pathname}, redirecting to /login`);
      router.replace('/login');
    }
  }, [isLoadingAuth, currentUser, pathname, router]);


  const handleLogout = async () => {
    await logoutUser();
    // AuthContext now handles redirection to landing page on logout
  };
  
  const filteredNavItems = navItems.filter(item => {
    if (item.role === 'all') return true;
    return item.role === userRole;
  });

  if (isLoadingAuth || (!currentUser && pathname !== '/login' && pathname !== '/')) { 
    // Also show loading if redirecting due to no user, but not on landing page
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-foreground">Loading User Data...</p>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 h-screen w-64 bg-sidebar-background text-sidebar-foreground shadow-lg flex flex-col">
        <div className="p-6 flex items-center space-x-3 border-b border-sidebar-border">
          <Link href={userRole === 'tutor' ? "/tutor-dashboard" : "/dashboard"} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              IA
            </div>
            <h1 className="text-xl font-semibold text-sidebar-foreground group-hover:text-sidebar-primary transition-colors">ITM Academy</h1>
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
                  pathname === item.href ? "bg-sidebar-primary text-sidebar-primary-foreground" : ""
                )}
                asChild
              >
                <Link href={item.href} className="flex items-center space-x-3 p-3 rounded-md">
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </Button>
            ))}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t border-sidebar-border space-y-2">
           {currentUser && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <LogOut size={20} className="mr-3" />
              <span>Logout</span>
            </Button>
          )}
          <p className="text-xs text-sidebar-foreground/70 text-center">© {new Date().getFullYear()} ITM Academy</p>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
