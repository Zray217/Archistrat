
import React from 'react';
import { SavedProject } from '../types';

interface ProjectLibraryProps {
  projects: SavedProject[];
  onSelect: (project: SavedProject) => void;
}

const ProjectLibrary: React.FC<ProjectLibraryProps> = ({ projects, onSelect }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
      {projects.length === 0 ? (
        <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-2xl">
          <div className="text-4xl text-gray-200 mb-4">📁</div>
          <p className="text-xs uppercase tracking-widest font-bold text-gray-400">项目库为空 / NO PROJECTS SAVED</p>
        </div>
      ) : (
        projects.sort((a, b) => b.timestamp - a.timestamp).map((project) => (
          <div 
            key={project.id} 
            onClick={() => onSelect(project)}
            className="macos-window bg-white cursor-pointer hover:shadow-2xl transition-all group border border-gray-100"
          >
            <div className="bg-[#f6f6f6] px-3 py-1 flex items-center border-b border-[#d1d1d1]">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 bg-gray-300 rounded-full group-hover:bg-red-400 transition-colors"></div>
                <div className="w-2.5 h-2.5 bg-gray-300 rounded-full group-hover:bg-yellow-400 transition-colors"></div>
                <div className="w-2.5 h-2.5 bg-gray-300 rounded-full group-hover:bg-green-400 transition-colors"></div>
              </div>
              <div className="flex-1 text-center text-[9px] font-bold text-gray-400 truncate px-2">
                {new Date(project.timestamp).toLocaleDateString()}
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="aspect-video rounded-lg bg-gray-50 overflow-hidden border border-gray-100">
                {project.schemes[0]?.renderUrl ? (
                  <img src={project.schemes[0].renderUrl} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="h-full flex items-center justify-center text-[10px] text-gray-300">无预览</div>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-black truncate">{project.constraints.function}</h4>
                <p className="text-[10px] text-gray-500 truncate">{project.constraints.site}</p>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-50">
                <span className="text-[9px] font-bold text-blue-500 uppercase">查看方案 x{project.schemes.length}</span>
                <span className="text-[9px] text-gray-300 uppercase">ID: {project.id.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProjectLibrary;
