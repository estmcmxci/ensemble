import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useENSembleContext } from '../ENSembleProvider';
import { chainToNetwork } from '../utils';
import type { ENSProfile, SearchResult } from '../types';

export interface UseENSSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  result: SearchResult | null;
  isSearching: boolean;
  error: string | null;
  clear: () => void;
}

export function useENSSearch(): UseENSSearchReturn {
  const { client } = useENSembleContext();
  const { chainId } = useAccount();
  const network = chainToNetwork(chainId);

  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const abortRef = useRef(0);

  const search = useCallback(async (label: string) => {
    const clean = label.replace(/\.eth$/i, '').trim().toLowerCase();
    if (!clean) {
      setResult(null);
      setError(null);
      setIsSearching(false);
      return;
    }

    if (/[^a-z0-9\-_]/.test(clean)) {
      setResult(null);
      setError('Invalid characters in name');
      setIsSearching(false);
      return;
    }

    const requestId = ++abortRef.current;
    setIsSearching(true);
    setError(null);

    try {
      const check = await client.check(clean, network);
      if (abortRef.current !== requestId) return;

      let profile: ENSProfile | null = null;
      if (!check.available) {
        try {
          profile = await client.profile(`${clean}.eth`, network);
        } catch {
          // Profile fetch can fail for some names
        }
        if (abortRef.current !== requestId) return;
      }

      setResult({ query: clean, check, profile });
      setError(null);
    } catch (err) {
      if (abortRef.current !== requestId) return;
      setError(err instanceof Error ? err.message : 'Search failed');
      setResult(null);
    } finally {
      if (abortRef.current === requestId) {
        setIsSearching(false);
      }
    }
  }, [network, client]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const clean = query.replace(/\.eth$/i, '').trim().toLowerCase();
    if (!clean) {
      setResult(null);
      setError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(() => search(clean), 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, search]);

  const clear = useCallback(() => {
    setQuery('');
    setResult(null);
    setError(null);
    setIsSearching(false);
    abortRef.current++;
  }, []);

  return { query, setQuery, result, isSearching, error, clear };
}
