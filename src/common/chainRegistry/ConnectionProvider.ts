import { ApiPromise, WsProvider } from '@polkadot/api';
import { ProviderInterface } from '@polkadot/rpc-provider/types';
import { useRef, useState } from 'react';

import { 
  Chain, 
  RpcNode, 
  ConnectionRequest,
  ConnectionState, 
  ConnectionStatus, 
  Connection,
  IChainConnectionService 
} from '@common/chainRegistry/types';

import { ChainId } from '@common/types';
import { createCachedProvider } from './CachedMetadataConnection';

const AUTO_BALANCE_TIMEOUT = 1000;
const MAX_ATTEMPTS = 3;
const PROGRESSION_BASE = 2;

export const useConnections = (): IChainConnectionService => {
  const connectionRequests = useRef<Record<ChainId, ConnectionRequest>>({});
  const [connectionStates, setConnectionStates] = useState<Record<ChainId, ConnectionState>>({});

  const getConnection = (chainId: ChainId): Connection | undefined => {
    return connectionStates[chainId]?.connection;
  } 

  const createConnections = (requests: ConnectionRequest[]) => {
    const newConnectionRequests = requests.reduce<Record<ChainId, ConnectionRequest>>((acc, request) => {
      acc[request.chain.chainId] = request;

      return acc;
    }, connectionRequests.current);

    connectionRequests.current = newConnectionRequests

    const newConnectionStates = requests.reduce<Record<ChainId, ConnectionState>>((acc, { chain }) => {
      const { chainId, nodes } = chain;

      const newState: ConnectionState = {
        chainId: chainId,
        connectionStatus: ConnectionStatus.NONE,
        allNodes: nodes
      };

      acc[chainId] = newState

      return acc;
    }, connectionStates);

    setConnectionStates(newConnectionStates);

    Object.values(connectionStates).forEach(function (state) {
        if (state.connectionStatus == ConnectionStatus.NONE) {
            connectWithAutoBalance(state.chainId, 0);
        }
    });
  };

  const connectWithAutoBalance = async (chainId: ChainId, attempt = 0): Promise<void> => {
    if (Number.isNaN(attempt)) attempt = 0;

    const state = connectionStates[chainId];

    if (!state || state.allNodes.length == 0) return;

    let nodeIndex = state.actionNodeIndex ?? 0;

    if (attempt >= MAX_ATTEMPTS) {
      nodeIndex = (nodeIndex + 1) % state.allNodes.length
      attempt = 0
    }

    const node = state.allNodes[nodeIndex];

    updateConnectionState(chainId, {
      actionNodeIndex: nodeIndex,
      connectionStatus: ConnectionStatus.CONNECTING,
      timeoutId: undefined
    });

    if (attempt > 0) {
      const currentTimeout = AUTO_BALANCE_TIMEOUT * (PROGRESSION_BASE ^ attempt);

      const timeoutId = setTimeout(async () => {
        updateConnectionState(chainId, {
          timeoutId: undefined
        });

        connectToChain(chainId, node, attempt);
      }, currentTimeout);

      updateConnectionState(chainId, {
        timeoutId: timeoutId
      });

    } else {
      connectToChain(chainId, node, attempt);
    }
  };

  const connectToChain = async (chainId: ChainId, node: RpcNode, attempt: number): Promise<void> => {
    const provider = createWebsocketProvider(node.url, chainId);

    const onAutoBalanceError = async () => {
      await disconnectFromChain(chainId);
      await connectWithAutoBalance(chainId, attempt + 1);
    };

    if (provider) {
      subscribeConnected(chainId, provider);
      subscribeDisconnected(chainId, provider);
      subscribeError(chainId, provider, onAutoBalanceError);
    } else {
      updateConnectionState(chainId, {
        connectionStatus: ConnectionStatus.ERROR,
      });
    }
  };

  const disconnectFromChain = async (chainId: ChainId): Promise<void> => {
    const state = connectionStates[chainId]

    if (state) {
      try {
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
          connectionStatus: ConnectionStatus.NONE,
          timeoutId: undefined,
          connection: undefined
        }
      )
    }
  }

  const createWebsocketProvider = (rpcUrl: string, chainId: ChainId): ProviderInterface => {
    const getMetadata = connectionRequests.current[chainId]?.getMetadata

    const CachedWsProvider = createCachedProvider(WsProvider, chainId, getMetadata);

    return new CachedWsProvider(rpcUrl, 2000);
  };

  const subscribeConnected = (chainId: ChainId, provider: ProviderInterface) => {
    const handler = async () => {
      console.info('🟢 connected ==> ', chainId);

      const api = await ApiPromise.create({ provider, throwOnConnect: true, throwOnUnknown: true });
      if (api) {
        updateConnectionState(
          chainId,
          {
            connectionStatus: ConnectionStatus.CONNECTED,
            connection: {
              api: api
            }
          }
        );

        notifyConnected(chainId);
      } else {
        await provider.disconnect();

        updateConnectionState(
          chainId,
          {
            connectionStatus: ConnectionStatus.ERROR,
            connection: undefined
          }
        )
      }
    };

    provider.on('connected', handler);
  };

  const subscribeDisconnected = (chainId: ChainId, provider: ProviderInterface) => {
    const handler = async () => {
      console.info('🔶 disconnected ==> ', chainId);

      notifyDisconnected(chainId);
    };

    provider.on('disconnected', handler);
  };

  const subscribeError = (chainId: ChainId, provider: ProviderInterface, onError?: () => void) => {
    const handler = () => {
      console.info('🔴 error ==> ', chainId);

      updateConnectionState(chainId, {
        connectionStatus: ConnectionStatus.ERROR,
      });

      onError?.();
    };

    provider.on('error', handler);
  };

  const notifyConnected = (chainId: ChainId) => {
    const connection = getConnection(chainId);

    if (connection) {
        connectionRequests.current[chainId]?.onConnected(chainId, connection);
    }
  }

  const notifyDisconnected = (chainId: ChainId) => {
      connectionRequests.current[chainId]?.onDisconnected(chainId);
  }

  const updateConnectionState = (
    chainId: ChainId,
    updates: Partial<ConnectionState>
  ) => {
    setConnectionStates((currentStates) => {
      const currentState = currentStates[chainId];

      if (currentState) {
        const updatedState = {...currentState, updates };

        return {
          ...currentStates,
          [chainId]: updatedState
        };
      } else {
        return currentStates;
      }
    });
  };

  return {
    getConnection,
    createConnections
  };
};
