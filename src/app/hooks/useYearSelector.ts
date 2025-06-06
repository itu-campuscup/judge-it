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
  const [selectedYear, setSelectedYear] = useState<number>(0);

  useEffect(() => {
    if (uniqueYears.length > 0 && !selectedYear) {
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
