import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';

import { useChains } from './ChainProvider';
import { useConnections } from './ConnectionProvider';
import { useRuntimeProvider } from './RuntimeProvider';
import { Chain, ChainAsset, ConnectionState, Connection, ConnectionRequest, RuntimeMetadata, Asset } from './types';
import { ChainId, StateResolution } from '@common/types';

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
  const [isRegistryReady, setIsRegistryReady] = useState(false);
  const { connectionStates, createConnections, getConnection } = useConnections();
  const { getMetadata, subscribeMetadata } = useRuntimeProvider();

  const setupWaiters = useRef<StateResolution<void>[]>([]);

  useEffect(() => {
    (async () => {
      await setupConnections();
      setIsRegistryReady(true);
    })();
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

    return await getConnection(chainId);
  };

  const setupConnections = async () => {
    const chains = await getAllChains();

    const requests: ConnectionRequest[] = chains.map((chain) => {
      return {
        chain: chain,
        onConnected: (chainId, connection) => {
          console.info('🟢 connected ==> ', chainId);

          subscribeMetadata(connection.api);
        },
        onDisconnected: (chainId) => {
          console.info('🔶 disconnected ==> ', chainId);
        },
        getMetadata: async (chainId): Promise<RuntimeMetadata | undefined> => {
          return await getMetadata(chainId);
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
