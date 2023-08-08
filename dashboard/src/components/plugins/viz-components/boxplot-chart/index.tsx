import _, { cloneDeep, omit } from 'lodash';
import { defaultNumbroFormat } from '~/components/panel/settings/common/numbro-format-selector';
import { IMigrationEnv, VersionBasedMigrator } from '~/components/plugins/plugin-data-migrator';
import { VizComponent } from '~/types/plugin';
import { ITemplateVariable } from '~/utils/template';
import { DEFAULT_X_AXIS_LABEL_FORMATTER } from '../cartesian/editors/x-axis/x-axis-label-formatter/types';
import { ClickBoxplotSeries } from './triggers';
import { DEFAULT_CONFIG, IBoxplotChartConf } from './type';
import { VizBoxplotChart } from './viz-boxplot-chart';
import { VizBoxplotChartEditor } from './viz-boxplot-chart-editor';

function updateSchema2(legacyConf: IBoxplotChartConf & { variables: ITemplateVariable[] }): IBoxplotChartConf {
  return omit(legacyConf, 'variables');
}

function updateToSchema3(legacyConf: $TSFixMe): IBoxplotChartConf {
  const { label_formatter = defaultNumbroFormat, ...rest } = legacyConf.y_axis;
  return {
    ...legacyConf,
    y_axis: {
      ...rest,
      label_formatter,
    },
  };
}

function updateToSchema4(legacyConf: $TSFixMe): IBoxplotChartConf {
  const defaultXAxisLabel = {
    rotate: 0,
    formatter: { ...DEFAULT_X_AXIS_LABEL_FORMATTER },
  };

  const { axisLabel = defaultXAxisLabel, ...rest } = legacyConf.x_axis;
  return {
    ...legacyConf,
    x_axis: {
      ...rest,
      axisLabel,
    },
  };
}

function v5(legacyConf: $TSFixMe): IBoxplotChartConf {
  const patch = {
    x_axis: {
      axisLabel: {
        overflow: {
          x_axis: {
            width: 80,
            overflow: 'truncate',
            ellipsis: '...',
          },
          tooltip: {
            width: 200,
            overflow: 'break',
            ellipsis: '...',
          },
        },
      },
    },
  };
  return _.defaultsDeep(patch, legacyConf);
}

function v6(legacyConf: $TSFixMe): IBoxplotChartConf {
  delete legacyConf.config;
  const { x_axis, tooltip } = legacyConf.x_axis.axisLabel.overflow;
  const patch = {
    x_axis: {
      axisLabel: {
        overflow: {
          on_axis: x_axis,
          in_tooltip: tooltip,
        },
      },
    },
  };
  return _.defaultsDeep(patch, legacyConf);
}

function v7(legacyConf: $TSFixMe): IBoxplotChartConf {
  const patch = {
    tooltip: {
      metrics: [],
    },
  };
  return _.defaultsDeep(patch, legacyConf);
}

function v8(legacyConf: any, { panelModel }: IMigrationEnv): IBoxplotChartConf {
  try {
    const queryID = panelModel.queryIDs[0];
    if (!queryID) {
      throw new Error('cannot migrate when queryID is empty');
    }
    const changeKey = (key: string) => (key ? `${queryID}.${key}` : key);
    const { x_axis, y_axis, tooltip, ...rest } = legacyConf;
    return {
      ...rest,
      x_axis: {
        ...x_axis,
        data_key: changeKey(x_axis.data_key),
      },
      y_axis: {
        ...y_axis,
        data_key: changeKey(y_axis.data_key),
      },
      tooltip: {
        ...tooltip,
        metrics: tooltip.metrics.map((m: any) => ({
          ...m,
          data_key: changeKey(m.data_key),
        })),
      },
    };
  } catch (error) {
    console.error('[Migration failed]', error);
    throw error;
  }
}

export class VizBoxplotChartMigrator extends VersionBasedMigrator {
  readonly VERSION = 8;

  configVersions(): void {
    this.version(1, (data) => {
      return {
        version: 1,
        config: data,
      };
    });
    this.version(2, (data, { panelModel }) => {
      const { config } = data;
      const variables = (config.variables || []) as ITemplateVariable[];
      variables.forEach((v) => {
        if (!panelModel.variables.find((vv) => vv.name === v.name)) {
          panelModel.addVariable(v);
        }
      });
      return { ...data, version: 2, config: updateSchema2(config) };
    });
    this.version(3, (data) => {
      const { config } = data;
      return { ...data, version: 3, config: updateToSchema3(config) };
    });
    this.version(4, (data) => {
      const { config } = data;
      return { ...data, version: 4, config: updateToSchema4(config) };
    });
    this.version(5, (data) => {
      const { config } = data;
      return { ...data, version: 5, config: v5(config) };
    });
    this.version(6, (data) => {
      const { config } = data;
      return { ...data, version: 6, config: v6(config) };
    });
    this.version(7, (data) => {
      const { config } = data;
      return { ...data, version: 7, config: v7(config) };
    });
    this.version(8, (data, env) => {
      const { config } = data;
      return { ...data, version: 8, config: v8(config, env) };
    });
  }
}

export const BoxplotChartVizComponent: VizComponent = {
  displayName: 'Boxplot Chart',
  displayGroup: 'ECharts-based charts',
  migrator: new VizBoxplotChartMigrator(),
  name: 'boxplot',
  viewRender: VizBoxplotChart,
  configRender: VizBoxplotChartEditor,
  createConfig() {
    return {
      version: 8,
      config: cloneDeep(DEFAULT_CONFIG) as IBoxplotChartConf,
    };
  },
  triggers: [ClickBoxplotSeries],
};