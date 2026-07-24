import Layout from '../components/Layout'

export default function About() {
  return (
    <Layout title="About" description="About Import Guide 1688">
      <section className="about-page">
        <div className="container">
          <h1>About Import Guide 1688</h1>
          
          <div className="content">
            <h2>Our Mission</h2>
            <p>
              We help entrepreneurs and importers find the best products to source from China. 
              Our data-driven approach combines real pricing data from 1688, Alibaba, and Amazon 
              to give you actionable insights for your business.
            </p>
            
            <h2>How We Work</h2>
            <p>
              Our team of AI agents continuously monitors Chinese wholesale platforms, 
              collecting pricing data, supplier information, and market trends. We then 
              process this data through our content pipeline to create guides, comparisons, 
              and analysis that help you make informed decisions.
            </p>
            
            <h2>Our Data</h2>
            <ul>
              <li>Real-time pricing from 1688, Alibaba, and Amazon</li>
              <li>Supplier ratings and reviews</li>
              <li>MOQ (Minimum Order Quantity) information</li>
              <li>Shipping cost estimates</li>
              <li>Profit margin calculations</li>
            </ul>
            
            <h2>Contact</h2>
            <p>
              Have questions or suggestions? Reach out to us at{' '}
              <a href="mailto:hello@importguide1688.com">hello@importguide1688.com</a>
            </p>
          </div>
        </div>
      </section>
      
      <style jsx>{`
        .about-page { padding: 40px 20px; }
        .content { max-width: 800px; }
        .content h2 { color: #667eea; margin-top: 40px; }
        .content p { line-height: 1.8; margin-bottom: 20px; }
        .content ul { padding-left: 20px; }
        .content li { margin-bottom: 10px; }
        .content a { color: #667eea; }
      `}</style>
    </Layout>
  )
}
