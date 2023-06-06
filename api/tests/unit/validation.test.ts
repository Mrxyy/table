import {
  AccountChangePasswordRequest,
  AccountCreateRequest,
  AccountEditRequest,
  AccountIDRequest,
  AccountListRequest,
  AccountLoginRequest,
  AccountUpdateRequest,
} from '~/api_models/account';
import { ApiKeyCreateRequest, ApiKeyIDRequest, ApiKeyListRequest } from '~/api_models/api';
import {
  DashboardCreateRequest,
  DashboardIDRequest,
  DashboardListRequest,
  DashboardNameRequest,
  DashboardUpdateRequest,
} from '~/api_models/dashboard';
import {
  DataSourceCreateRequest,
  DataSourceIDRequest,
  DataSourceListRequest,
  DataSourceRenameRequest,
} from '~/api_models/datasource';
import { JobListRequest, JobRunRequest } from '~/api_models/job';
import { QueryRequest } from '~/api_models/query';
import { ROLE_TYPES } from '~/api_models/role';
import { ConfigGetRequest, ConfigUpdateRequest } from '~/api_models/config';
import { DashboardChangelogListRequest } from '~/api_models/dashboard_changelog';
import {
  DashboardPermissionListRequest,
  DashboardOwnerUpdateRequest,
  DashboardPermissionUpdateRequest,
} from '~/api_models/dashboard_permission';
import { DashboardContentChangelogListRequest } from '~/api_models/dashboard_content_changelog';
import {
  DashboardContentListRequest,
  DashboardContentCreateRequest,
  DashboardContentIDRequest,
  DashboardContentUpdateRequest,
} from '~/api_models/dashboard_content';
import {
  CustomFunctionListRequest,
  CustomFunctionCreateOrUpdateRequest,
  CustomFunctionIDRequest,
} from '~/api_models/custom_function';
import { SqlSnippetListRequest, SqlSnippetCreateOrUpdateRequest, SqlSnippetIDRequest } from '~/api_models/sql_snippet';
import { ApiError } from '~/utils/errors';
import { validateClass } from '~/middleware/validation';
import { VALIDATION_FAILED } from '~/utils/errors';
import { DEFAULT_LANGUAGE } from '~/utils/constants';
import * as crypto from 'crypto';

