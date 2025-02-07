import { CollectionReference } from "ballerina-core";

const debitNoteResultFields: Array<{Value: string}> = [
  { Value: "ConfigurableNumber"},
  { Value: "Currency"},
  { Value: "DocumentName"},
  { Value: "ExternalDmsID"},
  { Value: "LastChangeDate"},
  { Value: "LastChangeDateTime"},
  { Value: "Positions"},
  { Value: "DebitNoteDate"},
  { Value: "DebitNoteNum"},
  { Value: "ReferenceNum"},
  { Value: "ReceiverID"},
  { Value: "SenderID"},
  { Value: "PostingDate"},
];

export default debitNoteResultFields;
