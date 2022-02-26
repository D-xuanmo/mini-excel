/**
 * 通过标签名或者CSS类名获取元素的任一父级
 * @param el 当前元素
 * @param name className 或者 tagName
 */
export function getElementParent(el: HTMLElement, name: string): HTMLElement | null {
  if (!el) return el
  const parent = el.parentElement
  if (!parent) return null
  if (el.tagName.toLocaleLowerCase() === name || el?.classList.contains(name)) return el
  return (parent.tagName.toLocaleLowerCase() === name || parent.classList.contains(name))
    ? parent
    : getElementParent(parent, name)
}
