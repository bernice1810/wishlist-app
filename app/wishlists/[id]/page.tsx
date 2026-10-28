'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';

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
    
    const [newItemTitle, setNewItemTitle] = useState('');
    const [copySuccess, setCopySuccess] = useState(false);

    // Theme beim Laden der Detailseite anwenden
    useEffect(() => {
        const savedTheme = localStorage.getItem('preferred_theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

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

    // Wunsch hinzufügen
    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newItemTitle.trim()) return;

        try {
            const res = await fetch(`/api/wishlists/${id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newItemTitle }),
            });

            if (res.ok) {
                setNewItemTitle('');
                fetchWishlist();
            } else {
                alert('Fehler beim Hinzufügen des Wunsches');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Wunsch löschen (nur für Admin)
    const handleDeleteItem = async (itemId: string) => {
        if (!confirm('Möchtest du diesen Wunsch wirklich löschen?')) return;

        try {
            const res = await fetch(`/api/items/${itemId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                fetchWishlist();
            } else {
                alert('Fehler beim Löschen des Wunsches');
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCopyLink = () => {
        const currentUrl = window.location.href;
        navigator.clipboard.writeText(currentUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2500);
    };

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
        <main 
            style={{ backgroundColor: 'var(--app-bg)' }}
            className="min-h-screen p-6 flex flex-col items-center transition-colors duration-300"
        >
            <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                
                {/* Theme-Auswahl & Zurück-Link auf der Detailseite */}
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <Link href="/" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary-color)' }}>
                        ← Zurück zur Übersicht
                    </Link>
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-400">Farbe:</span>
                        <button
                            onClick={() => {
                                document.documentElement.setAttribute('data-theme', 'blue');
                                localStorage.setItem('preferred_theme', 'blue');
                            }}
                            className="w-4 h-4 rounded-full bg-blue-300 hover:scale-110 transition-transform cursor-pointer"
                            title="Pastell Blau"
                        />
                        <button
                            onClick={() => {
                                document.documentElement.setAttribute('data-theme', 'sage');
                                localStorage.setItem('preferred_theme', 'sage');
                            }}
                            className="w-4 h-4 rounded-full bg-[#84a98c] hover:scale-110 transition-transform cursor-pointer"
                            title="Pastell Salbei"
                        />
                        <button
                            onClick={() => {
                                document.documentElement.setAttribute('data-theme', 'berry');
                                localStorage.setItem('preferred_theme', 'berry');
                            }}
                            className="w-4 h-4 rounded-full bg-[#e0b1cb] hover:scale-110 transition-transform cursor-pointer"
                            title="Pastell Beere"
                        />
                        <button
                            onClick={() => {
                                document.documentElement.setAttribute('data-theme', 'yellow');
                                localStorage.setItem('preferred_theme', 'yellow');
                            }}
                            className="w-4 h-4 rounded-full bg-[#f4e2bb] hover:scale-110 transition-transform cursor-pointer"
                            title="Pastell Gelb"
                        />
                    </div>
                </div>

                <div className="mb-6 border-b pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-800">{wishlist.title}</h1>
                        <button
                            onClick={handleCopyLink}
                            style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--primary-color)' }}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-opacity hover:opacity-80 flex items-center gap-1.5"
                        >
                            {copySuccess ? '✓ Link kopiert!' : '📋 Link teilen'}
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                        {wishlist.isCreator
                        ? '🔒 Du bist im Admin-Modus (Überraschungsmodus aktiv)'
                        : '🎁 Du betrachtest diese Liste als Gast'}
                    </p>
                </div>

                {wishlist.isCreator && (
                    <form onSubmit={handleAddItem} className="mb-6 flex gap-2">
                        <input
                            type="text"
                            placeholder="Neuen Wunsch hinzufügen..."
                            value={newItemTitle}
                            onChange={(e) => setNewItemTitle(e.target.value)}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none text-gray-800"
                        />
                        <button
                            type="submit"
                            style={{ backgroundColor: 'var(--primary-color)' }}
                            className="px-4 py-2 text-white text-sm font-medium rounded-lg transition-opacity hover:opacity-90"
                        >
                            Hinzufügen
                        </button>
                    </form>
                )}

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

                                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    {wishlist.isCreator && (
                                        <button
                                            onClick={() => handleDeleteItem(item.id)}
                                            className="px-3 py-1.5 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors border border-red-200"
                                        >
                                            Löschen
                                        </button>
                                    )}

                                    {!wishlist.isCreator && (
                                        <>
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
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}

export default function WishlistDetailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Lade Seite...</div>}>
            <WishlistDetailContent />
        </Suspense>
    );
}
