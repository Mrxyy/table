import _ from 'lodash';
import { TMericoHeatmapConf } from '../../type';
import { getLabelOverflowOptionOnAxis } from '../../../../common-echarts-fields/axis-label-overflow';
import { parseDataKey } from '~/utils';
import { defaultEchartsOptions } from '~/styles/default-echarts-options';
import { FormatterFuncType } from '~/components/plugins/common-echarts-fields/x-axis-label-formatter';

export function getYAxis(conf: TMericoHeatmapConf, data: TPanelData, formatterFunc: FormatterFuncType) {
  const x = parseDataKey(conf.x_axis.data_key);
  const y = parseDataKey(conf.y_axis.data_key);

  const { nameAlignment, data_key, ...rest } = conf.y_axis;
  const yData = _.uniq(data[x.queryID].map((d) => d[y.columnKey]));

  const { overflow, rotate } = conf.y_axis.axisLabel;
  const overflowOption = getLabelOverflowOptionOnAxis(overflow.on_axis);
  return defaultEchartsOptions.getYAxis({
    ...rest,
    type: 'category',
    data: yData,
    axisLabel: {
      rotate,
      ...overflowOption,
      formatter: formatterFunc,
    },
    axisLine: {
      show: true,
      lineStyle: {
        width: 3,
      },
    },
    axisTick: {
      show: true,
      alignWithLabel: true,
    },
    splitArea: {
      show: false,
      areaStyle: {
        color: '#E7E7E9',
      },
    },
    splitLine: {
      show: false,
    },
    nameTextStyle: {
      fontWeight: 'bold',
      align: nameAlignment,
    },
    nameLocation: 'end',
    nameGap: 15,
    z: 3,
  });
}
