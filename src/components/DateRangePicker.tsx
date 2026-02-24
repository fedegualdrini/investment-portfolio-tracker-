import React from 'react';
import { DateRangePickerProps, DATE_RANGE_PRESETS, DateRangePreset } from '../types/performance';
import { getDateRangeFromPreset, getPresetFromDateRange } from '../utils/dateUtils';
import { useLanguage } from '../contexts/LanguageContext';

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const { t } = useLanguage();

  // Initialize selectedPreset based on the actual dateRange prop
  const [selectedPreset, setSelectedPreset] = React.useState<DateRangePreset>(() => {
    console.log('🔧 [DateRangePicker] Initializing selectedPreset for dateRange:', dateRange);
    const preset = getPresetFromDateRange(dateRange) as DateRangePreset;
    console.log('🔧 [DateRangePicker] Calculated preset:', preset);
    return preset;
  });

  React.useEffect(() => {
    console.log('🔧 [DateRangePicker] useEffect triggered with dateRange:', dateRange);
    const preset = getPresetFromDateRange(dateRange) as DateRangePreset;
    console.log('🔧 [DateRangePicker] Setting selectedPreset to:', preset);
    setSelectedPreset(preset);
  }, [dateRange]);

  const handlePresetChange = (preset: DateRangePreset) => {
    const newRange = getDateRangeFromPreset(preset);
    onDateRangeChange(newRange);
    setSelectedPreset(preset);
  };

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...dateRange, [field]: value };
    onDateRangeChange(newRange);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
        {t('time.period')}
      </label>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(DATE_RANGE_PRESETS).map(([preset, _]) => (
          <button
            key={preset}
            onClick={() => handlePresetChange(preset as DateRangePreset)}
            className={`px-3 py-1 text-sm rounded-lg transition-all duration-200 ${
              selectedPreset === preset
                ? 'bg-emerald-500/20 text-emerald-500 font-medium'
                : 'btn-ghost'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            {t('start.date')}
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleCustomDateChange('start', e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            {t('end.date')}
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleCustomDateChange('end', e.target.value)}
            className="input-field"
          />
        </div>
      </div>
    </div>
  );
}
