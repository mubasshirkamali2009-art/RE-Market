
import React, { Suspense } from 'react';
import WishlistClient from './WishListClient';

const WishlistPage = () => {
  return (
  <Suspense fallback={<p>loading...</p>}>
<WishlistClient></WishlistClient>

  </Suspense>
  );
};

export default WishlistPage;