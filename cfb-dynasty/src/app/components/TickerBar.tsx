"use client";

interface TickerItem {
  text: string;
}

export default function TickerBar({ items }: { items: TickerItem[] }) {
  if (items.length === 0) return null;

  const tickerText = items.map((item) => item.text).join("   •   ");

  return (
    <div className="ticker-bar py-1.5 px-4">
      <div className="overflow-hidden whitespace-nowrap">
        <span className="animate-marquee inline-block">
          {tickerText}   •   {tickerText}
        </span>
      </div>
    </div>
  );
}
