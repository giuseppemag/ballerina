import { CollectionReference, EnumValue } from "ballerina-core";

const debitNoteResultFields: Array<EnumValue> = [
  CollectionReference.Default.enum("ConfigurableNumber" ),
  CollectionReference.Default.enum("Currency" ),
  CollectionReference.Default.enum("DocumentName" ),
  CollectionReference.Default.enum("ExternalDmsID" ),
  CollectionReference.Default.enum("LastChangeDate" ),
  CollectionReference.Default.enum("LastChangeDateTime" ),
  CollectionReference.Default.enum("Positions" ),
  CollectionReference.Default.enum("DebitNoteDate" ),
  CollectionReference.Default.enum("DebitNoteNum" ),
  CollectionReference.Default.enum("ReferenceNum" ),
  CollectionReference.Default.enum("ReceiverID" ),
  CollectionReference.Default.enum("SenderID" ),
  CollectionReference.Default.enum("PostingDate" ),
];

export default debitNoteResultFields;
