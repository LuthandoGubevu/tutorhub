
import type { Lesson, TutorAvailability } from '@/types';

export const mathematicsLessons: Lesson[] = Array.from({ length: 10 }, (_, i) => ({
  id: `math-${i + 1}`,
  subject: 'Mathematics',
  title: `Mathematics Lesson ${i + 1}: Introduction to ${i % 2 === 0 ? 'Calculus' : 'Algebra'} Topic ${Math.floor(i/2) + 1}`,
  videoUrl: i === 0 ? 'https://www.youtube.com/embed/VScM8Z8Jls0' : 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  richTextContent: `<p>This is a rich text explanation for Mathematics Lesson ${i + 1}.</p><p>We will explore <strong>key concepts</strong> and <em>examples</em>.</p><p>A common formula is \\(E = mc^2\\), or more simply for this lesson, consider \\( (a+b)^2 = a^2 + 2ab + b^2 \\).</p>`,
  question: `Solve for x:  2x + 5 = 11. What is the value of x?`,
  exampleSolution: `2x + 5 = 11\\n2x = 11 - 5\\n2x = 6\\nx = 3`,
}));

export const physicsLessons: Lesson[] = Array.from({ length: 10 }, (_, i) => ({
  id: `phys-${i + 1}`,
  subject: 'Physics',
  title: `Physics Lesson ${i + 1}: Exploring ${i % 2 === 0 ? 'Newtonian Mechanics' : 'Thermodynamics'} Principle ${Math.floor(i/2) + 1}`,
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder video, using a known one for consistency
  richTextContent: `<p>Welcome to Physics Lesson ${i + 1}.</p><p>Today's topic involves understanding <strong>forces</strong> and <em>energy transformations</em>.</p><p>Key equation: \\( F = ma \\). We will also discuss concepts like kinetic energy: \\( KE = \\frac{1}{2}mv^2 \\).</p>`,
  question: `A ball of mass 2kg is thrown upwards with an initial velocity of 10 m/s. What is its maximum potential energy? (g = 9.8 m/s^2)`,
  exampleSolution: `Initial kinetic energy KE = 0.5 * m * v^2 = 0.5 * 2 * 10^2 = 100 J. At maximum height, all KE is converted to PE. So, max PE = 100 J.`,
}));

export const getLessonById = (subject: 'Mathematics' | 'Physics', lessonId: string): Lesson | undefined => {
  const lessons = subject === 'Mathematics' ? mathematicsLessons : physicsLessons;
  return lessons.find(lesson => lesson.id === lessonId);
};

export const tutorAvailability: TutorAvailability[] = [
  {
    date: new Date(new Date().setDate(new Date().getDate() + 3)), // 3 days from now
    timeSlots: ["09:00", "09:30", "10:00", "14:00", "14:30"],
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 4)), // 4 days from now
    timeSlots: ["10:30", "11:00", "11:30", "15:00", "15:30", "16:00"],
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 7)), // 7 days from now
    timeSlots: ["09:00", "13:00", "13:30"],
  },
];
