import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { updateOrder } from '../../actions'

export async function POST(req: Request) {
  try {
    // Check authentication in API route instead of server action to avoid NEXT_REDIRECT error
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    // Pass skipAuth=true since we already checked auth in the API route
    const res = await updateOrder(formData, true)
    if (res instanceof Response) {
      // If it's a Response with error status, return it
      if (!res.ok) {
        const text = await res.text()
        return NextResponse.json({ ok: false, error: text || 'Update failed' }, { status: res.status })
      }
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    // Handle NEXT_REDIRECT error specifically
    if (error && typeof error === 'object' && 'digest' in error && error.digest === 'NEXT_REDIRECT') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Update order route error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 })
  }
}
