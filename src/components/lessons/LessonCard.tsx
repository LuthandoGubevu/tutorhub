
import type { Lesson } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface LessonCardProps {
  lesson: Lesson;
}

export default function LessonCard({ lesson }: LessonCardProps) {
  const imagePath = lesson.subject === 'Mathematics' 
    ? '/images/mathematics-lesson.png' 
    : '/images/physics-lesson.png';

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader className="p-0"> {/* Adjusted padding for image to fit better */}
        <Image 
          src={imagePath}
          alt={lesson.title} 
          width={600} 
          height={300}
          className="rounded-t-lg object-cover w-full h-48" // Added w-full and fixed height
        />
      </CardHeader>
      <CardHeader> {/* Separate CardHeader for title and description */}
        <CardTitle className="mt-0 text-xl font-semibold text-primary">{lesson.title}</CardTitle> {/* Removed mt-4 */}
        <CardDescription className="text-sm text-muted-foreground h-12 overflow-hidden">
          {lesson.richTextContent.replace(/<[^>]+>/g, '').substring(0, 100)}...
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {/* Could add more details like tags or difficulty here */}
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
