import { NextResponse } from 'next/server'
import { createCoupon } from '../../actions'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const formData = await req.formData()
  const res = await createCoupon(formData)
  if (res instanceof Response) return res
  return NextResponse.json({ ok: true })
}


