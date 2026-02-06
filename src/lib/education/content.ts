import type { EducationTopic, EducationCategory } from './types';

export const EDUCATION_TOPICS: EducationTopic[] = [
  {
    id: 'diversification',
    title: 'Diversification',
    category: 'diversification',
    short: 'Spreading investments across different assets can reduce reliance on any single holding.',
    body:
      'Diversification means holding a mix of assets (and/or sectors) so one position has less impact on the whole portfolio. It does not remove risk, but it can reduce the effect of a single loss.',
    keywords: ['diversification', 'mix', 'spread', 'risk'],
  },
  {
    id: 'concentration',
    title: 'Concentration',
    category: 'diversification',
    short: 'Concentration is how much of your portfolio is tied to one holding or asset type.',
    body:
      'A portfolio is considered more concentrated when one position or category represents a large percentage of total value. This makes overall results more sensitive to that single exposure.',
    keywords: ['concentration', 'largest position', 'overweight'],
  },
  {
    id: 'volatility',
    title: 'Volatility',
    category: 'volatility',
    short: 'Volatility describes how much prices move up and down over time.',
    body:
      'Higher volatility means larger swings (up or down). It is a description of movement size, not a prediction of direction.',
    keywords: ['volatility', 'swings', 'fluctuation'],
  },
  {
    id: 'bonds-basics',
    title: 'Bonds (Basics)',
    category: 'bonds',
    short: 'Bonds are loans to governments/companies that typically pay interest and return principal at maturity.',
    body:
      'Bond prices often move inversely to interest rates. Bonds may behave differently than stocks during equity drawdowns, which can change overall portfolio behavior.',
    keywords: ['bonds', 'interest rate', 'yield'],
  },
  {
    id: 'crypto-volatility',
    title: 'Crypto Volatility',
    category: 'crypto',
    short: 'Crypto assets often have larger price swings than many traditional assets.',
    body:
      'Crypto markets can react strongly to news, liquidity, and sentiment. This can increase short-term portfolio variability when crypto is a meaningful allocation.',
    keywords: ['crypto', 'bitcoin', 'volatility'],
  },
];

export function getTopic(id: string): EducationTopic | undefined {
  return EDUCATION_TOPICS.find((t) => t.id === id);
}

export function getTopicsByCategory(category: EducationCategory): EducationTopic[] {
  return EDUCATION_TOPICS.filter((t) => t.category === category);
}
