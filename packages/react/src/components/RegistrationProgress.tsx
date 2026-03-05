import type { RegistrationStep } from '../types';

interface RegistrationProgressProps {
  step: RegistrationStep;
}

const STEPS: { key: RegistrationStep; label: string }[] = [
  { key: 'commit', label: 'Commit' },
  { key: 'waiting', label: 'Wait' },
  { key: 'register', label: 'Register' },
  { key: 'complete', label: 'Done' },
];

const ORDER: Record<RegistrationStep, number> = {
  idle: -1, commit: 0, waiting: 1, register: 2, complete: 3,
};

export function RegistrationProgress({ step }: RegistrationProgressProps) {
  if (step === 'idle') return null;
  const currentIdx = ORDER[step];

  return (
    <div className="ens-reg-progress">
      {STEPS.map((s, i) => {
        const idx = ORDER[s.key];
        const completed = idx < currentIdx;
        const current = idx === currentIdx;
        const future = idx > currentIdx;

        const circleColor = completed ? 'var(--ens-success, #16a34a)' : current ? 'var(--ens-accent, #3b7dd8)' : 'var(--ens-border, #d8dce3)';
        const textColor = completed ? 'var(--ens-success, #16a34a)' : current ? 'var(--ens-text, #1a1a2e)' : 'var(--ens-text-muted, #b0b0c0)';

        return (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : undefined }}>
            <div className="ens-reg-step">
              <div
                className="ens-reg-step__circle"
                style={{
                  color: completed || current ? '#fff' : 'var(--ens-text-muted, #b0b0c0)',
                  background: completed || current ? circleColor : 'transparent',
                  border: future ? `2px solid ${circleColor}` : 'none',
                }}
              >
                {completed ? '\u2713' : i + 1}
              </div>
              <span className="ens-reg-step__label" style={{ color: textColor }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="ens-reg-line" style={{ background: completed ? 'var(--ens-success, #16a34a)' : 'var(--ens-border, #d8dce3)' }} />
            )}
          </div>
        );
      })}
    </div>
  );
}
