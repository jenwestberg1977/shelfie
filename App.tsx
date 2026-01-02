import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  BookOpen, 
  Settings, 
  Plus, 
  ChevronRight, 
  Trash2, 
  BarChart2 
} from 'lucide-react';
import { TIERS, THEME_PRESETS } from './constants';
import { Book, TierId, ThemePreset, ThemeColors } from './types';
import SearchPanel from './components/SearchPanel';
import BookModal from './components/BookModal';
import ThemeManager from './components/ThemeManager';
import InsightsDashboard from './components/InsightsDashboard';

const App: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [goal, setGoal] = useState<number>(12);
  const [activeTheme, setActiveTheme] = useState<ThemePreset>('Botanical Garden');
  const [customColors, setCustomColors] = useState<ThemeColors>(THEME_PRESETS['Botanical Garden']);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [isInsightsOpen, setIsInsightsOpen] = useState(false);
  const [draggedBookId, setDraggedBookId] = useState<string | null>(null);
  const [dragOverTier, setDragOverTier] = useState<TierId | null>(null);
  const [dragOverBookId, setDragOverBookId] = useState<string | null>(null);

  // Persistence
  useEffect(() => {
    const savedBooks = localStorage.getItem('shelfie_books');
    const savedTheme = localStorage.getItem('shelfie_theme');
    const savedColors = localStorage.getItem('shelfie_colors');
    const savedGoal = localStorage.getItem('shelfie_goal');
    
    if (savedBooks) setBooks(JSON.parse(savedBooks));
    if (savedTheme && (savedTheme === 'Botanical Garden' || savedTheme === 'Midnight Galaxy' || savedTheme === 'Pastel Dream' || savedTheme === 'Custom')) {
      setActiveTheme(savedTheme as ThemePreset);
    }
    if (savedColors) setCustomColors(JSON.parse(savedColors));
    if (savedGoal) setGoal(parseInt(savedGoal));
  }, []);

  useEffect(() => {
    localStorage.setItem('shelfie_books', JSON.stringify(books));
    localStorage.setItem('shelfie_theme', activeTheme);
    localStorage.setItem('shelfie_colors', JSON.stringify(customColors));
    localStorage.setItem('shelfie_goal', goal.toString());
  }, [books, activeTheme, customColors, goal]);

  const currentColors = useMemo(() => {
    return activeTheme === 'Custom' ? customColors : THEME_PRESETS[activeTheme];
  }, [activeTheme, customColors]);

  const themeClassName = useMemo(() => {
    return `theme-${activeTheme.toLowerCase().replace(/\s+/g, '-')}`;
  }, [activeTheme]);

  const globalUsedTags = useMemo(() => {
    const tagSet = new Set<string>();
    books.forEach(b => {
      b.tags?.forEach(t => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [books]);

  const addBooks = useCallback((newBooks: Omit<Book, 'id' | 'tier' | 'sessions' | 'comments' | 'dnfProgress' | 'tags'>[]) => {
    const preparedBooks: Book[] = newBooks.map((nb, index) => ({
      ...nb,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
      tier: 'TBR',
      sessions: [],
      comments: '',
      dnfProgress: 0,
      tags: [],
      pages: nb.pages || 300,
    }));
    setBooks(prev => [...prev, ...preparedBooks]);
    setIsSearchOpen(false);
  }, []);

  const updateBook = useCallback((updatedBook: Book) => {
    setBooks(prev => prev.map(b => b.id === updatedBook.id ? updatedBook : b));
    setSelectedBook(null);
  }, []);

  const deleteBook = useCallback((id: string) => {
    setBooks(prevBooks => prevBooks.filter(b => b.id !== id));
    setSelectedBook(null);
    setDraggedBookId(null);
  }, []);

  const totalBooksRead = useMemo(() => {
    return books.reduce((acc, book) => {
      if (['GOD', 'A', 'B', 'C'].includes(book.tier)) return acc + 1;
      if (book.tier === 'DNF' && (book.dnfProgress || 0) >= 80) return acc + 1;
      return acc;
    }, 0);
  }, [books]);

  const booksByTier = useMemo(() => {
    const map: Record<TierId, Book[]> = {
      TBR: [], GOD: [], A: [], B: [], C: [], DNF: []
    };
    books.forEach(b => map[b.tier].push(b));
    return map;
  }, [books]);

  const moveAndReorderBook = (dragId: string, targetTier: TierId, targetBookId: string | null) => {
    setBooks(prev => {
      const result = [...prev];
      const draggedIndex = result.findIndex(b => b.id === dragId);
      if (draggedIndex === -1) return prev;

      const [draggedBook] = result.splice(draggedIndex, 1);
      draggedBook.tier = targetTier;

      if (targetBookId) {
        const targetIndex = result.findIndex(b => b.id === targetBookId);
        result.splice(targetIndex, 0, draggedBook);
      } else {
        result.push(draggedBook);
      }
      return result;
    });
  };

  const handleDragStart = (id: string) => setDraggedBookId(id);
  const resetDrag = () => { 
    setDraggedBookId(null); 
    setDragOverTier(null); 
    setDragOverBookId(null); 
  };

  const onDropOnTier = (tierId: TierId) => {
    if (draggedBookId) moveAndReorderBook(draggedBookId, tierId, null);
    resetDrag();
  };

  const onDropOnBook = (e: React.DragEvent, targetBookId: string, tierId: TierId) => {
    e.stopPropagation();
    if (draggedBookId && draggedBookId !== targetBookId) {
      moveAndReorderBook(draggedBookId, tierId, targetBookId);
    }
    resetDrag();
  };

  const handleCardDelete = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${title}"?`)) {
      deleteBook(id);
    }
  };

  // Helper to determine book size based on density
  const getBookMetrics = (count: number) => {
    if (count <= 6) return { width: 128, gap: 'gap-6', showText: true };
    if (count <= 15) return { width: 100, gap: 'gap-4', showText: true };
    if (count <= 30) return { width: 80, gap: 'gap-3', showText: false };
    return { width: 64, gap: 'gap-2', showText: false };
  };

  // Helper to chunk the books array for multiple shelf lines
  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  return (
    <div 
      className={`min-h-screen transition-colors duration-500 pb-20 relative ${themeClassName}`}
      style={{ backgroundColor: currentColors.background, color: currentColors.text }}
    >
      <div className="shelf-texture" />

      <header className="sticky top-0 z-30 shadow-md p-4 backdrop-blur-md flex items-center justify-between border-b" 
              style={{ backgroundColor: `${currentColors.background}CC`, borderColor: `${currentColors.accent}33` }}>
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8" style={{ color: currentColors.accent }} />
          <h1 className="text-2xl font-bold tracking-tight">Shelfie</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center">
            <span className="block text-[10px] uppercase font-black opacity-40 tracking-widest">
              {goal > 0 ? 'Yearly Progress' : 'Total Read'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black" style={{ color: currentColors.accent }}>{totalBooksRead}</span>
              {goal > 0 && <span className="text-sm font-bold opacity-30">/ {goal}</span>}
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => setIsInsightsOpen(true)} className="p-2 rounded-full border hover:bg-black/5" style={{ borderColor: currentColors.accent, color: currentColors.accent }} title="View Insights"><BarChart2 className="w-5 h-5" /></button>
            <button onClick={() => setIsThemeOpen(true)} className="p-2 rounded-full border hover:bg-black/5" style={{ borderColor: currentColors.accent, color: currentColors.accent }} title="Settings"><Settings className="w-5 h-5" /></button>
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-white font-black text-xs uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
              style={{ backgroundColor: currentColors.accent }}
            >
              <Plus className="w-4 h-4" /> Add Book
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-10 space-y-12 relative z-10">
        {TIERS.map(tier => {
          const tierBooks = booksByTier[tier.id];
          const metrics = getBookMetrics(tierBooks.length);
          const bookChunks = chunkArray(tierBooks, 20); // Each line holds 20 books

          return (
            <div 
              key={tier.id}
              onDragOver={e => { e.preventDefault(); setDragOverTier(tier.id); }}
              onDragLeave={() => setDragOverTier(null)}
              onDrop={() => onDropOnTier(tier.id)}
              className={`flex flex-col md:flex-row rounded-3xl transition-all overflow-hidden ${dragOverTier === tier.id ? 'scale-[1.01] bg-black/5' : ''}`}
            >
              {/* Vertical Tier Label Container */}
              <div 
                className="md:w-36 p-6 flex flex-col items-center justify-center text-white font-black text-center shadow-xl relative z-20 shrink-0"
                style={{ backgroundColor: currentColors[tier.id] }}
              >
                <span className="uppercase tracking-widest text-sm drop-shadow-sm">{tier.label}</span>
                <div className="mt-2 text-xs opacity-60 font-bold">{tierBooks.length} Books</div>
              </div>

              {/* Shelves Container */}
              <div className="flex-1 flex flex-col gap-12 bg-black/[0.02]">
                {bookChunks.length > 0 ? (
                  bookChunks.map((chunk, chunkIdx) => (
                    <div key={`${tier.id}-shelf-${chunkIdx}`} className="shelf-row flex-1 p-6 flex flex-wrap items-end pb-8 relative">
                      {/* Each chunk gets its own ledge */}
                      <div 
                        className="shelf-ledge transition-all"
                        style={{ 
                          backgroundColor: currentColors[tier.id],
                          filter: 'brightness(0.7)',
                          borderBottom: `2px solid rgba(0,0,0,0.2)`
                        }}
                      />
                      
                      <div className={`flex flex-wrap ${metrics.gap} w-full items-end`}>
                        {chunk.map(book => (
                          <div 
                            key={book.id} 
                            draggable
                            onDragStart={() => handleDragStart(book.id)}
                            onDragOver={e => { e.preventDefault(); e.stopPropagation(); setDragOverBookId(book.id); }}
                            onDragLeave={() => setDragOverBookId(null)}
                            onDrop={e => onDropOnBook(e, book.id, tier.id)}
                            onDragEnd={resetDrag}
                            onClick={() => setSelectedBook(book)}
                            className={`group cursor-pointer transition-all ${draggedBookId === book.id ? 'opacity-20 scale-90 grayscale' : 'hover:-translate-y-4'} ${dragOverBookId === book.id ? 'ring-4 ring-offset-4 ring-white' : ''}`}
                            style={{ 
                              ['--tw-ring-color' as any]: currentColors.accent,
                              width: `${metrics.width}px`
                            }}
                          >
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl mb-2 bg-gray-200 border-b-4 border-black/10">
                              <img src={book.coverUrl || 'https://picsum.photos/120/180'} className="w-full h-full object-cover" alt={book.title} />
                              
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                <button 
                                  onClick={(e) => handleCardDelete(e, book.id, book.title)}
                                  className="bg-red-500/80 hover:bg-red-600 p-1 rounded-lg text-white ml-auto backdrop-blur-sm transition-all shadow-md active:scale-90"
                                  title="Delete Book"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                                <ChevronRight className="w-5 h-5 text-white ml-auto" />
                              </div>
                            </div>
                            {metrics.showText && (
                              <div className="overflow-hidden">
                                <h3 className="font-bold text-[10px] leading-tight truncate px-1">{book.title}</h3>
                                <p className="text-[9px] opacity-50 truncate px-1">{book.author}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="shelf-row flex-1 p-6 flex items-center justify-center pb-8 relative min-h-[140px]">
                    <div 
                      className="shelf-ledge transition-all"
                      style={{ 
                        backgroundColor: currentColors[tier.id],
                        filter: 'brightness(0.7)',
                        borderBottom: `2px solid rgba(0,0,0,0.2)`
                      }}
                    />
                    <div className="opacity-10 font-black text-2xl uppercase italic tracking-tighter flex flex-col items-center gap-2">
                      <BookOpen className="w-12 h-12" />
                      <span>Empty Shelf</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {isSearchOpen && <SearchPanel onClose={() => setIsSearchOpen(false)} onAdd={addBooks} accentColor={currentColors.accent} />}
      {isThemeOpen && <ThemeManager activeTheme={activeTheme} setActiveTheme={setActiveTheme} customColors={customColors} setCustomColors={setCustomColors} goal={goal} setGoal={setGoal} onClose={() => setIsThemeOpen(false)} />}
      {isInsightsOpen && <InsightsDashboard books={books} onClose={() => setIsInsightsOpen(false)} currentColors={currentColors} />}
      {selectedBook && (
        <BookModal 
          book={selectedBook} 
          globalTags={globalUsedTags}
          onClose={() => setSelectedBook(null)} 
          onSave={updateBook} 
          onDelete={deleteBook} 
          accentColor={currentColors.accent} 
        />
      )}
    </div>
  );
};

export default App;