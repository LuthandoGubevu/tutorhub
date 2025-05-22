
import type { Branch } from '@/types';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface BranchCardProps {
  branch: Branch;
}

export default function BranchCard({ branch }: BranchCardProps) {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#103452]">{branch.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm text-muted-foreground line-clamp-3">
          {branch.description}
        </CardDescription>
         <p className="text-xs text-muted-foreground mt-2">Contains {branch.lessons.length} lessons.</p>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Button asChild className="w-full bg-[#103452] hover:bg-[#0d2a43] text-accent-foreground">
          <Link href={`/mathematics/branch/${branch.id}`} className="flex items-center justify-center">
            View Lessons <ArrowRight size={16} className="ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
