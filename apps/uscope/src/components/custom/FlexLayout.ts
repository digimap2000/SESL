export class FlexLayout {
  layoutRowFill(container, {
    padding = 0,
    gap = 0,
    maxWidth = Infinity,
    align = 'start'
  } = {}) {
    const children = container.children;
    const count = children.length;
    if (count === 0) return;

    const totalGap = gap * (count - 1);
    const availableWidth = Math.max(0, maxWidth - padding * 2 - totalGap);
    const equalWidth = availableWidth / count;

    let x = padding;
    let y = padding;

    let maxHeight = 0;

    for (const child of children) {
      child.width = equalWidth; // dynamically stretch
      maxHeight = Math.max(maxHeight, child.height);
    }

    for (const child of children) {
      switch (align) {
        case 'center':
          child.y = y + (maxHeight - child.height) / 2;
          break;
        case 'end':
          child.y = y + (maxHeight - child.height);
          break;
        case 'start':
        default:
          child.y = y;
          break;
      }
      child.x = x;
      x += child.width + gap;
    }
  }
}
