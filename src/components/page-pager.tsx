import * as React from "react"

import { cn } from "@/lib/utils"

export interface PagerPage {
  id: string
  /** Used for the page indicator's accessible label. */
  label: string
  content: React.ReactNode
}

/**
 * Full-viewport pages laid out side by side and swiped between horizontally,
 * like photos in a gallery. Uses native scroll snapping, so the drag follows
 * the finger and settles with the platform's own momentum. Each page scrolls
 * vertically on its own, keeping its position while another page is shown.
 */
export function PagePager({ pages }: { pages: PagerPage[] }) {
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = React.useState(0)

  function handleScroll() {
    const scroller = scrollerRef.current
    if (!scroller || scroller.clientWidth === 0) {
      return
    }
    setActiveIndex(Math.round(scroller.scrollLeft / scroller.clientWidth))
  }

  function goToPage(index: number) {
    const scroller = scrollerRef.current
    scroller?.scrollTo({
      left: index * scroller.clientWidth,
      behavior: "smooth",
    })
  }

  return (
    <>
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex h-svh snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overflow-y-hidden overscroll-x-contain [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((page) => (
          <section
            key={page.id}
            aria-label={page.label}
            className="h-svh w-full shrink-0 snap-start snap-always overflow-y-auto"
          >
            {page.content}
          </section>
        ))}
      </div>

      <nav
        aria-label="Pages"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6px)] z-10 flex justify-center"
      >
        <div className="pointer-events-auto flex items-center rounded-full bg-background/70 px-1 backdrop-blur-sm">
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              aria-label={`Go to ${page.label}`}
              aria-current={index === activeIndex ? "page" : undefined}
              onClick={() => goToPage(index)}
              className="group p-1.5"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-200",
                  index === activeIndex
                    ? "w-4 bg-foreground"
                    : "w-1.5 bg-muted-foreground/40 group-hover:bg-muted-foreground/70"
                )}
              />
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
