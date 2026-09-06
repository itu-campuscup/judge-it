import React, { useState } from "react";
import { Button, ButtonProps, styled } from "@mui/material";

const JudgeButton: React.FC<ButtonProps> = (props) => {
  const [disabled, setDisabled] = useState(false);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    if (props.onClick) props.onClick(event);
    setDisabled(true);
    setTimeout(() => setDisabled(false), 1000);
  };

  return (
    <StyledButton
      variant="contained"
      color="primary"
      size="large"
      fullWidth
      {...props}
      disabled={props.disabled || disabled}
      onClick={handleClick}
    >
      {props.children}
    </StyledButton>
  );
};

const StyledButton = styled(Button)({
  minHeight: 80,
  fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
  padding: 2,
});

export default JudgeButton;
