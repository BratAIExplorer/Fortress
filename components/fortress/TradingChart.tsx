"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartDataPoint {
  date: string;
  close: number;
  sma50: number;
  sma200: number;
}

interface TradingChartProps {
  data: ChartDataPoint[];
}

export function TradingChart({ data }: TradingChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-gray-400">
        No chart data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
        <XAxis
          dataKey="date"
          stroke="#888"
          tick={{ fontSize: 12 }}
          interval={Math.floor(data.length / 6)}
        />
        <YAxis stroke="#888" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1a1a2e",
            border: "1px solid #00ff88",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#00ff88" }}
          formatter={(value: number) => `$${value.toFixed(2)}`}
        />
        <Line
          type="monotone"
          dataKey="close"
          stroke="#00ff88"
          dot={false}
          strokeWidth={2}
          name="Price"
        />
        <Line
          type="monotone"
          dataKey="sma50"
          stroke="#00ccff"
          dot={false}
          strokeWidth={1.5}
          strokeDasharray="5 5"
          name="SMA(50)"
        />
        <Line
          type="monotone"
          dataKey="sma200"
          stroke="#ffaa00"
          dot={false}
          strokeWidth={1.5}
          strokeDasharray="5 5"
          name="SMA(200)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
