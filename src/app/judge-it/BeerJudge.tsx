import React, { useMemo } from "react";
import {
  getPlayerIdGivenTeamAndTimeLogs,
  getPlayerName,
} from "@/utils/getUtils";
import {
  TIME_TYPE_SAIL,
  TIME_TYPE_BEER,
  TIME_TYPE_SPIN,
} from "@/utils/constants";
import type { Team, TimeTypeKey } from "@/types";
import { useFetchDataConvex, useHeatControls, useCurrentHeat } from "../hooks";
import JudgeButton from "../components/JudgeButton";
import AlertComponent from "../components/AlertComponent";

interface BeerJudgeProps {
  selectedTeam: Team | null;
}

enum BeerSidePhase {
  SAILING_IN = 1,
  RUN_TO_BEER = 2,
  DRINKING_BEER = 3,
  RUN_TO_SPIN = 4,
  SPINNING = 5,
  RUN_TO_BOAT = 6,
  SAILING_OUT = 7,
}

const BeerJudge: React.FC<BeerJudgeProps> = ({ selectedTeam }) => {
  const { alert, timeTypes, players, reload } = useFetchDataConvex();
  const { timeLogs } = useCurrentHeat();
  const { insertTimeLog } = useHeatControls({}, alert);

  const latestPlayer = selectedTeam
    ? getPlayerIdGivenTeamAndTimeLogs(selectedTeam.id, timeLogs)
    : null;
  const playerName = getPlayerName(latestPlayer, players);

  const currentPhase = useMemo(() => {
    const logs = timeLogs.filter((tl) => tl.player_id === latestPlayer);
    return logs.length;
  }, [latestPlayer, timeLogs]);

  const currentTimeType = useMemo(() => {
    switch (currentPhase) {
      case BeerSidePhase.SAILING_IN:
      case BeerSidePhase.RUN_TO_BOAT:
      case BeerSidePhase.SAILING_OUT:
        return TIME_TYPE_SAIL;
      case BeerSidePhase.RUN_TO_BEER:
      case BeerSidePhase.DRINKING_BEER:
        return TIME_TYPE_BEER;
      case BeerSidePhase.RUN_TO_SPIN:
      case BeerSidePhase.SPINNING:
        return TIME_TYPE_SPIN;
    }
    return TIME_TYPE_SAIL;
  }, [currentPhase]);

  const timeTypeEmoji = () => {
    switch (currentTimeType) {
      case TIME_TYPE_SAIL:
        return "⛵";
      case TIME_TYPE_BEER:
        return "🍺";
      case TIME_TYPE_SPIN:
        return "🌪️";
      default:
        return "";
    }
  };

  const handleTimeTypeClick = async (timeTypeKey: TimeTypeKey) => {
    const timeTypeId = timeTypes.find((tt) => tt.time_eng === timeTypeKey)!.id;
    await insertTimeLog(timeTypeId, latestPlayer, selectedTeam?.id);
    reload();
  };

  return (
    <>
      <AlertComponent
        severity={alert.severity}
        text={alert.text}
        open={alert.open}
        setOpen={alert.setOpen}
      />
      {playerName !== "" && (
        <JudgeButton
          disabled={currentPhase >= BeerSidePhase.SAILING_OUT}
          onClick={() => handleTimeTypeClick(currentTimeType)}
        >
          {currentPhase % 2 == 0 ? "Start" : "Stop"} {playerName}{" "}
          {currentTimeType} {timeTypeEmoji()}
        </JudgeButton>
      )}
    </>
  );
};

export default BeerJudge;
