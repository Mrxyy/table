import {
  IconBoxMultiple,
  IconCodeDots,
  IconCopy,
  IconDatabase,
  IconFilter,
  IconVariable,
  TablerIcon,
} from '@tabler/icons';
import { Instance, getRoot, types } from 'mobx-state-tree';
import { ContentModelInstance } from '../content';

type PartialRootInstanceType = {
  content: ContentModelInstance;
};

export type NavActionType = {
  label: string;
  value: string;
  _type: 'ACTION';
  _action_type: '_Add_A_Filter_' | '_Add_A_SQL_SNIPPET_' | '_Add_A_QUERY_' | '_Add_A_VIEW_' | '_Add_A_PANEL_';
  parentID?: string; // for panel only
  Icon: null;
  children: null;
};
export type NavLinkType = {
  label: string;
  value: string;
  _type: 'GROUP' | 'global_variables' | 'mock_context' | 'filter' | 'sql_snippet' | 'query' | 'view' | 'panel';
  Icon?: TablerIcon;
  parentID?: string; // for panel only
  children?: NavOptionType[];
};
export type NavOptionType = NavLinkType | NavActionType;

function getActionOption(_action_type: NavActionType['_action_type']): NavActionType {
  return { label: _action_type, value: _action_type, _type: 'ACTION', _action_type, Icon: null, children: null };
}

export type ValidEditorPathType =
  | ['_GLOBAL_VARS_']
  | ['_MOCK_CONTEXT_']
  | ['_FILTERS_', string]
  | ['_SQL_SNIPPETS_', string]
  | ['_QUERIES_', string]
  | ['_VIEWS_', string]
  | ['_VIEWS_', string, '_PANELS_', string]
  | [];

function getPathFromOption(o: NavOptionType): ValidEditorPathType | null {
  switch (o._type) {
    case 'GROUP':
    case 'ACTION':
      return null;
    case 'global_variables':
      return ['_GLOBAL_VARS_'];
    case 'mock_context':
      return ['_MOCK_CONTEXT_'];
    case 'filter':
      return ['_FILTERS_', o.value];
    case 'sql_snippet':
      return ['_SQL_SNIPPETS_', o.value];
    case 'query':
      return ['_QUERIES_', o.value];
    case 'view':
      return ['_VIEWS_', o.value];
    case 'panel':
      if (!o.parentID) {
        console.error('[getPathFromOption] parentID is required');
        return null;
      }
      return ['_VIEWS_', o.parentID, '_PANELS_', o.value];
  }
}

export const EditorModel = types
  .model('EditorModel', {
    path: types.optional(types.frozen<ValidEditorPathType>(), []),
    settings_open: types.optional(types.boolean, false),
  })
  .views((self) => ({
    get navOptions() {
      const { content } = getRoot(self) as PartialRootInstanceType;
      const { filters, views, sqlSnippets, queries } = content;
      const ret: Array<NavOptionType> = [
        {
          label: 'Global Variables',
          value: '_GLOBAL_VARS_',
          _type: 'global_variables',
          Icon: IconVariable,
        },
        {
          label: 'Mock Context',
          value: '_MOCK_CONTEXT_',
          Icon: IconCodeDots,
          _type: 'mock_context',
        },
        {
          label: 'Filters',
          value: '_FILTERS_',
          Icon: IconFilter,
          children: [...filters.options, getActionOption('_Add_A_Filter_')],
          _type: 'GROUP',
        },
        {
          label: 'SQL Snippets',
          value: '_SQL_SNIPPETS_',
          Icon: IconCopy,
          children: [...sqlSnippets.options, getActionOption('_Add_A_SQL_SNIPPET_')],
          _type: 'GROUP',
        },
        {
          label: 'Queries',
          value: '_QUERIES_',
          Icon: IconDatabase,
          children: [...queries.options, getActionOption('_Add_A_QUERY_')],
          _type: 'GROUP',
        },
        {
          label: 'Views',
          value: '_VIEWS_',
          Icon: IconBoxMultiple,
          children: [...views.editorOptions, getActionOption('_Add_A_VIEW_')],
          _type: 'GROUP',
        },
      ];

      return ret;
    },
    isOptionActive(path: ValidEditorPathType, option: NavOptionType) {
      if (path.length === 0) {
        return false;
      }

      return path[path.length - 1] === option.value;
    },
    isOptionOpened(option: NavOptionType) {
      const { path } = self;
      if (path.length === 0) {
        return false;
      }
      if (!option.children || option.children.length === 0) {
        return false;
      }
      // @ts-expect-error ValidEditorPathType vs string
      return path.includes(option.value);
    },
  }))
  .actions((self) => ({
    setPath(v: ValidEditorPathType) {
      self.path = v;
    },
    setSettingsOpen(v: boolean) {
      self.settings_open = v;
    },
  }))
  .actions((self) => ({
    open(path: ValidEditorPathType) {
      self.setPath(path);
      self.setSettingsOpen(true);
    },
    close() {
      self.setSettingsOpen(false);
    },
    navigate(o: NavOptionType) {
      const path = getPathFromOption(o);
      if (path) {
        self.setPath(path);
      }
    },
  }));

export type EditorModelInstance = Instance<typeof EditorModel>;
