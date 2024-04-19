
export const apiResultStatuses = ["success", "permanent failure", "transient failure - retry later"] as const
export type ApiResultStatus = (typeof apiResultStatuses)[number]
