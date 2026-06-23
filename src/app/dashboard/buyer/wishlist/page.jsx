
import React, { Suspense } from 'react';
// import WishlistClient from './WishListClient';

const WishlistPage = () => {
  return (
  <Suspense fallback={<p>loading...</p>}>
{/* <WishlistClient></WishlistClient> */}
<h1>hi there</h1>
  </Suspense>
  );
};

export default WishlistPage;