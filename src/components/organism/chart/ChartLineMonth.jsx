/* eslint-disable react/prop-types */
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const CustomizedLabel = (props) => {
  const { x, y, stroke, value } = props;

  return (
    <text x={x} y={y} dy={-4} fill={stroke} fontSize={10} textAnchor="middle">
      {value}
    </text>
  );
};

const CustomizedAxisTick = (props) => {
  const { x, y, payload } = props;

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-35)">
        {payload.value}
      </text>
    </g>
  );
};

const ChartLineMonth = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        width={500}
        height={300}
        data={data?.data?.data || []}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 10
        }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" height={60} tick={<CustomizedAxisTick />} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#8884d8"
          fill="#8884d8"
          label={<CustomizedLabel />}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ChartLineMonth;
