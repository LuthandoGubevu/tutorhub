
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Home, BookOpenText, Users, CalendarDays, Atom, Sigma, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/mathematics', label: 'Mathematics', icon: <Sigma size={20} /> },
  { href: '/physics', label: 'Physics', icon: <Atom size={20} /> },
  { href: '/book-session', label: 'Book a Session', icon: <CalendarDays size={20} /> },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 h-screen w-64 bg-sidebar-background text-sidebar-foreground shadow-lg flex flex-col">
        <div className="p-6 flex items-center space-x-3 border-b border-sidebar-border">
          {/* Placeholder for Logo */}
          <div className="w-10 h-10 bg-sidebar-primary rounded-full flex items-center justify-center text-sidebar-primary-foreground font-bold text-xl">
            iK
          </div>
          <h1 className="text-xl font-semibold text-sidebar-foreground">iKasi Tutoring</h1>
        </div>
        <ScrollArea className="flex-1">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
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
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/70 text-center">© 2024 iKasi Tutoring Platform</p>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
