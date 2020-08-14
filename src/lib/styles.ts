export function styles(
  node: HTMLElement | SVGElement | SVGPathElement,
  styles: Record<string, string | number>,
) {
  setCustomProperties(node, styles);

  return {
    update(styles: Record<string, string | number>) {
      setCustomProperties(node, styles);
    },
  };
}

function setCustomProperties(
  node: HTMLElement | SVGElement | SVGPathElement,
  styles: Record<string, string | number>,
) {
  Object.entries(styles).forEach(([key, value]) => {
    node.style.setProperty(`${key}`, String(value));
  });
}
