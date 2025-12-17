import React from 'react';
import { HotelResult } from '../types';
import { Clock, MapPin, Car } from 'lucide-react';

interface HotelCardProps {
  hotel: HotelResult;
  rank: number;
  isSelected: boolean;
  onSelect: () => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ hotel, rank, isSelected, onSelect }) => {
  return (
    <div 
      onClick={onSelect}
      className={`
        relative p-4 rounded-xl border cursor-pointer transition-all duration-300
        ${isSelected 
          ? 'bg-blue-900/20 border-blue-500/50 shadow-lg shadow-blue-900/20' 
          : 'bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
            <div className={`
                flex items-center justify-center w-8 h-8 rounded-lg font-bold text-lg
                ${rank === 1 ? 'bg-yellow-500 text-black' : 'bg-slate-700 text-slate-300'}
            `}>
                {rank}
            </div>
            <div>
                <h3 className="font-bold text-slate-100 leading-tight">{hotel.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin size={10} />
                    {hotel.address}
                </p>
            </div>
        </div>
        <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">{hotel.totalDurationMin}<span className="text-sm text-slate-500 ml-1">min</span></div>
            <div className="text-xs text-slate-500">Total Commute</div>
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 gap-2 text-xs">
            <div className="col-span-2 text-slate-400 mb-1 uppercase tracking-wider font-semibold text-[10px]">Round Trip Estimates</div>
            
            <CostRow label="Nanjing South" cost={hotel.costs.station} color="text-blue-400" />
            <CostRow label="Fuzimiao" cost={hotel.costs.fuzimiao} color="text-red-400" />
            <CostRow label="Zhongshanling" cost={hotel.costs.zhongshanling} color="text-green-400" />
            <CostRow label="Niushoushan" cost={hotel.costs.niushoushan} color="text-yellow-400" />
        </div>
      )}
    </div>
  );
};

const CostRow: React.FC<{ label: string, cost: { durationMin: number, distanceKm: number }, color: string }> = ({ label, cost, color }) => (
    <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
        <span className={`font-medium ${color}`}>{label}</span>
        <div className="flex items-center gap-3 text-slate-300">
            <span className="flex items-center gap-1"><Clock size={10} /> {cost.durationMin * 2}m</span>
            <span className="flex items-center gap-1 opacity-60"><Car size={10} /> {Math.round(cost.distanceKm * 2)}km</span>
        </div>
    </div>
);

export default HotelCard;