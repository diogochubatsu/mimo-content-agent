import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    
    // In production, this would call an API endpoint
    // For now, just simulate success
    setTimeout(() => {
      setStatus('success')
      setEmail('')
    }, 1000)
  }
  
  if (status === 'success') {
    return (
      <div className="newsletter success">
        <p>Thank you for subscribing!</p>
      </div>
    )
  }
  
  return (
    <div className="newsletter">
      <h3>Subscribe to Our Newsletter</h3>
      <p>Get weekly import tips, product finds, and market insights.</p>
      <form onSubmit={handleSubmit} className="newsletter-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="newsletter-input"
        />
        <button 
          type="submit" 
          className="newsletter-button"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
      <p className="privacy">No spam. Unsubscribe anytime.</p>
      
      <style jsx>{`
        .newsletter {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          border-radius: 12px;
          text-align: center;
          margin: 40px 0;
        }
        .newsletter h3 { margin: 0 0 10px 0; }
        .newsletter p { margin: 0 0 20px 0; opacity: 0.9; }
        .newsletter-form { display: flex; gap: 10px; max-width: 500px; margin: 0 auto; }
        .newsletter-input { flex: 1; padding: 12px; border: none; border-radius: 8px; font-size: 16px; }
        .newsletter-button { padding: 12px 24px; background: white; color: #667eea; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        .newsletter-button:hover { background: #f0f0f0; }
        .newsletter-button:disabled { opacity: 0.7; cursor: not-allowed; }
        .privacy { font-size: 0.8rem; opacity: 0.7; margin-top: 15px; }
        .success { background: #28a745; }
      `}</style>
    </div>
  )
}
