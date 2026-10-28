import WishlistDetailClient from './WishlistDetailClient';

export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export default function Page() {
    return <WishlistDetailClient />;
}
