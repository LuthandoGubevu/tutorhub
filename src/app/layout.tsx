
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { StudentDataProvider } from '@/contexts/StudentDataContext';
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TutorHub Online Academy - Personalized Learning Platform',
  description: 'Interactive learning platform for Grade 12 Mathematics and Physics. AI-assisted tutoring, progress tracking, and session booking with TutorHub Online Academy.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <StudentDataProvider>
            {children}
            <Toaster />
          </StudentDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
