import styles from '../styles/Button.module.css';

export default function Button({
  children,
  onClick,
  disabled,
  variant = 'primary',
  size = 'medium',
  icon: Icon,
  className = '',
  ...props
}) {
  const variantClass = {
    primary: styles.buttonPrimary,
    secondary: styles.buttonSecondary,
    outline: styles.buttonOutline,
  }[variant];

  const sizeClass = {
    small: styles.buttonSmall,
    medium: '',
    large: styles.buttonLarge,
  }[size];

  return (
    <button
      className={`${styles.button} ${variantClass} ${sizeClass} ${disabled ? styles.buttonDisabled : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {Icon && <span className={styles.icon}><Icon /></span>}
      {children}
    </button>
  );
}
