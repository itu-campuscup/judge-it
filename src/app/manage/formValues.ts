import type { Id } from "convex/_generated/dataModel";

export interface ContestantFormValues {
  name: string;
  imageUrl: string;
  funFact: string;
}

export interface TeamFormValues {
  name: string;
  imageUrl: string;
  playerIds: Array<Id<"players"> | "">;
}

export function buildContestantPayload(values: ContestantFormValues) {
  const name = values.name.trim();
  if (!name) {
    throw new Error("Contestant name is required");
  }

  const imageUrl = values.imageUrl.trim();
  const funFact = values.funFact.trim();

  return {
    name,
    ...(imageUrl ? { image_url: imageUrl } : {}),
    ...(funFact ? { fun_fact: funFact } : {}),
  };
}

export function buildTeamPayload(values: TeamFormValues) {
  const name = values.name.trim();
  if (!name) {
    throw new Error("Team name is required");
  }

  const playerIds = values.playerIds.filter(
    (playerId): playerId is Id<"players"> => Boolean(playerId),
  );
  if (new Set(playerIds).size !== playerIds.length) {
    throw new Error("A contestant can only appear once per team");
  }

  const imageUrl = values.imageUrl.trim();
  const [player1, player2, player3, player4] = playerIds;

  return {
    name,
    ...(imageUrl ? { image_url: imageUrl } : {}),
    ...(player1 ? { player_1_id: player1 } : {}),
    ...(player2 ? { player_2_id: player2 } : {}),
    ...(player3 ? { player_3_id: player3 } : {}),
    ...(player4 ? { player_4_id: player4 } : {}),
    is_out: false,
  };
}
