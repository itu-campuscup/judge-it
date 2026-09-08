type HeatNumberSource = {
  heat: number;
  date: string;
};

export const nextHeatNumber = (
  heats: readonly HeatNumberSource[],
  date: string,
): number => {
  const yearPrefix = `${date.slice(0, 4)}-`;
  return (
    heats
      .filter((heat) => heat.date.startsWith(yearPrefix))
      .reduce((highestHeat, heat) => Math.max(highestHeat, heat.heat), 0) + 1
  );
};
