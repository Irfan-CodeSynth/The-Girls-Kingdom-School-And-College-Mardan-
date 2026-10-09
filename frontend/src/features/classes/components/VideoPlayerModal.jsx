import React from 'react';
import { Modal } from '../../../components/ui';
import { ExternalLink, Youtube } from 'lucide-react';

/**
 * VideoPlayerModal — Embeds a YouTube video in a responsive distraction-free iframe.
 * For Cloudflare/Vimeo (mock) materials it shows a placeholder.
 */
export const VideoPlayerModal = ({ isOpen, onClose, material }) => {
  if (!material) return null;

  const { video, title } = material;
  const isYoutube = video?.provider === 'youtube' && video?.videoId;
  const isMock = video?.provider === 'cloudflare' || video?.provider === 'vimeo';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="xl">
      <div className="space-y-4">
        {isYoutube ? (
          <div className="relative w-full rounded-2xl overflow-hidden bg-black shadow-md" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1&fs=1`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : isMock ? (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-[#EFE5E0] bg-[#FAF8F5] py-16">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#EFE5E0] flex items-center justify-center shadow-xs">
              <span className="text-2xl">☁️</span>
            </div>
            <div className="text-center">
              <p className="text-base font-serif font-bold text-[#111827] capitalize">
                {video?.provider} Stream
              </p>
              <p className="text-sm text-[#6B7280] mt-1">
                Enterprise Cloud — Ready for Activation
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                🔒 Activation Pending
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-12 text-[#6B7280]">
            <Youtube className="w-10 h-10 opacity-30 text-[#5A0D1A]" />
            <p className="text-sm">No video available for this material.</p>
          </div>
        )}

        {/* Footer meta */}
        <div className="flex items-center justify-between text-xs text-[#6B7280] pt-2 border-t border-[#EFE5E0]">
          <span className="font-medium">
            {video?.durationMinutes ? `Duration: ${video.durationMinutes} min` : ''}
          </span>
          {isYoutube && (
            <a
              href={`https://www.youtube.com/watch?v=${video.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-bold text-[#5A0D1A] hover:underline"
            >
              Watch on YouTube <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default VideoPlayerModal;
