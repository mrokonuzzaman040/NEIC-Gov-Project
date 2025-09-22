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
        nameEn: true,
        nameBn: true,
        designationEn: true,
        designationBn: true,
        descriptionEn: true,
        descriptionBn: true,
        email: true,
        phone: true,
        image: true,
        serialNo: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { serialNo: 'asc' }
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
