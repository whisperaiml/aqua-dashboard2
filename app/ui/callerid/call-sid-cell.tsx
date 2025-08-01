'use client';
import { useState } from 'react';

export default function CallSidCell({ sid }: { sid: string | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!sid) return <span>-</span>;
  const truncated = sid.length > 10 ? sid.slice(0, 6) + '...' : sid;
  return (
    <span className="cursor-pointer" onClick={() => setExpanded(!expanded)}>
      {expanded ? sid : truncated}
    </span>
  );
}
