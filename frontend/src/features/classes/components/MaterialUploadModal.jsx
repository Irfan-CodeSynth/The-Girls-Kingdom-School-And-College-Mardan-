import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Textarea, Select, Badge } from '../../../components/ui';
import { Youtube, Cloud, FileText, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

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
  const [form, setForm] = useState(defaultForm);
  const [ytPreview, setYtPreview] = useState(null);

  // Populate form in edit mode
  useEffect(() => {
    if (material) {
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
      });
      if (material.video?.provider) setProviderTab(material.video.provider);
      setTopTab(material.category === 'lecture_video' ? 'video' : 'document');
    } else {
      setForm(defaultForm);
      setTopTab('video');
      setProviderTab('youtube');
      setYtPreview(null);
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
      };
    }

    onSubmit(payload);
  };

  const isValid = form.title.trim().length > 0 && (
    (topTab === 'video' && providerTab === 'youtube' && form.videoUrl.trim()) ||
    (topTab === 'video' && providerTab !== 'youtube') ||
    (topTab === 'document' && form.docUrl.trim())
  );

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
              onClick={() => setTopTab(t.id)}
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
          placeholder="e.g. Chapter 3 — Algebra Fundamentals"
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
                          className="w-full object-cover max-h-40"
                          onError={(e) => { e.target.src = `https://img.youtube.com/vi/${ytPreview.id}/hqdefault.jpg`; }}
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                            <span className="text-white text-lg">▶</span>
                          </div>
                        </div>
                        <div className="absolute bottom-2 right-2">
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-600 text-white font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Valid URL
                          </span>
                        </div>
                      </div>
                    ) : form.videoUrl ? (
                      <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                        <AlertCircle className="w-4 h-4" />
                        Couldn't parse a YouTube video ID — check the URL.
                      </div>
                    ) : null}
                  </>
                )}

                {/* ── Cloudflare Stream (MOCKUP) ─────────────────── */}
                {providerTab === 'cloudflare' && (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/30 p-4 flex items-start gap-3">
                      <Cloud className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-primary-800 dark:text-primary-300">
                          Enterprise Cloud — Ready for Activation
                        </p>
                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">
                          Cloudflare Stream provides global edge delivery, adaptive bitrate streaming, and zero-egress bandwidth costs. Fill in your credentials below — they will be saved and activated when you upgrade to the cloud plan.
                        </p>
                      </div>
                    </div>
                    <Input
                      label="Cloudflare Stream Video UID"
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
            <Input
              label="Document URL *"
              placeholder="https://drive.google.com/... or OneDrive link"
              value={form.docUrl}
              onChange={(e) => set('docUrl', e.target.value)}
              helperText="Paste a Google Drive, OneDrive, or any direct document link."
            />
            <div className="grid grid-cols-2 gap-3">
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
