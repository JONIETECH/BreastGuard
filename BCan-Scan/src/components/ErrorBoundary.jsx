import React from 'react';
import { colors } from '../utils/colors.js';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '2rem',
            margin: '2rem',
            backgroundColor: colors.malignantBg,
            border: `1px solid ${colors.malignantConfidenceText}33`,
            borderRadius: '0.5rem',
          }}
        >
          <h1 style={{ color: colors.malignantText, marginBottom: '1rem' }}>Something went wrong</h1>
          <details style={{ color: colors.malignantConfidenceText, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            {this.state.error?.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
