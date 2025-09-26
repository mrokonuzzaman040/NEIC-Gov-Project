import { NextRequest, NextResponse } from 'next/server';
import { requireManagementSession } from '@/lib/session-wrapper';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Security: Require management session for access
    const session = await requireManagementSession();
    
    // Security: Validate user role
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Security: Additional role validation
    if (session.user.role !== 'MANAGEMENT' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const submissionId = params.id;

    // Security: Validate submission ID format
    if (!submissionId || typeof submissionId !== 'string' || submissionId.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID' },
        { status: 400 }
      );
    }

    // Fetch submission with security filtering
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
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
      }
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Security: Add audit log for submission view
    try {
      await prisma.userAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'SUBMISSION_VIEW',
          details: JSON.stringify({
            submissionId: submissionId,
            timestamp: new Date().toISOString(),
            ipAddress: request.headers.get('x-forwarded-for') || 'unknown'
          }),
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent')?.substring(0, 200) || 'unknown'
        }
      });
    } catch (auditError) {
      console.warn('Failed to log submission view:', auditError);
    }

    return NextResponse.json({
      success: true,
      data: {
        ...submission,
        createdAt: submission.createdAt.toISOString(),
        updatedAt: submission.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Management submission view error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch submission',
        message: 'Unable to load submission details. Please try again.'
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Security: Require management session for access
    const session = await requireManagementSession();
    
    // Security: Validate user role
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Security: Additional role validation
    if (session.user.role !== 'MANAGEMENT' && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const submissionId = params.id;

    // Security: Validate submission ID format
    if (!submissionId || typeof submissionId !== 'string' || submissionId.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const { status } = body;

    // Security: Validate status value
    const allowedStatuses = ['PENDING', 'REVIEWED', 'FLAGGED', 'REJECTED'];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Security: Get IP and user agent for audit
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Update submission status
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: { 
        status,
        updatedAt: new Date()
      },
      select: {
        id: true,
        status: true,
        updatedAt: true
      }
    });

    // Security: Add audit log for status change
    try {
      await prisma.userAuditLog.create({
        data: {
          userId: session.user.id,
          action: 'SUBMISSION_STATUS_UPDATE',
          details: JSON.stringify({
            submissionId: submissionId,
            newStatus: status,
            timestamp: new Date().toISOString(),
            ipAddress: ipAddress,
            userAgent: userAgent.substring(0, 200)
          }),
          ipAddress: ipAddress,
          userAgent: userAgent.substring(0, 200)
        }
      });
    } catch (auditError) {
      console.warn('Failed to log status update:', auditError);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updatedSubmission.id,
        status: updatedSubmission.status,
        updatedAt: updatedSubmission.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Management submission update error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update submission',
        message: 'Unable to update submission status. Please try again.'
      },
      { status: 500 }
    );
  }
}
