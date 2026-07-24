import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('Error caught by boundary:', error, errorInfo)
    
    // In production, send to error tracking service
    // Example: Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}>
          <h2>Something went wrong</h2>
          <p>We apologize for the inconvenience.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
