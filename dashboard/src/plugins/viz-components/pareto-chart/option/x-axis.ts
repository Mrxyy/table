import { getEchartsXAxisLabel } from '../../cartesian/panel/x-axis/x-axis-label-formatter/get-echarts-x-axis-tick-label';
import { IParetoChartConf } from '../type';

export function getXAxis(conf: IParetoChartConf) {
  const { name, axisLabel } = conf.x_axis;
  return [
    {
      type: 'category',
      name: name,
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        fontWeight: 'bold',
        align: 'right',
      },
      splitLine: {
        show: false,
      },
      axisTick: {
        show: true,
        alignWithLabel: true,
      },
      axisLabel: {
        ...axisLabel,
        formatter: getEchartsXAxisLabel(axisLabel.formatter),
      },
    },
  ];
}