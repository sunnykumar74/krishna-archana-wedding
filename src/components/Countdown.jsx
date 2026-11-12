import { useEffect, useState } from "react";
import { WEDDING_DATE } from "../data/weddingData";

export default function Countdown({ units, completedLabel }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, WEDDING_DATE.getTime() - now);
  const values = [
    [units[0], Math.floor(diff / 86400000)],
    [units[1], Math.floor((diff / 3600000) % 24)],
    [units[2], Math.floor((diff / 60000) % 60)],
    [units[3], Math.floor((diff / 1000) % 60)],
  ];

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-xl mx-auto">
        {values.map(([label, value]) => (
          <div key={label} className="count-box">
            <div className="font-serif text-2xl sm:text-4xl text-ink tabular-nums">
              {String(value).padStart(2, "0")}
            </div>
            <div className="text-[10px] sm:text-xs tracking-[.18em] uppercase text-ink/55 mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>
      {diff === 0 && (
        <p className="font-hindi text-rose text-sm mt-5">{completedLabel}</p>
      )}
    </div>
  );
}
