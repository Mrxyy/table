import { dashboardDataSource } from '../data_sources/dashboard';
import Dashboard from '../models/dashboard';
import logger from 'npmlog';
import { DashboardChangelogService } from '../services/dashboard_changelog.service';
import _ from 'lodash';
import DashboardChangelog from '../models/dashboard_changelog';

// NOTE: Keep versions in order
const versions = [
  '2.0.0',
  '2.1.0',
  '4.5.0',
  '4.5.1',
  '4.5.2',
  '4.5.3',
  '4.10.0',
  '5.9.0',
  '5.9.1',
  '5.9.2',
  '6.7.0',
  // ... future versions
];

function findNextVersion(currentVersion: string | undefined) {
  if (!currentVersion) {
    return versions[0];
  }

  const currentIndex = versions.findIndex((v) => v === currentVersion);
  if (currentIndex < versions.length - 1) {
    return versions[currentIndex + 1];
  }

  return null; // currentVersion is the lastest version
}

async function findHandler(currentVersion: string | undefined) {
  const nextVersion = findNextVersion(currentVersion);
  if (!nextVersion) {
    return;
  }
  return import(`./handlers/${nextVersion}`);
}

async function main() {
  logger.info('STARTING MIGRATION OF DASHBOARDS');
  try {
    if (!dashboardDataSource.isInitialized) {
      await dashboardDataSource.initialize();
    }
    const dashboardChangelogRepo = dashboardDataSource.getRepository(DashboardChangelog);
    const dashboardRepo = dashboardDataSource.getRepository(Dashboard);
    const dashboards = await dashboardRepo.find();

    for (let i = 0; i < dashboards.length; i += 1) {
      const db = dashboards[i];
      const version = db.content.version as string;
      if (version && !versions.includes(version)) {
        throw new Error(`MIGRATION FAILED, dashboard [${db.name}]'s version [${version}] is not migratable`);
      }
      let handler = await findHandler(version);
      while (handler) {
        const originalDashboard = _.cloneDeep(db);
        db.content = handler.main(db.content);
        const updatedDashboard = await dashboardRepo.save(db);
        const diff = await DashboardChangelogService.createChangelog(originalDashboard, _.cloneDeep(updatedDashboard));
        if (diff) {
          const changelog = new DashboardChangelog();
          changelog.dashboard_id = db.id;
          changelog.diff = diff;
          await dashboardChangelogRepo.save(changelog);
        }
        logger.info(`MIGRATED ${db.id} TO VERSION ${db.content.version}`);
        handler = await findHandler(db.content.version as string);
      }
    }
  } catch (error) {
    logger.error('error migrating dashboards');
    logger.error(error.message);
    process.exit(1);
  }
  logger.info('MIGRATION OF DASHBOARDS FINISHED');
}

main();
