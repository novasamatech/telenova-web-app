import { type PropsWithChildren, createContext, useContext, useEffect, useRef, useState } from 'react';

import { type ChainId, type StateResolution } from '@/common/types';

import { useChains } from './ChainProvider';
import { useConnections } from './ConnectionProvider';
import { useRuntimeProvider } from './RuntimeProvider';
import {
  type Asset,
  type Chain,
  type ChainAsset,
  type Connection,
  type ConnectionRequest,
  type ConnectionState,
  type RuntimeMetadata,
} from './types';

type ChainRegistryContextProps = {
  getAllChains: () => Promise<Chain[]>;
  getAssetBySymbol: (symbol: string) => Promise<ChainAsset>;
  getAssetByChainId: (assetId: string, chainId: ChainId) => Asset | undefined;
  getChain: (chainId: ChainId) => Promise<Chain | undefined>;
  getConnection: (chainId: ChainId) => Promise<Connection>;
  connectionStates: Record<ChainId, ConnectionState>;
};

const ChainRegistryContext = createContext<ChainRegistryContextProps>({} as ChainRegistryContextProps);

export const ChainRegistry = ({ children }: PropsWithChildren) => {
  const { getAllChains, getAssetBySymbol, getChain, getAssetByChainId } = useChains();
  const { connectionStates, createConnections, getConnection } = useConnections();
  const { getMetadata, subscribeMetadata } = useRuntimeProvider();

  const [isRegistryReady, setIsRegistryReady] = useState(false);

  const setupWaiters = useRef<StateResolution<void>[]>([]);

  useEffect(() => {
    setupConnections().then(() => setIsRegistryReady(true));
  }, []);

  useEffect(() => {
    if (!isRegistryReady) {
      return;
    }

    const waiters = setupWaiters.current;
    setupWaiters.current = [];

    for (const waiter of waiters) {
      waiter.resolve();
    }
  }, [isRegistryReady, setupWaiters.current]);

  async function isReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (isRegistryReady) {
        resolve();
      } else {
        setupWaiters.current.push({ resolve, reject });
      }
    });
  }

  const getReadyConnection = async (chainId: ChainId): Promise<Connection> => {
    await isReady();

    return getConnection(chainId);
  };

  const setupConnections = async () => {
    const chains = await getAllChains();

    const requests: ConnectionRequest[] = chains.map(chain => {
      return {
        chain: chain,
        onConnected: (chainId, connection) => {
          console.info('🟢 connected ==> ', chainId);

          subscribeMetadata(connection.api);
        },
        onDisconnected: chainId => {
          console.info('🔶 disconnected ==> ', chainId);
        },
        getMetadata: (chainId): Promise<RuntimeMetadata | undefined> => {
          return getMetadata(chainId);
        },
      };
    });

    createConnections(requests);
  };

  return (
    <ChainRegistryContext.Provider
      value={{
        getAllChains,
        getAssetBySymbol,
        getChain,
        getConnection: getReadyConnection,
        getAssetByChainId,
        connectionStates,
      }}
    >
      {children}
    </ChainRegistryContext.Provider>
  );
};

export const useChainRegistry = () => useContext<ChainRegistryContextProps>(ChainRegistryContext);
