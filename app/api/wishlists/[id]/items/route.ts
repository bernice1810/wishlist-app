import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

// POST: Einen neuen Wunsch zur Wunschliste hinzufügen
export async function POST(
  request: Request,
  props: { params: Promise<Params> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { title } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Der Titel des Wunsches darf nicht leer sein' },
        { status: 400 }
      );
    }

    // Prüfen, ob die Wunschliste überhaupt existiert
    const wishlist = await prisma.wishlist.findUnique({
      where: { id },
    });

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wunschliste nicht gefunden' },
        { status: 404 }
      );
    }

    // Neuen Wunsch erstellen und mit der Wunschliste verknüpfen
    const newItem = await prisma.item.create({
      data: {
        title: title.trim(),
        wishlistId: id,
      },
    });

    return NextResponse.json({ success: true, newItem }, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Hinzufügen des Wunsches:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
