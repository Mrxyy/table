import { ActionIcon, Button, Checkbox, Group, Modal, Stack } from '@mantine/core';
import { useBoolean } from 'ahooks';
import { useState } from 'react';
import { Edit, Recycle, Settings } from 'tabler-icons-react';
import { CustomModalTitleFunctionEditor } from './function-editor';
import { DEFAULT_CUSTOM_MODAL_TITLE, ICustomModalTitle } from '~/model';
import { useTranslation } from 'react-i18next';

interface ICustomModalTitleField {
  value: ICustomModalTitle;
  onChange: (v: ICustomModalTitle) => void;
}

export const CustomModalTitleField = ({ value, onChange }: ICustomModalTitleField) => {
  const { t } = useTranslation();
  const [modalOpened, { setTrue, setFalse }] = useBoolean();
  const [localValue, setLocalValue] = useState<ICustomModalTitle>(value ?? DEFAULT_CUSTOM_MODAL_TITLE);

  const changeEnabled = (enabled: boolean) => {
    setLocalValue({
      ...localValue,
      enabled,
    });
  };

  const handleOk = () => {
    setFalse();
    const { enabled, func_content } = localValue;
    const newValue = {
      enabled,
      func_content,
    };

    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleCancel = () => {
    setFalse();
    setLocalValue(value);
  };

  const changeFuncContent = (func_content: string) => {
    setLocalValue((prev) => ({
      ...prev,
      func_content,
    }));
  };

  const resetFuncContent = () => {
    changeFuncContent(DEFAULT_CUSTOM_MODAL_TITLE.func_content);
  };

  return (
    <>
      <ActionIcon size="lg" color="blue" variant="filled" mt={26} onClick={setTrue} sx={{ flexGrow: 0 }}>
        <Settings size={14} />
      </ActionIcon>
      <Modal
        size={800}
        title={t('view.component.modal.custom_title')}
        opened={modalOpened}
        onClose={setFalse}
        closeOnClickOutside={false}
        withCloseButton={false}
        zIndex={320}
      >
        {modalOpened && (
          <Stack>
            <Checkbox
              mt={10}
              label={t('common.enabled')}
              checked={localValue.enabled}
              onChange={(event) => changeEnabled(event.currentTarget.checked)}
            />
            <CustomModalTitleFunctionEditor
              value={localValue.func_content}
              onChange={changeFuncContent}
              disabled={!localValue.enabled}
            />
            <Group position="apart">
              <Button onClick={resetFuncContent} color="red" leftIcon={<Recycle size={20} />}>
                {t('common.actions.revert')}
              </Button>
              <Group position="right">
                <Button onClick={handleCancel} variant="subtle">
                  {t('common.actions.cancel')}
                </Button>
                <Button onClick={handleOk}>{t('common.actions.save')}</Button>
              </Group>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
};
