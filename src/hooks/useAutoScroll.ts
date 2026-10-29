import { useEffect, useRef, useState } from "react";

export function useAutoScroll(dependencies: any[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAutoScrollEnabled, setIsAutoScrollEnabled] = useState(true);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      // If we recently scrolled programmatically, ignore this event to not falsely disable auto-scroll
      if (isProgrammaticScroll.current) return;

      const isAtBottom = Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 100;
      setIsAutoScrollEnabled(isAtBottom);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isAutoScrollEnabled && scrollRef.current) {
      isProgrammaticScroll.current = true;
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "auto",
      });
      // Allow browser to process the scroll event
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 50);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, isAutoScrollEnabled]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      isProgrammaticScroll.current = true;
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
      setIsAutoScrollEnabled(true);
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 500); // give enough time for smooth scroll to finish
    }
  };

  return { scrollRef, isAutoScrollEnabled, scrollToBottom };
}
