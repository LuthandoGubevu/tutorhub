
"use client";

import type { SubmittedWork } from '@/types';
import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts'; // Removed Tooltip from here
import {
  ChartContainer,
  ChartTooltip, // Add ChartTooltip import
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SubjectBreakdownChartProps {
  submissions: SubmittedWork[];
}

interface ChartDataPoint {
  name: 'Mathematics' | 'Physics';
  value: number;
  fill: string;
}

const COLORS = {
  Mathematics: "hsl(var(--chart-1))",
  Physics: "hsl(var(--chart-2))",
};

export default function SubjectBreakdownChart({ submissions }: SubjectBreakdownChartProps) {
  const aggregateBySubject = (): ChartDataPoint[] => {
    let mathCount = 0;
    let physicsCount = 0;

    submissions.forEach(sub => {
      if (sub.lesson.subject === 'Mathematics') {
        mathCount++;
      } else if (sub.lesson.subject === 'Physics') {
        physicsCount++;
      }
    });
    
    const data: ChartDataPoint[] = [];
    if (mathCount > 0) data.push({ name: 'Mathematics', value: mathCount, fill: COLORS.Mathematics });
    if (physicsCount > 0) data.push({ name: 'Physics', value: physicsCount, fill: COLORS.Physics });
    
    return data;
  };

  const chartData = aggregateBySubject();

  if (submissions.length === 0 || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submissions by Subject</CardTitle>
          <CardDescription>No submissions data to display.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Awaiting student submissions.</p>
        </CardContent>
      </Card>
    );
  }
  
  const chartConfig = {
    Mathematics: { label: 'Mathematics', color: COLORS.Mathematics },
    Physics: { label: 'Physics', color: COLORS.Physics },
  } satisfies import('@/components/ui/chart').ChartConfig;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions by Subject</CardTitle>
        <CardDescription>Distribution of submissions across subjects.</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="name" />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

