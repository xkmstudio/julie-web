const Robots = () => {
  return (
    <div>
      Should not be navigated via Next Link. Use a standard {`<a>`} tag!
    </div>
  )
}

export async function getServerSideProps({ req, res }) {
  const canonicalHost = 'juliecare.co'
  const requestHost = req?.headers?.host
  const host = requestHost && !requestHost.includes('netlify.app')
    ? requestHost
    : canonicalHost

  res.setHeader('Content-Type', 'text/plain')
  res.write(`Sitemap: https://${host}/sitemap.xml
    
User-agent: AdsBot-Google
Allow: /
Disallow: /api/

User-agent: AdsBot-Google-Mobile
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /
Disallow: /api/

User-agent: Googlebot-Image
Allow: /
Disallow: /api/

User-agent: *
Allow: /
Disallow: /api/`)
  res.end()

  return { props: {} }
}

export default Robots
