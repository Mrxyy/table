import _ from 'lodash';
import { parseDataKey } from '~/utils/data';
import { getLabelOverflowOptionOnAxis } from '../../../common-echarts-fields/axis-label-overflow';
import { FormatterFuncType } from '../editors/x-axis/x-axis-label-formatter/get-echarts-x-axis-tick-label';
import { IHeatmapConf } from '../type';

export function getXAxis(conf: IHeatmapConf, data: TPanelData, formatterFunc: FormatterFuncType) {
  const x = parseDataKey(conf.x_axis.data_key);
  const xData = _.uniq(data[x.queryID].map((d) => d[x.columnKey]));

  const { overflow, rotate } = conf.x_axis.axisLabel;
  const overflowOption = getLabelOverflowOptionOnAxis(overflow.on_axis);
  return {
    id: 'main-x-axis',
    type: 'category',
    data: xData,
    name: conf.x_axis.name ?? '',
    align: 'center',
    axisTick: {
      show: true,
      alignWithLabel: true,
    },
    axisLabel: {
      rotate,
      ...overflowOption,
      formatter: formatterFunc,
    },
    splitArea: {
      show: true,
    },
    nameLocation: 'center',
    nameGap: 25,
    nameTextStyle: {
      fontWeight: 'bold',
      align: 'center',
    },
    z: 2,
  };
}
