import { useState, useEffect } from "react";
import { getUniqueYearsGivenHeats } from "@/utils/timeUtils";
import type { Heat } from "@/types";

interface UseYearSelectorReturn {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  uniqueYears: number[];
}

const useYearSelector = (heats: Heat[] = []): UseYearSelectorReturn => {
  const uniqueYears = getUniqueYearsGivenHeats(heats);

  // Initialize with a proper default value instead of null
  const getDefaultYear = (): number => {
    if (uniqueYears.length === 0) return new Date().getFullYear();

    const currentYear = new Date().getFullYear();
    return uniqueYears.includes(currentYear) ? currentYear : uniqueYears[0];
  };

  const [selectedYear, setSelectedYear] = useState<number>(getDefaultYear());

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
