/* eslint-disable react/prop-types */
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
const ChartCurrentAndSevenDaysBefore = ({ data, style }) => {
  return (
    <div style={style}>
      <ResponsiveContainer>
        <AreaChart
          data={data?.data?.data || []}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0
          }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCurrentAndSevenDaysBefore;
