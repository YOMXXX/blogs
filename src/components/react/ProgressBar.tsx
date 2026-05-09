import { useEffect, useState } from 'react';

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const compute = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgress(Math.min(100, Math.max(0, pct)));
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(compute);
        ticking = true;
      }
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        height: 2,
        width: `${progress}%`,
        background: 'linear-gradient(90deg, #10b981, #22d3ee)',
        zIndex: 100,
        transition: 'width 0.05s linear',
        pointerEvents: 'none',
      }}
    />
  );
}
