'use client';
import { useState } from 'react';

export default function RawDataCell({ data }: { data: any }) {
  const [expanded, setExpanded] = useState(false);
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  const parts = str.split(',');
  const truncated = parts.slice(0, 3).join(',') + (parts.length > 3 ? ', ...' : '');

  return (
    <div
      className="cursor-pointer whitespace-pre-wrap break-all"
      onClick={() => setExpanded(!expanded)}
    >
      {expanded ? str : truncated}
    </div>
  );
}
