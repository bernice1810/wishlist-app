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
  const [myLists, setMyLists] = useState<SavedList[]>([]);
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedLists = localStorage.getItem('local_wishlists');
    if (savedLists) {
      try {
        setMyLists(JSON.parse(savedLists));
      } catch (e) {
        console.error(e);
      }
    }

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

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!res.ok) {
        throw new Error('Fehler beim Erstellen');
      }

      const data = await res.json();
      const { id: listId, secretKey: adminKey } = data.wishlist;

      const updatedLists = [{ id: listId, title: title.trim() }, ...myLists];
      setMyLists(updatedLists);
      localStorage.setItem('local_wishlists', JSON.stringify(updatedLists));
      localStorage.setItem(`wishlist_admin_${listId}`, adminKey);

      router.push(`/wishlist?id=${listId}&key=${adminKey}`);
    } catch (err) {
      console.error(err);
      alert('Fehler beim Erstellen der Wunschliste. Bitte prüfe deine Internet- bzw. Datenbankverbindung.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSavedList = async (id: string, title: string) => {
    if (!confirm(`Möchtest du die Wunschliste "${title}" wirklich löschen?`)) {
      return;
    }

    const adminKey = typeof window !== 'undefined' ? localStorage.getItem(`wishlist_admin_${id}`) : '';

    // Falls Admin-Key vorhanden, auch aus der Datenbank löschen
    if (adminKey) {
      try {
        await fetch(`/api/wishlists/${id}?key=${encodeURIComponent(adminKey)}`, {
          method: 'DELETE',
        });
      } catch (e) {
        console.error('Fehler beim Löschen der Liste aus der DB:', e);
      }
    }

    // Aus lokalem Zustand & LocalStorage entfernen
    const updated = myLists.filter((l) => l.id !== id);
    setMyLists(updated);
    localStorage.setItem('local_wishlists', JSON.stringify(updated));
    localStorage.removeItem(`wishlist_admin_${id}`);
    localStorage.removeItem(`wishlist_data_${id}`);
  };

  return (
    <main 
      style={{ backgroundColor: 'var(--app-bg)' }}
      className="min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300"
    >
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Theme-Auswahl mit 4 Pastellfarben */}
        <div className="flex justify-between items-center border-b pb-4">
          <span className="text-xs font-medium text-gray-500">Pastell-Farbschema:</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleThemeChange('blue')}
              className={`w-5 h-5 rounded-full bg-blue-300 transition-transform cursor-pointer ${currentTheme === 'blue' ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : 'opacity-70'}`}
              title="Pastell Blau"
            />
            <button
              onClick={() => handleThemeChange('sage')}
              className={`w-5 h-5 rounded-full bg-[#84a98c] transition-transform cursor-pointer ${currentTheme === 'sage' ? 'ring-2 ring-offset-2 ring-[#84a98c] scale-110' : 'opacity-70'}`}
              title="Pastell Salbei"
            />
            <button
              onClick={() => handleThemeChange('berry')}
              className={`w-5 h-5 rounded-full bg-[#e0b1cb] transition-transform cursor-pointer ${currentTheme === 'berry' ? 'ring-2 ring-offset-2 ring-[#e0b1cb] scale-110' : 'opacity-70'}`}
              title="Pastell Beere"
            />
            <button
              onClick={() => handleThemeChange('yellow')}
              className={`w-5 h-5 rounded-full bg-[#f4e2bb] transition-transform cursor-pointer ${currentTheme === 'yellow' ? 'ring-2 ring-offset-2 ring-[#f4e2bb] scale-110' : 'opacity-70'}`}
              title="Pastell Gelb"
            />
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Wunschliste erstellen</h1>
          <p className="text-sm text-gray-500 text-center">
            Erstelle deine persönliche Wunschliste, teile sie mit Freunden und behalte dank Überraschungsmodus die Spannung!
          </p>
        </div>
        
        <form onSubmit={handleCreateList} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel der Wunschliste</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Geburtstag 2026"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-gray-800"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: 'var(--primary-color)' }}
            className={`w-full py-2.5 text-white font-medium rounded-lg transition-opacity hover:opacity-90 cursor-pointer ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Erstelle Wunschliste...' : 'Wunschliste erstellen'}
          </button>
        </form>

        {myLists.length > 0 && (
          <div className="border-t pt-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Deine gespeicherten Wunschlisten:</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {myLists.map((list) => {
                const adminKey = typeof window !== 'undefined' ? localStorage.getItem(`wishlist_admin_${list.id}`) : '';
                return (
                  <div
                    key={list.id}
                    style={{ backgroundColor: 'var(--accent-bg)' }}
                    className="p-3 rounded-xl border border-gray-200/60 transition-colors text-sm font-medium text-gray-800 flex justify-between items-center group hover:opacity-95"
                  >
                    <Link
                      href={`/wishlist?id=${list.id}${adminKey ? `&key=${adminKey}` : ''}`}
                      className="truncate flex-1 flex items-center justify-between mr-2 hover:underline"
                    >
                      <span className="truncate">{list.title}</span>
                      <span className="text-xs font-semibold whitespace-nowrap ml-2" style={{ color: 'var(--primary-color)' }}>
                        Öffnen →
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDeleteSavedList(list.id, list.title)}
                      title="Wunschliste löschen"
                      className="text-gray-400 hover:text-red-500 p-1 rounded-md transition-colors cursor-pointer"
                      aria-label="Wunschliste löschen"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
