'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface TrendsChartProps {
  data: any[];
  nameKey: string;
  dataKey: string;
  suffix?: string;
  isVertical?: boolean;
}

export default function TrendsChart({ 
  data, 
  nameKey, 
  dataKey, 
  suffix = '',
  isVertical = true 
}: TrendsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={isVertical ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        {isVertical ? (
          <>
            <XAxis 
              type="number"
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              dataKey={nameKey}
              type="category"
              tick={{ fontSize: 12 }}
              tickMargin={10}
              width={100}
            />
          </>
        ) : (
          <>
            <XAxis 
              dataKey={nameKey}
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickMargin={10}
            />
          </>
        )}
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          formatter={(value: number) => [`${value}${suffix}`, 'Value']}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        <Bar 
          dataKey={dataKey} 
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
