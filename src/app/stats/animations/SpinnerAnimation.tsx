import React from "react";
import { Box } from "@mui/material";

interface SpinnerAnimationProps {
  rpm: number;
  time: number;
  playerName: string;
  animationCycleKey: number;
}

const SpinnerAnimation: React.FC<SpinnerAnimationProps> = ({
  rpm,
  time,
  playerName,
  animationCycleKey,
}) => {
  if (!(rpm > 0 && time > 0)) {
    return <Box sx={{ width: "40px", height: "40px", marginRight: 1.5 }} />;
  }

  return (
    <Box
      key={`spinner-anim-${playerName}-${animationCycleKey}`}
      aria-label="spinning icon for 10 revolutions"
      sx={{
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "2.5rem",
        marginRight: 1.5,
        "@keyframes spin10Revolutions": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(-3600deg)" },
        },
        animationName: "spin10Revolutions",
        animationDuration: `${time / 1000}s`,
        animationTimingFunction: "linear",
        animationIterationCount: 1,
        animationFillMode: "forwards",
      }}
    >
      🌀
    </Box>
  );
};

export default SpinnerAnimation;
