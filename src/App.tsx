import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  Building2, 
  Users, 
  Briefcase,
  ChevronRight,
  Search,
  Loader2,
  Trash2,
  ArrowLeft,
  Download,
  Upload,
  Scan,
  Shield,
  BarChart3,
  Globe,
  Lock,
  History,
  Filter,
  ArrowUpDown,
  Cpu,
  Database,
  Network,
  Workflow,
  Lightbulb,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import Markdown from 'react-markdown';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';
import { Appraisal, AppraisalInput, AuditLog } from './types';
import { generateCreditAppraisal } from './services/geminiService';
import { Logo } from './components/Logo';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => (
  <div className="w-72 bg-obsidian-light text-white h-screen fixed left-0 top-0 p-8 flex flex-col border-r border-white/5 shadow-2xl z-50">
    <div className="flex items-center gap-4 mb-12 px-2">
      <div className="p-2.5 bg-cyber-indigo rounded-xl shadow-lg shadow-cyber-indigo/20 ring-1 ring-white/20">
        <Logo className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-lg font-black tracking-tighter leading-none font-display">NEXUS</h1>
        <p className="text-[10px] font-bold text-cyber-blue tracking-[0.2em] mt-1">CREDIT INTEL</p>
      </div>
    </div>
    
    <nav className="space-y-1.5 flex-1">
      <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4 px-4">Main Navigation</p>
      <button 
        onClick={() => setActiveTab('dashboard')}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeTab === 'dashboard' ? 'bg-cyber-indigo text-white shadow-lg shadow-cyber-indigo/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <LayoutDashboard size={18} className={activeTab === 'dashboard' ? 'text-white' : 'text-slate-500 group-hover:text-cyber-blue'} />
        <span className="font-semibold text-sm">Portfolio Dashboard</span>
      </button>
      <button 
        onClick={() => setActiveTab('new')}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeTab === 'new' ? 'bg-cyber-indigo text-white shadow-lg shadow-cyber-indigo/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <PlusCircle size={18} className={activeTab === 'new' ? 'text-white' : 'text-slate-500 group-hover:text-cyber-blue'} />
        <span className="font-semibold text-sm">New Appraisal</span>
      </button>
      <button 
        onClick={() => setActiveTab('audit')}
        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${activeTab === 'audit' ? 'bg-cyber-indigo text-white shadow-lg shadow-cyber-indigo/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
      >
        <History size={18} className={activeTab === 'audit' ? 'text-white' : 'text-slate-500 group-hover:text-cyber-blue'} />
        <span className="font-semibold text-sm">Audit Trail</span>
      </button>
      
      <div className="pt-8 space-y-1.5">
        <p className="text-[10px] font-bold text-slate-500 tracking-widest uppercase mb-4 px-4">Risk Intelligence</p>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
          <Globe size={18} className="text-slate-500 group-hover:text-cyber-blue" />
          <span className="font-semibold text-sm">Market Trends</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group">
          <Shield size={18} className="text-slate-500 group-hover:text-cyber-blue" />
          <span className="font-semibold text-sm">Compliance Hub</span>
        </button>
      </div>
    </nav>

    <div className="mt-auto p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security</p>
        <Lock size={12} className="text-cyber-emerald" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-cyber-emerald rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        <span className="text-xs font-bold text-slate-300">Encrypted Session</span>
      </div>
    </div>
  </div>
);

const Dashboard = ({ appraisals, onView, onDelete }: { appraisals: Appraisal[], onView: (a: Appraisal) => void, onDelete: (id: string) => void }) => (
  <div className="space-y-10">
    <div className="flex justify-between items-end">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-8 bg-cyber-blue" />
          <span className="text-[10px] font-black text-cyber-blue uppercase tracking-[0.3em]">Institutional Grade</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight font-display">Credit Portfolio</h2>
        <p className="text-slate-400 mt-2 text-lg font-medium">Real-time risk monitoring and automated appraisal management.</p>
      </div>
      <div className="flex gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-blue transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search enterprise entities..." 
            className="pl-12 pr-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-cyber-blue/10 focus:border-cyber-blue outline-none transition-all w-80 shadow-sm font-medium text-white placeholder:text-slate-600"
          />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="glass-card p-8 rounded-[2rem] group cyber-glow-blue">
        <div className="flex items-center justify-between mb-6">
          <div className="p-4 bg-cyber-blue/10 text-cyber-blue rounded-2xl group-hover:bg-cyber-blue group-hover:text-white transition-colors duration-500">
            <FileText size={28} />
          </div>
          <BarChart3 size={20} className="text-white/10" />
        </div>
        <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-1">Total Appraisals</p>
        <p className="text-4xl font-black text-white">{appraisals.length}</p>
        <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="h-full bg-cyber-blue" 
          />
        </div>
      </div>
      
      <div className="glass-card p-8 rounded-[2rem] group cyber-glow">
        <div className="flex items-center justify-between mb-6">
          <div className="p-4 bg-cyber-emerald/10 text-cyber-emerald rounded-2xl group-hover:bg-cyber-emerald group-hover:text-white transition-colors duration-500">
            <ShieldCheck size={28} />
          </div>
          <Shield size={20} className="text-white/10" />
        </div>
        <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-1">Approved Assets</p>
        <p className="text-4xl font-black text-white">
          {appraisals.filter(a => a.status === 'Completed').length}
        </p>
        <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(appraisals.filter(a => a.status === 'Completed').length / (appraisals.length || 1)) * 100}%` }}
            className="h-full bg-cyber-emerald" 
          />
        </div>
      </div>

      <div className="glass-card p-8 rounded-[2rem] group">
        <div className="flex items-center justify-between mb-6">
          <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition-colors duration-500">
            <AlertTriangle size={28} />
          </div>
          <AlertTriangle size={20} className="text-white/10" />
        </div>
        <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-1">High Risk Exposure</p>
        <p className="text-4xl font-black text-white">
          {appraisals.filter(a => a.status === 'Rejected' || a.risk_score < 60).length}
        </p>
        <div className="mt-6 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(appraisals.filter(a => a.status === 'Rejected' || a.risk_score < 60).length / (appraisals.length || 1)) * 100}%` }}
            className="h-full bg-rose-500" 
          />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="glass-panel p-8 rounded-[2.5rem] h-80">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 size={16} className="text-cyber-blue" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Portfolio Risk Distribution</p>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
            { subject: 'Financial', A: appraisals.reduce((acc, a) => acc + (a.risk_categories?.financial || 0), 0) / (appraisals.length || 1) },
            { subject: 'Legal', A: appraisals.reduce((acc, a) => acc + (a.risk_categories?.legal || 0), 0) / (appraisals.length || 1) },
            { subject: 'Sector', A: appraisals.reduce((acc, a) => acc + (a.risk_categories?.sector || 0), 0) / (appraisals.length || 1) },
            { subject: 'Operational', A: appraisals.reduce((acc, a) => acc + (a.risk_categories?.operational || 0), 0) / (appraisals.length || 1) },
            { subject: 'Management', A: appraisals.reduce((acc, a) => acc + (a.risk_categories?.management || 0), 0) / (appraisals.length || 1) },
          ]}>
            <PolarGrid stroke="#334155" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Avg Risk"
              dataKey="A"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-panel p-8 rounded-[2.5rem] h-80 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={16} className="text-cyber-emerald" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Institutional Intelligence</p>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400">Average Risk Score</span>
            <span className="text-2xl font-black text-white">
              {Math.round(appraisals.reduce((acc, a) => acc + a.risk_score, 0) / (appraisals.length || 1))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-400">Total Exposure</span>
            <span className="text-2xl font-black text-white">
              ${(appraisals.length * 2.5).toFixed(1)}M
            </span>
          </div>
          <div className="p-4 bg-cyber-emerald/5 border border-cyber-emerald/10 rounded-2xl">
            <p className="text-xs text-cyber-emerald font-bold leading-relaxed">
              Portfolio health is currently within optimal parameters. AI suggests increasing exposure to "Prime" rated entities in the Manufacturing sector.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div className="glass-panel rounded-[2rem] overflow-hidden">
      <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
        <h3 className="font-black text-white tracking-tight">Recent Appraisals</h3>
        <button className="text-xs font-black text-cyber-blue uppercase tracking-widest hover:text-white transition-colors">View All Records</button>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-white/5 border-b border-white/5">
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Entity Information</th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Risk Index</th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Determination</th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Audit Date</th>
            <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {appraisals.map((appraisal) => (
            <tr key={appraisal.id} className="hover:bg-white/5 transition-all duration-300 group">
              <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-400 font-black text-lg shadow-inner group-hover:bg-white/10 group-hover:text-white transition-all duration-300">
                    {appraisal.company_name.charAt(0)}
                  </div>
                  <div>
                    <span className="block font-black text-white tracking-tight">{appraisal.company_name}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{appraisal.input_data?.industry || 'General Sector'}</span>
                  </div>
                </div>
              </td>
              <td className="px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className={`w-16 h-2 rounded-full bg-white/5 overflow-hidden shadow-inner`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${appraisal.risk_score}%` }}
                      className={`h-full ${appraisal.risk_score >= 80 ? 'bg-cyber-emerald' : appraisal.risk_score >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    />
                  </div>
                  <span className="text-sm font-black text-slate-300">{appraisal.risk_score}</span>
                </div>
              </td>
              <td className="px-8 py-6">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] shadow-sm ${
                  appraisal.recommendation === 'Approve' ? 'bg-cyber-emerald text-white' :
                  appraisal.recommendation === 'Reject' ? 'bg-rose-500 text-white' :
                  'bg-amber-500 text-white'
                }`}>
                  {appraisal.recommendation}
                </span>
              </td>
              <td className="px-8 py-6 text-sm font-bold text-slate-500">
                {new Date(appraisal.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <button 
                    onClick={() => onView(appraisal)}
                    className="p-2.5 text-slate-500 hover:text-cyber-blue hover:bg-white/5 rounded-xl transition-all"
                  >
                    <FileText size={20} />
                  </button>
                  <button 
                    onClick={() => onDelete(appraisal.id)}
                    className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-white/5 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const NewAppraisalForm = ({ onSubmit, isGenerating }: { onSubmit: (data: AppraisalInput) => void, isGenerating: boolean }) => {
  const [step, setStep] = useState(1);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [formData, setFormData] = useState<AppraisalInput>({
    companyName: '',
    industry: '',
    financialData: '',
    unstructuredDocs: '',
    externalIntelligence: '',
    dueDiligence: ''
  });

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setOcrProgress(0);

    try {
      if (file.type === 'application/pdf') {
        await processPdf(file);
      } else if (file.type.startsWith('image/')) {
        await processImage(file);
      } else {
        alert('Unsupported file type. Please upload a PDF or Image.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      alert('Failed to extract text from document.');
    } finally {
      setIsOcrLoading(false);
      setOcrProgress(0);
    }
  };

  const processImage = async (file: File) => {
    const result = await Tesseract.recognize(file, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          setOcrProgress(Math.round(m.progress * 100));
        }
      }
    });
    
    setFormData(prev => ({
      ...prev,
      unstructuredDocs: prev.unstructuredDocs + '\n\n--- Extracted from Image ---\n' + result.data.text
    }));
  };

  const processPdf = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      setOcrProgress(Math.round((i / pdf.numPages) * 100));
      const page = await pdf.getPage(i);
      
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      
      if (pageText.trim().length > 10) {
        fullText += `\n\n--- Page ${i} ---\n` + pageText;
      } else {
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport, canvas: canvas }).promise;
          const result = await Tesseract.recognize(canvas, 'eng');
          fullText += `\n\n--- Page ${i} (OCR) ---\n` + result.data.text;
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      unstructuredDocs: prev.unstructuredDocs + '\n\n--- Extracted from PDF ---\n' + fullText
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px w-8 bg-cyber-indigo" />
          <span className="text-[10px] font-black text-cyber-indigo uppercase tracking-[0.3em]">Appraisal Workflow</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight font-display">New Credit Appraisal</h2>
        <p className="text-slate-400 mt-2 text-lg font-medium">Provide multi-vector intelligence for a comprehensive risk audit.</p>
        
        <div className="flex items-center gap-4 mt-10">
          {[
            { id: 1, label: 'Data Ingestor' },
            { id: 2, label: 'Research Agent' },
            { id: 3, label: 'Recommendation Engine' }
          ].map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-2">
                <div className={`flex items-center justify-center w-12 h-12 rounded-2xl font-black transition-all duration-500 ${
                  step === s.id ? 'bg-cyber-indigo text-white shadow-xl shadow-cyber-indigo/30 scale-110' : 
                  step > s.id ? 'bg-cyber-indigo/20 text-cyber-indigo' : 'bg-white/5 text-slate-600'
                }`}>
                  {step > s.id ? <ShieldCheck size={24} /> : s.id}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest ${step === s.id ? 'text-white' : 'text-slate-600'}`}>{s.label}</span>
              </div>
              {idx < 2 && <div className={`h-1 flex-1 rounded-full transition-all duration-500 mb-6 ${step > s.id ? 'bg-cyber-indigo' : 'bg-white/5'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="glass-panel p-10 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-indigo/5 rounded-full -translate-y-1/2 translate-x-1/2 -z-10 blur-3xl" />
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <Database className="text-cyber-indigo" size={20} />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Pillar 1: Data Ingestor</h3>
              </div>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Building2 size={14} className="text-cyber-indigo" />
                    Target Entity Name
                  </label>
                  <input 
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    type="text" 
                    placeholder="e.g. Reliance Industries Ltd"
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-cyber-indigo/10 focus:border-cyber-indigo outline-none transition-all font-bold text-white placeholder:text-slate-700"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={14} className="text-cyber-indigo" />
                    Industry Classification
                  </label>
                  <select 
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-cyber-indigo/10 focus:border-cyber-indigo outline-none transition-all font-bold text-white appearance-none"
                  >
                    <option value="" className="bg-obsidian">Select Sector</option>
                    <option value="Manufacturing" className="bg-obsidian">Manufacturing</option>
                    <option value="IT & Services" className="bg-obsidian">IT & Services</option>
                    <option value="Infrastructure" className="bg-obsidian">Infrastructure</option>
                    <option value="Retail" className="bg-obsidian">Retail</option>
                    <option value="Healthcare" className="bg-obsidian">Healthcare</option>
                    <option value="Automobile" className="bg-obsidian">Automobile</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={14} className="text-cyber-indigo" />
                  Structured Financial Intelligence (GST, ITR, Banking)
                </label>
                <textarea 
                  name="financialData"
                  value={formData.financialData}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Paste summaries of GST filings, ITR, and Bank Statement highlights here..."
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-cyber-indigo/10 focus:border-cyber-indigo outline-none transition-all resize-none font-medium text-slate-300 leading-relaxed placeholder:text-slate-700"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <Globe className="text-cyber-indigo" size={20} />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Pillar 2: Research Agent</h3>
              </div>
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Briefcase size={14} className="text-cyber-indigo" />
                  Unstructured Document Analysis
                </label>
                <div className="relative">
                  <input 
                    type="file" 
                    id="ocr-upload" 
                    className="hidden" 
                    accept=".pdf,image/*"
                    onChange={handleFileUpload}
                    disabled={isOcrLoading}
                  />
                  <label 
                    htmlFor="ocr-upload"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer transition-all ${
                      isOcrLoading ? 'bg-white/5 text-slate-600' : 'bg-cyber-indigo/10 text-cyber-indigo hover:bg-cyber-indigo hover:text-white shadow-sm'
                    }`}
                  >
                    {isOcrLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Scanning {ocrProgress}%
                      </>
                    ) : (
                      <>
                        <Scan size={16} />
                        Scan PDF/Image (OCR)
                      </>
                    )}
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <textarea 
                  name="unstructuredDocs"
                  value={formData.unstructuredDocs}
                  onChange={handleChange}
                  rows={10}
                  placeholder="Paste key insights from Annual Reports, Board Minutes, or Rating Agency reports... Or use the 'Scan' button to extract text from files."
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-cyber-indigo/10 focus:border-cyber-indigo outline-none transition-all resize-none font-medium text-slate-300 leading-relaxed placeholder:text-slate-700"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <Cpu className="text-cyber-indigo" size={20} />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Pillar 3: Recommendation Engine</h3>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Search size={14} className="text-cyber-indigo" />
                  External Intelligence Network (News, MCA, Litigation)
                </label>
                <textarea 
                  name="externalIntelligence"
                  value={formData.externalIntelligence}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Paste news articles, litigation records, or market competition analysis..."
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-cyber-indigo/10 focus:border-cyber-indigo outline-none transition-all resize-none font-medium text-slate-300 leading-relaxed placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <Shield size={14} className="text-cyber-indigo" />
                  Primary Due-Diligence & Qualitative Audit
                </label>
                <textarea 
                  name="dueDiligence"
                  value={formData.dueDiligence}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Enter factory visit observations, management credibility notes, and operational risk assessments..."
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-cyber-indigo/10 focus:border-cyber-indigo outline-none transition-all resize-none font-medium text-slate-300 leading-relaxed placeholder:text-slate-700"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-between mt-12 pt-8 border-t border-white/5">
          <button 
            onClick={prevStep}
            disabled={step === 1 || isGenerating}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:bg-white/5 hover:text-white'
            }`}
          >
            <ArrowLeft size={18} />
            Previous Phase
          </button>
          
          {step < 3 ? (
            <button 
              onClick={nextStep}
              className="flex items-center gap-2 px-10 py-4 bg-white text-obsidian rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
            >
              Next Phase
              <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={() => onSubmit(formData)}
              disabled={isGenerating || !formData.companyName}
              className="flex items-center gap-2 px-10 py-4 bg-cyber-indigo text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-cyber-indigo/80 transition-all shadow-xl shadow-cyber-indigo/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Executing AI Audit...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Finalize Intelligence Report
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const RiskRadar = ({ categories }: { categories?: Appraisal['risk_categories'] }) => {
  const data = categories ? [
    { subject: 'Financial', A: categories.financial, fullMark: 100 },
    { subject: 'Legal', A: categories.legal, fullMark: 100 },
    { subject: 'Sector', A: categories.sector, fullMark: 100 },
    { subject: 'Operational', A: categories.operational, fullMark: 100 },
    { subject: 'Management', A: categories.management, fullMark: 100 },
  ] : [];

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Risk"
            dataKey="A"
            stroke="#4f46e5"
            fill="#4f46e5"
            fillOpacity={0.5}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

const AppraisalDetail = ({ appraisal, onBack }: { appraisal: Appraisal, onBack: () => void }) => {
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([appraisal.cam_content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `CAM_${appraisal.company_name.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-32">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-cyber-blue font-bold transition-all group"
        >
          <div className="p-2 rounded-lg group-hover:bg-white/5 transition-all">
            <ArrowLeft size={18} />
          </div>
          <span className="text-sm uppercase tracking-widest">Return to Portfolio</span>
        </button>
        
        <div className="flex gap-3">
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-black text-xs uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all shadow-sm"
          >
            <Download size={16} />
            Export CAM (Markdown)
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-3 bg-cyber-indigo text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-cyber-indigo/80 transition-all shadow-lg shadow-cyber-indigo/20"
          >
            <FileText size={16} />
            Print to PDF
          </button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute -left-8 top-0 bottom-0 w-1 bg-cyber-indigo rounded-full" />
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-white text-obsidian text-[10px] font-black uppercase tracking-[0.2em] rounded-md">Confidential</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ref ID: {appraisal.id.toUpperCase()}</span>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter leading-none font-display">{appraisal.company_name}</h2>
            <p className="text-slate-400 mt-4 flex items-center gap-2 font-medium">
              <Globe size={18} className="text-cyber-blue" />
              Strategic Credit Appraisal • {new Date(appraisal.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          
          <div className="text-right">
            <div className="inline-block p-6 glass-card rounded-[2rem]">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nexus Risk Index</p>
              <div className="flex items-center justify-end gap-3">
                <span className={`text-5xl font-black tracking-tighter ${
                  appraisal.risk_score >= 80 ? 'text-cyber-emerald' : appraisal.risk_score >= 60 ? 'text-amber-500' : 'text-rose-500'
                }`}>
                  {appraisal.risk_score}
                </span>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-left">
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">Rating</p>
                  <p className={`text-xs font-bold ${
                    appraisal.risk_score >= 80 ? 'text-cyber-emerald' : appraisal.risk_score >= 60 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {appraisal.risk_score >= 80 ? 'PRIME' : appraisal.risk_score >= 60 ? 'STABLE' : 'SPECULATIVE'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-obsidian-light text-white p-8 rounded-[2.5rem] border border-white/5 shadow-2xl shadow-black/50 relative overflow-hidden group cyber-glow">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
            <ShieldCheck size={120} />
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Determination</p>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-3 h-3 rounded-full ${
              appraisal.recommendation === 'Approve' ? 'bg-cyber-emerald shadow-[0_0_12px_rgba(16,185,129,0.8)]' :
              appraisal.recommendation === 'Reject' ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.8)]' :
              'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]'
            }`} />
            <span className="text-2xl font-black tracking-tight">{appraisal.recommendation}</span>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-500">Loan Limit</span>
              <span className="text-white">{appraisal.loan_limit || 'N/A'}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
              <span className="text-slate-500">Interest Rate</span>
              <span className="text-white">{appraisal.interest_rate || 'N/A'}</span>
            </div>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            Automated recommendation based on multi-vector financial intelligence and risk modeling.
          </p>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] col-span-2 flex flex-col justify-center relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-cyber-blue" />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Risk Radar Analysis</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <RiskRadar categories={appraisal.risk_categories} />
            <div className="space-y-4">
              <p className="text-xl font-bold text-slate-200 leading-snug tracking-tight">
                The entity exhibits a {appraisal.risk_score >= 80 ? 'robust' : appraisal.risk_score >= 60 ? 'resilient' : 'vulnerable'} credit profile with {appraisal.risk_score >= 80 ? 'minimal' : appraisal.risk_score >= 60 ? 'manageable' : 'significant'} risk indicators.
              </p>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-amber-400" />
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Early Warning System</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AI has detected {appraisal.risk_score < 70 ? 'potential red flags' : 'no immediate red flags'} in the provided financial disclosures and external intelligence feeds.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel p-16 rounded-[3rem] relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-8 py-3 bg-white text-obsidian rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-xl">
          Credit Appraisal Memo
        </div>
        <div className="prose prose-slate max-w-none prose-invert">
          <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed text-lg">
            <Markdown>{appraisal.cam_content}</Markdown>
          </div>
        </div>
        
        <div className="mt-20 pt-10 border-t border-white/5 flex justify-between items-center opacity-40 grayscale">
          <div className="flex items-center gap-3">
            <Logo className="w-6 h-6" />
            <span className="text-[10px] font-black tracking-widest">NEXUS CREDIT INTELLIGENCE</span>
          </div>
          <p className="text-[10px] font-bold">INTERNAL USE ONLY • SYSTEM GENERATED</p>
        </div>
      </div>
    </div>
  );
};

const AuditTrail = ({ logs }: { logs: AuditLog[] }) => {
  const [filter, setFilter] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof AuditLog, direction: 'asc' | 'desc' } | null>(null);

  const sortedLogs = React.useMemo(() => {
    let sortableItems = [...logs];
    if (filter) {
      sortableItems = sortableItems.filter(log => 
        log.user_email.toLowerCase().includes(filter.toLowerCase()) ||
        log.action.toLowerCase().includes(filter.toLowerCase()) ||
        log.entity_name.toLowerCase().includes(filter.toLowerCase())
      );
    }
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [logs, filter, sortConfig]);

  const requestSort = (key: keyof AuditLog) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="h-px w-8 bg-cyber-indigo" />
          <span className="text-[10px] font-black text-cyber-indigo uppercase tracking-[0.3em]">Compliance & Governance</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tight font-display">Audit Intelligence</h2>
        <p className="text-slate-400 mt-2 text-lg font-medium">Complete immutable ledger of all platform interactions.</p>
      </div>

      <div className="glass-panel rounded-[2.5rem] overflow-hidden">
        <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyber-indigo transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Filter logs..." 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-6 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-4 focus:ring-cyber-indigo/10 focus:border-cyber-indigo outline-none transition-all w-64 shadow-sm font-medium text-sm text-white placeholder:text-slate-700"
            />
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th onClick={() => requestSort('user_email')} className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors">
                <div className="flex items-center gap-2">User <ArrowUpDown size={12} /></div>
              </th>
              <th onClick={() => requestSort('action')} className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors">
                <div className="flex items-center gap-2">Action <ArrowUpDown size={12} /></div>
              </th>
              <th onClick={() => requestSort('entity_name')} className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors">
                <div className="flex items-center gap-2">Entity <ArrowUpDown size={12} /></div>
              </th>
              <th onClick={() => requestSort('timestamp')} className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-colors">
                <div className="flex items-center gap-2">Timestamp <ArrowUpDown size={12} /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedLogs.map((log) => (
              <tr key={log.id} className="hover:bg-white/5 transition-all duration-300">
                <td className="px-8 py-4">
                  <span className="text-sm font-bold text-slate-300">{log.user_email}</span>
                </td>
                <td className="px-8 py-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    log.action.includes('CREATE') ? 'bg-cyber-emerald/10 text-cyber-emerald border border-cyber-emerald/20' :
                    log.action.includes('DELETE') ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                    'bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20'
                  }`}>
                    {log.action.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <span className="text-sm font-medium text-slate-400">{log.entity_name}</span>
                </td>
                <td className="px-8 py-4 text-sm font-bold text-slate-500">
                  {new Date(log.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
            {sortedLogs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-8 py-20 text-center text-slate-600 font-medium">
                  No audit logs found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appraisals, setAppraisals] = useState<Appraisal[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedAppraisal, setSelectedAppraisal] = useState<Appraisal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchAppraisals();
    fetchAuditLogs();
  }, []);

  const fetchAppraisals = async () => {
    try {
      const res = await fetch('/api/appraisals');
      const data = await res.json();
      setAppraisals(data);
    } catch (err) {
      console.error('Failed to fetch appraisals', err);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      const data = await res.json();
      setAuditLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    }
  };

  const handleViewAppraisal = async (appraisal: Appraisal) => {
    setSelectedAppraisal(appraisal);
    // Trigger view log on backend
    try {
      await fetch(`/api/appraisals/${appraisal.id}`);
      fetchAuditLogs();
    } catch (err) {
      console.error('Failed to log view', err);
    }
  };

  const handleCreateAppraisal = async (input: AppraisalInput) => {
    setIsGenerating(true);
    try {
      const result = await generateCreditAppraisal(input);
      
      const newAppraisal: Appraisal = {
        id: Math.random().toString(36).substr(2, 9),
        company_name: input.companyName,
        status: result.recommendation === 'Reject' ? 'Rejected' : 'Completed',
        risk_score: result.risk_score,
        recommendation: result.recommendation,
        loan_limit: result.loan_limit,
        interest_rate: result.interest_rate,
        risk_categories: result.risk_categories,
        cam_content: result.cam_markdown,
        created_at: new Date().toISOString(),
        input_data: input
      };

      await fetch('/api/appraisals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppraisal)
      });

      await fetchAppraisals();
      fetchAuditLogs();
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Failed to generate appraisal', err);
      alert('Failed to generate appraisal. Please check your API key and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this appraisal?')) return;
    try {
      await fetch(`/api/appraisals/${id}`, { method: 'DELETE' });
      await fetchAppraisals();
      fetchAuditLogs();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian font-sans text-white selection:bg-cyber-emerald/30 selection:text-cyber-emerald">
      <Sidebar activeTab={activeTab} setActiveTab={(t) => {
        setActiveTab(t);
        setSelectedAppraisal(null);
      }} />
      
      <main className="ml-72 p-16 max-w-[1600px] mx-auto">
        <AnimatePresence mode="wait">
          {selectedAppraisal ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <AppraisalDetail 
                appraisal={selectedAppraisal} 
                onBack={() => setSelectedAppraisal(null)} 
              />
            </motion.div>
          ) : activeTab === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <Dashboard 
                appraisals={appraisals} 
                onView={handleViewAppraisal}
                onDelete={handleDelete}
              />
            </motion.div>
          ) : activeTab === 'audit' ? (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <AuditTrail logs={auditLogs} />
            </motion.div>
          ) : (
            <motion.div
              key="new"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            >
              <NewAppraisalForm 
                onSubmit={handleCreateAppraisal} 
                isGenerating={isGenerating} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
