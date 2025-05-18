
// This page is protected by TutorDashboardLayout
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Users, BookCheck } from "lucide-react";

export default function TutorDashboardPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg bg-gradient-to-r from-primary to-accent text-primary-foreground">
        <CardHeader>
          <CardTitle className="text-4xl font-bold">Tutor Dashboard</CardTitle>
          <CardDescription className="text-lg text-primary-foreground/90">
            Manage students, review submissions, and oversee platform activity.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">150</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">+20 from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions to Review</CardTitle>
            <BookCheck className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">5 urgent</p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Review Time</CardTitle>
            <BarChart className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24 hours</div> {/* Placeholder */}
            <p className="text-xs text-muted-foreground">Improving by 10%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Tutor-specific components and data views would go here.
            For example, a table of student submissions, student management tools, etc.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
