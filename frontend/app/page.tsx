'use client'

import dynamic from 'next/dynamic'

const OutageMap = dynamic(() => import('@/components/OutageMap'), {
  ssr: false,
  loading: () => <div className="h-screen flex items-center justify-center">Loading map...</div>
})

export default function Home() {
  return (
    <main className="h-[calc(100vh-73px)]">
      <OutageMap />
    </main>
  );
}
