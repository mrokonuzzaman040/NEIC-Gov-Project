import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// GET - Fetch commission scope data (public endpoint)
export async function GET() {
  try {
    // Read the commission scope JSON file
    const filePath = path.join(process.cwd(), 'data', 'commisson', 'commission_scope.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const scopeData = JSON.parse(fileContents);

    return NextResponse.json(scopeData);
  } catch (error) {
    console.error('Error reading commission scope data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
