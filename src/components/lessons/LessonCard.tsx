
import type { Lesson } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#103452]">{lesson.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-xs text-muted-foreground">Subject: {lesson.subject}</p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button asChild className="w-full bg-[#103452] hover:bg-[#0d2a43] text-accent-foreground">
          <Link href={`/${lesson.subject.toLowerCase()}/${lesson.id}`} className="flex items-center justify-center">
            View Lesson <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
