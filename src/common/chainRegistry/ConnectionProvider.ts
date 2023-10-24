import {ApiPromise, WsProvider} from '@polkadot/api';
import {ProviderInterface} from '@polkadot/rpc-provider/types';
import {useRef, useState} from 'react';

import {
  Chain,
  RpcNode,
  ConnectionRequest,
  ConnectionState,
  ConnectionStatus,
  Connection,
  IChainConnectionService
} from '@common/chainRegistry/types';

import {ChainId} from '@common/types';
import {createCachedProvider} from './CachedMetadataConnection';

const AUTO_BALANCE_TIMEOUT = 1000;
const MAX_ATTEMPTS = 3;
const PROGRESSION_BASE = 2;

type InternalConnectionState = {
  request: ConnectionRequest;
  activeNodeIndex?: number;
  timeoutId?: any;
  connection?: Connection;
  onConnectedUnsubscribe?: () => void;
  onDisconnectedUnsubscribe?: () => void;
  onErrorUnsubscribe?: () => void;
}

export const useConnections = (): IChainConnectionService => {
  const internalStates = useRef<Record<ChainId, InternalConnectionState>>({});
  const [connectionStates, setConnectionStates] = useState<Record<ChainId, ConnectionState>>({});

  const getConnection = (chainId: ChainId): Connection | undefined => {
    return internalStates.current[chainId]?.connection;
  }

  const createConnections = (requests: ConnectionRequest[]) => {
    const newConnectionStates = requests.reduce<Record<ChainId, ConnectionState>>((acc, {chain}) => {
      const {chainId, nodes} = chain;

      const newState: ConnectionState = {
        chainId: chainId,
        connectionStatus: ConnectionStatus.NONE
      };

      acc[chainId] = newState

      return acc;
    }, connectionStates);

    setConnectionStates(newConnectionStates);

    const newInternalStates = requests.reduce<Record<ChainId, InternalConnectionState>>((acc, request) => {
      const newState: InternalConnectionState = {
        request: request
      };

      acc[request.chain.chainId] = newState

      return acc;
    }, internalStates.current);

    internalStates.current = newInternalStates;

    requests.forEach(function (request) {
      connectWithAutoBalance(request.chain.chainId, 0);
    });
  };

  const connectWithAutoBalance = async (chainId: ChainId, attempt = 0): Promise<void> => {
    if (Number.isNaN(attempt)) attempt = 0;

    const state = internalStates.current[chainId];

    if (!state || state.request.chain.nodes.length == 0) return;

    let nodes = state.request.chain.nodes;
    let nodeIndex = state.activeNodeIndex ?? 0;

    if (attempt >= MAX_ATTEMPTS) {
      nodeIndex = (nodeIndex + 1) % nodes.length
      attempt = 0
    }

    const node = nodes[nodeIndex];

    updateConnectionState(chainId, {
      connectionStatus: ConnectionStatus.CONNECTING
    });

    updateInternalState(chainId, {
      activeNodeIndex: nodeIndex,
      timeoutId: undefined
    });

    if (attempt > 0) {
      const currentTimeout = AUTO_BALANCE_TIMEOUT * (PROGRESSION_BASE ^ attempt);

      const timeoutId = setTimeout(async () => {
        updateInternalState(chainId, {
          timeoutId: undefined
        });

        connectToChain(chainId, node, attempt);
      }, currentTimeout);

      updateInternalState(chainId, {
        timeoutId: timeoutId
      });

    } else {
      connectToChain(chainId, node, attempt);
    }
  };

  const connectToChain = async (chainId: ChainId, node: RpcNode, attempt: number): Promise<void> => {
    console.info(`🔶 Connecting with attemp ${attempt} ==> ${chainId}`);

    const provider = createWebsocketProvider(node.url, chainId);

    const onAutoBalanceError = async () => {
      await disconnectFromChain(chainId);
      await connectWithAutoBalance(chainId, attempt + 1);
    };

    if (provider) {
      subscribeConnected(chainId, provider);
      subscribeDisconnected(chainId, provider);
      subscribeError(chainId, provider, onAutoBalanceError);

      await provider.connect();
    } else {
      updateConnectionState(chainId, {
        connectionStatus: ConnectionStatus.ERROR,
      });
    }
  };

  const disconnectFromChain = async (chainId: ChainId): Promise<void> => {
    const state = internalStates.current[chainId]

    if (state) {
      try {
        const {onErrorUnsubscribe, onDisconnectedUnsubscribe, onConnectedUnsubscribe} = state;

        if (onErrorUnsubscribe) {
          onErrorUnsubscribe();
        }

        if (onDisconnectedUnsubscribe) {
          onDisconnectedUnsubscribe();
        }

        if (onConnectedUnsubscribe) {
          onConnectedUnsubscribe();
        }

        await state.connection?.api.disconnect();
      } catch (e) {
        console.warn(e);
      }

      const timeoutId = state.timeoutId

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      updateConnectionState(
        chainId,
        {
          connectionStatus: ConnectionStatus.NONE
        }
      )

      updateInternalState(
        chainId,
        {
          timeoutId: undefined,
          connection: undefined,
          onConnectedUnsubscribe: undefined,
          onDisconnectedUnsubscribe: undefined,
          onErrorUnsubscribe: undefined
        }
      )
    }
  }

  const createWebsocketProvider = (rpcUrl: string, chainId: ChainId): ProviderInterface => {
    const getMetadata = internalStates.current[chainId]?.request.getMetadata

    const CachedWsProvider = createCachedProvider(WsProvider, chainId, getMetadata);

    return new CachedWsProvider(rpcUrl, false);
  };

  const subscribeConnected = (chainId: ChainId, provider: ProviderInterface) => {
    const handler = async () => {
      const api = await ApiPromise.create({provider, throwOnConnect: true, throwOnUnknown: true});

      if (api) {
        console.info('🟢 connection provider received ==> ', chainId);

        const connection: Connection = {
          api: api
        };

        updateConnectionState(chainId, {connectionStatus: ConnectionStatus.CONNECTED});
        updateInternalState(chainId, {connection: connection});

        notifyConnected(chainId, connection);
      } else {
        console.info('🔴 no connection provider ==> ', chainId);

        updateConnectionState(chainId, {connectionStatus: ConnectionStatus.ERROR});

        updateInternalState(chainId, {connection: undefined});
      }
    };

    const unsubscribe = provider.on('connected', handler);

    updateInternalState(chainId, {
      onConnectedUnsubscribe: unsubscribe
    });
  };

  const subscribeDisconnected = (chainId: ChainId, provider: ProviderInterface) => {
    const handler = async () => {
      notifyDisconnected(chainId);
    };

    const unsubscribe = provider.on('disconnected', handler);

    updateInternalState(chainId, {
      onDisconnectedUnsubscribe: unsubscribe
    });
  };

  const subscribeError = (chainId: ChainId, provider: ProviderInterface, onError?: () => void) => {
    const handler = () => {
      console.info('🔴 error ==> ', chainId);

      updateConnectionState(chainId, {connectionStatus: ConnectionStatus.ERROR});

      onError?.();
    };

    const unsubscribe = provider.on('error', handler);

    updateInternalState(chainId, {
      onErrorUnsubscribe: unsubscribe
    });
  };

  const notifyConnected = (chainId: ChainId, connection: Connection) => {
    internalStates.current[chainId]?.request.onConnected(chainId, connection);
  }

  const notifyDisconnected = (chainId: ChainId) => {
    internalStates.current[chainId]?.request.onDisconnected(chainId);
  }

  const updateConnectionState = (
    chainId: ChainId,
    updates: Partial<ConnectionState>
  ) => {
    setConnectionStates((currentStates) => {
      const currentState = currentStates[chainId];

      if (currentState) {
        const updatedState = {...currentState, ...updates};
        return {
          ...currentStates,
          [chainId]: updatedState
        };
      } else {
        return currentStates;
      }
    });
  };

  const updateInternalState = (
    chainId: ChainId,
    updates: Partial<InternalConnectionState>
  ) => {
    const currentState = internalStates.current[chainId];

    if (currentState) {
      const updatedState = {...currentState, ...updates};

      internalStates.current[chainId] = updatedState;
    }
  }

  return {
    connectionStates,
    getConnection,
    createConnections
  };
};
