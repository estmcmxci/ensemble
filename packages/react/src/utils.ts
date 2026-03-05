/** Map wagmi chainId to ENS network name. */
export function chainToNetwork(chainId: number | undefined): string {
  return chainId === 1 ? 'mainnet' : 'sepolia';
}

/** Truncate an Ethereum address for display: 0x1234...abcd */
export function truncAddr(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

/** Compute expiry badge CSS class from days remaining. */
export function expiryBadgeClass(expired: boolean, daysLeft: number): string {
  if (expired || daysLeft < 30) return 'ens-badge--danger';
  if (daysLeft < 90) return 'ens-badge--warning';
  return 'ens-badge--success';
}
