
import type { Lesson, TutorAvailability, Branch } from '@/types';
import {
  Calculator,
  Shapes,
  FunctionSquare,
  Landmark,
  Sigma,
  Dices,
  BarChartBig,
  DraftingCompass,
  Triangle,
  Square,
  Ratio,
  Copy,
} from 'lucide-react';

const generateLessonsForBranch = (branchId: string, branchTitle: string, count: number): Lesson[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${branchId}-lesson-${i + 1}`,
    subject: 'Mathematics',
    title: `${branchTitle}: Lesson ${i + 1}`,
    videoUrl: 'https://www.youtube.com/embed/VScM8Z8Jls0', 
    richTextContent: `<p>This is placeholder content for ${branchTitle}, Lesson ${i + 1}.</p><p>Explore related concepts and examples here. This lesson focuses on a specific aspect of ${branchTitle.toLowerCase()}.</p>`,
    question: `What is a key concept in ${branchTitle}, Lesson ${i + 1}? (Placeholder question)`,
    exampleSolution: `Example solution for ${branchTitle}, Lesson ${i + 1}. (Placeholder solution)`,
  }));
};

export const mathematicsBranches: Branch[] = [
  {
    id: 'algebra',
    title: 'Algebra',
    description: 'Learn to manipulate equations, expressions, and inequalities using letters and symbols. Build a foundation for solving problems logically.',
    lessons: generateLessonsForBranch('algebra', 'Algebra', 5),
    icon: Calculator,
  },
  {
    id: 'patterns',
    title: 'Patterns',
    description: 'Recognize number sequences and develop rules to describe and predict how they behave. Useful for understanding complex relationships.',
    lessons: generateLessonsForBranch('patterns', 'Patterns', 5),
    icon: Shapes,
  },
  {
    id: 'functions',
    title: 'Functions',
    description: 'Explore how one value depends on another. Graph and interpret linear, quadratic, exponential, and other functions.',
    lessons: generateLessonsForBranch('functions', 'Functions', 5),
    icon: FunctionSquare,
  },
  {
    id: 'financial-math',
    title: 'Financial Mathematics',
    description: 'Understand real-world applications of math including interest, inflation, depreciation, and loan calculations.',
    lessons: generateLessonsForBranch('financial-math', 'Financial Mathematics', 5),
    icon: Landmark,
  },
  {
    id: 'calculus',
    title: 'Calculus',
    description: 'Study rates of change and the behavior of functions using derivatives. Essential for advanced problem-solving and science.',
    lessons: generateLessonsForBranch('calculus', 'Calculus', 5),
    icon: Sigma,
  },
  {
    id: 'probability',
    title: 'Probability',
    description: 'Calculate the likelihood of events happening using basic probability rules. Useful in real-life decision-making and statistics.',
    lessons: generateLessonsForBranch('probability', 'Probability', 5),
    icon: Dices,
  },
  {
    id: 'statistics',
    title: 'Statistics',
    description: 'Collect, organize, and interpret data. Learn to calculate mean, median, mode, and use graphs to describe data sets.',
    lessons: generateLessonsForBranch('statistics', 'Statistics', 5),
    icon: BarChartBig,
  },
  {
    id: 'analytical-geometry',
    title: 'Analytical Geometry',
    description: 'Use coordinates and algebra to solve geometric problems, like finding gradients, midpoints, and equations of lines.',
    lessons: generateLessonsForBranch('analytical-geometry', 'Analytical Geometry', 5),
    icon: DraftingCompass,
  },
  {
    id: 'trigonometry',
    title: 'Trigonometry',
    description: 'Study the relationships between angles and sides in triangles. Learn how to solve problems using sine, cosine, and tangent.',
    lessons: generateLessonsForBranch('trigonometry', 'Trigonometry', 5),
    icon: Triangle,
  },
  {
    id: 'euclidean-geometry',
    title: 'Euclidean Geometry',
    description: 'Use axioms and theorems to prove geometric facts. Focuses on shapes, lines, angles, and congruence in two dimensions.',
    lessons: generateLessonsForBranch('euclidean-geometry', 'Euclidean Geometry', 5),
    icon: Square,
  },
  {
    id: 'proportionality-theorem',
    title: 'Proportionality Theorem',
    description: 'Explore how ratios and similar triangles help solve geometry problems involving parallel lines and sides.',
    lessons: generateLessonsForBranch('proportionality-theorem', 'Proportionality Theorem', 5),
    icon: Ratio,
  },
  {
    id: 'similarities',
    title: 'Similarities',
    description: 'Understand when shapes have the same shape but different sizes. Learn the rules for proving triangles are similar.',
    lessons: generateLessonsForBranch('similarities', 'Similarities', 5),
    icon: Copy,
  },
];

export const physicsLessons: Lesson[] = Array.from({ length: 10 }, (_, i) => ({
  id: `phys-${i + 1}`,
  subject: 'Physics',
  title: `Physics Lesson ${i + 1}: Exploring ${i % 2 === 0 ? 'Newtonian Mechanics' : 'Thermodynamics'} Principle ${Math.floor(i/2) + 1}`,
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', 
  richTextContent: `<p>Welcome to Physics Lesson ${i + 1}.</p><p>Today's topic involves understanding <strong>forces</strong> and <em>energy transformations</em>.</p><p>Key equation: \\( F = ma \\). We will also discuss concepts like kinetic energy: \\( KE = \\frac{1}{2}mv^2 \\).</p>`,
  question: `A ball of mass 2kg is thrown upwards with an initial velocity of 10 m/s. What is its maximum potential energy? (g = 9.8 m/s^2)`,
  exampleSolution: `Initial kinetic energy KE = 0.5 * m * v^2 = 0.5 * 2 * 10^2 = 100 J. At maximum height, all KE is converted to PE. So, max PE = 100 J.`,
}));

export const getLessonById = (subject: 'Mathematics' | 'Physics', lessonId: string): Lesson | undefined => {
  if (subject === 'Mathematics') {
    for (const branch of mathematicsBranches) {
      const lesson = branch.lessons.find(l => l.id === lessonId);
      if (lesson) return lesson;
    }
    return undefined;
  }
  return physicsLessons.find(lesson => lesson.id === lessonId);
};

export const getBranchById = (branchId: string): Branch | undefined => {
  return mathematicsBranches.find(branch => branch.id === branchId);
};


export const tutorAvailability: TutorAvailability[] = [
  {
    date: new Date(new Date().setDate(new Date().getDate() + 3)), 
    timeSlots: ["09:00", "09:30", "10:00", "14:00", "14:30"],
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 4)), 
    timeSlots: ["10:30", "11:00", "11:30", "15:00", "15:30", "16:00"],
  },
  {
    date: new Date(new Date().setDate(new Date().getDate() + 7)), 
    timeSlots: ["09:00", "13:00", "13:30"],
  },
];
