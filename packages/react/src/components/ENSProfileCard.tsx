import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAccount, useBalance, useDisconnect } from 'wagmi';
import { useENSSearch } from '../hooks/useENSSearch';
import { useENSembleContext } from '../ENSembleProvider';
import { truncAddr, expiryBadgeClass } from '../utils';
import type { ENSProfile, ENSNameList, SearchResult } from '../types';

/* ── Inline SVG brand icons (14x14) ── */
const SocialIcons: Record<string, ReactNode> = {
  'com.twitter': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  ),
  'com.github': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
  ),
  'com.discord': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
  ),
  'org.telegram': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
  ),
  'com.instagram': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
  ),
  'com.linkedin': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  ),
  'email': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
  ),
  'url': (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
  ),
};

const EditIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);

const SearchIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.3-4.3"/>
  </svg>
);

const BackIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

function socialUrl(key: string, value: string): string | null {
  const handle = value.replace(/^@/, '');
  switch (key) {
    case 'com.twitter': return `https://x.com/${handle}`;
    case 'com.github': return `https://github.com/${handle}`;
    case 'com.instagram': return `https://instagram.com/${handle}`;
    case 'com.linkedin': {
      const path = value.replace(/^@?\/?/, '');
      return `https://linkedin.com/${path}`;
    }
    case 'com.reddit': return `https://reddit.com/u/${handle}`;
    case 'org.telegram': return `https://t.me/${handle}`;
    case 'email': return `mailto:${value}`;
    case 'url': return value.startsWith('http') ? value : `https://${value}`;
    default: return null;
  }
}

const SOCIAL_KEYS: { key: string; label: string }[] = [
  { key: 'com.twitter', label: 'Twitter' },
  { key: 'com.github', label: 'GitHub' },
  { key: 'com.discord', label: 'Discord' },
  { key: 'org.telegram', label: 'Telegram' },
  { key: 'com.instagram', label: 'Instagram' },
  { key: 'com.linkedin', label: 'LinkedIn' },
  { key: 'com.reddit', label: 'Reddit' },
  { key: 'email', label: 'Email' },
  { key: 'url', label: 'Website' },
];

const SOCIAL_KEY_SET = new Set(SOCIAL_KEYS.map((s) => s.key));

export interface ENSProfileCardProps {
  profile: ENSProfile | null;
  nameList?: ENSNameList | null;
  isLoading: boolean;
  isConnected: boolean;
  onSendPrompt?: (text: string) => void;
  onSelectName?: (name: string) => void;
  onRefresh?: () => void;
  /** Render prop for wallet connect button (consumer provides their own) */
  connectButton?: ReactNode;
  /** Render prop for chain switcher */
  chainButton?: ReactNode;
}

