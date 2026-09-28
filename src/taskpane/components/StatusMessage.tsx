interface StatusMessageProps {
  busy?: boolean;
  busyText?: string;
  error?: string | null;
}

// Error wins over busy text; renders nothing when idle.
export function StatusMessage({ busy, busyText = "Saving...", error }: StatusMessageProps) {
  if (error) {
    return (
      <p className="status status--error" role="alert">
        {error}
      </p>
    );
  }
  if (busy) {
    return (
      <p className="status" role="status">
        {busyText}
      </p>
    );
  }
  return null;
}
