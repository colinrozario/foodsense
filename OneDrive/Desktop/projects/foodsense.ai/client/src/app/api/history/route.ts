import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { scans } from '@/db/schema';
import { desc, eq, isNull } from 'drizzle-orm';

// GET /api/history?userId=1&limit=20
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') ?? '20');

  try {
    let rows;
    if (userId) {
      rows = await db.select().from(scans)
        .where(eq(scans.userId, parseInt(userId)))
        .orderBy(desc(scans.scannedAt))
        .limit(limit);
    } else {
      // Return recent anonymous scans (no userId)
      rows = await db.select().from(scans)
        .where(isNull(scans.userId))
        .orderBy(desc(scans.scannedAt))
        .limit(limit);
    }

    return NextResponse.json({ success: true, history: rows });
  } catch (err) {
    console.error('[History GET]', err);
    return NextResponse.json({ success: false, error: 'DB error' }, { status: 500 });
  }
}

// DELETE /api/history?userId=1
export async function DELETE(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');

  try {
    if (userId) {
      await db.delete(scans).where(eq(scans.userId, parseInt(userId)));
    } else {
      await db.delete(scans).where(isNull(scans.userId));
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[History DELETE]', err);
    return NextResponse.json({ success: false, error: 'DB error' }, { status: 500 });
  }
}
