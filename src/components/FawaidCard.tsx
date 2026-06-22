import { Quote, Heart } from 'lucide-react';
import { useAppStore } from '../store';
import { cn } from '../utils/cn';
import type { Fawaid } from '../types';

interface FawaidCardProps {
  item: Fawaid;
}

export default function FawaidCard({ item }: FawaidCardProps) {
  const { toggleFavorite, isFavorite } = useAppStore();
  const favorite = isFavorite(item.id);

  return (
    <div className="group bg-slate-900 border border-slate-800/50 rounded-xl p-5 hover:border-amber-500/20 transition-all duration-200 flex flex-col gap-4">
      {/* Quote icon */}
      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0">
        <Quote size={14} className="text-amber-400" />
      </div>

      {/* Arabic text */}
      {item.textAr && (
        <p className="text-right text-slate-300 text-base leading-relaxed font-medium" dir="rtl">
          {item.textAr}
        </p>
      )}

      {/* Russian text */}
      <p className="text-slate-300 text-sm leading-relaxed flex-1">
        {item.text}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/50">
        <div>
          <p className="text-xs font-semibold text-amber-400">{item.author}</p>
          {item.source && (
            <p className="text-xs text-slate-500 mt-0.5">{item.source}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {item.likes !== undefined && (
            <span className="text-xs text-slate-500">{item.likes}</span>
          )}
          <button
            className={cn(
              'w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-150',
              favorite
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-800 text-slate-500 hover:text-red-400'
            )}
            onClick={() => toggleFavorite(item.id)}
          >
            <Heart size={12} fill={favorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}
