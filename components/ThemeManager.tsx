
import React from 'react';
import { X, Palette, Pipette } from 'lucide-react';
import { ThemePreset, ThemeColors, TierId } from '../types';
import { THEME_PRESETS, TIERS } from '../constants';

interface ThemeManagerProps {
  activeTheme: ThemePreset;
  setActiveTheme: (theme: ThemePreset) => void;
  customColors: ThemeColors;
  setCustomColors: (colors: ThemeColors) => void;
  onClose: () => void;
}

const ThemeManager: React.FC<ThemeManagerProps> = ({ 
  activeTheme, 
  setActiveTheme, 
  customColors, 
  setCustomColors, 
  onClose 
}) => {
  const presets: ThemePreset[] = ['Dark Academia', 'Cyberpunk', 'Pastel Dream', 'Custom'];

  const handleCustomColorChange = (tier: keyof ThemeColors, value: string) => {
    setCustomColors({ ...customColors, [tier]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold text-gray-800">Visual Customization</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Preset Selector */}
          <div className="space-y-4">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Preset Themes</label>
            <div className="grid grid-cols-2 gap-3">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setActiveTheme(p)}
                  className={`p-3 rounded-xl border-2 transition-all text-left flex flex-col gap-2 ${activeTheme === p ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500/20' : 'border-gray-100 hover:border-gray-200'}`}
                >
                  <span className={`font-bold ${activeTheme === p ? 'text-blue-600' : 'text-gray-700'}`}>{p}</span>
                  <div className="flex gap-1">
                    {TIERS.slice(0, 4).map(t => (
                      <div 
                        key={t.id} 
                        className="w-4 h-4 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: THEME_PRESETS[p][t.id] }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Color Pickers */}
          {activeTheme === 'Custom' && (
            <div className="space-y-4 border-t pt-6">
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400">
                <Pipette className="w-3 h-3" /> Tier & UI Colors
              </label>
              <div className="grid grid-cols-2 gap-4">
                {([...TIERS, { id: 'background', label: 'Background' }, { id: 'accent', label: 'Primary Accent' }, { id: 'text', label: 'Text Color' }] as any).map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <input 
                      type="color" 
                      value={(customColors as any)[item.id]}
                      onChange={(e) => handleCustomColorChange(item.id, e.target.value)}
                      className="w-10 h-10 p-0 rounded-md border-0 cursor-pointer overflow-hidden shadow-sm"
                    />
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{item.label}</p>
                      <p className="text-xs font-mono font-medium">{(customColors as any)[item.id]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t flex justify-center">
          <button 
            onClick={onClose}
            className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold shadow-lg transform active:scale-95 transition-all"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemeManager;
