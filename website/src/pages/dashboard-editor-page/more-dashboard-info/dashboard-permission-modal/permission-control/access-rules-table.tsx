import { ActionIcon, Sx, Table } from '@mantine/core';
import { useRequest } from 'ahooks';
import { observer } from 'mobx-react-lite';
import { AccountAPI } from '../../../../../api-caller/account';
import {
  AccessPermissionLabelMap,
  AccountOrAPIKeyOptionType,
} from '../../../../../api-caller/dashboard-permission.types';
import { AccountTypeIcon } from '../../../../../components/account-type-icon';
import { PermissionModelInstance } from '../model';
import { AccessPermissionSelector } from './access-permission-selector';
import { AccountOrAPIKeySelector } from './account-or-apikey-selector';
import { IconX } from '@tabler/icons';
import _ from 'lodash';
import { useMemo } from 'react';

const TableSx: Sx = {
  tableLayout: 'fixed',
  width: '100%',
  'tr.fallback-row': {
    fontSize: '14px',
    height: '45px',
    td: {
      paddingLeft: '20px',
    },
    'td:nth-of-type(2)': {
      fontWeight: 'bold',
    },
  },
  'thead tr th ': {
    paddingLeft: '20px',
  },
  'td .value-text': {
    fontSize: '14px',
    paddingLeft: '10px',
  },
};

const OpenUsageRow = () => (
  <tr className="fallback-row">
    <td />
    <td>Everyone</td>
    <td>Use</td>
    <td />
  </tr>
);
const OpenEditingRow = () => (
  <tr className="fallback-row">
    <td />
    <td>Everyone</td>
    <td>Edit</td>
    <td />
  </tr>
);
const OpenRemovalRow = () => (
  <tr className="fallback-row">
    <td />
    <td>Everyone</td>
    <td>Remove</td>
    <td />
  </tr>
);

interface IAccessRules {
  model: PermissionModelInstance;
}

export const AccessRulesTable = observer(({ model }: IAccessRules) => {
  const data = model.access;

  const { data: options, loading } = useRequest(
    async (): Promise<AccountOrAPIKeyOptionType[]> => {
      const accountResp = await AccountAPI.list();
      const accounts = accountResp.data.map((d) => ({ label: d.name, value: d.id, type: 'ACCOUNT' } as const));
      return accounts;
    },
    { refreshDeps: [] },
  );

  const optionMap = useMemo(() => {
    if (!options) return {};
    return _.keyBy(options, 'value');
  }, [options]);

  return (
    <Table highlightOnHover sx={TableSx}>
      <thead>
        <tr>
          <th style={{ width: '50px' }} />
          <th style={{ width: '55%' }}>Account / API Key</th>
          <th style={{ width: 'calc(45% - 100px)' }}>Access</th>
          <th style={{ width: '50px' }} />
        </tr>
      </thead>
      <tbody>
        {[...data].map((d, i) => (
          <tr key={d.id}>
            <td>
              <AccountTypeIcon type={d.type} />
            </td>
            <td>
              {model.isOwner ? (
                <AccountOrAPIKeySelector
                  value={d.id}
                  onChange={d.setID}
                  options={options}
                  optionsLoading={loading}
                  disabled={!model.isOwner}
                />
              ) : (
                <span className="value-text">{_.get(optionMap, d.id)?.label ?? 'Unknown'}</span>
              )}
            </td>
            <td>
              {model.isOwner ? (
                <AccessPermissionSelector value={d.permission} onChange={d.setPermission} />
              ) : (
                <span className="value-text">{AccessPermissionLabelMap[d.permission]}</span>
              )}
            </td>
            <td>
              {model.isOwner && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => model.removeAccess(i)}
                  disabled={!model.isOwner}
                >
                  <IconX size={14} />
                </ActionIcon>
              )}
            </td>
          </tr>
        ))}
        {!model.usageRestricted && <OpenUsageRow />}
        {!model.editingRestricted && <OpenEditingRow />}
        {!model.removalRestricted && <OpenRemovalRow />}
      </tbody>
    </Table>
  );
});
