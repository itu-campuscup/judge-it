import { useState, useEffect, useMemo } from "react";
import { getUniqueYearsGivenHeats } from "@/utils/timeUtils";
import type { Heat } from "@/types";

interface UseYearSelectorReturn {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  uniqueYears: number[];
}

const useYearSelector = (heats: Heat[] = []): UseYearSelectorReturn => {
  // Performance Optimization: Memoize uniqueYears to avoid O(Heats) calculation on every render
  const uniqueYears = useMemo(() => getUniqueYearsGivenHeats(heats), [heats]);

  // Performance Optimization: Use a lazy initializer for useState to avoid
  // redundant default year calculations after the initial render.
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (uniqueYears.length === 0) return new Date().getFullYear();

    const currentYear = new Date().getFullYear();
    return uniqueYears.includes(currentYear) ? currentYear : uniqueYears[0];
  });

  useEffect(() => {
    // Only update if we have years and the current selection isn't valid
    if (uniqueYears.length > 0 && !uniqueYears.includes(selectedYear)) {
      const currentYear = new Date().getFullYear();
      const defaultYear = uniqueYears.includes(currentYear)
        ? currentYear
        : uniqueYears[0];
      setSelectedYear(defaultYear);
    }
  }, [uniqueYears, selectedYear]);

  return { selectedYear, setSelectedYear, uniqueYears };
};

export default useYearSelector;
