import { useState, useEffect } from "react";
import { getUniqueYearsGivenHeats } from "@/utils/timeUtils";

const useYearSelector = (heats = []) => {
  const uniqueYears = getUniqueYearsGivenHeats(heats);
  const [selectedYear, setSelectedYear] = useState("");

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
