export function logInfo(event: string, payload?: Record<string, unknown>) {
  console.info(`[Mix] ${event}`, payload ?? {});
}

export function logError(event: string, error: unknown) {
  console.error(`[Mix] ${event}`, error);
}
