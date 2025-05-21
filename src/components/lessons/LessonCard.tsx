
import type { Lesson } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface LessonCardProps {
  lesson: Lesson;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">{lesson.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground h-20 overflow-hidden">
          {lesson.richTextContent.replace(/<[^>]+>/g, '').substring(0, 150)}...
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Could add more details like tags or difficulty here */}
        <p className="text-xs text-muted-foreground">Subject: {lesson.subject}</p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={`/${lesson.subject.toLowerCase()}/${lesson.id}`} className="flex items-center justify-center">
            View Lesson <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
