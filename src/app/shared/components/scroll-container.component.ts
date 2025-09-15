import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-scroll-container',
  imports: [],
  template: `
    <section
      id="scroll-wrapper"
      [class]="(styleClass() || '') + ' relative group'"
    >
      <!-- Top gradient overlay -->
      <div
        [class.opacity-0]="!canScrollUp() || hiddenGradient()"
        class="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-white to-transparent pointer-events-none transition-opacity duration-300 z-10"
      ></div>

      <!-- Bottom gradient overlay -->
      <div
        [class.opacity-0]="!canScrollDown() || hiddenGradient()"
        class="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 z-10"
      ></div>

      <!-- Custom scrollbar -->
      <div
        class="custom-scrollbar group-hover:opacity-100 absolute top-0 right-1/100 h-full bg-transparent rounded-xs opacity-0 transition-opacity duration-500 z-10"
        [class.opacity-100]="isScrolling() || isDragging()"
      >
        <div
          class="absolute right-0 w-1.5 rounded-full bg-black/30 transition-colors duration-300 hover:bg-black/50"
          [class]="isDragging() ? 'bg-black/50' : 'bg-black/30'"
          [style.height.%]="scrollThumbHeight()"
          [style.top.%]="scrollThumbTop()"
          (mousedown)="onScrollbarMouseDown($event)"
        ></div>
      </div>

      <div
        id="scroll-container"
        #scrollContainer
        (scroll)="updateScrollState()"
        class="h-full w-full overflow-y-auto"
      >
        <ng-content></ng-content>
      </div>
    </section>
  `,
  styles: `
    #scroll-container {
      /* Hide default scrollbars */
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE and Edge */

      padding-right: 0;
      margin-right: 0;
    }

    /* Hide scrollbar for WebKit browsers */
    #scroll-container::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
      background: transparent;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrollContainerComponent implements AfterViewInit, OnDestroy {
  scrollContainer = viewChild<ElementRef<HTMLDivElement>>('scrollContainer');

  hiddenGradient = input<boolean>(false);
  styleClass = input<string>();

  canScrollDown = signal<boolean>(false);
  canScrollUp = signal<boolean>(false);
  isScrolling = signal<boolean>(false);
  scrollThumbHeight = signal<number>(0);
  scrollThumbTop = signal<number>(0);
  isDragging = signal<boolean>(false);

  private scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  private dragStartY = 0;
  private dragStartScrollTop = 0;
  private isDraggingFlag = false;

  ngAfterViewInit(): void {
    this.updateScrollState();
  }

  protected updateScrollState(): void {
    const container = this.scrollContainer()?.nativeElement;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    this.canScrollUp.set(scrollTop > 0);
    this.canScrollDown.set(scrollTop + clientHeight < scrollHeight - 1);

    // Calculate custom scrollbar dimensions and position
    const scrollableHeight = scrollHeight - clientHeight;
    if (scrollableHeight > 0) {
      const thumbHeight = Math.max((clientHeight / scrollHeight) * 100, 5);
      this.scrollThumbHeight.set(thumbHeight);

      const thumbTop = (scrollTop / scrollableHeight) * (100 - thumbHeight);
      this.scrollThumbTop.set(thumbTop);
    } else {
      this.scrollThumbHeight.set(0);
      this.scrollThumbTop.set(0);
    }

    this.isScrolling.set(true);

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    this.scrollTimeout = setTimeout(() => {
      this.isScrolling.set(false);
    }, 2000);
  }

  protected onScrollbarMouseDown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const container = this.scrollContainer()?.nativeElement;
    if (!container) return;

    this.isDraggingFlag = true;
    this.isDragging.set(true);
    this.dragStartY = event.clientY;
    this.dragStartScrollTop = container.scrollTop;

    // Add global event listeners
    document.addEventListener('mousemove', this.onDocumentMouseMove);
    document.addEventListener('mouseup', this.onDocumentMouseUp);

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
  }

  private onDocumentMouseMove = (event: MouseEvent): void => {
    if (!this.isDraggingFlag) return;

    const container = this.scrollContainer()?.nativeElement;
    if (!container) return;

    const deltaY = event.clientY - this.dragStartY;
    const scrollableHeight = container.scrollHeight - container.clientHeight;
    const thumbHeight = this.scrollThumbHeight();

    // Calculate how much to scroll based on mouse movement
    const scrollRatio = deltaY / container.clientHeight;
    const scrollDelta =
      scrollRatio * container.clientHeight * (100 / thumbHeight);

    const newScrollTop = Math.max(
      0,
      Math.min(scrollableHeight, this.dragStartScrollTop + scrollDelta),
    );
    container.scrollTop = newScrollTop;
  };

  private onDocumentMouseUp = (): void => {
    if (!this.isDraggingFlag) return;

    this.isDraggingFlag = false;
    this.isDragging.set(false);

    // Remove global event listeners
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);

    // Restore text selection
    document.body.style.userSelect = '';
  };

  ngOnDestroy(): void {
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }

    // Clean up event listeners
    document.removeEventListener('mousemove', this.onDocumentMouseMove);
    document.removeEventListener('mouseup', this.onDocumentMouseUp);
  }
}
