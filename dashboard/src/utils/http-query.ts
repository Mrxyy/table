import { AxiosRequestConfig } from 'axios';
import dayjs from 'dayjs';
import lodash from 'lodash';
import numbro from 'numbro';
import { IDataSource } from '~/api-caller/types';
import { ContextInfoType, FilterValuesType } from '..';
import CryptoJS from 'crypto-js';

export const functionUtils = {
  CryptoJS,
  dayjs,
  lodash,
  numbro,
};

export function buildHTTPRequest(
  pre_process: string,
  params: { context: Record<string, any>; filters: Record<string, any> },
) {
  return new Function(`return ${pre_process}`)()(params, functionUtils) as AxiosRequestConfig;
}

export function getHTTPReqeustBuilderParams(
  real_context: ContextInfoType,
  mock_context: Record<string, $TSFixMe>,
  filterValues: FilterValuesType,
) {
  const context = {
    ...mock_context,
    ...real_context,
  };
  return {
    context,
    filters: filterValues,
  };
}

export function explainHTTPRequest(
  pre_process: string,
  context: ContextInfoType,
  mock_context: Record<string, $TSFixMe>,
  filterValues: FilterValuesType,
) {
  const params = getHTTPReqeustBuilderParams(context, mock_context, filterValues);
  return buildHTTPRequest(pre_process, params);
}

export function preProcessWithDataSource(datasource: IDataSource, config: AxiosRequestConfig) {
  try {
    return new Function(`return ${datasource.config.processing.pre}`)()(config, functionUtils);
  } catch (error) {
    console.error(error);
    return config;
  }
}
export function postProcessWithDataSource(datasource: IDataSource, res: any) {
  try {
    return new Function(`return ${datasource.config.processing.post}`)()(res, functionUtils);
  } catch (error) {
    console.error(error);
    return res;
  }
}
export function postProcessWithQuery(post_process: TFunctionString, res: any) {
  try {
    return new Function(`return ${post_process}`)()(res, functionUtils);
  } catch (error) {
    console.error(error);
    return res;
  }
}