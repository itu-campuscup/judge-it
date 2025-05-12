import { Box } from '@mui/material';
import { milliToSecs } from '@/utils/timeUtils';
const BeerAnimation = ({ actualTime, playerName, animationCycleKey }) => {
  if (!(actualTime > 0)) {
    return <Box sx={{ width: '20px', height: '40px', marginRight: 1.5 }} />;
  }

  return (
    <Box
      key={`beer-anim-${playerName}-${animationCycleKey}`}
      aria-label="emptying beer animation"
      sx={{
        width: '20px',
        height: '40px',
        backgroundColor: 'rgba(255, 223, 0, 0.2)',
        border: '1px solid #ccc',
        borderRadius: '3px 3px 0 0',
        position: 'relative',
        overflow: 'hidden',
        marginRight: 1.5,
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'gold',
          height: '100%',
          transformOrigin: 'bottom',
          '@keyframes emptyBeerAnimation': {
            '0%': { transform: 'scaleY(1)' },
            '100%': { transform: 'scaleY(0)' },
          },
          animationName: 'emptyBeerAnimation',
          animationDuration: `${milliToSecs(actualTime)}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 1,
          animationFillMode: 'forwards',
        },
      }}
    />
  );
};

export default BeerAnimation;
