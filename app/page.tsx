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
  const [currentTheme, setCurrentTheme] = useState('blue');
  const router = useRouter();

  useEffect(() => {
    const savedLists = localStorage.getItem('my_wishlists');
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
        localStorage.setItem(`wishlist_key_${data.wishlist.id}`, data.wishlist.secretKey);
        
        const newList = { id: data.wishlist.id, title: data.wishlist.title };
        const updatedLists = [newList, ...myLists];
        setMyLists(updatedLists);
        localStorage.setItem('my_wishlists', JSON.stringify(updatedLists));

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
              className={`w-5 h-5 rounded-full bg-blue-300 transition-transform ${currentTheme === 'blue' ? 'ring-2 ring-offset-2 ring-blue-400 scale-110' : 'opacity-70'}`}
              title="Pastell Blau"
            />
            <button
              onClick={() => handleThemeChange('sage')}
              className={`w-5 h-5 rounded-full bg-[#84a98c] transition-transform ${currentTheme === 'sage' ? 'ring-2 ring-offset-2 ring-[#84a98c] scale-110' : 'opacity-70'}`}
              title="Pastell Salbei"
            />
            <button
              onClick={() => handleThemeChange('berry')}
              className={`w-5 h-5 rounded-full bg-[#e0b1cb] transition-transform ${currentTheme === 'berry' ? 'ring-2 ring-offset-2 ring-[#e0b1cb] scale-110' : 'opacity-70'}`}
              title="Pastell Beere"
            />
            <button
              onClick={() => handleThemeChange('yellow')}
              className={`w-5 h-5 rounded-full bg-[#f4e2bb] transition-transform ${currentTheme === 'yellow' ? 'ring-2 ring-offset-2 ring-[#f4e2bb] scale-110' : 'opacity-70'}`}
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
        
        <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full py-2.5 text-white font-medium rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Wird erstellt...' : 'Wunschliste erstellen'}
          </button>
        </form>

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
                    style={{ backgroundColor: 'var(--accent-bg)' }}
                    className="block p-3 rounded-xl border border-gray-200/60 transition-colors text-sm font-medium text-gray-800 flex justify-between items-center hover:opacity-80"
                  >
                    <span className="truncate">{list.title}</span>
                    <span className="text-xs font-semibold whitespace-nowrap ml-2" style={{ color: 'var(--primary-color)' }}>Öffnen →</span>
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
