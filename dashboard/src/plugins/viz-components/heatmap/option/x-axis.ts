import _ from 'lodash';
import { AnyObject } from '~/types';
import { getEchartsXAxisLabel } from '../editors/x-axis/x-axis-label-formatter/get-echarts-x-axis-tick-label';
import { IHeatmapConf } from '../type';

export function getXAxis(conf: IHeatmapConf, data: AnyObject[]) {
  const { axisLabel } = conf.x_axis;
  return {
    id: 'main-x-axis',
    type: 'category',
    data: _.uniq(data.map((d) => d[conf.x_axis.data_key])),
    name: conf.x_axis.name ?? '',
    align: 'center',
    axisTick: {
      show: true,
      alignWithLabel: true,
    },
    axisLabel: {
      ...axisLabel,
      formatter: getEchartsXAxisLabel(axisLabel.formatter),
    },
    nameLocation: 'center',
    nameTextStyle: {
      fontWeight: 'bold',
      align: 'center',
    },
    z: 3,
  };
}
