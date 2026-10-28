import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { shouldReserve, reservedBy } = body;

    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        isReserved: Boolean(shouldReserve),
        reservedBy: shouldReserve ? (reservedBy || 'Reserviert') : null,
      },
    });

    return NextResponse.json({ success: true, updatedItem }, { status: 200 });
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Wunsches:', error);
    return NextResponse.json({ error: 'Fehler beim Aktualisieren des Wunsches' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id } = params;

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Fehler beim Löschen des Wunsches:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen des Wunsches' }, { status: 500 });
  }
}
