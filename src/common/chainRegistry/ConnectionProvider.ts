import { useRef, useState } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ProviderInterface } from '@polkadot/rpc-provider/types';

import {
  ConnectionRequest,
  ConnectionState,
  ConnectionStatus,
  Connection,
  IChainConnectionService,
  RpcNode,
  createCachedProvider,
} from '@common/chainRegistry';
import { ChainId, StateResolution } from '@common/types';

const CONNECTION_RETRY_DELAY = 2000;

type InternalStateResolution = StateResolution<Connection>;

type InternalConnectionState = {
  request: ConnectionRequest;
  activeNodeIndex?: number;
  timeoutId?: any;
  connection?: Connection;
  connectionPromises: InternalStateResolution[];
};

export const useConnections = (): IChainConnectionService => {
  const internalStates = useRef<Record<ChainId, InternalConnectionState>>({});
  const [connectionStates, setConnectionStates] = useState<Record<ChainId, ConnectionState>>({});

  async function storeOrResolveConnection(chainId: ChainId, resolution: InternalStateResolution): Promise<void> {
    const state = internalStates.current[chainId];

    if (!state) {
      throw Error(`Connection is not set for chain ${chainId}`);
    }

    const connection = state.connection;

    if (connection) {
      await connection.api.isReady;
      resolution.resolve(connection);
    } else {
      state.connectionPromises.push(resolution);
    }
  }

  const getConnection = (chainId: ChainId): Promise<Connection> => {
    return new Promise<Connection>(function (resolve, reject) {
      storeOrResolveConnection(chainId, { resolve, reject });
    });
  };

  const createConnections = (requests: ConnectionRequest[]) => {
    const newConnectionStates = requests.reduce<Record<ChainId, ConnectionState>>((acc, { chain }) => {
      const { chainId } = chain;

      const newState: ConnectionState = {
        chainId: chainId,
        connectionStatus: ConnectionStatus.NONE,
      };

      acc[chainId] = newState;

      return acc;
    }, connectionStates);

    setConnectionStates(newConnectionStates);

    const newInternalStates = requests.reduce<Record<ChainId, InternalConnectionState>>((acc, request) => {
      const newState: InternalConnectionState = {
        request: request,
        connectionPromises: [],
      };

      acc[request.chain.chainId] = newState;

      return acc;
    }, internalStates.current);

    internalStates.current = newInternalStates;

    requests.forEach(function (request) {
      connectToChain(request.chain.chainId, request.chain.nodes);
    });
  };

  const connectToChain = async (chainId: ChainId, nodes: RpcNode[]): Promise<void> => {
    console.info(`🔶 Connecting ==> ${chainId}`);

    const provider = createWebsocketProvider(
      nodes.map((node) => node.url),
      chainId,
    );

    if (provider) {
      const api = new ApiPromise({ provider, throwOnConnect: false, throwOnUnknown: true });

      if (api) {
        const connection: Connection = {
          api: api,
        };

        updateInternalState(chainId, { connection: connection });

        subscribeConnected(chainId, api);
        subscribeDisconnected(chainId, api);
        subscribeError(chainId, api);
      } else {
        console.info('🔴 no connection provider ==> ', chainId);

        updateConnectionState(chainId, { connectionStatus: ConnectionStatus.ERROR });

        updateInternalState(chainId, { connection: undefined });
      }
    } else {
      updateConnectionState(chainId, {
        connectionStatus: ConnectionStatus.ERROR,
      });
    }

    decideConnectionPromises(chainId);
  };

  const createWebsocketProvider = (rpcUrls: string[], chainId: ChainId): ProviderInterface => {
    const getMetadata = internalStates.current[chainId]?.request.getMetadata;

    const CachedWsProvider = createCachedProvider(WsProvider, chainId, getMetadata);

    return new CachedWsProvider(rpcUrls, CONNECTION_RETRY_DELAY);
  };

  const subscribeConnected = (chainId: ChainId, api: ApiPromise) => {
    const handler = async () => {
      console.info('🟢 connection provider received ==> ', chainId);

      updateConnectionState(chainId, { connectionStatus: ConnectionStatus.CONNECTED });

      const connection = internalStates.current[chainId]?.connection;

      if (connection) {
        notifyConnected(chainId, connection);
      }
    };

    api.on('ready', handler);
  };

  const subscribeDisconnected = (chainId: ChainId, api: ApiPromise) => {
    const handler = async () => {
      notifyDisconnected(chainId);
    };

    api.on('disconnected', handler);
  };

  const subscribeError = (chainId: ChainId, api: ApiPromise) => {
    const handler = () => {
      console.info('🔴 error ==> ', chainId);

      updateConnectionState(chainId, { connectionStatus: ConnectionStatus.ERROR });
    };

    api.on('error', handler);
  };

  const notifyConnected = (chainId: ChainId, connection: Connection) => {
    internalStates.current[chainId]?.request.onConnected(chainId, connection);
  };

  const notifyDisconnected = (chainId: ChainId) => {
    internalStates.current[chainId]?.request.onDisconnected(chainId);
  };

  const decideConnectionPromises = (chainId: ChainId): void => {
    const state = internalStates.current[chainId];

    if (!state) {
      return;
    }

    const promises = state.connectionPromises;

    updateInternalState(chainId, { connectionPromises: [] });

    const connection = state.connection;

    promises.forEach((promise) => {
      if (connection) {
        promise.resolve(connection);
      } else {
        promise.reject();
      }
    });
  };

  const updateConnectionState = (chainId: ChainId, updates: Partial<ConnectionState>) => {
    setConnectionStates((currentStates) => {
      const currentState = currentStates[chainId];

      if (currentState) {
        const updatedState = { ...currentState, ...updates };

        return {
          ...currentStates,
          [chainId]: updatedState,
        };
      } else {
        return currentStates;
      }
    });
  };

  const updateInternalState = (chainId: ChainId, updates: Partial<InternalConnectionState>) => {
    const currentState = internalStates.current[chainId];

    if (currentState) {
      internalStates.current[chainId] = { ...currentState, ...updates };
    }
  };

  return {
    connectionStates,
    getConnection,
    createConnections,
  };
};
