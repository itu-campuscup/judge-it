// Global type definitions for Judge-It application
import { Id } from "convex/_generated/dataModel";

// Auth types
export interface User {
  id: string;
  email?: string;
}

// Database schema types
export interface Team {
  id: Id<"teams">;
  name: string;
  player_1_id?: Id<"players">;
  player_2_id?: Id<"players">;
  player_3_id?: Id<"players">;
  player_4_id?: Id<"players">;
  image_url?: string;
  created_at?: string;
  is_out?: boolean;
}

export interface Player {
  id: Id<"players">;
  name: string;
  image_url?: string;
  fun_fact?: string;
  created_at?: string;
}

export interface Heat {
  id: Id<"heats">;
  name?: string;
  heat: number;
  date: string;
  is_current: boolean;
  created_at?: string;
}

export interface TimeType {
  id: Id<"time_types">;
  name: string;
  time_eng: string;
  description?: string;
}

export interface TimeLog {
  id: Id<"time_logs">;
  player_id: Id<"players">;
  time_type_id: Id<"time_types">;
  time_seconds: number;
  heat_id: Id<"heats">;
  team_id?: Id<"teams">;
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
  [key: string]: string | number | boolean | undefined;
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

// Judge types
export type JudgeType = "main" | "participants" | "beer";

// Time types
export type TimeTypeKey = "Beer" | "Sail" | "Spin";

// Alert severities
export type AlertSeverity = "success" | "error" | "warning" | "info";

// Utility function types
export interface SortFilterOptions {
  sortBy: "time" | "name" | "team";
  filterBy?: string;
  ascending?: boolean;
}

export interface AlertObject {
  open: boolean;
  severity: AlertSeverity;
  text: string;
  context?: AlertContext;
  setOpen: (open: boolean) => void;
  setSeverity: (severity: AlertSeverity) => void;
  setText: (text: string) => void;
  setContext: (context: AlertContext | undefined) => void;
}

// Alert context type (used across AlertComponent and judge-it components)
export interface AlertContext {
  operation?: string; // What operation was being performed
  location?: string; // Where in the code this alert came from
  metadata?: Record<
    string,
    string | number | boolean | object | null | undefined
  >; // Additional context
  error?: Error; // Original error object if available
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

export interface TimeLogDetail {
  playerId: Id<"players">;
  teamId?: Id<"teams">;
  heatId: Id<"heats">;
  timeTypeId?: Id<"time_types">;
  formattedTime?: string;
  time?: string;
  duration?: number;
}

// Alias for backwards compatibility with visualization utils
export type TimeEntry = TimeLogDetail;

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
export interface AppErrorInterface {
  message: string;
  code?: string;
  details?: Record<
    string,
    string | number | boolean | object | null | undefined
  >;
}
