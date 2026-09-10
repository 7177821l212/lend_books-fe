/**
 * Sparkline — minimal SVG line + area chart.
 * Designed for 30-day trend display: no axis labels, just the shape.
 */
import { useMemo } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { useColors } from '@/theme';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeColor?: string;
  fillColor?: string;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  width = 300,
  height = 120,
  strokeColor,
  fillColor = 'rgba(0,200,83,0.15)',
  strokeWidth = 2,
}: SparklineProps) {
  const colors = useColors();
  const resolvedStrokeColor = strokeColor ?? colors.brand[600];
  const { line, area } = useMemo(() => {
    if (!data.length) return { line: '', area: '' };
    const pad = strokeWidth;
    const min = Math.min(...data, 0);
    const max = Math.max(...data, 1);
    const range = max - min || 1;
    const xStep = (width - pad * 2) / Math.max(1, data.length - 1);

    const points = data.map((v, i) => {
      const x = pad + i * xStep;
      const y = pad + (height - pad * 2) * (1 - (v - min) / range);
      return [x, y] as const;
    });

    const line = points
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`)
      .join(' ');
    const area = `${line} L ${points[points.length - 1][0].toFixed(2)} ${height - pad} L ${points[0][0].toFixed(2)} ${height - pad} Z`;
    return { line, area };
  }, [data, width, height, strokeWidth]);

  if (!data.length) {
    return <View style={{ width, height }} />;
  }

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={fillColor} stopOpacity="0.25" />
          <Stop offset="1" stopColor={resolvedStrokeColor} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      <Path d={area} fill="url(#sparkFill)" />
      <Path
        d={line}
        stroke={resolvedStrokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
