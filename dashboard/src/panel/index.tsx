import { Container } from '@mantine/core';
import { useWhyDidYouUpdate } from 'ahooks';
import React from 'react';
import { PanelContext } from '../contexts/panel-context';
import { PanelTitleBar } from './title-bar';
import { Viz } from './viz';
import './index.css';
import { IDashboardPanel } from '../types/dashboard';
import { observer } from 'mobx-react-lite';
import { useModelContext } from '../contexts';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IPanel extends IDashboardPanel {}

export const Panel = observer(function _Panel({
  viz: initialViz,
  queryID: initialQueryID,
  title: initialTitle,
  description: initialDesc,
  id,
}: IPanel) {
  const model = useModelContext();
  const [title, setTitle] = React.useState(initialTitle);
  const [description, setDescription] = React.useState(initialDesc);
  const [queryID, setQueryID] = React.useState(initialQueryID);
  const [viz, setViz] = React.useState(initialViz);
  useWhyDidYouUpdate('Panel', { title, description, queryID, viz, id });

  React.useEffect(() => {
    const panel = model.panels.findByID(id);
    if (!panel) {
      return;
    }
    panel.setTitle(title);
    panel.setDescription(description);
    panel.setQueryID(queryID);
    panel.viz.setType(viz.type);
    panel.viz.setConf(viz.conf);
  }, [title, description, viz, id, queryID]);

  const { data, state } = model.getDataStuffByID(queryID);
  const loading = state === 'loading';
  return (
    <PanelContext.Provider
      value={{
        id,
        data,
        loading,
        title,
        setTitle,
        description,
        setDescription,
        queryID,
        setQueryID,
        viz,
        setViz,
      }}
    >
      <Container className="panel-root">
        <PanelTitleBar />
        <Viz viz={viz} data={data} loading={loading} />
      </Container>
    </PanelContext.Provider>
  );
});
