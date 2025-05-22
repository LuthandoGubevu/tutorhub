
import AppLayout from '@/components/AppLayout';
import LessonCard from '@/components/lessons/LessonCard'; // Re-use LessonCard for individual lessons
import { getBranchById } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sigma, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface MathematicsBranchPageProps {
  params: { branchId: string };
}

export default function MathematicsBranchPage({ params }: MathematicsBranchPageProps) {
  const branch = getBranchById(params.branchId);

  if (!branch) {
    return (
      <AppLayout>
        <Alert variant="destructive" className="shadow-lg">
          <Sigma className="h-4 w-4" />
          <AlertTitle>Error: Branch Not Found</AlertTitle>
          <AlertDescription>
            The Mathematics branch you are looking for does not exist.
          </AlertDescription>
          <div className="mt-4">
            <Button asChild variant="outline">
              <Link href="/mathematics">
                <ArrowLeft size={16} className="mr-2" /> Go to Mathematics Branches
              </Link>
            </Button>
          </div>
        </Alert>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button variant="outline" asChild className="mb-4">
            <Link href="/mathematics">
                <ArrowLeft size={16} className="mr-2" /> Back to Branches
            </Link>
        </Button>

        <Card className="shadow-lg bg-[#103452] text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-4xl font-bold flex items-center">
              <Sigma size={40} className="mr-3"/> {branch.title}
            </CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90">
              {branch.description}
            </CardDescription>
             <p className="text-sm text-primary-foreground/80 pt-2">Browse the lessons available in this branch.</p>
          </CardHeader>
        </Card>
        
        {branch.lessons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branch.lessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No lessons available in this branch yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

export async function generateStaticParams() {
  // This function is optional but recommended for better performance if your branches are static
  // It tells Next.js which branchId values to pre-render at build time
  // If your branches are dynamic, you can omit this function
  const { mathematicsBranches } = await import('@/lib/data');
  return mathematicsBranches.map((branch) => ({
    branchId: branch.id,
  }));
}
