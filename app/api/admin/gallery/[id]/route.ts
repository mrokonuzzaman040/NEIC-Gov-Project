import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';

// GET - Fetch single gallery item by ID (admin/management only)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!currentUser || !['ADMIN', 'MANAGEMENT'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: 'Gallery item ID is required' }, { status: 400 });
    }

    const item = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!item) {
      return NextResponse.json({ error: 'Gallery item not found' }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Error fetching gallery item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
