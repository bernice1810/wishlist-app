'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SavedList {
  id: string;
  title: string;
}

export default function Home() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [myLists, setMyLists] = useState<SavedList[]>([]);
  const router = useRouter();

  // Lade beim Start alle bisher erstellten Listen aus dem Browser-Speicher
  useEffect(() => {
    const saved = localStorage.getItem('my_wishlists');
    if (saved) {
      try {
        setMyLists(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });

      const data = await res.json();

      if (res.ok && data.wishlist) {
        // Schlüssel abspeichern
        localStorage.setItem(`wishlist_key_${data.wishlist.id}`, data.wishlist.secretKey);
        
        // Zur lokalen Liste hinzufügen und speichern
        const newList = { id: data.wishlist.id, title: data.wishlist.title };
        const updatedLists = [newList, ...myLists];
        setMyLists(updatedLists);
        localStorage.setItem('my_wishlists', JSON.stringify(updatedLists));

        // Weiterleiten
        router.push(`/wishlists/${data.wishlist.id}?key=${data.wishlist.secretKey}`);
      } else {
        alert(data.error || 'Fehler beim Erstellen der Wunschliste');
      }
    } catch (err) {
      console.error(err);
      alert('Ein Netzwerkfehler ist aufgetreten.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Wunschliste erstellen</h1>
          <p className="text-sm text-gray-500 text-center">
            Erstelle deine persönliche Wunschliste, teile sie mit Freunden und behalte dank Überraschungsmodus die Spannung!
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel der Wunschliste</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Geburtstag 2026"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Wird erstellt...' : 'Wunschliste erstellen'}
          </button>
        </form>

        {/* Kleine Menü-Übersicht deiner erstellten Listen */}
        {myLists.length > 0 && (
          <div className="border-t pt-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Deine gespeicherten Wunschlisten:</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {myLists.map((list) => {
                const key = typeof window !== 'undefined' ? localStorage.getItem(`wishlist_key_${list.id}`) : '';
                return (
                  <Link
                    key={list.id}
                    href={`/wishlists/${list.id}${key ? `?key=${key}` : ''}`}
                    className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors text-sm font-medium text-gray-800 flex justify-between items-center"
                  >
                    <span className="truncate">{list.title}</span>
                    <span className="text-xs text-blue-600 whitespace-nowrap ml-2">Öffnen →</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
