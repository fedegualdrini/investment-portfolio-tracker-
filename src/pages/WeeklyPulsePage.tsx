import React from 'react';
import { WeeklyPulse } from '../components/WeeklyPulse';

export const WeeklyPulsePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-950">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Insights</h1>
        <WeeklyPulse />
      </div>
    </div>
  );
};
