import React, { useState } from 'react';
import styles from './styles.module.scss';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Label, Semibold } from '../Typography';
import PropTypes from 'prop-types';
import AxisLabel from './AxisLabel';

const PureSensorReadingsLineChart = ({
  title,
  subTitle,
  xAxisDataKey,
  yAxisDataKeys,
  lineColors,
  xAxisLabel,
  yAxisLabel,
  chartData,
}) => {
  const [selectedLine, setSelectedLine] = useState(null);

  const selectLine = (event) => {
    let sl = selectedLine === event.dataKey ? null : event.dataKey.trim();
    setSelectedLine(sl);
  };

  return (
    <>
      <label>
        <Semibold className={styles.title}>{title}</Semibold>
      </label>
      <Label className={styles.subTitle}>{subTitle}</Label>
      <ResponsiveContainer width="100%" height="50%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 5,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="1 1" />
          <XAxis
            label={{ value: xAxisLabel, position: 'insideBottom' }}
            dataKey={xAxisDataKey}
            tick={false}
          />
          <YAxis
            label={
              <AxisLabel axisType="yAxis" x={25} y={165} width={0} height={0}>
                {yAxisLabel}
              </AxisLabel>
            }
          />
          <Tooltip />
          {yAxisDataKeys.length > 1 && (
            <Legend
              layout="horizontal"
              verticalAlign="top"
              align="center"
              wrapperStyle={{ top: 10, left: 50 }}
              onClick={selectLine}
            />
          )}
          {yAxisDataKeys.length &&
            yAxisDataKeys.map((attribute, idx) => (
              <Line
                key={idx}
                strokeWidth={2}
                dataKey={
                  selectedLine === null || selectedLine === attribute ? attribute : `${attribute} `
                }
                stroke={lineColors[idx % lineColors.length]}
                activeDot={{ r: 6 }}
              />
            ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

PureSensorReadingsLineChart.propTypes = {
  title: PropTypes.string.isRequired,
  subTitle: PropTypes.string.isRequired,
  xAxisDataKey: PropTypes.string.isRequired,
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string.isRequired,
};

export default PureSensorReadingsLineChart;