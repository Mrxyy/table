import { Box } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { DashboardActionContext } from '~/contexts/dashboard-action-context';
import { Filters } from '~/filter';
import { FullScreenPanel } from '~/main/full-screen-panel';
import { usePanelFullScreen } from '~/main/use-panel-full-screen';
import { useFullScreenPanelContext, ViewModelInstance } from '..';
import { ReadOnlyDashboardLayout } from './layout';
import { RenderViewComponent } from './view-component/render';

interface IDashboardViewRender {
  view: ViewModelInstance;
}

export const DashboardViewRender = observer(function _DashboardLayout({ view }: IDashboardViewRender) {
  const { fullScreenPanelID, setFullScreenPanelID } = useFullScreenPanelContext();
  const { viewPanelInFullScreen, exitFullScreen, inFullScreen, fullScreenPanel } = usePanelFullScreen(
    view,
    fullScreenPanelID,
    setFullScreenPanelID,
  );
  return (
    <DashboardActionContext.Provider
      value={{
        viewPanelInFullScreen,
        inFullScreen,
      }}
    >
      <Box className="dashboard-view" data-enable-scrollbar>
        {inFullScreen && <FullScreenPanel view={view} panel={fullScreenPanel!} exitFullScreen={exitFullScreen} />}
        <RenderViewComponent view={view}>
          <Box sx={{ position: 'relative' }}>
            {!inFullScreen && (
              <Box className="dashboard-sticky-area" sx={{ position: 'sticky', top: '0px' }}>
                <Filters view={view} />
              </Box>
            )}
            {/* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */}
            {!inFullScreen && <ReadOnlyDashboardLayout view={view} />}
          </Box>
        </RenderViewComponent>
      </Box>
    </DashboardActionContext.Provider>
  );
});