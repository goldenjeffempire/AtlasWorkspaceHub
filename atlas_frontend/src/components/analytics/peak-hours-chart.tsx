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

interface PeakHoursDataPoint {
  hour: number;
  bookings_count: number;
}

interface PeakHoursChartProps {
  data: PeakHoursDataPoint[];
}

export default function PeakHoursChart({ data }: PeakHoursChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">No peak hours data available</p>
      </div>
    );
  }

  // Format the data for better display
  const formattedData = data.map(item => ({
    ...item,
    hour: formatHour(item.hour),
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={formattedData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="hour" 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickMargin={10}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
          formatter={(value: number) => [value, 'Bookings']}
          labelFormatter={(label) => `Time: ${label}`}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        <Bar 
          dataKey="bookings_count" 
          name="Number of Bookings"
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Helper function to format hour for display
function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  
  return hour < 12 
    ? `${hour} AM` 
    : `${hour - 12} PM`;
}
