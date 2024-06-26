import { ActionIcon, Group, Stack, Tabs, Text } from '@mantine/core';
import _, { defaultsDeep } from 'lodash';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { DeviceFloppy } from 'tabler-icons-react';
import { useStorageData } from '~/components/plugins/hooks';
import { VizConfigProps } from '~/types/plugin';
import { DataField } from './editors/data-field';
import { LevelsField } from './editors/levels';
import { DEFAULT_CONFIG, ISunburstConf } from './type';
import { useTranslation } from 'react-i18next';
import { VizConfigBanner } from '../../editor-components';

export function VizSunburstEditor({ context }: VizConfigProps) {
  const { t } = useTranslation();
  const { value: confValue, set: setConf } = useStorageData<ISunburstConf>(context.instanceData, 'config');
  const { variables } = context;
  const conf: ISunburstConf = useMemo(() => defaultsDeep({}, confValue, DEFAULT_CONFIG), [confValue]);
  const defaultValues: ISunburstConf = useMemo(() => _.clone(conf), [conf]);

  const { control, handleSubmit, watch, getValues, reset } = useForm<ISunburstConf>({ defaultValues });
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues]);

  const values = getValues();
  const changed = useMemo(() => {
    return !_.isEqual(values, conf);
  }, [values, conf]);

  watch(['label_key', 'value_key', 'group_key', 'levels']);

  const [tab, setTab] = useState<string | null>('Data');
  return (
    <form onSubmit={handleSubmit(setConf)}>
      <Stack spacing="xs">
        <VizConfigBanner canSubmit={changed} />
        <Tabs
          value={tab}
          onTabChange={setTab}
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
            <Tabs.Tab value="Data">{t('data.label')}</Tabs.Tab>
            <Tabs.Tab value="Levels">{t('viz.sunburst_chart.level.labels')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="Data">
            <DataField control={control} watch={watch} />
          </Tabs.Panel>
          <Tabs.Panel value="Levels">
            <LevelsField control={control} watch={watch} />
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </form>
  );
}
