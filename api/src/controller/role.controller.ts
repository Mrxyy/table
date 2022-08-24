import * as express from 'express';
import { inject, interfaces as inverfaces } from 'inversify';
import { controller, httpGet, interfaces } from 'inversify-express-utils';
import { ApiOperationGet, ApiPath, SwaggerDefinitionConstant } from 'swagger-express-ts';
import { ROLE_TYPES } from '../api_models/role';
import Account from '../models/account';
import { RoleService } from '../services/role.service';

@ApiPath({
  path: '/role',
  name: 'Role'
})
@controller('/role')
export class RoleController implements interfaces.Controller {
  public static TARGET_NAME: string = 'Role';
  private roleService: RoleService;

  public constructor(
    @inject('Newable<RoleService>') RoleService: inverfaces.Newable<RoleService>
  ) {
    this.roleService = new RoleService();
  }

  @ApiOperationGet({
    path: '/list',
    description: 'Account roles',
    responses: {
      200: { description: 'SUCCESS', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: 'Role' },
      500: { description: 'SERVER ERROR', type: SwaggerDefinitionConstant.Response.Type.OBJECT, model: 'ApiError' },
    }
  })
  @httpGet('/list')
  public async login(req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
    try {
      const account: Account = req.body.account;
      this.roleService.checkPermission(account, ROLE_TYPES.INACTIVE);
      const result = await this.roleService.list();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}