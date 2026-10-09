import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Upload,
  Trash2,
  Edit3,
  Check,
  X,
  Volume2,
  Image as ImageIcon,
} from 'lucide-react';
import { GameSyncProvider, useGameSync } from '../context/GameSyncContext';
import { OwnerAuthGate } from '../components/OwnerAuthGate';
import { CONTENT_CATEGORIES, ContentCategory, ContentItem } from '../types/game';
import { CategoryBadgeArtwork } from '../components/BroadcastArtwork';
import {
  removeContentItemFromFirestore,
  syncContentItemToFirestore,
} from '../firebase';

const ContentManagerBody: React.FC = () => {
  const { contentItems, ownerAuth, logoutOwner, refreshContentItems } = useGameSync();

  const [activeTab, setActiveTab] = useState<ContentCategory>('jersey');

  // Create Form State
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit Item State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPrompt, setEditPrompt] = useState('');
  const [editAnswer, setEditAnswer] = useState('');
  const [editMediaUrl, setEditMediaUrl] = useState('');

  // Delete Confirmation State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const currentTabConfig =
    CONTENT_CATEGORIES.find((c) => c.id === activeTab) || CONTENT_CATEGORIES[0];
  const filteredItems = contentItems.filter((item) => item.category === activeTab);

  // Upload media file with real-time progress bar
  const handleFileUpload = (file: File, isEdit = false) => {
    if (!ownerAuth.token) return;
    setUploadError(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/content/upload');
    xhr.setRequestHeader('Authorization', `Bearer ${ownerAuth.token}`);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        setUploadProgress(pct);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const resp = JSON.parse(xhr.responseText);
          if (resp.mediaUrl) {
            if (isEdit) {
              setEditMediaUrl(resp.mediaUrl);
            } else {
              setMediaUrl(resp.mediaUrl);
            }
          }
          setUploadProgress(100);
          setTimeout(() => setUploadProgress(null), 900);
        } catch {
          setUploadError('Invalid server response');
          setUploadProgress(null);
        }
      } else {
        setUploadError('Upload failed');
        setUploadProgress(null);
      }
    };

    xhr.onerror = () => {
      setUploadError('Network error during file upload');
      setUploadProgress(null);
    };

    xhr.send(formData);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerAuth.token || !answer.trim()) return;
    setSaving(true);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ownerAuth.token}`,
        },
        body: JSON.stringify({
          category: activeTab,
          title: title.trim() || prompt.trim() || `${currentTabConfig.label} Item`,
          prompt: prompt.trim() || title.trim() || `Identify this ${currentTabConfig.label} clue!`,
          answer: answer.trim(),
          mediaUrl: mediaUrl.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.item) {
          syncContentItemToFirestore(data.item).catch(() => {});
        }
        setTitle('');
        setPrompt('');
        setAnswer('');
        setMediaUrl('');
        await refreshContentItems();
      }
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (item: ContentItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditPrompt(item.prompt);
    setEditAnswer(item.answer);
    setEditMediaUrl(item.mediaUrl || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!ownerAuth.token) return;
    const res = await fetch(`/api/content/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ownerAuth.token}`,
      },
      body: JSON.stringify({
        title: editTitle.trim(),
        prompt: editPrompt.trim(),
        answer: editAnswer.trim(),
        mediaUrl: editMediaUrl.trim() || undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.item) {
        syncContentItemToFirestore(data.item).catch(() => {});
      }
      setEditingId(null);
      await refreshContentItems();
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!ownerAuth.token) return;
    const res = await fetch(`/api/content/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${ownerAuth.token}`,
      },
    });
    if (res.ok) {
      removeContentItemFromFirestore(id).catch(() => {});
      setConfirmDeleteId(null);
      await refreshContentItems();
    }
  };

  return (
    <div className="min-h-screen bg-[#030914] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      {/* Top Bar Contract: 3 Zones Separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-3 bg-[#081326] border-b border-slate-800">
        <Link
          to="/content"
          className="text-lg font-extrabold font-['Outfit'] tracking-tight text-white whitespace-nowrap shrink-0"
        >
          FanZone Content Manager
        </Link>

        <nav className="flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link
            to="/host"
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Host Console
          </Link>
          <Link
            to="/content"
            className="text-amber-400 hover:text-amber-300 transition-colors whitespace-nowrap shrink-0"
          >
            Content Manager
          </Link>
          <Link
            to="/studio"
            target="_blank"
            rel="noreferrer"
            className="hover:text-sky-400 transition-colors whitespace-nowrap shrink-0"
          >
            Studio Display
          </Link>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={logoutOwner}
            className="min-h-[44px] px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full mx-auto p-6 space-y-6">
        {/* 7 Content Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-[#081326] border border-slate-800 rounded-2xl">
          {CONTENT_CATEGORIES.map((cat) => {
            const count = contentItems.filter((i) => i.category === cat.id).length;
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveTab(cat.id);
                  setEditingId(null);
                  setConfirmDeleteId(null);
                  setUploadError(null);
                }}
                className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-[#F59E0B] text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`font-['JetBrains_Mono'] tabular-nums text-[11px] ${
                    isActive ? 'text-slate-900' : 'text-slate-500'
                  }`}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT: Add New Content Item Form */}
          <section className="lg:col-span-5 bg-[#081326] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CategoryBadgeArtwork category={activeTab} className="w-12 h-12 shrink-0" />
              <div>
                <h2 className="text-lg font-bold font-['Outfit'] text-white">
                  Add New {currentTabConfig.label} Item
                </h2>
                <p className="text-xs text-slate-400">{currentTabConfig.description}</p>
              </div>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              {currentTabConfig.mediaType !== 'none' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {currentTabConfig.mediaType === 'image'
                      ? 'Upload Image File (PNG/JPG/WEBP)'
                      : 'Upload Audio Clip (MP3/WAV/OGG/M4A)'}
                  </label>

                  <label className="min-h-[48px] px-4 py-3 rounded-xl bg-[#030914] border border-dashed border-slate-700 hover:border-amber-400 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>
                      Choose {currentTabConfig.mediaType === 'image' ? 'Image' : 'Audio'} File to
                      Upload
                    </span>
                    <input
                      type="file"
                      accept={
                        currentTabConfig.mediaType === 'image'
                          ? 'image/*'
                          : 'audio/*,.mp3,.wav,.ogg,.m4a'
                      }
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, false);
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* Upload Progress Bar */}
                  {uploadProgress !== null && (
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-[11px] font-['JetBrains_Mono'] text-amber-400">
                        <span>Uploading Media...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className="h-full bg-[#F59E0B] transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <p className="mt-1.5 text-xs text-red-400">{uploadError}</p>
                  )}

                  <div className="mt-2">
                    <input
                      type="text"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      placeholder={
                        currentTabConfig.mediaType === 'image'
                          ? 'Or paste /samples/... image path'
                          : 'Or paste /samples/... audio path'
                      }
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl bg-[#030914] border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Instant Preview */}
                  {mediaUrl && currentTabConfig.mediaType === 'image' && (
                    <div className="mt-2 p-2 rounded-xl bg-[#030914] border border-slate-800 flex items-center justify-center h-36">
                      <img
                        src={mediaUrl}
                        alt="Upload preview"
                        referrerPolicy="no-referrer"
                        className="max-h-full max-w-full object-contain rounded-lg"
                      />
                    </div>
                  )}

                  {mediaUrl && currentTabConfig.mediaType === 'audio' && (
                    <div className="mt-2 p-2 rounded-xl bg-[#030914] border border-slate-800">
                      <audio controls src={mediaUrl} className="w-full h-10" />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Item Title / Short Label
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., 2011/12 Championship Home Kit"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#030914] border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {activeTab === 'quiz' || activeTab === 'number'
                    ? 'Question Text (Displayed on Studio Screen)'
                    : 'Clue / Question Prompt'}
                </label>
                <textarea
                  rows={2}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter the question or clue shown to contestants..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#030914] border border-slate-700 text-sm text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-400 mb-1">
                  Official Answer (Private to Host until Revealed) *
                </label>
                <input
                  type="text"
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder={
                    activeTab === 'number' ? 'e.g., 91 Goals' : 'Enter the official answer...'
                  }
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#030914] border border-emerald-500/50 text-sm text-emerald-300 font-semibold focus:outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#F59E0B] hover:bg-amber-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>{saving ? 'Saving Item...' : `Save to ${currentTabConfig.label}`}</span>
              </button>
            </form>
          </section>

          {/* RIGHT: Saved Category Items List with Edit, Delete & Preview */}
          <section className="lg:col-span-7 bg-[#081326] border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold font-['Outfit'] text-white">
                  Saved {currentTabConfig.label} Bank ({filteredItems.length})
                </h2>
                <p className="text-xs text-slate-400">
                  Snapshot Isolation Active: Editing or deleting items here never breaks an active
                  live round
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {filteredItems.map((item) => {
                const isEditing = editingId === item.id;
                const isConfirmingDelete = confirmDeleteId === item.id;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-[#030914] border border-slate-800 flex flex-col gap-3"
                  >
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Title</label>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#081326] border border-slate-700 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-emerald-400 mb-1">
                              Official Answer
                            </label>
                            <input
                              type="text"
                              value={editAnswer}
                              onChange={(e) => setEditAnswer(e.target.value)}
                              className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#081326] border border-emerald-500/50 text-xs text-emerald-300 font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            Prompt / Question Text
                          </label>
                          <input
                            type="text"
                            value={editPrompt}
                            onChange={(e) => setEditPrompt(e.target.value)}
                            className="w-full min-h-[44px] px-3 py-2 rounded-lg bg-[#081326] border border-slate-700 text-xs text-white"
                          />
                        </div>

                        {currentTabConfig.mediaType !== 'none' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editMediaUrl}
                              onChange={(e) => setEditMediaUrl(e.target.value)}
                              placeholder="Media URL"
                              className="flex-1 min-h-[44px] px-3 py-2 rounded-lg bg-[#081326] border border-slate-700 text-xs text-slate-300"
                            />
                            <label className="min-h-[44px] px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Replace File</span>
                              <input
                                type="file"
                                accept={
                                  currentTabConfig.mediaType === 'image'
                                    ? 'image/*'
                                    : 'audio/*,.mp3,.wav,.ogg,.m4a'
                                }
                                onChange={(e) => {
                                  const f = e.target.files?.[0];
                                  if (f) handleFileUpload(f, true);
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        )}

                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(item.id)}
                            className="min-h-[44px] px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Check className="w-4 h-4" />
                            Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="min-h-[44px] px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <X className="w-4 h-4" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Instant Thumbnail or Audio Icon */}
                          {currentTabConfig.mediaType === 'image' && (
                            <div className="w-20 h-20 rounded-xl bg-[#081326] border border-slate-800 overflow-hidden flex items-center justify-center shrink-0">
                              {item.mediaUrl ? (
                                <img
                                  src={item.mediaUrl}
                                  alt={item.title}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <ImageIcon className="w-6 h-6 text-slate-600" />
                              )}
                            </div>
                          )}

                          {currentTabConfig.mediaType === 'audio' && (
                            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                              <Volume2 className="w-6 h-6" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold font-['Outfit'] text-white">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-300 mt-0.5">{item.prompt}</p>
                            <p className="text-xs font-bold text-emerald-400 mt-1">
                              Answer: {item.answer}
                            </p>

                            {currentTabConfig.mediaType === 'audio' && item.mediaUrl && (
                              <audio
                                controls
                                src={item.mediaUrl}
                                className="w-full max-w-md h-9 mt-2"
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(item.id)}
                            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-500/30 text-xs font-semibold text-red-300 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Inline Confirmation Step Before Deletion */}
                    {isConfirmingDelete && (
                      <div className="p-3 rounded-lg bg-red-950/80 border border-red-500/50 flex items-center justify-between gap-3">
                        <span className="text-xs text-red-200 font-medium">
                          Delete “{item.title}” from the content bank?
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="min-h-[44px] px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-400 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="min-h-[44px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer whitespace-nowrap"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export const ContentPage: React.FC = () => {
  return (
    <GameSyncProvider role="host">
      <OwnerAuthGate
        title="FanZone Content Manager"
        subtitle="Persistent Broadcast Media & Trivia Bank"
      >
        <ContentManagerBody />
      </OwnerAuthGate>
    </GameSyncProvider>
  );
};
