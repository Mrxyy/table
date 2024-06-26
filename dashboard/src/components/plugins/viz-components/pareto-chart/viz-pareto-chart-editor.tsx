import { Tabs } from '@mantine/core';
import { defaults, isEqual } from 'lodash';
import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useStorageData } from '~/components/plugins/hooks';
import { VizConfigProps } from '~/types/plugin';
import { VizConfigBanner } from '../../editor-components';
import { EchartsZoomingField } from '../cartesian/editors/echarts-zooming-field';
import { BarField } from './editors/bar';
import { LineField } from './editors/line';
import { MarkLineField } from './editors/mark-line';
import { XAxisField } from './editors/x-axis';
import { YAxisField } from './editors/y-axis';
import { DEFAULT_CONFIG, IParetoChartConf } from './type';
import { useTranslation } from 'react-i18next';

export function VizParetoChartEditor({ context }: VizConfigProps) {
  const { t } = useTranslation();
  const { value: conf, set: setConf } = useStorageData<IParetoChartConf>(context.instanceData, 'config');
  const defaultValues = useMemo(() => defaults({}, conf, DEFAULT_CONFIG), [conf]);

  const { control, handleSubmit, watch, getValues, reset } = useForm<IParetoChartConf>({ defaultValues });
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  watch(['x_axis', 'data_key', 'bar', 'line', 'dataZoom']);
  const values = getValues();
  const changed = useMemo(() => {
    return !isEqual(values, conf);
  }, [values, conf]);

  return (
    <form onSubmit={handleSubmit(setConf)}>
      <VizConfigBanner canSubmit={changed} />

      <Tabs
        defaultValue="X Axis"
        orientation="vertical"
        styles={{
          tab: {
            paddingLeft: '6px',
            paddingRight: '6px',
          },
          panel: {
            paddingTop: '6px',
            paddingLeft: '12px',
          },
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="X Axis">{t('chart.x_axis.label')}</Tabs.Tab>
          <Tabs.Tab value="Y Axis">{t('chart.y_axis.label')}</Tabs.Tab>
          <Tabs.Tab value="Bar">{t('chart.series.bar.label')}</Tabs.Tab>
          <Tabs.Tab value="Line">{t('chart.series.line.label')}</Tabs.Tab>
          <Tabs.Tab value="80-20 Line">{t('viz.pareto_chart.line_80_20.label')}</Tabs.Tab>
          <Tabs.Tab value="Zooming">{t('chart.zooming.label')}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="X Axis">
          <XAxisField control={control} watch={watch} />
        </Tabs.Panel>

        <Tabs.Panel value="Y Axis">
          <YAxisField control={control} watch={watch} />
        </Tabs.Panel>

        <Tabs.Panel value="Bar">
          <BarField control={control} watch={watch} />
        </Tabs.Panel>

        <Tabs.Panel value="Line">
          <LineField control={control} watch={watch} />
        </Tabs.Panel>

        <Tabs.Panel value="80-20 Line">
          <MarkLineField control={control} watch={watch} />
        </Tabs.Panel>

        <Tabs.Panel value="Zooming">
          <Controller name="dataZoom" control={control} render={({ field }) => <EchartsZoomingField {...field} />} />
        </Tabs.Panel>
      </Tabs>
    </form>
  );
}
