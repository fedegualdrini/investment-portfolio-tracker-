import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { DateRangePickerProps, DATE_RANGE_PRESETS, DateRangePreset } from '../types/performance';
import { getDateRangeFromPreset, getPresetFromDateRange } from '../utils/dateUtils';
import { useLanguage } from '../contexts/LanguageContext';

export function DateRangePicker({ dateRange, onDateRangeChange }: DateRangePickerProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = React.useState(false);

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
    setIsOpen(false);
  };

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    const newRange = { ...dateRange, [field]: value };
    onDateRangeChange(newRange);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {t('time.period')}
      </label>
      
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.entries(DATE_RANGE_PRESETS).map(([preset, _]) => (
          <button
            key={preset}
            onClick={() => handlePresetChange(preset as DateRangePreset)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              selectedPreset === preset
                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      {/* Custom date range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('start.date')}
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleCustomDateChange('start', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
            {t('end.date')}
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleCustomDateChange('end', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}
