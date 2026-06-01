import styles from '../styles/Form.module.css';

export function Input({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required,
  helperText,
  ...props
}) {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={name} className={`${styles.label} ${required ? styles.labelRequired : ''}`}>
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${styles.input} ${error ? styles.errorField : ''}`}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

export function Textarea({
  label,
  name,
  placeholder,
  value,
  onChange,
  error,
  required,
  helperText,
  ...props
}) {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={name} className={`${styles.label} ${required ? styles.labelRequired : ''}`}>
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`${styles.textarea} ${error ? styles.errorField : ''}`}
        {...props}
      />
      {error && <span className={styles.error}>{error}</span>}
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

export function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required,
  helperText,
  ...props
}) {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={name} className={`${styles.label} ${required ? styles.labelRequired : ''}`}>
          {label}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`${styles.select} ${error ? styles.errorField : ''}`}
        {...props}
      >
        <option value="">Select an option...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className={styles.error}>{error}</span>}
      {helperText && <span className={styles.helperText}>{helperText}</span>}
    </div>
  );
}

export function RadioGroup({
  label,
  name,
  value,
  onChange,
  options = [],
  required,
}) {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label className={`${styles.label} ${required ? styles.labelRequired : ''}`}>
          {label}
        </label>
      )}
      <div className={styles.radioGroup}>
        {options.map((option) => (
          <div key={option.value} className={styles.radioItem}>
            <input
              id={`${name}_${option.value}`}
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className={styles.radioInput}
            />
            <label htmlFor={`${name}_${option.value}`} className={styles.radioLabel}>
              {option.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProgressBar({ progress }) {
  return (
    <div className={styles.progressBar}>
      <div
        className={styles.progressFill}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
