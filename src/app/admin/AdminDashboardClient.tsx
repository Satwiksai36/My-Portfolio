'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Trash, ArrowUp, ArrowDown, Save, LogOut, ExternalLink, Upload, CheckCircle, AlertTriangle, Edit, Check, Menu, X, PanelLeftClose, PanelLeftOpen, MessageSquare, Mail, LayoutDashboard, User, Folder, Briefcase, Terminal, GraduationCap, Award } from 'lucide-react';
import { useTheme } from '@/lib/ThemeProvider';
import { CustomCursor } from '@/components/CustomCursor';
import { PortfolioData, Project, EducationItem, Stat, getAutoLogoUrl, normalizeIconUrl } from '@/lib/data';
import { TECH_LOGOS } from '@/components/Stack';

interface AdminDashboardClientProps {
  initialData: PortfolioData;
}

export default function AdminDashboardClient({ initialData }: AdminDashboardClientProps) {
  const [data, setData] = useState<PortfolioData>(initialData);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'home' | 'about' | 'education' | 'skills' | 'services' | 'projects' | 'credentials' | 'contact' | 'messages'>('dashboard');
  const [messages, setMessages] = useState<{ id: string; name: string; email: string; subject?: string; message: string; timestamp: string }[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingProjectIdx, setEditingProjectIdx] = useState<number | null>(null);
  const [editingEdIdx, setEditingEdIdx] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [resumeUploading, setResumeUploading] = useState(false);

  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // State for adding a new project
  const [newProject, setNewProject] = useState<Partial<Project>>({
    id: '',
    name: '',
    category: '',
    tagline: '',
    stack: [],
    image: '',
    year: new Date().getFullYear().toString(),
    link: '',
    github: ''
  });
  const [projectTagsInput, setProjectTagsInput] = useState('');

  // State for adding a new education item
  const [newEdItem, setNewEdItem] = useState<Partial<EducationItem>>({
    year: '',
    role: '',
    branch: '',
    company: '',
    type: '',
    bullets: [],
    stack: [],
    logo: ''
  });
  const [edBulletsInput, setEdBulletsInput] = useState('');

  // State for adding a new skill
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('');
  const [newSkillIcon, setNewSkillIcon] = useState('');
  const [editingSkillIdx, setEditingSkillIdx] = useState<number | null>(null);
  const [newFloatingWord, setNewFloatingWord] = useState('');
  const [newLogoName, setNewLogoName] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [previewFailed, setPreviewFailed] = useState(false);

  React.useEffect(() => {
    setPreviewFailed(false);
  }, [newSkillName]);

  const fetchMessages = async () => {
    setLoadingMessages(true);
    try {
      const res = await fetch('/api/admin/messages');
      if (res.ok) {
        const resData = await res.json();
        setMessages(resData.messages || []);
      } else {
        showToast('Failed to fetch contact inquiries.', 'error');
      }
    } catch (e) {
      showToast('Error loading inquiries.', 'error');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        showToast('Inquiry deleted successfully.', 'success');
      } else {
        showToast('Failed to delete inquiry.', 'error');
      }
    } catch (e) {
      showToast('Error deleting inquiry.', 'error');
    }
  };

  React.useEffect(() => {
    if (activeTab === 'messages' || activeTab === 'dashboard') {
      fetchMessages();
    }
  }, [activeTab]);

  // States for services CRUD
  const [newService, setNewService] = useState({
    index: '',
    title: '',
    short: '',
    body: '',
    keywords: [] as string[]
  });
  const [serviceKeywordsInput, setServiceKeywordsInput] = useState('');
  const [editingServiceIdx, setEditingServiceIdx] = useState<number | null>(null);

  // States for certifications CRUD
  const [newCert, setNewCert] = useState({
    num: '',
    title: '',
    issuer: '',
    year: '',
    file: ''
  });
  const [editingCertIdx, setEditingCertIdx] = useState<number | null>(null);

  // States for dynamic social links CRUD
  const [newSocialLabel, setNewSocialLabel] = useState('');
  const [newSocialHref, setNewSocialHref] = useState('');
  const [newSocialLogo, setNewSocialLogo] = useState('');
  const [socialLogoUploading, setSocialLogoUploading] = useState(false);
  const [editingSocialIdx, setEditingSocialIdx] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        showToast('All portfolio settings saved successfully!', 'success');
        router.refresh();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save changes.', 'error');
      }
    } catch (e) {
      showToast('A network error occurred while saving.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const resData = await res.json();
        onUploaded(resData.url);
        showToast('Image uploaded successfully!', 'success');
      } else {
        showToast('Image upload failed.', 'error');
      }
    } catch (err) {
      showToast('Image upload failed due to network error.', 'error');
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      showToast('Please upload a PDF file.', 'error');
      return;
    }
    setResumeUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const resData = await res.json();
        updateProfileValue('resumeUrl', resData.url);
        showToast('Resume uploaded successfully!', 'success');
      } else {
        showToast('Resume upload failed.', 'error');
      }
    } catch {
      showToast('Resume upload failed due to network error.', 'error');
    } finally {
      setResumeUploading(false);
      e.target.value = '';
    }
  };

  // Profile data updates
  const updateProfileValue = (key: keyof PortfolioData, value: any) => {
    setData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Social data updates
  const updateSocialValue = (key: keyof PortfolioData['socials'], value: string) => {
    setData((prev) => ({
      ...prev,
      socials: {
        ...prev.socials,
        [key]: value,
      },
    }));
  };

  // Projects list controls
  const handleAddProject = () => {
    if (!newProject.id || !newProject.name) {
      showToast('Project ID and Name are required.', 'error');
      return;
    }
    const stackArray = projectTagsInput ? projectTagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [];
    const projectToAdd: Project = {
      id: newProject.id,
      name: newProject.name,
      category: newProject.category || '',
      tagline: newProject.tagline || '',
      stack: stackArray,
      image: newProject.image || '/projects/placeholder.png',
      year: newProject.year || new Date().getFullYear().toString(),
      link: newProject.link || undefined,
      github: newProject.github || undefined,
    };

    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, projectToAdd],
    }));

    // Reset new project form
    setNewProject({
      id: '',
      name: '',
      category: '',
      tagline: '',
      stack: [],
      image: '',
      year: new Date().getFullYear().toString(),
      link: '',
      github: ''
    });
    setProjectTagsInput('');
    showToast('Project added. Click Save to persist.', 'success');
  };

  const handleDeleteProject = (index: number) => {
    setData((prev) => {
      const projects = [...prev.projects];
      projects.splice(index, 1);
      return { ...prev, projects };
    });
    showToast('Project removed. Click Save to persist.', 'success');
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.projects.length) return;

    setData((prev) => {
      const projects = [...prev.projects];
      const temp = projects[index];
      projects[index] = projects[targetIndex];
      projects[targetIndex] = temp;
      return { ...prev, projects };
    });
  };

  // Education list controls
  const handleAddEdItem = () => {
    if (!newEdItem.year || !newEdItem.role || !newEdItem.company) {
      showToast('Year, Role, and Company are required.', 'error');
      return;
    }
    const bulletsArray = edBulletsInput ? edBulletsInput.split('\n').map((b) => b.trim()).filter(Boolean) : [];
    const itemToAdd: EducationItem = {
      year: newEdItem.year,
      role: newEdItem.role,
      branch: newEdItem.branch || undefined,
      company: newEdItem.company,
      type: newEdItem.type || '',
      bullets: bulletsArray,
      stack: [],
      logo: newEdItem.logo || undefined,
    };

    setData((prev) => ({
      ...prev,
      education: [...prev.education, itemToAdd],
    }));

    setNewEdItem({
      year: '',
      role: '',
      branch: '',
      company: '',
      type: '',
      bullets: [],
      stack: [],
      logo: ''
    });
    setEdBulletsInput('');
    showToast('Timeline item added. Click Save to persist.', 'success');
  };

  const handleDeleteEdItem = (index: number) => {
    setData((prev) => {
      const education = [...prev.education];
      education.splice(index, 1);
      return { ...prev, education };
    });
    showToast('Timeline item removed. Click Save to persist.', 'success');
  };

  const moveEdItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= data.education.length) return;

    setData((prev) => {
      const education = [...prev.education];
      const temp = education[index];
      education[index] = education[targetIndex];
      education[targetIndex] = temp;
      return { ...prev, education };
    });
  };

  // Stats controls
  const updateStatValue = (index: number, key: keyof Stat, value: any) => {
    setData((prev) => {
      const stats = [...prev.stats];
      stats[index] = {
        ...stats[index],
        [key]: value,
      };
      return { ...prev, stats };
    });
  };

  // Tag list editing helper
  const handleStackTagsChange = (val: string) => {
    const arr = val.split(',').map((s) => s.trim()).filter(Boolean);
    updateProfileValue('heroStackTags', arr);
  };

  const handleQuoteWordsChange = (val: string) => {
    const arr = val.split(/\s+/).map((s) => s.trim()).filter(Boolean);
    updateProfileValue('aboutQuoteWords', arr);
  };

  const handleAddSkill = () => {
    if (!newSkillName || !newSkillCategory) {
      showToast('Skill Name and Category are required.', 'error');
      return;
    }
    const hasBuiltin = !!TECH_LOGOS[newSkillName];
    const skillIcon = normalizeIconUrl(newSkillIcon || (hasBuiltin ? undefined : getAutoLogoUrl(newSkillName)));

    const skillToAdd = {
      name: newSkillName,
      category: newSkillCategory,
      icon: skillIcon
    };

    setData((prev) => {
      const updatedSkills = [...(prev.skills || []), skillToAdd];
      const updatedTechLogos = { ...prev.customTechLogos };
      if (skillIcon && !updatedTechLogos[newSkillName]) {
        updatedTechLogos[newSkillName] = skillIcon;
      }
      return {
        ...prev,
        skills: updatedSkills,
        customTechLogos: updatedTechLogos
      };
    });

    setNewSkillName('');
    setNewSkillIcon('');
    showToast('Skill added. Click Save to persist.', 'success');
  };

  const handleDeleteSkill = (idx: number) => {
    setData((prev) => {
      const skillsList = [...(prev.skills || [])];
      skillsList.splice(idx, 1);
      return { ...prev, skills: skillsList };
    });
    showToast('Skill removed. Click Save to persist.', 'success');
  };

  // Services controls
  const handleAddService = () => {
    if (!newService.title || !newService.body) {
      showToast('Service Title and Body are required.', 'error');
      return;
    }
    const keywordsArray = serviceKeywordsInput ? serviceKeywordsInput.split(',').map((k) => k.trim()).filter(Boolean) : [];
    const itemToAdd = {
      index: newService.index || String((data.services?.length || 0) + 1).padStart(2, '0'),
      title: newService.title,
      short: newService.short || '',
      body: newService.body,
      keywords: keywordsArray,
    };
    setData((prev) => ({
      ...prev,
      services: [...(prev.services || []), itemToAdd],
    }));
    setNewService({ index: '', title: '', short: '', body: '', keywords: [] });
    setServiceKeywordsInput('');
    showToast('Service added. Click Save to persist.', 'success');
  };

  const handleDeleteService = (index: number) => {
    setData((prev) => {
      const list = [...(prev.services || [])];
      list.splice(index, 1);
      return { ...prev, services: list };
    });
    showToast('Service removed. Click Save to persist.', 'success');
  };

  const moveService = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (!data.services || targetIndex < 0 || targetIndex >= data.services.length) return;
    setData((prev) => {
      const list = [...(prev.services || [])];
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, services: list };
    });
  };

  // Certifications controls
  const handleAddCert = () => {
    if (!newCert.title || !newCert.issuer || !newCert.year) {
      showToast('Title, Issuer, and Year are required.', 'error');
      return;
    }
    const itemToAdd = {
      num: newCert.num || String((data.certifications?.length || 0) + 1).padStart(2, '0'),
      title: newCert.title,
      issuer: newCert.issuer,
      year: newCert.year,
      file: newCert.file || '',
    };
    setData((prev) => ({
      ...prev,
      certifications: [...(prev.certifications || []), itemToAdd],
    }));
    setNewCert({ num: '', title: '', issuer: '', year: '', file: '' });
    showToast('Certification added. Click Save to persist.', 'success');
  };

  const handleDeleteCert = (index: number) => {
    setData((prev) => {
      const list = [...(prev.certifications || [])];
      list.splice(index, 1);
      return { ...prev, certifications: list };
    });
    showToast('Certification removed. Click Save to persist.', 'success');
  };

  const moveCert = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (!data.certifications || targetIndex < 0 || targetIndex >= data.certifications.length) return;
    setData((prev) => {
      const list = [...(prev.certifications || [])];
      const temp = list[index];
      list[index] = list[targetIndex];
      list[targetIndex] = temp;
      return { ...prev, certifications: list };
    });
  };

  // Dynamic socials list parsing with fallback
  const activeSocialsList = useMemo<{ label: string; href: string; logo?: string }[]>(() => {
    const list = data.socialsList && data.socialsList.length > 0
      ? data.socialsList
      : [
        { label: 'GitHub', href: data.socials.github, logo: '' },
        { label: 'LinkedIn', href: data.socials.linkedin, logo: '' },
        { label: 'X', href: data.socials.x, logo: '' },
        { label: 'Instagram', href: data.socials.instagram, logo: '' },
        { label: 'LeetCode', href: data.socials.leetcode, logo: '' }
      ];
    return list.filter((item): item is { label: string; href: string; logo?: string } => !!item.href);
  }, [data.socialsList, data.socials]);

  // Sync socialsList to socials object
  const syncSocialsObject = (list: { label: string; href: string; logo?: string }[]) => {
    const updatedSocials = { ...data.socials };
    updatedSocials.github = '';
    updatedSocials.linkedin = '';
    updatedSocials.x = '';
    updatedSocials.instagram = '';
    updatedSocials.leetcode = '';
    list.forEach(item => {
      const key = item.label.toLowerCase();
      if (key === 'github') updatedSocials.github = item.href;
      else if (key === 'linkedin') updatedSocials.linkedin = item.href;
      else if (key === 'x' || key === 'twitter') updatedSocials.x = item.href;
      else if (key === 'instagram') updatedSocials.instagram = item.href;
      else if (key === 'leetcode') updatedSocials.leetcode = item.href;
    });
    return updatedSocials;
  };

  const handleAddSocialItem = () => {
    if (!newSocialLabel.trim() || !newSocialHref.trim()) {
      showToast('Label and URL link are required.', 'error');
      return;
    }
    const newItem = {
      label: newSocialLabel.trim(),
      href: newSocialHref.trim(),
      logo: newSocialLogo.trim() || undefined
    };
    const updatedList = [...activeSocialsList, newItem];
    const updatedSocials = syncSocialsObject(updatedList);

    setData(prev => ({
      ...prev,
      socialsList: updatedList,
      socials: updatedSocials
    }));

    setNewSocialLabel('');
    setNewSocialHref('');
    setNewSocialLogo('');
    showToast('Social link added. Click Save to persist.', 'success');
  };

  const handleDeleteSocialItem = (idx: number) => {
    const updatedList = [...activeSocialsList];
    updatedList.splice(idx, 1);
    const updatedSocials = syncSocialsObject(updatedList);

    setData(prev => ({
      ...prev,
      socialsList: updatedList,
      socials: updatedSocials
    }));
    showToast('Social link removed. Click Save to persist.', 'success');
  };

  const moveSocialItem = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= activeSocialsList.length) return;

    const updatedList = [...activeSocialsList];
    const temp = updatedList[idx];
    updatedList[idx] = updatedList[targetIdx];
    updatedList[targetIdx] = temp;

    setData(prev => ({
      ...prev,
      socialsList: updatedList
    }));
    showToast('Social link moved. Click Save to persist.', 'success');
  };

  const labelClass = `block text-[0.58rem] tracking-[0.18em] uppercase mb-2 font-bold ${isDark ? 'text-white/60' : 'text-black/60'
    }`;

  const inputClass = `w-full bg-transparent px-4 py-3 text-sm focus:outline-none transition-colors duration-200 border ${isDark
    ? 'border-white/12 text-white placeholder:text-white/30 focus:border-white/40 bg-white/1'
    : 'border-black/12 text-black placeholder:text-black/35 focus:border-black/35 bg-black/1'
    }`;

  const buttonSquareClass = `px-5 py-3 text-[0.62rem] tracking-[0.18em] uppercase font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2`;

  const cardClass = `relative p-6 border transition-colors duration-200 ${isDark ? 'border-white/8 bg-white/1' : 'border-black/8 bg-black/1'
    }`;

  return (
    <>
      <CustomCursor />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-8 right-8 z-9999 flex items-center gap-3 px-5 py-3.5 border shadow-2xl backdrop-blur-md animate-slide-in text-xs font-bold uppercase tracking-wider"
          style={{
            background: isDark ? '#161616' : '#FFFFFF',
            borderColor: toast.type === 'success' ? '#10B981' : '#EF4444',
            color: isDark ? '#FFFFFF' : '#0A0A0A'
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={16} className="text-emerald-500" />
          ) : (
            <AlertTriangle size={16} className="text-red-500" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#FFFFFF] text-black'} flex flex-col lg:flex-row`}>

        {/* Left Side Sidebar Navigation */}
        <aside className={`w-full ${isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} shrink-0 sticky top-0 max-h-screen overflow-y-auto lg:fixed lg:top-0 lg:left-0 lg:bottom-0 lg:max-h-none border-b lg:border-b-0 lg:border-r flex flex-col justify-between z-40 transition-all duration-300 ${isDark ? 'border-white/8 bg-[#0D0D0E]' : 'border-black/8 bg-[#FBFBFA]'
          }`}>
          {/* Top content */}
          <div className="flex flex-col">
            {/* Title / Logo block */}
            <div className={`p-4 lg:p-6 border-b flex ${isSidebarCollapsed ? 'lg:flex-col lg:items-center lg:justify-center' : 'items-center justify-between'} gap-4 transition-all duration-300 ${isDark ? 'border-white/8' : 'border-black/8'}`}>
              <div className={`${isSidebarCollapsed ? 'lg:hidden' : 'block'}`}>
                {(data.logoWhite || data.logoBlack) ? (
                  <a href="/" target="_blank" className="block shrink-0" title="View Site">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={isDark ? (data.logoWhite || '/logo/weblogo-white.png') : (data.logoBlack || '/logo/weblogo-black.png')}
                      alt="CyberSage Logo"
                      className="h-10 lg:h-20 w-auto object-contain max-w-[160px] opacity-90 hover:opacity-100 transition-opacity"
                    />
                  </a>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (url) => updateProfileValue('logoWhite', url))}
                      className="hidden"
                      id="sidebar-logo-upload"
                    />
                    <label
                      htmlFor="sidebar-logo-upload"
                      className={`w-12 h-12 lg:w-20 lg:h-20 border border-dashed rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors ${isDark ? 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/40' : 'border-black/20 bg-black/5 hover:bg-black/10 hover:border-black/40'
                        }`}
                      title="Upload Logo"
                    >
                      <Upload size={14} className={`lg:w-[18px] lg:h-[18px] ${isDark ? 'text-white/60' : 'text-black/60'}`} />
                      <span className="text-[0.45rem] lg:text-[0.55rem] font-black tracking-wider uppercase opacity-60 text-center px-1" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                        Add Logo
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Minimal indicator when collapsed */}
              {isSidebarCollapsed && (
                <div className="hidden lg:flex">
                  {(data.logoWhite || data.logoBlack) ? (
                    <a href="/" target="_blank" className="shrink-0" title="View Site">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={isDark ? (data.logoWhite || '/logo/weblogo-white.png') : (data.logoBlack || '/logo/weblogo-black.png')}
                        alt="Logo"
                        className="h-10 w-auto object-contain max-w-[36px] opacity-90 hover:opacity-100 transition-opacity"
                      />
                    </a>
                  ) : (
                    <div className="w-9 h-9 rounded-lg bg-neutral-500/10 border border-neutral-500/20 flex items-center justify-center font-black text-xs select-none">
                      CS
                    </div>
                  )}
                </div>
              )}

              {/* Navigation toggle controls */}
              <div className={`flex ${isSidebarCollapsed ? 'lg:flex-col lg:mt-2' : 'items-center'} gap-2`}>
                {/* Mobile menu toggle */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className={`lg:hidden w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'
                    }`}
                  title={isSidebarOpen ? "Close menu" : "Open menu"}
                >
                  {isSidebarOpen ? <X size={16} /> : <Menu size={16} />}
                </button>

                {/* Desktop menu toggle (Gemini style) */}
                <button
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className={`hidden lg:flex w-9 h-9 border items-center justify-center cursor-pointer transition-colors ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'
                    }`}
                  title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {isSidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                </button>
              </div>
            </div>

            {/* Vertical Tab navigation */}
            <nav className={`${isSidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col py-4 border-b lg:border-b-0 ${isDark ? 'border-white/8' : 'border-black/8'}`}>
              {[
                { id: 'dashboard', label: '01 / Dashboard', shortLabel: '01' },
                { id: 'home', label: '02 / Home', shortLabel: '02' },
                { id: 'about', label: '03 / About', shortLabel: '03' },
                { id: 'education', label: '04 / Experience', shortLabel: '04' },
                { id: 'skills', label: '05 / Skills', shortLabel: '05' },
                { id: 'services', label: '06 / Services', shortLabel: '06' },
                { id: 'projects', label: '07 / Projects', shortLabel: '07' },
                { id: 'credentials', label: '08 / Credentials', shortLabel: '08' },
                { id: 'contact', label: '09 / Contact', shortLabel: '09' },
                { id: 'messages', label: '10 / Inquiries', shortLabel: '10' },
              ].map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setIsSidebarOpen(false);
                      window.scrollTo({ top: 0 });
                    }}
                    className={`w-full text-left py-4 px-6 text-[0.68rem] tracking-[0.2em] uppercase font-bold border-l-2 transition-all cursor-pointer ${isSidebarCollapsed ? 'lg:text-center lg:px-0 lg:border-l-0 lg:border-b-2 lg:border-b-transparent' : ''
                      } ${active
                        ? (isDark
                          ? `bg-white/5 text-white ${isSidebarCollapsed ? 'lg:border-b-white' : 'border-l-white'}`
                          : `bg-black/5 text-black ${isSidebarCollapsed ? 'lg:border-b-black' : 'border-l-black'}`)
                        : 'opacity-50 hover:opacity-100 border-l-transparent border-b-transparent'
                      }`}
                    style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}
                    title={isSidebarCollapsed ? tab.label : undefined}
                  >
                    {isSidebarCollapsed ? (
                      <span className="hidden lg:inline-block w-full text-center tracking-normal font-black text-[11px]">{tab.shortLabel}</span>
                    ) : null}
                    <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom actions block */}
          <div className={`${isSidebarOpen ? 'flex' : 'hidden'} lg:flex p-6 ${isSidebarCollapsed ? 'lg:px-3' : 'lg:px-6'} border-t lg:border-t flex-col gap-4 ${isSidebarCollapsed ? 'lg:items-center' : ''} ${isDark ? 'border-white/8' : 'border-black/8'}`}>
            <div className={`flex items-center justify-between gap-3 ${isSidebarCollapsed ? 'lg:justify-center lg:w-full' : ''}`}>
              <span className={`text-[10px] uppercase font-bold tracking-widest opacity-50 ${isSidebarCollapsed ? 'lg:hidden' : ''}`}>Theme</span>
              <button
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`w-14 h-8 shrink-0 border rounded-full relative flex items-center px-1 transition-colors cursor-pointer ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'
                  }`}
                title="Toggle theme"
              >
                <motion.div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${isDark ? 'bg-white text-black' : 'bg-black text-white'
                    }`}
                  layout
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{
                    x: isDark ? 24 : 0,
                  }}
                >
                  {isDark ? 'DK' : 'LT'}
                </motion.div>
              </button>
            </div>

            <button
              onClick={handleLogout}
              className={`${buttonSquareClass} w-full justify-center bg-red-600 text-white hover:bg-red-500 ${isSidebarCollapsed ? 'lg:px-0 lg:w-9 lg:h-9 lg:rounded-lg' : ''}`}
              title="Logout"
            >
              <LogOut size={12} />
              <span className={isSidebarCollapsed ? 'lg:hidden' : ''}>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content area */}
        <main className={`flex-1 ${isSidebarCollapsed ? 'lg:pl-32' : 'lg:pl-80'} w-full min-h-screen py-10 px-6 sm:px-10 max-w-[1440px] mx-auto transition-all duration-300`}>

          {/* TAB 0: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-5xl animate-fade-in">
              <div>
                <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  Welcome back, {data.firstName || data.fullName}!
                </h2>
                <p className="text-xs opacity-50 mt-1">
                  Here is an overview of your portfolio data and recent activities.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Projects Stats Card */}
                <div className={cardClass}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-extrabold tracking-tight block">
                        {data.projects.length}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-60 block mt-1">
                        Projects Published
                      </span>
                    </div>
                    <div className={`w-10 h-10 border rounded-lg flex items-center justify-center ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                      <Folder size={18} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed opacity-70 text-xs space-y-1.5" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <span className="font-bold block uppercase tracking-wider text-[9px] opacity-55">Recent Projects</span>
                    {data.projects.slice(0, 2).map((p) => (
                      <div key={p.id} className="flex justify-between items-center gap-2">
                        <span className="truncate font-semibold">{p.name}</span>
                        <span className="shrink-0 text-[10px] opacity-65">{p.year}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { setActiveTab('projects'); window.scrollTo({ top: 0 }); }}
                    className="w-full mt-4 py-2 border text-[9px] font-bold uppercase tracking-wider hover:bg-neutral-500/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }}
                  >
                    Manage Projects <ExternalLink size={10} />
                  </button>
                </div>

                {/* Experience Stats Card */}
                <div className={cardClass}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-extrabold tracking-tight block">
                        {data.education.length}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-60 block mt-1">
                        Experience Items
                      </span>
                    </div>
                    <div className={`w-10 h-10 border rounded-lg flex items-center justify-center ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                      <GraduationCap size={18} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed opacity-70 text-xs space-y-1.5" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <span className="font-bold block uppercase tracking-wider text-[9px] opacity-55">Latest Experience</span>
                    {data.education.slice(0, 1).map((ed, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="font-semibold truncate">{ed.role}</div>
                        <div className="opacity-65 truncate text-[10px]">{ed.company} · {ed.year}</div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => { setActiveTab('education'); window.scrollTo({ top: 0 }); }}
                    className="w-full mt-4 py-2 border text-[9px] font-bold uppercase tracking-wider hover:bg-neutral-500/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }}
                  >
                    Manage Timeline <ExternalLink size={10} />
                  </button>
                </div>

                {/* Skills Stats Card */}
                <div className={cardClass}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-extrabold tracking-tight block">
                        {data.skills?.length || 0}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-60 block mt-1">
                        Total Skills
                      </span>
                    </div>
                    <div className={`w-10 h-10 border rounded-lg flex items-center justify-center ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                      <Terminal size={18} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed opacity-70 text-xs space-y-1.5" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <span className="font-bold block uppercase tracking-wider text-[9px] opacity-55">Recent Skills</span>
                    <div className="flex flex-wrap gap-1">
                      {(data.skills || []).slice(0, 3).map((s, idx) => (
                        <span key={idx} className="text-[10px] px-1.5 py-0.5 border select-none opacity-80" style={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }}>
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveTab('skills'); window.scrollTo({ top: 0 }); }}
                    className="w-full mt-4 py-2 border text-[9px] font-bold uppercase tracking-wider hover:bg-neutral-500/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }}
                  >
                    Manage Skills <ExternalLink size={10} />
                  </button>
                </div>

                {/* Inquiries Stats Card */}
                <div className={cardClass}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-extrabold tracking-tight block">
                        {loadingMessages ? (
                          <span className="inline-block w-4 h-4 border-2 border-t-transparent animate-spin rounded-full" style={{ borderColor: isDark ? 'white' : 'black', borderTopColor: 'transparent' }} />
                        ) : messages.length}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-60 block mt-1">
                        Inquiries Received
                      </span>
                    </div>
                    <div className={`w-10 h-10 border rounded-lg flex items-center justify-center ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'}`}>
                      <MessageSquare size={18} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-dashed opacity-70 text-xs space-y-1.5 flex flex-col justify-between" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <div>
                      <span className="font-bold block uppercase tracking-wider text-[9px] opacity-55">Latest Message</span>
                      {messages.length > 0 ? (
                        <div className="space-y-0.5">
                          <div className="font-semibold truncate">{messages[0].name}</div>
                          <p className="opacity-65 truncate text-[10px] italic">"{messages[0].message}"</p>
                        </div>
                      ) : (
                        <div className="italic opacity-60 text-[10px]">No messages yet</div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => { setActiveTab('messages'); window.scrollTo({ top: 0 }); }}
                    className="w-full mt-4 py-2 border text-[9px] font-bold uppercase tracking-wider hover:bg-neutral-500/5 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }}
                  >
                    View Messages <ExternalLink size={10} />
                  </button>
                </div>
              </div>

              {/* Lower Section Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Summary Card */}
                <div className={`${cardClass} lg:col-span-2 space-y-4`}>
                  <div className="border-b pb-3" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                      Profile At a Glance
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="opacity-50 font-semibold block uppercase tracking-wider text-[9px]">Full Name</span>
                      <span className="font-bold">{data.fullName}</span>
                    </div>
                    <div>
                      <span className="opacity-50 font-semibold block uppercase tracking-wider text-[9px]">Location</span>
                      <span className="font-bold">{data.location}</span>
                    </div>
                    <div>
                      <span className="opacity-50 font-semibold block uppercase tracking-wider text-[9px]">Primary Email</span>
                      <span className="font-bold">
                        <a href={`mailto:${data.email}`} className="text-indigo-500 hover:underline">{data.email}</a>
                      </span>
                    </div>
                    <div>
                      <span className="opacity-50 font-semibold block uppercase tracking-wider text-[9px]">CV Resume Path</span>
                      <span className="font-bold truncate block">
                        {data.resumeUrl ? (
                          <a href={data.resumeUrl} target="_blank" className="text-indigo-500 hover:underline inline-flex items-center gap-1">
                            Download / View PDF <ExternalLink size={10} />
                          </a>
                        ) : (
                          <span className="opacity-40 italic">Not uploaded</span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Active Social Profiles list */}
                  <div className="space-y-2 pt-2">
                    <span className="opacity-50 font-semibold block uppercase tracking-wider text-[9px]">Active Social Integrations</span>
                    <div className="flex flex-wrap gap-2">
                      {activeSocialsList.map((social, idx) => (
                        <a
                          key={idx}
                          href={social.href}
                          target="_blank"
                          className="text-xs px-2.5 py-1 border rounded hover:bg-neutral-500/5 transition-colors inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px]"
                          style={{ borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)' }}
                        >
                          {social.label} <ExternalLink size={8} />
                        </a>
                      ))}
                      {activeSocialsList.length === 0 && (
                        <span className="italic opacity-55 text-xs">No active social accounts linked</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0 }); }}
                      className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'}`}
                    >
                      Configure Profile Settings
                    </button>
                  </div>
                </div>

                {/* Additional Sections & Stats */}
                <div className={`${cardClass} space-y-4`}>
                  <div className="border-b pb-3" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                      Additional Sections
                    </h3>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Briefcase size={14} className="opacity-60" />
                        <span className="font-semibold">Services Offered</span>
                      </div>
                      <span className="font-bold border px-2 py-0.5 rounded opacity-75">{data.services?.length || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Award size={14} className="opacity-60" />
                        <span className="font-semibold">Credentials & Certs</span>
                      </div>
                      <span className="font-bold border px-2 py-0.5 rounded opacity-75">{data.certifications?.length || 0}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dashed space-y-3" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                    <span className="font-bold block uppercase tracking-wider text-[9px] opacity-55">Quick Admin Actions</span>
                    <button
                      onClick={handleSaveAll}
                      disabled={saving}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider text-[9px] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Save size={12} /> {saving ? 'Saving...' : 'Force Save All Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <div className="space-y-8 max-w-4xl animate-fade-in">
              <h2 className="text-xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                Home Section Configuration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    value={data.fullName}
                    onChange={(e) => updateProfileValue('fullName', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    type="text"
                    value={data.firstName}
                    onChange={(e) => updateProfileValue('firstName', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    type="text"
                    value={data.lastName}
                    onChange={(e) => updateProfileValue('lastName', e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={labelClass}>Tagline</label>
                  <input
                    type="text"
                    value={data.tagline}
                    onChange={(e) => updateProfileValue('tagline', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Status Text</label>
                  <input
                    type="text"
                    value={data.statusText}
                    onChange={(e) => updateProfileValue('statusText', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Base URL</label>
                  <input
                    type="text"
                    value={data.baseUrl}
                    onChange={(e) => updateProfileValue('baseUrl', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>Hero Section Side Label</label>
                  <input
                    type="text"
                    value={data.heroSideLabel || ''}
                    onChange={(e) => updateProfileValue('heroSideLabel', e.target.value)}
                    className={inputClass}
                    placeholder="e.g. Full Stack Engineer · 5+ Years · Remote"
                  />
                </div>



                <div className="md:col-span-2 border border-dashed p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none bg-black/1 dark:bg-white/1">
                  <div className="flex-1">
                    <label className={labelClass}>Hero Background Video</label>
                    <span className="text-xs opacity-60 font-mono block truncate mb-2">{data.heroVideo || 'None'}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleImageUpload(e, (url) => updateProfileValue('heroVideo', url))}
                      className="hidden"
                      id="hero-video-uploader"
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <label htmlFor="hero-video-uploader" className={`${buttonSquareClass} cursor-pointer max-w-fit border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                        <Upload size={12} /> Upload Video
                      </label>
                      {data.heroVideo && (
                        <button type="button" onClick={() => updateProfileValue('heroVideo', '')} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                          <Trash size={12} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                  {data.heroVideo && (
                    <video src={data.heroVideo} className="w-20 h-20 object-cover border" muted />
                  )}
                </div>

                <div className="md:col-span-2 border border-dashed p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none bg-black/1 dark:bg-white/1">
                  <div className="flex-1">
                    <label className={labelClass}>Hero Video Poster Image</label>
                    <span className="text-xs opacity-60 font-mono block truncate mb-2">{data.heroPoster || 'None'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (url) => updateProfileValue('heroPoster', url))}
                      className="hidden"
                      id="hero-poster-uploader"
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <label htmlFor="hero-poster-uploader" className={`${buttonSquareClass} cursor-pointer max-w-fit border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                        <Upload size={12} /> Upload Image
                      </label>
                      {data.heroPoster && (
                        <button type="button" onClick={() => updateProfileValue('heroPoster', '')} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                          <Trash size={12} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                  {data.heroPoster && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.heroPoster} alt="Poster Preview" className="w-20 h-20 object-cover border" />
                  )}
                </div>
              </div>



              {/* ── Branding Logos ── */}
              <div className="space-y-4 pt-6 border-t border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <h3 className="text-sm font-bold tracking-[0.12em] uppercase opacity-60" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  Branding Logos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo White (Footer / Icon) */}
                  <div className="border border-dashed p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none bg-black/1 dark:bg-white/1">
                    <div className="flex-1">
                      <label className={labelClass}>Logo White (Footer / General)</label>
                      <span className="text-xs opacity-60 font-mono block truncate mb-2">{data.logoWhite || 'None'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (url) => updateProfileValue('logoWhite', url))}
                        className="hidden"
                        id="logo-white-uploader-home"
                      />
                      <div className="flex flex-wrap gap-2 items-center">
                        <label htmlFor="logo-white-uploader-home" className={`${buttonSquareClass} cursor-pointer max-w-fit border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                          <Upload size={12} /> Upload File
                        </label>
                        {data.logoWhite && (
                          <button type="button" onClick={() => updateProfileValue('logoWhite', '')} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                            <Trash size={12} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                    {data.logoWhite && (
                      <div className="p-2 bg-[#1C1C1E] border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.logoWhite} alt="Logo White Preview" className="h-6 object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Logo White Horizontal (Navbar) */}
                  <div className="border border-dashed p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none bg-black/1 dark:bg-white/1">
                    <div className="flex-1">
                      <label className={labelClass}>Logo White Horizontal (Navbar)</label>
                      <span className="text-xs opacity-60 font-mono block truncate mb-2">{data.logoWhiteHorizontal || 'None'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (url) => updateProfileValue('logoWhiteHorizontal', url))}
                        className="hidden"
                        id="logo-white-horiz-uploader-home"
                      />
                      <div className="flex flex-wrap gap-2 items-center">
                        <label htmlFor="logo-white-horiz-uploader-home" className={`${buttonSquareClass} cursor-pointer max-w-fit border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                          <Upload size={12} /> Upload File
                        </label>
                        {data.logoWhiteHorizontal && (
                          <button type="button" onClick={() => updateProfileValue('logoWhiteHorizontal', '')} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                            <Trash size={12} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                    {data.logoWhiteHorizontal && (
                      <div className="p-2 bg-[#1C1C1E] border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.logoWhiteHorizontal} alt="Logo Horiz Preview" className="h-6 object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Logo Black (Footer / Icon) */}
                  <div className="border border-dashed p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none bg-black/1 dark:bg-white/1">
                    <div className="flex-1">
                      <label className={labelClass}>Logo Black (Footer / General)</label>
                      <span className="text-xs opacity-60 font-mono block truncate mb-2">{data.logoBlack || 'None'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (url) => updateProfileValue('logoBlack', url))}
                        className="hidden"
                        id="logo-black-uploader-home"
                      />
                      <div className="flex flex-wrap gap-2 items-center">
                        <label htmlFor="logo-black-uploader-home" className={`${buttonSquareClass} cursor-pointer max-w-fit border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                          <Upload size={12} /> Upload File
                        </label>
                        {data.logoBlack && (
                          <button type="button" onClick={() => updateProfileValue('logoBlack', '')} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                            <Trash size={12} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                    {data.logoBlack && (
                      <div className="p-2 bg-white border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.logoBlack} alt="Logo Black Preview" className="h-6 object-contain" />
                      </div>
                    )}
                  </div>

                  {/* Logo Black Horizontal (Navbar) */}
                  <div className="border border-dashed p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none bg-black/1 dark:bg-white/1">
                    <div className="flex-1">
                      <label className={labelClass}>Logo Black Horizontal (Navbar)</label>
                      <span className="text-xs opacity-60 font-mono block truncate mb-2">{data.logoBlackHorizontal || 'None'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (url) => updateProfileValue('logoBlackHorizontal', url))}
                        className="hidden"
                        id="logo-black-horiz-uploader-home"
                      />
                      <div className="flex flex-wrap gap-2 items-center">
                        <label htmlFor="logo-black-horiz-uploader-home" className={`${buttonSquareClass} cursor-pointer max-w-fit border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                          <Upload size={12} /> Upload File
                        </label>
                        {data.logoBlackHorizontal && (
                          <button type="button" onClick={() => updateProfileValue('logoBlackHorizontal', '')} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                            <Trash size={12} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                    {data.logoBlackHorizontal && (
                      <div className="p-2 bg-white border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={data.logoBlackHorizontal} alt="Logo Black Horiz Preview" className="h-6 object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-8 border-t border-dashed mt-8 flex justify-end" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'
                    }`}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                  <Save size={14} /> {saving ? 'Saving Home Section...' : 'Save Home Details'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT */}
          {activeTab === 'about' && (
            <div className="space-y-8 max-w-4xl animate-fade-in">
              <h2 className="text-xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                About Section Configuration
              </h2>

              {/* ── 1. Profile Card Info ── */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold tracking-[0.12em] uppercase opacity-60" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  Profile Card Info
                </h3>
                <p className="text-xs opacity-40">These fields power the hanging profile card in the About section.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input
                      type="text"
                      value={data.fullName}
                      onChange={(e) => updateProfileValue('fullName', e.target.value)}
                      className={inputClass}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Title / Role</label>
                    <input
                      type="text"
                      value={data.title}
                      onChange={(e) => updateProfileValue('title', e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Full Stack Engineer"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Location</label>
                    <input
                      type="text"
                      value={data.location}
                      onChange={(e) => updateProfileValue('location', e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Remote · Worldwide"
                    />
                  </div>
                </div>

                {/* Headshot Image Upload */}
                <div className="border border-dashed p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                  <div className="flex-1">
                    <label className={labelClass}>Headshot / Profile Photo</label>
                    <span className="text-xs opacity-60 font-mono block truncate mb-2">{data.headshotImage || 'None'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, (url) => updateProfileValue('headshotImage', url))}
                      className="hidden"
                      id="headshot-uploader"
                    />
                    <div className="flex flex-wrap gap-2 items-center">
                      <label htmlFor="headshot-uploader" className={`${buttonSquareClass} cursor-pointer max-w-fit border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                        <Upload size={12} /> Upload Photo
                      </label>
                      {data.headshotImage && (
                        <button
                          type="button"
                          onClick={() => updateProfileValue('headshotImage', '')}
                          className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}
                        >
                          <Trash size={12} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                  {data.headshotImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={data.headshotImage} alt="Headshot Preview" className="w-20 h-20 object-cover border rounded-xl" />
                  )}
                </div>
              </div>



              {/* ── 3. Resume / CV ── */}
              <div className="space-y-4 pt-6 border-t border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <h3 className="text-sm font-bold tracking-[0.12em] uppercase opacity-60" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  Resume / CV
                </h3>
                <p className="text-xs opacity-40">Upload your PDF resume. The filename is what visitors see when they download it.</p>

                {/* Upload widget */}
                <div
                  className="border border-dashed p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                  style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs opacity-50 font-mono truncate mb-3">
                      {data.resumeUrl || 'No resume uploaded yet'}
                    </p>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleResumeUpload}
                      className="hidden"
                      id="resume-pdf-uploader-about"
                      disabled={resumeUploading}
                    />
                    <div className="flex flex-wrap gap-3 items-center">
                      <label
                        htmlFor="resume-pdf-uploader-about"
                        className={`${buttonSquareClass} cursor-pointer border border-neutral-500 ${resumeUploading ? 'opacity-50 pointer-events-none' : ''}`}
                        style={{ color: isDark ? '#ffffff' : '#000000' }}
                      >
                        <Upload size={12} />
                        {resumeUploading ? 'Uploading…' : 'Upload PDF'}
                      </label>
                      {data.resumeUrl && (
                        <a
                          href={data.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${buttonSquareClass} border border-neutral-500`}
                          style={{ color: isDark ? '#ffffff' : '#000000' }}
                        >
                          <ExternalLink size={12} /> Preview
                        </a>
                      )}
                      {data.resumeUrl && (
                        <button
                          type="button"
                          onClick={() => { updateProfileValue('resumeUrl', ''); updateProfileValue('resumeFilename', ''); }}
                          className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}
                        >
                          <Trash size={12} /> Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <div
                    className="shrink-0 w-20 h-20 border flex flex-col items-center justify-center gap-1"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}
                  >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                    <span className="text-xs opacity-40 font-mono">PDF</span>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Download Filename (what visitors see when they save the file)</label>
                  <input
                    type="text"
                    value={data.resumeFilename || ''}
                    onChange={(e) => updateProfileValue('resumeFilename', e.target.value)}
                    className={inputClass}
                    placeholder="e.g. John_Doe_Resume.pdf"
                  />
                </div>
                <p className="text-xs opacity-40 mt-1">Or paste a URL manually:</p>
                <input
                  type="text"
                  value={data.resumeUrl}
                  onChange={(e) => updateProfileValue('resumeUrl', e.target.value)}
                  className={inputClass}
                  placeholder="/uploads/my-resume.pdf or https://..."
                />
              </div>

              {/* ── 4. Bio & Quote ── */}
              <div className="space-y-6 pt-6 border-t border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <h3 className="text-sm font-bold tracking-[0.12em] uppercase opacity-60" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  Bio & Quote
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className={labelClass}>Short Bio</label>
                    <textarea
                      rows={3}
                      value={data.shortBio}
                      onChange={(e) => updateProfileValue('shortBio', e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Sub Bio</label>
                    <textarea
                      rows={3}
                      value={data.subBio}
                      onChange={(e) => updateProfileValue('subBio', e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Animated Glitch Quote (Plain Text)</label>
                    <textarea
                      rows={3}
                      value={data.aboutQuoteWords.join(' ')}
                      onChange={(e) => handleQuoteWordsChange(e.target.value)}
                      className={`${inputClass} resize-none`}
                      placeholder="Type the quote here. It will automatically be split into words for animations."
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-8 border-t border-dashed mt-8 flex justify-end" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'
                    }`}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                  <Save size={14} /> {saving ? 'Saving About Details...' : 'Save About Details'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS */}
          {activeTab === 'skills' && (
            <div className="space-y-8 max-w-4xl animate-fade-in">
              <h2 className="text-xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                Skills Section Configuration
              </h2>

              <div className="grid grid-cols-1 gap-6">

                {/* ── Section Headline ── */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold tracking-[0.12em] uppercase opacity-60" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                    Section Headline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Line 1 (Bold)</label>
                      <input
                        type="text"
                        value={data.skillsHeadline1 || ''}
                        onChange={(e) => updateProfileValue('skillsHeadline1', e.target.value)}
                        className={inputClass}
                        placeholder="Built to Scale."
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Line 2 (Italic)</label>
                      <input
                        type="text"
                        value={data.skillsHeadline2 || ''}
                        onChange={(e) => updateProfileValue('skillsHeadline2', e.target.value)}
                        className={inputClass}
                        placeholder="Engineered."
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Tagline (small text below headline)</label>
                      <input
                        type="text"
                        value={data.skillsTagline || ''}
                        onChange={(e) => updateProfileValue('skillsTagline', e.target.value)}
                        className={inputClass}
                        placeholder="Production-grade systems built with a modern, battle-tested stack."
                      />
                    </div>
                  </div>
                </div>

                {/* ── Floating Animation Words ── */}
                <div className="border border-dashed p-5 space-y-4" style={{ background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' }}>
                  <div>
                    <label className={labelClass}>Floating Animation Words</label>
                    <p className="text-xs opacity-40 mb-3">
                      These words float in the background of the Skills section. Type a word and press Enter or click + Add.
                    </p>
                    {/* Input row */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFloatingWord}
                        onChange={(e) => setNewFloatingWord(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const word = newFloatingWord.trim();
                            if (word && !(data.floatingWords || []).includes(word)) {
                              updateProfileValue('floatingWords', [...(data.floatingWords || []), word]);
                            }
                            setNewFloatingWord('');
                          }
                        }}
                        className={inputClass}
                        placeholder="e.g. TypeScript"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const word = newFloatingWord.trim();
                          if (word && !(data.floatingWords || []).includes(word)) {
                            updateProfileValue('floatingWords', [...(data.floatingWords || []), word]);
                          }
                          setNewFloatingWord('');
                        }}
                        className={`${buttonSquareClass} shrink-0 border border-neutral-500`}
                        style={{ color: isDark ? '#ffffff' : '#000000' }}
                      >
                        <Plus size={12} /> Add
                      </button>
                    </div>
                  </div>
                  {/* Chips */}
                  {(data.floatingWords || []).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(data.floatingWords || []).map((word, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 text-[0.78rem] font-mono px-3 py-1.5 border"
                          style={{
                            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)',
                            background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                            color: isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.75)',
                            fontStyle: 'italic',
                          }}
                        >
                          {word}
                          <button
                            type="button"
                            onClick={() => {
                              updateProfileValue('floatingWords', (data.floatingWords || []).filter((_, i) => i !== idx));
                            }}
                            className="opacity-40 hover:opacity-100 transition-opacity leading-none text-base"
                            title={`Remove "${word}"`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Category Bulk Rename Section */}
              <div className="space-y-4 pt-6 border-t border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <h3 className="text-sm font-bold tracking-tight uppercase" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  Bulk Rename Categories
                </h3>
                <p className="text-xs opacity-60">
                  Changing a category name here will automatically update the category for all skills belonging to it. Press Enter or click outside the box, then click "Save Skills Details" at the bottom to persist.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from(new Set((data.skills || []).map(s => s.category))).map((catName, idx) => (
                    <div key={idx} className={`p-4 border ${isDark ? 'border-white/8 bg-white/1' : 'border-black/8 bg-black/1'}`}>
                      <label className={labelClass}>Category Name</label>
                      <input
                        type="text"
                        defaultValue={catName}
                        onBlur={(e) => {
                          const newName = e.target.value.trim();
                          if (newName && newName !== catName) {
                            setData((prev) => {
                              const updatedSkills = (prev.skills || []).map(s =>
                                s.category === catName ? { ...s, category: newName } : s
                              );
                              return { ...prev, skills: updatedSkills };
                            });
                            showToast(`Category '${catName}' renamed to '${newName}'.`, 'success');
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const newName = (e.target as HTMLInputElement).value.trim();
                            if (newName && newName !== catName) {
                              setData((prev) => {
                                const updatedSkills = (prev.skills || []).map(s =>
                                  s.category === catName ? { ...s, category: newName } : s
                                );
                                return { ...prev, skills: updatedSkills };
                              });
                              showToast(`Category '${catName}' renamed to '${newName}'.`, 'success');
                            }
                          }
                        }}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Skills CRUD Editor */}
              <div className="space-y-6 pt-6 border-t border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <h3 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  Detailed Skills Categories (Stack)
                </h3>

                {/* Add Skill Form */}
                <div className={`${cardClass} border-2 border-dashed`}>
                  <span className="text-xs font-black tracking-widest uppercase block mb-4" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                    + Add New Skill
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Skill Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Python, Kubernetes"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Category *</label>
                      <input
                        type="text"
                        placeholder="e.g. Languages, Frameworks & Libraries"
                        value={newSkillCategory}
                        onChange={(e) => setNewSkillCategory(e.target.value)}
                        className={inputClass}
                        list="skill-categories-datalist"
                      />
                      <datalist id="skill-categories-datalist">
                        {Array.from(new Set((data.skills || []).map(s => s.category))).filter(Boolean).map((cat) => (
                          <option key={cat} value={cat} />
                        ))}
                      </datalist>
                    </div>
                    <div>
                      <label className={labelClass}>Icon / Logo</label>
                      <div className="flex items-center gap-2 select-none">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, (url) => setNewSkillIcon(url))}
                          className="hidden"
                          id="new-skill-icon-uploader"
                        />
                        <div className="flex flex-wrap gap-2 items-center w-full">
                          <label htmlFor="new-skill-icon-uploader" className={`${buttonSquareClass} cursor-pointer border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                            <Upload size={12} /> {newSkillIcon ? 'Change Icon' : 'Upload'}
                          </label>
                          {newSkillIcon && (
                            <button type="button" onClick={() => setNewSkillIcon('')} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                              <Trash size={12} /> Remove
                            </button>
                          )}
                        </div>
                        {newSkillIcon ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={newSkillIcon} alt="Icon Preview" className="w-9 h-9 object-contain border bg-neutral-800" />
                        ) : (
                          newSkillName.trim() && !previewFailed && (
                            TECH_LOGOS[newSkillName] ? (
                              <div className="w-9 h-9 border border-neutral-700 bg-neutral-800 flex items-center justify-center shrink-0" title="Built-in logo detected">
                                {TECH_LOGOS[newSkillName](18)}
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={normalizeIconUrl(getAutoLogoUrl(newSkillName), isDark)}
                                alt="Auto Preview"
                                className="w-9 h-9 object-contain border bg-neutral-800 shrink-0"
                                onError={() => setPreviewFailed(true)}
                              />
                            )
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleAddSkill}
                      className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'}`}
                    >
                      <Plus size={12} /> Add Skill
                    </button>
                  </div>
                </div>

                {/* Current Skills List */}
                <div className="space-y-3">
                  <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider block">Current Skills ({data.skills?.length || 0})</span>
                  {(!data.skills || data.skills.length === 0) ? (
                    <p className="text-xs opacity-50 italic">No custom category-wise skills added. Falling back to the default skill catalog in the portfolio website.</p>
                  ) : (
                    <div className="border divide-y divide-dashed select-none" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                      {(data.skills || []).map((skill, idx) => (
                        <div key={idx} className="p-3.5 flex items-center justify-between gap-4 hover:bg-neutral-500/5 transition-colors">
                          {editingSkillIdx === idx ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                              <div>
                                <label className={labelClass}>Skill Name</label>
                                <input
                                  type="text"
                                  value={skill.name}
                                  onChange={(e) => {
                                    const newName = e.target.value;
                                    setData((prev) => {
                                      const skillsList = [...(prev.skills || [])];
                                      const oldName = skillsList[idx].name;
                                      const prevIcon = skillsList[idx].icon;
                                      const isAutoIcon = !prevIcon || prevIcon.startsWith('https://cdn.simpleicons.org/');

                                      const hasBuiltin = !!TECH_LOGOS[newName];
                                      const newIcon = normalizeIconUrl(isAutoIcon ? (hasBuiltin ? undefined : getAutoLogoUrl(newName)) : prevIcon);

                                      skillsList[idx] = {
                                        ...skillsList[idx],
                                        name: newName,
                                        icon: newIcon
                                      };

                                      const updatedTechLogos = { ...prev.customTechLogos };
                                      // Clean up old name in customTechLogos if it was auto-generated
                                      if (updatedTechLogos[oldName] && updatedTechLogos[oldName].startsWith('https://cdn.simpleicons.org/')) {
                                        delete updatedTechLogos[oldName];
                                      }
                                      // Add new name in customTechLogos
                                      if (newIcon) {
                                        updatedTechLogos[newName] = newIcon;
                                      }

                                      return {
                                        ...prev,
                                        skills: skillsList,
                                        customTechLogos: updatedTechLogos
                                      };
                                    });
                                  }}
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label className={labelClass}>Category</label>
                                <input
                                  type="text"
                                  value={skill.category}
                                  onChange={(e) => {
                                    setData((prev) => {
                                      const skillsList = [...(prev.skills || [])];
                                      skillsList[idx] = { ...skillsList[idx], category: e.target.value };
                                      return { ...prev, skills: skillsList };
                                    });
                                  }}
                                  className={inputClass}
                                  list="skill-categories-datalist"
                                />
                              </div>
                              <div>
                                <label className={labelClass}>Icon / Logo</label>
                                <div className="flex items-center gap-2 select-none">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, (url) => {
                                      setData((prev) => {
                                        const skillsList = [...(prev.skills || [])];
                                        skillsList[idx] = { ...skillsList[idx], icon: url };
                                        return { ...prev, skills: skillsList };
                                      });
                                    })}
                                    className="hidden"
                                    id={`edit-skill-icon-uploader-${idx}`}
                                  />
                                  <label htmlFor={`edit-skill-icon-uploader-${idx}`} className={`${buttonSquareClass} cursor-pointer w-full border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                    <Upload size={12} /> {skill.icon ? 'Change' : 'Upload'}
                                  </label>
                                  {skill.icon && normalizeIconUrl(skill.icon, isDark) ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={normalizeIconUrl(skill.icon, isDark)} alt="Icon Preview" className="w-9 h-9 object-contain border bg-neutral-800" />
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3.5 min-w-0 flex-1">
                              {skill.icon && !failedImages[skill.icon] && normalizeIconUrl(skill.icon, isDark) ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={normalizeIconUrl(skill.icon, isDark)}
                                  alt={skill.name}
                                  className="w-8 h-8 object-contain border bg-neutral-800 shrink-0"
                                  onError={() => setFailedImages(prev => ({ ...prev, [skill.icon!]: true }))}
                                />
                              ) : TECH_LOGOS[skill.name] ? (
                                <div className="w-8 h-8 border border-neutral-700 bg-neutral-800 flex items-center justify-center shrink-0">
                                  {TECH_LOGOS[skill.name](18)}
                                </div>
                              ) : (
                                <div className="w-8 h-8 border border-neutral-700 bg-neutral-800 flex items-center justify-center font-bold text-[10px] text-white/50 uppercase shrink-0">
                                  {skill.name.slice(0, 2)}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <span className="text-sm font-bold tracking-tight">{skill.name}</span>
                                <div className="flex gap-4 text-[10px] opacity-50 mt-1">
                                  <span>Category: <strong className="font-bold">{skill.category}</strong></span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center gap-2.5 shrink-0 select-none">
                            <button
                              onClick={() => setEditingSkillIdx(editingSkillIdx === idx ? null : idx)}
                              className={`w-8 h-8 border flex items-center justify-center cursor-pointer transition-colors ${editingSkillIdx === idx
                                ? 'bg-emerald-600 border-transparent text-white hover:bg-emerald-500'
                                : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5')
                                }`}
                              title={editingSkillIdx === idx ? "Done editing" : "Edit skill details"}
                            >
                              {editingSkillIdx === idx ? <Check size={12} /> : <Edit size={12} />}
                            </button>

                            {editingSkillIdx !== idx && (
                              <>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleImageUpload(e, (url) => {
                                    setData((prev) => {
                                      const skillsList = [...(prev.skills || [])];
                                      skillsList[idx] = { ...skillsList[idx], icon: url };
                                      return { ...prev, skills: skillsList };
                                    });
                                  })}
                                  className="hidden"
                                  id={`skill-icon-${idx}`}
                                />
                                <label htmlFor={`skill-icon-${idx}`} className="w-8 h-8 border border-neutral-600 flex items-center justify-center cursor-pointer transition-colors hover:bg-neutral-500/10 shrink-0" style={{ color: isDark ? '#ffffff' : '#000000' }} title="Upload/Change icon">
                                  <Upload size={12} />
                                </label>
                              </>
                            )}

                            <button
                              onClick={() => handleDeleteSkill(idx)}
                              className="w-8 h-8 border border-red-500/30 text-red-500 hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                              title="Delete skill"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Tech Logo Library ── */}
              <div className="space-y-4 pt-6 border-t border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <div>
                  <h3 className="text-sm font-bold tracking-[0.12em] uppercase opacity-60 mb-1" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                    Tech Logo Library
                  </h3>
                  <p className="text-xs opacity-40">
                    Upload custom logos for any tech name. These appear automatically in Projects &amp; Services stack pills and override the built-in SVG icons.
                  </p>
                </div>

                {/* Upload row */}
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className={labelClass}>Tech Name (must match exactly)</label>
                    <input
                      type="text"
                      value={newLogoName}
                      onChange={(e) => setNewLogoName(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Stripe, Firebase, Supabase"
                    />
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="tech-logo-uploader"
                      disabled={logoUploading || !newLogoName.trim()}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !newLogoName.trim()) return;
                        setLogoUploading(true);
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                          const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                          if (res.ok) {
                            const { url } = await res.json();
                            setData((prev) => ({
                              ...prev,
                              customTechLogos: { ...(prev.customTechLogos || {}), [newLogoName.trim()]: url },
                            }));
                            setNewLogoName('');
                            showToast(`Logo for "${newLogoName.trim()}" uploaded!`, 'success');
                          } else {
                            showToast('Upload failed.', 'error');
                          }
                        } catch {
                          showToast('Upload failed due to network error.', 'error');
                        } finally {
                          setLogoUploading(false);
                          e.target.value = '';
                        }
                      }}
                    />
                    <label
                      htmlFor="tech-logo-uploader"
                      className={`${buttonSquareClass} cursor-pointer border border-neutral-500 ${(!newLogoName.trim() || logoUploading) ? 'opacity-40 pointer-events-none' : ''}`}
                      style={{ color: isDark ? '#ffffff' : '#000000' }}
                      title={!newLogoName.trim() ? 'Enter tech name first' : 'Upload logo image'}
                    >
                      <Upload size={12} /> {logoUploading ? 'Uploading…' : 'Upload Logo'}
                    </label>
                  </div>
                </div>

                {/* Existing logos grid */}
                {Object.keys(data.customTechLogos || {}).length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    {Object.entries(data.customTechLogos || {}).map(([name, url]) => (
                      <div
                        key={name}
                        className="flex items-center gap-2 px-3 py-2 border"
                        style={{
                          borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)',
                          background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {url && normalizeIconUrl(url, isDark) ? (
                          <img src={normalizeIconUrl(url, isDark)} alt={name} className="w-6 h-6 object-contain shrink-0" />
                        ) : null}
                        <span className="text-xs font-mono opacity-80">{name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = { ...(data.customTechLogos || {}) };
                            delete updated[name];
                            updateProfileValue('customTechLogos', updated);
                          }}
                          className="opacity-40 hover:opacity-100 text-red-400 transition-opacity ml-1 leading-none"
                          title={`Remove logo for "${name}"`}
                        >
                          <Trash size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="pt-8 border-t border-dashed mt-8 flex justify-end" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'
                    }`}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                  <Save size={14} /> {saving ? 'Saving Skills...' : 'Save Skills Details'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-10 animate-fade-in max-w-4xl">
              <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                Services Offered
              </h2>

              {/* Add Service Form */}
              <div className={`${cardClass} border-2 border-dashed`}>
                <span className="text-xs font-black tracking-widest uppercase block mb-4" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  + Add New Service
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Index (e.g. 01, 02)</label>
                    <input
                      type="text"
                      placeholder="e.g. 01"
                      value={newService.index}
                      onChange={(e) => setNewService((p) => ({ ...p, index: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Service Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Development"
                      value={newService.title}
                      onChange={(e) => setNewService((p) => ({ ...p, title: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>Short Description (Visible on row hover)</label>
                    <input
                      type="text"
                      placeholder="e.g. End-to-end web applications."
                      value={newService.short}
                      onChange={(e) => setNewService((p) => ({ ...p, short: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>Detailed Body Paragraph *</label>
                    <textarea
                      rows={3}
                      placeholder="Describe what you do in detail..."
                      value={newService.body}
                      onChange={(e) => setNewService((p) => ({ ...p, body: e.target.value }))}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>Keywords / Stack Tags (Comma separated list)</label>
                    <input
                      type="text"
                      placeholder="e.g. React, Next.js, Go, PostgreSQL"
                      value={serviceKeywordsInput}
                      onChange={(e) => setServiceKeywordsInput(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={handleAddService}
                    className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'}`}
                  >
                    <Plus size={12} /> Add Service
                  </button>
                </div>
              </div>

              {/* Services List */}
              <div className="space-y-4">
                <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider block">Current Services ({data.services?.length || 0})</span>
                {(!data.services || data.services.length === 0) ? (
                  <p className="text-xs opacity-50 italic">No services custom defined. Fallback to hardcoded list is active.</p>
                ) : (
                  <div className="space-y-4">
                    {data.services.map((service, idx) => (
                      <div key={idx} className={cardClass}>
                        {editingServiceIdx === idx ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                              <label className={labelClass}>Index (e.g. 01, 02)</label>
                              <input
                                type="text"
                                value={service.index}
                                onChange={(e) => {
                                  setData((prev) => {
                                    const list = [...(prev.services || [])];
                                    list[idx].index = e.target.value;
                                    return { ...prev, services: list };
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className={labelClass}>Service Title</label>
                              <input
                                type="text"
                                value={service.title}
                                onChange={(e) => {
                                  setData((prev) => {
                                    const list = [...(prev.services || [])];
                                    list[idx].title = e.target.value;
                                    return { ...prev, services: list };
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className={labelClass}>Short Description</label>
                              <input
                                type="text"
                                value={service.short}
                                onChange={(e) => {
                                  setData((prev) => {
                                    const list = [...(prev.services || [])];
                                    list[idx].short = e.target.value;
                                    return { ...prev, services: list };
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className={labelClass}>Detailed Body Paragraph</label>
                              <textarea
                                rows={3}
                                value={service.body}
                                onChange={(e) => {
                                  setData((prev) => {
                                    const list = [...(prev.services || [])];
                                    list[idx].body = e.target.value;
                                    return { ...prev, services: list };
                                  });
                                }}
                                className={`${inputClass} resize-none`}
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className={labelClass}>Keywords / Stack Tags (Comma separated list)</label>
                              <input
                                type="text"
                                value={service.keywords.join(', ')}
                                onChange={(e) => {
                                  const arr = e.target.value.split(',').map((k) => k.trim()).filter(Boolean);
                                  setData((prev) => {
                                    const list = [...(prev.services || [])];
                                    list[idx].keywords = arr;
                                    return { ...prev, services: list };
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono opacity-50 font-bold">{service.index || String(idx + 1).padStart(2, '0')}</span>
                              <span className="text-sm font-bold truncate tracking-tight">{service.title}</span>
                            </div>
                            <p className="text-[11px] mt-1.5 opacity-60 line-clamp-1 italic">{service.short}</p>
                            <p className="text-[11px] mt-1 opacity-80 line-clamp-2">{service.body}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {service.keywords.map((kw, kwidx) => (
                                <span key={kwidx} className="text-[9px] font-mono opacity-50 px-1.5 py-0.5 border">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t select-none" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                          <button
                            onClick={() => setEditingServiceIdx(editingServiceIdx === idx ? null : idx)}
                            className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors ${editingServiceIdx === idx
                              ? 'bg-emerald-600 border-transparent text-white hover:bg-emerald-500'
                              : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5')
                              }`}
                            title={editingServiceIdx === idx ? "Done editing" : "Edit service details"}
                          >
                            {editingServiceIdx === idx ? <Check size={14} /> : <Edit size={14} />}
                          </button>

                          <button
                            onClick={() => moveService(idx, 'up')}
                            disabled={idx === 0}
                            className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-20 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'}`}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveService(idx, 'down')}
                            disabled={idx === (data.services?.length || 0) - 1}
                            className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-20 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'}`}
                          >
                            <ArrowDown size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteService(idx)}
                            className="w-9 h-9 border border-red-500/30 text-red-500 hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors"
                            title="Delete service"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="pt-8 border-t border-dashed mt-8 flex justify-end" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'}`}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                  <Save size={14} /> {saving ? 'Saving Services...' : 'Save Services'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 7: CREDENTIALS */}
          {activeTab === 'credentials' && (
            <div className="space-y-10 animate-fade-in max-w-4xl">
              <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                Credentials & Certifications
              </h2>

              {/* Add Certification Form */}
              <div className={`${cardClass} border-2 border-dashed`}>
                <span className="text-xs font-black tracking-widest uppercase block mb-4" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  + Add New Certification
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Number (e.g. 01, 02)</label>
                    <input
                      type="text"
                      placeholder="e.g. 01"
                      value={newCert.num}
                      onChange={(e) => setNewCert((p) => ({ ...p, num: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Certification Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Full Stack Engineering"
                      value={newCert.title}
                      onChange={(e) => setNewCert((p) => ({ ...p, title: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Year *</label>
                    <input
                      type="text"
                      placeholder="e.g. 2025"
                      value={newCert.year}
                      onChange={(e) => setNewCert((p) => ({ ...p, year: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Issuer *</label>
                    <input
                      type="text"
                      placeholder="e.g. IBT Learning"
                      value={newCert.issuer}
                      onChange={(e) => setNewCert((p) => ({ ...p, issuer: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>Certificate PDF / Image File Path</label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="/certificates/cert-name.pdf"
                        value={newCert.file}
                        onChange={(e) => setNewCert((p) => ({ ...p, file: e.target.value }))}
                        className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm border focus:outline-none transition-colors duration-200"
                        style={{
                          borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
                          color: isDark ? '#ffffff' : '#000000',
                        }}
                      />
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={(e) => handleImageUpload(e, (url) => setNewCert((p) => ({ ...p, file: url })))}
                        className="hidden"
                        id="new-cert-file-uploader"
                      />
                      <label htmlFor="new-cert-file-uploader" className={`${buttonSquareClass} cursor-pointer border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                        <Upload size={12} /> Upload
                      </label>
                      {newCert.file && (
                        <>
                          <a
                            href={newCert.file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${buttonSquareClass} border border-neutral-500 hover:bg-neutral-500/5`}
                            style={{ color: isDark ? '#ffffff' : '#000000' }}
                          >
                            <ExternalLink size={12} /> Preview
                          </a>
                          <button type="button" onClick={() => setNewCert((p) => ({ ...p, file: '' }))} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                            <Trash size={12} /> Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={handleAddCert}
                    className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'}`}
                  >
                    <Plus size={12} /> Add Certification
                  </button>
                </div>
              </div>

              {/* Certifications List */}
              <div className="space-y-4">
                <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider block">Current Certifications ({data.certifications?.length || 0})</span>
                {(!data.certifications || data.certifications.length === 0) ? (
                  <p className="text-xs opacity-50 italic">No certifications defined. Fallback to default website list is active.</p>
                ) : (
                  <div className="space-y-4">
                    {data.certifications.map((cert, idx) => (
                      <div key={idx} className={cardClass}>
                        {editingCertIdx === idx ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div>
                              <label className={labelClass}>Number (e.g. 01, 02)</label>
                              <input
                                type="text"
                                value={cert.num}
                                onChange={(e) => {
                                  setData((prev) => {
                                    const list = [...(prev.certifications || [])];
                                    list[idx].num = e.target.value;
                                    return { ...prev, certifications: list };
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className={labelClass}>Certification Title</label>
                              <input
                                type="text"
                                value={cert.title}
                                onChange={(e) => {
                                  setData((prev) => {
                                    const list = [...(prev.certifications || [])];
                                    list[idx].title = e.target.value;
                                    return { ...prev, certifications: list };
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div>
                              <label className={labelClass}>Year</label>
                              <input
                                type="text"
                                value={cert.year}
                                onChange={(e) => {
                                  setData((prev) => {
                                    const list = [...(prev.certifications || [])];
                                    list[idx].year = e.target.value;
                                    return { ...prev, certifications: list };
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className={labelClass}>Issuer</label>
                              <input
                                type="text"
                                value={cert.issuer}
                                onChange={(e) => {
                                  setData((prev) => {
                                    const list = [...(prev.certifications || [])];
                                    list[idx].issuer = e.target.value;
                                    return { ...prev, certifications: list };
                                  });
                                }}
                                className={inputClass}
                              />
                            </div>
                            <div className="md:col-span-3">
                              <label className={labelClass}>Certificate PDF / Image File Path</label>
                              <div className="flex gap-3">
                                <input
                                  type="text"
                                  value={cert.file}
                                  onChange={(e) => {
                                    setData((prev) => {
                                      const list = [...(prev.certifications || [])];
                                      list[idx].file = e.target.value;
                                      return { ...prev, certifications: list };
                                    });
                                  }}
                                  className="flex-1 min-w-0 bg-transparent px-4 py-3 text-sm border focus:outline-none transition-colors duration-200"
                                  style={{
                                    borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
                                    color: isDark ? '#ffffff' : '#000000',
                                  }}
                                />
                                <input
                                  type="file"
                                  accept="image/*,application/pdf"
                                  onChange={(e) => handleImageUpload(e, (url) => {
                                    setData((prev) => {
                                      const list = [...(prev.certifications || [])];
                                      list[idx].file = url;
                                      return { ...prev, certifications: list };
                                    });
                                  })}
                                  className="hidden"
                                  id={`cert-file-uploader-${idx}`}
                                />
                                <label htmlFor={`cert-file-uploader-${idx}`} className={`${buttonSquareClass} cursor-pointer border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                  <Upload size={12} /> Upload
                                </label>
                                {cert.file && (
                                  <a
                                    href={cert.file}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${buttonSquareClass} border border-neutral-500 hover:bg-neutral-500/5`}
                                    style={{ color: isDark ? '#ffffff' : '#000000' }}
                                  >
                                    <ExternalLink size={12} /> Preview
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-xs font-mono opacity-50 font-bold">{cert.num || String(idx + 1).padStart(2, '0')}</span>
                              <span className="text-sm font-bold truncate tracking-tight">{cert.title}</span>
                              <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 border opacity-50 shrink-0">{cert.year}</span>
                              {cert.file && (
                                <a
                                  href={cert.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[9px] tracking-wider uppercase font-bold px-2 py-0.5 border transition-colors inline-flex items-center gap-1 hover:bg-neutral-500/10 cursor-pointer text-indigo-500"
                                  style={{
                                    borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                  }}
                                >
                                  <ExternalLink size={10} /> Preview
                                </a>
                              )}
                            </div>
                            <p className="text-[11px] mt-1.5 opacity-60">Issuer: {cert.issuer}</p>
                            {cert.file && (
                              <p className="text-[10px] font-mono mt-1 opacity-45 truncate">File: {cert.file}</p>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t select-none" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                          <button
                            onClick={() => setEditingCertIdx(editingCertIdx === idx ? null : idx)}
                            className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors ${editingCertIdx === idx
                              ? 'bg-emerald-600 border-transparent text-white hover:bg-emerald-500'
                              : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5')
                              }`}
                            title={editingCertIdx === idx ? "Done editing" : "Edit certification details"}
                          >
                            {editingCertIdx === idx ? <Check size={14} /> : <Edit size={14} />}
                          </button>

                          <button
                            onClick={() => moveCert(idx, 'up')}
                            disabled={idx === 0}
                            className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-20 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'}`}
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => moveCert(idx, 'down')}
                            disabled={idx === (data.certifications?.length || 0) - 1}
                            className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-20 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'}`}
                          >
                            <ArrowDown size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteCert(idx)}
                            className="w-9 h-9 border border-red-500/30 text-red-500 hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors"
                            title="Delete certification"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Floating Background Words */}
              <div className={cardClass}>
                <span className="text-xs font-black tracking-widest uppercase block mb-1" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  Floating Background Words
                </span>
                <p className="text-[11px] opacity-50 mb-5">
                  These words float in the background of the Credentials section. Add keywords related to your certifications, skills or achievements.
                </p>

                {/* Current Words */}
                <div className="flex flex-wrap gap-2 mb-5 min-h-8">
                  {(data.credentialsFloatWords ?? []).map((word, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-wide px-3 py-1.5 border"
                      style={{
                        borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
                        background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                        color: isDark ? '#ffffff' : '#000000',
                      }}
                    >
                      {word}
                      <button
                        onClick={() =>
                          setData((prev) => ({
                            ...prev,
                            credentialsFloatWords: (prev.credentialsFloatWords ?? []).filter((_, i) => i !== idx),
                          }))
                        }
                        className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer leading-none"
                        title="Remove word"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {(data.credentialsFloatWords ?? []).length === 0 && (
                    <p className="text-[11px] opacity-40 italic">No words added — default set will be used.</p>
                  )}
                </div>

                {/* Add Word Input */}
                <div className="flex gap-3">
                  <input
                    id="credentials-float-word-input"
                    type="text"
                    placeholder="e.g. Accredited, 2025, Remote…"
                    className={`flex-1 min-w-0 ${inputClass}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const val = (e.target as HTMLInputElement).value.trim();
                        if (!val) return;
                        setData((prev) => ({
                          ...prev,
                          credentialsFloatWords: [...(prev.credentialsFloatWords ?? []), val],
                        }));
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const el = document.getElementById('credentials-float-word-input') as HTMLInputElement | null;
                      const val = el?.value.trim();
                      if (!val) return;
                      setData((prev) => ({
                        ...prev,
                        credentialsFloatWords: [...(prev.credentialsFloatWords ?? []), val],
                      }));
                      if (el) el.value = '';
                    }}
                    className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'}`}
                  >
                    <Plus size={12} /> Add Word
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-8 border-t border-dashed mt-8 flex justify-end" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'}`}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                  <Save size={14} /> {saving ? 'Saving Credentials...' : 'Save Credentials'}
                </button>
              </div>
            </div>
          )}


          {/* TAB 6: CONTACT */}
          {activeTab === 'contact' && (
            <div className="space-y-8 max-w-4xl animate-fade-in">
              <h2 className="text-xl font-bold tracking-tight mb-6" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                Contact & Social Integrations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => updateProfileValue('email', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    type="text"
                    value={data.location}
                    onChange={(e) => updateProfileValue('location', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Response Time</label>
                  <input
                    type="text"
                    value={data.responseTime}
                    onChange={(e) => updateProfileValue('responseTime', e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Availability Status</label>
                  <input
                    type="text"
                    value={data.availabilityStatus}
                    onChange={(e) => updateProfileValue('availabilityStatus', e.target.value)}
                    className={inputClass}
                  />
                </div>

              </div>

              {/* Dynamic Social Links CRUD Editor */}
              <div className="space-y-6 pt-6 border-t border-dashed" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <h3 className="text-lg font-bold tracking-tight" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  Social Network Profiles
                </h3>
                <p className="text-xs opacity-60">
                  Manage the social media links displayed in the website footer. You can type platform names (like GitHub, LinkedIn, X, Medium, YouTube) to fetch their logos automatically, or upload your own custom logo image.
                </p>

                {/* Add Social Form */}
                <div className={`${cardClass} border-2 border-dashed`}>
                  <span className="text-xs font-black tracking-widest uppercase block mb-4" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                    + Add New Social Profile
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Platform Name / Label *</label>
                      <input
                        type="text"
                        placeholder="e.g. GitHub, LinkedIn, Medium, YouTube"
                        value={newSocialLabel}
                        onChange={(e) => setNewSocialLabel(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Profile Link URL *</label>
                      <input
                        type="url"
                        placeholder="https://..."
                        value={newSocialHref}
                        onChange={(e) => setNewSocialHref(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Custom Logo (Optional)</label>
                      <div className="flex items-center gap-2 select-none">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, (url) => setNewSocialLogo(url))}
                          className="hidden"
                          id="new-social-logo-uploader"
                        />
                        <div className="flex flex-wrap gap-2 items-center w-full">
                          <label htmlFor="new-social-logo-uploader" className={`${buttonSquareClass} cursor-pointer border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                            <Upload size={12} /> {newSocialLogo ? 'Change' : 'Upload'}
                          </label>
                          {newSocialLogo && (
                            <button type="button" onClick={() => setNewSocialLogo('')} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                              <Trash size={12} /> Remove
                            </button>
                          )}
                        </div>
                        {newSocialLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={newSocialLogo} alt="Icon Preview" className="w-9 h-9 object-contain border bg-neutral-800" />
                        ) : (
                          newSocialLabel.trim() && (
                            <div className="w-9 h-9 border border-neutral-700 bg-neutral-800 flex items-center justify-center shrink-0" title="Auto SimpleIcon Logo">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {normalizeIconUrl(getAutoLogoUrl(newSocialLabel), isDark) ? (
                                <img
                                  src={normalizeIconUrl(getAutoLogoUrl(newSocialLabel), isDark)}
                                  alt="Auto Preview"
                                  className="w-6 h-6 object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : null}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={handleAddSocialItem}
                      className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'}`}
                    >
                      <Plus size={12} /> Add Profile
                    </button>
                  </div>
                </div>

                {/* Current Social Profiles List */}
                <div className="space-y-3">
                  <span className="text-[10px] opacity-40 font-bold uppercase tracking-wider block">Current Profiles ({activeSocialsList.length})</span>
                  {activeSocialsList.length === 0 ? (
                    <p className="text-xs opacity-50 italic">No social profiles added yet.</p>
                  ) : (
                    <div className="border divide-y divide-dashed select-none" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                      {activeSocialsList.map((item: { label: string; href: string; logo?: string }, idx: number) => {
                        let displayLogo = item.logo;
                        if (!displayLogo) {
                          if (item.label.toLowerCase() === 'github') displayLogo = '/logo/github-logo.jpg';
                          else if (item.label.toLowerCase() === 'linkedin') displayLogo = '/logo/linkedin-logo.png';
                          else if (item.label.toLowerCase() === 'x') displayLogo = '/logo/x-logo.png';
                          else if (item.label.toLowerCase() === 'instagram') displayLogo = '/logo/instagram-logo.png';
                          else if (item.label.toLowerCase() === 'leetcode') displayLogo = '/logo/leetcode-logo.png';
                          else displayLogo = normalizeIconUrl(getAutoLogoUrl(item.label), isDark);
                        } else {
                          displayLogo = normalizeIconUrl(displayLogo, isDark);
                        }
                        return (
                          <div key={idx} className="p-3.5 flex items-center justify-between gap-4 hover:bg-neutral-500/5 transition-colors">
                            {editingSocialIdx === idx ? (
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                                <div>
                                  <label className={labelClass}>Platform Name</label>
                                  <input
                                    type="text"
                                    value={item.label}
                                    onChange={(e) => {
                                      const newLabel = e.target.value;
                                      setData((prev) => {
                                        const list = [...activeSocialsList];
                                        list[idx] = { ...list[idx], label: newLabel };
                                        const updatedSocials = syncSocialsObject(list);
                                        return { ...prev, socialsList: list, socials: updatedSocials };
                                      });
                                    }}
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>Profile URL</label>
                                  <input
                                    type="url"
                                    value={item.href}
                                    onChange={(e) => {
                                      const newHref = e.target.value;
                                      setData((prev) => {
                                        const list = [...activeSocialsList];
                                        list[idx] = { ...list[idx], href: newHref };
                                        const updatedSocials = syncSocialsObject(list);
                                        return { ...prev, socialsList: list, socials: updatedSocials };
                                      });
                                    }}
                                    className={inputClass}
                                  />
                                </div>
                                <div>
                                  <label className={labelClass}>Custom Logo</label>
                                  <div className="flex items-center gap-2 select-none">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(e, (url) => {
                                        setData((prev) => {
                                          const list = [...activeSocialsList];
                                          list[idx] = { ...list[idx], logo: url };
                                          return { ...prev, socialsList: list };
                                        });
                                      })}
                                      className="hidden"
                                      id={`edit-social-logo-uploader-${idx}`}
                                    />
                                    <label htmlFor={`edit-social-logo-uploader-${idx}`} className={`${buttonSquareClass} cursor-pointer w-full border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                                      <Upload size={12} /> {item.logo ? 'Change' : 'Upload'}
                                    </label>
                                    {item.logo && (
                                      <button type="button" onClick={() => {
                                        setData((prev) => {
                                          const list = [...activeSocialsList];
                                          list[idx] = { ...list[idx], logo: '' };
                                          return { ...prev, socialsList: list };
                                        });
                                      }} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                                        <Trash size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                <div className="w-8 h-8 border border-neutral-700 bg-neutral-800 flex items-center justify-center shrink-0 rounded-lg overflow-hidden">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={displayLogo}
                                    alt={item.label}
                                    className="w-5 h-5 object-contain"
                                  />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <span className="text-sm font-bold tracking-tight block truncate">{item.label}</span>
                                  <span className="text-[10px] opacity-40 block truncate">{item.href}</span>
                                </div>
                              </div>
                            )}

                            <div className="flex items-center gap-2.5 shrink-0 select-none">
                              <button
                                onClick={() => setEditingSocialIdx(editingSocialIdx === idx ? null : idx)}
                                className={`w-8 h-8 border flex items-center justify-center cursor-pointer transition-colors ${editingSocialIdx === idx
                                  ? 'bg-emerald-600 border-transparent text-white hover:bg-emerald-500'
                                  : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5')
                                  }`}
                                title={editingSocialIdx === idx ? "Done editing" : "Edit link details"}
                              >
                                {editingSocialIdx === idx ? <Check size={12} /> : <Edit size={12} />}
                              </button>

                              {editingSocialIdx !== idx && (
                                <>
                                  <button
                                    onClick={() => moveSocialItem(idx, 'up')}
                                    disabled={idx === 0}
                                    className={`w-8 h-8 border flex items-center justify-center cursor-pointer transition-colors ${idx === 0 ? 'opacity-30 pointer-events-none' : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5')}`}
                                    title="Move up"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  <button
                                    onClick={() => moveSocialItem(idx, 'down')}
                                    disabled={idx === activeSocialsList.length - 1}
                                    className={`w-8 h-8 border flex items-center justify-center cursor-pointer transition-colors ${idx === activeSocialsList.length - 1 ? 'opacity-30 pointer-events-none' : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5')}`}
                                    title="Move down"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSocialItem(idx)}
                                    className="w-8 h-8 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                                    title="Delete social link"
                                  >
                                    <Trash size={12} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>



              {/* Section-wise Save Button */}
              <div className="pt-8 border-t border-dashed mt-8 flex justify-end" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'
                    }`}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                  <Save size={14} /> {saving ? 'Saving Contact...' : 'Save Contact Details'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="space-y-10 animate-fade-in">
              <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                Projects Catalog
              </h2>

              {/* Add Project Form */}
              <div className={`${cardClass} max-w-4xl border-2 border-dashed`}>
                <span className="text-xs font-black tracking-widest uppercase block mb-4" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  + Add New Project
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Project Unique ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. chronos"
                      value={newProject.id}
                      onChange={(e) => setNewProject((p) => ({ ...p, id: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Project Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Chronos AI"
                      value={newProject.name}
                      onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Year</label>
                    <input
                      type="text"
                      placeholder="e.g. 2026"
                      value={newProject.year}
                      onChange={(e) => setNewProject((p) => ({ ...p, year: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Category</label>
                    <input
                      type="text"
                      placeholder="e.g. B2B / Automation Hub"
                      value={newProject.category}
                      onChange={(e) => setNewProject((p) => ({ ...p, category: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Stack Tags (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="React, Next.js, Python"
                      value={projectTagsInput}
                      onChange={(e) => setProjectTagsInput(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className={labelClass}>Tagline / Description</label>
                    <input
                      type="text"
                      placeholder="Provide a detailed description of the project..."
                      value={newProject.tagline}
                      onChange={(e) => setNewProject((p) => ({ ...p, tagline: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Live Link URL</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={newProject.link}
                      onChange={(e) => setNewProject((p) => ({ ...p, link: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>GitHub Code URL</label>
                    <input
                      type="url"
                      placeholder="https://github.com..."
                      value={newProject.github}
                      onChange={(e) => setNewProject((p) => ({ ...p, github: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  {/* New Project Cover Upload */}
                  <div className="border border-dashed p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-black/1 dark:bg-white/1">
                    <div className="flex-1">
                      <label className={labelClass}>Project Cover Image</label>
                      <span className="text-[10px] opacity-60 font-mono block truncate mb-1.5">{newProject.image || 'None'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (url) => setNewProject((p) => ({ ...p, image: url })))}
                        className="hidden"
                        id="new-project-image-uploader"
                      />
                      <div className="flex flex-wrap gap-2 items-center">
                        <label htmlFor="new-project-image-uploader" className={`${buttonSquareClass} cursor-pointer border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                          <Upload size={12} /> Upload File
                        </label>
                        {newProject.image && (
                          <>
                            <a
                              href={newProject.image}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${buttonSquareClass} border border-neutral-500 hover:bg-neutral-500/5`}
                              style={{ color: isDark ? '#ffffff' : '#000000' }}
                            >
                              <ExternalLink size={12} /> Preview
                            </a>
                            <button type="button" onClick={() => setNewProject((p) => ({ ...p, image: '' }))} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                              <Trash size={12} /> Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddProject}
                  className={`${buttonSquareClass} mt-6 ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'}`}
                >
                  <Plus size={14} /> Add to List
                </button>
              </div>

              {/* Projects List */}
              <div className="space-y-4 max-w-6xl">
                {data.projects.map((project, idx) => (
                  <div key={project.id || idx} className={`${cardClass} flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between`}>

                    {/* Left side details */}
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      {project.image && (
                        <a href={project.image} target="_blank" rel="noopener noreferrer" title="View full cover image" className="cursor-zoom-in shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={project.image} alt={project.name} className="w-24 h-16 object-cover border bg-white/5 hover:opacity-90 transition-opacity" />
                        </a>
                      )}
                      {editingProjectIdx === idx ? (
                        <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                          <div>
                            <label className={labelClass}>Project Name</label>
                            <input
                              type="text"
                              value={project.name}
                              onChange={(e) => {
                                setData((prev) => {
                                  const list = [...prev.projects];
                                  list[idx].name = e.target.value;
                                  return { ...prev, projects: list };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Unique ID</label>
                            <input
                              type="text"
                              value={project.id}
                              onChange={(e) => {
                                setData((prev) => {
                                  const list = [...prev.projects];
                                  list[idx].id = e.target.value;
                                  return { ...prev, projects: list };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Year</label>
                            <input
                              type="text"
                              value={project.year}
                              onChange={(e) => {
                                setData((prev) => {
                                  const list = [...prev.projects];
                                  list[idx].year = e.target.value;
                                  return { ...prev, projects: list };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Category</label>
                            <input
                              type="text"
                              value={project.category}
                              onChange={(e) => {
                                setData((prev) => {
                                  const list = [...prev.projects];
                                  list[idx].category = e.target.value;
                                  return { ...prev, projects: list };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Live Link URL</label>
                            <input
                              type="text"
                              value={project.link || ''}
                              onChange={(e) => {
                                setData((prev) => {
                                  const list = [...prev.projects];
                                  list[idx].link = e.target.value || undefined;
                                  return { ...prev, projects: list };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>GitHub Code URL</label>
                            <input
                              type="text"
                              value={project.github || ''}
                              onChange={(e) => {
                                setData((prev) => {
                                  const list = [...prev.projects];
                                  list[idx].github = e.target.value || undefined;
                                  return { ...prev, projects: list };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass}>Stack Tags (Comma separated)</label>
                            <input
                              type="text"
                              value={project.stack.join(', ')}
                              onChange={(e) => {
                                setData((prev) => {
                                  const list = [...prev.projects];
                                  list[idx].stack = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                                  return { ...prev, projects: list };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass}>Tagline / Description</label>
                            <input
                              type="text"
                              value={project.tagline}
                              onChange={(e) => {
                                setData((prev) => {
                                  const list = [...prev.projects];
                                  list[idx].tagline = e.target.value;
                                  return { ...prev, projects: list };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-sm font-bold truncate tracking-tight">{project.name}</span>
                            <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 border opacity-50 shrink-0">
                              {project.year}
                            </span>
                            {project.link && (
                              <a
                                href={project.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] tracking-wider uppercase font-bold px-2 py-0.5 border transition-colors inline-flex items-center gap-1 hover:bg-neutral-500/10 cursor-pointer text-indigo-500"
                                style={{
                                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                }}
                              >
                                <ExternalLink size={10} /> Live Preview
                              </a>
                            )}
                            {project.github && (
                              <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] tracking-wider uppercase font-bold px-2 py-0.5 border transition-colors inline-flex items-center gap-1 hover:bg-neutral-500/10 cursor-pointer text-indigo-500"
                                style={{
                                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                                }}
                              >
                                <ExternalLink size={10} /> Code
                              </a>
                            )}
                          </div>
                          <p className="text-[11px] mt-1 truncate" style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(10, 10, 10, 0.6)' }}>{project.category} · ID: {project.id}</p>
                          <p className="text-[11px] mt-1.5 line-clamp-1 italic" style={{ color: isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(10, 10, 10, 0.75)' }}>{project.tagline}</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {project.stack.map((s, sidx) => (
                              <span key={sidx} className="text-[9px] font-mono opacity-50 px-1 py-0.5 border">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Inline edit panel & controls */}
                    <div className="flex flex-wrap items-center gap-3 shrink-0 select-none">
                      {/* Edit toggle button */}
                      <button
                        onClick={() => setEditingProjectIdx(editingProjectIdx === idx ? null : idx)}
                        className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors ${editingProjectIdx === idx
                          ? 'bg-emerald-600 border-transparent text-white hover:bg-emerald-500'
                          : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5')
                          }`}
                        title={editingProjectIdx === idx ? "Done editing" : "Edit project details"}
                      >
                        {editingProjectIdx === idx ? <Check size={14} /> : <Edit size={14} />}
                      </button>

                      {/* Move keys */}
                      <button
                        onClick={() => moveProject(idx, 'up')}
                        disabled={idx === 0}
                        className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-20 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'
                          }`}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveProject(idx, 'down')}
                        disabled={idx === data.projects.length - 1}
                        className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-20 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'
                          }`}
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Cover Uploader for existing project */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (url) => {
                          setData((prev) => {
                            const projects = [...prev.projects];
                            projects[idx].image = url;
                            return { ...prev, projects };
                          });
                        })}
                        className="hidden"
                        id={`proj-img-${idx}`}
                      />
                      <label htmlFor={`proj-img-${idx}`} className="w-9 h-9 border border-neutral-600 flex items-center justify-center cursor-pointer transition-all duration-200 text-[0.62rem] font-bold shrink-0" style={{ color: isDark ? '#ffffff' : '#000000' }} title="Replace cover image">
                        <Upload size={14} />
                      </label>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteProject(idx)}
                        className="w-9 h-9 border border-red-500/30 text-red-500 hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors"
                        title="Delete project"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section-wise Save Button */}
              <div className="pt-8 border-t border-dashed mt-8 flex justify-end" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'
                    }`}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                  <Save size={14} /> {saving ? 'Saving Projects...' : 'Save Projects Catalog'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: EDUCATION / TIMELINE */}
          {activeTab === 'education' && (
            <div className="space-y-10 animate-fade-in">
              <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                Timeline / Education Experience
              </h2>

              {/* Add item form */}
              <div className={`${cardClass} max-w-4xl border-2 border-dashed`}>
                <span className="text-xs font-black tracking-widest uppercase block mb-4" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                  + Add New Timeline Item
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className={labelClass}>Year Range *</label>
                    <input
                      type="text"
                      placeholder="e.g. 2024 – Present"
                      value={newEdItem.year}
                      onChange={(e) => setNewEdItem((p) => ({ ...p, year: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Role / Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineer Intern"
                      value={newEdItem.role}
                      onChange={(e) => setNewEdItem((p) => ({ ...p, role: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Company / Institution *</label>
                    <input
                      type="text"
                      placeholder="e.g. Google DeepMind"
                      value={newEdItem.company}
                      onChange={(e) => setNewEdItem((p) => ({ ...p, company: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Branch / Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g. Machine Learning"
                      value={newEdItem.branch}
                      onChange={(e) => setNewEdItem((p) => ({ ...p, branch: e.target.value }))}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Score / Type details</label>
                    <input
                      type="text"
                      placeholder="e.g. CGPA: 9.0/10"
                      value={newEdItem.type}
                      onChange={(e) => setNewEdItem((p) => ({ ...p, type: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  {/* Logo uploader for new item */}
                  <div className="border border-dashed p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-black/1 dark:bg-white/1">
                    <div className="flex-1">
                      <label className={labelClass}>Institutional Logo</label>
                      <span className="text-[10px] opacity-60 font-mono block truncate mb-1.5">{newEdItem.logo || 'None'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (url) => setNewEdItem((p) => ({ ...p, logo: url })))}
                        className="hidden"
                        id="new-ed-logo-uploader"
                      />
                      <div className="flex flex-wrap gap-2 items-center">
                        <label htmlFor="new-ed-logo-uploader" className={`${buttonSquareClass} cursor-pointer border border-neutral-500`} style={{ color: isDark ? '#ffffff' : '#000000' }}>
                          <Upload size={12} /> Upload File
                        </label>
                        {newEdItem.logo && (
                          <button type="button" onClick={() => setNewEdItem((p) => ({ ...p, logo: '' }))} className={`${buttonSquareClass} border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer`}>
                            <Trash size={12} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <label className={labelClass}>Bullet Points (One bullet point per line)</label>
                    <textarea
                      rows={4}
                      placeholder="Developed internal tools using Next.js&#10;Reduced latency of queries by 15%&#10;Collaborated with cross-functional teams"
                      value={edBulletsInput}
                      onChange={(e) => setEdBulletsInput(e.target.value)}
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddEdItem}
                  className={`${buttonSquareClass} mt-6 ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'}`}
                >
                  <Plus size={14} /> Add to Timeline
                </button>
              </div>

              {/* Timeline list */}
              <div className="space-y-4 max-w-6xl">
                {data.education.map((item, idx) => (
                  <div key={idx} className={`${cardClass} flex flex-col md:flex-row gap-6 items-start justify-between`}>

                    {/* Edit toggle button positioned in the top-right corner */}
                    <button
                      onClick={() => setEditingEdIdx(editingEdIdx === idx ? null : idx)}
                      className={`absolute top-6 right-6 w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors z-10 ${editingEdIdx === idx
                        ? 'bg-emerald-600 border-transparent text-white hover:bg-emerald-500'
                        : (isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5')
                        }`}
                      title={editingEdIdx === idx ? "Done editing" : "Edit timeline details"}
                    >
                      {editingEdIdx === idx ? <Check size={14} /> : <Edit size={14} />}
                    </button>

                    {/* Details column */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {item.logo && (
                        <div className="p-1 bg-[#1C1C1E] border shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.logo} alt={item.company} className="w-12 h-12 object-contain" />
                        </div>
                      )}
                      {editingEdIdx === idx ? (
                        <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full pr-12 md:pr-0">
                          <div>
                            <label className={labelClass}>Role / Title</label>
                            <input
                              type="text"
                              value={item.role}
                              onChange={(e) => {
                                setData((prev) => {
                                  const edList = [...prev.education];
                                  edList[idx].role = e.target.value;
                                  return { ...prev, education: edList };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Company / Institution</label>
                            <input
                              type="text"
                              value={item.company}
                              onChange={(e) => {
                                setData((prev) => {
                                  const edList = [...prev.education];
                                  edList[idx].company = e.target.value;
                                  return { ...prev, education: edList };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Year Range</label>
                            <input
                              type="text"
                              value={item.year}
                              onChange={(e) => {
                                setData((prev) => {
                                  const edList = [...prev.education];
                                  edList[idx].year = e.target.value;
                                  return { ...prev, education: edList };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Branch / Specialization</label>
                            <input
                              type="text"
                              value={item.branch || ''}
                              onChange={(e) => {
                                setData((prev) => {
                                  const edList = [...prev.education];
                                  edList[idx].branch = e.target.value;
                                  return { ...prev, education: edList };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div>
                            <label className={labelClass}>Score / Type details</label>
                            <input
                              type="text"
                              value={item.type || ''}
                              onChange={(e) => {
                                setData((prev) => {
                                  const edList = [...prev.education];
                                  edList[idx].type = e.target.value;
                                  return { ...prev, education: edList };
                                });
                              }}
                              className={inputClass}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className={labelClass}>Bullet Points (One bullet point per line)</label>
                            <textarea
                              rows={3}
                              value={item.bullets?.join('\n') || ''}
                              onChange={(e) => {
                                setData((prev) => {
                                  const edList = [...prev.education];
                                  edList[idx].bullets = e.target.value.split('\n').map((b) => b.trim()).filter(Boolean);
                                  return { ...prev, education: edList };
                                });
                              }}
                              className={`${inputClass} resize-none`}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="min-w-0 flex-1 pr-12 md:pr-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-bold tracking-tight">{item.role}</span>
                            <span className="text-xs font-semibold opacity-70" style={{ color: isDark ? '#ffffff' : '#000000' }}>
                              {item.company}
                            </span>
                            <span className="text-[10px] tracking-wider uppercase font-semibold px-2 py-0.5 border opacity-50 shrink-0">
                              {item.year}
                            </span>
                          </div>
                          {item.branch && (
                            <p className="text-xs font-semibold mt-1" style={{ color: isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(10, 10, 10, 0.75)' }}>
                              {item.branch}
                            </p>
                          )}
                          {item.type && (
                            <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(10, 10, 10, 0.6)' }}>
                              {item.type}
                            </p>
                          )}
                          {item.bullets && item.bullets.length > 0 && (
                            <ul className="list-disc pl-4 mt-2.5 space-y-1">
                              {item.bullets.map((b, bidx) => (
                                <li key={bidx} className="text-sm" style={{ color: isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(10, 10, 10, 0.75)' }}>
                                  {b}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-end select-none">
                      {/* Move */}
                      <button
                        onClick={() => moveEdItem(idx, 'up')}
                        disabled={idx === 0}
                        className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-20 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'
                          }`}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveEdItem(idx, 'down')}
                        disabled={idx === data.education.length - 1}
                        className={`w-9 h-9 border flex items-center justify-center cursor-pointer transition-colors disabled:opacity-20 ${isDark ? 'border-white/10 text-white hover:bg-white/5' : 'border-black/10 text-black hover:bg-black/5'
                          }`}
                      >
                        <ArrowDown size={14} />
                      </button>

                      {/* Logo uploader for existing item */}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, (url) => {
                          setData((prev) => {
                            const edList = [...prev.education];
                            edList[idx].logo = url;
                            return { ...prev, education: edList };
                          });
                        })}
                        className="hidden"
                        id={`ed-logo-${idx}`}
                      />
                      <label htmlFor={`ed-logo-${idx}`} className="w-9 h-9 border border-neutral-600 flex items-center justify-center cursor-pointer transition-all duration-200 text-[0.62rem] font-bold shrink-0" style={{ color: isDark ? '#ffffff' : '#000000' }} title="Replace institution logo">
                        <Upload size={14} />
                      </label>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteEdItem(idx)}
                        className="w-9 h-9 border border-red-500/30 text-red-500 hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors"
                        title="Delete timeline item"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Section-wise Save Button */}
              <div className="pt-8 border-t border-dashed mt-8 flex justify-end" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <button
                  onClick={handleSaveAll}
                  disabled={saving}
                  className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'bg-[#ffffff] text-[#0a0a0a]' : 'bg-[#0a0a0a] text-[#ffffff]'
                    }`}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                >
                  <Save size={14} /> {saving ? 'Saving Timeline...' : 'Save Timeline Items'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 9: MESSAGES/INQUIRIES */}
          {activeTab === 'messages' && (
            <div className="space-y-8 max-w-4xl animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                <div>
                  <h2 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Satoshi, system-ui, sans-serif' }}>
                    Contact Inquiries / Messages
                  </h2>
                  <p className="text-xs opacity-50 mt-1">
                    View and manage messages submitted by visitors through the website contact form.
                  </p>
                </div>
                <button
                  onClick={fetchMessages}
                  disabled={loadingMessages}
                  className={`cursor-pointer ${buttonSquareClass} ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-black/10 hover:bg-black/5'} border`}
                >
                  {loadingMessages ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-6 h-6 border-2 border-t-transparent animate-spin rounded-full" style={{ borderColor: isDark ? 'white' : 'black', borderTopColor: 'transparent' }} />
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60">Loading Inquiries...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                  <p className="text-sm opacity-50 italic">No inquiries found yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`relative p-5 border rounded-lg transition-all ${isDark ? 'border-white/8 bg-white/1 hover:border-white/20' : 'border-black/8 bg-black/1 hover:border-black/20'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-bold tracking-tight">{msg.name}</span>
                            <span className="text-xs font-semibold opacity-60">
                              <a href={`mailto:${msg.email}`} className="hover:underline text-indigo-500">{msg.email}</a>
                            </span>
                            <span className="text-[9px] tracking-wider uppercase font-semibold px-2 py-0.5 border opacity-50 shrink-0">
                              {new Date(msg.timestamp).toLocaleString()}
                            </span>
                          </div>
                          {msg.subject && (
                            <div className="text-xs font-bold tracking-wide uppercase opacity-75 mt-1">
                              Subject: {msg.subject}
                            </div>
                          )}
                          <div className="text-xs leading-relaxed opacity-80 whitespace-pre-wrap mt-2 p-3 rounded bg-neutral-500/5 font-sans" style={{ fontSize: '13px' }}>
                            {msg.message}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="sm:self-start w-8 h-8 border border-red-500/30 text-red-500 hover:bg-red-500/10 flex items-center justify-center cursor-pointer transition-colors rounded shrink-0"
                          title="Delete inquiry"
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