function expiryInfo(expiry: ENSProfile['expiry']) {
  if (!expiry) return null;
  const days = expiry.days_left ?? Math.floor((expiry.timestamp * 1000 - Date.now()) / 86_400_000);
  const dateStr = new Date(expiry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const cls = expiryBadgeClass(expiry.expired, days);
  return { days, dateStr, cls, expired: expiry.expired };
}

function ProfileSkeleton() {
  return (
    <div className="ens-pcard">
      <div className="ens-pcard__header" style={{ cursor: 'default' }}>
        <div className="ens-skeleton" style={{ width: 40, height: 40, borderRadius: 8 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="ens-skeleton" style={{ width: '65%', height: 13 }} />
          <div className="ens-skeleton" style={{ width: '45%', height: 10 }} />
        </div>
      </div>
    </div>
  );
}

function SearchInput({
  query, onChange, onClear, onBack, autoFocus, placeholder = 'Search .eth names...',
}: {
  query: string; onChange: (v: string) => void; onClear: () => void;
  onBack?: () => void; autoFocus?: boolean; placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="ens-psearch__input-wrap">
      {onBack ? (
        <button className="ens-psearch__input-back" onClick={onBack} aria-label="Back to profile">{BackIcon}</button>
      ) : (
        <span className="ens-psearch__input-icon">{SearchIcon}</span>
      )}
      <input
        ref={inputRef} className="ens-psearch__input" type="text" value={query}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        autoFocus={autoFocus} spellCheck={false} autoComplete="off"
      />
      {query && (
        <button className="ens-psearch__input-clear" onClick={() => { onClear(); inputRef.current?.focus(); }} aria-label="Clear search">
          {'\u00D7'}
        </button>
      )}
    </div>
  );
}

function SearchResults({
  result, isSearching, error, query, onSendPrompt,
}: {
  result: SearchResult | null; isSearching: boolean; error: string | null;
  query: string; onSendPrompt?: (text: string) => void;
}) {
  const clean = query.replace(/\.eth$/i, '').trim().toLowerCase();
  if (!clean) return null;

  if (isSearching) {
    return (
      <div className="ens-psearch__results">
        <div className="ens-psearch__result-skeleton">
          <div className="ens-skeleton" style={{ width: '70%', height: 12 }} />
          <div className="ens-skeleton" style={{ width: '40%', height: 10, marginTop: 4 }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ens-psearch__results">
        <div className="ens-psearch__error">{error}</div>
      </div>
    );
  }

  if (!result) return null;
  const { check, profile } = result;

  if (check.available) {
    return (
      <div className="ens-psearch__results">
        <div className="ens-psearch__result ens-psearch__result--available">
          <div className="ens-psearch__result-main">
            <span className="ens-psearch__result-name">{check.fullName}</span>
            <span className="ens-badge ens-badge--success">Available</span>
          </div>
          {check.price && (
            <div className="ens-psearch__result-price">
              <span className="ens-psearch__price-eth">{parseFloat(check.price.total).toFixed(4)} ETH</span>
              <span className="ens-psearch__price-duration">/ year</span>
            </div>
          )}
          <button className="ens-psearch__result-action ens-psearch__result-action--register" onClick={() => onSendPrompt?.(`Register ${check.fullName}`)}>
            Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ens-psearch__results">
      <div className="ens-psearch__result ens-psearch__result--taken">
        <div className="ens-psearch__result-main">
          <span className="ens-psearch__result-name">{check.fullName}</span>
          <span className="ens-badge ens-badge--outline">Taken</span>
        </div>
        {profile && (
          <div className="ens-psearch__result-profile">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="ens-psearch__result-avatar" />
            ) : (
              <div className="ens-psearch__result-avatar ens-psearch__result-avatar--gradient" />
            )}
            <div className="ens-psearch__result-meta">
              {profile.owner && <span className="ens-psearch__result-owner">Owner: {truncAddr(profile.owner)}</span>}
              {profile.expiry && !profile.expiry.expired && (
                <span className="ens-psearch__result-expiry">
                  Expires {new Date(profile.expiry.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        )}
        <button className="ens-psearch__result-action" onClick={() => onSendPrompt?.(`Show profile for ${check.fullName}`)}>
          View Profile
        </button>
      </div>
    </div>
  );
}

function RecordEditor({
  currentRecords, ensName, onSave, onCancel,
}: {
  currentRecords: Record<string, string>; ensName: string;
  onSave: (prompt: string) => void; onCancel: () => void;
}) {
  const initialFields = useMemo(() => {
    const fields: { key: string; label: string; value: string; icon: ReactNode | null }[] = [];
    for (const s of SOCIAL_KEYS) {
      fields.push({ key: s.key, label: s.label, value: currentRecords[s.key] ?? '', icon: SocialIcons[s.key] ?? null });
    }
    for (const [k, v] of Object.entries(currentRecords)) {
      if (!SOCIAL_KEY_SET.has(k)) fields.push({ key: k, label: k, value: v, icon: null });
    }
    return fields;
  }, [currentRecords]);

  const [fields, setFields] = useState(initialFields);
  const [customKey, setCustomKey] = useState('');
  const [customValue, setCustomValue] = useState('');

  const updateField = (key: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
  };

  const addCustom = () => {
    const k = customKey.trim();
    const v = customValue.trim();
    if (!k || !v) return;
    if (fields.some((f) => f.key === k)) updateField(k, v);
    else setFields((prev) => [...prev, { key: k, label: k, value: v, icon: null }]);
    setCustomKey('');
    setCustomValue('');
  };

  const handleSave = () => {
    const changes: string[] = [];
    for (const f of fields) {
      const orig = currentRecords[f.key] ?? '';
      if (f.value.trim() !== orig) {
        if (f.value.trim()) changes.push(`set ${f.label} to ${f.value.trim()}`);
        else if (orig) changes.push(`remove ${f.label}`);
      }
    }
    const ck = customKey.trim();
    const cv = customValue.trim();
    if (ck && cv) changes.push(`set ${ck} to ${cv}`);
    if (changes.length === 0) { onCancel(); return; }
    onSave(`Update text records on ${ensName}: ${changes.join(', ')}`);
  };

  const hasPendingCustom = customKey.trim() !== '' && customValue.trim() !== '';
  const hasChanges = hasPendingCustom || fields.some((f) => {
    const orig = currentRecords[f.key] ?? '';
    return f.value.trim() !== orig;
  });

  return (
    <div className="ens-precord-editor" onClick={(e) => e.stopPropagation()}>
      <div className="ens-precord-editor__fields">
        {fields.map((f) => (
          <div key={f.key} className="ens-precord-editor__row">
            <label className="ens-precord-editor__label">
              {f.icon ? <span className="ens-precord-editor__icon">{f.icon}</span> : <span className="ens-precord-editor__icon-spacer" />}
              {f.label}
            </label>
            <input className="ens-precord-editor__input" type="text" value={f.value} onChange={(e) => updateField(f.key, e.target.value)} placeholder={`Enter ${f.label.toLowerCase()}...`} spellCheck={false} />
          </div>
        ))}
        <div className="ens-precord-editor__row ens-precord-editor__row--custom">
          <label className="ens-precord-editor__label">
            <span className="ens-precord-editor__icon-spacer" />
            <input className="ens-precord-editor__label-input" type="text" value={customKey} onChange={(e) => setCustomKey(e.target.value)} placeholder="+ Add key" spellCheck={false} onKeyDown={(e) => { if (e.key === 'Enter') addCustom(); }} />
          </label>
          <input className="ens-precord-editor__input" type="text" value={customValue} onChange={(e) => setCustomValue(e.target.value)} placeholder="Value" spellCheck={false} onKeyDown={(e) => { if (e.key === 'Enter') addCustom(); }} />
        </div>
      </div>
      <div className="ens-precord-editor__actions">
        <button className="ens-precord-editor__btn ens-precord-editor__btn--cancel" onClick={onCancel}>Cancel</button>
        <button className="ens-precord-editor__btn ens-precord-editor__btn--save" onClick={handleSave} disabled={!hasChanges}>Save Changes</button>
      </div>
    </div>
  );
}

function AddressEditor({
  label, currentValue, ensName, network, resolveENS, onSave, onCancel,
}: {
  label: string; currentValue: string | null; ensName: string; network: string;
  resolveENS: boolean; onSave: (prompt: string) => void; onCancel: () => void;
}) {
  const { client } = useENSembleContext();
  const [value, setValue] = useState('');
  const [resolvedAddr, setResolvedAddr] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!resolveENS) return;
    setResolvedAddr(null);
    setResolveError(null);
    const trimmed = value.trim();
    if (!trimmed || trimmed.startsWith('0x')) return;
    if (!trimmed.includes('.')) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setResolving(true);
      try {
        const prof = await client.profile(trimmed, network);
        if (prof.address) setResolvedAddr(prof.address);
        else setResolveError('No address found');
      } catch {
        setResolveError('Could not resolve');
      } finally {
        setResolving(false);
      }
    }, 500);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value, network, resolveENS, client]);

  const finalAddress = value.trim().startsWith('0x') ? value.trim() : resolvedAddr;
  const isValid = finalAddress && /^0x[a-fA-F0-9]{40}$/.test(finalAddress);
  const isChanged = isValid && finalAddress !== currentValue;

  const handleSave = () => {
    if (!isChanged || !finalAddress) return;
    const displayInput = resolvedAddr ? `${value.trim()} (${truncAddr(finalAddress)})` : truncAddr(finalAddress);
    const action = label === 'owner' ? 'Transfer' : 'Set';
    onSave(`${action} ${label} of ${ensName} to ${displayInput}`);
  };

  return (
    <div className="ens-precord-editor" onClick={(e) => e.stopPropagation()}>
      <div className="ens-precord-editor__row">
        <label className="ens-precord-editor__label" style={{ width: 'auto' }}>New {label}</label>
        <input className="ens-precord-editor__input" type="text" value={value} onChange={(e) => setValue(e.target.value)} placeholder={resolveENS ? '0x... or name.eth' : '0x...'} spellCheck={false} autoFocus />
      </div>
      {resolveENS && resolving && <div className="ens-precord-editor__resolve">Resolving...</div>}
      {resolveENS && resolvedAddr && <div className="ens-precord-editor__resolve ens-precord-editor__resolve--ok">Resolved: {truncAddr(resolvedAddr)}</div>}
      {resolveENS && resolveError && <div className="ens-precord-editor__resolve ens-precord-editor__resolve--err">{resolveError}</div>}
      <div className="ens-precord-editor__actions">
        <button className="ens-precord-editor__btn ens-precord-editor__btn--cancel" onClick={onCancel}>Cancel</button>
        <button className="ens-precord-editor__btn ens-precord-editor__btn--save" onClick={handleSave} disabled={!isChanged}>{label === 'owner' ? 'Transfer' : 'Update'}</button>
      </div>
    </div>
  );
}

function ExtendEditor({ ensName, onSave, onCancel }: { ensName: string; onSave: (prompt: string) => void; onCancel: () => void; }) {
  const [amountStr, setAmountStr] = useState('1');
  const [unit, setUnit] = useState<'days' | 'months' | 'years'>('years');
  const amount = amountStr === '' ? 0 : parseInt(amountStr) || 0;

  const handleSave = () => {
    if (amount <= 0) return;
    const label = amount === 1 ? unit.slice(0, -1) : unit;
    onSave(`Extend registration for ${ensName} by ${amount} ${label}`);
  };

  return (
    <div className="ens-precord-editor" onClick={(e) => e.stopPropagation()}>
      <div className="ens-pextend__row">
        <input className="ens-precord-editor__input ens-pextend__amount" type="number" min={0} max={999} value={amountStr}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '') { setAmountStr(''); return; }
            const num = parseInt(val);
            if (!isNaN(num) && num >= 0 && num <= 999) setAmountStr(String(num));
          }}
        />
        <div className="ens-pextend__units">
          {(['days', 'months', 'years'] as const).map((u) => (
            <button key={u} className={`ens-pextend__unit${unit === u ? ' ens-pextend__unit--active' : ''}`} onClick={() => setUnit(u)}>{u}</button>
          ))}
        </div>
      </div>
      <div className="ens-precord-editor__actions">
        <button className="ens-precord-editor__btn ens-precord-editor__btn--cancel" onClick={onCancel}>Cancel</button>
        <button className="ens-precord-editor__btn ens-precord-editor__btn--save" onClick={handleSave} disabled={amount <= 0}>Extend</button>
      </div>
    </div>
  );
}

