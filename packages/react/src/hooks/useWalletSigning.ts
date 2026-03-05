import { useCallback, useState } from 'react';
import { useSendTransaction, useWaitForTransactionReceipt, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import type { TxParams, TxResult } from '../types';

export interface UseWalletSigningReturn {
  signTransaction: (tx: TxParams) => Promise<TxResult>;
  isPending: boolean;
  error: Error | null;
}

export function useWalletSigning(): UseWalletSigningReturn {
  const [pendingHash, setPendingHash] = useState<`0x${string}` | undefined>();
  const [error, setError] = useState<Error | null>(null);
  const config = useConfig();

  const { sendTransactionAsync, isPending: isSending } = useSendTransaction();

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: pendingHash,
  });

  const signTransaction = useCallback(
    async (tx: TxParams): Promise<TxResult> => {
      setError(null);
      try {
        const hash = await sendTransactionAsync({
          to: tx.to as `0x${string}`,
          data: (tx.data as `0x${string}`) || undefined,
          value: tx.value ? BigInt(tx.value) : undefined,
        });
        setPendingHash(hash);

        const RECEIPT_TIMEOUT = 120_000;
        try {
          const receipt = await Promise.race([
            waitForTransactionReceipt(config, { hash, confirmations: 1 }),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('receipt_timeout')), RECEIPT_TIMEOUT),
            ),
          ]);
          setPendingHash(undefined);
          return {
            hash,
            status: receipt.status === 'success' ? 'success' : 'reverted',
          };
        } catch {
          setPendingHash(undefined);
          return { hash, status: 'submitted' as const };
        }
      } catch (err) {
        setPendingHash(undefined);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      }
    },
    [sendTransactionAsync, config],
  );

  return {
    signTransaction,
    isPending: isSending || isConfirming,
    error,
  };
}
