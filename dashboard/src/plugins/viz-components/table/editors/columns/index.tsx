import { ActionIcon, Divider, Stack, Switch, Tabs, Text } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import { Control, Controller, useFieldArray, UseFormWatch } from 'react-hook-form';
import { Plus } from 'tabler-icons-react';
import { AnyObject } from '~/types';
import { ITableConf, ValueType } from '../../type';
import { ColumnField } from './column';

interface IColumnsField {
  control: Control<ITableConf, $TSFixMe>;
  watch: UseFormWatch<ITableConf>;
  data: AnyObject[];
}
export const ColumnsField = ({ control, watch, data }: IColumnsField) => {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'columns',
  });

  const addColumn = () => {
    const id = randomId();
    append({
      id,
      label: id,
      value_field: 'value',
      value_type: ValueType.string,
    });
  };

  watch('columns');
  const use_raw_columns = watch('use_raw_columns');
  return (
    <>
      <Controller
        name="use_raw_columns"
        control={control}
        render={({ field }) => (
          <Switch
            mt={20}
            label="Use Original Data Columns"
            checked={field.value}
            onChange={(e) => field.onChange(e.currentTarget.checked)}
          />
        )}
      />
      <Divider mt={20} mb={10} variant="dashed" />
      {!use_raw_columns && (
        <Stack>
          <Text my={0}>Custom Columns</Text>
          <Tabs
            defaultValue={'0'}
            styles={{
              tab: {
                paddingTop: '0px',
                paddingBottom: '0px',
              },
              panel: {
                padding: '0px',
                paddingTop: '6px',
              },
            }}
          >
            <Tabs.List>
              {fields.map((_item, index) => (
                <Tabs.Tab key={_item.id} value={index.toString()}>
                  {index + 1}
                  {/* {field.name.trim() ? field.name : index + 1} */}
                </Tabs.Tab>
              ))}
              <Tabs.Tab onClick={addColumn} value="add">
                <ActionIcon>
                  <Plus size={18} color="#228be6" />
                </ActionIcon>
              </Tabs.Tab>
            </Tabs.List>
            {fields.map((column, index) => (
              <Tabs.Panel key={column.id} value={index.toString()}>
                <ColumnField
                  key={index}
                  control={control}
                  watch={watch}
                  index={index}
                  column={column}
                  data={data}
                  remove={remove}
                />
              </Tabs.Panel>
            ))}
          </Tabs>
        </Stack>
      )}
    </>
  );
};