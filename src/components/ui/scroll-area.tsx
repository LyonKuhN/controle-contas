import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const [scrollProgress, setScrollProgress] = React.useState(0)
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const handleScroll = React.useCallback((event: Event) => {
    const target = event.target as HTMLElement
    if (target) {
      const { scrollTop, scrollHeight, clientHeight } = target
      const progress = scrollTop / (scrollHeight - clientHeight)
      setScrollProgress(Math.min(Math.max(progress, 0), 1))
    }
  }, [])

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (viewport) {
      viewport.addEventListener('scroll', handleScroll, { passive: true })
      return () => viewport.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport 
        ref={viewportRef}
        className="h-full w-full rounded-[inherit]"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar scrollProgress={scrollProgress} />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
})
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar> & {
    scrollProgress?: number;
  }
>(({ className, orientation = "vertical", scrollProgress = 0, ...props }, ref) => {
  const intensity = Math.min(scrollProgress * 2, 1)
  const pulseSpeed = Math.max(0.5, 1 - scrollProgress)
  
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      ref={ref}
      orientation={orientation}
      className={cn(
        "flex touch-none select-none transition-all duration-300 ease-out group",
        "hover:w-3",
        scrollProgress > 0.1 && "w-3",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent p-[1px] hover:border-l-primary/20",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent p-[1px] hover:border-t-primary/20",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb 
        className={cn(
          "relative flex-1 rounded-full transition-all duration-300 ease-out",
          "bg-gradient-to-b from-primary/60 to-primary/40",
          "hover:from-primary/80 hover:to-primary/60",
          scrollProgress > 0.1 && "from-primary/80 to-primary/60",
          scrollProgress > 0.5 && "shadow-lg shadow-primary/20",
          scrollProgress > 0.1 && "animate-pulse",
          "hover:animate-none"
        )}
        style={{
          animationDuration: scrollProgress > 0.1 ? `${pulseSpeed}s` : '2s',
          boxShadow: scrollProgress > 0.3 ? `0 0 ${8 + intensity * 12}px hsl(var(--primary) / ${0.2 + intensity * 0.3})` : undefined
        }}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
})
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
