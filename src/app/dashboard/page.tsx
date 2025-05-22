
"use client";

import AppLayout from '@/components/AppLayout';
import { useStudentData } from '@/contexts/StudentDataContext';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mathematicsBranches, physicsLessons } from '@/lib/data'; // Updated import
import SubjectOverviewCard from '@/components/dashboard/SubjectOverviewCard';
import AssignmentSummaryTable from '@/components/dashboard/AssignmentSummaryTable';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import { Atom, Sigma, BarChart3, LayoutGrid, AlertCircle } from 'lucide-react';
import type { Lesson } from '@/types';

export default function DashboardPage() {
  const { submittedWork, bookings } = useStudentData();
  const { currentUser } = useAuth(); // Get currentUser

  // Consolidate all math lessons from branches
  const allMathematicsLessons: Lesson[] = mathematicsBranches.reduce((acc, branch) => {
    return acc.concat(branch.lessons);
  }, [] as Lesson[]);

  const allLessons = [...allMathematicsLessons, ...physicsLessons];

  const getSubjectData = (subject: 'Mathematics' | 'Physics') => {
    const subjectLessons = subject === 'Mathematics' ? allMathematicsLessons : physicsLessons;
    const completed = submittedWork.filter(sw => sw.lesson.subject === subject).length;
    return {
      total: subjectLessons.length,
      completed: completed,
    };
  };

  const mathData = getSubjectData('Mathematics');
  const physicsData = getSubjectData('Physics');

  const totalLessons = mathData.total + physicsData.total;
  const totalCompletedLessons = mathData.completed + physicsData.completed;
  const overallCompletionPercentage = totalLessons > 0 ? Math.round((totalCompletedLessons / totalLessons) * 100) : 0;

  const getFirstName = (displayName: string | null | undefined): string => {
    if (!displayName) return "There";
    return displayName.split(' ')[0];
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <Card className="shadow-lg bg-[#103452] text-primary-foreground">
          <CardHeader className="flex flex-row justify-between items-start p-6">
            <div>
              <CardTitle className="text-4xl font-bold">
                Hi, {getFirstName(currentUser?.displayName)}
              </CardTitle>
              <CardDescription className="text-lg text-primary-foreground/90 mt-1">
                Track your progress, manage assignments, and view performance insights.
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/80">Overall Progress</p>
              <p className="text-3xl font-bold text-primary-foreground">{overallCompletionPercentage}%</p>
            </div>
          </CardHeader>
        </Card>

        {/* Subject Overviews & Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <SubjectOverviewCard
              subjectName="Mathematics"
              icon={<Sigma />}
              totalLessons={mathData.total}
              completedLessons={mathData.completed}
            />
            <SubjectOverviewCard
              subjectName="Physics"
              icon={<Atom />}
              totalLessons={physicsData.total}
              completedLessons={physicsData.completed}
            />
          </div>
          <div className="lg:col-span-1">
             <AlertsPanel bookings={bookings} allLessons={allLessons} submittedWork={submittedWork} />
          </div>
        </div>

        <Tabs defaultValue="assignments" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
            <TabsTrigger value="assignments" className="flex items-center gap-2"><LayoutGrid size={16}/>Assignments</TabsTrigger>
            <TabsTrigger value="math-performance" className="flex items-center gap-2"><BarChart3 size={16}/>Maths Performance</TabsTrigger>
            <TabsTrigger value="physics-performance" className="flex items-center gap-2"><BarChart3 size={16}/>Physics Performance</TabsTrigger>
            <TabsTrigger value="important-notes" className="flex items-center gap-2"><AlertCircle size={16}/>Important Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assignments">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Assignment Summary</CardTitle>
                <CardDescription>Overview of all your lessons and their current status.</CardDescription>
              </CardHeader>
              <CardContent>
                <AssignmentSummaryTable submittedWork={submittedWork} allLessons={allLessons} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="math-performance">
             <PerformanceChart submittedWork={submittedWork} subject="Mathematics" />
          </TabsContent>
          
          <TabsContent value="physics-performance">
            <PerformanceChart submittedWork={submittedWork} subject="Physics" />
          </TabsContent>

          <TabsContent value="important-notes">
            <Card>
              <CardHeader>
                  <CardTitle>Important Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Data Persistence:</span> Student progress and bookings are currently stored in your browser's local storage. This data will be lost if you clear your browser data or switch browsers.
                  </p>
                  <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Mock Grades:</span> Performance charts display mock scores for 'Reviewed' assignments to demonstrate functionality. Actual grading by tutors is not yet implemented in this prototype.
                  </p>
                   <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Real-time Updates:</span> The dashboard reflects data from local storage. Real-time updates from a central database (like Firebase Firestore) would require further backend integration.
                  </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  );
}
