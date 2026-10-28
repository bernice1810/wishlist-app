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

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Erzeuge eine eindeutige ID und einen Admin-Key für die neue Liste
    const listId = Math.random().toString(36).substring(2, 9);
    const adminKey = Math.random().toString(36).substring(2, 12);

    const newListData = {
      id: listId,
      title: title.trim(),
      items: [],
      createdAt: new Date().toISOString(),
    };

    // Speichere die Liste in localStorage
    localStorage.setItem(`wishlist_data_${listId}`, JSON.stringify(newListData));
    localStorage.setItem(`wishlist_admin_${listId}`, adminKey);

    // Füge sie zur lokalen Übersichtsliste hinzu
    const updatedLists = [{ id: listId, title: title.trim() }, ...myLists];
    setMyLists(updatedLists);
    localStorage.setItem('local_wishlists', JSON.stringify(updatedLists));

    // Weiterleitung zur Detailseite mit Admin-Modus
    router.push(`/wishlists/${listId}?key=${adminKey}`);
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
            style={{ backgroundColor: 'var(--primary-color)' }}
            className="w-full py-2.5 text-white font-medium rounded-lg transition-opacity hover:opacity-90 cursor-pointer"
          >
            Wunschliste erstellen
          </button>
        </form>

        {myLists.length > 0 && (
          <div className="border-t pt-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Deine gespeicherten Wunschlisten:</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {myLists.map((list) => {
                const adminKey = typeof window !== 'undefined' ? localStorage.getItem(`wishlist_admin_${list.id}`) : '';
                return (
                  <Link
                    key={list.id}
                    href={`/wishlists/${list.id}${adminKey ? `?key=${adminKey}` : ''}`}
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
