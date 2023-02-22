import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { Trash } from 'tabler-icons-react';
import { useModelContext } from '~/contexts';
import { EditViewForm } from '~/main/dashboard-editor/settings/content/edit-view/edit-view-form';

export const EditView = observer(({ id }: { id: string }) => {
  const model = useModelContext();
  const view = model.views.findByID(id);
  if (!view) {
    return <Text size={14}>View by ID[{id}] is not found</Text>;
  }
  return (
    <Stack sx={{ maxWidth: '600px', height: '100%' }} spacing="sm">
      <Group position="right" pt={10}>
        <Button size="xs" color="red" leftIcon={<Trash size={16} />} onClick={() => model.views.removeByID(id)}>
          Delete this view
        </Button>
      </Group>
      <Box sx={{ flexGrow: 1, maxHeight: 'calc(100% - 52px)', overflow: 'auto' }}>
        <EditViewForm view={view} />
      </Box>
    </Stack>
  );
});
