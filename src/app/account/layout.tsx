import { ReactNode } from 'react'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import AccountNav from './AccountNav'

export const dynamic = 'force-dynamic'

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user) {
    redirect('/auth/login?callbackUrl=/account')
  }

  return (
    <>
      <Header variant="inner" />
      <div className="w-full max-w-full mx-auto px-10 2xl:max-w-screen-2xl py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <AccountNav />
          </aside>
          <main className="lg:col-span-3">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </>
  )
}

