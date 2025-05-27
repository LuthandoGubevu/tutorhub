
"use client";

import type { SubmittedWork, SubmittedWorkFirestoreData, Lesson } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Eye, ListChecks, BookOpen, CheckCircle, Users, Sigma, Atom, Percent, Filter, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import MetricCard from '@/components/tutor/MetricCard';
import SubmissionsOverTimeChart from '@/components/tutor/SubmissionsOverTimeChart';
import SubjectBreakdownChart from '@/components/tutor/SubjectBreakdownChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Ensure Label is imported
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { getLessonById } from '@/lib/data';
import { useAuth } from '@/contexts/AuthContext';

export default function TutorDashboardPage() {
  const [allSubmissions, setAllSubmissions] = useState<SubmittedWork[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [filterSubject, setFilterSubject] = useState<'All' | 'Mathematics' | 'Physics'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Reviewed'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { isGlobalAdminTutor, currentUser } = useAuth();


  useEffect(() => {
    // Only fetch if user is a tutor (basic check, AuthContext layout handles stricter access)
    if (currentUser?.role === 'tutor') {
      setIsLoadingSubmissions(true);
      // For now, all tutors see all submissions.
      // If isGlobalAdminTutor or other role distinctions are needed for fetching,
      // the query could be adjusted here.
      const q = query(collection(db, "submittedWork"), orderBy("submittedAt", "desc"));

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
          } else {
            // Handle case where lesson might have been deleted or ID is incorrect
            // For now, we'll log and potentially skip this submission from display
            console.warn(`Lesson with ID ${data.lessonId} and subject ${data.lessonSubject} not found for submission ${doc.id}`);
          }
        });
        setAllSubmissions(work);
        setIsLoadingSubmissions(false);
      }, (error) => {
        console.error("Error fetching submissions for tutor:", error);
        setIsLoadingSubmissions(false);
        // Potentially show a toast error
      });

      return () => unsubscribe();
    }
  }, [currentUser?.role, isGlobalAdminTutor]); // Depend on role or admin status if query changes

  const metrics = useMemo(() => {
    const totalSubmissions = allSubmissions.length;
    const pendingReviews = allSubmissions.filter(s => s.status === 'Pending').length;
    const reviewedSubmissions = allSubmissions.filter(s => s.status === 'Reviewed').length;
    const activeStudents = new Set(allSubmissions.map(s => s.studentId)).size;

    const mathScores = allSubmissions.filter(s => s.lesson.subject === 'Mathematics' && typeof s.score === 'number').map(s => s.score as number);
    const physicsScores = allSubmissions.filter(s => s.lesson.subject === 'Physics' && typeof s.score === 'number').map(s => s.score as number);

    const avgMathScore = mathScores.length > 0 ? (mathScores.reduce((a, b) => a + b, 0) / mathScores.length).toFixed(1) + '%' : 'N/A';
    const avgPhysicsScore = physicsScores.length > 0 ? (physicsScores.reduce((a, b) => a + b, 0) / physicsScores.length).toFixed(1) + '%' : 'N/A';
    
    return {
      totalSubmissions,
      pendingReviews,
      reviewedSubmissions,
      activeStudents,
      avgMathScore,
      avgPhysicsScore,
    };
  }, [allSubmissions]);

  const filteredSubmissions = useMemo(() => {
    return allSubmissions
      .filter(submission => {
        const subjectMatch = filterSubject === 'All' || submission.lesson.subject === filterSubject;
        const statusMatch = filterStatus === 'All' || submission.status === filterStatus;
        const searchTermMatch = searchTerm === '' || 
                                (submission.lessonTitle && submission.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                (submission.studentId && submission.studentId.toLowerCase().includes(searchTerm.toLowerCase()));
        return subjectMatch && statusMatch && searchTermMatch;
      });
      // Sorting is handled by Firestore query (orderBy submittedAt desc)
  }, [allSubmissions, filterSubject, filterStatus, searchTerm]);


  return (
    <div className="space-y-8">
      <Card className="shadow-lg bg-[#103452] text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-4xl font-bold flex items-center"><ListChecks size={40} className="mr-3"/>Tutor Dashboard</CardTitle>
          <CardDescription className="text-lg text-primary-foreground/90">
            Review student submissions, track progress, and provide feedback.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Total Submissions" value={isLoadingSubmissions ? '...' : metrics.totalSubmissions} icon={<BookOpen size={20}/>} />
        <MetricCard title="Pending Reviews" value={isLoadingSubmissions ? '...' : metrics.pendingReviews} icon={<CheckCircle size={20} className="text-orange-500"/>} />
        <MetricCard title="Reviewed Submissions" value={isLoadingSubmissions ? '...' : metrics.reviewedSubmissions} icon={<CheckCircle size={20} className="text-green-500"/>} />
        <MetricCard title="Active Students" value={isLoadingSubmissions ? '...' : metrics.activeStudents} icon={<Users size={20}/>} />
        <MetricCard title="Avg. Math Score" value={isLoadingSubmissions ? '...' : metrics.avgMathScore} icon={<Sigma size={20}/>} />
        <MetricCard title="Avg. Physics Score" value={isLoadingSubmissions ? '...' : metrics.avgPhysicsScore} icon={<Atom size={20}/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubmissionsOverTimeChart submissions={allSubmissions} />
        <SubjectBreakdownChart submissions={allSubmissions} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Student Submissions</CardTitle>
          <CardDescription>Browse and manage all submitted work.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 border rounded-lg bg-muted/30">
            <div className="flex-1">
              <Label htmlFor="search-submissions" className="sr-only">Search</Label>
              <Input 
                id="search-submissions"
                type="text" 
                placeholder="Search by lesson title or student ID..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full"
              />
            </div>
            <div className="flex-1 sm:flex-none">
              <Label htmlFor="filter-subject" className="sr-only">Filter by Subject</Label>
              <Select value={filterSubject} onValueChange={(value: 'All' | 'Mathematics' | 'Physics') => setFilterSubject(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Subjects</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="flex-1 sm:flex-none">
              <Label htmlFor="filter-status" className="sr-only">Filter by Status</Label>
              <Select value={filterStatus} onValueChange={(value: 'All' | 'Pending' | 'Reviewed') => setFilterStatus(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Statuses</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Reviewed">Reviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoadingSubmissions ? (
            <div className="flex justify-center items-center h-60">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="ml-3 text-lg">Loading submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No submissions match your current filters, or no submissions yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubmissions.map((submission: SubmittedWork) => (
                <Card key={submission.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl">{submission.lessonTitle || 'Lesson Title Missing'}</CardTitle>
                    <CardDescription>
                      Student ID: {submission.studentId} <br />
                      Subject: {submission.lessonSubject || 'N/A'} <br/>
                      Submitted: {format(parseISO(submission.submittedAt), "MMM d, yyyy 'at' HH:mm")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status:</p>
                      <Badge variant={submission.status === 'Reviewed' ? 'default' : 'secondary'}
                             className={submission.status === 'Reviewed' ? 'bg-green-500 hover:bg-green-600' : 'bg-orange-500 hover:bg-orange-600'}>
                        {submission.status}
                      </Badge>
                    </div>
                    {submission.score !== undefined && (
                       <p className="text-sm text-muted-foreground">Score: <span className="font-semibold text-foreground">{submission.score}%</span></p>
                    )}
                     {submission.aiFeedbackSuggestion && !submission.tutorFeedback && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 italic">AI suggestion available</p>
                    )}
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button asChild className="w-full bg-accent hover:bg-accent/90">
                      <Link href={`/tutor-dashboard/submission/${submission.id}`}>
                        <Eye size={16} className="mr-2"/> View Details
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
