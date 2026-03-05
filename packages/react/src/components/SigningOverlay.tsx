interface SigningOverlayProps {
  visible: boolean;
  operationLabel?: string;
}

export function SigningOverlay({ visible, operationLabel }: SigningOverlayProps) {
  if (!visible) return null;

  return (
    <div className="ens-signing-overlay">
      <div className="ens-skeleton ens-signing-spinner" />
      <span className="ens-signing-text">Waiting for wallet signature...</span>
      {operationLabel && <span className="ens-signing-sub">{operationLabel}</span>}
    </div>
  );
}
