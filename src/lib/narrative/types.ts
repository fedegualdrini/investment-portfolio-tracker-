export interface Template {
  category: string;
  variants: string[];
}

export interface TemplateSet {
  [key: string]: string[];
}

export interface NarrativeSection {
  heading: string;
  body: string;
}

export interface WeeklyPulseNarrative {
  title: string;
  date: string;
  summary: string;
  sections: NarrativeSection[];
  highlights: {
    label: string;
    value: string;
    change?: string;
  }[];
  disclaimer: string;
}

export interface TemplateVariables {
  amount?: string;
  percent?: string;
  totalValue?: string;
  totalInvested?: string;
  gainLoss?: string;
  gainLossPercent?: string;
  symbol?: string;
  type?: string;
  threshold?: string;
  count?: string;
  category?: string;
}
