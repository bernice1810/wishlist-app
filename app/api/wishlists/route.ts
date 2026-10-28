import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Titel ist erforderlich' }, { status: 400 });
    }

    const secretKey = crypto.randomBytes(16).toString('hex');

    const wishlist = await prisma.wishlist.create({
      data: {
        title: title.trim(),
        secretKey,
      },
    });

    return NextResponse.json({ success: true, wishlist }, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen der Wunschliste:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen der Wunschliste' }, { status: 500 });
  }
}
