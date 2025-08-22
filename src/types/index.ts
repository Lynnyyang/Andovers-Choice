// Game state and data types for DID Analysis App

export interface GameState {
  currentScene: SceneId;
  startTime: Date;
  scores: Scores;
  completedTasks: number;
  unlockedScenes: SceneId[];
  budget: number;
  samples: HouseSample[];
  currentYear: number;
  regressionHistory: RegressionResult[];
  finalModel: RegressionResult | null;
  addedVariables: string[];
  usedLogPrice: boolean;
}

export type SceneId = 
  | 'prologue' 
  | 'data-collection' 
  | 'initial-analysis' 
  | 'did-breakthrough' 
  | 'model-refinement' 
  | 'final-judgment' 
  | 'final-summary' 
  | 'certificate';

export interface Scores {
  task1: number;
  task2: number;
  task3: number;
  dataCollection: number;
  analysis: number;
  interaction: number;
  total: number;
}

export interface HouseSample {
  id: string;
  price: number;
  logPrice: number;
  nearinc: number;
  y81: number;
  age: number;
  area: number;
  rooms: number;
  x: number;
  y: number;
  year: number;
}

export interface RegressionResult {
  coefficients: number[];
  variables: string[];
  rSquared: number;
  sampleSize: number;
  standardErrors?: number[];
  tStats?: number[];
  pValues?: number[];
}

export interface SceneConfig {
  id: SceneId;
  title: string;
  subtitle: string;
  icon: string;
  locked: boolean;
  completed: boolean;
  score?: number;
}

export interface Question {
  id: string;
  type: 'single' | 'multiple' | 'drag-drop';
  question: string;
  options: QuestionOption[];
  correctAnswer: string | string[];
  explanation: string;
  maxScore: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  value: string;
}

export interface DataGenerationProcess {
  intercept: number;
  y81: number;
  nearinc: number;
  interaction: number;
  age: number;
  area: number;
  rooms: number;
}

export interface AnalysisTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  score: number;
  maxScore: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }[];
}

export interface CertificateData {
  studentName: string;
  completionDate: string;
  totalScore: number;
  grade: string;
  duration: string;
  scoreBreakdown: {
    theory: number;
    dataCollection: number;
    analysis: number;
    interaction: number;
  };
}