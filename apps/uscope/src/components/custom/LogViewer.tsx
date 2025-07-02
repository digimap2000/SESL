import { useRef, useState, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

const TOTAL_LINES = 1_000_000;
const CHUNK_SIZE = 1000;

// Simulated backend fetch function
async function fetchLogChunk(offset: number, limit: number): Promise<string[]> {
  // Simulate latency
  await new Promise((res) => setTimeout(res, 10));

  return Array.from({ length: limit }, (_, i) => `This is Line ${offset + i + 1}`);
}

export default function VirtualLogViewer() {
  const parentRef = useRef<HTMLDivElement>(null);
  const [logData, setLogData] = useState<Map<number, string>>(new Map());

  const rowVirtualizer = useVirtualizer({
    count: TOTAL_LINES,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 24,
    overscan: 20,
  });

  // Fetch logs when visible rows change
  useEffect(() => {
    const virtualItems = rowVirtualizer.getVirtualItems();
    if (!virtualItems.length) return;

    const start = Math.max(0, virtualItems[0].index - CHUNK_SIZE);
    const end = Math.min(TOTAL_LINES, virtualItems.at(-1)!.index + CHUNK_SIZE);

    // Fetch missing lines
    const missing = [] as number[];
    for (let i = start; i < end; i++) {
      if (!logData.has(i)) missing.push(i);
    }

    if (missing.length) {
      const offset = missing[0];
      const limit = missing.length;

      fetchLogChunk(offset, limit).then((lines) => {
        setLogData((prev) => {
          const next = new Map(prev);
          lines.forEach((line, i) => {
            next.set(offset + i, line);
          });
          return next;
        });
      });
    }
  }, [rowVirtualizer.getVirtualItems()]);

  return (
    <div ref={parentRef} style={{ height: "100vh", overflow: "auto" }}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${virtualRow.start}px)`,
              height: `${virtualRow.size}px`,
//              fontFamily: "monospace",
              whiteSpace: "pre",
              padding: "2px 8px",
              boxSizing: "border-box",
            }}
          >
            {logData.get(virtualRow.index) ?? "Loading..."}
          </div>
        ))}
      </div>
    </div>
  );
}
