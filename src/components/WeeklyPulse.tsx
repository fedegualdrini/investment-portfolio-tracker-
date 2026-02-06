import React from 'react';
import { RefreshCw, TrendingUp, Minus, AlertCircle, Lightbulb } from 'lucide-react';
import { useWeeklyPulse } from '../hooks/useWeeklyPulse';
import { useInvestmentContext } from '../contexts/InvestmentContext';
import { DisclaimerFooter } from './Footer';
import { NewsPanel } from './NewsPanel';
import { EducationTooltip } from './EducationTooltip';
import type { NarrativeSection } from '../lib/narrative/types';

interface WeeklyPulseProps {
  compact?: boolean;
  onBack?: () => void;
}

const PieIcon: React.FC = () => (
  <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2v20M2 12h20" />
  </svg>
);

const SectionIcon: React.FC<{ heading: string }> = ({ heading }) => {
  const lower = heading.toLowerCase();
  if (lower.includes('performance')) return <TrendingUp className="w-5 h-5 text-emerald-400" />;
  if (lower.includes('allocation')) return <PieIcon />;
  if (lower.includes('mover')) return <TrendingUp className="w-5 h-5 text-blue-400" />;
  if (lower.includes('milestone')) return <AlertCircle className="w-5 h-5 text-amber-400" />;
  if (lower.includes('context')) return <Lightbulb className="w-5 h-5 text-purple-400" />;
  return <Minus className="w-5 h-5 text-gray-400" />;
};

const HighlightCard: React.FC<{
  label: string;
  value: string;
  change?: string;
}> = ({ label, value, change }) => (
  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
    <div className="text-sm text-gray-400 mb-1">{label}</div>
    <div className="text-xl font-semibold text-white">{value}</div>
    {change && (
      <div className={`text-sm mt-1 ${change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
        {change}
      </div>
    )}
  </div>
);

const NarrativeSectionView: React.FC<{ section: NarrativeSection }> = ({ section }) => (
  <div className="mb-6">
    <div className="flex items-center gap-2 mb-3">
      <SectionIcon heading={section.heading} />
      <h3 className="text-lg font-semibold text-white">{section.heading}</h3>
    </div>
    <div className="bg-gray-800/30 rounded-lg p-4">
      <p className="text-gray-300 whitespace-pre-line leading-relaxed">{section.body}</p>
    </div>
  </div>
);

const DisclaimerInline: React.FC = () => (
  <div className="mt-6 p-4 bg-amber-900/20 border border-amber-700/30 rounded-lg">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-200/80">
        <strong className="text-amber-200">Not Financial Advice:</strong> This is educational information only.
        Past performance does not guarantee future results. Always consult a qualified financial advisor before
        making investment decisions.
      </p>
    </div>
  </div>
);

export const WeeklyPulse: React.FC<WeeklyPulseProps> = ({ compact = false, onBack }) => {
  const { investments } = useInvestmentContext();
  const portfolioSymbols = Array.from(new Set(investments.map((i) => i.symbol).filter(Boolean)));

  const { narrative, isLoading, error, generatePulse, lastGenerated } = useWeeklyPulse(investments);

  if (compact) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Weekly Pulse</h2>
          <button
            onClick={generatePulse}
            disabled={isLoading || investments.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            {narrative ? 'Refresh' : 'Generate'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {narrative ? (
          <div>
            <p className="text-gray-300 mb-3">{narrative.summary}</p>
            {lastGenerated && (
              <p className="text-sm text-gray-500">Generated {lastGenerated.toLocaleDateString()}</p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {investments.length === 0 ? 'Add investments to generate your first Pulse' : 'Generate your first Portfolio Pulse'}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3">
              {onBack && (
                <button onClick={onBack} className="text-sm text-gray-400 hover:text-white transition-colors">
                  ← Back
                </button>
              )}
              <h1 className="text-2xl font-bold text-white">{narrative?.title || 'Portfolio Pulse'}</h1>
              <EducationTooltip topicId="diversification" />
            </div>
            {narrative?.date && <p className="text-gray-400 mt-1">{narrative.date}</p>}
            {lastGenerated && <p className="text-sm text-gray-500 mt-1">Generated: {lastGenerated.toLocaleString()}</p>}
          </div>
          <button
            onClick={generatePulse}
            disabled={isLoading || investments.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            {narrative ? 'Generate New Pulse' : 'Generate First Pulse'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4 mb-6">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Analyzing your portfolio...</p>
          </div>
        )}

        {!isLoading && narrative && (
          <>
            {narrative.highlights.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {narrative.highlights.map((h, i) => (
                  <HighlightCard key={i} label={h.label} value={h.value} change={h.change} />
                ))}
              </div>
            )}

            <div className="space-y-2">
              {narrative.sections.map((section, index) => (
                <NarrativeSectionView key={index} section={section} />
              ))}
            </div>

            <NewsPanel symbols={portfolioSymbols} />

            <DisclaimerInline />
          </>
        )}

        {!isLoading && !narrative && investments.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">Add some investments to your portfolio to generate your first Pulse.</p>
          </div>
        )}
      </div>

      <DisclaimerFooter />
    </div>
  );
};
