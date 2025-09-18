import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

const scrollWhileHidden = (containerId: string, itemId: string): void => {
  const container = document.getElementById(containerId);
  const target = document.getElementById(itemId);

  if (!container || !target) return;

  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const isAbove = targetRect.top < containerRect.top;
  const isBelow = targetRect.bottom > containerRect.bottom;

  if (isAbove) {
    // Scroll just enough to bring the top of the item into view
    container.scrollTop -= containerRect.top - targetRect.top;
  } else if (isBelow) {
    // Scroll just enough to bring the bottom of the item into view
    container.scrollTop += targetRect.bottom - containerRect.bottom;
  }
};

const cdkScrollWhileHidden = (
  viewport: CdkVirtualScrollViewport | undefined,
  itemIdx: number,
  smooth: boolean = false
): void => {
  if (!viewport) return;

  const container = viewport.elementRef.nativeElement;
  let target = document.getElementById(itemIdx + '');

  if (!target) {
    viewport.scrollToIndex(itemIdx, smooth ? 'smooth' : undefined);
    target = document.getElementById(itemIdx + '');
  }

  if (!target) return;

  const containerRect = container.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();

  const isAbove = targetRect.top < containerRect.top;
  const isBelow = targetRect.bottom > containerRect.bottom;

  if (isAbove) {
    // Scroll just enough to bring the top of the item into view
    container.scrollTop -= containerRect.top - targetRect.top;
  } else if (isBelow) {
    // Scroll just enough to bring the bottom of the item into view
    container.scrollTop += targetRect.bottom - containerRect.bottom;
  }
};

export { scrollWhileHidden, cdkScrollWhileHidden };
