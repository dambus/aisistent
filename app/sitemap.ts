import type { MetadataRoute } from 'next'
import { getAllPostMeta } from '@/lib/blog'
import { getAllLibraryForms } from '@/lib/libraryForms'

const BASE = 'https://aisistent.rs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostMeta()
  const blogRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map(post => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  const libraryForms = await getAllLibraryForms()
  const obrasciRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/obrasci`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...libraryForms.map(form => ({
      url: `${BASE}/obrasci/${form.slug}`,
      lastModified: new Date(form.verifiedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ]

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/ugovor-o-radu`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/ugovor-o-delu`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/nda`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/ugovor-o-zakupu`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/ugovor-o-saradnji`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/punomocje`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/opsti-uslovi`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/poslovni-mejl`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/oglas-za-posao`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/ponuda-klijentu`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kalkulator-zarade`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/kalkulator-pausala`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    ...blogRoutes,
    ...obrasciRoutes,
    { url: `${BASE}/kalkulator-ugovora-o-delu`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]
}
