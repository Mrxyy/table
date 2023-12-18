import { Stack, Sx, Tabs, Text, Tooltip } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import { DataPreview } from '../../data-preview';
import { QueryConfigurations } from './configurations';
import { TabPanel_HTTP } from './tabs/http';

import { useEditContentModelContext } from '~/contexts';
import { QueryRenderModelInstance } from '~/model';
import { QueryUsage } from './query-usage';
import { TabPanel_SQL } from './tabs/sql';
import { TabPanel_Transform } from './tabs/transform';
import { QueryModelInstance } from '~/dashboard-editor/model/queries';

const TabPanelStyle: Sx = {
  height: 'calc(100% - 44px)', // Tabs.List
  padding: 0,
};

interface IQueryEditorForm {
  queryModel: QueryModelInstance;
}

export const QueryEditorForm = observer(({ queryModel }: IQueryEditorForm) => {
  const content = useEditContentModelContext();
  const defaultTab = useMemo(() => {
    if (!queryModel.datasource) {
      return 'Configurations';
    }
    return queryModel.typedAsHTTP ? 'HTTP' : 'SQL';
  }, [queryModel.datasource, queryModel.typedAsHTTP]);

  const [tab, setTab] = useState<string | null>(defaultTab);

  useEffect(() => {
    setTab((t) => {
      if (t !== 'Configurations' && defaultTab === 'Configurations') {
        return 'Configurations';
      }
      return t;
    });
  }, [defaultTab]);

  const usage = content.findQueryUsage(queryModel.id);
  const noUsage = usage.length === 0;
  return (
    <Tabs
      value={tab}
      onTabChange={setTab}
      defaultValue={defaultTab}
      orientation="horizontal"
      keepMounted={false}
      sx={{ height: '100vh' }}
    >
      <Tabs.List grow>
        <Tabs.Tab value="Configurations">Configurations</Tabs.Tab>
        {queryModel.typedAsSQL && <Tabs.Tab value="SQL">Request</Tabs.Tab>}
        {queryModel.typedAsHTTP && <Tabs.Tab value="HTTP">Request</Tabs.Tab>}
        {queryModel.isTransform && <Tabs.Tab value="Transform">Transform</Tabs.Tab>}
        <Tabs.Tab value="Data" disabled={!queryModel.canPreviewData}>
          <Tooltip label={queryModel.guideToPreviewData} disabled={queryModel.canPreviewData} withinPortal>
            <Text>Data</Text>
          </Tooltip>
        </Tabs.Tab>
        <Tabs.Tab value="Usage" disabled={noUsage}>
          <Tooltip label="This query is not used for any filter or panel" disabled={!noUsage} withinPortal>
            <Text>Usage</Text>
          </Tooltip>
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="Configurations" pt={0} p={0}>
        <QueryConfigurations queryModel={queryModel} />
      </Tabs.Panel>

      {queryModel.typedAsSQL && (
        <Tabs.Panel value="SQL" sx={TabPanelStyle}>
          <Stack sx={{ height: '100%' }}>
            <TabPanel_SQL queryModel={queryModel} />
          </Stack>
        </Tabs.Panel>
      )}
      {queryModel.typedAsHTTP && (
        <Tabs.Panel value="HTTP" sx={TabPanelStyle}>
          <Stack sx={{ height: '100%' }}>
            <TabPanel_HTTP queryModel={queryModel} />
          </Stack>
        </Tabs.Panel>
      )}
      {queryModel.isTransform && (
        <Tabs.Panel value="Transform" sx={TabPanelStyle}>
          <Stack sx={{ height: '100%' }}>
            <TabPanel_Transform queryModel={queryModel} />
          </Stack>
        </Tabs.Panel>
      )}

      <Tabs.Panel value="Data" sx={{ ...TabPanelStyle, overflow: 'hidden' }}>
        <DataPreview id={queryModel.id} moreActions={null} refreshOnMount />
      </Tabs.Panel>

      <Tabs.Panel value="Usage" sx={{ ...TabPanelStyle, overflow: 'hidden' }}>
        <QueryUsage queryID={queryModel.id} usage={usage} />
      </Tabs.Panel>
    </Tabs>
  );
});
