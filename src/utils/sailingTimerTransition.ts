export const sailingTimerTransition = <PlayerId extends string>(
  stoppingPlayerId: PlayerId,
  startingPlayerId?: PlayerId,
): PlayerId[] =>
  startingPlayerId === undefined
    ? [stoppingPlayerId]
    : [stoppingPlayerId, startingPlayerId];
