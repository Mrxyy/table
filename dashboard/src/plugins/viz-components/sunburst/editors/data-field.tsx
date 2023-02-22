import { Divider, Group, NumberInput, Stack, Text, TextInput } from '@mantine/core';
import { Control, Controller, UseFormWatch } from 'react-hook-form';
import { DataFieldSelector } from '~/panel/settings/common/data-field-selector';
import { ISunburstConf } from '../type';

interface IDataField {
  control: Control<ISunburstConf, $TSFixMe>;
  watch: UseFormWatch<ISunburstConf>;
  data: $TSFixMe[];
}
export function DataField({ data, control, watch }: IDataField) {
  watch(['label_key', 'value_key', 'group_key']);
  return (
    <Stack>
      <Controller
        name="label_key"
        control={control}
        render={({ field }) => <DataFieldSelector label="Label Key" required data={data} {...field} />}
      />
      <Controller
        name="value_key"
        control={control}
        render={({ field }) => <DataFieldSelector label="Value Key" required data={data} {...field} />}
      />
      <Controller
        name="group_key"
        control={control}
        render={({ field }) => <DataFieldSelector label="Group Key" data={data} clearable {...field} />}
      />
    </Stack>
  );
}