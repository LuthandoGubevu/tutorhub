
"use client";

import { useStudentData } from '@/contexts/StudentDataContext';
import type { SubmittedWork, Lesson } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { Eye, ListChecks, BookOpen, CheckCircle, Users, Sigma, Atom, Percent, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import MetricCard from '@/components/tutor/MetricCard';
import SubmissionsOverTimeChart from '@/components/tutor/SubmissionsOverTimeChart';
import SubjectBreakdownChart from '@/components/tutor/SubjectBreakdownChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';

export default function TutorDashboardPage() {
  const { submittedWork } = useStudentData();
  const [filterSubject, setFilterSubject] = useState<'All' | 'Mathematics' | 'Physics'>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Reviewed'>('All');
  const [searchTerm, setSearchTerm] = useState('');


  const metrics = useMemo(() => {
    const totalSubmissions = submittedWork.length;
    const pendingReviews = submittedWork.filter(s => s.status === 'Pending').length;
    const reviewedSubmissions = submittedWork.filter(s => s.status === 'Reviewed').length;
    const activeStudents = new Set(submittedWork.map(s => s.studentId)).size;

    const mathScores = submittedWork.filter(s => s.lesson.subject === 'Mathematics' && typeof s.score === 'number').map(s => s.score as number);
    const physicsScores = submittedWork.filter(s => s.lesson.subject === 'Physics' && typeof s.score === 'number').map(s => s.score as number);

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
  }, [submittedWork]);

  const filteredSubmissions = useMemo(() => {
    return submittedWork
      .filter(submission => {
        const subjectMatch = filterSubject === 'All' || submission.lesson.subject === filterSubject;
        const statusMatch = filterStatus === 'All' || submission.status === filterStatus;
        const searchTermMatch = searchTerm === '' || 
                                submission.lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                submission.studentId.toLowerCase().includes(searchTerm.toLowerCase());
        return subjectMatch && statusMatch && searchTermMatch;
      })
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [submittedWork, filterSubject, filterStatus, searchTerm]);


  return (
    <div className="space-y-8">
      <Card className="shadow-lg bg-[#031b2e] text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-4xl font-bold flex items-center"><ListChecks size={40} className="mr-3"/>Tutor Dashboard</CardTitle>
          <CardDescription className="text-lg text-primary-foreground/90">
            Review student submissions, track progress, and provide feedback.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Total Submissions" value={metrics.totalSubmissions} icon={<BookOpen size={20}/>} />
        <MetricCard title="Pending Reviews" value={metrics.pendingReviews} icon={<CheckCircle size={20} className="text-orange-500"/>} />
        <MetricCard title="Reviewed Submissions" value={metrics.reviewedSubmissions} icon={<CheckCircle size={20} className="text-green-500"/>} />
        <MetricCard title="Active Students" value={metrics.activeStudents} icon={<Users size={20}/>} />
        <MetricCard title="Avg. Math Score" value={metrics.avgMathScore} icon={<Sigma size={20}/>} />
        <MetricCard title="Avg. Physics Score" value={metrics.avgPhysicsScore} icon={<Atom size={20}/>} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SubmissionsOverTimeChart submissions={submittedWork} />
        <SubjectBreakdownChart submissions={submittedWork} />
      </div>
      
      {/* Submissions List & Filters */}
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
                placeholder="Search by lesson or student ID..." 
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

          {filteredSubmissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No submissions match your current filters, or no submissions yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubmissions.map((submission: SubmittedWork) => (
                <Card key={submission.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl">{submission.lesson.title}</CardTitle>
                    <CardDescription>
                      Student ID: {submission.studentId} <br />
                      Subject: {submission.lesson.subject} <br/>
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
                    {submission.score && (
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

// Helper Label component if not using ShadCN one globally in forms for this context
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => (
  <label className={`block text-sm font-medium text-foreground mb-1 ${className}`} {...props} />
);
