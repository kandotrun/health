"use client";

import { useEffect, useState } from "react";

interface Props {
  value: number;
  duration?: number;
  className?: string;
}

export default function AnimatedNumber({
  value,
  duration = 1200,
  className = "",
}: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = value;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}
