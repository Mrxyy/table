import { dashboardDataSource } from '../data_sources/dashboard';
import DashboardContent from '../models/dashboard_content';
import DashboardContentChangelog from '../models/dashboard_content_changelog';
import fs from 'fs-extra';
import path from 'path';
import simpleGit, { SimpleGit, SimpleGitOptions } from 'simple-git';
import {
  DashboardContentChangelogFilterObject,
  DashboardContentChangelogPaginationResponse,
  DashboardContentChangelogSortObject,
} from '../api_models/dashboard_content_changelog';
import { PaginationRequest } from '../api_models/base';
import logger from 'npmlog';
import { omit } from 'lodash';

export class DashboardContentChangelogService {
  static async createChangelog(
    oldDashboardContent: DashboardContent,
    newDashboardContent: DashboardContent,
  ): Promise<string | undefined> {
    const oldData = omit(oldDashboardContent, ['create_time', 'update_time']);
    const newData = omit(newDashboardContent, ['create_time', 'update_time']);
    const time = new Date().getTime();
    const dir = path.join(__dirname, `${time}_${oldData.id}`);
    await fs.ensureDir(dir);
    let diff: string | undefined;
    try {
      const options: Partial<SimpleGitOptions> = {
        baseDir: dir,
        binary: 'git',
      };
      const git: SimpleGit = simpleGit(options);
      await git.init();
      await git.addConfig('user.name', 'Devtable');
      await git.addConfig('user.email', 'Devtable@merico.dev');
      const filename = path.join(dir, 'data.json');
      await fs.writeJson(filename, oldData, { spaces: '\t' });
      await git.add(filename);
      await git.commit('First');
      await fs.writeJson(filename, newData, { spaces: '\t' });
      diff = await git.diff();
    } catch (e) {
      logger.warn('create dashboard changelog failed');
      logger.warn(e);
    } finally {
      await fs.rm(dir, { recursive: true, force: true });
    }
    return diff;
  }

  async list(
    filter: DashboardContentChangelogFilterObject | undefined,
    sort: DashboardContentChangelogSortObject[],
    pagination: PaginationRequest,
  ): Promise<DashboardContentChangelogPaginationResponse> {
    const offset = pagination.pagesize * (pagination.page - 1);
    const qb = dashboardDataSource.manager
      .createQueryBuilder()
      .from(DashboardContentChangelog, 'dcc')
      .select('id', 'id')
      .addSelect('dashboard_content_id', 'dashboard_content_id')
      .addSelect('diff', 'diff')
      .addSelect('create_time', 'create_time')
      .where('true')
      .orderBy(sort[0].field, sort[0].order)
      .offset(offset)
      .limit(pagination.pagesize);

    if (filter?.dashboard_content_id) {
      qb.andWhere('dashboard_content_id = :dashboard_content_id', {
        dashboard_content_id: filter.dashboard_content_id.value,
      });
    }

    sort.slice(1).forEach((s) => {
      qb.addOrderBy(s.field, s.order);
    });

    const dashboardChangelogs = await qb.getRawMany<DashboardContentChangelog>();
    const total = await qb.getCount();

    return {
      total,
      offset,
      data: dashboardChangelogs,
    };
  }
}
