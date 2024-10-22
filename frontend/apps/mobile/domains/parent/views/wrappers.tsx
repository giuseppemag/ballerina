import { View } from "react-native";

export const ParentWrapper = (props: {
  children?: Array<JSX.Element> | JSX.Element;
}) => <View>{props.children}</View>;

export const ChildWrapper = (props: {
  children?: Array<JSX.Element> | JSX.Element;
  zIndex?: number
}) => <View style={props.zIndex ? {zIndex: props.zIndex} : {}}>{props.children}</View>;

export const ChildrenWrapper = (props: {
  children?: Array<JSX.Element> | JSX.Element;
}) => <View>{props.children}</View>;
