import products from './products.json';
const ebook = products.find(product => product.id === 'digital-marketing-ebooks');
// Editorial visibility is intentional: the original test is indexed; Midtrans is not.
// These amounts are display-only. The Worker independently validates all charges.
export const ebooks = {
  doku: { id: ebook.id, provider: 'doku', amount: ebook.amount },
  midtrans: { id: 'digital-marketing-ebooks-midtrans', provider: 'midtrans', amount: 11000, robots: 'noindex,nofollow,noarchive' },
};
