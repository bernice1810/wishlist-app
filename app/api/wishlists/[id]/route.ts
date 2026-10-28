import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

interface Params {
    id: string;
}

export async function GET(
    request: Request, 
    props: { params: Promise<Params>}
) {
    try {
        const params = await props.params;
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const clientKey = searchParams.get('key');

        const wishlist = await prisma.wishlist.findUnique({
            where: { id }, 
            include: { items: true},
        })
        if (!wishlist){
            return NextResponse.json({ error: 'Wunschliste nicht gefunden'}, { status: 404 });
        }

        const isCreator = clientKey && clientKey === wishlist.secretKey;

        const sanitizedItems = wishlist.items.map(item => {
            if (isCreator){
                return{
                    ...item,
                    reservedBy: null,
                };
            }
            return item;
        });
        return NextResponse.json({
            title: wishlist.title,
            createdAt: wishlist.createdAt,
            isCreator,
            items: sanitizedItems,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Fehler beim Laden der Wunschliste'}, { status: 500});
    }
    
}