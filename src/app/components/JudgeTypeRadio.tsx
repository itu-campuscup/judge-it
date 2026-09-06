import React from "react";
import { Button, Typography, FormControl, styled } from "@mui/material";

interface Props {
  selectedType: judge;
  setSelectedType: (type: judge) => void;
}

const JudgeTypeRadio: React.FC<Props> = ({ selectedType, setSelectedType }) => {
  const handleClick = (type: judge) => () => {
    setSelectedType(type);
  };

  return (
    <FormControl fullWidth>
      {selectedType ? (
        <Typography>
          {judgeName(selectedType)}
          <Button onClick={handleClick(0)}>(change)</Button>
        </Typography>
      ) : (
        <>
          {[1, 2, 3].map((type) => (
            <JudgeTypeButton key={type} fullWidth onClick={handleClick(type)}>
              {judgeName(type)}
            </JudgeTypeButton>
          ))}
        </>
      )}
    </FormControl>
  );
};

export enum judge {
  NONE = 0,
  MAIN = 1,
  PARTICIPANTS = 2,
  BEER = 3,
}

const judgeName = (type: judge) => {
  switch (type) {
    case judge.NONE:
      return "";
    case judge.MAIN:
      return "Main Judge";
    case judge.PARTICIPANTS:
      return "Participant-side Judge";
    case judge.BEER:
      return "Beer-side Judge";
  }
};

const JudgeTypeButton = styled(Button)({
  background:
    "linear-gradient(162deg,rgba(48, 85, 166, 1) 0%, rgba(32, 65, 134, 1) 100%)",
  color: "white",
  margin: "5px 0px",
});

export default JudgeTypeRadio;
