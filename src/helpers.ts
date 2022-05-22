export const findAncestor = (element: HTMLElement | null, selector: string) => {
  if (typeof element?.closest === 'function')
    return element.closest(selector) || null

  while (element) {
    if (element.matches(selector))
      return element

    element = element.parentElement
  }

  return null
}
