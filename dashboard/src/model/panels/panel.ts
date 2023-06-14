import { cast, getParent, getParentOfType, getRoot, Instance, SnapshotIn, types } from 'mobx-state-tree';
import { ContentModel } from '~/model';
import { VariableModel } from '~/model/variables';
import { TableVizComponent } from '~/plugins/viz-components/table';
import { QueryModelInstance } from '../queries';
import { PanelLayoutModel } from './layout';
import { PanelStyleModel } from './style';
import { PanelVizModel } from './viz';

export const PanelModel = types
  .model({
    id: types.string,
    title: types.string,
    description: types.string,
    layout: PanelLayoutModel,
    queryIDs: types.array(types.string),
    viz: PanelVizModel,
    style: PanelStyleModel,
    variables: types.optional(types.array(VariableModel), []),
  })
  .views((self) => ({
    getQuery(queryID: string): QueryModelInstance | undefined {
      return getParentOfType(self, ContentModel).queries.findByID(queryID) as QueryModelInstance | undefined;
    },
    get queryIDSet() {
      return new Set(self.queryIDs);
    },
    get queries(): QueryModelInstance[] {
      return self.queryIDs
        .map((id) => getParentOfType(self, ContentModel).queries.findByID(id))
        .filter((q) => !!q) as QueryModelInstance[];
    },
    get data() {
      return this.queries.reduce((ret: TPanelData, q) => {
        ret[q.id] = q.data.toJSON();
        return ret;
      }, {});
    },
    get dataStuff() {
      return this.queries.map((q) => ({
        data: q.data.toJSON(),
        len: q.data.length,
        state: q.state,
        error: q.error,
      }));
    },
    get dataLoading() {
      return this.queries.some((q) => q.state === 'loading');
    },
    get queryStateMessages() {
      return this.queries.map((q) => q.stateMessage).filter((m) => !!m);
    },
    get queryErrors() {
      return this.queries.map((q) => q.error).filter((e) => !!e);
    },
    get canRenderViz() {
      return this.queryErrors.length > 0 || this.queryStateMessages.length > 0 || !this.dataLoading;
    },
    get json() {
      const { id, title, description, queryIDs } = self;
      return {
        id,
        viz: self.viz.json,
        style: self.style.json,
        title,
        layout: self.layout.json,
        queryIDs: queryIDs,
        variables: self.variables.map((v) => v.json),
        description,
      };
    },
  }))
  .actions((self) => ({
    setID(id: string) {
      self.id = id;
    },
    setTitle(title: string) {
      self.title = title;
    },
    setDescription(description: string) {
      self.description = description;
    },
    addQueryID(queryID: string) {
      if (self.queryIDSet.has(queryID)) {
        return;
      }
      self.queryIDs.push(queryID);
    },
    removeQueryID(queryID: string) {
      if (!self.queryIDSet.has(queryID)) {
        return;
      }
      const s = new Set(self.queryIDSet);
      s.delete(queryID);
      self.queryIDs = cast(Array.from(s));
    },
    setQueryIDs(queryIDs: string[]) {
      self.queryIDs = cast(queryIDs);
    },
    addVariable(variable: SnapshotIn<typeof VariableModel>) {
      self.variables.push(variable);
    },
    removeVariable(variable: Instance<typeof VariableModel>) {
      self.variables.remove(variable);
    },
    removeSelf() {
      const parent = getParent(self, 2) as any;
      parent.removeByID(self.id);
    },
  }))
  .actions((self) => ({
    moveToView(sourceViewID: string, targetViewID: string) {
      // @ts-expect-error getRoot type
      const sourceView = getRoot(self).content.views.findByID(sourceViewID);
      sourceView.removePanelID(self.id);

      // @ts-expect-error getRoot type
      const targetView = getRoot(self).content.views.findByID(targetViewID);
      targetView.appendPanelID(self.id);

      // @ts-expect-error getRoot type
      const editor = getRoot(self).editor;
      editor.setPath(['_VIEWS_', targetViewID, '_PANELS_', self.id]);
    },
    refreshData() {
      self.queries.forEach((q) => q.fetchData());
    },
    downloadData() {
      // @ts-expect-error typeof getRoot
      getRoot(self).content.queries.downloadDataByQueryIDs(self.queryIDs);
    },
  }));

export type PanelModelInstance = Instance<typeof PanelModel>;
export type PanelModelSnapshotIn = SnapshotIn<PanelModelInstance>;

export function getNewPanel(id: string): PanelModelSnapshotIn {
  return {
    id,
    layout: {
      x: 0,
      y: Infinity, // puts it at the bottom
      w: 18,
      h: 300,
    },
    title: id,
    description: '<p></p>',
    queryIDs: [],
    viz: {
      type: TableVizComponent.name,
      conf: TableVizComponent.createConfig(),
    },
    style: {
      border: {
        enabled: true,
      },
    },
  };
}
