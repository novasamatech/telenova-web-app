declare module "remix-routes" {
  type URLSearchParamsInit = string | string[][] | Record<string, string> | URLSearchParams;
  // symbol won't be a key of SearchParams
  type IsSearchParams<T> = symbol extends keyof T ? false : true;
  
  type ExportedQuery<T> = IsSearchParams<T> extends true ? T : never;
  

  export interface Routes {
  
    "/": {
      params: never,
      query: ExportedQuery<import('../root').SearchParams>,
    };
  
    "/dashboard": {
      params: never,
      query: ExportedQuery<import('../routes/dashboard/index').SearchParams>,
    };
  
    "/exchange": {
      params: never,
      query: ExportedQuery<import('../routes/exchange/index').SearchParams>,
    };
  
    "/exchange/select": {
      params: never,
      query: ExportedQuery<import('../routes/exchange/select').SearchParams>,
    };
  
    "/exchange/widget/:chainId/:assetId": {
      params: {
        chainId: string | number;assetId: string | number;
      } ,
      query: ExportedQuery<import('../routes/exchange/widget.$chainId.$assetId').SearchParams>,
    };
  
    "/gifts": {
      params: never,
      query: ExportedQuery<import('../routes/gifts/index').SearchParams>,
    };
  
    "/gifts/details": {
      params: never,
      query: ExportedQuery<import('../routes/gifts/details').SearchParams>,
    };
  
    "/onboarding": {
      params: never,
      query: ExportedQuery<import('../routes/onboarding/index').SearchParams>,
    };
  
    "/onboarding/create-wallet": {
      params: never,
      query: ExportedQuery<import('../routes/onboarding/create-wallet').SearchParams>,
    };
  
    "/onboarding/password": {
      params: never,
      query: ExportedQuery<import('../routes/onboarding/password').SearchParams>,
    };
  
    "/onboarding/restore/:mnemonic": {
      params: {
        mnemonic: string | number;
      } ,
      query: ExportedQuery<import('../routes/onboarding/restore.$mnemonic').SearchParams>,
    };
  
    "/onboarding/start": {
      params: never,
      query: ExportedQuery<import('../routes/onboarding/start').SearchParams>,
    };
  
    "/receive/:chainId/:assetId/address": {
      params: {
        chainId: string | number;assetId: string | number;
      } ,
      query: ExportedQuery<import('../routes/receive/$chainId.$assetId.address').SearchParams>,
    };
  
    "/receive/token-select": {
      params: never,
      query: ExportedQuery<import('../routes/receive/token-select').SearchParams>,
    };
  
    "/settings": {
      params: never,
      query: ExportedQuery<import('../routes/settings/index').SearchParams>,
    };
  
    "/settings/backup": {
      params: never,
      query: ExportedQuery<import('../routes/settings/backup').SearchParams>,
    };
  
    "/settings/password/confirmation": {
      params: never,
      query: ExportedQuery<import('../routes/settings/password/confirmation').SearchParams>,
    };
  
    "/settings/password/current": {
      params: never,
      query: ExportedQuery<import('../routes/settings/password/current').SearchParams>,
    };
  
    "/settings/password/new": {
      params: never,
      query: ExportedQuery<import('../routes/settings/password/new').SearchParams>,
    };
  
    "/settings/recovery": {
      params: never,
      query: ExportedQuery<import('../routes/settings/recovery').SearchParams>,
    };
  
    "/transfer": {
      params: never,
      query: ExportedQuery<import('../routes/transfer/index').SearchParams>,
    };
  
    "/transfer/direct/:chainId/:assetId/:address/amount": {
      params: {
        chainId: string | number;assetId: string | number;address: string | number;
      } ,
      query: ExportedQuery<import('../routes/transfer/direct/$chainId.$assetId/$address.amount').SearchParams>,
    };
  
    "/transfer/direct/:chainId/:assetId/:address/confirmation": {
      params: {
        chainId: string | number;assetId: string | number;address: string | number;
      } ,
      query: ExportedQuery<import('../routes/transfer/direct/$chainId.$assetId/$address.confirmation').SearchParams>,
    };
  
    "/transfer/direct/:chainId/:assetId/:address/result": {
      params: {
        chainId: string | number;assetId: string | number;address: string | number;
      } ,
      query: ExportedQuery<import('../routes/transfer/direct/$chainId.$assetId/$address.result').SearchParams>,
    };
  
    "/transfer/direct/:chainId/:assetId/address": {
      params: {
        chainId: string | number;assetId: string | number;
      } ,
      query: ExportedQuery<import('../routes/transfer/direct/$chainId.$assetId/address').SearchParams>,
    };
  
    "/transfer/direct/token-select": {
      params: never,
      query: ExportedQuery<import('../routes/transfer/direct/token-select').SearchParams>,
    };
  
    "/transfer/gift/:chainId/:assetId/amount": {
      params: {
        chainId: string | number;assetId: string | number;
      } ,
      query: ExportedQuery<import('../routes/transfer/gift/$chainId.$assetId/amount').SearchParams>,
    };
  
    "/transfer/gift/:chainId/:assetId/create": {
      params: {
        chainId: string | number;assetId: string | number;
      } ,
      query: ExportedQuery<import('../routes/transfer/gift/$chainId.$assetId/create').SearchParams>,
    };
  
    "/transfer/gift/token-select": {
      params: never,
      query: ExportedQuery<import('../routes/transfer/gift/token-select').SearchParams>,
    };
  
  }

  type RoutesWithParams = Pick<
    Routes,
    {
      [K in keyof Routes]: Routes[K]["params"] extends Record<string, never> ? never : K
    }[keyof Routes]
  >;

  export type RouteId =
    | 'root'
    | 'routes/dashboard'
    | 'routes/dashboard/index'
    | 'routes/exchange'
    | 'routes/exchange/index'
    | 'routes/exchange/select'
    | 'routes/exchange/widget.$chainId.$assetId'
    | 'routes/gifts'
    | 'routes/gifts/details'
    | 'routes/gifts/index'
    | 'routes/onboarding'
    | 'routes/onboarding/create-wallet'
    | 'routes/onboarding/index'
    | 'routes/onboarding/password'
    | 'routes/onboarding/restore.$mnemonic'
    | 'routes/onboarding/start'
    | 'routes/receive/$chainId.$assetId.address'
    | 'routes/receive/token-select'
    | 'routes/settings'
    | 'routes/settings/backup'
    | 'routes/settings/index'
    | 'routes/settings/password/confirmation'
    | 'routes/settings/password/current'
    | 'routes/settings/password/new'
    | 'routes/settings/recovery'
    | 'routes/transfer'
    | 'routes/transfer/direct/$chainId.$assetId/$address.amount'
    | 'routes/transfer/direct/$chainId.$assetId/$address.confirmation'
    | 'routes/transfer/direct/$chainId.$assetId/$address.result'
    | 'routes/transfer/direct/$chainId.$assetId/address'
    | 'routes/transfer/direct/token-select'
    | 'routes/transfer/gift/$chainId.$assetId/amount'
    | 'routes/transfer/gift/$chainId.$assetId/create'
    | 'routes/transfer/gift/token-select'
    | 'routes/transfer/index';

  export function $path<
    Route extends keyof Routes,
    Rest extends {
      params: Routes[Route]["params"];
      query?: Routes[Route]["query"];
    }
  >(
    ...args: Rest["params"] extends Record<string, never>
      ? [route: Route, query?: Rest["query"]]
      : [route: Route, params: Rest["params"], query?: Rest["query"]]
  ): string;

  export function $params<
    Route extends keyof RoutesWithParams,
    Params extends RoutesWithParams[Route]["params"]
  >(
      route: Route,
      params: { readonly [key: string]: string | undefined }
  ): {[K in keyof Params]: string};

  export function $routeId(routeId: RouteId): RouteId;
}