/** Upper-cases the first character of `text`. */
export function capitalize(text) {
  return text.length === 0 ? text : text[0].toUpperCase() + text.slice(1)
}
