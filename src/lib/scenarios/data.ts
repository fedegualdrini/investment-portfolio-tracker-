export interface ScenarioPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  summary: string;
  disclaimer?: string;
}

// Educational presets (not predictions)
export const SCENARIOS: ScenarioPeriod[] = [
  {
    id: 'bear-2022',
    name: '2022 Bear Market (rates + inflation)',
    startDate: '2022-01-03',
    endDate: '2022-10-12',
    summary: 'A major equity drawdown driven by rapid rate hikes and inflation concerns.',
  },
  {
    id: 'covid-crash-2020',
    name: 'COVID Crash (2020)',
    startDate: '2020-02-19',
    endDate: '2020-03-23',
    summary: 'A fast market decline during early pandemic uncertainty.',
  },
];