describe('validation', () => {
  describe('AccountController', () => {
    describe('AccountLoginRequest', () => {
      it('Should have no validation errors', () => {
        const data: AccountLoginRequest = {
          name: 'test',
          password: 'test',
        };

        const result = validateClass(AccountLoginRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(AccountLoginRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(AccountLoginRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'name',
              children: [],
              constraints: { isString: 'name must be a string' },
            },
            {
              target: {},
              value: undefined,
              property: 'password',
              children: [],
              constraints: { isString: 'password must be a string' },
            },
          ]);
        }
      });
    });

    describe('AccountListRequest', () => {
      it('Should have no validation errors', () => {
        const data: AccountListRequest = {
          pagination: { page: 1, pagesize: 20 },
          sort: [{ field: 'create_time', order: 'ASC' }],
          filter: { name: { value: '', isFuzzy: true }, email: { value: '', isFuzzy: true } },
        };

        const result = validateClass(AccountListRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Empty request should also have no validation errors', () => {
        const data = {};
        const result = validateClass(AccountListRequest, data);
        expect(result).toMatchObject({
          sort: [{ field: 'create_time', order: 'ASC' }],
          pagination: { page: 1, pagesize: 20 },
        });
      });

      it('Should have validation errors', () => {
        const data = {
          pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
        };
        expect(() => validateClass(AccountListRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(AccountListRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                sort: [{ field: 'create_time', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: { incorrect_page: 1, incorrect_pageSize: 20 },
              property: 'pagination',
              children: [
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'page',
                  children: [],
                  constraints: { isInt: 'page must be an integer number' },
                },
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'pagesize',
                  children: [],
                  constraints: { isInt: 'pagesize must be an integer number' },
                },
              ],
            },
          ]);
        }
      });
    });

    describe('AccountCreateRequest', () => {
      it('Should have no validation errors', () => {
        const data: AccountCreateRequest = {
          name: 'test',
          password: 'test1234',
          role_id: ROLE_TYPES.AUTHOR,
        };

        const result = validateClass(AccountCreateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(AccountCreateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(AccountCreateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'name',
              children: [],
              constraints: {
                isLength: 'name must be longer than or equal to 1 characters',
                isString: 'name must be a string',
              },
            },
            {
              target: {},
              value: undefined,
              property: 'password',
              children: [],
              constraints: {
                isLength: 'password must be longer than or equal to 8 characters',
                isString: 'password must be a string',
              },
            },
            {
              target: {},
              value: undefined,
              property: 'role_id',
              children: [],
              constraints: {
                isIn: 'role_id must be one of the following values: 10, 20, 30, 40',
                isInt: 'role_id must be an integer number',
              },
            },
          ]);
        }
      });
    });

    describe('AccountUpdateRequest', () => {
      it('Should have no validation errors', () => {
        const data: AccountUpdateRequest = {};

        const result = validateClass(AccountUpdateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data: AccountUpdateRequest = {
          name: '',
          email: '',
        };
        expect(() => validateClass(AccountUpdateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(AccountUpdateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                email: '',
                name: '',
              },
              value: '',
              property: 'name',
              children: [],
              constraints: {
                isLength: 'name must be longer than or equal to 1 characters',
              },
            },
            {
              target: {
                email: '',
                name: '',
              },
              value: '',
              property: 'email',
              children: [],
              constraints: {
                isLength: 'email must be longer than or equal to 1 characters',
              },
            },
          ]);
        }
      });
    });

    describe('AccountEditRequest', () => {
      it('Should have no validation errors', () => {
        const data: AccountEditRequest = {
          id: crypto.randomUUID(),
        };

        const result = validateClass(AccountEditRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data: AccountEditRequest = {
          id: null,
          name: '',
          role_id: 0,
        };
        expect(() => validateClass(AccountEditRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(AccountEditRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                id: null,
                name: '',
                role_id: 0,
              },
              value: null,
              property: 'id',
              children: [],
              constraints: { isUuid: 'id must be a UUID' },
            },
            {
              target: {
                id: null,
                name: '',
                role_id: 0,
              },
              value: '',
              property: 'name',
              children: [],
              constraints: {
                isLength: 'name must be longer than or equal to 1 characters',
              },
            },
            {
              target: {
                id: null,
                name: '',
                role_id: 0,
              },
              value: 0,
              property: 'role_id',
              children: [],
              constraints: {
                isIn: 'role_id must be one of the following values: 10, 20, 30, 40',
              },
            },
          ]);
        }
      });
    });

    describe('AccountChangePasswordRequest', () => {
      it('Should have no validation errors', () => {
        const data: AccountChangePasswordRequest = {
          new_password: 'test1234_new',
          old_password: 'test1234',
        };

        const result = validateClass(AccountChangePasswordRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(AccountChangePasswordRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(AccountChangePasswordRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'old_password',
              children: [],
              constraints: {
                isString: 'old_password must be a string',
              },
            },
            {
              target: {},
              value: undefined,
              property: 'new_password',
              children: [],
              constraints: {
                isString: 'new_password must be a string',
              },
            },
          ]);
        }
      });
    });

    describe('AccountIDRequest', () => {
      it('Should have no validation errors', () => {
        const data: AccountIDRequest = {
          id: crypto.randomUUID(),
        };

        const result = validateClass(AccountIDRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(AccountIDRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(AccountIDRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isUuid: 'id must be a UUID' },
            },
          ]);
        }
      });
    });
  });

  describe('APIController', () => {
    describe('ApiKeyListRequest', () => {
      it('Should have no validation errors', () => {
        const data: ApiKeyListRequest = {
          pagination: { page: 1, pagesize: 20 },
          sort: [{ field: 'create_time', order: 'ASC' }],
          filter: { name: { value: '', isFuzzy: true } },
        };

        const result = validateClass(ApiKeyListRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Empty request should also have no validation errors', () => {
        const data = {};
        const result = validateClass(ApiKeyListRequest, data);
        expect(result).toMatchObject({
          sort: [{ field: 'create_time', order: 'ASC' }],
          pagination: { page: 1, pagesize: 20 },
        });
      });

      it('Should have validation errors', () => {
        const data = {
          pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
        };
        expect(() => validateClass(ApiKeyListRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(ApiKeyListRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                sort: [{ field: 'create_time', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: { incorrect_page: 1, incorrect_pageSize: 20 },
              property: 'pagination',
              children: [
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'page',
                  children: [],
                  constraints: { isInt: 'page must be an integer number' },
                },
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'pagesize',
                  children: [],
                  constraints: { isInt: 'pagesize must be an integer number' },
                },
              ],
            },
          ]);
        }
      });
    });

    describe('ApiKeyListRequest', () => {
      it('Should have no validation errors', () => {
        const data: ApiKeyCreateRequest = {
          name: 'test',
          role_id: ROLE_TYPES.AUTHOR,
        };

        const result = validateClass(ApiKeyCreateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(ApiKeyCreateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(ApiKeyCreateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'name',
              children: [],
              constraints: {
                isLength: 'name must be longer than or equal to 1 characters',
                isString: 'name must be a string',
              },
            },
            {
              target: {},
              value: undefined,
              property: 'role_id',
              children: [],
              constraints: {
                isIn: 'role_id must be one of the following values: 10, 20, 30, 40',
                isInt: 'role_id must be an integer number',
              },
            },
          ]);
        }
      });
    });

    describe('ApiKeyIDRequest', () => {
      it('Should have no validation errors', () => {
        const data: ApiKeyIDRequest = {
          id: crypto.randomUUID(),
        };

        const result = validateClass(ApiKeyIDRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(ApiKeyIDRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(ApiKeyIDRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isUuid: 'id must be a UUID' },
            },
          ]);
        }
      });
    });
  });

  describe('DashboardController', () => {
    describe('DashboardListRequest', () => {
      it('Should have no validation errors', () => {
        const data: DashboardListRequest = {
          pagination: { page: 1, pagesize: 20 },
          sort: [{ field: 'create_time', order: 'ASC' }],
          filter: { group: { value: '', isFuzzy: true }, name: { value: '', isFuzzy: true }, is_removed: false },
        };

        const result = validateClass(DashboardListRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Empty request should also have no validation errors', () => {
        const data = {};
        const result = validateClass(DashboardListRequest, data);
        expect(result).toMatchObject({
          sort: [{ field: 'create_time', order: 'ASC' }],
          pagination: { page: 1, pagesize: 20 },
        });
      });

      it('Should have validation errors', () => {
        const data = {
          pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
        };
        expect(() => validateClass(DashboardListRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardListRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                sort: [{ field: 'create_time', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: { incorrect_page: 1, incorrect_pageSize: 20 },
              property: 'pagination',
              children: [
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'page',
                  children: [],
                  constraints: { isInt: 'page must be an integer number' },
                },
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'pagesize',
                  children: [],
                  constraints: { isInt: 'pagesize must be an integer number' },
                },
              ],
            },
          ]);
        }
      });
    });

    describe('DashboardCreateRequest', () => {
      it('Should have no validation errors', () => {
        const data: DashboardCreateRequest = {
          name: 'test',
          group: '',
        };

        const result = validateClass(DashboardCreateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(DashboardCreateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardCreateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'name',
              children: [],
              constraints: {
                isLength: 'name must be longer than or equal to 1 characters',
                isString: 'name must be a string',
              },
            },
            {
              target: {},
              value: undefined,
              property: 'group',
              children: [],
              constraints: { isString: 'group must be a string' },
            },
          ]);
        }
      });
    });

    describe('DashboardIDRequest', () => {
      it('Should have no validation errors', () => {
        const data: DashboardIDRequest = {
          id: crypto.randomUUID(),
        };

        const result = validateClass(DashboardIDRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(DashboardIDRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardIDRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isUuid: 'id must be a UUID' },
            },
          ]);
        }
      });
    });

    describe('DashboardNameRequest', () => {
      it('Should have no validation errors', () => {
        const data: DashboardNameRequest = {
          name: 'test',
          is_preset: false,
        };

        const result = validateClass(DashboardNameRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(DashboardNameRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardNameRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'name',
              children: [],
              constraints: {
                isLength: 'name must be longer than or equal to 1 characters',
                isString: 'name must be a string',
              },
            },
            {
              target: {},
              value: undefined,
              property: 'is_preset',
              children: [],
              constraints: { isBoolean: 'is_preset must be a boolean value' },
            },
          ]);
        }
      });
    });

    describe('DashboardUpdateRequest', () => {
      it('Should have no validation errors', () => {
        const data: DashboardUpdateRequest = {
          id: crypto.randomUUID(),
          content_id: crypto.randomUUID(),
          is_removed: true,
          name: 'test',
        };

        const result = validateClass(DashboardUpdateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(DashboardUpdateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardUpdateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isUuid: 'id must be a UUID' },
            },
          ]);
        }
      });
    });
  });

  describe('DataSourceController', () => {
    describe('DataSourceListRequest', () => {
      it('Should have no validation errors', () => {
        const data: DataSourceListRequest = {
          pagination: { page: 1, pagesize: 20 },
          sort: [{ field: 'create_time', order: 'ASC' }],
          filter: { key: { value: '', isFuzzy: true }, type: { value: '', isFuzzy: true } },
        };

        const result = validateClass(DataSourceListRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Empty request should also have no validation errors', () => {
        const data = {};
        const result = validateClass(DataSourceListRequest, data);
        expect(result).toMatchObject({
          sort: [{ field: 'create_time', order: 'ASC' }],
          pagination: { page: 1, pagesize: 20 },
        });
      });

      it('Should have validation errors', () => {
        const data = {
          pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
        };
        expect(() => validateClass(DataSourceListRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DataSourceListRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                sort: [{ field: 'create_time', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: { incorrect_page: 1, incorrect_pageSize: 20 },
              property: 'pagination',
              children: [
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'page',
                  children: [],
                  constraints: { isInt: 'page must be an integer number' },
                },
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'pagesize',
                  children: [],
                  constraints: { isInt: 'pagesize must be an integer number' },
                },
              ],
            },
          ]);
        }
      });
    });

    describe('DataSourceCreateRequest', () => {
      it('Should have no validation errors', () => {
        const data: DataSourceCreateRequest = {
          config: {
            host: '',
            processing: {
              pre: '',
              post: '',
            },
            database: '',
            password: '',
            port: 0,
            username: '',
          },
          key: 'test',
          type: 'postgresql',
        };

        const result = validateClass(DataSourceCreateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(DataSourceCreateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DataSourceCreateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'type',
              children: [],
              constraints: {
                isIn: 'type must be one of the following values: postgresql, mysql, http',
                isString: 'type must be a string',
              },
            },
            {
              target: {},
              value: undefined,
              property: 'key',
              children: [],
              constraints: {
                isLength: 'key must be longer than or equal to 1 characters',
                isString: 'key must be a string',
              },
            },
            {
              target: {},
              value: undefined,
              property: 'config',
              children: [],
              constraints: { isObject: 'config must be an object' },
            },
          ]);
        }
      });
    });

    describe('DataSourceRenameRequest', () => {
      it('Should have no validation errors', () => {
        const data: DataSourceRenameRequest = {
          id: crypto.randomUUID(),
          key: 'test_new',
        };

        const result = validateClass(DataSourceRenameRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(DataSourceRenameRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DataSourceRenameRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isUuid: 'id must be a UUID' },
            },
            {
              target: {},
              value: undefined,
              property: 'key',
              children: [],
              constraints: {
                isLength: 'key must be longer than or equal to 1 characters',
                isString: 'key must be a string',
              },
            },
          ]);
        }
      });
    });

    describe('DataSourceIDRequest', () => {
      it('Should have no validation errors', () => {
        const data: DataSourceIDRequest = {
          id: crypto.randomUUID(),
        };

        const result = validateClass(DataSourceIDRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(DataSourceIDRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DataSourceIDRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isUuid: 'id must be a UUID' },
            },
          ]);
        }
      });
    });
  });

  describe('JobController', () => {
    describe('JobListRequest', () => {
      it('Should have no validation errors', () => {
        const data: JobListRequest = {
          pagination: { page: 1, pagesize: 20 },
          sort: [{ field: 'create_time', order: 'ASC' }],
          filter: { status: { value: '', isFuzzy: true }, type: { value: '', isFuzzy: true } },
        };

        const result = validateClass(JobListRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Empty request should also have no validation errors', () => {
        const data = {};
        const result = validateClass(JobListRequest, data);
        expect(result).toMatchObject({
          sort: [{ field: 'create_time', order: 'ASC' }],
          pagination: { page: 1, pagesize: 20 },
        });
      });

      it('Should have validation errors', () => {
        const data = {
          pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
        };
        expect(() => validateClass(JobListRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(JobListRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                sort: [{ field: 'create_time', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: { incorrect_page: 1, incorrect_pageSize: 20 },
              property: 'pagination',
              children: [
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'page',
                  children: [],
                  constraints: { isInt: 'page must be an integer number' },
                },
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'pagesize',
                  children: [],
                  constraints: { isInt: 'pagesize must be an integer number' },
                },
              ],
            },
          ]);
        }
      });
    });

    describe('JobRunRequest', () => {
      it('Should have no validation errors', () => {
        const data: JobRunRequest = {
          type: 'RENAME_DATASOURCE',
        };

        const result = validateClass(JobRunRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(JobRunRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(JobRunRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'type',
              children: [],
              constraints: {
                isIn: 'type must be one of the following values: RENAME_DATASOURCE, FIX_DASHBOARD_PERMISSION',
              },
            },
          ]);
        }
      });
    });
  });

  describe('QueryController', () => {
    describe('QueryRequest', () => {
      it('Should have no validation errors', () => {
        const data: QueryRequest = {
          type: 'http',
          key: 'test',
          query: '',
        };

        const result = validateClass(QueryRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(QueryRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(QueryRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'type',
              children: [],
              constraints: {
                isIn: 'type must be one of the following values: postgresql, mysql, http',
              },
            },
            {
              target: {},
              value: undefined,
              property: 'key',
              children: [],
              constraints: { isString: 'key must be a string' },
            },
            {
              target: {},
              value: undefined,
              property: 'query',
              children: [],
              constraints: { isString: 'query must be a string' },
            },
          ]);
        }
      });
    });
  });

  describe('ConfigController', () => {
    describe('ConfigGetRequest', () => {
      it('Should have no validation errors', () => {
        const data: ConfigGetRequest = {
          key: 'lang',
        };
        const result = validateClass(ConfigGetRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(ConfigGetRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(ConfigGetRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'key',
              children: [],
              constraints: {
                isIn: 'key must be one of the following values: lang, website_settings, query_cache_enabled, query_cache_expire_time',
              },
            },
          ]);
        }
      });
    });

    describe('ConfigUpdateRequest', () => {
      it('Should have no validation errors', () => {
        const data: ConfigUpdateRequest = {
          key: 'lang',
          value: DEFAULT_LANGUAGE,
        };
        const result = validateClass(ConfigUpdateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(ConfigUpdateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(ConfigUpdateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'key',
              children: [],
              constraints: {
                isIn: 'key must be one of the following values: lang, website_settings, query_cache_enabled, query_cache_expire_time',
              },
            },
            {
              target: {},
              value: undefined,
              property: 'value',
              children: [],
              constraints: { isString: 'value must be a string' },
            },
          ]);
        }
      });
    });
  });

  describe('DashbboardChangelogController', () => {
    describe('DashboardChangelogListRequest', () => {
      it('Should have no validation errors', () => {
        const data: DashboardChangelogListRequest = {
          pagination: { page: 1, pagesize: 20 },
          sort: [{ field: 'create_time', order: 'ASC' }],
          filter: { dashboard_id: { value: '', isFuzzy: true } },
        };

        const result = validateClass(DashboardChangelogListRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Empty request should also have no validation errors', () => {
        const data = {};
        const result = validateClass(DashboardChangelogListRequest, data);
        expect(result).toMatchObject({
          sort: [{ field: 'create_time', order: 'ASC' }],
          pagination: { page: 1, pagesize: 20 },
        });
      });

      it('Should have validation errors', () => {
        const data = {
          pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
        };
        expect(() => validateClass(DashboardChangelogListRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardChangelogListRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                sort: [{ field: 'create_time', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: { incorrect_page: 1, incorrect_pageSize: 20 },
              property: 'pagination',
              children: [
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'page',
                  children: [],
                  constraints: { isInt: 'page must be an integer number' },
                },
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'pagesize',
                  children: [],
                  constraints: { isInt: 'pagesize must be an integer number' },
                },
              ],
            },
          ]);
        }
      });
    });
  });

  describe('DashboardPermissionController', () => {
    describe('DashboardPermissionListRequest', () => {
      it('Should have no validation errors', () => {
        const data: DashboardPermissionListRequest = {
          pagination: { page: 1, pagesize: 20 },
          sort: [{ field: 'create_time', order: 'ASC' }],
          filter: { id: { value: '', isFuzzy: true } },
        };

        const result = validateClass(DashboardPermissionListRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Empty request should also have no validation errors', () => {
        const data = {};
        const result = validateClass(DashboardPermissionListRequest, data);
        expect(result).toMatchObject({
          sort: [{ field: 'create_time', order: 'ASC' }],
          pagination: { page: 1, pagesize: 20 },
        });
      });

      it('Should have validation errors', () => {
        const data = {
          pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
        };
        expect(() => validateClass(DashboardPermissionListRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardPermissionListRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                sort: [{ field: 'create_time', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: { incorrect_page: 1, incorrect_pageSize: 20 },
              property: 'pagination',
              children: [
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'page',
                  children: [],
                  constraints: { isInt: 'page must be an integer number' },
                },
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'pagesize',
                  children: [],
                  constraints: { isInt: 'pagesize must be an integer number' },
                },
              ],
            },
          ]);
        }
      });
    });

    describe('DashboardOwnerUpdateRequest', () => {
      it('should have no validation errors', () => {
        const data: DashboardOwnerUpdateRequest = {
          id: crypto.randomUUID(),
          owner_id: crypto.randomUUID(),
          owner_type: 'ACCOUNT',
        };
        const result = validateClass(DashboardOwnerUpdateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(DashboardOwnerUpdateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardOwnerUpdateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isUuid: 'id must be a UUID' },
            },
            {
              target: {},
              value: undefined,
              property: 'owner_type',
              children: [],
              constraints: { isIn: 'owner_type must be one of the following values: ACCOUNT, APIKEY' },
            },
            {
              target: {},
              value: undefined,
              property: 'owner_id',
              children: [],
              constraints: { isUuid: 'owner_id must be a UUID' },
            },
          ]);
        }
      });
    });

    describe('DashboardPermissionUpdateRequest', () => {
      it('should have no validation errors', () => {
        const data: DashboardPermissionUpdateRequest = {
          id: crypto.randomUUID(),
          access: [{ id: crypto.randomUUID(), type: 'ACCOUNT', permission: 'VIEW' }],
        };
        const result = validateClass(DashboardPermissionUpdateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {
          access: [{ id: '', type: 'INCORRECT', permission: 'INCORRECT' }],
        };
        expect(() => validateClass(DashboardPermissionUpdateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardPermissionUpdateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isUuid: 'id must be a UUID' },
            },
            {
              target: {},
              value: [{ id: '', type: 'INCORRECT', permission: 'INCORRECT' }],
              property: 'access',
              children: [
                {
                  children: [
                    {
                      target: { id: '', type: 'INCORRECT', permission: 'INCORRECT' },
                      value: 'INCORRECT',
                      property: 'type',
                      children: [],
                      constraints: { isIn: 'type must be one of the following values: ACCOUNT, APIKEY' },
                    },
                    {
                      target: {},
                      value: '',
                      property: 'id',
                      children: [],
                      constraints: { isUuid: 'id must be a UUID' },
                    },
                    {
                      target: {},
                      value: 'INCORRECT',
                      property: 'permission',
                      children: [],
                      constraints: { isIn: 'permission must be one of the following values: VIEW, EDIT, REMOVE' },
                    },
                  ],
                  property: '0',
                  target: [{ id: '', type: 'INCORRECT', permission: 'INCORRECT' }],
                  value: { id: '', type: 'INCORRECT', permission: 'INCORRECT' },
                },
              ],
            },
          ]);
        }
      });
    });
  });

  describe('DashboardContentController', () => {
    describe('DashboardContentChangelogListRequest', () => {
      it('Should have no validation errors', () => {
        const data: DashboardContentChangelogListRequest = {
          pagination: { page: 1, pagesize: 20 },
          sort: [{ field: 'create_time', order: 'ASC' }],
          filter: { dashboard_content_id: { value: '', isFuzzy: true } },
        };

        const result = validateClass(DashboardContentChangelogListRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Empty request should also have no validation errors', () => {
        const data = {};
        const result = validateClass(DashboardContentChangelogListRequest, data);
        expect(result).toMatchObject({
          sort: [{ field: 'create_time', order: 'ASC' }],
          pagination: { page: 1, pagesize: 20 },
        });
      });

      it('Should have validation errors', () => {
        const data = {
          pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
        };
        expect(() => validateClass(DashboardContentChangelogListRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardContentChangelogListRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                sort: [{ field: 'create_time', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: { incorrect_page: 1, incorrect_pageSize: 20 },
              property: 'pagination',
              children: [
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'page',
                  children: [],
                  constraints: { isInt: 'page must be an integer number' },
                },
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'pagesize',
                  children: [],
                  constraints: { isInt: 'pagesize must be an integer number' },
                },
              ],
            },
          ]);
        }
      });
    });
  });

  describe('DashboardContentChangelogController', () => {
    describe('DashboardContentListRequest', () => {
      it('should have no validation errors', () => {
        const data: DashboardContentListRequest = {
          dashboard_id: crypto.randomUUID(),
          pagination: { page: 1, pagesize: 20 },
          sort: [{ field: 'create_time', order: 'ASC' }],
          filter: { name: { value: '', isFuzzy: true } },
        };
        const result = validateClass(DashboardContentListRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Empty request should also have no validation errors', () => {
        const data = {
          dashboard_id: crypto.randomUUID(),
        };
        const result = validateClass(DashboardContentListRequest, data);
        expect(result).toMatchObject({
          dashboard_id: data.dashboard_id,
          sort: [{ field: 'create_time', order: 'ASC' }],
          pagination: { page: 1, pagesize: 20 },
        });
      });

      it('Should have validation errors', () => {
        const data = {
          pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
        };
        expect(() => validateClass(DashboardContentListRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardContentListRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                sort: [{ field: 'create_time', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: undefined,
              property: 'dashboard_id',
              children: [],
              constraints: { isUuid: 'dashboard_id must be a UUID' },
            },
            {
              target: {
                sort: [{ field: 'create_time', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: { incorrect_page: 1, incorrect_pageSize: 20 },
              property: 'pagination',
              children: [
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'page',
                  children: [],
                  constraints: { isInt: 'page must be an integer number' },
                },
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'pagesize',
                  children: [],
                  constraints: { isInt: 'pagesize must be an integer number' },
                },
              ],
            },
          ]);
        }
      });
    });

    describe('DashboardContentCreateRequest', () => {
      it('should have no validation errors', () => {
        const data: DashboardContentCreateRequest = {
          dashboard_id: crypto.randomUUID(),
          name: 'test',
          content: {},
        };
        const result = validateClass(DashboardContentCreateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('should have validation errors', () => {
        const data = {};
        expect(() => validateClass(DashboardContentCreateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardContentCreateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'dashboard_id',
              children: [],
              constraints: { isUuid: 'dashboard_id must be a UUID' },
            },
            {
              target: {},
              value: undefined,
              property: 'name',
              children: [],
              constraints: {
                isLength: 'name must be longer than or equal to 1 characters',
                isString: 'name must be a string',
              },
            },
            {
              target: {},
              value: undefined,
              property: 'content',
              children: [],
              constraints: { isObject: 'content must be an object' },
            },
          ]);
        }
      });
    });

    describe('DashboardContentIDRequest', () => {
      it('should have no validation errors', () => {
        const data: DashboardContentIDRequest = {
          id: crypto.randomUUID(),
        };
        const result = validateClass(DashboardContentIDRequest, data);
        expect(result).toMatchObject(data);
      });

      it('should have validation errors', () => {
        const data = {};
        expect(() => validateClass(DashboardContentIDRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardContentIDRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isUuid: 'id must be a UUID' },
            },
          ]);
        }
      });
    });

    describe('DashboardContentUpdateRequest', () => {
      it('should have no validation errors', () => {
        const data: DashboardContentUpdateRequest = {
          id: crypto.randomUUID(),
          name: 'test',
          content: {},
        };
        const result = validateClass(DashboardContentUpdateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('should have validation errors', () => {
        const data = {};
        expect(() => validateClass(DashboardContentUpdateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(DashboardContentUpdateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isUuid: 'id must be a UUID' },
            },
          ]);
        }
      });
    });
  });

  describe('CustomFunctionController', () => {
    describe('CustomFunctionListRequest', () => {
      it('should have no validation errors', () => {
        const data: CustomFunctionListRequest = {
          pagination: { page: 1, pagesize: 20 },
          sort: [{ field: 'id', order: 'ASC' }],
          filter: { id: { value: '', isFuzzy: true } },
        };
        const result = validateClass(CustomFunctionListRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Empty request should also have no validation errors', () => {
        const data = {};
        const result = validateClass(CustomFunctionListRequest, data);
        expect(result).toMatchObject({
          sort: [{ field: 'id', order: 'ASC' }],
          pagination: { page: 1, pagesize: 20 },
        });
      });

      it('Should have validation errors', () => {
        const data = {
          pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
        };
        expect(() => validateClass(CustomFunctionListRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(CustomFunctionListRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                sort: [{ field: 'id', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: { incorrect_page: 1, incorrect_pageSize: 20 },
              property: 'pagination',
              children: [
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'page',
                  children: [],
                  constraints: { isInt: 'page must be an integer number' },
                },
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'pagesize',
                  children: [],
                  constraints: { isInt: 'pagesize must be an integer number' },
                },
              ],
            },
          ]);
        }
      });
    });

    describe('CustomFunctionCreateOrUpdateRequest', () => {
      it('should have no validation errors', () => {
        const data: CustomFunctionCreateOrUpdateRequest = {
          id: 'test',
          definition: '',
        };
        const result = validateClass(CustomFunctionCreateOrUpdateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(CustomFunctionCreateOrUpdateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(CustomFunctionCreateOrUpdateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isString: 'id must be a string' },
            },
            {
              target: {},
              value: undefined,
              property: 'definition',
              children: [],
              constraints: { isString: 'definition must be a string' },
            },
          ]);
        }
      });
    });

    describe('CustomFunctionIDRequest', () => {
      it('should have no validation errors', () => {
        const data: CustomFunctionIDRequest = {
          id: 'test',
        };
        const result = validateClass(CustomFunctionIDRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(CustomFunctionIDRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(CustomFunctionIDRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isString: 'id must be a string' },
            },
          ]);
        }
      });
    });
  });

  describe('SqlSnippetController', () => {
    describe('SqlSnippetListRequest', () => {
      it('should have no validation errors', () => {
        const data: SqlSnippetListRequest = {
          pagination: { page: 1, pagesize: 20 },
          sort: [{ field: 'id', order: 'ASC' }],
          filter: { id: { value: '', isFuzzy: true } },
        };
        const result = validateClass(SqlSnippetListRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Empty request should also have no validation errors', () => {
        const data = {};
        const result = validateClass(SqlSnippetListRequest, data);
        expect(result).toMatchObject({
          sort: [{ field: 'id', order: 'ASC' }],
          pagination: { page: 1, pagesize: 20 },
        });
      });

      it('Should have validation errors', () => {
        const data = {
          pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
        };
        expect(() => validateClass(SqlSnippetListRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(SqlSnippetListRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {
                sort: [{ field: 'id', order: 'ASC' }],
                pagination: { incorrect_page: 1, incorrect_pageSize: 20 },
              },
              value: { incorrect_page: 1, incorrect_pageSize: 20 },
              property: 'pagination',
              children: [
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'page',
                  children: [],
                  constraints: { isInt: 'page must be an integer number' },
                },
                {
                  target: { incorrect_page: 1, incorrect_pageSize: 20 },
                  value: undefined,
                  property: 'pagesize',
                  children: [],
                  constraints: { isInt: 'pagesize must be an integer number' },
                },
              ],
            },
          ]);
        }
      });
    });

    describe('SqlSnippetCreateOrUpdateRequest', () => {
      it('should have no validation errors', () => {
        const data: SqlSnippetCreateOrUpdateRequest = {
          id: 'test',
          content: '',
        };
        const result = validateClass(SqlSnippetCreateOrUpdateRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(SqlSnippetCreateOrUpdateRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(SqlSnippetCreateOrUpdateRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isString: 'id must be a string' },
            },
            {
              target: {},
              value: undefined,
              property: 'content',
              children: [],
              constraints: { isString: 'content must be a string' },
            },
          ]);
        }
      });
    });

    describe('SqlSnippetIDRequest', () => {
      it('should have no validation errors', () => {
        const data: SqlSnippetIDRequest = {
          id: 'test',
        };
        const result = validateClass(SqlSnippetIDRequest, data);
        expect(result).toMatchObject(data);
      });

      it('Should have validation errors', () => {
        const data = {};
        expect(() => validateClass(SqlSnippetIDRequest, data)).toThrow(
          new ApiError(VALIDATION_FAILED, { message: `request body is incorrect` }),
        );
        try {
          validateClass(SqlSnippetIDRequest, data);
        } catch (error) {
          expect(error.detail.errors).toMatchObject([
            {
              target: {},
              value: undefined,
              property: 'id',
              children: [],
              constraints: { isString: 'id must be a string' },
            },
          ]);
        }
      });
    });
  });
});
