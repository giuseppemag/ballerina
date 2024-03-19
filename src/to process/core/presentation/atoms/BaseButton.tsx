import Button, { ButtonProps } from "@mui/material/Button";
import { styled } from "@mui/material/styles";

const StyledBaseButton = styled(Button)(({ theme, ...props }) => {
  if (props.color === "primary") {
    return { color: "white", backgroundColor: theme.palette.primary.main };
  }
  if (props.color === "secondary") {
    return { color: theme.palette.primary.main, backgroundColor: "white" };
  }
});

export const BaseButton: React.FC<ButtonProps> = ({ ...props }) => {
  return <StyledBaseButton {...props}>Base Button</StyledBaseButton>;
};
