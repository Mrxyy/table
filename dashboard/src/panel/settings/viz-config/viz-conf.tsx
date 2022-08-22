import { ActionIcon, JsonInput, Select } from '@mantine/core';
import { useInputState } from '@mantine/hooks';
import React, { createElement, useContext, useEffect } from 'react';
import { DeviceFloppy } from 'tabler-icons-react';
import { PanelContext } from '../../../contexts';
import { IPanelInfo, PluginContext, VizConfigComponent } from '../../../plugins';
import { IConfigComponentProps } from '../../../plugins/viz-manager/components';
import { IVizConfig } from '../../../types';
import { IPanelInfoEditor } from '../../../types/plugin';
import { VizBar3DPanel } from '../../viz/bar-3d/panel';
import { VizCartesianChartPanel } from '../../viz/cartesian/panel';
import { VizPiePanel } from '../../viz/pie/panel';
import { VizRichTextPanel } from '../../viz/rich-text/panel';
import { VizStatsPanel } from '../../viz/stats/panel';
import { SunburstPanel } from '../../viz/sunburst/panel';
import { VizTablePanel } from '../../viz/table/panel';

const types = [
  { value: 'stats', label: 'Stats', Panel: VizStatsPanel },
  { value: 'rich-text', label: 'Rich Text', Panel: VizRichTextPanel },
  { value: 'table', label: 'Table', Panel: VizTablePanel },
  { value: 'sunburst', label: 'Sunburst', Panel: SunburstPanel },
  { value: 'bar-3d', label: 'Bar Chart (3D)', Panel: VizBar3DPanel },
  {
    value: 'cartesian',
    label: 'Cartesian Chart',
    Panel: VizCartesianChartPanel,
  },
  { value: 'pie', label: 'Pie Chart', Panel: VizPiePanel },
];

function PluginVizConfigComponent({
  setVizConf,
  ...props
}: IConfigComponentProps & { setVizConf: (val: React.SetStateAction<IVizConfig>) => void }) {
  const { vizManager, panel } = props;
  const instance = vizManager.getOrCreateInstance(panel);
  useEffect(() => {
    return instance.instanceData.watchItem<Record<string, any>>(null, (configData) => {
      setVizConf((prev) => ({ ...prev, conf: configData }));
    });
  }, [setVizConf]);
  return <VizConfigComponent {...props} />;
}

function usePluginVizConfig() {
  const { viz, title, data, queryID, description, setDescription, setTitle, setQueryID, setViz, id } =
    useContext(PanelContext);
  const { vizManager } = useContext(PluginContext);
  const panel: IPanelInfo = {
    title,
    description,
    viz,
    queryID,
    id,
  };
  const panelEditor: IPanelInfoEditor = {
    setDescription: setDescription,
    setQueryID: setQueryID,
    setTitle: setTitle,
  };
  try {
    vizManager.resolveComponent(panel.viz.type);
    return (
      <PluginVizConfigComponent
        setVizConf={setViz}
        panel={panel}
        panelInfoEditor={panelEditor}
        vizManager={vizManager}
        data={data}
      />
    );
  } catch (e) {
    console.warn(e);
    return null;
  }
}

export function EditVizConf() {
  const { data, viz, setViz } = React.useContext(PanelContext);
  const [type, setType] = useInputState(viz.type);

  const changed = viz.type !== type;

  const submit = React.useCallback(() => {
    if (!changed) {
      return;
    }
    setViz((v) => ({
      ...v,
      type,
    }));
  }, [changed, type]);

  const setVizConf = (conf: IVizConfig['conf']) => {
    setViz((v) => ({ ...v, conf }));
  };

  const setVizConfByJSON = (conf: string) => {
    try {
      setVizConf(JSON.parse(conf));
    } catch (error) {
      console.error(error);
    }
  };

  const Panel = React.useMemo(() => {
    return types.find((t) => t.value === type)?.Panel;
  }, [type, types]);

  const pluginPanel = usePluginVizConfig();
  const builtInPanel = Panel
    ? createElement(Panel as any, {
        data,
        viz,
        setVizConf,
      })
    : null;
  const finalPanel = pluginPanel || builtInPanel;
  return (
    <>
      <Select
        label="Visualization"
        value={type}
        onChange={setType}
        data={types}
        rightSection={
          <ActionIcon disabled={!changed} onClick={submit}>
            <DeviceFloppy size={20} />
          </ActionIcon>
        }
      />
      {finalPanel}
      {!finalPanel && (
        <JsonInput minRows={20} label="Config" value={JSON.stringify(viz.conf, null, 2)} onChange={setVizConfByJSON} />
      )}
    </>
  );
}
