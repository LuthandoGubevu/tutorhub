
"use client";

import type { Booking, Lesson, SubmittedWork } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Bell, CalendarClock, ExternalLink } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isFuture, differenceInDays } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AlertsPanelProps {
  bookings: Booking[];
  allLessons: Lesson[];
  submittedWork: SubmittedWork[];
}

export default function AlertsPanel({ bookings, allLessons, submittedWork }: AlertsPanelProps) {
  const upcomingSessions = bookings
    .filter(b => b.status === 'Confirmed' && isFuture(new Date(b.dateTime)))
    .sort((a,b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
    .slice(0, 3); // Show top 3 upcoming

  const submittedLessonIds = new Set(submittedWork.map(sw => sw.lesson.id));
  const lessonsRequiringAttention = allLessons
    .filter(lesson => !submittedLessonIds.has(lesson.id))
    .slice(0, 3); // Show top 3 unsubmitted

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Bell className="text-primary" /> Alerts & Reminders
        </CardTitle>
        <CardDescription>Stay on top of your schedule and coursework.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <div className="space-y-4">
            {upcomingSessions.length === 0 && lessonsRequiringAttention.length === 0 && (
              <p className="text-muted-foreground">No current alerts or reminders. Great job staying on track!</p>
            )}

            {upcomingSessions.length > 0 && (
              <div>
                <h3 className="text-md font-semibold mb-2 flex items-center"><CalendarClock size={18} className="mr-2 text-accent" /> Upcoming Sessions:</h3>
                <ul className="space-y-2">
                  {upcomingSessions.map(booking => {
                    const daysUntil = differenceInDays(new Date(booking.dateTime), new Date());
                    let proximityText = `in ${daysUntil} days`;
                    if (daysUntil === 0) proximityText = "today";
                    if (daysUntil === 1) proximityText = "tomorrow";
                    
                    return (
                      <li key={booking.id} className="p-3 border rounded-lg bg-secondary/30 text-sm">
                        <div className="flex justify-between items-center">
                           <div>
                            <strong>{booking.subject}</strong> session {proximityText}
                            <p className="text-xs text-muted-foreground">{format(new Date(booking.dateTime), "MMM d, yyyy 'at' p")}</p>
                           </div>
                           {booking.googleMeetLink && (
                             <Button variant="link" size="sm" asChild className="p-0 h-auto text-accent hover:underline">
                               <a href={booking.googleMeetLink} target="_blank" rel="noopener noreferrer">Join <ExternalLink size={12} className="ml-1"/></a>
                             </Button>
                           )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {lessonsRequiringAttention.length > 0 && (
              <div className={upcomingSessions.length > 0 ? "mt-4 pt-4 border-t" : ""}>
                <h3 className="text-md font-semibold mb-2 flex items-center"><AlertTriangle size={18} className="mr-2 text-orange-500" /> Lessons to Complete:</h3>
                <ul className="space-y-2">
                  {lessonsRequiringAttention.map(lesson => (
                    <li key={lesson.id} className="p-3 border rounded-lg bg-secondary/30 text-sm">
                       <div className="flex justify-between items-center">
                          <div>
                            <strong>{lesson.title}</strong> ({lesson.subject})
                            <p className="text-xs text-muted-foreground">This lesson has not been submitted yet.</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/${lesson.subject.toLowerCase()}/${lesson.id}`}>
                                Start Lesson <ExternalLink size={12} className="ml-1"/>
                            </Link>
                          </Button>
                       </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
