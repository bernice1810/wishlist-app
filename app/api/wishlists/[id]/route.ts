import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const clientKey = searchParams.get('key');

    const wishlist = await prisma.wishlist.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!wishlist) {
      return NextResponse.json({ error: 'Wunschliste nicht gefunden' }, { status: 404 });
    }

    const isCreator = Boolean(clientKey && clientKey === wishlist.secretKey);

    // Wenn der Ersteller schaut: Überraschungsmodus aktiv!
    // Wer reserviert hat, bleibt geheim.
    const sanitizedItems = wishlist.items.map((item) => {
      if (isCreator) {
        return {
          ...item,
          reservedBy: null,
        };
      }
      return item;
    });

    return NextResponse.json({
      id: wishlist.id,
      title: wishlist.title,
      createdAt: wishlist.createdAt,
      isCreator,
      items: sanitizedItems,
    });
  } catch (error) {
    console.error('Fehler beim Laden der Wunschliste:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Wunschliste' }, { status: 500 });
  }
}
