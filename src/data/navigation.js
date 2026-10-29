// Presentation variants share destinations; the home page keeps local hash navigation.
// `cta` marks the one link styled as the call to action (Products).
export const navigation = [
  { id: 'home', label: 'Home', href: '/index.html#home', number: '01.' },
  { id: 'profile', label: 'Profile', href: '/index.html#profile', number: '02.' },
  { id: 'frameworks', label: 'Frameworks', href: '/frameworks/', number: '03.' },
  { id: 'blog', label: 'Blog', href: '/blog/', number: '04.' },
  { id: 'products', label: 'Products', href: '/products/', number: '05.', cta: true },
];
