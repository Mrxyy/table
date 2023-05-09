import { Text } from '@mantine/core';
import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { useContentModelContext } from '~/contexts';
import { useStorageData } from '~/plugins/hooks';
import { VizViewProps } from '~/types/plugin';
import { DEFAULT_CONFIG, IVizTextConf } from './type';
import { formatAggregatedValue, getAggregatedValue } from '~/utils/template';

export const VizText = observer(({ context }: VizViewProps) => {
  const model = useContentModelContext();
  const { value: conf = DEFAULT_CONFIG } = useStorageData<IVizTextConf>(context.instanceData, 'config');
  const { variables } = context;
  const data = context.data as $TSFixMe[]; // FIXME: from TVizData[] to Record<string, number>[], or improve getAggregatedValue's type def
  const { func_content, horizontal_align, font_size, font_weight } = conf;

  const variableValueMap = useMemo(() => {
    return variables.reduce((prev, variable) => {
      const value = getAggregatedValue(variable, data);
      prev[variable.name] = formatAggregatedValue(variable, value);
      return prev;
    }, {} as Record<string, string | number>);
  }, [variables, data]);

  const content = useMemo(() => {
    return new Function(`return ${func_content}`)()({
      data,
      variables: variableValueMap,
      filters: model.filters.values,
      context: model.context.current,
    });
  }, [func_content, data, variableValueMap, model.filters.values, model.context.current]);

  return (
    <Text align={horizontal_align} weight={font_weight} sx={{ fontSize: font_size }}>
      {content}
    </Text>
  );
});