export function ENSProfileCard({
  profile, nameList, isLoading, isConnected, onSendPrompt, onSelectName, onRefresh,
  connectButton, chainButton,
}: ENSProfileCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingRecords, setEditingRecords] = useState(false);
  const [editingOwnership, setEditingOwnership] = useState(false);
  const [editingResolver, setEditingResolver] = useState(false);
  const [editingExpiry, setEditingExpiry] = useState(false);
  const [mode, setMode] = useState<'profile' | 'search'>('profile');
  const { address } = useAccount();
  const { data: balanceData } = useBalance({ address });
  const { disconnect } = useDisconnect();
  const search = useENSSearch();
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditingRecords(false);
    setEditingOwnership(false);
    setEditingResolver(false);
    setEditingExpiry(false);
  }, [profile?.name]);

  useEffect(() => {
    if (!expanded) return;
    function handleClickOutside(e: MouseEvent) {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setExpanded(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  const send = (text: string) => {
    onSendPrompt?.(text);
    setExpanded(false);
    setMode('profile');
    search.clear();
  };

  const copyAddress = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!address) return;
    navigator.clipboard.writeText(address).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [address]);

  const switchToSearch = useCallback(() => { setMode('search'); setExpanded(false); }, []);
  const switchToProfile = useCallback(() => { setMode('profile'); search.clear(); }, [search]);

  /* ── Disconnected: search-first with connect button ── */
  if (!isConnected) {
    return (
      <div className="ens-pcard">
        <div className="ens-psearch__bar">
          <SearchInput query={search.query} onChange={search.setQuery} onClear={search.clear} placeholder="Search .eth names..." />
        </div>
        <SearchResults result={search.result} isSearching={search.isSearching} error={search.error} query={search.query} onSendPrompt={send} />
        {!search.query && connectButton && (
          <div className="ens-pcard__connect-slot">{connectButton}</div>
        )}
      </div>
    );
  }

  if (isLoading) return <ProfileSkeleton />;
  if (!profile) return (
    <div className="ens-pcard">
      <div className="ens-pcard__header" style={{ cursor: 'default' }}>
        <div className="ens-pcard__avatar ens-pcard__avatar--gradient" />
        <div className="ens-pcard__info">
          <div className="ens-pcard__row-top">
            <span className="ens-pcard__name">{address ? truncAddr(address) : 'Connected'}</span>
          </div>
          <div className="ens-pcard__meta">
            <span className="ens-pcard__addr" style={{ color: 'var(--ens-text-muted, #b0b0c0)', fontSize: 11 }}>Could not load profile</span>
            {onRefresh && <button className="ens-pcard__extend-btn" onClick={onRefresh} style={{ marginLeft: 8 }}>Retry</button>}
          </div>
        </div>
      </div>
    </div>
  );

  /* ── Connected: search mode ── */
  if (mode === 'search') {
    return (
      <div className="ens-pcard">
        <div className="ens-psearch__bar">
          <SearchInput query={search.query} onChange={search.setQuery} onClear={search.clear} onBack={switchToProfile} autoFocus />
        </div>
        <SearchResults result={search.result} isSearching={search.isSearching} error={search.error} query={search.query} onSendPrompt={send} />
      </div>
    );
  }

  /* ── Connected: profile mode ── */
  const socials = SOCIAL_KEYS.filter((s) => profile.text_records[s.key]);
  const otherRecords = Object.entries(profile.text_records).filter(([k]) => !SOCIAL_KEY_SET.has(k));
  const names = nameList?.names ?? [];
  const exp = expiryInfo(profile.expiry);

  return (
    <div className="ens-pcard" ref={cardRef}>
      <div className="ens-pcard__header" role="button" tabIndex={0} onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded((v) => !v); }}>
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="ens-pcard__avatar" />
        ) : (
          <div className="ens-pcard__avatar ens-pcard__avatar--gradient" />
        )}
        <div className="ens-pcard__info">
          <div className="ens-pcard__row-top">
            <span className="ens-pcard__name">{profile.name}</span>
            <span className="ens-pcard__bal-group">
              {balanceData && (
                <>
                  <span className="ens-pcard__wallet-bal">{parseFloat(balanceData.formatted).toFixed(4)}</span>
                  <span className="ens-pcard__wallet-unit">ETH</span>
                </>
              )}
              <span className="ens-pcard__chevron" style={{ transform: expanded ? 'rotate(180deg)' : undefined }}>{'\u25BE'}</span>
            </span>
          </div>
          <div className="ens-pcard__meta">
            {profile.address && (
              <span className="ens-pcard__addr ens-pcard__addr--copy" role="button" onClick={copyAddress} title="Copy address">
                {copied ? 'Copied!' : truncAddr(profile.address)}
              </span>
            )}
            {exp && (
              <>
                <span className="ens-pcard__dot" />
                <span className={`ens-badge ${exp.cls}`}>{exp.expired ? 'Expired' : `${exp.days}d`}</span>
              </>
            )}
            {chainButton && <span className="ens-pcard__chain-slot">{chainButton}</span>}
          </div>
        </div>
        <button className="ens-pcard__search-toggle" onClick={(e) => { e.stopPropagation(); switchToSearch(); }} title="Search ENS names">
          {SearchIcon}
        </button>
      </div>

      <div className={`ens-pcard__dropdown ${expanded ? 'ens-pcard__dropdown--open' : ''}`}>
        {/* Records */}
        <div className="ens-pcard__section ens-pcard__card">
          {editingRecords ? (
            <RecordEditor currentRecords={profile.text_records} ensName={profile.name} onSave={(p) => { setEditingRecords(false); send(p); }} onCancel={() => setEditingRecords(false)} />
          ) : (
            <>
              <div className="ens-pcard__section-label">
                Records
                <button className="ens-pcard__section-edit" onClick={(e) => { e.stopPropagation(); setEditingRecords(true); }} title="Edit records">{EditIcon}</button>
              </div>
              {socials.length > 0 ? (
                <div className="ens-pcard__socials">
                  {socials.map((s) => {
                    const value = profile.text_records[s.key]!;
                    const href = socialUrl(s.key, value);
                    const icon = SocialIcons[s.key];
                    const inner = (<><span className="ens-pcard__social-icon">{icon}</span>{value}</>);
                    return href ? (
                      <a key={s.key} className="ens-pcard__social-tag" href={href} target="_blank" rel="noopener noreferrer" title={`${s.label}: ${value}`} onClick={(e) => e.stopPropagation()}>{inner}</a>
                    ) : (
                      <span key={s.key} className="ens-pcard__social-tag" title={value}>{inner}</span>
                    );
                  })}
                </div>
              ) : (
                <span className="ens-pcard__empty">No text records set</span>
              )}
              {otherRecords.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  {otherRecords.map(([key, value]) => (
                    <div key={key} className="ens-pcard__record-row">
                      <span className="ens-pcard__record-key">{key}</span>
                      <span className="ens-pcard__record-val">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Ownership */}
        <div className="ens-pcard__section ens-pcard__card">
          {editingOwnership ? (
            <AddressEditor label="owner" currentValue={profile.owner} ensName={profile.name} network={profile.network} resolveENS onSave={(p) => { setEditingOwnership(false); send(p); }} onCancel={() => setEditingOwnership(false)} />
          ) : editingResolver ? (
            <AddressEditor label="resolver" currentValue={profile.resolver} ensName={profile.name} network={profile.network} resolveENS={false} onSave={(p) => { setEditingResolver(false); send(p); }} onCancel={() => setEditingResolver(false)} />
          ) : (
            <>
              <div className="ens-pcard__section-label">
                Ownership
                <button className="ens-pcard__section-edit" onClick={(e) => { e.stopPropagation(); setEditingOwnership(true); }} title="Transfer owner">{EditIcon}</button>
              </div>
              <div className="ens-pcard__pills">
                {profile.owner && (
                  <span className="ens-pcard__pill ens-pcard__pill--owner">
                    <span className="ens-pcard__pill-label">owner</span>
                    <span className="ens-pcard__pill-value">{truncAddr(profile.owner)}</span>
                  </span>
                )}
                {profile.address && profile.address !== profile.owner && (
                  <span className="ens-pcard__pill ens-pcard__pill--manager">
                    <span className="ens-pcard__pill-label">manager</span>
                    <span className="ens-pcard__pill-value">{truncAddr(profile.address)}</span>
                  </span>
                )}
                {profile.resolver && (
                  <span className="ens-pcard__pill ens-pcard__pill--resolver ens-pcard__pill--editable" role="button" onClick={(e) => { e.stopPropagation(); setEditingResolver(true); }} title="Change resolver">
                    <span className="ens-pcard__pill-label">resolver</span>
                    <span className="ens-pcard__pill-value">{truncAddr(profile.resolver)}</span>
                    <span className="ens-pcard__pill-edit">{EditIcon}</span>
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Expiry */}
        {exp && (
          <div className="ens-pcard__section ens-pcard__card">
            {editingExpiry ? (
              <ExtendEditor ensName={profile.name} onSave={(p) => { setEditingExpiry(false); send(p); }} onCancel={() => setEditingExpiry(false)} />
            ) : (
              <>
                <div className="ens-pcard__section-label">Expiry</div>
                <div className="ens-pcard__expiry-row">
                  <div className="ens-pcard__expiry-info">
                    <span className="ens-pcard__expiry-date">{exp.dateStr}</span>
                    <span className={`ens-badge ${exp.cls}`} style={{ marginLeft: 6 }}>{exp.expired ? 'Expired' : `${exp.days}d left`}</span>
                  </div>
                  <button className="ens-pcard__extend-btn" onClick={(e) => { e.stopPropagation(); setEditingExpiry(true); }}>Extend</button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Your Names */}
        {names.length > 0 && (
          <div className="ens-pcard__section ens-pcard__card">
            <div className="ens-pcard__section-label">
              Your Names
              <span className="ens-pcard__count-badge">{names.length}</span>
              {onRefresh && <button className="ens-pcard__refresh-btn" onClick={(e) => { e.stopPropagation(); onRefresh(); }}>{'\u21BB'}</button>}
            </div>
            <div className="ens-pcard__names">
              {names.map((entry) => {
                const cls = entry.expiry ? expiryBadgeClass(entry.expiry.expired, entry.expiry.days_left) : '';
                const isActive = profile.name === entry.name;
                return (
                  <button key={entry.name} className={`ens-pcard__name-row${isActive ? ' ens-pcard__name-row--active' : ''}`} onClick={(e) => { e.stopPropagation(); onSelectName?.(entry.name); }}>
                    <span>{entry.name}</span>
                    {entry.expiry && <span className={`ens-badge ${cls}`}>{entry.expiry.expired ? 'Expired' : `${entry.expiry.days_left}d`}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="ens-pcard__actions">
          <button className="ens-pcard__action-btn ens-pcard__action-btn--primary" onClick={(e) => { e.stopPropagation(); send(`Edit profile for ${profile.name}`); }}>Edit Profile</button>
          <button className="ens-pcard__disconnect" onClick={(e) => { e.stopPropagation(); disconnect(); }}>Disconnect</button>
        </div>
      </div>
    </div>
  );
}
