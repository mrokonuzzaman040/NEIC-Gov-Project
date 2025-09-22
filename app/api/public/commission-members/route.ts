import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - Fetch all active commission members (public endpoint)
export async function GET() {
  try {
    const members = await prisma.commissionMember.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        serial_no: true,
        name_english: true,
        name_bengali: true,
        role_type: true,
        designation_english: true,
        designation_bengali: true,
        department_english: true,
        department_bengali: true,
        description_english: true,
        description_bengali: true,
        email: true,
        phone: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { serial_no: 'asc' }
    });

    return NextResponse.json({
      members,
      total: members.length
    });
  } catch (error) {
    console.error('Error fetching commission members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
