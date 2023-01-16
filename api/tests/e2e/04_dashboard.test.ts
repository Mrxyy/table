import { connectionHook, createAuthStruct } from './jest.util';
import Dashboard from '~/models/dashboard';
import { dashboardDataSource } from '~/data_sources/dashboard';
import * as validation from '~/middleware/validation';
import request from 'supertest';
import { app } from '~/server';
import {
  DashboardCreateRequest,
  DashboardIDRequest,
  DashboardListRequest,
  DashboardNameRequest,
  DashboardUpdateRequest,
} from '~/api_models/dashboard';
import { AccountLoginRequest, AccountLoginResponse } from '~/api_models/account';
import { notFoundId } from './constants';
import ApiKey from '~/models/apiKey';

describe('DashboardController', () => {
  connectionHook();
  let presetDashboard: Dashboard;
  let superadminLogin: AccountLoginResponse;
  let dashboard1: Dashboard;
  let dashboard2: Dashboard;
  let apiKey: ApiKey;
  const server = request(app);

  const validate = jest.spyOn(validation, 'validate');

  beforeAll(async () => {
    const query: AccountLoginRequest = {
      name: 'superadmin',
      password: process.env.SUPER_ADMIN_PASSWORD ?? 'secret',
    };
    validate.mockReturnValueOnce(query);

    const response = await server.post('/account/login').send(query);

    superadminLogin = response.body;

    const presetData = new Dashboard();
    presetData.name = 'preset';
    presetData.content = {};
    presetData.is_preset = true;
    presetData.is_removed = true;
    presetDashboard = await dashboardDataSource.getRepository(Dashboard).save(presetData);
    apiKey = await dashboardDataSource.getRepository(ApiKey).findOneBy({ name: 'key1' });
  });

  beforeEach(() => {
    validate.mockReset();
  });

  describe('create', () => {
    it('should create successfully', async () => {
      const request1: DashboardCreateRequest = {
        name: 'dashboard1',
        content: {},
      };
      validate.mockReturnValueOnce(request1);

      const response1 = await server
        .post('/dashboard/create')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(request1);

      response1.body.create_time = new Date(response1.body.create_time);
      response1.body.update_time = new Date(response1.body.update_time);
      dashboard1 = response1.body;
      expect(response1.body).toMatchObject({
        name: 'dashboard1',
        content: {},
        id: response1.body.id,
        create_time: response1.body.create_time,
        update_time: response1.body.update_time,
        is_removed: false,
        is_preset: false,
      });

      const request2: DashboardCreateRequest = {
        name: 'dashboard2',
        content: {},
      };
      validate.mockReturnValueOnce(request2);

      const response2 = await server
        .post('/dashboard/create')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(request2);

      response2.body.create_time = new Date(response2.body.create_time);
      response2.body.update_time = new Date(response2.body.update_time);
      dashboard2 = response2.body;
      expect(response2.body).toMatchObject({
        name: 'dashboard2',
        content: {},
        id: response2.body.id,
        create_time: response2.body.create_time,
        update_time: response2.body.update_time,
        is_removed: false,
        is_preset: false,
      });
    });

    it('should fail if duplicate name', async () => {
      const request: DashboardCreateRequest = {
        name: 'dashboard1',
        content: {},
      };
      validate.mockReturnValueOnce(request);

      const response = await server
        .post('/dashboard/create')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(request);

      expect(response.body).toMatchObject({
        code: 'BAD_REQUEST',
        detail: {
          message: 'duplicate key value violates unique constraint "dashboard_name_preset_idx"',
        },
      });
    });

    it('should fail if name empty', async () => {
      const request: DashboardCreateRequest = {
        name: undefined,
        content: {},
      };
      validate.mockReturnValueOnce(request);

      const response = await server
        .post('/dashboard/create')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(request);

      expect(response.body).toMatchObject({
        code: 'BAD_REQUEST',
        detail: {
          message: 'null value in column "name" of relation "dashboard" violates not-null constraint',
        },
      });
    });
  });

  describe('list', () => {
    it('no filters', async () => {
      const query: DashboardListRequest = {
        pagination: { page: 1, pagesize: 20 },
        sort: { field: 'name', order: 'ASC' },
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/list')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      expect(response.body).toMatchObject({
        total: 3,
        offset: 0,
        data: [
          {
            id: response.body.data[0].id,
            name: 'dashboard1',
            content: {},
            create_time: response.body.data[0].create_time,
            update_time: response.body.data[0].update_time,
            is_removed: false,
            is_preset: false,
          },
          {
            id: response.body.data[1].id,
            name: 'dashboard2',
            content: {},
            create_time: response.body.data[1].create_time,
            update_time: response.body.data[1].update_time,
            is_removed: false,
            is_preset: false,
          },
          {
            id: presetDashboard.id,
            name: 'preset',
            content: {},
            create_time: response.body.data[2].create_time,
            update_time: response.body.data[2].update_time,
            is_removed: true,
            is_preset: true,
          },
        ],
      });
    });

    it('with search filter', async () => {
      const query: DashboardListRequest = {
        filter: { search: 'dashboard' },
        pagination: { page: 1, pagesize: 20 },
        sort: { field: 'name', order: 'ASC' },
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/list')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      expect(response.body).toMatchObject({
        total: 2,
        offset: 0,
        data: [
          {
            id: response.body.data[0].id,
            name: 'dashboard1',
            content: {},
            create_time: response.body.data[0].create_time,
            update_time: response.body.data[0].update_time,
            is_removed: false,
            is_preset: false,
          },
          {
            id: response.body.data[1].id,
            name: 'dashboard2',
            content: {},
            create_time: response.body.data[1].create_time,
            update_time: response.body.data[1].update_time,
            is_removed: false,
            is_preset: false,
          },
        ],
      });
    });

    it('with selection ALL filter', async () => {
      const query: DashboardListRequest = {
        filter: { selection: 'ALL' },
        pagination: { page: 1, pagesize: 20 },
        sort: { field: 'name', order: 'ASC' },
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/list')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      expect(response.body).toMatchObject({
        total: 3,
        offset: 0,
        data: [
          {
            id: response.body.data[0].id,
            name: 'dashboard1',
            content: {},
            create_time: response.body.data[0].create_time,
            update_time: response.body.data[0].update_time,
            is_removed: false,
            is_preset: false,
          },
          {
            id: response.body.data[1].id,
            name: 'dashboard2',
            content: {},
            create_time: response.body.data[1].create_time,
            update_time: response.body.data[1].update_time,
            is_removed: false,
            is_preset: false,
          },
          {
            id: presetDashboard.id,
            name: 'preset',
            content: {},
            create_time: response.body.data[2].create_time,
            update_time: response.body.data[2].update_time,
            is_removed: true,
            is_preset: true,
          },
        ],
      });
    });

    it('with selection ACTIVE filter', async () => {
      const query: DashboardListRequest = {
        filter: { selection: 'ACTIVE' },
        pagination: { page: 1, pagesize: 20 },
        sort: { field: 'name', order: 'ASC' },
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/list')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      expect(response.body).toMatchObject({
        total: 2,
        offset: 0,
        data: [
          {
            id: response.body.data[0].id,
            name: 'dashboard1',
            content: {},
            create_time: response.body.data[0].create_time,
            update_time: response.body.data[0].update_time,
            is_removed: false,
            is_preset: false,
          },
          {
            id: response.body.data[1].id,
            name: 'dashboard2',
            content: {},
            create_time: response.body.data[1].create_time,
            update_time: response.body.data[1].update_time,
            is_removed: false,
            is_preset: false,
          },
        ],
      });
    });

    it('with selection REMOVED filter', async () => {
      const query: DashboardListRequest = {
        filter: { selection: 'REMOVED' },
        pagination: { page: 1, pagesize: 20 },
        sort: { field: 'name', order: 'ASC' },
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/list')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      expect(response.body).toMatchObject({
        total: 1,
        offset: 0,
        data: [
          {
            id: presetDashboard.id,
            name: 'preset',
            content: {},
            create_time: response.body.data[0].create_time,
            update_time: response.body.data[0].update_time,
            is_removed: true,
            is_preset: true,
          },
        ],
      });
    });
  });

  describe('details', () => {
    it('should return successfully', async () => {
      const query: DashboardIDRequest = {
        id: dashboard1.id,
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/details')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      response.body.create_time = new Date(response.body.create_time);
      response.body.update_time = new Date(response.body.update_time);
      expect(response.body).toMatchObject(dashboard1);
    });

    it('should fail', async () => {
      const query: DashboardIDRequest = {
        id: notFoundId,
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/details')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      expect(response.body.code).toEqual('NOT_FOUND');
      expect(response.body.detail.message).toContain('Could not find any entity of type "Dashboard" matching');
      expect(response.body.detail.message).toContain(notFoundId);
    });
  });

  describe('getByName', () => {
    it('should return successfully', async () => {
      const query: DashboardNameRequest = {
        name: dashboard1.name,
        is_preset: dashboard1.is_preset,
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/detailsByName')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      response.body.create_time = new Date(response.body.create_time);
      response.body.update_time = new Date(response.body.update_time);
      expect(response.body).toMatchObject(response.body);
    });

    it('should fail', async () => {
      const query: DashboardNameRequest = {
        name: dashboard1.name,
        is_preset: !dashboard1.is_preset,
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/detailsByName')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      expect(response.body.code).toEqual('NOT_FOUND');
      expect(response.body.detail.message).toContain('Could not find any entity of type "Dashboard" matching');
      expect(response.body.detail.message).toContain(`"name": "${dashboard1.name}"`);
      expect(response.body.detail.message).toContain('"is_preset": true');
    });
  });

  describe('update', () => {
    it('should update successfully', async () => {
      const query: DashboardUpdateRequest = {
        id: dashboard2.id,
        name: 'dashboard2_updated',
        is_removed: true,
        content: { tmp: 'tmp' },
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .put('/dashboard/update')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      response.body.create_time = new Date(response.body.create_time);
      expect(response.body).toMatchObject({
        ...dashboard2,
        name: 'dashboard2_updated',
        is_removed: true,
        content: { tmp: 'tmp' },
        update_time: response.body.update_time,
      });
    });

    it('should fail if not found', async () => {
      const query: DashboardUpdateRequest = {
        id: notFoundId,
        name: 'not_found',
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .put('/dashboard/update')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      expect(response.body.code).toEqual('NOT_FOUND');
      expect(response.body.detail.message).toContain('Could not find any entity of type "Dashboard" matching');
      expect(response.body.detail.message).toContain(notFoundId);
    });

    it('should update preset dashboard successfully', async () => {
      const query: DashboardUpdateRequest = {
        id: presetDashboard.id,
        name: 'preset_updated',
        is_removed: false,
        content: { tmp: 'tmp' },
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .put('/dashboard/update')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      response.body.create_time = new Date(response.body.create_time);
      expect(response.body).toMatchObject({
        ...presetDashboard,
        name: 'preset_updated',
        is_removed: false,
        content: { tmp: 'tmp' },
        update_time: response.body.update_time,
      });
    });

    it('should fail if not SUPERADMIN', async () => {
      const authentication = createAuthStruct(apiKey, {
        id: presetDashboard.id,
        name: 'preset_updated',
        is_removed: false,
        content: { tmp: 'tmp' },
      });
      validate.mockReturnValueOnce(authentication);

      const query: DashboardUpdateRequest = {
        id: presetDashboard.id,
        name: 'preset_updated',
        is_removed: false,
        content: { tmp: 'tmp' },
        authentication,
      };
      validate.mockReturnValueOnce(query);

      const response = await server.put('/dashboard/update').send(query);

      expect(response.body).toMatchObject({
        code: 'BAD_REQUEST',
        detail: { message: 'Only superadmin can edit preset dashboards' },
      });
    });
  });

  describe('delete', () => {
    it('should delete successfully', async () => {
      const query: DashboardIDRequest = {
        id: dashboard1.id,
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/delete')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      response.body.create_time = new Date(response.body.create_time);
      expect(response.body).toMatchObject({
        ...dashboard1,
        is_removed: true,
        update_time: response.body.update_time,
      });
    });

    it('should fail if not found', async () => {
      const query: DashboardIDRequest = {
        id: notFoundId,
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/delete')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      expect(response.body.code).toEqual('NOT_FOUND');
      expect(response.body.detail.message).toContain('Could not find any entity of type "Dashboard" matching');
      expect(response.body.detail.message).toContain(notFoundId);
    });

    it('should delete preset dashboard successfully if SUPERADMIN', async () => {
      const query: DashboardIDRequest = {
        id: presetDashboard.id,
      };
      validate.mockReturnValueOnce(query);

      const response = await server
        .post('/dashboard/delete')
        .set('Authorization', `Bearer ${superadminLogin.token}`)
        .send(query);

      response.body.create_time = new Date(response.body.create_time);
      expect(response.body).toMatchObject({
        ...presetDashboard,
        name: 'preset_updated',
        is_removed: true,
        update_time: response.body.update_time,
      });
    });

    it('should fail to delete preset dashboard if not SUPERADMIN', async () => {
      const authentication = createAuthStruct(apiKey, { id: presetDashboard.id });
      validate.mockReturnValueOnce(authentication);

      const query: DashboardUpdateRequest = {
        id: presetDashboard.id,
        authentication,
      };
      validate.mockReturnValueOnce(query);

      const response = await server.post('/dashboard/delete').send(query);

      expect(response.body).toMatchObject({
        code: 'BAD_REQUEST',
        detail: { message: 'Only superadmin can delete preset dashboards' },
      });
    });
  });
});