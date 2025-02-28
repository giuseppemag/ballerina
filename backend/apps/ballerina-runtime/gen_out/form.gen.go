package Form

      import (
        "fmt"
          "ballerina.com/core"
  "github.com/google/uuid"
  "golang.org/x/exp/slices"
  "time"

      )
      func FormEnumAutoGETter(enumName string)  ([]string,error) {
  switch enumName {
    case "businessProcesses": return ballerina.MapArray(AllBusinessProcessEnumCases[:], func (c BusinessProcessEnum) string { return string(c) }), nil
    case "languages": return ballerina.MapArray(AllLanguageEnumCases[:], func (c LanguageEnum) string { return string(c) }), nil
  }
  var res []string
  return res, ballerina.NewEnumNotFoundError(enumName)
}

func FormEnumGETter[result any](enumName string, onbusinessProcesses func ([]BusinessProcessEnum) (result,error), onlanguages func ([]LanguageEnum) (result,error), ) (result,error) {
  switch enumName {
    case "businessProcesses": return onbusinessProcesses(AllBusinessProcessEnumCases[:])
    case "languages": return onlanguages(AllLanguageEnumCases[:])
  }
  var res result
  return res, ballerina.NewEnumNotFoundError(enumName)
}

func FormEnumPOSTter(enumName string, enumValue string, onbusinessProcesses func (BusinessProcessEnum) (ballerina.Unit,error), onlanguages func (LanguageEnum) (ballerina.Unit,error), ) (ballerina.Unit,error) {
  switch enumName {
  case "businessProcesses":
    if slices.Contains(AllBusinessProcessEnumCases[:], BusinessProcessEnum(enumValue)) {
      return onbusinessProcesses(BusinessProcessEnum(enumValue))
    }
  case "languages":
    if slices.Contains(AllLanguageEnumCases[:], LanguageEnum(enumValue)) {
      return onlanguages(LanguageEnum(enumValue))
    }
  }
  var result ballerina.Unit
  return result, ballerina.NewInvalidEnumValueCombinationError(enumName, enumValue )
}

func FormStreamGETter[searchParams any, serializedResult any](streamName string, searchArgs searchParams, getorganizationID func(searchParams) ([]OrganizationIDRef, error), serializeorganizationID func(searchParams, []OrganizationIDRef) (serializedResult, error), getuserID func(searchParams) ([]UserIDRef, error), serializeuserID func(searchParams, []UserIDRef) (serializedResult, error), ) (serializedResult,error) {
  var result serializedResult
  switch streamName {
  case "organizationID":
   var res,err = getorganizationID(searchArgs)
   if err != nil { return result,err }
   return serializeorganizationID(searchArgs, res)
  case "userID":
   var res,err = getuserID(searchArgs)
   if err != nil { return result,err }
   return serializeuserID(searchArgs, res)
  }
  return result, ballerina.NewStreamNotFoundError(streamName)
}

func FormStreamPOSTter[serializedResult any](streamName string, id uuid.UUID, getorganizationID func(uuid.UUID) (OrganizationIDRef, error), serializeorganizationID func(OrganizationIDRef) (serializedResult, error), getuserID func(uuid.UUID) (UserIDRef, error), serializeuserID func(UserIDRef) (serializedResult, error), ) (serializedResult,error) {
  var result serializedResult
  switch streamName {
  case "organizationID":
   var res,err = getorganizationID(id)
   if err != nil { return result,err }
   return serializeorganizationID(res)
  case "userID":
   var res,err = getuserID(id)
   if err != nil { return result,err }
   return serializeuserID(res)
  }
  return result, ballerina.NewStreamNotFoundError(streamName)
}


