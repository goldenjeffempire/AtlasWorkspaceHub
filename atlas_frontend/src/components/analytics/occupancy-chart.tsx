
'use client';

import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
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
  isLoading?: boolean;
  error?: string;
}

export default function OccupancyChart({ data, isLoading, error }: OccupancyChartProps) {
  const [formattedData, setFormattedData] = useState<any[]>([]);

  useEffect(() => {
    if (data && data.length > 0) {
      const formatted = data.map(item => ({
        ...item,
        formattedDate: format(parseISO(item.date), 'MMM dd'),
        average_occupancy: Math.round(item.average_occupancy),
      }));
      setFormattedData(formatted);
    }
  }, [data]);

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
        <p className="text-gray-500">No occupancy data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
            stroke="#6b7280"
          />
          <YAxis 
            domain={[0, 100]} 
            unit="%" 
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
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6, fill: '#2563eb' }}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
