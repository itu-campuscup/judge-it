import { Heat, Player, Team } from "@/types";
import { removeDuplicateTimeEntriesAll } from "./visualizationUtils";
import {
  getHeatNumber,
  getHeatYear,
  getPlayerName,
  getTeamName,
} from "./getUtils";

// Helper function to escape CSV values
const escapeCSVValue = (value: string | number): string => {
  const stringValue = String(value);
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

interface TimeLogEntry {
  formattedTime?: string;
  playerId: number;
  teamId: number;
  heatId: number;
  time?: string;
}

export const downloadCSV = (
  data: TimeLogEntry[],
  players: Player[],
  teams: Team[],
  heats: Heat[],
  fileName: string,
) => {
  // Use the data as-is if it's already processed, otherwise process it
  const processedData =
    data.length > 0 && data[0].formattedTime
      ? data
      : removeDuplicateTimeEntriesAll(data);

  const deref = processedData.map((entry) => {
    return {
      formattedTime: entry.formattedTime,
      player: getPlayerName(entry.playerId, players),
      team: getTeamName(entry.teamId, teams),
      heat: getHeatNumber(entry.heatId, heats),
      heatYear: getHeatYear(entry.heatId, heats),
    };
  });

  // Create CSV with proper escaping
  const headers = ["Formatted Time", "Player", "Team", "Heat", "Heat Year"];
  const csvRows = [
    headers.join(","),
    ...deref.map((row) =>
      [
        escapeCSVValue(row.formattedTime ?? ""),
        escapeCSVValue(row.player),
        escapeCSVValue(row.team),
        escapeCSVValue(row.heat),
        escapeCSVValue(row.heatYear),
      ].join(","),
    ),
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  // Create object URL for the blob
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);

  // Add to DOM, click, and remove
  document.body.appendChild(link);
  link.click(); // 🔥 This was missing!
  document.body.removeChild(link);

  // Clean up the object URL
  URL.revokeObjectURL(url);
};
