import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface Params {
  id: string;
}

// PATCH: Wunsch reservieren / freigeben
export async function PATCH(request: Request, props: { params: Promise<Params> }) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { shouldReserve } = body;

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        reservedBy: shouldReserve ? 'Reserviert' : null,
      },
    });

    return NextResponse.json({ success: true, updatedItem }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Wunsches' }, { status: 500 });
  }
}

// DELETE: Einen Wunsch komplett von der Liste löschen
export async function DELETE(request: Request, props: { params: Promise<Params> }) {
  try {
    const params = await props.params;
    const { id } = params;

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Fehler beim Löschen des Wunsches' }, { status: 500 });
  }
}
