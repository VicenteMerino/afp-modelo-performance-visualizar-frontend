"use client"
import { CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React from 'react';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

interface LineChartProps {
  movementData: {
    movement_date: string;
    clp_amount: number;
    shares_amount: number;
    fundsflow: 'CREDIT' | 'CHARGE';
  }[];
  shareData: {
    date: string;
    share_value: number;
  };
}

const LineChart: React.FC<LineChartProps> = ({ movementData , shareData}) => {
  // Sort data by date
  const sortedData = movementData.sort((a, b) => new Date(a.movement_date).getTime() - new Date(b.movement_date).getTime());

  // Calculate accumulated values
  let accumulatedBalance = 0;
  const chartData = {
    labels: sortedData.map(item => new Date(item.movement_date).toLocaleDateString()),
    datasets: [
      {
        label: 'Accumulated Balance',
        data: sortedData.map(item => {
          accumulatedBalance += (item.fundsflow === 'CREDIT' ? item.shares_amount : -item.shares_amount) * shareData.share_value;
          return accumulatedBalance
        }),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default LineChart;
