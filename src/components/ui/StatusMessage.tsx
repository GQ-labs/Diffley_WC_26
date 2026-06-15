import styles from './StatusMessage.module.css';

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className={styles.wrap} role="alert">
      <p className={styles.title}>Could not load results</p>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className={styles.wrap}>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
