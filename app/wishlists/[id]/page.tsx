'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

interface Item {
    id: string;
    title: string;
    reservedBy?: string | null;
}

interface Wishlist {
    title: string;
    createdAt: string;
    isCreator: boolean;
    items: Item[];
}

function WishlistDetailContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params.id as string;

    const [wishlist, setWishlist] = useState<Wishlist | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchWishlist = async () => {
        try {
            let key = searchParams.get('key');

            if (!key && typeof window !== 'undefined'){
                key = localStorage.getItem(`wishlist_key_${id}`);
            }
            const url = key ? `/api/wishlists/${id}?key=${key}`: `/api/wishlists/${id}`;
            const res = await fetch(url);
            const data = await res.json();

            if(res.ok){
                setWishlist(data);
            } else {
                setError(data.error || 'Fehler beim Laden der Wunschliste');
            }
        } catch (err){
            setError('Ein Netzwerkfehler ist aufgetreten.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id){
            fetchWishlist();
        }
    }, [id, searchParams]);

    const handleToggleReservation = async (itemId: string, currentReservedBy: string | null | undefined) => {
        const shouldReserve = !currentReservedBy;

        try {
            const res = await fetch(`/api/items/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shouldReserve }),
            });

            if (res.ok){
                fetchWishlist();
            } else {
                alert('Fehler beim Aktualisieren der Reservierung');
            }
        } catch (err){
            console.error(err);
        }
    };
    
    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500">Wunschliste wird geladen...</div>;
    }

    if (error || !wishlist){
        return <div className="min-h-screen flex items-center justify-center text-red-500">{error || 'Nicht gefunden'}</div>;
    }

    return(
        <main className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="mb-6 border-b pb-4">
                    <h1 className="text-2xl font-bold text-gray-800">{wishlist.title}</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        {wishlist.isCreator
                        ? '🔒 Du bist im Admin-Modus (Überraschungsmodus aktiv)'
                        : '🎁 Du betrachtest diese Liste als Gast'}
                    </p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-700">Wünsche</h2>

                    {wishlist.items.length === 0 ? (
                        <p className="text-gray-400 text-sm">Aktuell stehen noch keine Wünsche auf dieser Liste</p>
                    ) : (
                        wishlist.items.map((item) => (
                            <div key={item.id} className="p-4 border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div>
                                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {wishlist.isCreator
                                        ? 'Status: Auf der Liste'
                                        : item.reservedBy
                                            ? 'Status: Bereits reserviert'
                                            : 'Status: Noch frei'}
                                    </p>
                                </div>
                                {!wishlist.isCreator && (
                                    <div>
                                        {!item.reservedBy ? (
                                            <button
                                                onClick={() => handleToggleReservation(item.id, item.reservedBy)}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                Schenke ich
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleToggleReservation(item.id, item.reservedBy)}
                                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                            >
                                                Freigeben
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}

// Hauptkomponente mit Suspense-Boundary gewrapped, damit Next.js glücklich ist
export default function WishlistDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Lade Seite...</div>}>
            <WishlistDetailContent />
        </Suspense>
    );
}
