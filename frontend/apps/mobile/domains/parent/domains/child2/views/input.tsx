import { Button } from "react-native-paper";

export const Child2Input = (props: { onClick: () => void, on: boolean }) => (
  <Button onPress={props.onClick} labelStyle={{fontSize: 20}} > Set uncle flag {`${props.on ? 'on' : 'off'}`}</Button>
);
