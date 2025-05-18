
"use client";

import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface MathInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  readOnly?: boolean;
}

export default function MathInput({ 
  value, 
  onChange, 
  placeholder = "Enter your answer here (e.g., x = 5 or F = 10N)", 
  label="Your Answer",
  readOnly = false 
}: MathInputProps) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!readOnly) {
      onChange(event.target.value);
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="math-input" className="text-lg font-medium">{label}</Label>}
      <Textarea
        id="math-input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
        disabled={readOnly}
        className={cn(
          "min-h-[100px] text-base border-2 border-input focus:border-primary shadow-sm rounded-md p-3",
          readOnly && "bg-muted cursor-not-allowed opacity-70"
        )}
        aria-label="Math input field"
        aria-readonly={readOnly}
      />
      <p className="text-xs text-muted-foreground">
        Note: This is a basic text input. For complex equations, a LaTeX-compatible editor would typically be used.
      </p>
    </div>
  );
}

