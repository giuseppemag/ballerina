import { Stack } from "@mui/material";

import { RowStack } from "../../library/container/FlexDivs";
import BaseLoading from "../../web2/domains/core/presentation/atoms/BaseLoading";

export const SharedLayout = {
  Row: (columns: JSX.Element) => <RowStack>{columns}</RowStack>,
  Col: (props: { children: JSX.Element }) => <Stack>{props.children}</Stack>,
  Loader: () => <BaseLoading />,
};
