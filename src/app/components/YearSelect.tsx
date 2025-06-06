import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

interface YearSelectProps {
  years: number[];
  selectedYear: number;
  onChange: (event: SelectChangeEvent<number>) => void;
  labelId?: string;
}

const YearSelect: React.FC<YearSelectProps> = ({
  years,
  selectedYear,
  onChange,
  labelId = "year-select-label",
}) => {
  return (
    <FormControl fullWidth margin="normal" variant="filled" sx={{ mb: 2 }}>
      <InputLabel id={labelId}>Select Year</InputLabel>
      <Select
        labelId={labelId}
        id={labelId}
        value={selectedYear}
        label="Select Year"
        onChange={onChange}
      >
        {years.map((year) => (
          <MenuItem key={year} value={year}>
            {year}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default YearSelect;
