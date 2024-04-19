import { Text } from '@mantine/core';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRenderPanelContext } from '~/contexts';
import { VizInstance, VizViewContext, VizViewProps } from '~/types/plugin';
import { useStorageData } from '../../..';
import { ITableConf } from '../type';
import { VizTableComponent } from './viz-table-component';

type IPrepareDataAndRender = {
  data: TPanelData;
  width: number;
  height: number;
  conf: ITableConf;
  instance: VizInstance;
  context: VizViewContext;
};
function PrepareDataAndRender({ data, width, height, conf, context, instance }: IPrepareDataAndRender) {
  const { t } = useTranslation();
  const { panel } = useRenderPanelContext();
  const fallbackQueryData = panel.firstQueryData ?? [];

  const { query_id } = conf;
  const queryData = useMemo(() => {
    if (!query_id) {
      return fallbackQueryData;
    }
    return data[query_id];
  }, [data, query_id, fallbackQueryData]);

  if (panel.queryIDs.length === 0) {
    return (
      <Text color="gray" align="center">
        {t('panel.settings.need_to_choose_queries')}
      </Text>
    );
  }

  if (!Array.isArray(queryData) || queryData.length === 0) {
    return (
      <Text color="gray" align="center">
        {t('data.empty_data')}
      </Text>
    );
  }

  return (
    <VizTableComponent
      queryData={queryData}
      width={width}
      height={height}
      conf={conf}
      context={context}
      instance={instance}
    />
  );
}

export function VizTable({ context, instance }: VizViewProps) {
  const data = context.data;
  const { height, width } = context.viewport;
  const { value: conf } = useStorageData<ITableConf>(context.instanceData, 'config');

  if (!conf) {
    return null;
  }

  return (
    <PrepareDataAndRender data={data} width={width} height={height} conf={conf} context={context} instance={instance} />
  );
}
