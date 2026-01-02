
import React, { useEffect, useRef, useMemo } from 'react';
import { 
  X, 
  PieChart as PieIcon, 
  BarChart as BarIcon, 
  Layers, 
  Award, 
  Target, 
  Maximize2 
} from 'lucide-react';
import { 
  Chart, 
  registerables, 
  ChartConfiguration 
} from 'chart.js';
import { Book, ThemeColors, TierId } from '../types';
import { TIERS } from '../constants';

Chart.register(...registerables);

interface InsightsDashboardProps {
  books: Book[];
  currentColors: ThemeColors;
  onClose: () => void;
}

const InsightsDashboard: React.FC<InsightsDashboardProps> = ({ books, currentColors, onClose }) => {
  const formatChartRef = useRef<HTMLCanvasElement>(null);
  const tierChartRef = useRef<HTMLCanvasElement>(null);
  const chartInstances = useRef<{ format?: Chart; tier?: Chart }>({});

  const stats = useMemo(() => {
    const finishedBooks = books.filter(b => ['GOD', 'A', 'B', 'C'].includes(b.tier) || (b.tier === 'DNF' && b.dnfProgress >= 80));
    const totalPages = finishedBooks.reduce((sum, b) => sum + (b.pages || 0), 0);
    
    const dnfBooks = books.filter(b => b.tier === 'DNF');
    const avgDnfProgress = dnfBooks.length > 0 
      ? Math.round(dnfBooks.reduce((sum, b) => sum + (b.dnfProgress || 0), 0) / dnfBooks.length) 
      : 0;

    const longestBook = books.length > 0 
      ? [...books].sort((a, b) => (b.pages || 0) - (a.pages || 0))[0] 
      : null;

    return { totalPages, avgDnfProgress, longestBook };
  }, [books]);

  const chartData = useMemo(() => {
    // Format distribution (based on all books sessions)
    const formatCounts: Record<string, number> = { 'Audiobook': 0, 'Physical Book': 0, 'E-reader': 0 };
    books.forEach(b => {
      b.sessions.forEach(s => {
        if (s.format) formatCounts[s.format]++;
      });
    });

    // Tier distribution
    const tierCounts: Record<TierId, number> = { TBR: 0, GOD: 0, A: 0, B: 0, C: 0, DNF: 0 };
    books.forEach(b => {
      tierCounts[b.tier]++;
    });

    return { formatCounts, tierCounts };
  }, [books]);

  useEffect(() => {
    // Cleanup old charts
    // Fix: Explicitly destroy chart instances to avoid 'unknown' type error from Object.values which can occur in some TS environments
    if (chartInstances.current.format) {
      chartInstances.current.format.destroy();
    }
    if (chartInstances.current.tier) {
      chartInstances.current.tier.destroy();
    }

    // Format Pie Chart
    if (formatChartRef.current) {
      const config: ChartConfiguration<'pie'> = {
        type: 'pie',
        data: {
          labels: Object.keys(chartData.formatCounts),
          datasets: [{
            data: Object.values(chartData.formatCounts),
            backgroundColor: [
              `${currentColors.accent}BB`,
              `${currentColors.GOD}BB`,
              `${currentColors.TBR}BB`
            ],
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: currentColors.text,
                font: { weight: 'bold', size: 10 }
              }
            }
          }
        }
      };
      chartInstances.current.format = new Chart(formatChartRef.current, config);
    }

    // Tier Bar Chart
    if (tierChartRef.current) {
      const labels = TIERS.map(t => t.label);
      const data = TIERS.map(t => chartData.tierCounts[t.id]);
      const colors = TIERS.map(t => currentColors[t.id]);

      const config: ChartConfiguration<'bar'> = {
        type: 'bar',
        data: {
          labels,
          datasets: [{
            label: 'Books per Tier',
            data,
            backgroundColor: colors.map(c => `${c}CC`),
            borderRadius: 12,
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: `${currentColors.text}66`, font: { size: 10, weight: 'bold' } },
              grid: { display: false }
            },
            x: {
              ticks: { color: `${currentColors.text}88`, font: { size: 10, weight: 'bold' } },
              grid: { display: false }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      };
      chartInstances.current.tier = new Chart(tierChartRef.current, config);
    }

    return () => {
      // Cleanup old charts on unmount
      // Fix: Explicitly destroy chart instances to avoid 'unknown' type error
      if (chartInstances.current.format) {
        chartInstances.current.format.destroy();
      }
      if (chartInstances.current.tier) {
        chartInstances.current.tier.destroy();
      }
    };
  }, [chartData, currentColors]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div 
        className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col rounded-[48px] shadow-2xl border border-white/10"
        style={{ backgroundColor: currentColors.background, color: currentColors.text }}
      >
        <div className="p-10 flex items-center justify-between border-b border-white/10">
          <div>
            <h2 className="text-4xl font-black tracking-tight">Reading Intelligence</h2>
            <p className="text-xs font-bold uppercase tracking-widest opacity-40 mt-1">Deep Analytics & Reading Pace Insights</p>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-black/5 rounded-full transition-colors border border-transparent hover:border-black/5">
            <X className="w-8 h-8 opacity-40" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10">
          {/* Stat Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 flex items-center gap-6">
              <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: `${currentColors.accent}20`, color: currentColors.accent }}>
                <Maximize2 className="w-8 h-8" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40">Total Pages Read</span>
                <p className="text-3xl font-black">{stats.totalPages.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 flex items-center gap-6">
              <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: `${currentColors.DNF}20`, color: currentColors.DNF }}>
                <Target className="w-8 h-8" />
              </div>
              <div>
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40">Avg DNF Progress</span>
                <p className="text-3xl font-black">{stats.avgDnfProgress}%</p>
              </div>
            </div>

            <div className="p-8 rounded-[32px] bg-white/5 border border-white/10 flex items-center gap-6">
              <div className="p-4 rounded-2xl shadow-sm" style={{ backgroundColor: `${currentColors.GOD}20`, color: currentColors.GOD }}>
                <Award className="w-8 h-8" />
              </div>
              <div className="flex-1 overflow-hidden">
                <span className="block text-[10px] font-black uppercase tracking-widest opacity-40">Longest Book</span>
                <p className="text-lg font-black truncate">{stats.longestBook?.title || 'None'}</p>
                <p className="text-xs font-bold opacity-30">{stats.longestBook?.pages || 0} Pages</p>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-8 flex items-center gap-2">
                <PieIcon className="w-4 h-4" /> Format Distribution
              </h3>
              <div className="flex-1 min-h-[300px] relative">
                <canvas ref={formatChartRef}></canvas>
              </div>
            </div>

            <div className="p-10 rounded-[40px] bg-white/5 border border-white/10 flex flex-col">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-8 flex items-center gap-2">
                <BarIcon className="w-4 h-4" /> Tier Ranking Spread
              </h3>
              <div className="flex-1 min-h-[300px] relative">
                <canvas ref={tierChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Summary Quote / Action */}
          <div className="p-12 rounded-[40px] text-center bg-gradient-to-br from-black/5 to-transparent border border-white/10">
            <Layers className="w-12 h-12 mx-auto mb-6 opacity-20" />
            <p className="text-2xl font-black italic max-w-2xl mx-auto opacity-60 leading-relaxed">
              "A reader lives a thousand lives before he dies... The man who never reads lives only one."
            </p>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.4em] opacity-30">— George R.R. Martin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;
