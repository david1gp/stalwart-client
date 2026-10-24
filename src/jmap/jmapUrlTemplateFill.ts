/**
 * Fill a JMAP session URL template (RFC 6570 level 1, as used by RFC 8620 §2
 * `downloadUrl`/`uploadUrl`/`eventSourceUrl`): every `{name}` is replaced by the
 * percent-encoded value. Unknown variables are left untouched.
 */
export function jmapUrlTemplateFill(template: string, vars: Readonly<Record<string, string>>): string {
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, name: string) => {
    const value = vars[name]
    return value === undefined ? match : encodeURIComponent(value)
  })
}
