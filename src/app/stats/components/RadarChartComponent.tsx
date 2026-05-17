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

interface EntityInfoCardProps {
  entity: EntityInfo;
  align: "left" | "right";
  color: string;
}

const EntityInfoCard: React.FC<EntityInfoCardProps> = ({
  entity,
  align,
  color,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: align === "left" ? "flex-start" : "flex-end",
        mb: 3,
        minHeight: "200px",
        flex: 1,
        textAlign: align,
      }}
    >
      {align === "right" && (
        <Box sx={{ textAlign: "right", flex: 1 }}>
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontSize: "2rem",
              fontWeight: "bold",
              mb: 1,
              color: color,
            }}
          >
            {entity.name}
          </Typography>
          {entity.altText != null && entity.altText != "" && (
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                fontSize: "1.2rem",
              }}
            >
              {entity.altTextType}: {entity.altText}
            </Typography>
          )}
        </Box>
      )}
      {entity.imageUrl && (
        <Avatar
          src={entity.imageUrl}
          alt={entity.name}
          sx={{
            width: 140,
            height: 140,
            mx: align === "left" ? 0 : 2,
            mr: align === "left" ? 2 : 0,
            border: `3px solid ${color}`,
          }}
        />
      )}
      {align === "left" && (
        <Box sx={{ textAlign: "left", flex: 1 }}>
          <Typography
            variant="h2"
            component="div"
            sx={{
              fontSize: "2rem",
              fontWeight: "bold",
              mb: 1,
              color: color,
            }}
          >
            {entity.name}
          </Typography>
          {entity.altText != null && entity.altText != "" && (
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
                fontSize: "1.2rem",
              }}
            >
              {entity.altTextType}: {entity.altText}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

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
