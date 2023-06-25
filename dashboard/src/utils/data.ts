import { AnyObject } from '..';

/**
 * extract queryID & columnKey from dataKey
 * @param dataKey queryID.columnKey or queryID
 * @returns
 */
export function parseDataKey(dataKey: TDataKey) {
  const [queryID, columnKey] = dataKey.split('.');
  return { queryID, columnKey };
}

/**
 * extract rows from panel data
 * @param data TPanelData
 * @param dataKey queryID.columnKey or queryID
 */
export function extractData(data: TPanelData, dataKey: TDataKey) {
  const { queryID, columnKey } = parseDataKey(dataKey);
  if (!queryID) {
    return [];
  }
  if (!columnKey) {
    return data[queryID];
  }
  return data[queryID]?.map((d) => d[columnKey]) ?? [];
}

/**
 * extract full query data from panel data
 * @param data TPanelData
 * @param dataKey queryID.columnKey or queryID. columnKey will be ignored
 */
export function extractFullQueryData(data: TPanelData, dataKey: TDataKey) {
  const { queryID } = parseDataKey(dataKey);
  if (!queryID) {
    return [];
  }
  return data[queryID];
}

export function readColumnIgnoringQuery(row: AnyObject, dataKey: TDataKey) {
  const { queryID, columnKey } = parseDataKey(dataKey);
  return row[columnKey];
}
