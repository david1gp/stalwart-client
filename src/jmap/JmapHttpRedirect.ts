/** A 3xx response observed (not followed) by `jmapHttpRequest` with `responseType: "redirect"`. */
export type JmapHttpRedirect = {
  status: number
  location: string
}
