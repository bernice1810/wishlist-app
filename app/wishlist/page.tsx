'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Item {
  id: string;
  title: string;
  link?: string | null;
  price?: string | null;
  isReserved?: boolean;
  reservedBy?: string | null;
}

interface WishlistData {
  id: string;
  title: string;
  isCreator: boolean;
  items: Item[];
}

function WishlistContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const urlKey = searchParams.get('key');

  const [wishlist, setWishlist] = useState<WishlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('blue');

  useEffect(() => {
    const savedTheme = localStorage.getItem('preferred_theme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName);
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem('preferred_theme', themeName);
  };

  const fetchWishlist = useCallback(async () => {
    if (!id) return;
    try {
      const localAdminKey = typeof window !== 'undefined' ? localStorage.getItem(`wishlist_admin_${id}`) : null;
      const keyToUse = urlKey || localAdminKey || '';

      const res = await fetch(`/api/wishlists/${id}?key=${encodeURIComponent(keyToUse)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError('Wunschliste wurde nicht gefunden.');
        } else {
          setError('Fehler beim Laden der Wunschliste.');
        }
        setWishlist(null);
        return;
      }

      const data: WishlistData = await res.json();
      setWishlist(data);
      setIsCreator(data.isCreator);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Verbindungsfehler beim Laden der Wunschliste.');
    } finally {
      setLoading(false);
    }
  }, [id, urlKey]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !id || isAdding) return;

    setIsAdding(true);
    try {
      const res = await fetch(`/api/wishlists/${id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newItemTitle.trim() }),
      });

      if (!res.ok) {
        throw new Error('Fehler beim Hinzufügen des Wunsches');
      }

      setNewItemTitle('');
      await fetchWishlist();
    } catch (err) {
      console.error(err);
      alert('Fehler beim Hinzufügen des Wunsches.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Möchtest du diesen Wunsch wirklich löschen?')) return;

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Fehler beim Löschen');
      }

      // Optimistisch aus UI entfernen
      setWishlist((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((item) => item.id !== itemId),
            }
          : prev
      );
    } catch (err) {
      console.error(err);
      alert('Fehler beim Löschen des Wunsches.');
    }
  };

  const handleToggleReservation = async (itemId: string, currentReserved: boolean) => {
    const shouldReserve = !currentReserved;

    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shouldReserve }),
      });

      if (!res.ok) {
        throw new Error('Fehler beim Reservieren');
      }

      await fetchWishlist();
    } catch (err) {
      console.error(err);
      alert('Fehler beim Aktualisieren der Reservierung.');
    }
  };

  const handleCopyLink = () => {
    if (!id) return;
    // Für Freunde immer den neutralen Gästelink ohne Admin-Key kopieren!
    const guestUrl = `${window.location.origin}/wishlist?id=${id}`;
    navigator.clipboard.writeText(guestUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  if (!id) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Keine Wunschlisten-ID angegeben.</div>;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Wunschliste wird geladen...</div>;
  }

  if (error || !wishlist) {
    return (
      <main style={{ backgroundColor: 'var(--app-bg)' }} className="min-h-screen p-6 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-sm text-center space-y-4">
          <p className="text-red-500 font-medium">{error || 'Wunschliste nicht gefunden'}</p>
          <Link href="/" className="inline-block text-sm font-medium hover:underline" style={{ color: 'var(--primary-color)' }}>
            ← Zurück zur Startseite
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{ backgroundColor: 'var(--app-bg)' }}
      className="min-h-screen p-6 flex flex-col items-center transition-colors duration-300"
    >
      <div className="max-w-xl w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <Link href="/" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary-color)' }}>
            ← Zurück zur Übersicht
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500 hidden sm:inline">Farbschema:</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleThemeChange('blue')}
                className={`w-5 h-5 rounded-full bg-blue-300 transition-transform cursor-pointer ${currentTheme === 'blue' ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : 'opacity-70'}`}
                title="Pastell Blau"
              />
              <button
                type="button"
                onClick={() => handleThemeChange('sage')}
                className={`w-5 h-5 rounded-full bg-[#84a98c] transition-transform cursor-pointer ${currentTheme === 'sage' ? 'ring-2 ring-offset-2 ring-[#84a98c] scale-110' : 'opacity-70'}`}
                title="Pastell Salbei"
              />
              <button
                type="button"
                onClick={() => handleThemeChange('berry')}
                className={`w-5 h-5 rounded-full bg-[#e0b1cb] transition-transform cursor-pointer ${currentTheme === 'berry' ? 'ring-2 ring-offset-2 ring-[#e0b1cb] scale-110' : 'opacity-70'}`}
                title="Pastell Beere"
              />
              <button
                type="button"
                onClick={() => handleThemeChange('yellow')}
                className={`w-5 h-5 rounded-full bg-[#f4e2bb] transition-transform cursor-pointer ${currentTheme === 'yellow' ? 'ring-2 ring-offset-2 ring-[#f4e2bb] scale-110' : 'opacity-70'}`}
                title="Pastell Gelb"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 border-b pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">{wishlist.title}</h1>
            <button
              onClick={handleCopyLink}
              style={{ backgroundColor: 'var(--accent-bg)', color: 'var(--primary-color)' }}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-opacity hover:opacity-80 flex items-center gap-1.5 cursor-pointer"
            >
              {copySuccess ? '✓ Gästelink kopiert!' : '📋 Gästelink teilen'}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            {isCreator
              ? '🔒 Du bist im Admin-Modus (Überraschungsmodus aktiv – wer was schenkt, bleibt für dich geheim)'
              : '🎁 Du betrachtest diese Liste als Gast'}
          </p>
        </div>

        {isCreator && (
          <form onSubmit={handleAddItem} className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="Neuen Wunsch hinzufügen..."
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none text-gray-800"
              disabled={isAdding}
            />
            <button
              type="submit"
              disabled={isAdding}
              style={{ backgroundColor: 'var(--primary-color)' }}
              className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-opacity hover:opacity-90 cursor-pointer ${isAdding ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isAdding ? 'Hinzufügen...' : 'Hinzufügen'}
            </button>
          </form>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700">Wünsche</h2>

          {wishlist.items.length === 0 ? (
            <p className="text-gray-400 text-sm">Aktuell stehen noch keine Wünsche auf dieser Liste.</p>
          ) : (
            wishlist.items.map((item) => {
              const reserved = Boolean(item.isReserved || item.reservedBy);
              return (
                <div
                  key={item.id}
                  className="p-4 border border-gray-200 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                >
                  <div>
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isCreator
                        ? 'Status: Auf der Liste'
                        : reserved
                        ? 'Status: Bereits reserviert'
                        : 'Status: Noch frei'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {isCreator && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-3 py-1.5 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors border border-red-200 cursor-pointer"
                      >
                        Löschen
                      </button>
                    )}

                    {!isCreator && (
                      <>
                        {!reserved ? (
                          <button
                            onClick={() => handleToggleReservation(item.id, false)}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
                          >
                            Schenke ich
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleReservation(item.id, true)}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors cursor-pointer"
                          >
                            Freigeben
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

export default function WishlistPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Lade Seite...</div>}>
      <WishlistContent />
    </Suspense>
  );
}
