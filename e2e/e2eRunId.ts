/** Short, run-scoped id used to namespace throwaway e2e objects (e.g. `e2e-<runId>.test`). */
export function e2eRunId(): string {
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 0xffff).toString(36)}`
}
