import React from 'react'
import { Suspense } from "react";
const layout = ({children}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
      <Suspense fallback={<div className="text-white p-6">Loading...</div>}>
          
          {children}
      </Suspense>
  )
}

export default layout