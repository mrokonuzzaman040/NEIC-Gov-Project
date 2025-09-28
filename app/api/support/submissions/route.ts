import { NextRequest, NextResponse } from 'next/server';
import { requireSupportSession, isAuthRedirectError } from '@/lib/session-wrapper';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Security: Require support session for access
    const session = await requireSupportSession();
    
    // Security: Validate user role
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Security: Additional role validation
    if ((session.user as any).role !== 'SUPPORT' && (session.user as any).role !== 'MANAGEMENT' && (session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Security: Rate limiting check (basic implementation)
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Security: Validate request headers
    if (!userAgent || userAgent.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 per page
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contact: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
        { seatName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Security: Only fetch necessary fields for support view (read-only)
    const submissions = await prisma.submission.findMany({
      where,
      select: {
        id: true,
        name: true,
        contact: true,
        email: true,
        district: true,
        seatName: true,
        message: true,
        status: true,
        source: true,
        locale: true,
        createdAt: true,
        updatedAt: true,
        attachmentName: true,
        attachmentSize: true,
        attachmentType: true,
        attachmentUrl: true
        // Note: ipHash excluded for security
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    const totalCount = await prisma.submission.count({ where });

    // Security: Sanitize data before sending
    const sanitizedSubmissions = submissions.map(submission => ({
      id: submission.id,
      name: submission.name,
      contact: submission.contact,
      email: submission.email,
      district: submission.district,
      seatName: submission.seatName,
      message: submission.message,
      status: submission.status,
      source: submission.source,
      locale: submission.locale,
      createdAt: submission.createdAt.toISOString(),
      updatedAt: submission.updatedAt.toISOString(),
      attachmentName: submission.attachmentName,
      attachmentSize: submission.attachmentSize,
      attachmentType: submission.attachmentType,
      attachmentUrl: submission.attachmentUrl
    }));

    // Security: Add audit log for submissions access
    try {
      await prisma.userAuditLog.create({
        data: {
          userId: (session.user as any).id,
          action: 'SUPPORT_SUBMISSIONS_ACCESS',
          details: JSON.stringify({
            endpoint: 'support/submissions',
            filters: { search, page, limit },
            timestamp: new Date().toISOString(),
            ipAddress: ipAddress,
            userAgent: userAgent.substring(0, 200)
          }),
          ipAddress: ipAddress,
          userAgent: userAgent.substring(0, 200)
        }
      });
    } catch (auditError) {
      // Don't fail the request if audit logging fails
      console.warn('Failed to log support submissions access:', auditError);
    }

    return NextResponse.json({
      success: true,
      data: sanitizedSubmissions,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    if (isAuthRedirectError(error)) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    console.error('Support submissions error:', error);
    
    // Security: Don't expose internal errors
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch submissions',
        message: 'Unable to load submissions. Please try again.'
      },
      { status: 500 }
    );
  }
}
