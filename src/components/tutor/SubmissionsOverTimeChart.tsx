
"use client";

import type { SubmittedWork } from '@/types';
import { Line, LineChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'; // Removed Tooltip from here as ChartTooltip is used
import {
  ChartContainer,
  ChartTooltip, // Add ChartTooltip import
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';

interface SubmissionsOverTimeChartProps {
  submissions: SubmittedWork[];
}

interface ChartDataPoint {
  date: string;
  count: number;
}

export default function SubmissionsOverTimeChart({ submissions }: SubmissionsOverTimeChartProps) {
  const aggregateSubmissionsByDate = (): ChartDataPoint[] => {
    const countsByDate: Record<string, number> = {};
    submissions.forEach(sub => {
      const date = format(parseISO(sub.submittedAt), 'yyyy-MM-dd');
      countsByDate[date] = (countsByDate[date] || 0) + 1;
    });

    return Object.entries(countsByDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const chartData = aggregateSubmissionsByDate();

  if (submissions.length === 0 || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submissions Over Time</CardTitle>
          <CardDescription>No submissions data to display.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Awaiting student submissions.</p>
        </CardContent>
      </Card>
    );
  }

  const chartConfig = {
    submissions: {
      label: "Submissions",
      color: "hsl(var(--primary))",
    },
  } satisfies import('@/components/ui/chart').ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submissions Over Time</CardTitle>
        <CardDescription>Volume of submissions received per day.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => format(parseISO(value), 'MMM d')}
              />
              <YAxis tickMargin={8} tickLine={false} axisLine={false} allowDecimals={false} />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent 
                            formatter={(value, name, props) => {
                                if (name === "count") {
                                    return (
                                      <>
                                        <div className="font-medium">{format(parseISO(props.payload.date), 'PPP')}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Submissions: <span className="font-bold text-foreground">{value}</span>
                                        </div>
                                      </>
                                    )
                                }
                                return null;
                            }}
                        />}
              />
              <Line type="monotone" dataKey="count" stroke="var(--color-submissions)" strokeWidth={2} dot={{ r: 4, fill: "var(--color-submissions)" }} name="count" />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

