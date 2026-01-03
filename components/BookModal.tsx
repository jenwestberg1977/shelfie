import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Trash2, 
  MessageSquare, 
  Percent, 
  Plus, 
  History, 
  BookOpen, 
  Headphones, 
  Tablet,
  Check,
  Edit2,
  Tag as TagIcon,
  ChevronDown,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Book, BookFormat, ReadingSession, TierDefinition } from '../types';

interface BookModalProps {
  book: Book;
  globalTags: string[];
  onClose: () => void;
  onSave: (book: Book) => void;
  onDelete: (id: string) => void;
  accentColor: string;
  tiers: TierDefinition[];
}

const BookModal: React.FC<BookModalProps> = ({ book, globalTags, onClose, onSave, onDelete, accentColor, tiers }) => {
  const [editedBook, setEditedBook] = useState<Book>({ ...book, tags: book.tags || [], pages: book.pages || 300 });
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  const [editingPages, setEditingPages] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const authorInputRef = useRef<HTMLInputElement>(null);
  const pagesInputRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (editingTitle) titleInputRef.current?.focus(); }, [editingTitle]);
  useEffect(() => { if (editingAuthor) authorInputRef.current?.focus(); }, [editingAuthor]);
  useEffect(() => { if (editingPages) pagesInputRef.current?.focus(); }, [editingPages]);

  const addSession = () => {
    const newSession: ReadingSession = {
      id: Math.random().toString(36).substr(2, 9),
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      format: 'Physical Book',
    };
    setEditedBook(prev => ({ ...prev, sessions: [...prev.sessions, newSession] }));
  };

  const updateSession = (id: string, updates: Partial<ReadingSession>) => {
    setEditedBook(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const addTag = (tagName: string) => {
    const cleanTag = tagName.trim();
    if (cleanTag && !editedBook.tags.includes(cleanTag)) {
      setEditedBook(prev => ({ ...prev, tags: [...prev.tags, cleanTag] }));
    }
    setTagInput('');
    setShowSuggestions(false);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const removeTag = (tag: string) => {
    setEditedBook(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove "${editedBook.title}" from your library? This action is permanent.`)) {
      onDelete(book.id);
    }
  };

  const readingStats = useMemo(() => {
    if (!editedBook.sessions.length) return null;
    
    const finishedSessions = editedBook.sessions.filter(s => s.startDate && s.endDate);
    const activeSessions = editedBook.sessions.filter(s => s.startDate && !s.endDate);
    
    let totalDays = 0;
    let pace = 0;

    if (finishedSessions.length > 0) {
      finishedSessions.forEach(s => {
        const start = new Date(s.startDate);
        const end = new Date(s.endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        totalDays += diffDays;
      });
      pace = Math.round((editedBook.pages * finishedSessions.length) / totalDays);
    } else if (activeSessions.length > 0) {
      const s = activeSessions[0];
      const start = new Date(s.startDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
      const progress = editedBook.dnfProgress ? (editedBook.dnfProgress / 100) : 0.5;
      pace = Math.round((editedBook.pages * progress) / diffDays) || 1;
    }

    const estDaysLeft = pace > 0 ? Math.ceil(editedBook.pages / pace) : 0;

    return { pace, estDaysLeft };
  }, [editedBook]);

  const formatOptions: { value: BookFormat; icon: any; title: string }[] = [
    { value: 'Audiobook', icon: Headphones, title: 'Audiobook Format' },
    { value: 'Physical Book', icon: BookOpen, title: 'Physical Copy' },
    { value: 'E-reader', icon: Tablet, title: 'E-Reader / Digital' },
  ];

  const suggestedTags = globalTags.filter(t => 
    t.toLowerCase().includes(tagInput.toLowerCase()) && 
    !editedBook.tags.includes(t)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-[40px] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex items-center justify-between bg-gray-50/50">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Book Record Overview</span>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Delete Book Record"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-80 flex flex-col gap-6">
            <div className="relative group">
              <img src={book.coverUrl || 'https://picsum.photos/320/480'} className="w-full aspect-[2/3] object-cover rounded-3xl shadow-2xl ring-8 ring-gray-50 bg-gray-100" alt={book.title} />
              <div className="absolute inset-0 rounded-3xl ring-1 ring-black/10 pointer-events-none"></div>
            </div>
            
            <div className="space-y-4">
              <div className="group bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <label className="text-[9px] font-black uppercase text-gray-400">Title</label>
                {editingTitle ? (
                  <input ref={titleInputRef} className="w-full text-lg font-black bg-transparent outline-none border-b-2 border-indigo-200" value={editedBook.title} onChange={e => setEditedBook(p => ({ ...p, title: e.target.value }))} onBlur={() => setEditingTitle(false)} onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)} />
                ) : (
                  <div onClick={() => setEditingTitle(true)} className="flex items-center gap-2 cursor-pointer font-black text-lg group-hover:text-indigo-600 transition-colors">{editedBook.title} <Edit2 className="w-3 h-3 text-gray-300" /></div>
                )}
              </div>
              <div className="group bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <label className="text-[9px] font-black uppercase text-gray-400">Author</label>
                {editingAuthor ? (
                  <input ref={authorInputRef} className="w-full text-sm font-bold bg-transparent outline-none border-b-2 border-indigo-200" value={editedBook.author} onChange={e => setEditedBook(p => ({ ...p, author: e.target.value }))} onBlur={() => setEditingAuthor(false)} onKeyDown={e => e.key === 'Enter' && setEditingAuthor(false)} />
                ) : (
                  <div onClick={() => setEditingAuthor(true)} className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">{editedBook.author} <Edit2 className="w-3 h-3 text-gray-300" /></div>
                )}
              </div>
              <div className="group bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <label className="text-[9px] font-black uppercase text-gray-400">Total Pages</label>
                {editingPages ? (
                  <input ref={pagesInputRef} type="number" className="w-full text-sm font-bold bg-transparent outline-none border-b-2 border-indigo-200" value={editedBook.pages} onChange={e => setEditedBook(p => ({ ...p, pages: parseInt(e.target.value) || 0 }))} onBlur={() => setEditingPages(false)} onKeyDown={e => e.key === 'Enter' && setEditingPages(false)} />
                ) : (
                  <div onClick={() => setEditingPages(true)} className="flex items-center gap-2 cursor-pointer font-bold text-sm text-gray-500 group-hover:text-indigo-600 transition-colors">{editedBook.pages} <Edit2 className="w-3 h-3 text-gray-300" /></div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t grid grid-cols-2 gap-2">
              {tiers.map(t => (
                <button
                  key={t.id}
                  onClick={() => setEditedBook(prev => ({ ...prev, tier: t.id }))}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${editedBook.tier === t.id ? 'text-white border-transparent shadow-lg' : 'text-gray-400 border-gray-100 hover:border-gray-200'}`}
                  style={{ backgroundColor: editedBook.tier === t.id ? accentColor : '' }}
                >{t.label}</button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-8">
            {readingStats && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm" style={{ color: accentColor }}>
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase text-gray-400 tracking-widest">Reading Pace</span>
                    <p className="text-xl font-black">{readingStats.pace} <span className="text-xs text-gray-400">pg/day</span></p>
                  </div>
                </div>
                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[8px] font-black uppercase text-gray-400 tracking-widest">Est. Completion</span>
                    <p className="text-xl font-black">{readingStats.estDaysLeft} <span className="text-xs text-gray-400">days left</span></p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><History className="w-4 h-4" /> Reading Sessions</h3>
                <button onClick={addSession} className="px-4 py-2 rounded-full text-[10px] font-black uppercase text-white shadow-lg transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: accentColor }}>+ Session</button>
              </div>

              <div className="space-y-3">
                {editedBook.sessions.map(session => (
                  <div key={session.id} className="bg-gray-50/50 border-2 border-gray-100 rounded-2xl p-4 flex flex-wrap items-center gap-4 hover:border-indigo-100 transition-colors">
                    <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-100">
                      {formatOptions.map(opt => (
                        <button 
                          key={opt.value} 
                          onClick={() => updateSession(session.id, { format: opt.value })} 
                          className={`p-2 rounded-lg transition-all ${session.format === opt.value ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-300 hover:text-gray-400'}`} 
                          style={{ backgroundColor: session.format === opt.value ? accentColor : '' }}
                          title={opt.title}
                        >
                          <opt.icon className="w-4 h-4" />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2 flex-1 min-w-[150px]">
                      <div className="flex-1">
                        <span className="block text-[8px] font-black uppercase text-gray-300 mb-0.5">Start</span>
                        <input type="date" value={session.startDate} onChange={e => updateSession(session.id, { startDate: e.target.value })} className="text-[10px] p-1.5 rounded-lg border w-full outline-none focus:ring-1 focus:ring-indigo-200" />
                      </div>
                      <div className="flex-1">
                        <span className="block text-[8px] font-black uppercase text-gray-300 mb-0.5">End</span>
                        <input type="date" value={session.endDate} onChange={e => updateSession(session.id, { endDate: e.target.value })} className="text-[10px] p-1.5 rounded-lg border w-full outline-none focus:ring-1 focus:ring-indigo-200" />
                      </div>
                    </div>
                    <button onClick={() => setEditedBook(p => ({ ...p, sessions: p.sessions.filter(s => s.id !== session.id) }))} className="text-gray-300 hover:text-red-400 transition-colors p-2"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {editedBook.tier === 'DNF' && (
              <div className="p-6 bg-red-50 rounded-3xl border-2 border-red-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-red-500">
                  <div className="flex items-center gap-2"><Percent className="w-4 h-4" /> DNF Progress</div>
                  <span className="text-lg">{editedBook.dnfProgress || 0}%</span>
                </div>
                <input type="range" min="0" max="100" value={editedBook.dnfProgress || 0} onChange={e => setEditedBook(p => ({ ...p, dnfProgress: parseInt(e.target.value) }))} className="w-full h-3 bg-red-200 rounded-full appearance-none accent-red-600 cursor-pointer" />
                <div className="text-[10px] font-bold text-red-400 flex items-center gap-2">
                  <Check className={`w-3 h-3 transition-opacity ${editedBook.dnfProgress >= 80 ? 'opacity-100' : 'opacity-20'}`} />
                  {editedBook.dnfProgress >= 80 ? "Reached 80% or above - Counts towards total!" : "Below 80% - Not counted in progress goal."}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <TagIcon className="w-4 h-4" /> Tags (Genre, Year, Theme)
              </label>
              
              <div className="p-5 bg-gray-50/50 rounded-[32px] border-2 border-gray-100">
                <div className="flex flex-wrap gap-2 mb-4">
                  {editedBook.tags?.map(tag => (
                    <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-200 text-[10px] font-black uppercase text-gray-600 group">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="relative">
                  <div className="flex items-center gap-2">
                    <input 
                      ref={tagInputRef}
                      type="text" 
                      value={tagInput}
                      onChange={(e) => {
                        setTagInput(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add tag (e.g. 2026, Sci-Fi)..."
                      className="bg-transparent border-b border-gray-300 text-xs font-bold outline-none px-1 py-2 flex-1 focus:border-indigo-400 transition-all uppercase placeholder:text-gray-300"
                    />
                    <ChevronDown 
                      className={`w-4 h-4 text-gray-400 cursor-pointer transition-transform ${showSuggestions ? 'rotate-180' : ''}`}
                      onClick={() => setShowSuggestions(!showSuggestions)}
                    />
                  </div>
                  
                  {showSuggestions && (tagInput || suggestedTags.length > 0) && (
                    <div className="absolute top-full left-0 z-50 mt-2 w-full max-h-48 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-y-auto animate-in fade-in slide-in-from-top-1">
                      {suggestedTags.length > 0 ? suggestedTags.map(tag => (
                        <button 
                          key={tag}
                          onClick={() => addTag(tag)}
                          className="w-full px-5 py-3 text-left text-[10px] font-black uppercase hover:bg-indigo-50 transition-colors border-b last:border-0 border-gray-50 flex items-center justify-between"
                        >
                          {tag}
                          <Plus className="w-3 h-3 text-indigo-400" />
                        </button>
                      )) : tagInput ? (
                        <div className="px-5 py-3 text-[10px] font-bold text-gray-400 uppercase italic">
                          Press Enter to create new tag "{tagInput}"
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Personal Reflection</label>
              <textarea value={editedBook.comments} onChange={e => setEditedBook(p => ({ ...p, comments: e.target.value }))} className="w-full p-6 rounded-[32px] border-2 border-gray-100 focus:border-indigo-100 focus:ring-4 focus:ring-indigo-50 outline-none h-40 resize-none bg-gray-50/50 transition-all text-gray-700" placeholder="Notes on writing, plot, or why it ended up in this tier..." />
            </div>
          </div>
        </div>

        <div className="p-8 border-t bg-gray-50/80 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-3 rounded-2xl font-bold text-gray-400 uppercase text-[10px] tracking-widest hover:text-gray-600 transition-colors">Cancel</button>
          <button onClick={() => onSave(editedBook)} className="px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl hover:scale-105 active:scale-95 transition-all" style={{ backgroundColor: accentColor }}>Update Log</button>
        </div>
      </div>
    </div>
  );
};

export default BookModal;