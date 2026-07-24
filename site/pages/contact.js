import { useState } from 'react'
import Layout from '../components/Layout'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState('idle')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')
    
    // In production, this would call an API endpoint
    setTimeout(() => {
      setStatus('success')
      setForm({ name: '', email: '', message: '' })
    }, 1000)
  }
  
  return (
    <Layout title="Contact" description="Get in touch with Import Guide 1688">
      <section className="contact-page">
        <div className="container">
          <h1>Contact Us</h1>
          <p className="subtitle">Have questions? We'd love to hear from you.</p>
          
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              <p>Email us at <a href="mailto:hello@importguide1688.com">hello@importguide1688.com</a></p>
              <p>We typically respond within 24 hours.</p>
              
              <h3>What We Can Help With</h3>
              <ul>
                <li>Product sourcing questions</li>
                <li>Supplier recommendations</li>
                <li>Import process guidance</li>
                <li>Partnership inquiries</li>
              </ul>
            </div>
            
            <form onSubmit={handleSubmit} className="contact-form">
              {status === 'success' ? (
                <div className="success-message">
                  <p>Thank you! We'll get back to you soon.</p>
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      rows="5"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      required
                    />
                  </div>
                  
                  <button type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .contact-page { padding: 40px 20px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        @media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr; } }
        .contact-info h2 { color: #667eea; }
        .contact-info h3 { margin-top: 30px; }
        .contact-info a { color: #667eea; }
        .contact-form { background: #f8f9fa; padding: 30px; border-radius: 12px; }
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; font-size: 16px; }
        button { width: 100%; padding: 12px; background: #667eea; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
        button:hover { background: #5a6fd6; }
        button:disabled { opacity: 0.7; cursor: not-allowed; }
        .success-message { text-align: center; padding: 20px; color: #28a745; }
      `}</style>
    </Layout>
  )
}
