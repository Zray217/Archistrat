
import React from 'react';
import { Scheme, Variation } from '../types';
import ImagePainter from './ImagePainter';

interface SchemeCardProps {
  scheme: Scheme;
  index: number;
  onDeepen: (schemeId: string, prompt: string, image?: string, parentVarId?: string, sketch?: string) => void;
  onClearVariations: (schemeId: string) => void;
  onDeleteVariation: (schemeId: string, varId: string) => void;
  isDeepening: boolean;
}

const SchemeCard: React.FC<SchemeCardProps> = ({ 
  scheme, index, onDeepen, onClearVariations, onDeleteVariation, isDeepening 
}) => {
  const [showDeepenInput, setShowDeepenInput] = React.useState(false);
  const [deepenPrompt, setDeepenPrompt] = React.useState('');
  const [deepenImage, setDeepenImage] = React.useState<string | undefined>(undefined);
  const [sketchData, setSketchData] = React.useState<string>('');
  const [activeParentVarId, setActiveParentVarId] = React.useState<string | undefined>(undefined);
  const [painterContext, setPainterContext] = React.useState<{ img: string, title: string } | null>(null);

  const handleDeepenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deepenPrompt.trim() || sketchData) {
      onDeepen(scheme.id, deepenPrompt, deepenImage, activeParentVarId, sketchData);
      setShowDeepenInput(false);
      setDeepenPrompt('');
      setSketchData('');
      setDeepenImage(undefined);
      setActiveParentVarId(undefined);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDeepenImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const startPainting = (img: string, title: string) => {
    setPainterContext({ img, title });
  };

  const groupedVariations = React.useMemo(() => {
    return [...(scheme.variations || [])].sort((a, b) => b.timestamp - a.timestamp);
  }, [scheme.variations]);

  // Defensive values
  const bigIdea = scheme.bigIdea || { metaphor: "CONCEPTUAL STUDY", theory: "" };
  const massing = scheme.massing || { strategy: "", verbs: [] };
  const materiality = scheme.materiality || { materials: [], atmosphere: "" };

  return (
    <div className={`bg-white p-10 macos-shadow border border-gray-100 rounded-xl mb-16 relative ${scheme.isLoading ? 'ring-2 ring-blue-500' : ''}`}>
      {scheme.isLoading && (
        <div className="absolute inset-0 z-50 bg-white/40 backdrop-blur-sm flex items-center justify-center rounded-xl">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">深化中 / ITERATING...</span>
          </div>
        </div>
      )}

      {painterContext && (
        <ImagePainter
          baseImage={painterContext.img}
          title={painterContext.title}
          onClose={() => setPainterContext(null)}
          onSave={(sketch) => {
            setSketchData(sketch);
            setPainterContext(null);
            setShowDeepenInput(true);
          }}
        />
      )}

      <div className="flex justify-between items-start mb-8 border-b-2 border-black pb-4">
        <div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">方案提案 / PROPOSAL 0{index + 1}</span>
          <h3 className="text-4xl font-sans font-black text-black mt-1 uppercase tracking-tight">{scheme.title || "UNTITLED PROJECT"}</h3>
        </div>
        <div className="flex gap-2">
           <button onClick={() => { setShowDeepenInput(!showDeepenInput); setActiveParentVarId(undefined); }} className="text-[10px] bg-blue-600 text-white px-4 py-1.5 rounded-full font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100">
              {showDeepenInput ? '关闭推演 / CLOSE' : '深化与迭代 / DEEPEN'}
            </button>
        </div>
      </div>

      {showDeepenInput && (
        <div className="mb-10 p-6 bg-blue-50/50 border border-blue-100 rounded-xl animate-in slide-in-from-top-4 duration-300">
          <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-4">
            深化控制 (Iteration Control) {activeParentVarId ? `● 锁定子项 ${activeParentVarId.slice(0, 4)}` : ''}
          </h4>
          <form onSubmit={handleDeepenSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <textarea 
                  autoFocus 
                  value={deepenPrompt} 
                  onChange={(e) => setDeepenPrompt(e.target.value)}
                  rows={4} 
                  placeholder="输入形态微调要求（中英均可），例如：'增加二层露台，采用木质格栅 facade'..."
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400 outline-none shadow-inner"
                />
                
                <div className="flex items-center gap-4">
                  <input type="file" id={`deepen-img-${scheme.id}`} className="hidden" onChange={handleImageUpload} accept="image/*" />
                  <label htmlFor={`deepen-img-${scheme.id}`} className="px-4 py-2 bg-white border border-blue-200 rounded-lg text-[9px] font-black text-blue-600 cursor-pointer hover:bg-blue-100 transition-all uppercase tracking-widest shadow-sm">
                    {deepenImage ? '替换意向图 / REPLACE REF' : '上传迭代意向图 / UPLOAD INTENT'}
                  </label>
                  {deepenImage && <img src={deepenImage} className="h-10 aspect-video object-cover rounded border border-blue-300" />}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">手绘逻辑参考 / SKETCH REFERENCE</span>
                  {sketchData && <button type="button" onClick={() => setSketchData('')} className="text-[9px] text-red-500 font-bold uppercase">重置 / RESET</button>}
                </div>
                {sketchData ? (
                  <div className="w-full aspect-video bg-white border border-blue-200 rounded-lg overflow-hidden relative">
                    <img src={sketchData} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-blue-600/5"></div>
                  </div>
                ) : (
                  <div className="w-full aspect-video bg-white border-2 border-dashed border-blue-200 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase text-center px-8">
                    点击下方图纸上的“标注意图”按钮<br/>直接在现有方案上进行绘制
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-blue-100">
              <button 
                type="submit"
                className="bg-blue-600 text-white px-10 py-3 rounded-lg text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-700 transition-all active:scale-95"
              >
                启动方案再推演 / RUN ITERATION
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative group">
              {scheme.renderUrl ? <img src={scheme.renderUrl} className="w-full h-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs italic text-gray-300">生成主视图...</div>}
              <div className="absolute top-3 left-3 bg-black text-white text-[8px] px-2 py-0.5 font-bold uppercase tracking-widest">Master View</div>
              <button onClick={() => scheme.renderUrl && startPainting(scheme.renderUrl, "Master View")} className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 bg-white/90 text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg transition-all hover:bg-blue-600 hover:text-white uppercase tracking-widest border border-gray-200">
                标注意图 / MARK INTENT
              </button>
            </div>
            <div className="aspect-video bg-gray-50 rounded-lg overflow-hidden border border-gray-100 relative group">
              {scheme.siteSpecificRenderUrl ? <img src={scheme.siteSpecificRenderUrl} className="w-full h-full object-cover border-2 border-blue-500" /> : <div className="flex h-full items-center justify-center text-xs italic text-gray-300">生成场地视图...</div>}
              <div className="absolute top-3 left-3 bg-blue-600 text-white text-[8px] px-2 py-0.5 font-bold uppercase tracking-widest">Site Context</div>
              <button onClick={() => scheme.siteSpecificRenderUrl && startPainting(scheme.siteSpecificRenderUrl, "Site Context")} className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 bg-white/90 text-[9px] font-bold px-3 py-1.5 rounded-full shadow-lg transition-all hover:bg-blue-600 hover:text-white uppercase tracking-widest border border-gray-200">
                标注意图 / MARK INTENT
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 space-y-6 bg-gray-50 p-6 rounded-lg border border-gray-100">
           <section>
             <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-1 underline decoration-2 underline-offset-4">核心逻辑 (Design Logic)</h4>
             <p className="text-lg font-black text-black leading-tight mb-2 uppercase">{bigIdea.metaphor}</p>
             <p className="text-[11px] text-gray-600 leading-relaxed font-medium">{bigIdea.theory}</p>
           </section>
           
           <section>
             <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">空间组织 (Organization)</h4>
             <p className="text-[11px] text-gray-700 font-bold mb-2">{massing.strategy}</p>
             <div className="flex flex-wrap gap-1">
               {(massing.verbs || []).map((v, i) => (
                 <span key={i} className="text-[8px] bg-black text-white px-2 py-0.5 font-bold uppercase">{v}</span>
               ))}
             </div>
           </section>

           <section className="pt-4 border-t border-gray-200">
             <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-1">材质表现 (Tectonics)</h4>
             <p className="text-[10px] text-gray-500 font-bold leading-tight uppercase italic">{materiality.atmosphere}</p>
           </section>
        </div>
      </div>

      {groupedVariations.length > 0 && (
        <div className="space-y-12 mt-20">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200"></div>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">演进记录 (Evolution Log)</span>
            <button onClick={() => onClearVariations(scheme.id)} className="text-[9px] font-bold text-red-400 uppercase hover:text-red-600">重置迭代 / RESET</button>
            <div className="h-px flex-1 bg-gray-200"></div>
          </div>
          
          <div className="space-y-8">
            {groupedVariations.map((v, vIdx) => (
              <div key={v.id} className="relative group/var">
                <div className="macos-window bg-white border border-gray-200 flex flex-col md:flex-row shadow-lg hover:shadow-2xl transition-all duration-500">
                  <div className="w-full md:w-3/5 aspect-video bg-gray-100 relative group/img overflow-hidden">
                    {v.renderUrl && <img src={v.renderUrl} className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-1000" />}
                    <div className="absolute top-4 left-4 flex gap-2">
                       <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">STG.{groupedVariations.length - vIdx}</span>
                    </div>
                    {v.sketchImage && (
                      <div className="absolute bottom-4 left-4 w-28 aspect-video bg-white/95 border border-red-500 rounded-lg overflow-hidden shadow-2xl z-10">
                        <img src={v.sketchImage} className="w-full h-full object-contain" />
                        <div className="absolute top-0 left-0 bg-red-500 text-white text-[6px] px-2 py-0.5 font-black uppercase">Sketch Intent</div>
                      </div>
                    )}
                    <button onClick={() => v.renderUrl && startPainting(v.renderUrl, v.name)} className="absolute bottom-4 right-4 opacity-0 group-hover/img:opacity-100 bg-white text-black text-[9px] font-black px-4 py-2 rounded-full shadow-2xl transition-all border border-gray-100 hover:bg-blue-600 hover:text-white uppercase tracking-widest">
                      基于此项深化 / DEEPEN FROM HERE
                    </button>
                  </div>
                  <div className="flex-1 p-8 flex flex-col justify-between bg-[#fafafa]">
                    <div>
                      <div className="flex justify-between items-start mb-6">
                        <h5 className="text-xl font-black text-black uppercase tracking-tight">{v.name || "SUB-PROPOSAL"}</h5>
                        <button onClick={() => onDeleteVariation(scheme.id, v.id)} className="text-gray-200 hover:text-red-500 transition-colors p-2">🗑️</button>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest block mb-2 underline">形态优化 (Massing Manipulation)</span>
                          <p className="text-[11px] text-gray-800 leading-relaxed font-medium">{v.massingManipulation || "Awaiting refinement details..."}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                          {v.pros && v.pros[0] && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                              <span className="text-[8px] font-black text-green-600 uppercase tracking-widest block mb-1">设计价值 (Values)</span>
                              <p className="text-[10px] text-gray-700 leading-tight italic">“{v.pros[0]}”</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-gray-100 mt-6 flex justify-between items-center">
                      <span className="text-[9px] text-gray-400 font-mono tracking-widest uppercase">{new Date(v.timestamp).toLocaleTimeString()}</span>
                      <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemeCard;
