import { useTreeStore } from '../features/Tree/Tree.store';

export const UI = () => {
  const mode = useTreeStore(s => s.mode);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-12 z-10">
      <div className="text-center">
        <h1 className="text-5xl md:text-7xl font-serif text-yellow-500 tracking-widest uppercase drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]">
          Merry Christmas
        </h1>
        <div className="h-px w-32 bg-yellow-500 mx-auto my-4 opacity-50"></div>
        <p className="text-emerald-400 font-light tracking-widest text-sm md:text-base">
          INTERACTIVE CHRISTMAS INSTALLATION
        </p>
      </div>

      <div className="text-center space-y-2">
        <div className={`transition-all duration-700 ${mode === 'CHAOS' ? 'opacity-100 scale-110' : 'opacity-50'}`}>
           <p className="text-red-400 font-bold text-xl uppercase tracking-widest">
             {mode === 'CHAOS' ? "◆ CHAOS UNLEASHED ◆" : "HOLD CLICK TO UNLEASH"}
           </p>
        </div>
        <p className="text-xs text-gray-500">
          Move Mouse to Pan View • Hold Left Click to Explode
        </p>
      </div>
    </div>
  );
};
