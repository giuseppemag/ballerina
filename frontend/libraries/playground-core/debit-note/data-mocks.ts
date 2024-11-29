import { faker } from "@faker-js/faker";
import {
  BoolExpr,
  CollectionReference,
  EntityApis,
  EnumOptionsSources,
  Guid,
  InfiniteStreamSources,
  OrderedMapRepo,
  PromiseRepo,
  StreamPosition,
  Unit,
} from "ballerina-core";
import { Range } from "immutable";
import { v4 } from "uuid";

const filterGroupOpEnum: Array<[CollectionReference, BoolExpr<Unit>]> = [
  [CollectionReference.Default("and", "and"), BoolExpr.Default.true()],
  [CollectionReference.Default("or", "or"), BoolExpr.Default.true()],
];

const debitNoteResultFieldsEnum: Array<[CollectionReference, BoolExpr<Unit>]> =
  [
    [
      CollectionReference.Default("ConfigurableNumber", "ConfigurableNumber"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("Currency", "Currency"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DocumentName", "DocumentName"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ExternalDmsID", "ExternalDmsID"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("LastChangeDate", "LastChangeDate"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("LastChangeDateTime", "LastChangeDateTime"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("Positions", "Positions"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DebitNoteDate", "DebitNoteDate"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DebitNoteNum", "DebitNoteNum"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ReferenceNum", "ReferenceNum"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ReceiverID", "ReceiverID"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("SenderID", "SenderID"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PostingDate", "PostingDate"),
      BoolExpr.Default.true(),
    ],
  ];

const informationCardFieldsEnum: Array<[CollectionReference, BoolExpr<Unit>]> =
  [
    [
      CollectionReference.Default("AcceptDuplicates", "AcceptDuplicates"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("BaseDate", "BaseDate"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("BlockPayment", "BlockPayment"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "BusinessDocumentType",
        "BusinessDocumentType"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CashDiscountValue", "CashDiscountValue"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DocumentNumber", "DocumentNumber"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DocumentType", "DocumentType"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("FiscalYear", "FiscalYear"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("FreeKeyValues", "FreeKeyValues"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("HeaderText", "HeaderText"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("Assignment", "Assignment"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "IncompletePurchaseOrderPositionsApproval",
        "IncompletePurchaseOrderPositionsApproval"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("IncoTerms", "IncoTerms"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("InvoiceType", "InvoiceType"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("KeyValues", "KeyValues"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PaymentReference", "PaymentReference"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PostingDate", "PostingDate"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PurchaseOrderNum", "PurchaseOrderNum"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("StateCentralBank", "StateCentralBank"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "TaxIdentificationNumber",
        "TaxIdentificationNumber"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "TaxIdentificationNumber1",
        "TaxIdentificationNumber1"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "TaxIdentificationNumber2",
        "TaxIdentificationNumber2"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "TaxIdentificationNumber3",
        "TaxIdentificationNumber3"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "TaxIdentificationNumber4",
        "TaxIdentificationNumber4"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "TaxIdentificationNumber5",
        "TaxIdentificationNumber5"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "UnequalTableToDocumentRowsApproval",
        "UnequalTableToDocumentRowsApproval"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("VatDate", "VatDate"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "VatIdentificationNumber",
        "VatIdentificationNumber"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "VatIdentificationNumberDropdown",
        "VatIdentificationNumberDropdown"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("WritebackIndex", "WritebackIndex"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("SkipPartnerCheck", "SkipPartnerCheck"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "SkipPartnerCheckReason",
        "SkipPartnerCheckReason"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "RestrictionBusinessPartnerGroupIds",
        "RestrictionBusinessPartnerGroupIds"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("NetDueDate", "NetDueDate"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "DueDateCashDiscount1",
        "DueDateCashDiscount1"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "DueDateCashDiscount2",
        "DueDateCashDiscount2"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("FiscalMonth", "FiscalMonth"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PurchaseOrderReferenceNumber2",
        "PurchaseOrderReferenceNumber2"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId1", "CostCenterId1"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId2", "CostCenterId2"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId3", "CostCenterId3"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId4", "CostCenterId4"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId5", "CostCenterId5"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId6", "CostCenterId6"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId7", "CostCenterId7"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId8", "CostCenterId8"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId9", "CostCenterId9"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId10", "CostCenterId10"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId11", "CostCenterId11"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId12", "CostCenterId12"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId13", "CostCenterId13"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId14", "CostCenterId14"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CostCenterId15", "CostCenterId15"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "NotPayableBeforeDate",
        "NotPayableBeforeDate"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ExternalDatabaseId", "ExternalDatabaseId"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PrepaymentPercent", "PrepaymentPercent"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DocumentDate", "DocumentDate"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ExternalDmsId", "ExternalDmsId"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("SalesDivision", "SalesDivision"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DistributionChannel", "DistributionChannel"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("InvoiceStatus", "InvoiceStatus"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("TaxReportDate", "TaxReportDate"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PaymentBlockTypeId", "PaymentBlockTypeId"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DeliveryBlockTypeId", "DeliveryBlockTypeId"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("VendorText", "VendorText"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("IncotermLocation", "IncotermLocation"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("IncotermLocation2", "IncotermLocation2"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "IncotermLegacyLocation",
        "IncotermLegacyLocation"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("VatInvoice", "VatInvoice"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DateOfService", "DateOfService"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "CurrencyTranslationDate",
        "CurrencyTranslationDate"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("EuTriangularDeal", "EuTriangularDeal"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("RelatedDocuments", "RelatedDocuments"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ConfigurableNumber", "ConfigurableNumber"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ConfigurableNumber2", "ConfigurableNumber2"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "CreditVoucherInvoiceReferenceId",
        "CreditVoucherInvoiceReferenceId"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PurchasingGroupId", "PurchasingGroupId"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PurchasingOrganizationId",
        "PurchasingOrganizationId"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DeliveryNoteType", "DeliveryNoteType"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ReferenceKey1", "ReferenceKey1"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ReferenceKey2", "ReferenceKey2"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ReferenceKey3", "ReferenceKey3"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("TaxFulfillmentDate", "TaxFulfillmentDate"),
      BoolExpr.Default.true(),
    ],
  ];

const requiredKeyValueFieldsEnum: Array<[CollectionReference, BoolExpr<Unit>]> =
  [
    [
      CollectionReference.Default("ZERO_PROTO", "ZERO_PROTO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("INVOICE_NO", "INVOICE_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("INVOICE_DATE", "INVOICE_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DELIVERY_NO", "DELIVERY_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DELIVERY_DATE", "DELIVERY_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ORDER_NO", "ORDER_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ORDER_DATE", "ORDER_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("COMPANY_NAME", "COMPANY_NAME"),
      BoolExpr.Default.true(),
    ],
    [CollectionReference.Default("STREET", "STREET"), BoolExpr.Default.true()],
    [CollectionReference.Default("CITY", "CITY"), BoolExpr.Default.true()],
    [
      CollectionReference.Default("POSTCODE", "POSTCODE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("SUBTOTAL", "SUBTOTAL"),
      BoolExpr.Default.true(),
    ],
    [CollectionReference.Default("TAX", "TAX"), BoolExpr.Default.true()],
    [CollectionReference.Default("TOTAL", "TOTAL"), BoolExpr.Default.true()],
    [
      CollectionReference.Default(
        "DISCOUNT_PAYMENT_DATE",
        "DISCOUNT_PAYMENT_DATE"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("LATEST_PAYMENT_DATE", "LATEST_PAYMENT_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("BANK_ACCOUNT", "BANK_ACCOUNT"),
      BoolExpr.Default.true(),
    ],
    [CollectionReference.Default("IBAN", "IBAN"), BoolExpr.Default.true()],
    [CollectionReference.Default("BIC", "BIC"), BoolExpr.Default.true()],
    [CollectionReference.Default("VAT_NO", "VAT_NO"), BoolExpr.Default.true()],
    [CollectionReference.Default("TAX_NO", "TAX_NO"), BoolExpr.Default.true()],
    [
      CollectionReference.Default("DIRECT_DEBIT", "DIRECT_DEBIT"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CUSTOMER_NO", "CUSTOMER_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PAGE_NO", "PAGE_NO"),
      BoolExpr.Default.true(),
    ],
    [CollectionReference.Default("EMAIL", "EMAIL"), BoolExpr.Default.true()],
    [CollectionReference.Default("URL", "URL"), BoolExpr.Default.true()],
    [
      CollectionReference.Default("SENDER_NO", "SENDER_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PURCHASE_ORDER_NO", "PURCHASE_ORDER_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PURCHASE_ORDER_DATE", "PURCHASE_ORDER_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ADDITIONAL_COST", "ADDITIONAL_COST"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("SUM_OF_GOODS", "SUM_OF_GOODS"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ADDITIONAL_DISCOUNT", "ADDITIONAL_DISCOUNT"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CASH_DISCOUNT", "CASH_DISCOUNT"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PAYMENTSLIP_ACCOUNT", "PAYMENTSLIP_ACCOUNT"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PAYMENTSLIP_REFERENCE_ID",
        "PAYMENTSLIP_REFERENCE_ID"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PAYMENTSLIP_AMOUNT", "PAYMENTSLIP_AMOUNT"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PAYMENTSLIP_ESR", "PAYMENTSLIP_ESR"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PAYMENTSLIP_BANK_NAME",
        "PAYMENTSLIP_BANK_NAME"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PAYMENTSLIP_BANK_POSTCODECITY",
        "PAYMENTSLIP_BANK_POSTCODECITY"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PAYMENTSLIP_RECEIVER_NAME",
        "PAYMENTSLIP_RECEIVER_NAME"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PAYMENTSLIP_RECEIVER_POSTCODECITY",
        "PAYMENTSLIP_RECEIVER_POSTCODECITY"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PAYMENTSLIP_RECEIVER_STREET",
        "PAYMENTSLIP_RECEIVER_STREET"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PAYMENTSLIP_PAYER_NAME",
        "PAYMENTSLIP_PAYER_NAME"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PAYMENTSLIP_PAYER_POSTCODECITY",
        "PAYMENTSLIP_PAYER_POSTCODECITY"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PAYMENTSLIP_PAYER_STREET",
        "PAYMENTSLIP_PAYER_STREET"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CURRENCY", "CURRENCY"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("TAX_RATE", "TAX_RATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PAYMENTSLIP_RECEIVER_COUNTRY",
        "PAYMENTSLIP_RECEIVER_COUNTRY"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "PAYMENTSLIP_PAYER_COUNTRY",
        "PAYMENTSLIP_PAYER_COUNTRY"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PAYMENTSLIP_MESSAGE", "PAYMENTSLIP_MESSAGE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PAYMENTSLIP_QRCODE", "PAYMENTSLIP_QRCODE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DOCUMENT_TYPE", "DOCUMENT_TYPE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PAYMENTSLIP_IBAN", "PAYMENTSLIP_IBAN"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DOCUMENT_NO", "DOCUMENT_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DOCUMENT_DATE", "DOCUMENT_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("MIN_AMOUNT", "MIN_AMOUNT"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ITEM_NO", "ITEM_NO"),
      BoolExpr.Default.true(),
    ],
    [CollectionReference.Default("CHARGE", "CHARGE"), BoolExpr.Default.true()],
    [
      CollectionReference.Default("SERIAL_NO", "SERIAL_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("REFERENCE_NO", "REFERENCE_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("REFERENCE_DATE", "REFERENCE_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ORDER_CONFIRMATION_NO",
        "ORDER_CONFIRMATION_NO"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ORDER_CONFIRMATION_DATE",
        "ORDER_CONFIRMATION_DATE"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("VALUE_DATE", "VALUE_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CREDIT_VOUCHER_NO", "CREDIT_VOUCHER_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CREDIT_VOUCHER_DATE", "CREDIT_VOUCHER_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("RECEIPT_NO", "RECEIPT_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("RECEIPT_DATE", "RECEIPT_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "INVOICE_CORRECTION_NO",
        "INVOICE_CORRECTION_NO"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "INVOICE_CORRECTION_DATE",
        "INVOICE_CORRECTION_DATE"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DELIVER_DATE", "DELIVER_DATE"),
      BoolExpr.Default.true(),
    ],
    [CollectionReference.Default("BLZ_NO", "BLZ_NO"), BoolExpr.Default.true()],
    [
      CollectionReference.Default("CATALOG_NO", "CATALOG_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CERTIFICATE_NO", "CERTIFICATE_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CHARGE_EXPIRY_DATE", "CHARGE_EXPIRY_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("COMMISSION_NO", "COMMISSION_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CONTRACT_NO", "CONTRACT_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CUSTOMS_NO", "CUSTOMS_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DELIVERY_CONDITIONS", "DELIVERY_CONDITIONS"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DELIVERY_METHOD", "DELIVERY_METHOD"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DESIRED_DATE", "DESIRED_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DISPATCH_DATE", "DISPATCH_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DISPATCH_NO", "DISPATCH_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "DOCUMENT_CREATION_DATE",
        "DOCUMENT_CREATION_DATE"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DOCUMENT_PRINT_DATE", "DOCUMENT_PRINT_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DRAWING_INDEX_DATE", "DRAWING_INDEX_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DRAWING_INDEX_NO", "DRAWING_INDEX_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DRAWING_NO", "DRAWING_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("EU_PRODUCT_NO", "EU_PRODUCT_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("EXPIRY_DATE", "EXPIRY_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("FAX_NUMBER", "FAX_NUMBER"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("GOODS_TARIFF_NO", "GOODS_TARIFF_NO"),
      BoolExpr.Default.true(),
    ],
    [CollectionReference.Default("HS_NO", "HS_NO"), BoolExpr.Default.true()],
    [
      CollectionReference.Default("PRODUCT_ORIGIN", "PRODUCT_ORIGIN"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "MAINTENANCE_CONTRACT_NO",
        "MAINTENANCE_CONTRACT_NO"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("MATERIAL_GROUP", "MATERIAL_GROUP"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("MATERIAL_NO", "MATERIAL_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("OFFER_DATE", "OFFER_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("OFFER_NO", "OFFER_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("OFFER_VALIDITY_DATE", "OFFER_VALIDITY_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "OUTLINE_AGREEMENT_DATE",
        "OUTLINE_AGREEMENT_DATE"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "OUTLINE_AGREEMENT_NO",
        "OUTLINE_AGREEMENT_NO"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PART_NO", "PART_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PAYMENT_REFERENCE", "PAYMENT_REFERENCE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PERFORMANCE_DATE", "PERFORMANCE_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PHONE_NUMBER", "PHONE_NUMBER"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PROCESS_NO", "PROCESS_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PRODUCT_GROUP", "PRODUCT_GROUP"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PRODUCT_NO", "PRODUCT_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PROJECT_DATE", "PROJECT_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PROJECT_NO", "PROJECT_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("RELEASE_ORDER_NO", "RELEASE_ORDER_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("REQUEST_DATE", "REQUEST_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("REQUEST_NO", "REQUEST_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("RETURN_DELIVERY_NO", "RETURN_DELIVERY_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ROUNDING_AMOUNT", "ROUNDING_AMOUNT"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("SUPPLIER_ITEM_NO", "SUPPLIER_ITEM_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DELIVER_WEEK", "DELIVER_WEEK"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DISPATCH_WEEK", "DISPATCH_WEEK"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("COUNTRY", "COUNTRY"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ADDRESS_INFO", "ADDRESS_INFO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("POSTFACH", "POSTFACH"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CONTACT_PERSON", "CONTACT_PERSON"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "CONTACT_PERSON_INTERNAL",
        "CONTACT_PERSON_INTERNAL"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("R_ADDRESS_INFO", "R_ADDRESS_INFO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DELIVERY_TERM", "DELIVERY_TERM"),
      BoolExpr.Default.true(),
    ],
    [CollectionReference.Default("OCR", "OCR"), BoolExpr.Default.true()],
    [CollectionReference.Default("KID", "KID"), BoolExpr.Default.true()],
    [
      CollectionReference.Default("INCOTERM", "INCOTERM"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("VAT_DATE", "VAT_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "CZECH_PAYMENT_REFERENCE",
        "CZECH_PAYMENT_REFERENCE"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("CURRENCY_FACTOR", "CURRENCY_FACTOR"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("QC_MATERIAL_NO", "QC_MATERIAL_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "MATERIAL_DESCRIPTION",
        "MATERIAL_DESCRIPTION"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("LOT_NUMBER", "LOT_NUMBER"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DELIVERY_QUANTITY", "DELIVERY_QUANTITY"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("MANUFACTURE_DATE", "MANUFACTURE_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("BEST_BEFORE_DATE", "BEST_BEFORE_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PRODUCTION_PERIOD", "PRODUCTION_PERIOD"),
      BoolExpr.Default.true(),
    ],
    [CollectionReference.Default("REMARK", "REMARK"), BoolExpr.Default.true()],
    [
      CollectionReference.Default("COMPANY_CODE", "COMPANY_CODE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("REQUESTER", "REQUESTER"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_QC_MATERIAL_NO",
        "ROCHE_QC_MATERIAL_NO"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_MATERIAL_DESCRIPTION",
        "ROCHE_MATERIAL_DESCRIPTION"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ROCHE_LOT_NUMBER", "ROCHE_LOT_NUMBER"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_DELIVERY_QUANTITY",
        "ROCHE_DELIVERY_QUANTITY"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_MANUFACTURE_DATE",
        "ROCHE_MANUFACTURE_DATE"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_MANUFACTURE_DATE_START",
        "ROCHE_MANUFACTURE_DATE_START"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_MANUFACTURE_DATE_END",
        "ROCHE_MANUFACTURE_DATE_END"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_BEST_BEFORE_DATE",
        "ROCHE_BEST_BEFORE_DATE"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_PRODUCTION_PERIOD",
        "ROCHE_PRODUCTION_PERIOD"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ROCHE_REMARK", "ROCHE_REMARK"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_GLOBAL_MATERIAL_NO",
        "ROCHE_GLOBAL_MATERIAL_NO"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_PRODUCTION_PERIOD_START",
        "ROCHE_PRODUCTION_PERIOD_START"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_PRODUCTION_PERIOD_END",
        "ROCHE_PRODUCTION_PERIOD_END"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("ROCHE_EXPIRY_DATE", "ROCHE_EXPIRY_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default(
        "ROCHE_TECHNICAL_DELIVERY_CONDITIONS",
        "ROCHE_TECHNICAL_DELIVERY_CONDITIONS"
      ),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DATE_OF_SERVICE", "DATE_OF_SERVICE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PAYMENT_ADVICE_NO", "PAYMENT_ADVICE_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("PAYMENT_ADVICE_DATE", "PAYMENT_ADVICE_DATE"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DEBIT_NOTE_NO", "DEBIT_NOTE_NO"),
      BoolExpr.Default.true(),
    ],
    [
      CollectionReference.Default("DEBIT_NOTE_DATE", "DEBIT_NOTE_DATE"),
      BoolExpr.Default.true(),
    ],
  ];

const contextEnum: Array<[CollectionReference, BoolExpr<Unit>]> = [
  [CollectionReference.Default("invoice", "invoice"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("invoicePosition", "invoicePosition"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("accountingPosition", "accountingPosition"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "additionalCostPosition",
      "additionalCostPosition"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("purchaseOrder", "purchaseOrder"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "purchaseOrderPosition",
      "purchaseOrderPosition"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("deliveryNote", "deliveryNote"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("deliveryNotePosition", "deliveryNotePosition"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("orderConfirmation", "orderConfirmation"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "orderConfirmationPosition",
      "orderConfirmationPosition"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("surcharge", "surcharge"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("header", "header"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("position", "position"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("purchaseRequisition", "purchaseRequisition"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("anyPosition", "anyPosition"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("paymentAdvice", "paymentAdvice"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "paymentAdvicePosition",
      "paymentAdvicePosition"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "supplierPurchaseOrder",
      "supplierPurchaseOrder"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "supplierPurchaseOrderPosition",
      "supplierPurchaseOrderPosition"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("allPositions", "allPositions"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("debitNote", "debitNote"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("debitNotePosition", "debitNotePosition"),
    BoolExpr.Default.true(),
  ],
];

const informationKeysEnum: Array<[CollectionReference, BoolExpr<Unit>]> = [
  [
    CollectionReference.Default("ZERO_PROTO", "ZERO_PROTO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("INVOICE_NO", "INVOICE_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("INVOICE_DATE", "INVOICE_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DELIVERY_NO", "DELIVERY_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DELIVERY_DATE", "DELIVERY_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ORDER_NO", "ORDER_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ORDER_DATE", "ORDER_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("COMPANY_NAME", "COMPANY_NAME"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("STREET", "STREET"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("POSTCODE", "POSTCODE"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("CITY", "CITY"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("SUBTOTAL", "SUBTOTAL"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("TAX", "TAX"), BoolExpr.Default.true()],
  [CollectionReference.Default("TOTAL", "TOTAL"), BoolExpr.Default.true()],
  [
    CollectionReference.Default(
      "DISCOUNT_PAYMENT_DATE",
      "DISCOUNT_PAYMENT_DATE"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("LATEST_PAYMENT_DATE", "LATEST_PAYMENT_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("BANK_ACCOUNT", "BANK_ACCOUNT"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("IBAN", "IBAN"), BoolExpr.Default.true()],
  [CollectionReference.Default("BIC", "BIC"), BoolExpr.Default.true()],
  [CollectionReference.Default("VAT_NO", "VAT_NO"), BoolExpr.Default.true()],
  [CollectionReference.Default("TAX_NO", "TAX_NO"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("DIRECT_DEBIT", "DIRECT_DEBIT"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CUSTOMER_NO", "CUSTOMER_NO"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("PAGE_NO", "PAGE_NO"), BoolExpr.Default.true()],
  [CollectionReference.Default("EMAIL", "EMAIL"), BoolExpr.Default.true()],
  [CollectionReference.Default("URL", "URL"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("SENDER_NO", "SENDER_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PURCHASE_ORDER_NO", "PURCHASE_ORDER_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PURCHASE_ORDER_DATE", "PURCHASE_ORDER_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ADDITIONAL_COST", "ADDITIONAL_COST"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("SUM_OF_GOODS", "SUM_OF_GOODS"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ADDITIONAL_DISCOUNT", "ADDITIONAL_DISCOUNT"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CASH_DISCOUNT", "CASH_DISCOUNT"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PAYMENTSLIP_ACCOUNT", "PAYMENTSLIP_ACCOUNT"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "PAYMENTSLIP_REFERENCE_ID",
      "PAYMENTSLIP_REFERENCE_ID"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PAYMENTSLIP_AMOUNT", "PAYMENTSLIP_AMOUNT"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PAYMENTSLIP_ESR", "PAYMENTSLIP_ESR"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "PAYMENTSLIP_BANK_NAME",
      "PAYMENTSLIP_BANK_NAME"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "PAYMENTSLIP_BANK_POSTCODECITY",
      "PAYMENTSLIP_BANK_POSTCODECITY"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "PAYMENTSLIP_RECEIVER_NAME",
      "PAYMENTSLIP_RECEIVER_NAME"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "PAYMENTSLIP_RECEIVER_POSTCODECITY",
      "PAYMENTSLIP_RECEIVER_POSTCODECITY"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "PAYMENTSLIP_RECEIVER_STREET",
      "PAYMENTSLIP_RECEIVER_STREET"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "PAYMENTSLIP_PAYER_NAME",
      "PAYMENTSLIP_PAYER_NAME"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "PAYMENTSLIP_PAYER_POSTCODECITY",
      "PAYMENTSLIP_PAYER_POSTCODECITY"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "PAYMENTSLIP_PAYER_STREET",
      "PAYMENTSLIP_PAYER_STREET"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CURRENCY", "CURRENCY"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("TAX_RATE", "TAX_RATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "PAYMENTSLIP_RECEIVER_COUNTRY",
      "PAYMENTSLIP_RECEIVER_COUNTRY"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "PAYMENTSLIP_PAYER_COUNTRY",
      "PAYMENTSLIP_PAYER_COUNTRY"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PAYMENTSLIP_MESSAGE", "PAYMENTSLIP_MESSAGE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PAYMENTSLIP_QRCODE", "PAYMENTSLIP_QRCODE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DOCUMENT_TYPE", "DOCUMENT_TYPE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PAYMENTSLIP_IBAN", "PAYMENTSLIP_IBAN"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DOCUMENT_NO", "DOCUMENT_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DOCUMENT_DATE", "DOCUMENT_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("MIN_AMOUNT", "MIN_AMOUNT"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("ITEM_NO", "ITEM_NO"), BoolExpr.Default.true()],
  [CollectionReference.Default("CHARGE", "CHARGE"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("SERIAL_NO", "SERIAL_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("REFERENCE_NO", "REFERENCE_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("REFERENCE_DATE", "REFERENCE_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ORDER_CONFIRMATION_NO",
      "ORDER_CONFIRMATION_NO"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ORDER_CONFIRMATION_DATE",
      "ORDER_CONFIRMATION_DATE"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("VALUE_DATE", "VALUE_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CREDIT_VOUCHER_NO", "CREDIT_VOUCHER_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CREDIT_VOUCHER_DATE", "CREDIT_VOUCHER_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("RECEIPT_NO", "RECEIPT_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("RECEIPT_DATE", "RECEIPT_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "INVOICE_CORRECTION_NO",
      "INVOICE_CORRECTION_NO"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "INVOICE_CORRECTION_DATE",
      "INVOICE_CORRECTION_DATE"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DELIVER_DATE", "DELIVER_DATE"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("BLZ_NO", "BLZ_NO"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("CATALOG_NO", "CATALOG_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CERTIFICATE_NO", "CERTIFICATE_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CHARGE_EXPIRY_DATE", "CHARGE_EXPIRY_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("COMMISSION_NO", "COMMISSION_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CONTRACT_NO", "CONTRACT_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CUSTOMS_NO", "CUSTOMS_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DELIVERY_CONDITIONS", "DELIVERY_CONDITIONS"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DELIVERY_METHOD", "DELIVERY_METHOD"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DESIRED_DATE", "DESIRED_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DISPATCH_DATE", "DISPATCH_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DISPATCH_NO", "DISPATCH_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "DOCUMENT_CREATION_DATE",
      "DOCUMENT_CREATION_DATE"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DOCUMENT_PRINT_DATE", "DOCUMENT_PRINT_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DRAWING_INDEX_DATE", "DRAWING_INDEX_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DRAWING_INDEX_NO", "DRAWING_INDEX_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DRAWING_NO", "DRAWING_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("EU_PRODUCT_NO", "EU_PRODUCT_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("EXPIRY_DATE", "EXPIRY_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("FAX_NUMBER", "FAX_NUMBER"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("GOODS_TARIFF_NO", "GOODS_TARIFF_NO"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("HS_NO", "HS_NO"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("PRODUCT_ORIGIN", "PRODUCT_ORIGIN"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "MAINTENANCE_CONTRACT_NO",
      "MAINTENANCE_CONTRACT_NO"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("MATERIAL_GROUP", "MATERIAL_GROUP"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("MATERIAL_NO", "MATERIAL_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("OFFER_DATE", "OFFER_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("OFFER_NO", "OFFER_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("OFFER_VALIDITY_DATE", "OFFER_VALIDITY_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "OUTLINE_AGREEMENT_DATE",
      "OUTLINE_AGREEMENT_DATE"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("OUTLINE_AGREEMENT_NO", "OUTLINE_AGREEMENT_NO"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("PART_NO", "PART_NO"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("PAYMENT_REFERENCE", "PAYMENT_REFERENCE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PERFORMANCE_DATE", "PERFORMANCE_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PHONE_NUMBER", "PHONE_NUMBER"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PROCESS_NO", "PROCESS_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PRODUCT_GROUP", "PRODUCT_GROUP"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PRODUCT_NO", "PRODUCT_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PROJECT_DATE", "PROJECT_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PROJECT_NO", "PROJECT_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("RELEASE_ORDER_NO", "RELEASE_ORDER_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("REQUEST_DATE", "REQUEST_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("REQUEST_NO", "REQUEST_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("RETURN_DELIVERY_NO", "RETURN_DELIVERY_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ROUNDING_AMOUNT", "ROUNDING_AMOUNT"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("SUPPLIER_ITEM_NO", "SUPPLIER_ITEM_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DELIVER_WEEK", "DELIVER_WEEK"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DISPATCH_WEEK", "DISPATCH_WEEK"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("COUNTRY", "COUNTRY"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("ADDRESS_INFO", "ADDRESS_INFO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("POSTFACH", "POSTFACH"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CONTACT_PERSON", "CONTACT_PERSON"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "CONTACT_PERSON_INTERNAL",
      "CONTACT_PERSON_INTERNAL"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("R_ADDRESS_INFO", "R_ADDRESS_INFO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DELIVERY_TERM", "DELIVERY_TERM"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("OCR", "OCR"), BoolExpr.Default.true()],
  [CollectionReference.Default("KID", "KID"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("INCOTERM", "INCOTERM"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("VAT_DATE", "VAT_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "CZECH_PAYMENT_REFERENCE",
      "CZECH_PAYMENT_REFERENCE"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CURRENCY_FACTOR", "CURRENCY_FACTOR"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("QC_MATERIAL_NO", "QC_MATERIAL_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("MATERIAL_DESCRIPTION", "MATERIAL_DESCRIPTION"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("LOT_NUMBER", "LOT_NUMBER"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DELIVERY_QUANTITY", "DELIVERY_QUANTITY"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("MANUFACTURE_DATE", "MANUFACTURE_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("BEST_BEFORE_DATE", "BEST_BEFORE_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PRODUCTION_PERIOD", "PRODUCTION_PERIOD"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("REMARK", "REMARK"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("COMPANY_CODE", "COMPANY_CODE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("REQUESTER", "REQUESTER"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ROCHE_QC_MATERIAL_NO", "ROCHE_QC_MATERIAL_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ROCHE_MATERIAL_DESCRIPTION",
      "ROCHE_MATERIAL_DESCRIPTION"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ROCHE_LOT_NUMBER", "ROCHE_LOT_NUMBER"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ROCHE_DELIVERY_QUANTITY",
      "ROCHE_DELIVERY_QUANTITY"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ROCHE_MANUFACTURE_DATE",
      "ROCHE_MANUFACTURE_DATE"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ROCHE_MANUFACTURE_DATE_START",
      "ROCHE_MANUFACTURE_DATE_START"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ROCHE_MANUFACTURE_DATE_END",
      "ROCHE_MANUFACTURE_DATE_END"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ROCHE_BEST_BEFORE_DATE",
      "ROCHE_BEST_BEFORE_DATE"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ROCHE_PRODUCTION_PERIOD",
      "ROCHE_PRODUCTION_PERIOD"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ROCHE_REMARK", "ROCHE_REMARK"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ROCHE_GLOBAL_MATERIAL_NO",
      "ROCHE_GLOBAL_MATERIAL_NO"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ROCHE_PRODUCTION_PERIOD_START",
      "ROCHE_PRODUCTION_PERIOD_START"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ROCHE_PRODUCTION_PERIOD_END",
      "ROCHE_PRODUCTION_PERIOD_END"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ROCHE_EXPIRY_DATE", "ROCHE_EXPIRY_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ROCHE_TECHNICAL_DELIVERY_CONDITIONS",
      "ROCHE_TECHNICAL_DELIVERY_CONDITIONS"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DATE_OF_SERVICE", "DATE_OF_SERVICE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PAYMENT_ADVICE_NO", "PAYMENT_ADVICE_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PAYMENT_ADVICE_DATE", "PAYMENT_ADVICE_DATE"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DEBIT_NOTE_NO", "DEBIT_NOTE_NO"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DEBIT_NOTE_DATE", "DEBIT_NOTE_DATE"),
    BoolExpr.Default.true(),
  ],
];

const filtersOpEnum: Array<[CollectionReference, BoolExpr<Unit>]> = [
  [CollectionReference.Default("eq", "eq"), BoolExpr.Default.true()],
  [CollectionReference.Default("neq", "neq"), BoolExpr.Default.true()],
  [CollectionReference.Default("gt", "gt"), BoolExpr.Default.true()],
  [CollectionReference.Default("gte", "gte"), BoolExpr.Default.true()],
  [CollectionReference.Default("lt", "lt"), BoolExpr.Default.true()],
  [CollectionReference.Default("lte", "lte"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("contains", "contains"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("notContains", "notContains"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("match", "match"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("notMatch", "notMatch"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("isNull", "isNull"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("isNotNull", "isNotNull"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("groupedDataContains", "groupedDataContains"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "groupedDataNotContains",
      "groupedDataNotContains"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "groupedDataContainsPrefix",
      "groupedDataContainsPrefix"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "groupedDataNotContainsPrefix",
      "groupedDataNotContainsPrefix"
    ),
    BoolExpr.Default.true(),
  ],
];

const accountingPositionFieldsEnum: Array<
  [CollectionReference, BoolExpr<Unit>]
> = [
  [
    CollectionReference.Default("DocumentPosition", "DocumentPosition"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ArticleId", "ArticleId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("EmployeeId", "EmployeeId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("Employee2Id", "Employee2Id"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "DynamicAccountingApprovalId",
      "DynamicAccountingApprovalId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CompanyCode", "CompanyCode"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("Account", "Account"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("ContraAccount", "ContraAccount"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter", "CostCenter"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter2", "CostCenter2"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter3", "CostCenter3"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter4", "CostCenter4"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter5", "CostCenter5"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter6", "CostCenter6"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter7", "CostCenter7"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter8", "CostCenter8"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter9", "CostCenter9"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter10", "CostCenter10"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter11", "CostCenter11"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter12", "CostCenter12"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter13", "CostCenter13"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter14", "CostCenter14"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CostCenter15", "CostCenter15"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("VatId", "VatId"), BoolExpr.Default.true()],
  [
    CollectionReference.Default("InternalOrderId", "InternalOrderId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("SalesOrderId", "SalesOrderId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("SalesOrderPositionId", "SalesOrderPositionId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ProfitCenterId", "ProfitCenterId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ControllingAreaId", "ControllingAreaId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ResponsibilityCenterId",
      "ResponsibilityCenterId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("VatPostingGroup1Id", "VatPostingGroup1Id"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("VatPostingGroup2Id", "VatPostingGroup2Id"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("AccountingHelpers", "AccountingHelpers"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ProjectId", "ProjectId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("NetworkId", "NetworkId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("CustomerId", "CustomerId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("SupplierId", "SupplierId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("FixedAssetId", "FixedAssetId"),
    BoolExpr.Default.true(),
  ],
  [CollectionReference.Default("PlantId", "PlantId"), BoolExpr.Default.true()],
  [
    CollectionReference.Default(
      "AssetTransactionTypeId",
      "AssetTransactionTypeId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("BusinessAreaId", "BusinessAreaId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PostingKeyId", "PostingKeyId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "ProjectNetworkTransactionId",
      "ProjectNetworkTransactionId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("MovementTypeId", "MovementTypeId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaBillingTypeId",
      "SapCostDimensionCopaBillingTypeId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaCustomerId",
      "SapCostDimensionCopaCustomerId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaMaterialId",
      "SapCostDimensionCopaMaterialId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaSalesOrderId",
      "SapCostDimensionCopaSalesOrderId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaSalesOrderItemId",
      "SapCostDimensionCopaSalesOrderItemId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaInternalOrderId",
      "SapCostDimensionCopaInternalOrderId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaPlantId",
      "SapCostDimensionCopaPlantId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaFunctionalAreaId",
      "SapCostDimensionCopaFunctionalAreaId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaSegmentId",
      "SapCostDimensionCopaSegmentId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaSalesOrganizationId",
      "SapCostDimensionCopaSalesOrganizationId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaDistributionChannelId",
      "SapCostDimensionCopaDistributionChannelId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaDivisionId",
      "SapCostDimensionCopaDivisionId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaProjectId",
      "SapCostDimensionCopaProjectId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaCostCenterId",
      "SapCostDimensionCopaCostCenterId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaProfitCenterId",
      "SapCostDimensionCopaProfitCenterId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaPartnerProfitCenterId",
      "SapCostDimensionCopaPartnerProfitCenterId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaServiceDocumentTypeId",
      "SapCostDimensionCopaServiceDocumentTypeId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaServiceDocumentId",
      "SapCostDimensionCopaServiceDocumentId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaServiceDocumentItemId",
      "SapCostDimensionCopaServiceDocumentItemId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaSolutionOrderId",
      "SapCostDimensionCopaSolutionOrderId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaSolutionOrderItemId",
      "SapCostDimensionCopaSolutionOrderItemId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaContractId",
      "SapCostDimensionCopaContractId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaContractItemId",
      "SapCostDimensionCopaContractItemId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaCustomerGroupId",
      "SapCostDimensionCopaCustomerGroupId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaBillToPartyId",
      "SapCostDimensionCopaBillToPartyId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaShipToPartyId",
      "SapCostDimensionCopaShipToPartyId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaCountry",
      "SapCostDimensionCopaCountry"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaIndustryKeyId",
      "SapCostDimensionCopaIndustryKeyId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaMaterialGroupId",
      "SapCostDimensionCopaMaterialGroupId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCopaSalesDistrictId",
      "SapCostDimensionCopaSalesDistrictId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionTradingPartnerNoId",
      "SapCostDimensionTradingPartnerNoId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionTradingPartnerBusinessAreaId",
      "SapCostDimensionTradingPartnerBusinessAreaId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionPartnerProfitCenterId",
      "SapCostDimensionPartnerProfitCenterId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionFinancialBudgetItem",
      "SapCostDimensionFinancialBudgetItem"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionFundsCenterId",
      "SapCostDimensionFundsCenterId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionCommitmentItemId",
      "SapCostDimensionCommitmentItemId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionFundId",
      "SapCostDimensionFundId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionGrantId",
      "SapCostDimensionGrantId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionActivityTypeId",
      "SapCostDimensionActivityTypeId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionTransactionTypeId",
      "SapCostDimensionTransactionTypeId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionEarmarkedFundsDocNumberId",
      "SapCostDimensionEarmarkedFundsDocNumberId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionEarmarkedFundsDocNumberPosId",
      "SapCostDimensionEarmarkedFundsDocNumberPosId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionFunctionalAreaId",
      "SapCostDimensionFunctionalAreaId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionBusinessProcessId",
      "SapCostDimensionBusinessProcessId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionBusinessEntityId",
      "SapCostDimensionBusinessEntityId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionBuildingNumberId",
      "SapCostDimensionBuildingNumberId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionPropertyNumberId",
      "SapCostDimensionPropertyNumberId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionRentalUnitId",
      "SapCostDimensionRentalUnitId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionRentalAgreementId",
      "SapCostDimensionRentalAgreementId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionLeaseOutNumberId",
      "SapCostDimensionLeaseOutNumberId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionServiceChargeKeyId",
      "SapCostDimensionServiceChargeKeyId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionSettlementUnitId",
      "SapCostDimensionSettlementUnitId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionManagementContractId",
      "SapCostDimensionManagementContractId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionRealEstateGeneralContractId",
      "SapCostDimensionRealEstateGeneralContractId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionJointVentureId",
      "SapCostDimensionJointVentureId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionEquityGroupId",
      "SapCostDimensionEquityGroupId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionRecoveryIndicatorId",
      "SapCostDimensionRecoveryIndicatorId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionReportingSegmentId",
      "SapCostDimensionReportingSegmentId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionReportingPartnerSegmentId",
      "SapCostDimensionReportingPartnerSegmentId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionFinancialManagementAreaId",
      "SapCostDimensionFinancialManagementAreaId"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionBillingPeriodPerformanceEndDate",
      "SapCostDimensionBillingPeriodPerformanceEndDate"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionBillingPeriodPerformanceStartDate",
      "SapCostDimensionBillingPeriodPerformanceStartDate"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionProductionMonth",
      "SapCostDimensionProductionMonth"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionReferenceDate",
      "SapCostDimensionReferenceDate"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "SapCostDimensionSettlementDate",
      "SapCostDimensionSettlementDate"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("DeferralCodeId", "DeferralCodeId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default(
      "GeneralPostingGroup2Id",
      "GeneralPostingGroup2Id"
    ),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("VehicleId", "VehicleId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ProjectJobId", "ProjectJobId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ProjectJobTaskId", "ProjectJobTaskId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("AccountingTemplateId", "AccountingTemplateId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ProductCategoryId", "ProductCategoryId"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PostingTextShort", "PostingTextShort"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("PostingTextShort2", "PostingTextShort2"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("Assignment", "Assignment"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("NetAccountingPrice", "NetAccountingPrice"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("GrossAccountingPrice", "GrossAccountingPrice"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("Percentage", "Percentage"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("QuantityInvoiced", "QuantityInvoiced"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("SpecialGlIndicator", "SpecialGlIndicator"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("TaxJurisdictionKey", "TaxJurisdictionKey"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("Approved", "Approved"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("Currency", "Currency"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("ValueDate", "ValueDate"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("VatInvoice", "VatInvoice"),
    BoolExpr.Default.true(),
  ],
  [
    CollectionReference.Default("VatValidFromDate", "VatValidFromDate"),
    BoolExpr.Default.true(),
  ],
];

const streamApis: InfiniteStreamSources = (streamName: string) => {
  switch (streamName) {
    case "requiredKeyValueField":
      return (_searchText: string) => (_streamPosition: [StreamPosition]) => {
        const mapped = OrderedMapRepo.Default.fromSmallIdentifiables(
          Range(0, 20)
            .map(() =>
              CollectionReference.Default(
                v4(),
                _searchText +
                  faker.company.buzzNoun() +
                  " required key-value fields"
              )
            )
            .toArray()
        );
        return Promise.resolve({
          data: mapped,
          hasMoreValues: false,
        });
      };

    default:
      alert(`Cannot find stream API ${streamName}`);
      return (_: string) => (_: [StreamPosition]) => Promise.reject();
  }
};

const enumApis: EnumOptionsSources = (enumName: string) => {
  switch (enumName) {
    case "requiredKeyValueFieldsEnum": {
      return () => Promise.resolve(requiredKeyValueFieldsEnum);
    }
    case "highConfidenceKeyValueFieldsEnum": {
      return () => Promise.resolve(requiredKeyValueFieldsEnum);
    }
    case "documentNumberDefaultingsFromKeyValueEnum": {
      return () => Promise.resolve(requiredKeyValueFieldsEnum);
    }
    case "documentDateDefaultingsFromKeyValueEnum": {
      return () => Promise.resolve(requiredKeyValueFieldsEnum);
    }
    case "configurableNumberDefaultingsFromKeyValueEnum": {
      return () => Promise.resolve(requiredKeyValueFieldsEnum);
    }
    case "configurableNumber2DefaultingsFromKeyValueEnum": {
      return () => Promise.resolve(requiredKeyValueFieldsEnum);
    }
    case "contextEnum": {
      return () => Promise.resolve(contextEnum);
    }
    case "filterGroupOpEnum": {
      return () => Promise.resolve(filterGroupOpEnum);
    }
    case "accountingPositionFieldsEnum": {
      return () => Promise.resolve(accountingPositionFieldsEnum);
    }
    case "filtersOpEnum": {
      return () => Promise.resolve(filtersOpEnum);
    }
    case "informationKeysEnum": {
      return () => Promise.resolve(informationKeysEnum);
    }
    case "informationKeysDisabledEnum": {
      return () => Promise.resolve(informationKeysEnum);
    }
    case "informationCardFieldsEnum": {
      return () => Promise.resolve(informationCardFieldsEnum);
    }
    case "informationCardFieldsDisabledEnum": {
      return () => Promise.resolve(informationCardFieldsEnum);
    }
    case "debitNoteResultFieldsEnum": {
      return () => Promise.resolve(debitNoteResultFieldsEnum);
    }
    default: {
      alert(`Cannot find enum API ${enumName}`);
      return () => Promise.reject();
    }
  }
};

const entityApis: EntityApis = {
  create: (apiName: string) => (_e: any) => {
    alert(`Cannot find entity API ${apiName} for 'create'`);
    return Promise.reject();
  },

  get: (apiName: string) => {
    switch (apiName) {
      case "debitNoteHeaderConfigApi": {
        return (_id: Guid) =>
          Promise.resolve({
            commitChecks: {
              keyValueCommitChecks: {
                requiredKeyValueFields: undefined,
                highConfidenceKeyValueFields: undefined,
              },
              dataFilterGroupCommitChecks: {
                name: "",
                nameTranslations: "",
                description: "",
                descriptionTranslations: "",
                context: undefined,
                filterGroup: {
                  filterGroupOp: undefined,
                  filters: [],
                  // {
                  //   name: "",
                  //   filterOp: undefined,
                  // }
                },
                fieldContext: {
                  accountingPositionFields: undefined,
                },
              },
              synchronizedDataFilterGroupCommitChecks: {
                synchronizedDataFilterGroupCommitChecks: [],
              },
              documentNumberCommitChecks: {
                documentNumberIsSet: false,
                documentNumberIsHighConfidence: false,
                maxDocumentNumberLength: 0,
                configurableNumberIsSet: false,
                configurableNumberIsHighConfidence: false,
                configurableNumber2IsSet: false,
                configurableNumber2IsHighConfidence: false,
              },
              unequalTableToDocumentRowsCheck: {
                unequalTableToDocumentRowsCheck: false,
              },
            },
            dashboard: {
              keyValueFields: {
                informationKeys: undefined,
                informationKeysDisabled: undefined,
                informationFreeKeys: [],
              },
              informationCardFields: {
                informationCardFields: undefined,
              },
              informationCardFieldsDisabled: {
                informationCardFieldsDisabled: undefined,
              },
            },
            systemConfig: {
              debitNoteResultFields: undefined,
              automation: {
                headerFieldsDefaults: {
                  documentNumberDefaultingsFromKeyValue: undefined,
                  documentDateDefaultingsFromKeyValue: undefined,
                  configurableNumberDefaultingsFromKeyValue: undefined,
                  configurableNumber2DefaultingsFromKeyValue: undefined,
                },
              },
            },
          });
      }
      default: {
        return (_id: Guid) => {
          alert(`Cannot find entity API ${apiName} for 'get'`);
          return Promise.resolve([]);
        };
      }
    }
  },

  update: (apiName: string) => {
    switch (apiName) {
      case "debitNoteHeaderConfigApi": {
        return (_) => PromiseRepo.Default.mock(() => []);
      }
      default: {
        return (_) => {
          alert(`Cannot find entity API ${apiName} for 'update'`);
          return Promise.resolve([]);
        };
      }
    }
  },

  default: (apiName: string) => {
    switch (apiName) {
      default: {
        return (_) => {
          alert(`Cannot find entity API ${apiName} for 'default'`);
          return Promise.reject();
        };
      }
    }
  },
};

export const DebitNoteHeaderConfigApi = {
  streamApis,
  enumApis,
  entityApis,
};
