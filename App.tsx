import React, { useState } from 'react';
import { MapPin, Navigation, Loader2, Info } from 'lucide-react';
import { HotelResult, ANCHORS } from './types';
import { fetchOptimalHotels } from './services/geminiService';
import MapViz from './components/MapViz';
import HotelCard from './components/HotelCard';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [hotels, setHotels] = useState<HotelResult[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await fetchOptimalHotels();
      setHotels(results);
      if (results.length > 0) {
        setSelectedHotelId(results[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch hotel data. Please check your API key or try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="flex-none h-16 border-b border-slate-800 flex items-center px-6 bg-slate-950/50 backdrop-blur z-20">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Navigation className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Nanjing Trip Optimizer
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1"><MapPin size={14} className="text-blue-500"/> Station</span>
          <span className="flex items-center gap-1"><MapPin size={14} className="text-red-500"/> Fuzimiao</span>
          <span className="flex items-center gap-1"><MapPin size={14} className="text-green-500"/> Zhongshanling</span>
          <span className="flex items-center gap-1"><MapPin size={14} className="text-yellow-500"/> Niushoushan</span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Controls & List */}
        <div className="w-1/3 min-w-[380px] max-w-[450px] flex flex-col border-r border-slate-800 bg-slate-900/50 z-10">
          
          {/* Inputs Section */}
          <div className="p-6 border-b border-slate-800">
            <div className="bg-slate-800/80 rounded-xl p-4 mb-4 border border-slate-700">
              <h2 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Info size={14} /> Optimization Model
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                "Hub & Spoke" (驻地式): Minimizes total commute time for a 3-day itinerary starting from Nanjing South Station.
              </p>
              <div className="mt-3 flex gap-2">
                 <div className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-500 border border-slate-800">Simulating Amap Data</div>
                 <div className="text-[10px] bg-slate-900 px-2 py-1 rounded text-slate-500 border border-slate-800">Driving (10:00 AM)</div>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className={`
                w-full py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all
                ${loading 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20 active:scale-95'}
              `}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="animate-spin" size={16} /> Optimizing Locations...
                </span>
              ) : (
                "Find Optimal Hotel Locations"
              )}
            </button>
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {error && (
               <div className="p-4 bg-red-900/20 border border-red-500/30 text-red-300 rounded-lg text-sm text-center">
                 {error}
               </div>
            )}
            
            {!loading && hotels.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center h-48 text-slate-600">
                <Navigation size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Ready to calculate the best base.</p>
              </div>
            )}

            {hotels.map((hotel, index) => (
              <HotelCard 
                key={hotel.id}
                hotel={hotel}
                rank={index + 1}
                isSelected={selectedHotelId === hotel.id}
                onSelect={() => setSelectedHotelId(hotel.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Panel: Map Visualization */}
        <div className="flex-1 bg-slate-950 p-6 flex flex-col relative">
            <div className="flex-1 rounded-2xl overflow-hidden shadow-2xl border border-slate-800/50">
               <MapViz 
                 hotels={hotels} 
                 selectedHotelId={selectedHotelId} 
                 onSelectHotel={setSelectedHotelId} 
                />
            </div>
            
            {/* Legend / Overlay Stats */}
            {selectedHotelId && (
               <div className="absolute bottom-10 right-10 bg-slate-900/90 backdrop-blur border border-slate-700 rounded-xl p-4 w-72 shadow-2xl">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Selected Hub</h4>
                 <div className="text-lg font-bold text-white mb-1">
                    {hotels.find(h => h.id === selectedHotelId)?.name}
                 </div>
                 <div className="text-xs text-slate-500 mb-3">
                    {hotels.find(h => h.id === selectedHotelId)?.address}
                 </div>
                 <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-slate-800 rounded p-2">
                        <div className="text-indigo-400 font-bold text-lg">
                            {hotels.find(h => h.id === selectedHotelId)?.totalDurationMin}
                        </div>
                        <div className="text-[10px] text-slate-500">Total Minutes</div>
                    </div>
                    <div className="bg-slate-800 rounded p-2">
                        <div className="text-indigo-400 font-bold text-lg">
                            {Math.round(hotels.find(h => h.id === selectedHotelId)?.totalDistanceKm || 0)}
                        </div>
                        <div className="text-[10px] text-slate-500">Total KM</div>
                    </div>
                 </div>
               </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default App;