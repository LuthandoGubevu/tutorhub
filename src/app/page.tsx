
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { BookOpen, BarChartBig, CalendarCheck, Lightbulb, MessageSquare, ShieldCheck } from 'lucide-react';

// Simple header component for landing page
const LandingHeader = () => (
  <header className="py-4 px-4 md:px-8 bg-[#103452]/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-700 shadow-sm">
    <div className="container mx-auto flex justify-between items-center">
      <Link href="/" className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white text-[#103452] rounded-lg flex items-center justify-center font-bold text-xl shadow-md">
            iK
        </div>
        <span className="text-2xl font-bold text-white">iKasi Tutoring</span>
      </Link>
      <nav className="space-x-2">
        <Button asChild className="bg-white text-[#103452] hover:bg-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <Link href="/login">Sign In</Link>
        </Button>
        <Button asChild className="bg-white text-[#103452] hover:bg-gray-200 shadow-md hover:shadow-lg transition-shadow">
          <Link href="/dashboard">Get Started</Link>
        </Button>
      </nav>
    </div>
  </header>
);

// Simple footer component for landing page
const LandingFooter = () => (
  <footer className="py-10 bg-black/20 text-gray-300 text-center border-t border-gray-700">
    <div className="container mx-auto">
      <p className="font-semibold">&copy; {new Date().getFullYear()} iKasi Tutoring.</p>
      <p className="text-sm mt-1">Empowering Students, One Lesson at a Time.</p>
    </div>
  </footer>
);

export default function LandingPage() {
  const features = [
    {
      icon: <BookOpen size={32} className="text-accent" />, // Accent color still fine on white card
      title: "Interactive Lessons",
      description: "Engage with dynamic lessons featuring video content, rich text explanations, and hands-on math problems to solidify your understanding.",
      imageSrc: "/feature-interactive.png",
      imageAlt: "Interactive online lessons",
    },
    {
      icon: <BarChartBig size={32} className="text-accent" />,
      title: "Answer Saving & Tracking",
      description: "Save your answers with timestamps and view past submissions. Track your progress through your personal, intuitive dashboard.",
      imageSrc: "/feature-tracking.png",
      imageAlt: "Student progress dashboard",
    },
    {
      icon: <CalendarCheck size={32} className="text-accent" />,
      title: "Easy Session Booking",
      description: "Need one-on-one help? Book tutoring sessions effortlessly via our integrated calendar interface with available tutors.",
      imageSrc: "/feature-booking.png",
      imageAlt: "Calendar for booking sessions",
    },
    {
      icon: <Lightbulb size={32} className="text-accent" />,
      title: "AI-Powered Tutor Support",
      description: "Our AI analyzes student answers to provide tutors with insights, helping them pinpoint areas where you might be struggling.",
      imageSrc: "/feature-ai-support.png",
      imageAlt: "AI brain providing support",
    },
    {
      icon: <MessageSquare size={32} className="text-accent" />,
      title: "Valuable Feedback Loop",
      description: "Share your thoughts on lessons through short feedback forms. Your input helps us make iKasi Tutoring even better for everyone!",
      imageSrc: "/feature-feedback.png",
      imageAlt: "Feedback and communication",
    },
    {
      icon: <ShieldCheck size={32} className="text-accent" />,
      title: "Secure & Focused Learning",
      description: "A dedicated platform designed to help you excel in Mathematics and Physics without common online distractions.",
      imageSrc: "/feature-secure.png",
      imageAlt: "Secure learning environment",
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#103452] text-white antialiased">
      <LandingHeader />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-[#103452] via-primary/5 to-[#103452]">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-white tracking-tight">
              Unlock Your Academic Potential
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed">
              iKasi Tutoring is your personalized learning companion for Grade 12 Mathematics and Physics. Experience interactive lessons, AI-powered support, and seamless progress tracking.
            </p>
            <Button asChild size="lg" className="bg-white text-[#103452] hover:bg-gray-200 px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Link href="/dashboard">Start Your Journey</Link>
            </Button>
            <div className="mt-16 mx-auto w-full max-w-4xl">
              <div className="aspect-[1000/500] relative overflow-hidden rounded-xl shadow-2xl border border-gray-700">
                <Image
                  src="/hero-section.jpg"
                  alt="iKasi Tutoring Platform Preview"
                  fill
                  style={{objectFit:"cover"}}
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-[#103452]">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
              Why Choose iKasi Tutoring?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((feature, index) => (
                <div key={index} className="bg-card rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col overflow-hidden">
                  <div className="w-full h-48 relative">
                    <Image
                      src={feature.imageSrc}
                      alt={feature.imageAlt}
                      fill
                      style={{objectFit:"cover"}}
                      className="rounded-t-xl"
                    />
                  </div>
                  <div className="p-8 flex flex-col items-center text-center flex-grow">
                    <div className="flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-semibold mb-3 text-primary">{feature.title}</h3>
                    <p className="text-card-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-28 bg-gradient-to-br from-accent to-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Elevate Your Learning?</h2>
            <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join iKasi Tutoring today and take the first step towards mastering Mathematics and Physics. Your personalized dashboard awaits!
            </p>
            <Button asChild size="lg" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/50 hover:border-white px-10 py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <Link href="/dashboard">Get Started Now</Link>
            </Button>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
}
