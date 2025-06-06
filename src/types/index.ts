// Global type definitions for Judge-It application

// Database schema types
export interface Team {
  id: number;
  name: string;
  is_out?: boolean;
  player_1_id?: number;
  player_2_id?: number;
  player_3_id?: number;
  player_4_id?: number;
  created_at?: string;
}

export interface Player {
  id: number;
  name: string;
  team_id: number;
  image_url?: string;
  fun_fact?: string;
  created_at?: string;
}

export interface Heat {
  id: number;
  name?: string;
  heat: number;
  date: string;
  is_current: boolean;
  created_at?: string;
}

export interface TimeType {
  id: number;
  name: string;
  time_eng: string;
  description?: string;
}

export interface TimeLog {
  id: number;
  player_id: number;
  time_type_id: number;
  time_seconds: number;
  heat_id: number;
  team_id?: number;
  time?: string; // Time string format like "HH:MM:SS"
  created_at?: string;
  // Joined data from related tables
  player?: Player;
  time_type?: TimeType;
  heat?: Heat;
  team?: Team;
}

// Component prop types
export interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

export interface StatsData {
  totalPlayers: number;
  totalTeams: number;
  totalHeats: number;
  averageTime: number;
  fastestTime: number;
}

export interface YearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
  availableYears: number[];
}

export interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export interface AuthContextType {
  user: any; // Replace with actual Supabase user type
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
}

// Judge types
export type JudgeType = "main" | "participants" | "beer";

// Time types
export type TimeTypeKey = "Beer" | "Sail" | "Spin";

// Utility function types
export interface SortFilterOptions {
  sortBy: "time" | "name" | "team";
  filterBy?: string;
  ascending?: boolean;
}

export interface VisualizationData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

// Hook return types
export interface FetchDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface YearSelectorResult {
  selectedYear: number;
  availableYears: number[];
  setSelectedYear: (year: number) => void;
}

// Animation prop types
export interface AnimationProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}

// Error types
export interface AppError {
  message: string;
  code?: string;
  details?: any;
}
