type Props = {
  onClick: () => void;
};

export const Child2Input = (props: Props) => (
  <button onClick={props.onClick}>Set uncle flag</button>
);
