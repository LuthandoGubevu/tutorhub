
import AppLayout from '@/components/AppLayout';
import BranchCard from '@/components/branches/BranchCard';
import { mathematicsBranches } from '@/lib/data';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sigma } from 'lucide-react';

export default function MathematicsPage() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <Card className="shadow-lg bg-[#103452] text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-4xl font-bold flex items-center">
              <Sigma size={40} className="mr-3"/> Mathematics Branches
            </CardTitle>
            <CardDescription className="text-lg text-primary-foreground/90">
              Explore various branches of Mathematics. Select a branch to view its lessons.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mathematicsBranches.map((branch) => (
            <BranchCard key={branch.id} branch={branch} />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
