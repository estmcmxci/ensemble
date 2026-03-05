import { useENSembleContext } from '../ENSembleProvider';
import { useENSProfile } from './useENSProfile';
import { useENSSearch } from './useENSSearch';
import { useWalletSigning } from './useWalletSigning';
import { useChatBridge } from './useChatBridge';

export function useENSemble() {
  const { config, client } = useENSembleContext();
  const profile = useENSProfile();
  const search = useENSSearch();
  const signing = useWalletSigning();
  const chat = useChatBridge();

  return {
    config,
    client,
    profile,
    search,
    signing,
    chat,
  };
}
