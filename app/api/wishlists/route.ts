import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from 'crypto';
import { error } from "console";

export async function POST(request: Request) {
    try{
        const body = await request.json();
        const { title } = body;

        if (!title) {
            return NextResponse.json({ error: 'Titel ist erforderlich'}, { status: 400});
        }

        const secretKey = crypto.randomBytes(16).toString('hex');

        const wishlist = await prisma.wishlist.create({
            data: {
                title, secretKey,
            },
        });

        return NextResponse.json({ success: true, wishlist}, {status: 200});
    } catch (error){
        return NextResponse.json({ error: 'Fehler beim Erstellen der Wunschliste'}, { status: 500});
    }
}