export const errorPermanenceStatus = ['permanent failure', 'transient failure'] as const
export type ErrorPermanenceStatus = (typeof errorPermanenceStatus)[number]

export const apiResultStatuses = ['success', ...errorPermanenceStatus] as const
export type ApiResultStatus = (typeof apiResultStatuses)[number]
