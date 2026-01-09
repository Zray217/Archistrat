
import React from 'react';

const QUOTES = [
  "建筑是光线下形体组合的准确、妥帖、宏伟的游戏。 — 勒·柯布西耶",
  "提供有意义的建筑不是去模仿历史，而是去阐述历史。 — 丹尼尔·里伯斯金",
  "建筑应该是时间的、地点的，但又向往永恒。 — 弗兰克·盖里",
  "上帝在细节之中。 — 密斯·凡·德·罗",
  "建筑是石头的史书。 — 雨果"
];

const LoadingArchitect: React.FC = () => {
  const [quoteIdx, setQuoteIdx] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIdx(prev => (prev + 1) % QUOTES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-10 py-32">
      <div className="relative">
        <div className="w-16 h-16 border-[3px] border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 w-16 h-16 border-[3px] border-[#0071e3] rounded-full border-t-transparent animate-spin"></div>
      </div>
      <div className="text-center max-w-xl px-4">
        <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-blue-500 mb-4 animate-pulse">方案推演中 Drafting...</p>
        <p className="text-xl font-serif text-gray-700 leading-relaxed italic">
          “{QUOTES[quoteIdx].split(' — ')[0]}”
        </p>
        <p className="text-[11px] text-gray-400 mt-2 uppercase tracking-widest">— {QUOTES[quoteIdx].split(' — ')[1]}</p>
      </div>
    </div>
  );
};

export default LoadingArchitect;
