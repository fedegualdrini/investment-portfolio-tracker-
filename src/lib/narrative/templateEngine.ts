import templatesRaw from './templates.json';
import type { PortfolioAnalysis } from '../analyzer/types';
import type { TemplateVariables, WeeklyPulseNarrative, NarrativeSection } from './types';

const templates = templatesRaw as {
  templates: {
    performance: Record<string, string[]>;
    allocation: Record<string, string[]>;
    topMover: Record<string, string[]>;
    milestone: Record<string, string[]>;
    educational: Record<string, string[]>;
  }
};

function formatCurrency(value: number): string {
  return `$${Math.round(value).toLocaleString()}`;
}

function formatPercent(value: number): string {
  return `${Math.abs(value).toFixed(1)}%`;
}

function selectRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function renderTemplate(template: string, variables: TemplateVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key as keyof TemplateVariables] ?? '';
  });
}

export function generateSummary(analysis: PortfolioAnalysis): string {
  const { metrics, allocation, trends, milestones } = analysis;

  const variables: TemplateVariables = {
    amount: formatCurrency(metrics.periodChange.amount),
    percent: formatPercent(metrics.periodChange.percent),
    totalValue: formatCurrency(metrics.totalValue),
    gainLossPercent: formatPercent(metrics.gainLossPercent),
  };

  const direction = metrics.periodChange.direction;
  const directionTemplates = templates.templates.performance[direction];

  if (!directionTemplates || directionTemplates.length === 0) {
    return renderTemplate(
      selectRandom(templates.templates.performance.totalValue),
      { totalValue: variables.totalValue }
    );
  }

  return renderTemplate(selectRandom(directionTemplates), variables);
}

export function generatePerformanceSection(analysis: PortfolioAnalysis): NarrativeSection {
  const { metrics } = analysis;

  const summary = generateSummary(analysis);

  const highlights = [
    `Total value: ${formatCurrency(metrics.totalValue)}`,
    `Total invested: ${formatCurrency(metrics.totalInvested)}`,
    `Overall return: ${formatPercent(metrics.gainLossPercent)}`,
  ];

  return {
    heading: 'Performance Summary',
    body: `${summary}\n\n${highlights.join('\n')}`,
  };
}

export function generateAllocationSection(analysis: PortfolioAnalysis): NarrativeSection {
  const { allocation } = analysis;

  if (allocation.byAssetType.length === 0) {
    return { heading: 'Allocation', body: 'No allocation data available.' };
  }

  const largestType = allocation.byAssetType[0];
  const holdingVars: TemplateVariables = {
    type: largestType.type,
    percent: formatPercent(largestType.percentage),
  };

  const typeText = renderTemplate(
    selectRandom(templates.templates.allocation.largestType),
    holdingVars
  );

  const lines: string[] = [typeText];

  if (allocation.byAssetType.length > 1) {
    const totalCount = allocation.byHolding.length;
    lines.push(
      renderTemplate(
        selectRandom(templates.templates.allocation.diversification),
        { count: String(totalCount), category: 'positions' }
      )
    );
  }

  if (allocation.largestPosition.percentage > 20) {
    const positionVars: TemplateVariables = {
      symbol: allocation.largestPosition.symbol,
      percent: formatPercent(allocation.largestPosition.percentage),
    };
    lines.push(
      renderTemplate(
        selectRandom(templates.templates.allocation.largestHolding),
        positionVars
      )
    );
  }

  return { heading: 'Asset Allocation', body: lines.join('\n') };
}

export function generateTopMoversSection(analysis: PortfolioAnalysis): NarrativeSection | null {
  const { trends } = analysis;

  const lines: string[] = [];

  if (trends.bestPerformer && trends.bestPerformer.changePercent > 0) {
    const vars: TemplateVariables = {
      symbol: trends.bestPerformer.symbol,
      percent: formatPercent(trends.bestPerformer.changePercent),
    };
    lines.push(renderTemplate(selectRandom(templates.templates.topMover.best), vars));
  }

  if (trends.worstPerformer && trends.worstPerformer.changePercent < 0) {
    const vars: TemplateVariables = {
      symbol: trends.worstPerformer.symbol,
      percent: formatPercent(trends.worstPerformer.changePercent),
    };
    lines.push(renderTemplate(selectRandom(templates.templates.topMover.worst), vars));
  }

  if (lines.length === 0) {
    return null;
  }

  return { heading: 'Notable Movements', body: lines.join('\n') };
}

export function generateMilestonesSection(analysis: PortfolioAnalysis): NarrativeSection | null {
  const { milestones } = analysis;

  if (milestones.length === 0) {
    return null;
  }

  const lines = milestones.map(m => m.message);

  return { heading: 'Milestones', body: lines.join('\n') };
}

export function generateEducationalContext(analysis: PortfolioAnalysis): NarrativeSection {
  const { allocation } = analysis;

  const contexts: string[] = [];

  if (allocation.concentrationRisk === 'high') {
    contexts.push(
      selectRandom(templates.templates.educational.concentration)
    );
  }

  if (allocation.byAssetType.length > 2) {
    contexts.push(
      selectRandom(templates.templates.educational.diversification)
    );
  }

  if (allocation.byAssetType.some(a => a.type === 'crypto')) {
    contexts.push(
      selectRandom(templates.templates.educational.marketContext)
        .replace('Crypto', 'Cryptocurrency investments')
    );
  }

  if (contexts.length === 0) {
    contexts.push(selectRandom(templates.templates.educational.diversification));
  }

  return { heading: 'Context', body: contexts.slice(0, 2).join('\n\n') };
}

export function generateWeeklyPulse(analysis: PortfolioAnalysis): WeeklyPulseNarrative {
  const sections: NarrativeSection[] = [
    generatePerformanceSection(analysis),
    generateAllocationSection(analysis),
  ];

  const topMovers = generateTopMoversSection(analysis);
  if (topMovers) sections.push(topMovers);

  const milestones = generateMilestonesSection(analysis);
  if (milestones) sections.push(milestones);

  sections.push(generateEducationalContext(analysis));

  const date = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    title: 'Portfolio Pulse',
    date,
    summary: generateSummary(analysis),
    sections,
    highlights: [
      {
        label: 'Total Value',
        value: formatCurrency(analysis.metrics.totalValue),
        change: analysis.metrics.periodChange.direction !== 'unchanged'
          ? `${analysis.metrics.periodChange.direction === 'up' ? '+' : '-'}${formatPercent(analysis.metrics.periodChange.percent)}`
          : undefined,
      },
      {
        label: 'Total Invested',
        value: formatCurrency(analysis.metrics.totalInvested),
      },
      {
        label: 'Largest Position',
        value: analysis.allocation.largestPosition.symbol || 'N/A',
      },
    ],
    disclaimer: 'This is educational information only. Not financial advice. Consult a qualified financial advisor before making investment decisions.',
  };
}
