import { NextResponse } from 'next/server'
import { updateCoupon } from '../../actions'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const formData = await req.formData()
  const res = await updateCoupon(formData)
  if (res instanceof Response) return res
  return NextResponse.json({ ok: true })
}


