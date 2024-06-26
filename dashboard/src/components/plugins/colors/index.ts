import { IColorInterpolation } from '~/types/plugin';
import { createDivergingColorPalette } from './diverging-color';
import { createSequentialColorPalette } from './sequential-color';

export { createDivergingColorPalette } from './diverging-color';
export { createSequentialColorPalette } from './sequential-color';

export const RedGreen: IColorInterpolation = {
  type: 'interpolation',
  displayName: 'style.color.interpolation.palette.red_green',
  getColor: createDivergingColorPalette(['darkred', 'deeppink', 'lightyellow'], ['lightyellow', 'lightgreen', 'teal']),
  name: 'red-green',
  category: 'diverging',
};

export const YellowBlue: IColorInterpolation = {
  type: 'interpolation',
  displayName: 'style.color.interpolation.palette.yellow_blue',
  getColor: createDivergingColorPalette(['#8f531d', '#ffd347', '#e3efe3'], ['#eefaee', '#4ecbbf', '#003f94']),
  name: 'yellow-blue',
  category: 'diverging',
};

export const Red: IColorInterpolation = {
  type: 'interpolation',
  displayName: 'style.color.interpolation.palette.red',
  getColor: createSequentialColorPalette(['#fff7f1', 'darkred']),
  name: 'red',
  category: 'sequential',
};

export const Green: IColorInterpolation = {
  type: 'interpolation',
  displayName: 'style.color.interpolation.palette.green',
  getColor: createSequentialColorPalette(['#f0ffed', 'darkgreen']),
  name: 'green',
  category: 'sequential',
};

export const Blue: IColorInterpolation = {
  type: 'interpolation',
  displayName: 'style.color.interpolation.palette.blue',
  getColor: createSequentialColorPalette(['#f9fcff', '#48b3e9', 'darkblue']),
  name: 'blue',
  category: 'sequential',
};

export const Orange: IColorInterpolation = {
  type: 'interpolation',
  displayName: 'style.color.interpolation.palette.orange',
  getColor: createSequentialColorPalette(['#fff7f1', 'darkorange', '#b60000']),
  name: 'orange',
  category: 'sequential',
};
