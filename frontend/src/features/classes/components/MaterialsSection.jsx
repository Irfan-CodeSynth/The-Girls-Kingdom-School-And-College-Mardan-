import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { materialApi } from '../api/materialApi';
import { Button, Badge, EmptyState, Skeleton, ConfirmDialog } from '../../../components/ui';
import { MaterialUploadModal } from './MaterialUploadModal';
import { VideoPlayerModal } from './VideoPlayerModal';
import {
  Plus, PlayCircle, FileText, Trash2, Pencil, Eye, EyeOff,
  Youtube, Cloud, BookOpen
} from 'lucide-react';
import { toast } from 'sonner';

const CATEGORY_LABELS = {
  lecture_video: { label: 'Video', color: 'primary', icon: <PlayCircle className="w-4 h-4" /> },
  lecture_notes: { label: 'Notes', color: 'secondary', icon: <FileText className="w-4 h-4" /> },
  syllabus: { label: 'Syllabus', color: 'info', icon: <BookOpen className="w-4 h-4" /> },
  assignment: { label: 'Assignment', color: 'warning', icon: <FileText className="w-4 h-4" /> },
  past_paper: { label: 'Past Paper', color: 'danger', icon: <FileText className="w-4 h-4" /> },
  other: { label: 'Other', color: 'default', icon: <FileText className="w-4 h-4" /> },
};

const PROVIDER_ICONS = {
  youtube: <Youtube className="w-4 h-4 text-red-500" />,
  cloudflare: <Cloud className="w-4 h-4 text-orange-500" />,
  vimeo: <span className="w-4 h-4 rounded bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">V</span>,
};

/**
 * MaterialsSection
 * Props:
 *   classId, userRole ('admin' | 'teacher' | 'student'), canManage (bool)
 */
export const MaterialsSection = ({ classId, userRole, canManage = false }) => {
  const queryClient = useQueryClient();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState(null);
  const [playerMaterial, setPlayerMaterial] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const { data, isPending } = useQuery({
    queryKey: ['materials', classId],
    queryFn: () => materialApi.getMaterials(classId),
    enabled: Boolean(classId),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => materialApi.createMaterial(classId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', classId] });
      setUploadModalOpen(false);
      toast.success('Material added successfully!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add material.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ materialId, payload }) => materialApi.updateMaterial(classId, materialId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', classId] });
      setEditMaterial(null);
      toast.success('Material updated!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update material.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (materialId) => materialApi.deleteMaterial(classId, materialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', classId] });
      setToDelete(null);
      toast.success('Material removed.');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete material.'),
  });

  const materials = data?.materials || [];

  const handleMaterialClick = (mat) => {
    if (mat.category === 'lecture_video' && mat.video) {
      setPlayerMaterial(mat);
    } else if (mat.document?.fileUrl) {
      window.open(mat.document.fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isPending) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-surface-900 dark:text-white">
          Course Materials
          {materials.length > 0 && (
            <span className="ml-2 text-xs text-surface-500 font-normal">({materials.length})</span>
          )}
        </h3>
        {canManage && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setUploadModalOpen(true)}
          >
            Add Material
          </Button>
        )}
      </div>

      {/* List */}
      {materials.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No Materials Yet"
          message={
            canManage
              ? 'Click "Add Material" to upload lecture videos, notes, or documents.'
              : 'No course materials have been published yet.'
          }
        />
      ) : (
        <div className="space-y-2">
          {materials.map((mat) => {
            const catMeta = CATEGORY_LABELS[mat.category] || CATEGORY_LABELS.other;
            const isVideo = mat.category === 'lecture_video';
            const provider = mat.video?.provider;

            return (
              <div
                key={mat._id}
                className="flex items-center gap-3 p-3 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-all group"
              >
                {/* Icon */}
                <button
                  type="button"
                  onClick={() => handleMaterialClick(mat)}
                  className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-700 flex items-center justify-center shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition"
                >
                  {isVideo && provider ? PROVIDER_ICONS[provider] : catMeta.icon}
                </button>

                {/* Info */}
                <button
                  type="button"
                  onClick={() => handleMaterialClick(mat)}
                  className="flex-1 text-left min-w-0"
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                      {mat.title}
                    </p>
                    <Badge variant={catMeta.color} size="sm">{catMeta.label}</Badge>
                    {!mat.isPublished && canManage && (
                      <Badge variant="secondary" size="sm">Draft</Badge>
                    )}
                    {provider === 'cloudflare' && (
                      <Badge variant="warning" size="sm">Enterprise</Badge>
                    )}
                    {provider === 'vimeo' && (
                      <Badge variant="info" size="sm">Vimeo Pro</Badge>
                    )}
                  </div>
                  {mat.description && (
                    <p className="text-xs text-surface-500 mt-0.5 truncate">{mat.description}</p>
                  )}
                  {isVideo && mat.video?.durationMinutes && (
                    <p className="text-xs text-surface-400 mt-0.5">{mat.video.durationMinutes} min</p>
                  )}
                </button>

                {/* Teacher: By */}
                {mat.teacher?.fullName && userRole === 'admin' && (
                  <span className="hidden sm:block text-xs text-surface-400 shrink-0">
                    {mat.teacher.fullName}
                  </span>
                )}

                {/* Actions (manage) */}
                {canManage && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => updateMutation.mutate({ materialId: mat._id, payload: { isPublished: !mat.isPublished } })}
                      title={mat.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {mat.isPublished
                        ? <EyeOff className="w-3.5 h-3.5 text-surface-500" />
                        : <Eye className="w-3.5 h-3.5 text-emerald-500" />
                      }
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setEditMaterial(mat)}
                      title="Edit"
                    >
                      <Pencil className="w-3.5 h-3.5 text-surface-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => setToDelete(mat)}
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-danger-500" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload / Edit Modal */}
      <MaterialUploadModal
        isOpen={uploadModalOpen || Boolean(editMaterial)}
        onClose={() => { setUploadModalOpen(false); setEditMaterial(null); }}
        material={editMaterial}
        loading={createMutation.isPending || updateMutation.isPending}
        onSubmit={(payload) => {
          if (editMaterial) {
            updateMutation.mutate({ materialId: editMaterial._id, payload });
          } else {
            createMutation.mutate(payload);
          }
        }}
      />

      {/* Video Player */}
      <VideoPlayerModal
        isOpen={Boolean(playerMaterial)}
        onClose={() => setPlayerMaterial(null)}
        material={playerMaterial}
      />

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Remove Material?"
        message={`Are you sure you want to delete "${toDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(toDelete._id)}
      />
    </div>
  );
};

export default MaterialsSection;
