import { Box, Button, FileInput, Group, LoadingOverlay, Text, TextInput } from '@mantine/core';
import { showNotification, updateNotification } from '@mantine/notifications';
import { useRequest } from 'ahooks';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { DashboardAPI } from '../../../../api-caller/dashboard';
import { validateDashboardJSONContent } from '../../../../utils/validate-dashboard-json';

type TDashboardContent_Temp = Record<string, any> | null; // FIXME: can't use IDashboard, need to fix IDashboard type def first;

interface IFormValues {
  name: string;
  content: TDashboardContent_Temp;
}

export function ImportDashboardForm({ postSubmit }: { postSubmit: () => void }) {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    setError,
    clearErrors,
  } = useForm<IFormValues>({
    defaultValues: {
      name: '',
      content: null,
    },
  });

  const createDashboardWithJSON = async ({ name, content }: IFormValues) => {
    showNotification({
      id: 'for-creating',
      title: 'Pending',
      message: 'Creating dashboard...',
      loading: true,
    });
    try {
      if (!content) {
        throw new Error('please use a valid json file');
      }
      const { id } = await DashboardAPI.create(name, '', content);
      updateNotification({
        id: 'for-creating',
        title: 'Successful',
        message: 'A new dashboard is created',
        color: 'green',
      });
      postSubmit();
      navigate(`/dashboard/${id}`);
    } catch (error: $TSFixMe) {
      updateNotification({
        id: 'for-creating',
        title: 'Failed',
        message: error.message,
        color: 'red',
      });
    }
  };

  const { data: nameSet = new Set<string>(), loading } = useRequest(
    async () => {
      const { data } = await DashboardAPI.list();
      return new Set(data.map((o) => o.name));
    },
    {
      refreshDeps: [],
    },
  );

  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.readAsText(file, 'UTF-8');
    fileReader.onload = (e) => {
      try {
        if (e.target === null) {
          throw new Error('FileReader failed with null result');
        }

        const content = e.target.result;
        if (typeof content !== 'string') {
          throw new Error(`Unparsable file content of type: ${typeof content}`);
        }
        validateDashboardJSONContent(content);

        setValue('content', JSON.parse(content));
        clearErrors('content');
      } catch (error: $TSFixMe | ErrorOptions) {
        console.error(error);
        setError('content', { type: 'custom', message: error.message });
      }
    };
    fileReader.onabort = () => console.log('🟨 abort');
    fileReader.onerror = () => {
      if (fileReader.error) {
        console.error(fileReader.error);
        setError('content', { type: 'custom', message: fileReader.error.message });
      }
    };
  }, [file]);

  const [name, content] = watch(['name', 'content']);
  const disabled = !name || !content;
  return (
    <Box mx="auto" sx={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} />
      <form onSubmit={handleSubmit(createDashboardWithJSON)}>
        <Controller
          name="name"
          control={control}
          rules={{
            validate: (v: string) => !nameSet.has(v) || 'This name is occupied',
          }}
          render={({ field }) => (
            <TextInput
              mb="md"
              required
              label="Name"
              placeholder="Name the dashboard"
              {...field}
              error={errors.name?.message}
            />
          )}
        />
        <FileInput label="JSON File" required value={file} onChange={setFile} error={errors?.content?.message} />
        <Group position="right" mt="md">
          <Button type="submit" disabled={disabled}>
            Confirm
          </Button>
        </Group>
      </form>
    </Box>
  );
}
