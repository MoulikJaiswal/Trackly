
import React from 'react';
import { 
  Zap, 
  FlaskConical, 
  Divide, 
  Brain, 
  Timer, 
  AlertCircle, 
  Eye, 
  Wind, 
  Search 
} from 'lucide-react';

export const JEE_SYLLABUS = {
  Physics: ["Units and Measurements", "Kinematics", "Laws of Motion", "Work, Energy and Power", "Rotational Motion", "Gravitation", "Properties of Solids and Liquids", "Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves", "Electrostatics", "Current Electricity", "Magnetic Effects of Current and Magnetism", "Electromagnetic Induction and AC", "Electromagnetic Waves", "Optics", "Dual Nature of Matter and Radiation", "Atoms and Nuclei", "Electronic Devices", "Experimental Skills"],
  Chemistry: ["Some Basic Concepts in Chemistry", "Atomic Structure", "Chemical Bonding & Molecular Structure", "Chemical Thermodynamics", "Solutions", "Equilibrium", "Redox Reactions and Electrochemistry", "Chemical Kinetics", "Classification of Elements", "p-Block Elements", "d and f Block Elements", "Coordination Compounds", "Purification of Organic Compounds", "Basic Principles of Organic Chemistry", "Hydrocarbons", "Organic Compounds containing Halogens", "Organic Compounds containing Oxygen", "Organic Compounds containing Nitrogen", "Biomolecules", "Principles Related to Practical Chemistry"],
  Maths: ["Sets, Relations and Functions", "Complex Numbers and Quadratic Equations", "Matrices and Determinants", "Permutations and Combinations", "Binomial Theorem", "Sequence and Series", "Limit, Continuity and Differentiability", "Integral Calculus", "Differential Equations", "Co-ordinate Geometry", "Three Dimensional Geometry", "Vector Algebra", "Statistics and Probability", "Trigonometry"]
};

export const MISTAKE_TYPES = [
  { id: 'concept', label: 'Concept Gap', color: 'text-orange-400', icon: <Brain size={14} /> },
  { id: 'formula', label: 'Formula Recall', color: 'text-blue-400', icon: <Zap size={14} /> },
  { id: 'calc', label: 'Calculation/Algebra', color: 'text-rose-400', icon: <Divide size={14} /> },
  { id: 'read', label: 'Misread Question', color: 'text-emerald-400', icon: <Eye size={14} /> },
  { id: 'panic', label: 'Time Pressure', color: 'text-purple-400', icon: <Timer size={14} /> },
  { id: 'overthink', label: 'Overthinking', color: 'text-yellow-400', icon: <AlertCircle size={14} /> },
] as const;

export const QUOTES = [
  { text: "Success is the sum of small efforts, repeated day-in and day-out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.", author: "Colin Powell" },
  { text: "Strive for progress, not perfection.", author: "Unknown" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Education is the passport to the future, for tomorrow belongs to those who prepare for it today.", author: "Malcolm X" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
  { text: "Success doesn't come to you, you've got to go to it.", author: "Marva Collins" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi" },
  { text: "Failure is the opportunity to begin again more intelligently.", author: "Henry Ford" },
  { text: "Genius is 1% inspiration and 99% perspiration.", author: "Thomas Edison" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle" },
  { text: "Your attitude, not your aptitude, will determine your altitude.", author: "Zig Ziglar" },
  { text: "If you can dream it, you can do it.", author: "Walt Disney" },
  { text: "Action is the foundational key to all success.", author: "Pablo Picasso" }
];
