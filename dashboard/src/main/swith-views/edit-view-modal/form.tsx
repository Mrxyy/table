import { ActionIcon, Select, Stack, TextInput } from '@mantine/core';
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import { Trash } from 'tabler-icons-react';
import { useModelContext } from '~/contexts';
import { EViewComponentType } from '~/types';
import { ConfigFields } from './config-fields';

const viewComponentTypeOptions = [
  { label: 'Division', value: EViewComponentType.Division },
  { label: 'Modal', value: EViewComponentType.Modal },
];

export const EditViewForm = observer(() => {
  const model = useModelContext();
  const VIE = model.views.VIE;
  if (!VIE) {
    return null;
  }
  return (
    <Stack sx={{ position: 'relative' }}>
      <TextInput
        label="Name"
        value={VIE.id}
        onChange={(e) => {
          VIE.setID(e.currentTarget.value);
        }}
      />
      <Select label="Type" value={VIE.type} onChange={VIE.setType} data={viewComponentTypeOptions} />
      <ConfigFields />
    </Stack>
  );
});
