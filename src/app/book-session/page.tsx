
import AppLayout from '@/components/AppLayout';
import BookingCalendar from '@/components/booking/BookingCalendar';
import { tutorAvailability } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

export default function BookSessionPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Card className="shadow-lg bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-4xl font-bold flex items-center">
             <CalendarDays size={40} className="mr-3" /> Book a Tutoring Session
            </CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90">
              Schedule a 15-minute one-on-one session with a tutor.
            </CardDescription>
          </CardHeader>
        </Card>
        <BookingCalendar availability={tutorAvailability} />
      </div>
    </AppLayout>
  );
}
