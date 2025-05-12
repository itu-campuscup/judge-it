import { Box } from "@mui/material";
import { milliToSecs } from "@/utils/timeUtils";
import { CAMPUSCUP_LIGHT_BLUE, MEDAL_EMOJIS } from "@/utils/constants";

const SailingAnimation = ({ actualTime, playerName, animationCycleKey }) => {
  if (!(actualTime > 0)) {
    return (
      <Box
        sx={{
          width: "600px",
          height: "30px",
          marginRight: 5,
          borderBottom: "2px solid transparent",
        }}
      />
    );
  }

  return (
    <Box
      key={`sail-anim-${playerName}-${animationCycleKey}`}
      aria-label="sailing boat animation"
      sx={{
        width: "600px",
        height: "30px",
        position: "relative",
        overflow: "hidden",
        marginRight: 5,
        borderBottom: "2px solid " + CAMPUSCUP_LIGHT_BLUE,
        "&::after": {
          content: '"⛵️"',
          fontSize: "1.5rem",
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%) translateX(0px)",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundSize: "1.5rem 1.5rem",
          "@keyframes sailAndOverlayFlag": {
            "0%": {
              transform: "translateY(-50%) translateX(0px)",
              backgroundImage: "none",
            },
            "99.9%": {
              transform: "translateY(-50%) translateX(425px)",
              backgroundImage: "none",
            },
            "100%": {
              transform: "translateY(-50%) translateX(425px)",
              backgroundImage:
                'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"24\\" height=\\"24\\" viewBox=\\"0 0 24 24\\"><text x=\\"50%\\" y=\\"50%\\" dominant-baseline=\\"central\\" text-anchor=\\"middle\\" style=\\"font-size:20px;opacity:0.2;\\">🏁</text></svg>")',
            },
          },
          animationName: "sailAndOverlayFlag",
          animationDuration: `${milliToSecs(actualTime)}s`,
          animationTimingFunction: "linear",
          animationIterationCount: 1,
          animationFillMode: "forwards",
        },
      }}
    />
  );
};

export default SailingAnimation;
