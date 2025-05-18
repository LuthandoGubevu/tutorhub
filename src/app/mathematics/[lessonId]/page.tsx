
import AppLayout from '@/components/AppLayout';
import LessonDisplay from '@/components/lessons/LessonDisplay';
import { getLessonById } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MathematicsLessonPageProps {
  params: { lessonId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default function MathematicsLessonPage({ params, searchParams }: MathematicsLessonPageProps) {
  const lesson = getLessonById('Mathematics', params.lessonId);
  const submissionId = typeof searchParams?.submissionId === 'string' ? searchParams.submissionId : undefined;


  if (!lesson) {
    return (
      <AppLayout>
        <Alert variant="destructive" className="shadow-lg">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error: Lesson Not Found</AlertTitle>
          <AlertDescription>
            The Mathematics lesson you are looking for does not exist or could not be loaded.
            Please check the URL or navigate back to the lessons page.
          </AlertDescription>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/mathematics">Go to Mathematics Lessons</Link>
            </Button>
          </div>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <LessonDisplay lesson={lesson} initialSubmissionId={submissionId} />
    </AppLayout>
  );
}
