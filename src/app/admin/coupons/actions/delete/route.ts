import { NextResponse } from 'next/server'
import { deleteCoupon } from '../../actions'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const formData = await req.formData()
  const res = await deleteCoupon(formData)
  if (res instanceof Response) return res
  return NextResponse.json({ ok: true })
}
