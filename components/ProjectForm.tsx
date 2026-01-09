
import React from 'react';
import { ProjectConstraints } from '../types';

interface ProjectFormProps {
  onSubmit: (constraints: ProjectConstraints) => void;
  isLoading: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = React.useState<ProjectConstraints>({
    site: '',
    function: '',
    climate: '',
    brief: '',
    far: '',
    intentImage: '',
    siteImage: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'intentImage' | 'siteImage') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="macos-window bg-white shadow-2xl overflow-hidden">
      <div className="bg-[#f6f6f6] px-4 py-2 flex items-center border-b border-[#d1d1d1]">
        <div className="flex space-x-2">
          <div className="dot dot-red"></div>
          <div className="dot dot-yellow"></div>
          <div className="dot dot-green"></div>
        </div>
        <div className="flex-1 text-center text-[11px] font-semibold text-gray-500 uppercase tracking-widest">新建推演项目 / NEW PROJECT</div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">场地背景 (SITE)</label>
            <input
              required
              name="site"
              value={formData.site}
              onChange={handleChange}
              placeholder="地理位置与环境特征..."
              className="w-full bg-[#fcfcfc] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">建筑功能 (FUNCTION)</label>
            <input
              required
              name="function"
              value={formData.function}
              onChange={handleChange}
              placeholder="主要用途与业态..."
              className="w-full bg-[#fcfcfc] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">场地体块/现状 (SITE MASSING)</label>
            <div className="relative group aspect-video">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'siteImage')}
                className="hidden"
                id="site-upload"
              />
              <label 
                htmlFor="site-upload"
                className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-xl cursor-pointer transition-all ${formData.siteImage ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
              >
                {formData.siteImage ? (
                  <img src={formData.siteImage} className="h-full w-full object-cover rounded-lg" alt="Site" />
                ) : (
                  <div className="text-center">
                    <span className="text-2xl text-gray-300">+</span>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">上传 16:9 场地图片</p>
                  </div>
                )}
              </label>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">设计意向参考 (INTENT)</label>
            <div className="relative group aspect-video">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'intentImage')}
                className="hidden"
                id="intent-upload"
              />
              <label 
                htmlFor="intent-upload"
                className={`flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-xl cursor-pointer transition-all ${formData.intentImage ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
              >
                {formData.intentImage ? (
                  <img src={formData.intentImage} className="h-full w-full object-cover rounded-lg" alt="Intent" />
                ) : (
                  <div className="text-center">
                    <span className="text-2xl text-gray-300">+</span>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase">上传 16:9 意向参考</p>
                  </div>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">气候条件 (CLIMATE)</label>
            <select
              required
              name="climate"
              value={formData.climate}
              onChange={handleChange}
              className="w-full bg-[#fcfcfc] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            >
              <option value="">选择气候</option>
              <option value="干旱">干旱 / 沙漠</option>
              <option value="热带">热带 / 潮湿</option>
              <option value="温带">温带</option>
              <option value="寒带">寒带 / 极地</option>
              <option value="地中海">地中海气候</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">控制指标 (FAR)</label>
            <input
              name="far"
              value={formData.far}
              onChange={handleChange}
              placeholder="容积率、限高、覆盖率..."
              className="w-full bg-[#fcfcfc] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">详细简报 (BRIEF)</label>
          <textarea
            required
            name="brief"
            rows={4}
            value={formData.brief}
            onChange={handleChange}
            placeholder="阐述核心需求与文化愿景..."
            className="w-full bg-[#fcfcfc] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 outline-none transition-all resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#0071e3] hover:bg-[#0077ed] text-white py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-200 disabled:opacity-50 active:scale-[0.98]"
        >
          {isLoading ? '策略师正在推演建筑空间...' : '开始生成概念设计方案'}
        </button>
      </form>
    </div>
  );
};

export default ProjectForm;
