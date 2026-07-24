import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://importguide1688.com';

function getArticles() {
  const bronzeDir = path.join(process.cwd(), '..', 'content-db', 'bronze');
  const silverDir = path.join(process.cwd(), '..', 'content-db', 'silver');
  
  const articles = [];
  
  // Read bronze articles
  if (fs.existsSync(bronzeDir)) {
    const bronzeFiles = fs.readdirSync(bronzeDir).filter(f => f.endsWith('.md'));
    bronzeFiles.forEach(file => {
      const slug = file.replace('.md', '');
      articles.push({ slug, tier: 'bronze' });
    });
  }
  
  // Read silver articles
  if (fs.existsSync(silverDir)) {
    const silverFiles = fs.readdirSync(silverDir).filter(f => f.endsWith('.md'));
    silverFiles.forEach(file => {
      const slug = file.replace('.md', '');
      articles.push({ slug, tier: 'silver' });
    });
  }
  
  return articles;
}

export default function sitemap() {
  const articles = getArticles();
  
  const urls = articles.map(article => `
    <url>
      <loc>${SITE_URL}/articles/${article.slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
    </url>
  `).join('');

  return {
    props: {},
    revalidate: 3600, // Revalidate every hour
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${urls}
</urlset>`
  };
}

export async function getServerSideProps({ res }) {
  const { xml } = sitemap();
  
  res.setHeader('Content-Type', 'application/xml');
  res.write(xml);
  res.end();
  
  return { props: {} };
}
