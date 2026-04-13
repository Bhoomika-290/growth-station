import { useState } from 'react';
import { useStationStore, domainConfig } from '@/store/useStationStore';
import { FileText, CheckCircle, AlertCircle, Download, X, Plus, Trash2, Eye } from 'lucide-react';

interface ResumeData {
  objective: string;
  education: { degree: string; college: string; year: string; gpa: string }[];
  skills: string[];
  experience: { title: string; company: string; duration: string; desc: string }[];
  projects: { name: string; desc: string; tech: string }[];
  achievements: string[];
}

const templateStyles = {
  Professional: { accent: 'border-l-4 border-accent', header: 'bg-primary text-primary-foreground' },
  Technical: { accent: 'border-l-4 border-accent', header: 'bg-accent text-accent-foreground' },
  Academic: { accent: 'border-l-4 border-muted-foreground', header: 'bg-muted text-foreground' },
};

export default function Resume() {
  const { domain, user } = useStationStore();
  const config = domainConfig[domain];
  const [selectedTemplate, setSelectedTemplate] = useState('Professional');
  const [showPreview, setShowPreview] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const [resume, setResume] = useState<ResumeData>({
    objective: `Motivated ${config.label} professional seeking opportunities in ${config.companies[0]} to apply skills in ${config.vaultTopics[0]} and ${config.vaultTopics[1]}.`,
    education: [{ degree: user?.specialization || 'B.Tech Computer Science', college: user?.college || '', year: user?.year || 'Final Year', gpa: '' }],
    skills: config.vaultTopics.slice(0, 4),
    experience: [{ title: '', company: '', duration: '', desc: '' }],
    projects: [{ name: '', desc: '', tech: '' }],
    achievements: [''],
  });

  const atsChecks = [
    { ok: !!(user?.name), text: 'Contact info complete', tip: 'Add your full name in profile' },
    { ok: resume.skills.length >= 3, text: 'Skills section (3+ skills)', tip: 'Add at least 3 relevant skills' },
    { ok: resume.objective.length > 20, text: 'Career objective written', tip: 'Write a clear career objective' },
    { ok: resume.education[0].college.length > 0, text: 'Education details filled', tip: 'Add your college information' },
    { ok: resume.projects[0].name.length > 0, text: 'Projects section filled', tip: 'Add at least one project' },
    { ok: resume.experience[0].title.length > 0, text: 'Experience/internship added', tip: 'Add work experience or internships' },
    { ok: resume.achievements[0]?.length > 0, text: 'Achievements highlighted', tip: 'Add quantifiable achievements' },
  ];

  const atsScore = Math.round((atsChecks.filter(c => c.ok).length / atsChecks.length) * 100);

  const addSkill = () => {
    if (newSkill.trim() && !resume.skills.includes(newSkill.trim())) {
      setResume(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setResume(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent";

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resume & Portfolio</h1>
          <p className="text-sm text-muted-foreground">Build a {config.label}-optimized resume</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBuilder(!showBuilder)} className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover-scale flex items-center gap-2">
            <FileText className="w-4 h-4" /> {showBuilder ? 'Hide Editor' : 'Edit Resume'}
          </button>
          <button onClick={() => setShowPreview(true)} className="px-4 py-2 rounded-xl bg-muted text-foreground text-sm font-medium hover-scale flex items-center gap-2">
            <Eye className="w-4 h-4" /> Preview
          </button>
        </div>
      </div>

      {/* ATS Score */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">ATS Readiness Score</h3>
          <span className={`text-2xl font-bold ${atsScore >= 70 ? 'text-accent' : 'text-destructive'}`}>{atsScore}/100</span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden mb-4">
          <div className={`h-full rounded-full transition-all ${atsScore >= 70 ? 'bg-accent' : 'bg-destructive'}`} style={{ width: `${atsScore}%` }} />
        </div>
        <div className="space-y-2">
          {atsChecks.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {item.ok ? <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" /> : <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />}
              <span className={item.ok ? '' : 'text-muted-foreground'}>{item.text}</span>
              {!item.ok && <span className="text-[10px] text-destructive ml-auto">{item.tip}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Resume Builder */}
      {showBuilder && (
        <div className="space-y-4 animate-fade-in">
          {/* Objective */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-medium text-sm mb-2">Career Objective</h4>
            <textarea value={resume.objective} onChange={(e) => setResume(prev => ({ ...prev, objective: e.target.value }))}
              className={`${inputClass} resize-none`} rows={3} />
          </div>

          {/* Education */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-medium text-sm mb-2">Education</h4>
            {resume.education.map((edu, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                <input placeholder="Degree" value={edu.degree} onChange={(e) => {
                  const n = [...resume.education]; n[i] = { ...n[i], degree: e.target.value }; setResume(prev => ({ ...prev, education: n }));
                }} className={inputClass} />
                <input placeholder="College" value={edu.college} onChange={(e) => {
                  const n = [...resume.education]; n[i] = { ...n[i], college: e.target.value }; setResume(prev => ({ ...prev, education: n }));
                }} className={inputClass} />
                <input placeholder="Year" value={edu.year} onChange={(e) => {
                  const n = [...resume.education]; n[i] = { ...n[i], year: e.target.value }; setResume(prev => ({ ...prev, education: n }));
                }} className={inputClass} />
                <input placeholder="GPA/Percentage" value={edu.gpa} onChange={(e) => {
                  const n = [...resume.education]; n[i] = { ...n[i], gpa: e.target.value }; setResume(prev => ({ ...prev, education: n }));
                }} className={inputClass} />
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="bg-card rounded-xl border border-border p-4">
            <h4 className="font-medium text-sm mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {resume.skills.map(s => (
                <span key={s} className="flex items-center gap-1 px-3 py-1 rounded-lg bg-accent/10 text-accent text-xs">
                  {s}
                  <button onClick={() => removeSkill(s)} className="hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input placeholder="Add a skill" value={newSkill} onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()} className={inputClass} />
              <button onClick={addSkill} className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-sm hover-scale"><Plus className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Projects */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Projects</h4>
              <button onClick={() => setResume(prev => ({ ...prev, projects: [...prev.projects, { name: '', desc: '', tech: '' }] }))}
                className="text-xs text-accent flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {resume.projects.map((proj, i) => (
              <div key={i} className="grid grid-cols-1 gap-2 mb-3 pb-3 border-b border-border last:border-0">
                <input placeholder="Project name" value={proj.name} onChange={(e) => {
                  const n = [...resume.projects]; n[i] = { ...n[i], name: e.target.value }; setResume(prev => ({ ...prev, projects: n }));
                }} className={inputClass} />
                <input placeholder="Description" value={proj.desc} onChange={(e) => {
                  const n = [...resume.projects]; n[i] = { ...n[i], desc: e.target.value }; setResume(prev => ({ ...prev, projects: n }));
                }} className={inputClass} />
                <input placeholder="Technologies used" value={proj.tech} onChange={(e) => {
                  const n = [...resume.projects]; n[i] = { ...n[i], tech: e.target.value }; setResume(prev => ({ ...prev, projects: n }));
                }} className={inputClass} />
              </div>
            ))}
          </div>

          {/* Experience */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Experience / Internships</h4>
              <button onClick={() => setResume(prev => ({ ...prev, experience: [...prev.experience, { title: '', company: '', duration: '', desc: '' }] }))}
                className="text-xs text-accent flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {resume.experience.map((exp, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 mb-3 pb-3 border-b border-border last:border-0">
                <input placeholder="Job title" value={exp.title} onChange={(e) => {
                  const n = [...resume.experience]; n[i] = { ...n[i], title: e.target.value }; setResume(prev => ({ ...prev, experience: n }));
                }} className={inputClass} />
                <input placeholder="Company" value={exp.company} onChange={(e) => {
                  const n = [...resume.experience]; n[i] = { ...n[i], company: e.target.value }; setResume(prev => ({ ...prev, experience: n }));
                }} className={inputClass} />
                <input placeholder="Duration" value={exp.duration} onChange={(e) => {
                  const n = [...resume.experience]; n[i] = { ...n[i], duration: e.target.value }; setResume(prev => ({ ...prev, experience: n }));
                }} className={inputClass} />
                <input placeholder="Description" value={exp.desc} onChange={(e) => {
                  const n = [...resume.experience]; n[i] = { ...n[i], desc: e.target.value }; setResume(prev => ({ ...prev, experience: n }));
                }} className={inputClass} />
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-sm">Achievements</h4>
              <button onClick={() => setResume(prev => ({ ...prev, achievements: [...prev.achievements, ''] }))}
                className="text-xs text-accent flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
            </div>
            {resume.achievements.map((a, i) => (
              <input key={i} placeholder={`Achievement ${i + 1}`} value={a} onChange={(e) => {
                const n = [...resume.achievements]; n[i] = e.target.value; setResume(prev => ({ ...prev, achievements: n }));
              }} className={`${inputClass} mb-2`} />
            ))}
          </div>
        </div>
      )}

      {/* Templates */}
      <div>
        <h3 className="font-semibold mb-4">Resume Template</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {(['Professional', 'Technical', 'Academic'] as const).map((t) => (
            <button key={t} onClick={() => setSelectedTemplate(t)}
              className={`bg-card rounded-xl border p-6 text-center transition-all group ${selectedTemplate === t ? 'border-accent ring-2 ring-accent/30' : 'border-border hover:border-accent/50'}`}>
              <FileText className={`w-8 h-8 mx-auto mb-3 ${selectedTemplate === t ? 'text-accent' : 'text-muted-foreground group-hover:text-accent'} transition-colors`} />
              <p className="text-sm font-medium">{t}</p>
              <p className="text-xs text-muted-foreground mt-1">Optimized for {config.label}</p>
            </button>
          ))}
        </div>
      </div>

      <button onClick={() => setShowPreview(true)} className="w-full py-3 rounded-xl bg-accent text-accent-foreground font-medium flex items-center justify-center gap-2 hover-scale">
        <Eye className="w-4 h-4" /> Preview & Download
      </button>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
              <h3 className="font-semibold">Resume Preview — {selectedTemplate}</h3>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover-scale flex items-center gap-2">
                  <Download className="w-4 h-4" /> Print/Save PDF
                </button>
                <button onClick={() => setShowPreview(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
            </div>
            <div className="p-8 space-y-6">
              {/* Header */}
              <div className={`p-6 rounded-xl ${templateStyles[selectedTemplate as keyof typeof templateStyles].header}`}>
                <h2 className="text-2xl font-bold">{user?.name || 'Your Name'}</h2>
                <p className="text-sm opacity-80">{user?.specialization || config.label} | {user?.city || 'City'}, {user?.state || 'State'}</p>
                <p className="text-xs opacity-60 mt-1">{user?.college || 'College Name'} · {user?.year || 'Year'}</p>
              </div>

              {/* Objective */}
              <div className={templateStyles[selectedTemplate as keyof typeof templateStyles].accent + ' pl-4'}>
                <h3 className="font-semibold text-sm mb-1">Career Objective</h3>
                <p className="text-xs text-muted-foreground">{resume.objective}</p>
              </div>

              {/* Education */}
              <div className={templateStyles[selectedTemplate as keyof typeof templateStyles].accent + ' pl-4'}>
                <h3 className="font-semibold text-sm mb-2">Education</h3>
                {resume.education.filter(e => e.degree).map((edu, i) => (
                  <div key={i} className="text-xs mb-1">
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-muted-foreground">{edu.college} {edu.year && `· ${edu.year}`} {edu.gpa && `· ${edu.gpa}`}</p>
                  </div>
                ))}
              </div>

              {/* Skills */}
              <div className={templateStyles[selectedTemplate as keyof typeof templateStyles].accent + ' pl-4'}>
                <h3 className="font-semibold text-sm mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {resume.skills.map(s => <span key={s} className="px-2 py-1 rounded bg-accent/10 text-accent text-xs">{s}</span>)}
                </div>
              </div>

              {/* Projects */}
              {resume.projects.some(p => p.name) && (
                <div className={templateStyles[selectedTemplate as keyof typeof templateStyles].accent + ' pl-4'}>
                  <h3 className="font-semibold text-sm mb-2">Projects</h3>
                  {resume.projects.filter(p => p.name).map((proj, i) => (
                    <div key={i} className="text-xs mb-2">
                      <p className="font-medium">{proj.name}</p>
                      {proj.desc && <p className="text-muted-foreground">{proj.desc}</p>}
                      {proj.tech && <p className="text-accent mt-0.5">{proj.tech}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Experience */}
              {resume.experience.some(e => e.title) && (
                <div className={templateStyles[selectedTemplate as keyof typeof templateStyles].accent + ' pl-4'}>
                  <h3 className="font-semibold text-sm mb-2">Experience</h3>
                  {resume.experience.filter(e => e.title).map((exp, i) => (
                    <div key={i} className="text-xs mb-2">
                      <p className="font-medium">{exp.title} at {exp.company}</p>
                      {exp.duration && <p className="text-muted-foreground">{exp.duration}</p>}
                      {exp.desc && <p className="text-muted-foreground">{exp.desc}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Achievements */}
              {resume.achievements.some(a => a) && (
                <div className={templateStyles[selectedTemplate as keyof typeof templateStyles].accent + ' pl-4'}>
                  <h3 className="font-semibold text-sm mb-2">Achievements</h3>
                  <ul className="text-xs space-y-1">
                    {resume.achievements.filter(a => a).map((a, i) => <li key={i} className="text-muted-foreground">- {a}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
