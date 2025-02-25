import { initialIntegratedFormData, IntegratedPerson, integratedPersonConfig, IntegratedPersonConfig } from "playground-core";
import { PromiseRepo } from "ballerina-core";

export const IntegratedFormApi = {
  getRawData: (): Promise<IntegratedPerson> => PromiseRepo.Default.mock(
    () => initialIntegratedFormData, 
    () => ({
      kind: "errors",
      errors: ["error"]
    }),
    1,
    0
  ),
  getGlobalConfiguration: (): Promise<IntegratedPersonConfig> => PromiseRepo.Default.mock(
    () => integratedPersonConfig,
    () => ({
      kind: "errors",
      errors: ["error"]
    }),
    1,
    0
  )
}