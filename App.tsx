
import React from 'react';
import ProjectForm from './components/ProjectForm';
import SchemeCard from './components/SchemeCard';
import LoadingArchitect from './components/LoadingArchitect';
import ProjectLibrary from './components/ProjectLibrary';
import { generateArchitecturalStrategies, generateSchemeVariations, checkApiKey, openApiKeySelector } from './services/geminiService';
import { ProjectConstraints, Scheme, SavedProject, Variation } from './types';

const STORAGE_KEY = 'archistrat_projects';
const MAX_STORED_PROJECTS = 3;

const App: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [currentProject, setCurrentProject] = React.useState<SavedProject | null>(null);
  const [savedProjects, setSavedProjects] = React.useState<SavedProject[]>([]);
  const [view, setView] = React.useState<'form' | 'library' | 'results'>('form');
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSavedProjects(Array.isArray(parsed) ? parsed : []);
      } catch (e) { 
        console.error("Failed to parse saved projects"); 
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveToLibrary = (project: SavedProject) => {
    setSavedProjects(prev => {
      const filtered = prev.filter(p => p.id !== project.id);
      let updated = [project, ...filtered];
      
      if (updated.length > MAX_STORED_PROJECTS) {
        updated = updated.slice(0, MAX_STORED_PROJECTS);
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn("Storage quota exceeded, pruning...");
        const minimal = updated.slice(0, 1);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
        } catch (innerE) {
          localStorage.removeItem(STORAGE_KEY);
        }
        return minimal;
      }
      return updated;
    });
  };

  const handleGenerate = async (constraints: ProjectConstraints) => {
    if (!await checkApiKey()) { await openApiKeySelector(); return; }
    
    setLoading(true); 
    setError(null); 
    setCurrentProject(null); 
    setView('results'); 
    
    try {
      const response = await generateArchitecturalStrategies(constraints);
      if (!response || !response.schemes || response.schemes.length === 0) {
        throw new Error("未能生成有效方案，请检查输入或重试。");
      }

      const newProject: SavedProject = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        constraints,
        schemes: response.schemes,
      };
      
      // Update state first to ensure rendering works
      setCurrentProject(newProject);
      saveToLibrary(newProject);
      // Stay on 'results' view to show the newly generated schemes
    } catch (err: any) {
      console.error("Generation failed", err);
      setError(err instanceof Error ? err.message : "推演引擎发生技术故障，推演被迫终止。");
      setTimeout(() => {
        if (!currentProject) setView('form');
      }, 5000);
    } finally { 
      setLoading(false); 
    }
  };

  const handleDeepenScheme = async (schemeId: string, userPrompt: string, deepenImage?: string, parentVarId?: string, sketch?: string) => {
    if (!currentProject) return;
    
    setCurrentProject(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        schemes: prev.schemes.map(s => s.id === schemeId ? { ...s, isLoading: true } : s)
      };
    });

    try {
      const scheme = currentProject.schemes.find(s => s.id === schemeId);
      if (!scheme) throw new Error("方案未找到");
      const parentVar = parentVarId ? scheme.variations?.find(v => v.id === parentVarId) : undefined;
      
      const response = await generateSchemeVariations(
        scheme, 
        currentProject.constraints, 
        userPrompt, 
        deepenImage, 
        parentVar, 
        sketch
      );
      
      setCurrentProject(prev => {
        if (!prev) return prev;
        const updatedSchemes = prev.schemes.map(s => {
          if (s.id !== schemeId) return s;
          const newVariations = [...(s.variations || []), ...response.variations];
          return { ...s, variations: newVariations, isLoading: false };
        });
        const updatedProject = { ...prev, schemes: updatedSchemes };
        saveToLibrary(updatedProject);
        return updatedProject;
      });
    } catch (err: any) {
      console.error("Deepening failed", err);
      setError(err instanceof Error ? err.message : "深化过程发生错误");
      setCurrentProject(prev => {
        if (!prev) return prev;
        return { ...prev, schemes: prev.schemes.map(s => ({ ...s, isLoading: false })) };
      });
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleClearVariations = (schemeId: string) => {
    if (!currentProject) return;
    setCurrentProject(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        schemes: prev.schemes.map(s => s.id === schemeId ? { ...s, variations: [] } : s)
      };
      saveToLibrary(updated);
      return updated;
    });
  };

  const handleDeleteVariation = (schemeId: string, varId: string) => {
    if (!currentProject) return;
    setCurrentProject(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        schemes: prev.schemes.map(s => {
          if (s.id !== schemeId) return s;
          return { ...s, variations: (s.variations || []).filter(v => v.id !== varId) };
        })
      };
      saveToLibrary(updated);
      return updated;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <nav className="h-10 bg-white/70 backdrop-blur-xl border-b border-gray-200 flex items-center px-6 sticky top-0 z-50">
        <div className="flex space-x-6 items-center">
          <span className="text-sm font-black text-black tracking-tighter cursor-default">ARCHISTRAT</span>
          <div className="flex space-x-4 text-[11px] font-semibold text-gray-500">
            <button onClick={() => setView('form')} className={`hover:text-black transition-colors ${view === 'form' ? 'text-blue-500 underline underline-offset-4' : ''}`}>工作台 / LAB</button>
            <button onClick={() => setView('library')} className={`hover:text-black transition-colors ${view === 'library' ? 'text-blue-500 underline underline-offset-4' : ''}`}>存档 / ARCHIVES ({(savedProjects.length)})</button>
            {(currentProject || loading) && (
              <button onClick={() => setView('results')} className={`hover:text-black transition-colors ${view === 'results' ? 'text-blue-500 underline underline-offset-4' : ''}`}>
                推演看板 / BOARDS {loading ? '●' : ''}
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 w-full flex-1">
        <header className={`transition-all duration-700 ${view === 'results' ? 'mb-8 opacity-40' : 'mb-24'}`}>
          <h1 className="text-6xl md:text-8xl font-sans font-black tracking-tighter text-black uppercase">ARCHISTRAT</h1>
          <p className="text-[10px] uppercase tracking-[0.5em] font-black text-blue-600 mt-2">Professional Architectural Strategy Engine</p>
        </header>

        <main>
          {view === 'form' && <ProjectForm onSubmit={handleGenerate} isLoading={loading} />}
          
          {view === 'library' && (
            <ProjectLibrary 
              projects={savedProjects} 
              onSelect={(p) => { 
                setCurrentProject(p); 
                setView('results'); 
              }} 
            />
          )}

          {view === 'results' && (
            <section id="results-view" className="animate-in fade-in duration-700">
              {loading && <LoadingArchitect />}
              
              {error && (
                <div className="bg-red-50 p-6 rounded-xl text-center max-w-2xl mx-auto border border-red-100 text-red-800 text-[10px] font-bold uppercase tracking-widest mb-10">
                  {error}
                </div>
              )}
              
              {!loading && !currentProject && !error && (
                <div className="flex flex-col items-center justify-center py-20 bg-white macos-window">
                  <p className="text-gray-400 text-[11px] font-bold uppercase tracking-widest">无活动推演项目 / NO ACTIVE PROJECT</p>
                  <button onClick={() => setView('form')} className="mt-4 text-blue-600 text-[11px] font-black uppercase underline decoration-2">创建新项目 / NEW PROJECT</button>
                </div>
              )}

              {!loading && currentProject && (
                <div className="space-y-16">
                  <div className="flex items-end justify-between border-b border-black pb-4">
                    <div>
                      <h2 className="text-4xl font-sans font-black italic uppercase tracking-tighter">方案推演报告 / OUTPUT BOARDS</h2>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        LOC: {currentProject.constraints?.site || "UNDEFINED"} | {new Date(currentProject.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button onClick={() => setView('library')} className="text-[10px] bg-black text-white px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-transform">返回存档 / ARCHIVES</button>
                  </div>
                  {currentProject.schemes?.map((scheme, idx) => (
                    <SchemeCard 
                      key={scheme.id} 
                      scheme={scheme} 
                      index={idx} 
                      onDeepen={handleDeepenScheme}
                      onClearVariations={handleClearVariations}
                      onDeleteVariation={handleDeleteVariation}
                      isDeepening={false}
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
