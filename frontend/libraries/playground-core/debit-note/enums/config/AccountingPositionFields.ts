import { CollectionReference } from "ballerina-core";

const accountingPositionFields: Array<{Value: string}> = [
  {Value: "DocumentPosition"},
  {Value: "ArticleId"},
  {Value: "EmployeeId"},
  {Value: "Employee2Id"},
  {Value: "DynamicAccountingApprovalId"},
  {Value: "CompanyCode"},
  {Value: "Account"},
  {Value: "ContraAccount"},
  {Value: "CostCenter"},
  {Value: "CostCenter2"},
  {Value: "CostCenter3"},
  {Value: "CostCenter4"},
  {Value: "CostCenter5"},
  {Value: "CostCenter6"},
  {Value: "CostCenter7"},
  {Value: "CostCenter8"},
  {Value: "CostCenter9"},
  {Value: "CostCenter10"},
  {Value: "CostCenter11"},
  {Value: "CostCenter12"},
  {Value: "CostCenter13"},
  {Value: "CostCenter14"},
  {Value: "CostCenter15"},
  {Value: "VatId"},
  {Value: "InternalOrderId"},
  {Value: "SalesOrderId"},
  {Value: "SalesOrderPositionId"},
  {Value: "ProfitCenterId"},
  {Value: "ControllingAreaId"},
  {Value: "ResponsibilityCenterId"},
  {Value: "VatPostingGroup1Id"},
  {Value: "VatPostingGroup2Id"},
  {Value: "AccountingHelpers"},
  {Value: "ProjectId"},
  {Value: "NetworkId"},
  {Value: "CustomerId"},
  {Value: "SupplierId"},
  {Value: "FixedAssetId"},
  {Value: "PlantId"},
  {Value: "AssetTransactionTypeId"},
  {Value: "BusinessAreaId"},
  {Value: "PostingKeyId"},
  {Value: "ProjectNetworkTransactionId"},
  {Value: "MovementTypeId"},
  {Value: "SapCostDimensionCopaBillingTypeId"},
  {Value: "SapCostDimensionCopaCustomerId"},
  {Value: "SapCostDimensionCopaMaterialId"},
  {Value: "SapCostDimensionCopaSalesOrderId"},
  {Value: "SapCostDimensionCopaSalesOrderItemId"},
  {Value: "SapCostDimensionCopaInternalOrderId"},
  {Value: "SapCostDimensionCopaPlantId"},
  {Value: "SapCostDimensionCopaFunctionalAreaId"},
  {Value: "SapCostDimensionCopaSegmentId"},
  {Value: "SapCostDimensionCopaSalesOrganizationId"},
  {Value: "SapCostDimensionCopaDistributionChannelId"},
  {Value: "SapCostDimensionCopaDivisionId"},
  {Value: "SapCostDimensionCopaProjectId"},
  {Value: "SapCostDimensionCopaCostCenterId"},
  {Value: "SapCostDimensionCopaProfitCenterId"},
  {Value: "SapCostDimensionCopaPartnerProfitCenterId"},
  {Value: "SapCostDimensionCopaServiceDocumentTypeId"},
  {Value: "SapCostDimensionCopaServiceDocumentId"},
  {Value: "SapCostDimensionCopaServiceDocumentItemId"},
  {Value: "SapCostDimensionCopaSolutionOrderId"},
  {Value: "SapCostDimensionCopaSolutionOrderItemId"},
  {Value: "SapCostDimensionCopaContractId"},
  {Value: "SapCostDimensionCopaContractItemId"},
  {Value: "SapCostDimensionCopaCustomerGroupId"},
  {Value: "SapCostDimensionCopaBillToPartyId"},
  {Value: "SapCostDimensionCopaShipToPartyId"},
  {Value: "SapCostDimensionCopaCountry"},
  {Value: "SapCostDimensionCopaIndustryKeyId"},
  {Value: "SapCostDimensionCopaMaterialGroupId"},
  {Value: "SapCostDimensionCopaSalesDistrictId"},
  {Value: "SapCostDimensionTradingPartnerNoId"},
  {Value: "SapCostDimensionTradingPartnerBusinessAreaId"},
  {Value: "SapCostDimensionPartnerProfitCenterId"},
  {Value: "SapCostDimensionFinancialBudgetItem"},
  {Value: "SapCostDimensionFundsCenterId"},
  {Value: "SapCostDimensionCommitmentItemId"},
  {Value: "SapCostDimensionFundId"},
  {Value: "SapCostDimensionGrantId"},
  {Value: "SapCostDimensionActivityTypeId"},
  {Value: "SapCostDimensionTransactionTypeId"},
  {Value: "SapCostDimensionEarmarkedFundsDocNumberId"},
  {Value: "SapCostDimensionEarmarkedFundsDocNumberPosId"},
  {Value: "SapCostDimensionFunctionalAreaId"},
  {Value: "SapCostDimensionBusinessProcessId"},
  {Value: "SapCostDimensionBusinessEntityId"},
  {Value: "SapCostDimensionBuildingNumberId"},
  {Value: "SapCostDimensionPropertyNumberId"},
  {Value: "SapCostDimensionRentalUnitId"},
  {Value: "SapCostDimensionRentalAgreementId"},
  {Value: "SapCostDimensionLeaseOutNumberId"},
  {Value: "SapCostDimensionServiceChargeKeyId"},
  {Value: "SapCostDimensionSettlementUnitId"},
  {Value: "SapCostDimensionManagementContractId"},
  {Value: "SapCostDimensionRealEstateGeneralContractId"},
  {Value: "SapCostDimensionJointVentureId"},
  {Value: "SapCostDimensionEquityGroupId"},
  {Value: "SapCostDimensionRecoveryIndicatorId"},
  {Value: "SapCostDimensionReportingSegmentId"},
  {Value: "SapCostDimensionReportingPartnerSegmentId"},
  {Value: "SapCostDimensionFinancialManagementAreaId"},
  {Value: "SapCostDimensionBillingPeriodPerformanceEndDate"},
  {Value: "SapCostDimensionBillingPeriodPerformanceStartDate"},
  {Value: "SapCostDimensionProductionMonth"},
  {Value: "SapCostDimensionReferenceDate"},
  {Value: "SapCostDimensionSettlementDate"},
  {Value: "DeferralCodeId"},
  {Value: "GeneralPostingGroup2Id"},
  {Value: "VehicleId"},
  {Value: "ProjectJobId"},
  {Value: "ProjectJobTaskId"},
  {Value: "AccountingTemplateId"},
  {Value: "ProductCategoryId"},
  {Value: "PostingTextShort"},
  {Value: "PostingTextShort2"},
  {Value: "Assignment"},
  {Value: "NetAccountingPrice"},
  {Value: "GrossAccountingPrice"},
  {Value: "Percentage"},
  {Value: "QuantityInvoiced"},
  {Value: "SpecialGlIndicator"},
  {Value: "TaxJurisdictionKey"},
  {Value: "Approved"},
  {Value: "Currency"},
  {Value: "SapCostDimensionBillingPeriodPerformanceEndDate"},
  {Value: "SapCostDimensionBillingPeriodPerformanceStartDate"},
  {Value: "SapCostDimensionProductionMonth"},
  {Value: "SapCostDimensionReferenceDate"},
  {Value: "SapCostDimensionSettlementDate"},
  {Value: "ValueDate"},
  {Value: "VatInvoice"},
  {Value: "VatValidFromDate"},
];

export default accountingPositionFields;
