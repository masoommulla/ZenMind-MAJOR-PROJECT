import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LogOut, Calendar, User, ChevronLeft, ChevronRight, PanelLeftOpen, PanelLeftClose, Menu, X,
  Camera, MapPin, Phone, Lock, Plus, Trash2, Clock, CheckCircle,
  Shield, GraduationCap, Stethoscope, Edit3, Save
} from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { apiFetch } from '../api/client';
import logo from '../../../asset/logo.png';
import ThemeToggle from './ThemeToggle';
import VideoRoom from './VideoRoom';
import { getImgSrc } from '../utils/image';

type TabKey = 'profile' | 'schedule' | 'sessions';

export default function TherapistDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<TabKey>('profile');
  const [therapist, setTherapist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Profile state
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [sessionType, setSessionType] = useState('online');
  const [clinicImages, setClinicImages] = useState<string[]>([]);
  const [newClinicImages, setNewClinicImages] = useState<File[]>([]);
  const [deletedClinicImages, setDeletedClinicImages] = useState<string[]>([]);
  
  const [picFile, setPicFile] = useState<File | null>(null);
  const [picPreview, setPicPreview] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Schedule state
  const [sessionTime, setSessionTime] = useState('30');
  const [sessionCost, setSessionCost] = useState('500');
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newSlotHour, setNewSlotHour] = useState('09');
  const [newSlotMinute, setNewSlotMinute] = useState('00');
  const [newSlotAmPm, setNewSlotAmPm] = useState('AM');
  const [savingSchedule, setSavingSchedule] = useState(false);

  useEffect(() => {
    apiFetch<any>('/therapist/me').then(res => {
      const t = res.therapist;
      setTherapist(t);
      setPhone(t.phone || '');
      setResidentialAddress(t.residentialAddress || '');
      setClinicAddress(t.clinicAddress || '');
      setSessionType(t.sessionType || 'online');
      setClinicImages(t.clinicImages || []);
      setSessionTime(t.sessionTime?.toString() || '30');
      setSessionCost(t.sessionCost?.toString() || '500');
      setNotes(t.notes || '');
      setSlots(t.availableSlots || []);
      if (t.profilePicture) setPicPreview(getImgSrc(t.profilePicture));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const flash = (text: string, ok = true) => {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3500);
  };

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setPicFile(f); setPicPreview(URL.createObjectURL(f)); }
  };

  const handleClinicImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewClinicImages(prev => [...prev, ...files]);
    }
  };

  const removeExistingClinicImage = (img: string) => {
    setDeletedClinicImages(prev => [...prev, img]);
    setClinicImages(prev => prev.filter(i => i !== img));
  };

  const removeNewClinicImage = (index: number) => {
    setNewClinicImages(prev => prev.filter((_, i) => i !== index));
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      flash('Geolocation is not supported by your browser.', false);
      return;
    }
    flash('Fetching live location...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.display_name) {
            setClinicAddress(data.display_name);
            flash('Location successfully updated!');
          } else {
            flash('Failed to resolve address from coordinates.', false);
          }
        } catch (err) {
          flash('Failed to reverse geocode location.', false);
        }
      },
      () => {
        flash('Failed to get your location. Please allow location access.', false);
      }
    );
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      const form = new FormData();
      if (phone) form.append('phone', phone);
      if (residentialAddress) form.append('residentialAddress', residentialAddress);
      if (clinicAddress) form.append('clinicAddress', clinicAddress);
      if (sessionType) form.append('sessionType', sessionType);
      if (password) form.append('password', password);
      if (picFile) form.append('profilePicture', picFile);
      if (deletedClinicImages.length > 0) {
        form.append('deleteClinicImages', JSON.stringify(deletedClinicImages));
      }
      newClinicImages.forEach(file => {
        form.append('clinicImages', file);
      });

      const res = await apiFetch<any>('/therapist/profile', { method: 'PUT', body: form, isFormData: true });
      if (res.therapist) {
        setTherapist(res.therapist);
        setPhone(res.therapist.phone || '');
        setResidentialAddress(res.therapist.residentialAddress || '');
        setClinicAddress(res.therapist.clinicAddress || '');
        setSessionType(res.therapist.sessionType || 'online');
        setClinicImages(res.therapist.clinicImages || []);
        setNewClinicImages([]);
        setDeletedClinicImages([]);
        setPassword('');
        flash('Profile updated successfully!');
      }
    } catch (err: any) {
      flash(err.message || 'Failed to save', false);
    } finally {
      setSavingProfile(false);
    }
  };

  const saveSchedule = async () => {
    setSavingSchedule(true);
    try {
      await apiFetch('/therapist/schedule', {
        method: 'PUT',
        body: JSON.stringify({ sessionTime, sessionCost, availableSlots: slots, notes })
      });
      flash('Schedule updated!');
    } catch (e: any) { flash(e.message || 'Failed to save', false); }
    finally { setSavingSchedule(false); }
  };

  const addSlot = () => {
    if (!selectedDate) {
      flash('Please select a date.', false);
      return;
    }
    
    let hours = parseInt(newSlotHour, 10);
    const minutes = parseInt(newSlotMinute, 10);
    if (newSlotAmPm === 'PM' && hours !== 12) hours += 12;
    if (newSlotAmPm === 'AM' && hours === 12) hours = 0;

    const slotDate = new Date(selectedDate);
    slotDate.setHours(hours, minutes, 0, 0);

    if (slotDate <= new Date()) {
      flash('Cannot add a session slot in the past.', false);
      return;
    }

    const isoString = slotDate.toISOString();
    if (!slots.includes(isoString)) setSlots([...slots, isoString].sort());
    // Reset to next logical time if needed, or keep same
  };

  const removeSlot = (slotIso: string) => {
    setSlots(slots.filter(x => x !== slotIso));
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-[#0d5d3a] text-lg">Loading...</div>;

  const navItems: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: 'My Profile', icon: <User size={20} /> },
    { key: 'schedule', label: 'Schedule', icon: <Calendar size={20} /> },
    { key: 'sessions', label: 'Booked Sessions', icon: <CheckCircle size={20} /> },
  ];

  const SidebarContent = ({ mobile }: { mobile?: boolean }) => {
    const wide = mobile || !collapsed;
    return (
      <>
        <div className={`flex items-center ${wide ? 'gap-3 px-5' : 'justify-center px-0'} h-[72px] border-b border-[#0d5d3a]/10 dark:border-white/10 shrink-0`}>
          <img src={logo} alt="ZenMind" className="w-9 h-9 rounded-full object-cover shrink-0" />
          {wide && <span className="font-bold text-lg text-[#0a2617] dark:text-white whitespace-nowrap" style={{ fontFamily: 'Syne, sans-serif' }}>Therapist</span>}
        </div>
        {wide && (
          <div className="px-5 py-4 border-b border-[#0d5d3a]/5 dark:border-white/5 flex items-center gap-3 shrink-0">
            <div className="relative shrink-0">
              {picPreview
                ? <img src={picPreview} alt="P" className="w-12 h-12 rounded-full object-cover border-2 border-[#0d5d3a]/20" />
                : <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0d5d3a] to-[#1a8a5a] flex items-center justify-center text-white text-xl font-bold">{therapist?.name?.charAt(0)}</div>
              }
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[#0a2617] dark:text-white text-sm truncate">{therapist?.name}</div>
              <div className="text-xs text-[#0d5d3a] dark:text-[#10b981] font-semibold truncate">{therapist?.specialization}</div>
            </div>
          </div>
        )}
        <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
          {navItems.map(({ key, label, icon }) => (
            <button key={key} onClick={() => { setTab(key); if (mobile) setMobileOpen(false); }}
              className={`w-full flex items-center ${wide ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl font-semibold transition-all
                ${tab === key ? 'bg-[#0d5d3a] text-white shadow-md' : 'text-[#4a7c5d] dark:text-gray-400 hover:bg-[#f0fbf4] dark:hover:bg-white/5 hover:text-[#0d5d3a]'}`}
              title={!wide ? label : undefined}
            >
              {icon}{wide && <span>{label}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-[#0d5d3a]/10 dark:border-white/10 shrink-0">
          <button onClick={onLogout}
            className={`w-full flex items-center ${wide ? 'gap-3 px-4' : 'justify-center px-0'} py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium transition-colors`}
          >
            <LogOut size={20} className="shrink-0" />{wide && <span>Sign Out</span>}
          </button>
        </div>
      </>
    );
  };

  return (
    <div className="flex h-screen w-full bg-[#f7fbf8] dark:bg-[#050505] overflow-hidden text-[#0a2617] dark:text-gray-100 transition-colors duration-300">

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 h-full w-[260px] bg-white dark:bg-[#111111] border-r border-[#0d5d3a]/10 dark:border-white/10 flex flex-col z-40 md:hidden">
            <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10">
              <X size={18} className="text-gray-500" />
            </button>
            <SidebarContent mobile />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside animate={{ width: collapsed ? 72 : 260 }} transition={{ duration: 0.25 }}
        className="relative flex-shrink-0 bg-white dark:bg-[#111111] border-r border-[#0d5d3a]/10 dark:border-white/10 h-full z-20 hidden md:flex flex-col overflow-hidden">
        <button onClick={() => setCollapsed(c => !c)}
          className="absolute -right-3.5 top-6 bg-white dark:bg-[#1a1a1a] border border-[#0d5d3a]/15 dark:border-white/10 text-[#0a2617] dark:text-gray-300 p-1.5 rounded-full shadow-sm hover:bg-[#f0fbf4] dark:hover:bg-[#222] z-30">
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <header className="h-[72px] shrink-0 bg-white/80 dark:bg-[#050505]/80 backdrop-blur-md border-b border-[#0d5d3a]/10 dark:border-white/10 flex items-center justify-between px-4 sm:px-8 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10">
              <Menu size={20} />
            </button>
            <h1 className="text-lg sm:text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>
              {tab === 'profile' ? 'My Profile' : tab === 'schedule' ? 'Schedule & Availability' : 'Booked Sessions'}
            </h1>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto">
          {/* Toast */}
          <AnimatePresence>
            {msg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className={`mx-4 sm:mx-8 mt-4 p-3 rounded-xl font-semibold flex items-center gap-2 text-sm ${msg.ok ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/20'}`}>
                <CheckCircle size={16} />{msg.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* PROFILE TAB */}
          {tab === 'profile' && (
            <div className="p-4 sm:p-8">
              <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Top Banner */}
                <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm overflow-hidden relative">
                  <div className="h-32 bg-gradient-to-r from-[#0d5d3a] to-[#1a8a5a] w-full"></div>
                  <div className="px-6 sm:px-10 pb-6 relative flex flex-col sm:flex-row items-center sm:items-end sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-12 sm:-mt-16">
                      <div className="relative group">
                        {picPreview
                          ? <img src={picPreview} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-[#111111] shadow-xl bg-white" />
                          : <div className="w-32 h-32 rounded-full bg-white dark:bg-[#222] border-4 border-white dark:border-[#111111] shadow-xl flex items-center justify-center text-[#0d5d3a] text-5xl font-black">{therapist?.name?.charAt(0)}</div>
                        }
                        <label className="absolute bottom-1 right-1 w-10 h-10 bg-white dark:bg-[#222] rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-gray-50 border border-gray-100 dark:border-white/10 transition z-10">
                          <Camera size={18} className="text-[#0d5d3a] dark:text-[#10b981]" />
                          <input type="file" accept="image/*" onChange={handlePicChange} className="hidden" />
                        </label>
                      </div>
                      <div className="text-center sm:text-left mb-2">
                        <h2 className="text-2xl font-black text-[#0a2617] dark:text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{therapist?.name}</h2>
                        <p className="text-[#0d5d3a] dark:text-[#10b981] font-semibold">{therapist?.specialization}</p>
                      </div>
                    </div>
                    <div className="mb-2 w-full sm:w-auto">
                      <button onClick={saveProfile} disabled={savingProfile}
                        className="w-full sm:w-auto flex justify-center items-center gap-2 px-8 py-3 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-xl font-bold shadow-lg shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] transition disabled:opacity-60">
                        <Save size={18} />{savingProfile ? 'Saving...' : 'Save Profile Changes'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column (Static Info) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm p-6 sm:p-8">
                      <h3 className="text-sm font-black text-[#0a2617] dark:text-white mb-6 uppercase tracking-wide border-b border-gray-100 dark:border-white/5 pb-3">
                        Professional Details
                      </h3>
                      <div className="space-y-4">
                        <Row icon={<GraduationCap size={16} />} label="Education" value={therapist?.education} />
                        <Row icon={<Stethoscope size={16} />} label="Experience" value={`${therapist?.experience} Years`} />
                        <Row icon={<Clock size={16} />} label="Session Info" value={`₹${therapist?.sessionCost} / ${therapist?.sessionTime} min`} />
                      </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-5 flex items-start gap-3">
                      <Shield className="text-amber-500 mt-0.5 shrink-0" size={18} />
                      <p className="text-xs text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                        Professional details (specialization, experience, education) are verified by ZenMind administrators and cannot be self-edited. Contact support for updates.
                      </p>
                    </div>
                  </div>

                  {/* Right Column (Editable Fields) */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm p-6 sm:p-8">
                      <h3 className="text-sm font-black text-[#0a2617] dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wide border-b border-gray-100 dark:border-white/5 pb-3">
                        <Phone size={16} className="text-[#0d5d3a] dark:text-[#10b981]" /> Contact & Address
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Phone Number" value={phone} onChange={setPhone} placeholder="+91 ..." />
                        <div>
                          <label className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1.5 block">Session Type</label>
                          <select value={sessionType} onChange={e => setSessionType(e.target.value)}
                            className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0d5d3a] focus:ring-2 focus:ring-[#0d5d3a]/15 dark:text-white transition cursor-pointer">
                            <option value="online">Online (Video/Chat)</option>
                            <option value="offline">In-Person (Clinic)</option>
                            <option value="both">Both Online & In-Person</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1.5 block">Residential Address</label>
                          <textarea value={residentialAddress} onChange={e => setResidentialAddress(e.target.value)}
                            placeholder="Your home / residential address..."
                            className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0d5d3a] focus:ring-2 focus:ring-[#0d5d3a]/15 dark:text-white min-h-[70px] resize-none" />
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-bold text-[#0a2617] dark:text-gray-300">Clinic Address</label>
                            <button onClick={getLiveLocation} type="button"
                              className="text-xs flex items-center gap-1 bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] px-2.5 py-1 rounded font-bold hover:bg-[#cce8d5] transition">
                              <MapPin size={12} /> Use Live Location
                            </button>
                          </div>
                          <textarea value={clinicAddress} onChange={e => setClinicAddress(e.target.value)}
                            placeholder="Manually fill location or use live location..."
                            className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0d5d3a] focus:ring-2 focus:ring-[#0d5d3a]/15 dark:text-white min-h-[70px] resize-none mb-3" />
                          
                          {/* Map Preview */}
                          {clinicAddress && (
                            <div className="w-full h-40 sm:h-48 rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 relative">
                              <iframe 
                                width="100%" 
                                height="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight={0} 
                                marginWidth={0} 
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(clinicAddress)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                              ></iframe>
                              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] font-bold rounded">Map Preview</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Clinic Gallery */}
                    <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm p-6 sm:p-8">
                      <h3 className="text-sm font-black text-[#0a2617] dark:text-white mb-6 flex items-center justify-between uppercase tracking-wide border-b border-gray-100 dark:border-white/5 pb-3">
                        <span className="flex items-center gap-2"><MapPin size={16} className="text-[#0d5d3a] dark:text-[#10b981]" /> Clinic Gallery</span>
                        <label className="flex items-center gap-2 px-3 py-1.5 bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 text-[#0d5d3a] dark:text-[#10b981] rounded-lg text-xs font-bold cursor-pointer hover:bg-[#cce8d5] dark:hover:bg-[#0d5d3a]/40 transition">
                          <Plus size={14} /> Add Images
                          <input type="file" multiple accept="image/*" onChange={handleClinicImagesChange} className="hidden" />
                        </label>
                      </h3>
                      
                      {(clinicImages.length > 0 || newClinicImages.length > 0) ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {clinicImages.map(img => (
                            <div key={img} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 aspect-video">
                              <img src={getImgSrc(img)} className="w-full h-full object-cover" alt="Clinic" />
                              <button onClick={() => removeExistingClinicImage(img)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                          {newClinicImages.map((f, i) => (
                            <div key={i} className="relative group rounded-xl overflow-hidden border border-[#0d5d3a] dark:border-[#10b981] aspect-video">
                              <img src={URL.createObjectURL(f)} className="w-full h-full object-cover opacity-80" alt="New Clinic" />
                              <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/60 text-white text-[10px] rounded font-bold">New</span>
                              <button onClick={() => removeNewClinicImage(i)} className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition hover:bg-red-500">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm font-medium">
                          No clinic images uploaded.
                        </div>
                      )}
                    </div>

                    {/* Security */}
                    <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm p-6 sm:p-8">
                      <h3 className="text-sm font-black text-[#0a2617] dark:text-white mb-6 flex items-center gap-2 uppercase tracking-wide border-b border-gray-100 dark:border-white/5 pb-3">
                        <Lock size={16} className="text-[#0d5d3a] dark:text-[#10b981]" /> Security settings
                      </h3>
                      <Field label="New Password (leave blank to keep current)" type="password"
                        value={password} onChange={setPassword} placeholder="Min. 6 characters" />
                    </div>

                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULE TAB */}
          {tab === 'schedule' && (
            <div className="p-4 sm:p-8">
              <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Column */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Session Config */}
                  <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm p-6 sm:p-8">
                    <h3 className="font-black text-[#0a2617] dark:text-white text-sm uppercase tracking-wide mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
                      <Clock size={16} className="text-[#0d5d3a] dark:text-[#10b981]" /> Session Configuration
                    </h3>
                    <div className="space-y-5">
                      <Field label="Session Duration (minutes)" type="number" value={sessionTime} onChange={setSessionTime} placeholder="e.g. 50" />
                      <Field label="Cost per Session (₹)" type="number" value={sessionCost} onChange={setSessionCost} placeholder="e.g. 1200" />
                    </div>
                  </div>

                  {/* Daily Notes */}
                  <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm p-6 sm:p-8">
                    <h3 className="font-black text-[#0a2617] dark:text-white text-sm uppercase tracking-wide mb-5 flex items-center gap-2 border-b border-gray-100 dark:border-white/5 pb-3">
                      <Edit3 size={16} className="text-[#0d5d3a] dark:text-[#10b981]" /> Daily Notice for Patients
                    </h3>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="Leave a note for patients viewing your profile today..."
                      className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0d5d3a] focus:ring-2 focus:ring-[#0d5d3a]/15 dark:text-white min-h-[140px] resize-none" />
                  </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-7">
                  {/* Availability Calendar */}
                  <div className="bg-white dark:bg-[#111111] rounded-3xl border border-[#0d5d3a]/10 dark:border-white/10 shadow-sm p-6 flex flex-col min-h-[500px]">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-white/5 pb-3">
                      <h3 className="font-black text-[#0a2617] dark:text-white text-sm uppercase tracking-wide flex items-center gap-2">
                        <Calendar size={16} className="text-[#0d5d3a] dark:text-[#10b981]" /> Availability Calendar
                      </h3>
                      <button onClick={saveSchedule} disabled={savingSchedule}
                        className="flex justify-center items-center gap-2 px-6 py-2.5 bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white rounded-xl font-bold shadow-md shadow-[#0d5d3a]/20 hover:bg-[#0a4a2e] transition disabled:opacity-60 text-sm">
                        <Save size={16} />{savingSchedule ? 'Saving...' : 'Save Schedule'}
                      </button>
                    </div>
                    <div className="flex flex-col xl:flex-row gap-8">
                      {/* Calendar Picker */}
                      <div className="flex-shrink-0 mx-auto xl:mx-0">
                        <style>{`
                          .rdp { --rdp-accent-color: #0d5d3a; --rdp-background-color: #e6f4ea; margin: 0; }
                          .dark .rdp { --rdp-accent-color: #10b981; --rdp-background-color: #0d5d3a; color: white; }
                          .rdp-day_selected { font-weight: bold; }
                          .has-slot { font-weight: 900; text-decoration: underline; text-decoration-color: #10b981; text-decoration-thickness: 3px; text-underline-offset: 4px; }
                        `}</style>
                        <DayPicker
                          mode="single"
                          selected={selectedDate}
                          onSelect={(d) => d && setSelectedDate(d)}
                          modifiers={{ hasSlot: slots.map(s => new Date(s)) }}
                          modifiersClassNames={{ hasSlot: 'has-slot' }}
                        />
                      </div>

                      {/* Slots for Selected Date */}
                      <div className="flex-1 flex flex-col border-t xl:border-t-0 xl:border-l border-gray-100 dark:border-white/5 pt-6 xl:pt-0 xl:pl-6">
                        <h4 className="font-bold text-[#0a2617] dark:text-white mb-4">
                          Slots for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h4>
                        
                        <div className="flex flex-col gap-4 mb-6">
                          <div className="flex gap-2 w-full">
                            <select value={newSlotHour} onChange={e => setNewSlotHour(e.target.value)}
                              className="flex-1 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-2 py-2 text-sm outline-none focus:border-[#0d5d3a] focus:ring-2 focus:ring-[#0d5d3a]/15 dark:text-white cursor-pointer">
                              {Array.from({ length: 12 }).map((_, i) => {
                                const val = (i + 1).toString().padStart(2, '0');
                                return <option key={val} value={val}>{val}</option>;
                              })}
                            </select>
                            <span className="self-center font-bold text-[#0a2617] dark:text-gray-300">:</span>
                            <select value={newSlotMinute} onChange={e => setNewSlotMinute(e.target.value)}
                              className="flex-1 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-2 py-2 text-sm outline-none focus:border-[#0d5d3a] focus:ring-2 focus:ring-[#0d5d3a]/15 dark:text-white cursor-pointer">
                              {['00', '15', '30', '45'].map(val => (
                                <option key={val} value={val}>{val}</option>
                              ))}
                            </select>
                            <select value={newSlotAmPm} onChange={e => setNewSlotAmPm(e.target.value)}
                              className="flex-1 bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-2 py-2 text-sm outline-none focus:border-[#0d5d3a] focus:ring-2 focus:ring-[#0d5d3a]/15 dark:text-white font-bold cursor-pointer">
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                          <button onClick={addSlot}
                            className="bg-[#0d5d3a]/10 dark:bg-[#1a8a5a]/20 text-[#0d5d3a] dark:text-[#10b981] w-full py-2.5 rounded-xl font-bold flex justify-center items-center gap-1 hover:bg-[#0d5d3a]/20 transition">
                            <Plus size={16} /> Add Time
                          </button>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-2">
                          {slots.filter(s => new Date(s).toDateString() === selectedDate.toDateString()).length === 0 ? (
                            <div className="text-sm text-gray-500 italic py-4">No slots scheduled on this date.</div>
                          ) : (
                            slots
                              .filter(s => new Date(s).toDateString() === selectedDate.toDateString())
                              .map(s => {
                                const d = new Date(s);
                                const isPast = d < new Date();
                                return (
                                  <div key={s} className={`flex justify-between items-center px-4 py-3 border rounded-xl ${isPast ? 'bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-white/5 opacity-60' : 'bg-[#fbfdfb] dark:bg-[#1a1a1a] border-[#0d5d3a]/20 dark:border-white/10'}`}>
                                    <span className="text-sm font-bold text-[#0a2617] dark:text-white">
                                      {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <button onClick={() => removeSlot(s)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded transition">
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SESSIONS TAB */}
          {tab === 'sessions' && (
            <div className="p-4 sm:p-8">
              <TherapistSessionsPanel />
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <span className="text-[#0d5d3a] dark:text-[#10b981] mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold text-[#4a7c5d] dark:text-gray-500 uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold text-[#0a2617] dark:text-gray-200 break-words leading-snug">{value}</div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-[#0a2617] dark:text-gray-300 mb-1.5 block">{label}</span>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-[#fbfdfb] dark:bg-[#1a1a1a] border border-[#0d5d3a]/20 dark:border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#0d5d3a] focus:ring-2 focus:ring-[#0d5d3a]/15 dark:text-white transition" />
    </label>
  );
}

function TherapistSessionsPanel() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [activeVideoSession, setActiveVideoSession] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    apiFetch<any>('/sessions/therapist')
      .then(res => { if (alive && res.ok) setSessions(res.sessions || []); })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => { alive = false; clearInterval(interval); };
  }, []);

  const todayStr = now.toDateString();
  const upcoming = sessions.filter(s => new Date(s.date) > now && new Date(s.date).toDateString() !== todayStr && s.status !== 'completed' && s.status !== 'cancelled');
  const today = sessions.filter(s => new Date(s.date).toDateString() === todayStr && s.status !== 'completed' && s.status !== 'cancelled');

  const formatCountdown = (date: Date) => {
    const diff = date.getTime() - now.getTime();
    if (diff <= 0) return 'Starting now';
    if (diff <= 24 * 60 * 60 * 1000) {
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      return `Starts in ${h}h ${m}m ${s}s`;
    }
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''} left`;
  };

  const isJoinable = (date: Date) => {
    const diff = date.getTime() - now.getTime();
    return diff <= 2 * 60 * 1000 && diff >= -60 * 60 * 1000;
  };

  if (loading) return <div className="text-center font-bold text-[#0d5d3a]">Loading sessions...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      {activeVideoSession && <VideoRoom roomId={activeVideoSession} onLeave={async () => {
        try {
          await apiFetch(`/sessions/${activeVideoSession}/complete`, { method: 'POST' });
        } catch(e) {}
        setActiveVideoSession(null);
        window.location.reload();
      }} />}
      
      {today.length > 0 && (
        <div className="mb-10">
          <h3 className="font-bold text-[#0a2617] dark:text-white mb-4 flex items-center gap-2 text-lg">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Today's Sessions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {today.map(s => (
              <SessionCard key={s._id} s={s} formatCountdown={formatCountdown} isJoinable={isJoinable} onJoin={() => setActiveVideoSession(s._id)} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-bold text-[#0a2617] dark:text-white mb-4 text-lg">Future Sessions</h3>
        {upcoming.length === 0 ? (
          <div className="bg-white dark:bg-[#111111] border border-[#0d5d3a]/10 dark:border-white/5 rounded-3xl p-8 text-center text-[#4a7c5d] dark:text-gray-400 font-semibold">No future sessions booked.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {upcoming.map(s => (
              <SessionCard key={s._id} s={s} formatCountdown={formatCountdown} isJoinable={isJoinable} onJoin={() => setActiveVideoSession(s._id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCard({ s, formatCountdown, isJoinable, onJoin }: any) {
  return (
    <div className="bg-white dark:bg-[#111111] border border-[#0d5d3a]/20 dark:border-white/10 rounded-3xl p-6 shadow-sm">
      <div className="mb-4 text-xs font-bold text-[#0d5d3a] dark:text-[#10b981] bg-[#e6f4ea] dark:bg-[#0d5d3a]/20 px-3 py-1 rounded-full inline-block">
        {formatCountdown(new Date(s.date))}
      </div>
      <h4 className="font-bold text-[#0a2617] dark:text-white text-lg mb-2">{s.user?.name || 'Unknown Patient'}</h4>
      <div className="space-y-1 text-sm font-medium text-[#4a7c5d] dark:text-gray-400">
        <div className="flex items-center gap-2"><Calendar size={14} className="text-[#0d5d3a] dark:text-[#10b981]" /> {new Date(s.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
        <div className="flex items-center gap-2"><Clock size={14} className="text-[#0d5d3a] dark:text-[#10b981]" /> {new Date(s.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
        <div className="flex items-center gap-2"><Phone size={14} className="text-[#0d5d3a] dark:text-[#10b981]" /> {s.user?.phone || 'N/A'}</div>
        <div className="flex items-center gap-2 truncate text-xs">@ {s.user?.email || 'N/A'}</div>
      </div>
      <button 
        disabled={!isJoinable(new Date(s.date))}
        onClick={onJoin}
        className="w-full mt-4 py-2.5 rounded-xl font-bold bg-[#0d5d3a] dark:bg-[#1a8a5a] text-white shadow-md hover:bg-[#0a4a2e] disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isJoinable(new Date(s.date)) ? 'Join Call' : 'Join Call (opens 2 mins before)'}
      </button>
    </div>
  );
}
