import React, { useMemo, useState } from 'react';
import { Info } from 'lucide-react';
import { getTopic } from '../lib/education/content';

export function EducationTooltip({ topicId }: { topicId: string }) {
  const topic = useMemo(() => getTopic(topicId), [topicId]);
  const [open, setOpen] = useState(false);

  if (!topic) return null;

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-2 inline-flex items-center text-gray-400 hover:text-gray-200"
        aria-label={`Learn more: ${topic.title}`}
      >
        <Info className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute z-20 top-6 left-0 w-72 p-3 rounded-lg border border-gray-700 bg-gray-900 shadow-lg">
          <div className="text-sm font-semibold text-white">{topic.title}</div>
          <div className="text-xs text-gray-300 mt-1">{topic.short}</div>
          <div className="text-xs text-gray-400 mt-2 leading-relaxed">{topic.body}</div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-2 text-xs text-emerald-400 hover:text-emerald-300"
          >
            Close
          </button>
        </div>
      )}
    </span>
  );
}
