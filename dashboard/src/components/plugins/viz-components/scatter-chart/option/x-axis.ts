import { defaultEchartsOptions } from '~/styles/default-echarts-options';
import { IScatterChartConf } from '../type';
import { getLabelOverflowOptionOnAxis } from '~/components/plugins/common-echarts-fields/axis-label-overflow';
import { getEchartsXAxisLabel } from '~/components/plugins/common-echarts-fields/x-axis-label-formatter';

export function getXAxes(conf: IScatterChartConf, xAxisData: $TSFixMe[]) {
  const allNumbers = xAxisData.every((d) => !Number.isNaN(Number(d)));
  const { overflow, ...axisLabel } = conf.x_axis.axisLabel;
  const overflowOption = getLabelOverflowOptionOnAxis(overflow.on_axis);
  const xDataEmpty = xAxisData.length === 0;
  return [
    defaultEchartsOptions.getXAxis({
      data: xAxisData,
      name: conf.x_axis.name ?? '',
      nameGap: xDataEmpty ? 5 : undefined,
      id: 'main-x-axis',
      type: allNumbers ? 'value' : 'category',
      axisLabel: {
        ...axisLabel,
        ...overflowOption,
        formatter: getEchartsXAxisLabel(axisLabel.formatter),
      },
    }),
  ];
}
