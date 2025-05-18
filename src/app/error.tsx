
"use client"; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import AppLayout from '@/components/AppLayout'; // Assuming AppLayout can be rendered simply

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-3xl font-bold mb-2 text-destructive">Oops! Something went wrong.</h2>
        <p className="text-lg text-muted-foreground mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        {error.message && <p className="text-sm bg-destructive/10 p-2 rounded-md mb-4">Error details: {error.message}</p>}
        <Button
          onClick={() => reset()}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Try again
        </Button>
      </div>
    </AppLayout>
  );
}
