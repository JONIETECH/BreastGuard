import styles from '../styles/Card.module.css';

export default function Card({
  children,
  title,
  badge,
  badgeVariant = 'primary',
  highlight,
  actions,
  className = '',
  onClick,
}) {
  const badgeClass = {
    primary: styles.cardBadge,
    danger: `${styles.cardBadge} ${styles.cardBadgeDanger}`,
    warning: `${styles.cardBadge} ${styles.cardBadgeWarning}`,
    success: `${styles.cardBadge} ${styles.cardBadgeSuccess}`,
  }[badgeVariant];

  return (
    <div
      className={`${styles.card} ${highlight ? styles.cardHighlight : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter') onClick();
            }
          : undefined
      }
    >
      {(title || badge) && (
        <div className={styles.cardHeader}>
          <div>
            {title && <h3 className={styles.cardTitle}>{title}</h3>}
          </div>
          {badge && <span className={badgeClass}>{badge}</span>}
        </div>
      )}

      <div className={styles.cardContent}>{children}</div>

      {actions && <div className={styles.cardActions}>{actions}</div>}
    </div>
  );
}
