import { NextResponse } from 'next/server'
import { HealthCheckService } from '@/lib/migration'

export async function GET() {
  try {
    const healthCheck = await HealthCheckService.performHealthCheck()
    
    return NextResponse.json({
      status: 'ok',
      ...healthCheck
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
