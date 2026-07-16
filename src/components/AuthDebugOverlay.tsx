"use client";

import { useEffect, useState } from "react";
import { getDebugLog } from "@/lib/authDebugLog";

export default function AuthDebugOverlay() {
  const [expanded, setExpanded] = useState(false);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const interval = setInterval(() => setLines(getDebugLog()), 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed bottom-2 left-2 z-[200] max-w-[92vw]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {expanded ? (
        <div className="bg-black/90 text-lime-300 text-[10px] font-mono rounded-lg p-2 max-h-[40vh] overflow-y-auto shadow-2xl">
          <div className="flex justify-between items-center mb-1 gap-2">
            <span className="text-white font-bold">auth debug</span>
            <button onClick={() => setExpanded(false)} className="text-white px-2">
              close
            </button>
          </div>
          {lines.length === 0 ? (
            <div>no events yet</div>
          ) : (
            lines.map((l, i) => <div key={i}>{l}</div>)
          )}
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          className="bg-black/70 text-lime-300 text-[10px] font-mono rounded-full px-2 py-1 shadow-lg"
        >
          debug ({lines.length})
        </button>
      )}
    </div>
  );
}
