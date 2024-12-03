import { CollectionReference, BoolExpr, Unit } from "ballerina-core";

const debitNoteResultFields: Array<[CollectionReference, BoolExpr<Unit>]> = [
  [CollectionReference.Default("ConfigurableNumber", "ConfigurableNumber"), BoolExpr.Default.true()],
  [CollectionReference.Default("Currency", "Currency"), BoolExpr.Default.true()],
  [CollectionReference.Default("DocumentName", "DocumentName"), BoolExpr.Default.true()],
  [CollectionReference.Default("ExternalDmsID", "ExternalDmsID"), BoolExpr.Default.true()],
  [CollectionReference.Default("LastChangeDate", "LastChangeDate"), BoolExpr.Default.true()],
  [CollectionReference.Default("LastChangeDateTime", "LastChangeDateTime"), BoolExpr.Default.true()],
  [CollectionReference.Default("Positions", "Positions"), BoolExpr.Default.true()],
  [CollectionReference.Default("DebitNoteDate", "DebitNoteDate"), BoolExpr.Default.true()],
  [CollectionReference.Default("DebitNoteNum", "DebitNoteNum"), BoolExpr.Default.true()],
  [CollectionReference.Default("ReferenceNum", "ReferenceNum"), BoolExpr.Default.true()],
  [CollectionReference.Default("ReceiverID", "ReceiverID"), BoolExpr.Default.true()],
  [CollectionReference.Default("SenderID", "SenderID"), BoolExpr.Default.true()],
  [CollectionReference.Default("PostingDate", "PostingDate"), BoolExpr.Default.true()]
];

export default debitNoteResultFields;
