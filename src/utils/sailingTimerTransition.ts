export const sailingTimerTransition = <PlayerId extends string>(
  stoppingPlayerId: PlayerId,
  startingPlayerId?: PlayerId,
): PlayerId[] =>
  startingPlayerId && startingPlayerId !== stoppingPlayerId
    ? [stoppingPlayerId, startingPlayerId]
    : [stoppingPlayerId];
