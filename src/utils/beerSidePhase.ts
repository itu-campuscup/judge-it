const EVENTS_PER_LEG = 8;

export const getBeerSidePhase = (eventCount: number): number =>
  eventCount === 0 ? 0 : ((eventCount - 1) % EVENTS_PER_LEG) + 1;
