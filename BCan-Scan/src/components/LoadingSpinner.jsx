import iconSvg from '../assets/SVG/Icon.svg';
import styles from '../styles/LoadingSpinner.module.css';

export default function LoadingSpinner({ size = 48, inline = false }) {
  return (
    <div className={styles.spinnerContainer} style={inline ? {} : { padding: '2rem' }}>
      <img 
        src={iconSvg} 
        alt="Loading..." 
        className={styles.spinner} 
        style={{ width: size, height: size }} 
      />
    </div>
  );
}
