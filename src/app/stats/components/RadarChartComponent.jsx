import { Box, Avatar, Typography } from "@mui/material";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const RadarChartComponent = ({
  imageUrl,
  name,
  altTextType,
  altText,
  data,
}) => {
  return (
    <Box
      sx={{
        textAlign: "center",
        mb: 2,
        maxWidth: "450px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
          minHeight: "120px",
          flexShrink: 0,
        }}
      >
        {imageUrl && (
          <Avatar
            src={imageUrl}
            alt={name}
            sx={{ width: 100, height: 100, mr: 2 }}
          />
        )}
        <Box sx={{ textAlign: "left", flex: 1 }}>
          <Typography variant="h5" component="div">
            {name}
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {altText != null ? `${altTextType}: ${altText}` : ""}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flex: 1, // Take up remaining space
        }}
      >
        <RadarChart
          cx={200}
          cy={150}
          outerRadius={120}
          width={400}
          height={300}
          data={data}
        >
          <PolarGrid gridType="circle" />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Radar
            name="Performance"
            dataKey="Performance"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </Box>
    </Box>
  );
};

export default RadarChartComponent;
