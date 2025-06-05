import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
  } from "@mui/material";
  
const YearSelect = ({ years, selectedYear, onChange, labelId = "year-select-label" }) => {
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
