import CircularProgress from "@mui/material/CircularProgress";

export type BaseLoadingProps = {
  className?: string | undefined;
  size?: number;
  style?: React.CSSProperties;
};

export default function BaseLoading(props: BaseLoadingProps) {
  return (
    <CircularProgress
      className={props.className}
      sx={{
        color: "#608097",
        ...props.style,
      }}
      thickness={3}
      size={props.size}
    />
  );
}
