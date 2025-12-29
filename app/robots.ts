// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'], // private routes
    },
    sitemap: 'https://snapcomponent.vercel.app/sitemap.xml',
  }
}