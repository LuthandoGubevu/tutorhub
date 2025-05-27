
"use client";

import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { mathematicsBranches, physicsLessons, getLessonById } from '@/lib/data';
import SubjectOverviewCard from '@/components/dashboard/SubjectOverviewCard';
import AssignmentSummaryTable from '@/components/dashboard/AssignmentSummaryTable';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import { Atom, Sigma, BarChart3, LayoutGrid, AlertCircle, Loader2 } from 'lucide-react';
import type { Lesson, SubmittedWork, SubmittedWorkFirestoreData } from '@/types';
import { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { useStudentData } from '@/contexts/StudentDataContext'; // For bookings

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { bookings } = useStudentData(); // Get bookings from context
  const [submittedWork, setSubmittedWork] = useState<SubmittedWork[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);

  // Consolidate all math lessons from branches
  const allMathematicsLessons: Lesson[] = useMemo(() => mathematicsBranches.reduce((acc, branch) => {
    return acc.concat(branch.lessons);
  }, [] as Lesson[]), []);

  const allLessons = useMemo(() => [...allMathematicsLessons, ...physicsLessons], [allMathematicsLessons]);

  useEffect(() => {
    if (currentUser?.uid) {
      setIsLoadingSubmissions(true);
      const q = query(
        collection(db, "submittedWork"),
        where("studentId", "==", currentUser.uid),
        orderBy("submittedAt", "desc")
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const work: SubmittedWork[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as SubmittedWorkFirestoreData;
          const lessonDetail = getLessonById(data.lessonSubject, data.lessonId);
          if (lessonDetail) {
            work.push({
              id: doc.id,
              ...data,
              lesson: lessonDetail,
              submittedAt: (data.submittedAt as Timestamp).toDate().toISOString(),
            });
          }
        });
        setSubmittedWork(work);
        setIsLoadingSubmissions(false);
      }, (error) => {
        console.error("Error fetching student submissions:", error);
        setIsLoadingSubmissions(false);
        // Potentially show a toast error
      });

      return () => unsubscribe();
    } else {
      setSubmittedWork([]);
      setIsLoadingSubmissions(false);
    }
  }, [currentUser?.uid]);

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
  
  if (isLoadingSubmissions && currentUser) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="ml-4 text-lg text-foreground">Loading your dashboard...</p>
        </div>
      </AppLayout>
    );
  }

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
                {isLoadingSubmissions ? (
                    <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         <p className="ml-2">Loading assignments...</p>
                    </div>
                ) : (
                    <AssignmentSummaryTable submittedWork={submittedWork} allLessons={allLessons} />
                )}
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
                      <span className="font-semibold text-foreground">Data Persistence:</span> Student progress is now stored in Firestore for persistence across devices. Bookings are currently in local storage.
                  </p>
                  <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Live Data:</span> Your assignment data is now fetched in real-time from Firestore.
                  </p>
                   <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Mock Grades:</span> Performance charts display scores assigned by tutors.
                  </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </div>
    </AppLayout>
  );
}
