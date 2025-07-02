import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export const useScrollAnimation = (options: UseScrollAnimationOptions = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    triggerOnce = true
  } = options;

  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin, triggerOnce]);

  return { ref, isVisible };
};

// Hook para múltiplos elementos
export const useScrollAnimationList = (count: number, options: UseScrollAnimationOptions = {}) => {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(count).fill(false));
  const refs = useRef<(HTMLElement | null)[]>(new Array(count).fill(null));

  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true
  } = options;

  useEffect(() => {
    const observers = refs.current.map((_, index) => {
      return new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems(prev => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
            
            if (triggerOnce && refs.current[index]) {
              return; // Observer will be disconnected below
            }
          } else if (!triggerOnce) {
            setVisibleItems(prev => {
              const newVisible = [...prev];
              newVisible[index] = false;
              return newVisible;
            });
          }
        },
        {
          threshold,
          rootMargin
        }
      );
    });

    refs.current.forEach((ref, index) => {
      if (ref && observers[index]) {
        observers[index].observe(ref);
      }
    });

    return () => {
      observers.forEach((observer, index) => {
        if (refs.current[index]) {
          observer.disconnect();
        }
      });
    };
  }, [threshold, rootMargin, triggerOnce]);

  const setRef = (index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el;
  };

  return { visibleItems, setRef };
};