import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { useChains } from './ChainProvider';
import { useConnections } from './ConnectionProvider';
import { useRuntimeProvider } from './RuntimeProvider';
import { Chain, ChainAsset, ConnectionState, Connection, ConnectionRequest, RuntimeMetadata } from './types';
import { ChainId } from '@common/types';

type ChainRegistryContextProps = {
	getAllChains: () => Promise<Chain[]>;
  	getAssetBySymbol: (symbol: string) => Promise<ChainAsset | undefined>;
	getConnection: (chainId: ChainId) => Connection | undefined;
	connectionStates: (Record<ChainId, ConnectionState>);
}

const ChainRegistryContext = createContext<ChainRegistryContextProps>({} as ChainRegistryContextProps);

export const ChainRegistry = ({ children }: PropsWithChildren) => {
	const { getAllChains, getAssetBySymbol } = useChains();
	const { connectionStates, createConnections, getConnection } = useConnections();
	const { getMetadata, subscribeMetadata } = useRuntimeProvider();

	useEffect(() => {
    	(async () => {
      		await setupConnections();
    	})();
  	}, []);

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
				}
			}
		});

		createConnections(requests);
	}

	return (
    	<ChainRegistryContext.Provider value={{ getAllChains, getAssetBySymbol, getConnection, connectionStates }}>
      		{children}
    	</ChainRegistryContext.Provider>
  	);
};

export const useChainRegistry = () => useContext<ChainRegistryContextProps>(ChainRegistryContext);