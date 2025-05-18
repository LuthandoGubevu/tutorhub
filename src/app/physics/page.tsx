
import AppLayout from '@/components/AppLayout';
import LessonCard from '@/components/lessons/LessonCard';
import { physicsLessons } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Atom } from 'lucide-react';

export default function PhysicsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
         <Card className="shadow-lg bg-gradient-to-r from-primary to-accent text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-4xl font-bold flex items-center">
              <Atom size={40} className="mr-3"/> Physics Lessons
            </CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90">
              Dive into the fascinating world of Physics. Choose a lesson to begin your exploration.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {physicsLessons.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
