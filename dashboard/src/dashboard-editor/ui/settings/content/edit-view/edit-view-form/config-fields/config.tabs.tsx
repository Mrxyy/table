import { Divider, Select, Stack, Switch } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { EViewComponentType, ViewMetaInstance, ViewTabsConfigInstance } from '~/model';

const tabVariantOptions = [
  {
    value: 'default',
    label: 'Default',
  },
  {
    value: 'outline',
    label: 'Outline',
  },
  {
    value: 'pills',
    label: 'Pills',
  },
];

const tabOrientationOptions = [
  {
    value: 'horizontal',
    label: 'Horizontal',
  },
  {
    value: 'vertical',
    label: 'Vertical',
  },
];

export const ViewTabsConfigFields = observer(({ view }: { view: ViewMetaInstance }) => {
  if (!view || view.type !== EViewComponentType.Tabs) {
    return null;
  }
  const config = view.config as ViewTabsConfigInstance;
  return (
    <Stack>
      <Divider mt={8} mb={0} label="Tabs settings" labelPosition="center" />
      <Select label="Variant" value={config.variant} onChange={config.setVariant} data={tabVariantOptions} />
      <Select
        label="Orientation"
        value={config.orientation}
        onChange={config.setOrientation}
        data={tabOrientationOptions}
      />
      <Switch label="Grow Tabs" checked={config.grow} onChange={(e) => config.setGrow(e.currentTarget.checked)} />
    </Stack>
  );
});