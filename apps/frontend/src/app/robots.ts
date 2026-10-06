import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api/', '/dashboard', '/deposit', '/history', '/partnership', '/preview/', '/profile', '/requisites', '/requests', '/support', '/zxc'] }],
    sitemap: 'https://p2pru.com/sitemap.xml',
  };
}
