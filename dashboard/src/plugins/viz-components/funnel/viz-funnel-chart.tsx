import { Box } from '@mantine/core';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { FunnelChart } from 'echarts/charts';
import * as echarts from 'echarts/core';
import { DataZoomComponent, GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { defaults } from 'lodash';
import React, { useMemo } from 'react';
import { useStorageData } from '~/plugins/hooks';
import { VizViewProps } from '~/types/plugin';
import { getOption } from './option';
import { DEFAULT_CONFIG, IFunnelConf } from './type';

echarts.use([FunnelChart, DataZoomComponent, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer]);

function Chart({ conf, data, width, height }: { conf: IFunnelConf; data: TVizData; width: number; height: number }) {
  const option = React.useMemo(() => {
    return getOption(conf, data);
  }, [conf, data]);

  if (!width || !height) {
    return null;
  }
  return <ReactEChartsCore echarts={echarts} option={option} style={{ width, height }} notMerge theme="merico-light" />;
}

export function VizFunnelChart({ context }: VizViewProps) {
  const { value: confValue } = useStorageData<IFunnelConf>(context.instanceData, 'config');
  const conf = useMemo(() => defaults({}, confValue, DEFAULT_CONFIG), [confValue]);
  const data = context.data as $TSFixMe[];
  const { width, height } = context.viewport;

  return (
    <Box>
      <Chart width={width} height={height} data={data} conf={conf} />
    </Box>
  );
}
