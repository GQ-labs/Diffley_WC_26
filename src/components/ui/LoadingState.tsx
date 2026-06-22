import styles from './LoadingState.module.css';

export function LoadingState({ message = 'Loading results…' }: { message?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite">
      <svg
        className={styles.spinner}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M12 3a9 9 0 1 0 9 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <p>{message}</p>
    </div>
  );
}
