import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useENSembleContext } from '../ENSembleProvider';
import { chainToNetwork } from '../utils';
import type { ENSProfile, ENSNameList } from '../types';

export interface UseENSProfileReturn {
  profile: ENSProfile | null;
  nameList: ENSNameList | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  selectName: (name: string) => Promise<void>;
  isConnected: boolean;
  address: string | undefined;
  network: string;
}

export function useENSProfile(
  initialName?: string,
  externalProfile?: ENSProfile,
): UseENSProfileReturn {
  const { client } = useENSembleContext();
  const { address, chainId, isConnected } = useAccount();
  const [profile, setProfile] = useState<ENSProfile | null>(externalProfile ?? null);
  const [nameList, setNameList] = useState<ENSNameList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const network = chainToNetwork(chainId);

  const refresh = useCallback(async () => {
    if (!address) return;
    setIsLoading(true);
    setError(null);
    try {
      const [prof, names] = await Promise.all([
        client.profile(address, network).catch(() => null),
        client.list(address, network).catch(() => null),
      ]);
      setProfile(prof);
      setNameList(names ?? { address, names: [], total: 0, network });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ENS data');
    } finally {
      setIsLoading(false);
    }
  }, [address, network, client]);

  const selectName = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const prof = await client.profile(name, network);
      setProfile(prof);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [network, client]);

  // When an initialName is provided, fetch that profile on mount
  useEffect(() => {
    if (initialName) {
      selectName(initialName);
      return;
    }
    // If an externalProfile was provided, skip auto-fetch
    if (externalProfile) return;

    if (isConnected && address) {
      refresh();
    } else {
      setProfile(null);
      setNameList(null);
    }
  }, [isConnected, address, refresh, initialName, externalProfile, selectName]);

  return { profile, nameList, isLoading, error, refresh, selectName, isConnected, address, network };
}
