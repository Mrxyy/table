import { DashboardContentDBType, DashboardEditor, IDashboard } from '@devtable/dashboard';
import { showNotification, updateNotification } from '@mantine/notifications';
import { observer } from 'mobx-react-lite';
import React, { useCallback } from 'react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import { IDashboardModel } from '@devtable/dashboard';
import { useRequest } from 'ahooks';
import { reaction, toJS } from 'mobx';
import { APICaller } from '../../api-caller';
import { DashboardDetailModelInstance } from '../../frames/app/models/dashboard-detail-model';
import { useDashboardStore } from '../../frames/app/models/dashboard-store-context';
import { getDashboardConfig } from '../../utils/config';
import { useRebaseModel } from './content-rebase-warning/rebase-editor/rebase-config-context';
import { MoreDashboardInfo } from './more-dashboard-info';
import { LoadingPlaceholder } from './placeholder';
import { useEditDashboardContext } from '@devtable/dashboard/src';
import { useNavigate } from 'react-router-dom';
import { useModals } from '@mantine/modals';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Group, Text } from '@mantine/core';
import { OnExitParams } from '@devtable/dashboard';

export const DashboardEditorPageContent = observer(
  ({ dashboardModel, refresh }: { dashboardModel: DashboardDetailModelInstance; refresh: () => void }) => {
    const { store } = useDashboardStore();
    const [context] = React.useState({});
    const rebaseModel = useRebaseModel();
    const dashboardModelRef = React.useRef<IDashboardModel>(null);
    const handleExit = useHandleExitEditPage();

    React.useEffect(() => {
      return reaction(
        () => toJS(rebaseModel.rebaseResult),
        (result) => {
          if (result) {
            console.log({ result });
            const d = dashboardModelRef.current?.json;
            if (d && result) {
              dashboardModelRef.current?.updateCurrent(d, result);
            }
          }
        },
      );
    }, [rebaseModel, dashboardModelRef]);

    const updateDashboard = async (d: IDashboard, c: DashboardContentDBType) => {
      showNotification({
        id: 'for-updating',
        title: 'Pending',
        message: 'Updating dashboard content...',
        loading: true,
      });
      try {
        if (!c.content) {
          throw new Error('Unexpected null content');
        }
        await APICaller.dashboard_content.update({
          ...store.currentDetail?.content.fullData,
          ...c,
        });
        updateNotification({
          id: 'for-updating',
          title: 'Successful',
          message: 'This dashboard is updated',
          color: 'green',
        });
        await store.currentDetail?.content.load();
      } catch (error) {
        console.error(error);
        updateNotification({
          id: 'for-updating',
          title: 'Failed',
          // @ts-expect-error type of error
          message: error.message,
          color: 'red',
        });
      }
    };
    const { data: dashboardConfig } = useRequest(getDashboardConfig, {
      refreshDeps: [],
    });

    if (!rebaseModel) {
      return null;
    }
    if (!dashboardModel.content.loaded) {
      return null;
    }
    if (!dashboardConfig) {
      return <LoadingPlaceholder dashboardLoading={true} contentLoading={false} />;
    }

    return (
      <DashboardEditor
        ref={dashboardModelRef}
        onChange={rebaseModel.setLocalWithDashboard}
        context={context}
        dashboard={dashboardModel.dashboard}
        content={dashboardModel.content.fullData}
        update={updateDashboard}
        config={dashboardConfig}
        headerSlot={<MoreDashboardInfo />}
        onExit={handleExit}
        // onFilterValuesChange={console.log}
      />
    );
  },
);

function useHandleExitEditPage() {
  const navigate = useNavigate();
  const modals = useModals();
  return useCallback(
    ({ hasChanges, dashboardId }: OnExitParams) => {
      function goBack() {
        navigate(`/dashboard/${dashboardId}`);
      }

      if (hasChanges) {
        modals.openConfirmModal({
          title: (
            <Group position="left">
              <IconAlertTriangle size={18} color="red" />
              <Text>There are unsaved changes</Text>
            </Group>
          ),
          labels: { confirm: 'Discard', cancel: 'Cancel' },
          confirmProps: { color: 'red' },
          onCancel: () => console.log('Cancel'),
          onConfirm: goBack,
          zIndex: 320,
          withCloseButton: false,
        });
      } else {
        goBack();
      }
    },
    [navigate, modals],
  );
}
