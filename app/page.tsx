'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try{
      const res = await fetch('/api/wishlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ title }),
      });

      const data = await res.json();

      if (res.ok && data.wishlist) {
        localStorage.setItem(`wishlist_key_${data.wishlist.id}`, data.wishlist.secretKey);

        router.push(`/wishlists/${data.wishlist.id}?key=${data.wishlist.secretKey}`);
      } else {
        alert(data.error || 'Fehler beim Erstellen der Wunschliste');
      }
    } catch (err){
      console.error(err);
      alert('Ein Netzwerkfehler ist aufgetreten. ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">Wunschliste erstellen</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Erstelle deine persönliche Wunschliste, teile sie mit Freunden und behalte dank Überraschungsmodus die Spannung!
        </p>

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
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Wird erstellt...' : 'Wunschliste erstellen'}
          </button>
        </form>
      </div>
    </main>
  );
}