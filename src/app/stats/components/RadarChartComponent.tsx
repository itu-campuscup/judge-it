import React from "react";
import { Box, Avatar, Typography } from "@mui/material";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from "recharts";

interface EntityInfo {
  imageUrl?: string;
  name: string;
  altTextType: string;
  altText: string;
}

interface RadarChartData {
  subject: string;
  Performance: number;
  fullMark: number;
}

interface RadarChartComponentProps {
  entity1: EntityInfo;
  data1: RadarChartData[];
  entity2?: EntityInfo;
  data2?: RadarChartData[];
}

const RadarChartComponent: React.FC<RadarChartComponentProps> = ({
  entity1,
  data1,
  entity2,
  data2,
}) => {
  return (
    <Box
      sx={{
        textAlign: "center",
        mb: 2,
        maxWidth: "550px",
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
          mb: 3,
          minHeight: "200px",
          flexShrink: 0,
        }}
      >
        {imageUrl && (
          <Avatar
            src={imageUrl}
            alt={name}
            sx={{ width: 160, height: 160, mr: 3 }}
          />
        )}
        <Box sx={{ textAlign: "left", flex: 1 }}>
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              mb: 1,
            }}
          >
            {name}
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{
              wordWrap: "break-word",
              overflowWrap: "break-word",
              fontSize: "1.5rem",
            }}
          >
            {altText != null && altText != ""
              ? `${altTextType}: ${altText}`
              : ""}
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
          cx={250}
          cy={200}
          outerRadius={160}
          width={500}
          height={400}
          data={data}
        >
          <PolarGrid gridType="circle" />
          <PolarAngleAxis
            dataKey="subject"
            style={{ fontSize: "14px", fontWeight: "bold" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            style={{ fontSize: "12px" }}
          />
          <Radar
            name="Performance"
            dataKey="Performance"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
            strokeWidth={3}
          />
        </RadarChart>
      </Box>
    </Box>
  );
};

export default React.memo(RadarChartComponent);
