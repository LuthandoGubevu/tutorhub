
"use client";

import type { Lesson } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, ListChecks, Target } from 'lucide-react';

interface SubjectOverviewCardProps {
  subjectName: 'Mathematics' | 'Physics';
  icon: React.ReactNode;
  totalLessons: number;
  completedLessons: number;
}

export default function SubjectOverviewCard({
  subjectName,
  icon,
  totalLessons,
  completedLessons,
}: SubjectOverviewCardProps) {
  const pendingLessons = totalLessons - completedLessons;
  const completionPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-primary flex items-center">
            {icon}
            <span className="ml-2">{subjectName}</span>
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {completionPercentage}% Complete
          </span>
        </div>
        <CardDescription>Overview of your progress in {subjectName}.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-muted-foreground"><BookOpen size={16} className="mr-2" /> Total Lessons:</span>
            <span className="font-semibold">{totalLessons}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-2" /> Completed:</span>
            <span className="font-semibold text-green-600">{completedLessons}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center text-orange-600"><ListChecks size={16} className="mr-2" /> Pending:</span>
            <span className="font-semibold text-orange-600">{pendingLessons}</span>
          </div>
          <div className="pt-1">
            <Progress value={completionPercentage} className="h-3 [&>div]:bg-primary" aria-label={`${subjectName} completion progress`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
