import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch all active commission officials for public display
export async function GET(request: NextRequest) {
  try {
    const officials = await prisma.commissionOfficial.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        serial_no: true,
        name_english: true,
        name_bangla: true,
        designation_english: true,
        designation_bangla: true,
        department: true,
        email: true,
        mobile: true,
        room_no: true,
        category: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [
        { category: 'asc' },
        { serial_no: 'asc' },
      ],
    });

    return NextResponse.json({
      officials,
      total: officials.length,
    });
  } catch (error) {
    console.error('Error fetching commission officials:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
