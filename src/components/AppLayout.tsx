
"use client"; // Add "use client" as useAuth is a client hook

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home, BookOpenText, Users, CalendarDays, Atom, Sigma, LayoutDashboard, LogOut, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { usePathname, useRouter } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  role?: 'student' | 'tutor' | 'all'; // Specify which role can see this
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, role: 'student' },
  { href: '/tutor-dashboard', label: 'Tutor Dashboard', icon: <ShieldCheck size={20} />, role: 'tutor' },
  { href: '/mathematics', label: 'Mathematics', icon: <Sigma size={20} />, role: 'all' }, // Assuming lessons are for all
  { href: '/physics', label: 'Physics', icon: <Atom size={20} />, role: 'all' }, // Assuming lessons are for all
  { href: '/book-session', label: 'Book a Session', icon: <CalendarDays size={20} />, role: 'student' },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { userRole, mockLogout, currentUser } = useAuth(); // Get userRole and logout function
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    mockLogout();
    router.push('/login');
  };
  
  const filteredNavItems = navItems.filter(item => {
    if (item.role === 'all') return true;
    return item.role === userRole;
  });

  if (!currentUser) { // If no user, don't render full AppLayout, or redirect from layout
     // This check might be redundant if individual page layouts handle redirection,
     // but can be a fallback.
     // Consider redirecting to /login from here if user is null and not on /login page.
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 h-screen w-64 bg-sidebar-background text-sidebar-foreground shadow-lg flex flex-col">
        <div className="p-6 flex items-center space-x-3 border-b border-sidebar-border">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
              iK
            </div>
            <h1 className="text-xl font-semibold text-sidebar-foreground group-hover:text-sidebar-primary transition-colors">iKasi Tutoring</h1>
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
          <p className="text-xs text-sidebar-foreground/70 text-center">© {new Date().getFullYear()} iKasi Tutoring</p>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
