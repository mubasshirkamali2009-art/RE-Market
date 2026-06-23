import React, { Suspense } from 'react';
// import ProfileManageMentClient from './ProfileManageMentClient';

const ProfileManagePage = () => {
  return (
   <Suspense 
   fallback={<p>loading...</p>}
   >
    {/* <ProfileManageMentClient></ProfileManageMentClient> */}
    <h1>hi</h1>
   </Suspense>
  );
};

export default ProfileManagePage;