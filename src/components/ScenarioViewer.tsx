import React, { useEffect, useMemo, useState } from 'react';
import { X, History } from 'lucide-react';
import type { Investment } from '../types/investment';
import { SCENARIOS, type ScenarioPeriod } from '../lib/scenarios/data';
import { calculateScenario } from '../lib/scenarios/calculator';

export function ScenarioViewer({
  open,
  onClose,
  investments,
}: {
  open: boolean;
  onClose: () => void;
  investments: Investment[];
}) {
  const [selected, setSelected] = useState<ScenarioPeriod>(SCENARIOS[0]);

  const result = useMemo(() => calculateScenario(investments, selected), [investments, selected]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-gray-950 border-l border-gray-800 p-5 overflow-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Historical Scenarios</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Educational context only — not predictions and not financial advice.
        </p>

        <div className="space-y-2 mb-5">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                selected.id === s.id
                  ? 'border-purple-600 bg-purple-900/20'
                  : 'border-gray-800 bg-gray-900/40 hover:bg-gray-900'
              }`}
            >
              <div className="text-white font-medium">{s.name}</div>
              <div className="text-xs text-gray-400 mt-1">{s.startDate} → {s.endDate}</div>
            </button>
          ))}
        </div>

        <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-4">
          <div className="text-white font-semibold mb-1">Summary</div>
          <div className="text-sm text-gray-300">{selected.summary}</div>

          <div className="mt-4 text-white font-semibold">Your portfolio (preview)</div>
          <div className="text-sm text-gray-300 mt-1">{result.estimatedImpactText}</div>
          <div className="text-xs text-gray-500 mt-3">{result.note}</div>
        </div>

        <div className="mt-5 text-xs text-gray-500">
          Next step: add real historical price simulation per holding.
        </div>
      </div>
    </div>
  );
}
