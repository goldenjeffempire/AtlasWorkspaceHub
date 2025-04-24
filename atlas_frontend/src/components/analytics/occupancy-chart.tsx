'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface OccupancyDataPoint {
  date: string;
  average_occupancy: number;
}

interface OccupancyChartProps {
  data: OccupancyDataPoint[];
}

export default function OccupancyChart({ data }: OccupancyChartProps) {
  const [formattedData, setFormattedData] = useState<any[]>([]);

  useEffect(() => {
    // Format the data for the chart
    if (data && data.length > 0) {
      const formatted = data.map(item => ({
        ...item,
        formattedDate: format(parseISO(item.date), 'MMM dd'),
        average_occupancy: Math.round(item.average_occupancy),
      }));
      setFormattedData(formatted);
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No occupancy data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="formattedDate" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis 
          domain={[0, 100]} 
          unit="%" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          formatter={(value: number) => [`${value}%`, 'Occupancy Rate']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        <Line 
          type="monotone" 
          dataKey="average_occupancy" 
          name="Occupancy Rate"
          stroke="#3b82f6" 
          strokeWidth={2}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
