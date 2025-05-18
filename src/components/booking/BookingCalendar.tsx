
"use client";

import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TutorAvailability, Booking } from '@/types';
import { useStudentData } from '@/contexts/StudentDataContext';
import { useToast } from '@/hooks/use-toast';
import { bookSessionAction } from '@/lib/actions';
import { Loader2, CalendarCheck } from 'lucide-react';
import { format } from 'date-fns';

interface BookingCalendarProps {
  availability: TutorAvailability[];
}

export default function BookingCalendar({ availability }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedSubject, setSelectedSubject] = useState<'Mathematics' | 'Physics' | 'General' | undefined>(undefined);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addBooking } = useStudentData();
  const { toast } = useToast();

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // Reset time when date changes
    if (date) {
      const dayAvailability = availability.find(
        (d) => new Date(d.date).toDateString() === date.toDateString()
      );
      setAvailableSlots(dayAvailability ? dayAvailability.timeSlots : []);
    } else {
      setAvailableSlots([]);
    }
  };

  const handleSubmitBooking = async () => {
    if (!selectedDate || !selectedTime || !selectedSubject) {
      toast({
        title: "Missing Information",
        description: "Please select a date, time, and subject for your session.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const bookingDateTime = new Date(selectedDate);
    bookingDateTime.setHours(hours, minutes, 0, 0);

    const bookingDetails = {
      subject: selectedSubject,
      dateTime: bookingDateTime,
      durationMinutes: 15, // Default 15-minute session
    };

    const result = await bookSessionAction(bookingDetails);
    setIsSubmitting(false);

    if (result.success && result.booking) {
      addBooking(result.booking);
      toast({
        title: "Session Booked!",
        description: `Your ${result.booking.subject} session on ${format(result.booking.dateTime, "PPPp")} is confirmed. A mock Google Meet link has been generated.`,
      });
      setSelectedDate(undefined);
      setSelectedTime(undefined);
      setSelectedSubject(undefined);
      setAvailableSlots([]);
    } else {
      toast({
        title: "Booking Failed",
        description: result.error || "Could not book your session. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const today = new Date();
  today.setHours(0,0,0,0); // allow booking for today if slots are available

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="text-3xl font-bold text-primary">Book a Tutoring Session</CardTitle>
        <CardDescription className="text-lg">Select an available date and time for your 15-minute session.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <h3 className="text-xl font-semibold mb-2">1. Select a Date:</h3>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border shadow-sm bg-card p-3"
              disabled={(date) =>
                date < today || // Disable past dates
                !availability.some(avail => new Date(avail.date).toDateString() === date.toDateString()) // Disable dates with no availability
              }
              
            />
          </div>
          
          {selectedDate && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">2. Select Subject:</h3>
                 <Select value={selectedSubject} onValueChange={(value: 'Mathematics' | 'Physics' | 'General') => setSelectedSubject(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Physics">Physics</SelectItem>
                    <SelectItem value="General">General Q&A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedSubject && availableSlots.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">3. Select a Time Slot:</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Showing slots for: {format(selectedDate, "PPP")}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={selectedTime === slot ? 'default' : 'outline'}
                        onClick={() => setSelectedTime(slot)}
                        className="w-full"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {selectedSubject && availableSlots.length === 0 && (
                 <p className="text-muted-foreground mt-2">No available time slots for this date. Please select another date.</p>
              )}
            </div>
          )}
        </div>

        {selectedDate && selectedTime && selectedSubject && (
          <div className="pt-6 border-t">
            <h3 className="text-xl font-semibold mb-3">Confirm Booking:</h3>
            <p className="mb-1"><span className="font-medium">Subject:</span> {selectedSubject}</p>
            <p className="mb-1"><span className="font-medium">Date:</span> {format(selectedDate, "PPP")}</p>
            <p className="mb-4"><span className="font-medium">Time:</span> {selectedTime}</p>
            <Button onClick={handleSubmitBooking} disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CalendarCheck size={16} className="mr-2" />}
              Confirm 15-min Session
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
