
import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Calendar, 
  MessageSquare, 
  Percent, 
  Layout, 
  Plus, 
  History, 
  Book as BookIcon, 
  Headphones, 
  Tablet,
  Check,
  Edit2
} from 'lucide-react';
import { Book, BookFormat, TierId, ReadingSession } from '../types';
import { TIERS } from '../constants';

interface BookModalProps {
  book: Book;
  onClose: () => void;
  onSave: (book: Book) => void;
  onDelete: (id: string) => void;
  accentColor: string;
}

const BookModal: React.FC<BookModalProps> = ({ book, onClose, onSave, onDelete, accentColor }) => {
  const [editedBook, setEditedBook] = useState<Book>({ ...book });
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState(false);
  
  const titleInputRef = useRef<HTMLInputElement>(null);
  const authorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  useEffect(() => {
    if (editingAuthor) authorInputRef.current?.focus();
  }, [editingAuthor]);

  const addSession = () => {
    const newSession: ReadingSession = {
      id: Math.random().toString(36).substr(2, 9),
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      format: 'Physical Book',
    };
    setEditedBook(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession]
    }));
  };

  const removeSession = (id: string) => {
    setEditedBook(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== id)
    }));
  };

  const updateSession = (id: string, updates: Partial<ReadingSession>) => {
    setEditedBook(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
  };

  const formatOptions: { value: BookFormat; icon: any; label: string }[] = [
    { value: 'Audiobook', icon: Headphones, label: 'Audiobook' },
    { value: 'Physical Book', icon: BookIcon, label: 'Physical Book' },
    { value: 'E-reader', icon: Tablet, label: 'E-reader' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1 rounded-full text-xs font-black uppercase text-white shadow-sm" style={{ backgroundColor: accentColor }}>
              {editedBook.tier}
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Book Ledger</h2>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { if(window.confirm('Permanently remove this book from your collection?')) onDelete(book.id) }}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Delete Book"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 flex flex-col md:row gap-10">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Left Column: Cover & Main Meta */}
            <div className="w-full md:w-80 flex flex-col gap-6">
              <div className="relative group">
                <img 
                  src={book.coverUrl || 'https://picsum.photos/320/480'} 
                  alt={book.title} 
                  className="w-full aspect-[2/3] object-cover rounded-2xl shadow-2xl border-4 border-white"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-black/5 pointer-events-none"></div>
              </div>
              
              <div className="space-y-4">
                {/* Editable Title */}
                <div className="group relative">
                  {editingTitle ? (
                    <input 
                      ref={titleInputRef}
                      className="w-full text-2xl font-black text-gray-900 leading-tight outline-none border-b-2 border-blue-500 bg-blue-50/50 p-1 rounded"
                      value={editedBook.title}
                      onChange={e => setEditedBook(prev => ({ ...prev, title: e.target.value }))}
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={e => e.key === 'Enter' && setEditingTitle(false)}
                    />
                  ) : (
                    <div 
                      onClick={() => setEditingTitle(true)}
                      className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors group"
                    >
                      <h1 className="text-2xl font-black text-gray-900 leading-tight flex items-center gap-2">
                        {editedBook.title}
                        <Edit2 className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h1>
                    </div>
                  )}
                </div>

                {/* Editable Author */}
                <div className="group relative">
                  {editingAuthor ? (
                    <input 
                      ref={authorInputRef}
                      className="w-full text-lg font-medium text-gray-600 outline-none border-b-2 border-blue-400 bg-blue-50/30 p-1 rounded"
                      value={editedBook.author}
                      onChange={e => setEditedBook(prev => ({ ...prev, author: e.target.value }))}
                      onBlur={() => setEditingAuthor(false)}
                      onKeyDown={e => e.key === 'Enter' && setEditingAuthor(false)}
                    />
                  ) : (
                    <div 
                      onClick={() => setEditingAuthor(true)}
                      className="cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors group"
                    >
                      <p className="text-lg font-medium text-gray-600 flex items-center gap-2">
                        {editedBook.author}
                        <Edit2 className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="pt-6 border-t space-y-4">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Layout className="w-3 h-3" /> Assign Tier
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIERS.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setEditedBook(prev => ({ ...prev, tier: t.id }))}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${editedBook.tier === t.id ? 'text-white border-transparent' : 'text-gray-400 border-gray-100 hover:border-gray-200'}`}
                      style={{ backgroundColor: editedBook.tier === t.id ? accentColor : '' }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: History & Notes */}
            <div className="flex-1 space-y-8">
              {/* Reading History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
                    <History className="w-4 h-4 text-blue-500" /> Reading History
                  </label>
                  <button 
                    onClick={addSession}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-[10px] font-black uppercase transition-transform hover:scale-105 active:scale-95 shadow-md"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Plus className="w-3 h-3" /> Add Session
                  </button>
                </div>

                <div className="space-y-3">
                  {editedBook.sessions.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400 italic text-sm">
                      No reading sessions logged yet.
                    </div>
                  ) : (
                    editedBook.sessions.map((session, idx) => (
                      <div key={session.id} className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm hover:border-gray-200 transition-all space-y-4">
                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex-1 min-w-[200px] grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Started</span>
                              <input 
                                type="date" 
                                value={session.startDate}
                                onChange={e => updateSession(session.id, { startDate: e.target.value })}
                                className="w-full p-1.5 rounded-lg border border-gray-100 text-xs focus:ring-1 focus:ring-blue-200 outline-none"
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase">Finished</span>
                              <input 
                                type="date" 
                                value={session.endDate}
                                onChange={e => updateSession(session.id, { endDate: e.target.value })}
                                className="w-full p-1.5 rounded-lg border border-gray-100 text-xs focus:ring-1 focus:ring-blue-200 outline-none"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                            {formatOptions.map(opt => (
                              <button
                                key={opt.value}
                                onClick={() => updateSession(session.id, { format: opt.value })}
                                title={`Switch to ${opt.label} format`}
                                className={`p-2 rounded-lg transition-all ${session.format === opt.value ? 'bg-white shadow-sm' : 'text-gray-300 hover:text-gray-400'}`}
                                style={{ color: session.format === opt.value ? accentColor : '' }}
                              >
                                <opt.icon className="w-4 h-4" />
                              </button>
                            ))}
                          </div>

                          <button 
                            onClick={() => removeSession(session.id)}
                            className="p-2 text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {editedBook.tier === 'DNF' && (
                <div className="space-y-4 bg-red-50 p-6 rounded-3xl border-2 border-red-100 shadow-sm">
                  <label className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-red-400">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4" /> Reading Progress
                    </div>
                    <span className="text-lg">{editedBook.dnfProgress}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={editedBook.dnfProgress}
                    onChange={e => setEditedBook(prev => ({ ...prev, dnfProgress: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-red-200 rounded-full appearance-none cursor-pointer accent-red-500"
                  />
                  <div className="flex items-center gap-2 text-[10px] font-bold text-red-400/80 italic">
                    <Check className={`w-3 h-3 ${editedBook.dnfProgress > 80 ? 'opacity-100' : 'opacity-20'}`} />
                    {editedBook.dnfProgress > 80 
                      ? "Progress is over 80%. This DNF counts as a 'Read' book." 
                      : "Progress must exceed 80% to count toward your total reads."}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
                  <MessageSquare className="w-4 h-4 text-purple-500" /> Notes & Critique
                </label>
                <textarea 
                  value={editedBook.comments}
                  onChange={e => setEditedBook(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="What made this a God Tier read? Or why did you abandon it?"
                  rows={6}
                  className="w-full p-6 rounded-3xl border-2 border-gray-100 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 outline-none resize-none transition-all shadow-inner text-gray-700 bg-gray-50/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50/80 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
          >
            Discard
          </button>
          <button 
            onClick={() => onSave(editedBook)}
            className="px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: accentColor }}
          >
            Update Ledger
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookModal;
