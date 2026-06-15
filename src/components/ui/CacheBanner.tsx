import styles from './CacheBanner.module.css';

export function CacheBanner({ message }: { message: string }) {
  return (
    <div className={styles.banner} role="status">
      <p>{message}</p>
    </div>
  );
}
