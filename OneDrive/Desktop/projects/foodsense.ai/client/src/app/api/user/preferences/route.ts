import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/user/preferences?userId=1
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.id, parseInt(userId))).limit(1);
    return NextResponse.json({
      success: true,
      preferences: user?.preferences ?? { allergens: [], diet: [], goals: [] },
    });
  } catch (err) {
    console.error('[Preferences GET]', err);
    return NextResponse.json({ success: false, error: 'DB error' }, { status: 500 });
  }
}

// POST /api/user/preferences
// Body: { userId?: number, preferences: { allergens, diet, goals } }
export async function POST(req: NextRequest) {
  try {
    const { userId, preferences } = await req.json();

    if (userId) {
      // Update existing user
      await db.update(users)
        .set({ preferences })
        .where(eq(users.id, userId));
      return NextResponse.json({ success: true, userId });
    } else {
      // Create new anonymous user row
      const [newUser] = await db.insert(users)
        .values({ preferences })
        .returning({ id: users.id });
      return NextResponse.json({ success: true, userId: newUser.id });
    }
  } catch (err) {
    console.error('[Preferences POST]', err);
    return NextResponse.json({ success: false, error: 'DB error' }, { status: 500 });
  }
}
