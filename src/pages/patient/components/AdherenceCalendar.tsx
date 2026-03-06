import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AdherenceCalendarProps {
  adherenceData: Array<{
    entry_date: string;
    missed_dose: boolean;
  }>;
  therapyData: Array<{
    injection_date: string;
  }>;
}

interface WeekData {
  weekNum: number;
  intake: number;
  maxIntake: number;
  sideEffect: boolean | number;
  weekStart: Date;
  weekEnd: Date;
}

export default function AdherenceCalendar({ adherenceData, therapyData }: AdherenceCalendarProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedQuarter, setSelectedQuarter] = useState('Q1');

  const getQuarterMonths = (quarter: string) => {
    const quarters = {
      Q1: ['January', 'February', 'March'],
      Q2: ['April', 'May', 'June'],
      Q3: ['July', 'August', 'September'],
      Q4: ['October', 'November', 'December'],
    };
    return quarters[quarter as keyof typeof quarters];
  };

  const generateWeeksData = (): Record<string, WeekData[]> => {
    const monthsInQuarter = getQuarterMonths(selectedQuarter);
    const monthsData: Record<string, WeekData[]> = {};

    monthsInQuarter.forEach((month, monthIndex) => {
      const monthNum = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December']
        .indexOf(month);

      const weeksInMonth: WeekData[] = [];

      for (let week = 0; week < 5; week++) {
        const weekStart = new Date(selectedYear, monthNum, week * 7 + 1);
        const weekEnd = new Date(selectedYear, monthNum, (week + 1) * 7);

        const intakesInWeek = therapyData.filter(entry => {
          const entryDate = new Date(entry.injection_date);
          return entryDate >= weekStart && entryDate <= weekEnd;
        }).length;

        const sideEffectsInWeek = adherenceData.filter(entry => {
          const entryDate = new Date(entry.entry_date);
          return entryDate >= weekStart && entryDate <= weekEnd && !entry.missed_dose;
        }).length;

        if (weekStart.getMonth() === monthNum) {
          weeksInMonth.push({
            weekNum: week + 1 + (monthIndex * 5),
            intake: intakesInWeek,
            maxIntake: 8,
            sideEffect: sideEffectsInWeek > 0 ? sideEffectsInWeek : false,
            weekStart,
            weekEnd,
          });
        }
      }

      monthsData[month] = weeksInMonth.slice(0, 4);
    });

    return monthsData;
  };

  const weeksData = generateWeeksData();
  const months = getQuarterMonths(selectedQuarter);

  const totalIntakes = Object.values(weeksData)
    .flat()
    .reduce((sum, week) => sum + week.intake, 0);

  const totalPossible = Object.values(weeksData)
    .flat()
    .reduce((sum, week) => sum + week.maxIntake, 0);

  const adherenceRate = totalPossible > 0
    ? Math.round((totalIntakes / totalPossible) * 100)
    : 0;

  const getWeekColor = (week: WeekData) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStartDate = new Date(week.weekStart);
    weekStartDate.setHours(0, 0, 0, 0);

    const weekEndDate = new Date(week.weekEnd);
    weekEndDate.setHours(0, 0, 0, 0);

    const hasEntry = week.intake > 0;

    if (hasEntry) {
      return '#CDF5C6';
    }

    if (weekStartDate > today) {
      return '#F9EDDC';
    }

    return '#EDF1F6';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-900">Adherence Calendar</h2>
        <div className="text-right">
          <p className="text-3xl font-bold text-green-500">{adherenceRate}%</p>
          <p className="text-xs text-gray-600">Adherence rate</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value={currentYear - 1}>{currentYear - 1}</option>
            <option value={currentYear}>{currentYear}</option>
            <option value={currentYear + 1}>{currentYear + 1}</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        <div className="relative">
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        <span className="text-sm text-gray-600">
          {months[0]} - {months[2]}
        </span>
      </div>

      <div className="space-y-6">
        {months.map((month) => (
          <div key={month}>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{month}</h3>
            <div className="flex flex-wrap gap-3">
              {weeksData[month]?.map((week) => (
                <div
                  key={week.weekNum}
                  className="flex-1 min-w-[calc(50%-0.375rem)] sm:min-w-[calc(33.333%-0.5rem)] md:min-w-[calc(25%-0.5625rem)] lg:min-w-[calc(20%-0.6rem)] rounded-lg p-4 transition-all hover:shadow-md"
                  style={{ backgroundColor: getWeekColor(week) }}
                >
                  <div className="text-xs font-semibold text-gray-800 mb-2">
                    Week {String(week.weekNum).padStart(2, '0')}
                  </div>
                  <div className="text-xs text-gray-800">
                    <div>Intake: {week.intake < 10 ? '0' : ''}{week.intake}</div>
                    <div>
                      Side Effect: {week.sideEffect === false ? 'No' :
                        typeof week.sideEffect === 'number' ? week.sideEffect : 'No'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
