import React from "react";
import { Box } from "@mui/material";
import { milliToSecs } from "@/utils/timeUtils";
import { CAMPUSCUP_LIGHT_BLUE } from "@/utils/constants";

interface SailingAnimationProps {
  actualTime: number;
  playerName: string;
  animationCycleKey: number;
}

const SailingAnimation: React.FC<SailingAnimationProps> = ({
  actualTime,
  playerName,
  animationCycleKey,
}) => {
  if (!(actualTime > 0)) {
    return (
      <Box
        sx={{
          width: "650px",
          height: "50px",
          marginRight: 3,
          borderBottom: "3px solid transparent",
        }}
      />
    );
  }

  return (
    <Box
      key={`sail-anim-${playerName}-${animationCycleKey}`}
      aria-label="sailing boat animation"
      sx={{
        width: "650px",
        height: "50px",
        position: "relative",
        overflow: "hidden",
        marginRight: 3,
        borderBottom: "3px solid " + CAMPUSCUP_LIGHT_BLUE,
        "&::after": {
          content: '"⛵️"',
          fontSize: "2.5rem",
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%) translateX(0px)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "2.5rem 2.5rem",
          "@keyframes sailAndOverlayFlag": {
            "0%": {
              transform: "translateY(-50%) translateX(0px)",
              backgroundImage: "none",
            },
            "99.9%": {
              transform: "translateY(-50%) translateX(460px)",
              backgroundImage: "none",
            },
            "100%": {
              transform: "translateY(-50%) translateX(460px)",
              backgroundImage:
                'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"32\\" height=\\"32\\" viewBox=\\"0 0 32 32\\"><text x=\\"50%\\" y=\\"50%\\" dominant-baseline=\\"central\\" text-anchor=\\"middle\\" style=\\"font-size:28px;opacity:0.2;\\">🏁</text></svg>")',
            },
          },
          animationName: "sailAndOverlayFlag",
          animationDuration: `${milliToSecs(actualTime, -1)}s`,
          animationTimingFunction: "linear",
          animationIterationCount: 1,
          animationFillMode: "forwards",
        },
      }}
    />
  );
};

export default SailingAnimation;
