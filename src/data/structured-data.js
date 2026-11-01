// JSON-LD helpers (schema.org). Pages pass the result as `structuredData` in their meta;
// BaseHead renders each object in its own <script type="application/ld+json">.
// Keep everything here true to what the page shows: no ratings, prices or claims that
// aren't visible on the page.
import { siteOrigin, siteName } from './site.js';

const abs = (path) => new URL(path, siteOrigin).href;

export const personId = abs('/#person');
export const websiteId = abs('/#website');

export const person = {
  '@type': 'Person',
  '@id': personId,
  name: 'M. Dimas Maulana',
  alternateName: ['Maul', siteName],
  jobTitle: 'Digital Marketer',
  url: abs('/'),
  image: abs('/assets/brand/favicon/icon-512.png'),
  address: { '@type': 'PostalAddress', addressLocality: 'Bekasi', addressCountry: 'ID' },
  sameAs: [
    'https://www.instagram.com/digmarketingmaul/',
    'https://www.linkedin.com/in/muhammad-dimas-maulana-4a5526148/',
    'https://www.tiktok.com/@digmarketingmaul',
    'https://www.youtube.com/@digmarketingmaul',
  ],
};

export const website = {
  '@type': 'WebSite',
  '@id': websiteId,
  name: siteName,
  url: abs('/'),
  inLanguage: ['id', 'en'],
  publisher: { '@id': personId },
};

const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

/** Home: who runs the site. */
export const homeGraph = () => graph(person, website);

/** Home › Products › … */
export function breadcrumb(items) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
  };
}

/**
 * A service page: Service (+ optional Offer) + breadcrumb (+ optional FAQPage).
 * faq: [{ q, a }] in the page's main language, plain text, matching the visible FAQ.
 */
export function serviceGraph({ name, path, description, serviceType, image, offer, faq }) {
  const url = abs(path);
  const service = {
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    description,
    serviceType,
    url,
    provider: { '@id': personId, '@type': 'Person', name: person.name },
    areaServed: [{ '@type': 'Country', name: 'Indonesia' }, { '@type': 'Place', name: 'Worldwide' }],
    availableChannel: { '@type': 'ServiceChannel', serviceUrl: url },
  };
  if (image) service.image = abs(image);
  // offer: { currency, minPrice } — a "starting from" price exactly as the page shows it
  if (offer) {
    service.offers = {
      '@type': 'Offer',
      url,
      priceCurrency: offer.currency,
      priceSpecification: { '@type': 'PriceSpecification', minPrice: offer.minPrice, priceCurrency: offer.currency },
      availability: 'https://schema.org/InStock',
    };
  }
  const nodes = [service, breadcrumb([['Home', '/'], ['Products', '/products/'], [name, path]])];
  if (faq && faq.length) {
    nodes.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    });
  }
  return graph(...nodes);
}

/** /products/: the list of products and services. */
export function productsGraph(items) {
  return graph(
    {
      '@type': 'CollectionPage',
      '@id': abs('/products/#page'),
      name: 'Products & Services',
      url: abs('/products/'),
      isPartOf: { '@id': websiteId },
      about: { '@id': personId },
      mainEntity: {
        '@type': 'ItemList',
        itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, url: abs(path) })),
      },
    },
    breadcrumb([['Home', '/'], ['Products', '/products/']])
  );
}
