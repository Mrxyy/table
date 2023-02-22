import { Box, NavLink } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useModelContext } from '~/contexts';
import { NavOptionType } from '~/model/editor';
import { AddItemButton } from './add-item-button';

interface ISettingsNavLink {
  option: NavOptionType;
}

const SettingsNavLink = observer(({ option }: ISettingsNavLink) => {
  const editor = useModelContext().editor;
  const isActive = editor.isOptionActive;
  const active = isActive(editor.path, option);
  const isOpened = editor.isOptionOpened;
  const onClick = editor.navigate;
  return (
    <NavLink
      key={option.label}
      active={active}
      defaultOpened={isOpened(option)}
      label={option.label}
      onClick={() => onClick(option)}
      icon={option.Icon ? <option.Icon size={18} /> : null}
    >
      {option.children?.map((o) =>
        o._type === 'ACTION' ? (
          <AddItemButton key={`_ADD_${o.value}_`} action_type={o._action_type} />
        ) : (
          <SettingsNavLink key={o.value} option={o} />
        ),
      )}
    </NavLink>
  );
});

export const SettingsNavLinks = observer(() => {
  const model = useModelContext();

  return (
    <Box sx={{ position: 'relative' }}>
      {model.editor.navOptions.map((v) => (
        <SettingsNavLink key={v.value} option={v} />
      ))}
    </Box>
  );
});
