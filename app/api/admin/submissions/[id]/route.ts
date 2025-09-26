import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireManagementSession } from '@/lib/session-wrapper';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check management or admin authentication
    await requireManagementSession();

    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        contact: true,
        email: true,
        message: true,
        locale: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        attachmentUrl: true,
        attachmentKey: true,
        attachmentName: true,
        attachmentSize: true,
        attachmentType: true,
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ submission });

  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check management or admin authentication
    await requireManagementSession();

    const body = await req.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['PENDING', 'REVIEWED', 'FLAGGED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id: params.id },
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

    return NextResponse.json({ 
      success: true,
      submission: updatedSubmission
    });

  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check management or admin authentication
    await requireManagementSession();

    const body = await req.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['PENDING', 'REVIEWED', 'FLAGGED'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update submission
    const updatedSubmission = await prisma.submission.update({
      where: { id: params.id },
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

    return NextResponse.json({ 
      success: true,
      submission: updatedSubmission
    });

  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check management or admin authentication
    await requireManagementSession();

    // First get the submission to check for attachments
    const submission = await prisma.submission.findUnique({
      where: { id: params.id },
      select: {
        attachmentKey: true,
        attachmentUrl: true
      }
    });

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // TODO: If there's an attachment, delete it from local storage
    // if (submission.attachmentKey) {
    //   await deleteFile(submission.attachmentKey);
    // }

    // Delete the submission
    await prisma.submission.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Submission deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting submission:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}
