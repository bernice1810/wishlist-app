import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

interface Params {
    params: {
        id: string;
    };
}

export async function PATCH(request: Request, { params }: Params){
    try {
        const { id } = params;
        const body = await request.json();
        const { shouldReserve } = body;

        const updatedItem = await prisma.item.update({
            where: { id },
            data: {
                reservedBy: shouldReserve ? 'Reserviert' : null,
            },
        });

        return NextResponse.json({ success: true, updatedItem}, { status: 200});
    } catch (error){
        return NextResponse.json({ error: 'Fehler beim Aktualisieren des Wunsches'}, { status: 500});
    }
}