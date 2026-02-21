import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@/lib/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderAmount } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Coupon code is required' },
        { status: 400 }
      );
    }

    if (typeof orderAmount !== 'number' || orderAmount < 0) {
      return NextResponse.json(
        { success: false, message: 'Valid order amount is required' },
        { status: 400 }
      );
    }

    const result = await CouponService.validateCoupon(code, orderAmount);

    if (!result.valid || !result.coupon) {
      return NextResponse.json({
        success: false,
        message: result.message || 'Invalid coupon code'
      });
    }

    // Return serialized coupon data (convert Decimal to number, Date to string)
    return NextResponse.json({
      success: true,
      message: 'Coupon applied successfully!',
      coupon: {
        id: result.coupon.id,
        code: result.coupon.code,
        name: result.coupon.name,
        description: result.coupon.description,
        type: result.coupon.type,
        value: Number(result.coupon.value),
        minOrderAmount: Number(result.coupon.minOrderAmount),
        maxDiscountAmount: result.coupon.maxDiscountAmount ? Number(result.coupon.maxDiscountAmount) : null,
        startDate: result.coupon.startDate.toISOString(),
        endDate: result.coupon.endDate.toISOString(),
        isActive: result.coupon.isActive,
        usageLimit: result.coupon.usageLimit,
        usedCount: result.coupon.usedCount,
      },
      discountAmount: result.discountAmount
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json(
      { success: false, message: 'Error validating coupon. Please try again.' },
      { status: 500 }
    );
  }
}