type BusinessProcessEnum string
const (
  BusinessProcessEnumFI_INVOICE BusinessProcessEnum = "FI_INVOICE" 
  BusinessProcessEnumMM_INVOICE BusinessProcessEnum = "MM_INVOICE" 
  BusinessProcessEnumORDER_CONFIRMATION BusinessProcessEnum = "ORDER_CONFIRMATION" 
  BusinessProcessEnumDELIVERY_NOTE BusinessProcessEnum = "DELIVERY_NOTE" 
  BusinessProcessEnumSALES_ORDER BusinessProcessEnum = "SALES_ORDER" 
  BusinessProcessEnumPAYMENT_ADVICE BusinessProcessEnum = "PAYMENT_ADVICE" 
  BusinessProcessEnumDEBIT_NOTE BusinessProcessEnum = "DEBIT_NOTE" 
)
var AllBusinessProcessEnumCases = [...]BusinessProcessEnum{ BusinessProcessEnumFI_INVOICE, BusinessProcessEnumMM_INVOICE, BusinessProcessEnumORDER_CONFIRMATION, BusinessProcessEnumDELIVERY_NOTE, BusinessProcessEnumSALES_ORDER, BusinessProcessEnumPAYMENT_ADVICE, BusinessProcessEnumDEBIT_NOTE, }

type BusinessProcessRef struct {
  Value BusinessProcessEnum
}

func NewBusinessProcessRef(Value BusinessProcessEnum, ) BusinessProcessRef {
  var res BusinessProcessRef
  res.Value = Value;
  return res
}


type CollectionReference struct {
  DisplayValue string
  Id uuid.UUID
}

func NewCollectionReference(DisplayValue string, Id uuid.UUID, ) CollectionReference {
  var res CollectionReference
  res.DisplayValue = DisplayValue;
  res.Id = Id;
  return res
}


type GlobalConfiguration struct {
}

func NewGlobalConfiguration() GlobalConfiguration {
  var res GlobalConfiguration
  return res
}


type LanguageEnum string
const (
  LanguageEnumEN LanguageEnum = "EN" 
  LanguageEnumDE LanguageEnum = "DE" 
)
var AllLanguageEnumCases = [...]LanguageEnum{ LanguageEnumEN, LanguageEnumDE, }

type LanguageRef struct {
  Value LanguageEnum
}

func NewLanguageRef(Value LanguageEnum, ) LanguageRef {
  var res LanguageRef
  res.Value = Value;
  return res
}


type OrganizationIDRef struct {
  DisplayValue string
  Id uuid.UUID
}

func NewOrganizationIDRef(DisplayValue string, Id uuid.UUID, ) OrganizationIDRef {
  var res OrganizationIDRef
  res.DisplayValue = DisplayValue;
  res.Id = Id;
  return res
}


type SetupGuideInitializationRequestBody struct {
  BusinessProcesses ballerina.Set[BusinessProcessRef]
  JiraGoLiveTicket string
  Language ballerina.Option[LanguageRef]
  ProductionOrganizationID ballerina.Option[OrganizationIDRef]
  TestOrganizationID ballerina.Option[OrganizationIDRef]
}

func NewSetupGuideInitializationRequestBody(businessProcesses ballerina.Set[BusinessProcessRef], jiraGoLiveTicket string, language ballerina.Option[LanguageRef], productionOrganizationID ballerina.Option[OrganizationIDRef], testOrganizationID ballerina.Option[OrganizationIDRef], ) SetupGuideInitializationRequestBody {
  var res SetupGuideInitializationRequestBody
  res.BusinessProcesses = businessProcesses;
  res.JiraGoLiveTicket = jiraGoLiveTicket;
  res.Language = language;
  res.ProductionOrganizationID = productionOrganizationID;
  res.TestOrganizationID = testOrganizationID;
  return res
}


type SetupGuideModifyBody struct {
  GoLiveDatePerBusinessProcess ballerina.Sum[ballerina.Option[BusinessProcessRef],time.Time]
  JiraGoLiveTicket string
}

func NewSetupGuideModifyBody(goLiveDatePerBusinessProcess ballerina.Sum[ballerina.Option[BusinessProcessRef],time.Time], jiraGoLiveTicket string, ) SetupGuideModifyBody {
  var res SetupGuideModifyBody
  res.GoLiveDatePerBusinessProcess = goLiveDatePerBusinessProcess;
  res.JiraGoLiveTicket = jiraGoLiveTicket;
  return res
}


type UserIDRef struct {
  DisplayValue string
  Id uuid.UUID
}

func NewUserIDRef(DisplayValue string, Id uuid.UUID, ) UserIDRef {
  var res UserIDRef
  res.DisplayValue = DisplayValue;
  res.Id = Id;
  return res
}


type injectedCategory = ballerina.Unit