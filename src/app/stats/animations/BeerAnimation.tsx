import React from "react";
import { Box } from "@mui/material";
import { milliToSecs } from "@/utils/timeUtils";

interface BeerAnimationProps {
  actualTime: number;
  playerName: string;
  animationCycleKey: number;
}

const BeerAnimation: React.FC<BeerAnimationProps> = ({
  actualTime,
  playerName,
  animationCycleKey,
}) => {
  if (!(actualTime > 0)) {
    return <Box sx={{ width: "40px", height: "80px", marginRight: 2 }} />;
  }

  return (
    <Box
      key={`beer-anim-${playerName}-${animationCycleKey}`}
      aria-label="emptying beer animation"
      sx={{
        width: "40px",
        height: "80px",
        backgroundColor: "rgba(255, 223, 0, 0.2)",
        border: "2px solid #ccc",
        borderRadius: "6px 6px 0 0",
        position: "relative",
        overflow: "hidden",
        marginRight: 2,
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "gold",
          height: "100%",
          transformOrigin: "bottom",
          "@keyframes emptyBeerAnimation": {
            "0%": { transform: "scaleY(1)" },
            "100%": { transform: "scaleY(0)" },
          },
          animationName: "emptyBeerAnimation",
          animationDuration: `${milliToSecs(actualTime, -1)}s`,
          animationTimingFunction: "linear",
          animationIterationCount: 1,
          animationFillMode: "forwards",
        },
      }}
    />
  );
};

export default BeerAnimation;
