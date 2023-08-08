import { Button, Group } from '@mantine/core';
import _ from 'lodash';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { useRenderContentModelContext } from '~/contexts';
import { FilterMetaInstance, ViewMetaInstance } from '~/model';
import { Filter } from './filter';
import { useUpdateFilterPreviewValues } from './use-update-filter-preview-values';

export const Filters = observer(function _Filters({ view }: { view: ViewMetaInstance }) {
  const content = useRenderContentModelContext();

  const { control, handleSubmit, reset } = useForm({
    defaultValues: content.filters.values,
    // make sure the preview value is updated when filters are changed
    reValidateMode: 'onBlur',
  });
  const formValue = useWatch({ control });
  useEffect(() => {
    reset(content.filters.values);
  }, [content.filters.values, reset]);

  useUpdateFilterPreviewValues(formValue);

  const filters = content.filters.visibleInView(view.id);
  const allAutoSubmit = useMemo(() => filters.every((f) => f.should_auto_submit), [filters]);
  const requiredFilters = useMemo(() => filters.filter((f) => _.get(f, 'config.required', false)), [filters]);
  const searchButtonDisabled = useMemo(() => {
    if (requiredFilters.length === 0) {
      return false;
    }
    return requiredFilters.some((f) => !f.requiredAndPass(formValue[f.key]));
  }, [formValue, requiredFilters]);

  if (filters.length === 0) {
    return null;
  }

  const getChangeHandler =
    (filter: FilterMetaInstance, onChange: (v: any) => void) => (v: any, forceSubmit?: boolean) => {
      onChange(v);
      if (filter.should_auto_submit || forceSubmit) {
        content.filters.setValueByKey(filter.key, v);
      }
    };

  return (
    <form onSubmit={handleSubmit(content.filters.setValues)}>
      <Group
        className="dashboard-filters"
        position="apart"
        noWrap
        sx={allAutoSubmit ? {} : { border: '1px solid #e9ecef', borderRadius: '4px', padding: '16px' }}
      >
        <Group align="flex-start">
          {filters.map((filter) => (
            <Controller
              key={filter.id}
              name={filter.key}
              control={control}
              render={({ field }) => (
                <Filter filter={filter} value={field.value} onChange={getChangeHandler(filter, field.onChange)} />
              )}
            />
          ))}
        </Group>
        {!allAutoSubmit && (
          <Group sx={{ alignSelf: 'flex-end' }}>
            <Button color="blue" size="sm" type="submit" disabled={searchButtonDisabled}>
              Search
            </Button>
          </Group>
        )}
      </Group>
    </form>
  );
});