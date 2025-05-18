
"use client";

import type { SubmittedWork } from '@/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface PerformanceChartProps {
  submittedWork: SubmittedWork[];
  subject: 'Mathematics' | 'Physics';
}

export default function PerformanceChart({ submittedWork, subject }: PerformanceChartProps) {
  const subjectSubmissions = submittedWork
    .filter(sw => sw.lesson.subject === subject && sw.score !== undefined && sw.status === 'Reviewed')
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());

  if (subjectSubmissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{subject} Score Trends</CardTitle>
          <CardDescription>No graded assignments yet for {subject}.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Submit and get your assignments reviewed to see your progress.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = subjectSubmissions.map(sw => ({
    date: format(new Date(sw.submittedAt), 'MMM d'),
    lesson: sw.lesson.title.substring(0,15) + "...", // Shorten lesson title for chart
    score: sw.score,
  }));

  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--primary))",
    },
    lesson: {
      label: "Lesson",
      color: "hsl(var(--muted-foreground))",
    }
  } satisfies import('@/components/ui/chart').ChartConfig;


  return (
    <Card>
      <CardHeader>
        <CardTitle>{subject} Score Trends</CardTitle>
        <CardDescription>Your scores on reviewed assignments over time.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                // tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis domain={[0, 100]} tickMargin={8} tickLine={false} axisLine={false} />
               <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                            formatter={(value, name, props) => {
                                if (name === "score" && props.payload.lesson) {
                                    return (
                                        <>
                                        <div className="font-medium">{props.payload.lesson} ({props.payload.date})</div>
                                        <div className="text-sm text-muted-foreground">
                                            Score: <span className="font-bold text-foreground">{value}%</span>
                                        </div>
                                        </>
                                    )
                                }
                                return null;
                            }}
                        />}
              />
              <Bar dataKey="score" fill="var(--color-score)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
