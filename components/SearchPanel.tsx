import React, { useState } from 'react';
import { Search, X, Loader2, Plus, BookOpen, Check } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  pages: number;
}

interface SearchPanelProps {
  onClose: () => void;
  onAdd: (books: Omit<any, 'id' | 'tier' | 'sessions' | 'comments' | 'dnfProgress' | 'tags'>[]) => void;
  accentColor: string;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onClose, onAdd, accentColor }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10`);
      const data = await response.json();
      
      const formatted = (data.items || []).map((item: any) => ({
        id: item.id,
        title: item.volumeInfo.title,
        author: item.volumeInfo.authors?.[0] || 'Unknown Author',
        coverUrl: item.volumeInfo.imageLinks?.thumbnail?.replace('http:', 'https:') || '',
        pages: item.volumeInfo.pageCount || 300,
      }));
      
      setResults(formatted);
      setSelectedIds(new Set()); // Reset selection on new search
    } catch (error) {
      console.error('Search failed', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleAddSelected = () => {
    const selectedBooks = results.filter(r => selectedIds.has(r.id));
    if (selectedBooks.length === 0) return;
    onAdd(selectedBooks);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Expand Library</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Search & Select Multiple Books</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSearch} className="p-6 bg-gray-50/50">
          <div className="relative">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full pl-14 pr-4 py-4 rounded-3xl border-2 focus:ring-4 ring-indigo-50 outline-none transition-all shadow-inner text-lg font-medium"
              style={{ borderColor: `${accentColor}22` }}
              autoFocus
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 text-gray-300" />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2 rounded-2xl text-white font-black uppercase text-xs tracking-widest shadow-lg transition-all active:scale-95"
              style={{ backgroundColor: accentColor }}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </form>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {results.map(book => {
            const isSelected = selectedIds.has(book.id);
            return (
              <div 
                key={book.id} 
                onClick={() => toggleSelection(book.id)}
                className={`flex items-center gap-5 p-4 rounded-3xl border-2 cursor-pointer transition-all ${isSelected ? 'border-indigo-400 bg-indigo-50/50 shadow-md translate-x-2' : 'border-transparent hover:border-gray-100 hover:bg-gray-50'}`}
              >
                <div className="relative">
                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className="w-20 h-28 object-cover rounded-2xl shadow-md border-2 border-white"
                    />
                  ) : (
                    <div className="w-20 h-28 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-white">
                      <BookOpen className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1.5 shadow-lg border-2 border-white animate-in zoom-in">
                      <Check className="w-4 h-4" strokeWidth={4} />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-gray-900 leading-tight text-lg">{book.title}</h3>
                  <p className="text-sm font-medium text-gray-500 mt-1">{book.author}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-1">{book.pages} Pages</p>
                </div>
              </div>
            );
          })}
          {!loading && results.length === 0 && query && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold">No results found for "{query}"</p>
            </div>
          )}
          {!query && (
            <div className="text-center py-16 opacity-30">
              <BookOpen className="w-16 h-16 mx-auto mb-4" />
              <p className="font-black text-xl uppercase tracking-tighter italic">Enter a keyword to begin</p>
            </div>
          )}
        </div>

        {selectedIds.size > 0 && (
          <div className="p-6 border-t bg-gray-50 flex items-center justify-between animate-in slide-in-from-bottom-5">
            <div className="flex flex-col">
              <span className="font-black text-gray-800 text-sm uppercase tracking-tight">{selectedIds.size} Selected</span>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-[10px] font-black uppercase text-indigo-500 text-left hover:underline"
              >
                Clear Selection
              </button>
            </div>
            <button 
              onClick={handleAddSelected}
              className="px-8 py-3 rounded-2xl text-white font-black uppercase text-xs tracking-[0.2em] shadow-xl transform transition-all active:scale-95 hover:scale-105"
              style={{ backgroundColor: accentColor }}
            >
              Add to Library
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPanel;