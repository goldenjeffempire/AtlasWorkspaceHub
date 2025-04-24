
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
import { motion } from 'framer-motion';

interface PeakHoursDataPoint {
  hour: number;
  bookings_count: number;
}

interface PeakHoursChartProps {
  data: PeakHoursDataPoint[];
  isLoading?: boolean;
  error?: string;
}

export default function PeakHoursChart({ data, isLoading, error }: PeakHoursChartProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex flex-col items-center justify-center h-full text-red-500"
      >
        <p className="text-lg font-semibold">Error loading data</p>
        <p className="text-sm">{error}</p>
      </motion.div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex items-center justify-center h-full"
      >
        <p className="text-gray-500">No peak hours data available</p>
      </motion.div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    hour: formatHour(item.hour),
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="hour" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickMargin={10}
            stroke="#6b7280"
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            formatter={(value: number) => [value, 'Bookings']}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar 
            dataKey="bookings_count" 
            name="Number of Bookings"
            fill="#3b82f6" 
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  
  return hour < 12 
    ? `${hour} AM` 
    : `${hour - 12} PM`;
}
