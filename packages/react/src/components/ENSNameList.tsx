import { expiryBadgeClass } from '../utils';
import type { ENSNameEntry } from '../types';

interface ENSNameListProps {
  names: ENSNameEntry[];
  isLoading: boolean;
  onSelectName?: (name: string) => void;
  onRefresh?: () => void;
}

function expiryLabel(expired: boolean, daysLeft: number): string {
  if (expired) return 'Expired';
  if (daysLeft < 1) return 'Today';
  return `${daysLeft}d`;
}

function expiryBadge(entry: ENSNameEntry): React.ReactNode {
  if (!entry.expiry) return null;
  const { expired, days_left } = entry.expiry;
  const cls = expiryBadgeClass(expired, days_left);
  return <span className={`ens-badge ens-badge--sm ${cls}`}>{expiryLabel(expired, days_left)}</span>;
}

function NameListSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12 }}>
      {[1, 2, 3].map((i) => (
        <div key={i} className="ens-skeleton" style={{ height: 36, borderRadius: 8 }} />
      ))}
    </div>
  );
}

export function ENSNameList({ names, isLoading, onSelectName, onRefresh }: ENSNameListProps) {
  return (
    <div className="ens-widget">
      <div className="ens-widget__header">
        <span className="ens-widget__title">Your Names</span>
        {onRefresh && (
          <button className="ens-btn ens-btn--ghost ens-btn--sm" onClick={onRefresh}>
            {'\u21BB'}
          </button>
        )}
      </div>
      <div className="ens-widget__content ens-widget__content--sm">
        {isLoading ? (
          <NameListSkeleton />
        ) : names.length === 0 ? (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              color: 'var(--ens-text-muted, #b0b0c0)',
              fontSize: 13,
            }}
          >
            No names found
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {names.map((entry, i) => (
              <button
                key={entry.name}
                className="ens-interactive ens-focusable"
                onClick={() => onSelectName?.(entry.name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  color: 'var(--ens-text, #1a1a2e)',
                  fontSize: 13,
                  textAlign: 'left',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.name}
                </span>
                {expiryBadge(entry)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
