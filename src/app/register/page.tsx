
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cellNumber, setCellNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!fullName || !email || !password || !confirmPassword || !cellNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please re-enter.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Simulate API call / Firebase registration
    console.log("Registration Details:", {
      fullName,
      email,
      password, // In a real app, NEVER log passwords
      cellNumber,
    });

    // Placeholder for actual registration logic
    // try {
    //   // const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    //   // const user = userCredential.user;
    //   // await setDoc(doc(db, "users", user.uid), {
    //   //   uid: user.uid,
    //   //   fullName,
    //   //   email,
    //   //   cellNumber,
    //   //   role: 'student', // Default role
    //   //   createdAt: new Date().toISOString(),
    //   // });
    //   toast({ title: "Account Created!", description: "You can now log in." });
    //   router.push('/login');
    // } catch (error: any) {
    //   toast({ title: "Registration Failed", description: error.message || "Could not create account.", variant: "destructive" });
    // }

    // For now, just show success and redirect (simulated)
    setTimeout(() => {
      toast({ title: "Registration Submitted (Simulated)", description: "Details logged to console. You would normally be redirected." });
      // router.push('/login'); // Uncomment when actual registration is implemented
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary to-accent p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Create Your Account</CardTitle>
          <CardDescription className="text-md">Join TutorHub Online Academy and start learning!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <Label htmlFor="cellNumber">Cell Number</Label>
              <Input
                id="cellNumber"
                type="tel"
                placeholder="e.g., 0821234567"
                value={cellNumber}
                onChange={(e) => setCellNumber(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Create Account
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
