import { useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface StatItemProps {
  value: number;
  suffix?: string;
  label: string;
  inverted?: boolean;
}

export function StatItem({ value, suffix = '', label, inverted = false }: StatItemProps) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setCount(value);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [inView, value]);

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span
        className="display-md"
        style={{ color: inverted ? '#ffffff' : '#000000' }}
      >
        {count}
        {suffix}
      </span>
      <span
        className="body-sm"
        style={{ color: inverted ? 'rgba(255,255,255,0.6)' : '#585858' }}
      >
        {label}
      </span>
    </div>
  );
}
