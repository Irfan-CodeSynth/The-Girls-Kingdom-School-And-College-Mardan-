import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Input, Textarea, Select, Badge } from '../../../components/ui';
import {
  Youtube,
  Cloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  UploadCloud,
  Upload,
  Link2,
  Trash2,
  Paperclip,
  File,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_OPTIONS = [
  { value: 'lecture_video', label: '🎬 Lecture Video' },
  { value: 'lecture_notes', label: '📄 Lecture Notes' },
  { value: 'syllabus', label: '📋 Syllabus' },
  { value: 'assignment', label: '📝 Assignment' },
  { value: 'past_paper', label: '📚 Past Paper' },
  { value: 'other', label: '📦 Other' },
];

const PROVIDER_TABS = [
  { id: 'youtube', label: 'YouTube', icon: <Youtube className="w-4 h-4" />, live: true },
  { id: 'cloudflare', label: 'Cloudflare Stream', icon: <Cloud className="w-4 h-4" />, live: false },
  { id: 'vimeo', label: 'Vimeo Pro', icon: <span className="font-bold text-xs">V</span>, live: false },
];

function formatBytes(bytes, decimals = 1) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function getFileTypeMeta(typeOrExt = '') {
  const ext = (typeOrExt || '').toLowerCase().replace('.', '');
  if (['pdf'].includes(ext)) {
    return { label: 'PDF', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50' };
  }
  if (['doc', 'docx'].includes(ext)) {
    return { label: 'WORD', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50' };
  }
  if (['ppt', 'pptx'].includes(ext)) {
    return { label: 'PPT', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50' };
  }
  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return { label: 'SHEET', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50' };
  }
  if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(ext)) {
    return { label: 'IMAGE', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/50' };
  }
  return { label: ext.toUpperCase() || 'DOC', bg: 'bg-surface-500/10 text-surface-600 dark:text-surface-400 border-surface-200 dark:border-surface-700' };
}

// Derive thumbnail from a YouTube URL or ID
function getYouTubeThumbnail(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return { id: m[1], thumb: `https://img.youtube.com/vi/${m[1]}/maxresdefault.jpg` };
  }
  return null;
}

const defaultForm = {
  title: '',
  description: '',
  category: 'lecture_video',
  isPublished: false,
  // video
  videoUrl: '',
  durationMinutes: '',
  // cloudflare mock
  cfUid: '',
  cfSubdomain: '',
  // vimeo mock
  vimeoId: '',
  vimeoHash: '',
  // document
  docUrl: '',
  docName: '',
  docType: '',
  docSize: null,
  docSizeFormatted: '',
};

/**
 * MaterialUploadModal
 * Props:
 *   isOpen, onClose, onSubmit(payload), loading, material (for edit mode)
 */
export const MaterialUploadModal = ({ isOpen, onClose, onSubmit, loading = false, material = null }) => {
  const isEdit = Boolean(material);

  // Top-level tab: video | document
  const [topTab, setTopTab] = useState('video');
  // Video provider sub-tab
  const [providerTab, setProviderTab] = useState('youtube');
  // Document mode sub-tab: 'upload' (direct file) | 'link' (url)
  const [docMode, setDocMode] = useState('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(defaultForm);
  const [ytPreview, setYtPreview] = useState(null);

  // Populate form in edit mode
  useEffect(() => {
    if (material) {
      const isDocument = material.category !== 'lecture_video';
      const isDataUri = material.document?.fileUrl?.startsWith('data:');
      setForm({
        title: material.title || '',
        description: material.description || '',
        category: material.category || 'lecture_video',
        isPublished: material.isPublished ?? false,
        videoUrl: material.video?.videoUrl || '',
        durationMinutes: material.video?.durationMinutes || '',
        cfUid: material.video?.cloudflare?.uid || '',
        cfSubdomain: material.video?.cloudflare?.customerSubdomain || '',
        vimeoId: material.video?.vimeo?.vimeoId || '',
        vimeoHash: material.video?.vimeo?.privacyHash || '',
        docUrl: material.document?.fileUrl || '',
        docName: material.document?.fileName || '',
        docType: material.document?.fileType || '',
        docSize: material.document?.fileSize || null,
        docSizeFormatted: material.document?.fileSizeFormatted || '',
      });
      if (material.video?.provider) setProviderTab(material.video.provider);
      setTopTab(isDocument ? 'document' : 'video');
      setDocMode(isDataUri || (!material.document?.fileUrl?.startsWith('http') && material.document?.fileName) ? 'upload' : 'link');
    } else {
      setForm(defaultForm);
      setTopTab('video');
      setProviderTab('youtube');
      setDocMode('upload');
      setYtPreview(null);
      setIsDragging(false);
      setIsReadingFile(false);
    }
  }, [material, isOpen]);

  // Live YouTube thumbnail preview
  useEffect(() => {
    if (topTab === 'video' && providerTab === 'youtube') {
      const parsed = getYouTubeThumbnail(form.videoUrl);
      setYtPreview(parsed);
    }
  }, [form.videoUrl, topTab, providerTab]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleFileSelect = (file) => {
    if (!file) return;
    const maxBytes = 20 * 1024 * 1024; // 20MB limit
    if (file.size > maxBytes) {
      toast.error('File exceeds 20MB limit. For larger documents, please use the "Document Link" option.');
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    const formattedSize = formatBytes(file.size);

    setIsReadingFile(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setForm((f) => ({
        ...f,
        docUrl: dataUrl,
        docName: file.name,
        docType: ext,
        docSize: file.size,
        docSizeFormatted: formattedSize,
        // Auto-suggest title if user hasn't typed one yet
        title: f.title.trim() ? f.title : file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
      }));
      setIsReadingFile(false);
      toast.success(`Attached "${file.name}" (${formattedSize})`);
    };
    reader.onerror = () => {
      toast.error('Failed to read file. Please try again or provide an external link.');
      setIsReadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setForm((f) => ({
      ...f,
      docUrl: '',
      docName: '',
      docType: '',
      docSize: null,
      docSizeFormatted: '',
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    const payload = {
      title: form.title,
      description: form.description || undefined,
      category: topTab === 'document' ? (form.category === 'lecture_video' ? 'lecture_notes' : form.category) : form.category,
      isPublished: form.isPublished,
    };

    if (topTab === 'video') {
      payload.video = { provider: providerTab };
      if (providerTab === 'youtube') {
        payload.video.videoUrl = form.videoUrl;
        if (form.durationMinutes) payload.video.durationMinutes = Number(form.durationMinutes);
      } else if (providerTab === 'cloudflare') {
        payload.video.cloudflare = { uid: form.cfUid, customerSubdomain: form.cfSubdomain };
      } else if (providerTab === 'vimeo') {
        payload.video.vimeo = { vimeoId: form.vimeoId, privacyHash: form.vimeoHash };
      }
    } else {
      payload.document = {
        fileUrl: form.docUrl,
        fileName: form.docName || undefined,
        fileType: form.docType || undefined,
        fileSize: form.docSize || undefined,
        fileSizeFormatted: form.docSizeFormatted || undefined,
        isExternal: docMode === 'link',
      };
    }

    onSubmit(payload);
  };

  const isValid = form.title.trim().length > 0 && !isReadingFile && (
    (topTab === 'video' && providerTab === 'youtube' && form.videoUrl.trim()) ||
    (topTab === 'video' && providerTab !== 'youtube') ||
    (topTab === 'document' && form.docUrl.trim().length > 0)
  );

  const fileTypeMeta = getFileTypeMeta(form.docType);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Course Material' : 'Add Course Material'}
      size="lg"
    >
      <div className="space-y-5">

        {/* ── Top-level Tabs: Video / Document ────────────────── */}
        <div className="flex gap-2 p-1 bg-surface-100 dark:bg-surface-800 rounded-xl">
          {[
            { id: 'video', label: 'Video Lecture', icon: <Youtube className="w-4 h-4" /> },
            { id: 'document', label: 'Lecture Notes / Docs', icon: <FileText className="w-4 h-4" /> },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setTopTab(t.id);
                if (t.id === 'document' && form.category === 'lecture_video') {
                  set('category', 'lecture_notes');
                }
              }}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                topTab === t.id
                  ? 'bg-white dark:bg-surface-700 text-primary-700 dark:text-primary-400 shadow-sm'
                  : 'text-surface-500 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ── Common Fields ────────────────────────────────────── */}
        <Input
          label="Title *"
          placeholder="e.g. Computer Science Notes — Chapter 1"
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
        />
        <Textarea
          label="Description (optional)"
          placeholder="Brief description of this material..."
          rows={2}
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
        <Select
          label="Category"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          options={CATEGORY_OPTIONS}
        />

        {/* ── VIDEO TAB ─────────────────────────────────────────── */}
        {topTab === 'video' && (
          <div className="space-y-4">
            {/* Provider sub-tabs */}
            <div className="border border-surface-200 dark:border-surface-700 rounded-xl overflow-hidden">
              <div className="flex border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                {PROVIDER_TABS.map((pt) => (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => setProviderTab(pt.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all border-b-2 ${
                      providerTab === pt.id
                        ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-surface-700'
                        : 'border-transparent text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
                    }`}
                  >
                    {pt.icon}
                    {pt.label}
                    {pt.live ? (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold">
                        LIVE
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold">
                        SOON
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-4 space-y-4">
                {/* ── YouTube (LIVE) ─────────────────────────────── */}
                {providerTab === 'youtube' && (
                  <>
                    <Input
                      label="YouTube URL *"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={form.videoUrl}
                      onChange={(e) => set('videoUrl', e.target.value)}
                      helperText="Paste any YouTube link — full URL, short URL (youtu.be), embed or Shorts link."
                    />
                    <Input
                      label="Duration (minutes)"
                      type="number"
                      placeholder="e.g. 45"
                      min={0}
                      value={form.durationMinutes}
                      onChange={(e) => set('durationMinutes', e.target.value)}
                    />

                    {/* Live thumbnail preview */}
                    {ytPreview ? (
                      <div className="rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 relative group">
                        <img
                          src={ytPreview.thumb}
                          alt="YouTube thumbnail"
                          className="w-full h-44 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = `https://img.youtube.com/vi/${ytPreview.id}/hqdefault.jpg`;
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <span className="px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5">
                            <Youtube className="w-3.5 h-3.5" /> Video Preview Available
                          </span>
                        </div>
                        <div className="p-3 bg-surface-900 text-white flex items-center justify-between">
                          <span className="text-xs text-surface-300 font-mono">ID: {ytPreview.id}</span>
                          <span className="text-xs text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Valid YouTube Link
                          </span>
                        </div>
                      </div>
                    ) : form.videoUrl.trim() ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Could not extract YouTube video ID from URL.
                      </p>
                    ) : null}
                  </>
                )}

                {/* ── Cloudflare Stream (MOCKUP) ─────────────────── */}
                {providerTab === 'cloudflare' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4 flex items-start gap-3">
                      <Cloud className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                          Cloudflare Stream — Edge Global Video — Ready for Activation
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                          Cloudflare Stream provides ad-free, high-performance adaptive bitrate streaming. Save your credentials now; they will become active once your Cloudflare API key is configured.
                        </p>
                      </div>
                    </div>
                    <Input
                      label="Video UID"
                      placeholder="e.g. abc123def456..."
                      value={form.cfUid}
                      onChange={(e) => set('cfUid', e.target.value)}
                      helperText="Found in your Cloudflare Stream dashboard after uploading a video."
                    />
                    <Input
                      label="Customer Subdomain"
                      placeholder="e.g. customer-abc123.cloudflarestream.com"
                      value={form.cfSubdomain}
                      onChange={(e) => set('cfSubdomain', e.target.value)}
                    />
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        🔒 Activation Pending — Credentials Saved for Future Use
                      </span>
                    </div>
                  </div>
                )}

                {/* ── Vimeo Pro (MOCKUP) ─────────────────────────── */}
                {providerTab === 'vimeo' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/30 p-4 flex items-start gap-3">
                      <span className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">V</span>
                      <div>
                        <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
                          Vimeo Pro — Enterprise Cloud — Ready for Activation
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
                          Vimeo Pro offers ad-free hosting, password protection, and custom privacy settings ideal for academic content. Save your credentials now to activate later.
                        </p>
                      </div>
                    </div>
                    <Input
                      label="Vimeo Video ID"
                      placeholder="e.g. 123456789"
                      value={form.vimeoId}
                      onChange={(e) => set('vimeoId', e.target.value)}
                      helperText="The numeric ID from your Vimeo video URL."
                    />
                    <Input
                      label="Privacy Hash (for private videos)"
                      placeholder="e.g. abc123def456"
                      value={form.vimeoHash}
                      onChange={(e) => set('vimeoHash', e.target.value)}
                      helperText="Only required if the video has privacy settings enabled."
                    />
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        🔒 Activation Pending — Credentials Saved for Future Use
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── DOCUMENT TAB ─────────────────────────────────────── */}
        {topTab === 'document' && (
          <div className="space-y-4">
            {/* Sub-mode selector: Upload File vs Document Link */}
            <div className="flex rounded-xl bg-surface-100 dark:bg-surface-800 p-1 gap-1">
              <button
                type="button"
                onClick={() => setDocMode('upload')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  docMode === 'upload'
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-primary-500" />
                Upload Document File
              </button>
              <button
                type="button"
                onClick={() => setDocMode('link')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  docMode === 'link'
                    ? 'bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm'
                    : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                }`}
              >
                <Link2 className="w-3.5 h-3.5 text-primary-500" />
                Paste Document Link
              </button>
            </div>

            {/* ── Mode 1: DIRECT FILE UPLOAD ──────────────────── */}
            {docMode === 'upload' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                  }}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp"
                />

                {isReadingFile ? (
                  <div className="border border-surface-200 dark:border-surface-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-surface-50 dark:bg-surface-800/40">
                    <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-2" />
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">Processing Document...</p>
                    <p className="text-xs text-surface-500 mt-1">Preparing file for secure portal storage</p>
                  </div>
                ) : form.docUrl && form.docName ? (
                  <div className="p-4 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-xs border shrink-0 ${fileTypeMeta.bg}`}>
                        {fileTypeMeta.label}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                          {form.docName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {form.docSizeFormatted && (
                            <span className="text-xs text-surface-500">{form.docSizeFormatted}</span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for upload
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        type="button"
                        variant="secondary"
                        size="xs"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change File
                      </Button>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                      isDragging
                        ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/30 ring-2 ring-primary-500/20'
                        : 'border-surface-300 dark:border-surface-700 hover:border-primary-500 hover:bg-surface-50 dark:hover:bg-surface-800/40'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-primary-100 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">
                      Click to upload document or drag and drop
                    </p>
                    <p className="text-xs text-surface-500 mt-1 max-w-sm">
                      PDF, Word (DOCX/DOC), PowerPoint (PPTX/PPT), Excel, or TXT up to 20MB
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-surface-200/70 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                      <Paperclip className="w-3 h-3" /> Select file from computer
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ── Mode 2: EXTERNAL LINK ───────────────────────── */}
            {docMode === 'link' && (
              <div className="space-y-4">
                <Input
                  label="Document URL *"
                  placeholder="https://drive.google.com/... or OneDrive link"
                  value={form.docUrl}
                  onChange={(e) => set('docUrl', e.target.value)}
                  helperText="Paste a Google Drive, OneDrive, or any direct document link."
                />
              </div>
            )}

            {/* Optional file metadata fields */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Input
                label="File Name (optional)"
                placeholder="e.g. Chapter3_Notes.pdf"
                value={form.docName}
                onChange={(e) => set('docName', e.target.value)}
              />
              <Input
                label="File Type (optional)"
                placeholder="pdf / docx / pptx"
                value={form.docType}
                onChange={(e) => set('docType', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── Publish toggle ───────────────────────────────────── */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/40">
          <div className="flex items-center gap-2">
            {form.isPublished ? (
              <Eye className="w-4 h-4 text-emerald-500" />
            ) : (
              <EyeOff className="w-4 h-4 text-surface-400" />
            )}
            <div>
              <p className="text-sm font-medium text-surface-900 dark:text-white">
                {form.isPublished ? 'Published — visible to students' : 'Draft — only visible to you'}
              </p>
              <p className="text-xs text-surface-500">Students will be notified when published.</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.isPublished}
            onClick={() => set('isPublished', !form.isPublished)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.isPublished ? 'bg-emerald-500' : 'bg-surface-300 dark:bg-surface-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                form.isPublished ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* ── Actions ─────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-2 border-t border-surface-200 dark:border-surface-700">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={loading}
            disabled={!isValid || loading}
          >
            {isEdit ? 'Save Changes' : form.isPublished ? 'Publish Material' : 'Save as Draft'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default MaterialUploadModal;
