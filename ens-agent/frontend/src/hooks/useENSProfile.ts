import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import {
  fetchProfile,
  fetchNameList,
  type ENSProfile,
  type ENSNameList,
} from '../lib/api';

function chainToNetwork(chainId: number | undefined): string {
  return chainId === 1 ? 'mainnet' : 'sepolia';
}

export function useENSProfile() {
  const { address, chainId, isConnected } = useAccount();
  const [profile, setProfile] = useState<ENSProfile | null>(null);
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
        fetchProfile(address, network).catch(() => null),
        fetchNameList(address, network).catch(() => null),
      ]);
      setProfile(prof);
      setNameList(names ?? { address, names: [], total: 0, network });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ENS data');
    } finally {
      setIsLoading(false);
    }
  }, [address, network]);

  const selectName = useCallback(async (name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const prof = await fetchProfile(name, network);
      setProfile(prof);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setIsLoading(false);
    }
  }, [network]);

  useEffect(() => {
    if (isConnected && address) {
      refresh();
    } else {
      setProfile(null);
      setNameList(null);
    }
  }, [isConnected, address, refresh]);

  return { profile, nameList, isLoading, error, refresh, selectName, isConnected, address, network };
}
