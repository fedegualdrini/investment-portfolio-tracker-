export type EducationCategory = 'allocation' | 'diversification' | 'volatility' | 'bonds' | 'crypto' | 'general';

export interface EducationTopic {
  id: string;
  title: string;
  category: EducationCategory;
  short: string;   // 1-2 sentence tooltip
  body: string;    // longer explanation
  keywords: string[];
}
