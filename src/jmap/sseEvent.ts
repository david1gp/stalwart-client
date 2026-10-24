/** One Server-Sent Events frame: `{event, data, id}`. */
export type SseEvent = {
  event: string
  data: string
  id?: string
}
