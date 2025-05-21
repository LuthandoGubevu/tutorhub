
import AppLayout from '@/components/AppLayout';
import LessonCard from '@/components/lessons/LessonCard';
import { mathematicsLessons } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sigma } from 'lucide-react';

export default function MathematicsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Card className="shadow-lg bg-[#103452] text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-4xl font-bold flex items-center">
              <Sigma size={40} className="mr-3"/> Mathematics Lessons
            </CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90">
              Explore a variety of topics in Mathematics. Select a lesson to get started.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mathematicsLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
