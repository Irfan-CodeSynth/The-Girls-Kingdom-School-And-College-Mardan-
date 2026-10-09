import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  CheckCircle2,
  Lock,
  FileText,
  Download,
  AlertCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Send,
  Eye,
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';

export const TuitionPlayer = ({
  lecture,
  progress,
  isLocked,
  onVideoProgressUpdate,
  onQuizSubmit,
  onNextLecture,
  hasNextLecture,
}) => {
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'quiz'
  const [watchSeconds, setWatchSeconds] = useState(progress?.watchTimeSeconds || 0);
  const [watchPercentage, setWatchPercentage] = useState(progress?.maxWatchPercentage || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompletedVideo, setIsCompletedVideo] = useState(Boolean(progress?.videoCompleted));
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState(
    progress?.quizCompleted
      ? {
          score: progress.quizScore,
          totalMarks: progress.quizTotalMarks,
          percentage: progress.quizPercentage,
        }
      : null
  );

  const videoRef = useRef(null);
  const timerRef = useRef(null);

  // Sync state when lecture changes
  useEffect(() => {
    setWatchSeconds(progress?.watchTimeSeconds || 0);
    setWatchPercentage(progress?.maxWatchPercentage || 0);
    setIsCompletedVideo(Boolean(progress?.videoCompleted));
    setQuizResult(
      progress?.quizCompleted
        ? {
            score: progress.quizScore,
            totalMarks: progress.quizTotalMarks,
            percentage: progress.quizPercentage,
          }
        : null
    );
    setQuizAnswers({});
    setIsPlaying(false);
  }, [lecture?._id, progress]);

  // Video simulated / live playback ticker (supports embedded YT & Direct)
  useEffect(() => {
    if (isPlaying && !isCompletedVideo) {
      timerRef.current = setInterval(() => {
        setWatchSeconds((prevSec) => {
          const nextSec = prevSec + 1;
          const totalSec = lecture?.video?.durationSeconds || 600; // default 10m if 0
          const pct = Math.min(100, Math.round((nextSec / totalSec) * 100));
          setWatchPercentage(pct);

          const minRequired = lecture?.video?.minWatchPercentage || 90;
          if (pct >= minRequired && !isCompletedVideo) {
            setIsCompletedVideo(true);
            onVideoProgressUpdate?.(nextSec, pct);
          } else if (nextSec % 10 === 0) {
            onVideoProgressUpdate?.(nextSec, pct);
          }
          return nextSec;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isCompletedVideo, lecture, onVideoProgressUpdate]);

  if (isLocked) {
    return (
      <div className="bg-white rounded-2xl border border-[#EFE5E0] p-12 text-center shadow-xs">
        <div className="w-16 h-16 rounded-2xl bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-[#111827] mb-2">Lecture Locked</h3>
        <p className="text-sm text-[#6B7280] max-w-md mx-auto">
          Please complete and submit the quiz of all preceding lectures to unlock and stream this session.
        </p>
      </div>
    );
  }

  const videoId = lecture?.video?.videoId || '';
  const isYoutube =
    lecture?.video?.provider === 'youtube' ||
    videoId.includes('youtube.com') ||
    videoId.includes('youtu.be') ||
    (videoId.length === 11 && !videoId.includes('/'));

  const getYoutubeEmbed = (val) => {
    if (!val) return '';
    if (val.includes('embed/')) return val;
    if (val.includes('watch?v=')) {
      const id = val.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}?enablejsapi=1&rel=0`;
    }
    if (val.includes('youtu.be/')) {
      const id = val.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}?enablejsapi=1&rel=0`;
    }
    return `https://www.youtube.com/embed/${val}?enablejsapi=1&rel=0`;
  };

  const minWatch = lecture?.video?.minWatchPercentage || 90;

  const handleMarkWatchComplete = () => {
    setIsCompletedVideo(true);
    setWatchPercentage(100);
    const duration = lecture?.video?.durationSeconds || 600;
    setWatchSeconds(duration);
    onVideoProgressUpdate?.(duration, 100);
  };

  const handleQuizOptionSelect = (questionId, optionId) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        selectedOption: optionId,
      },
    }));
  };

  const handleTextAnswerChange = (questionId, text) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionId]: {
        questionId,
        textAnswer: text,
      },
    }));
  };

  const handleSubmitQuiz = async () => {
    const formattedAnswers = Object.values(quizAnswers);
    setSubmittingQuiz(true);
    try {
      const res = await onQuizSubmit?.(formattedAnswers);
      if (res) {
        setQuizResult({
          score: res.score,
          totalMarks: res.totalMarks,
          percentage: res.percentage,
        });
      }
    } finally {
      setSubmittingQuiz(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Video Container */}
      <div className="bg-[#111827] rounded-2xl overflow-hidden shadow-md border border-[#EFE5E0]/20 relative">
        <div className="aspect-video w-full relative bg-black flex items-center justify-center">
          {videoId ? (
            isYoutube ? (
              <iframe
                title={lecture.title}
                src={getYoutubeEmbed(videoId)}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={() => setIsPlaying(true)}
              />
            ) : (
              <video
                ref={videoRef}
                src={videoId}
                controls
                className="w-full h-full object-contain"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={handleMarkWatchComplete}
              />
            )
          ) : (
            <div className="p-8 text-center text-white/70">
              <Play className="w-12 h-12 mx-auto mb-3 opacity-40 text-amber-300" />
              <p className="font-serif text-lg font-medium text-white">Lecture Video Stream</p>
              <p className="text-xs text-white/50 mt-1">Instructor will upload session link shortly</p>
            </div>
          )}
        </div>

        {/* Watch Tracking Control Bar */}
        <div className="bg-white px-5 py-3 border-t border-[#EFE5E0] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-medium text-[#111827]">
              <Clock className="w-3.5 h-3.5 text-[#5A0D1A]" />
              <span>Watch Progress: {watchPercentage}%</span>
            </div>
            <div className="w-28 sm:w-36 h-2 bg-[#FAF8F5] border border-[#EFE5E0] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isCompletedVideo ? 'bg-emerald-600' : 'bg-[#5A0D1A]'
                }`}
                style={{ width: `${Math.min(100, watchPercentage)}%` }}
              />
            </div>
            <span className="text-[11px] text-[#6B7280]">
              (Req: {minWatch}%)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isCompletedVideo ? (
              <Badge variant="success" className="gap-1 py-1 px-2.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Lecture Video Completed
              </Badge>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-xs h-7.5 px-3 border-[#5A0D1A]/30 text-[#5A0D1A] hover:bg-[#FAF8F5]"
                >
                  {isPlaying ? 'Pause Tracker' : 'Play Tracker'}
                </Button>
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleMarkWatchComplete}
                  className="text-xs h-7.5 px-3 bg-[#5A0D1A] hover:bg-[#430913] text-white"
                >
                  Mark Full Watched
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lecture Title & Navigation bar */}
      <div className="bg-white rounded-2xl border border-[#EFE5E0] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#EFE5E0]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="default" className="bg-[#FAF8F5] text-[#5A0D1A] border border-[#5A0D1A]/20">
                Lecture {lecture.order}
              </Badge>
              {progress?.lectureFullyCompleted && (
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Fully Completed
                </Badge>
              )}
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#111827]">
              {lecture.title}
            </h2>
            {lecture.description && (
              <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">
                {lecture.description}
              </p>
            )}
          </div>

          {hasNextLecture && (
            <Button
              onClick={onNextLecture}
              disabled={!progress?.lectureFullyCompleted}
              className={`shrink-0 font-medium ${
                progress?.lectureFullyCompleted
                  ? 'bg-[#5A0D1A] hover:bg-[#430913] text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
              }`}
            >
              Next Lecture →
            </Button>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 pt-4">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'notes'
                ? 'bg-[#5A0D1A] text-white shadow-xs'
                : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF8F5]'
            }`}
          >
            <FileText className="w-4 h-4" />
            Lecture Notes & Material ({lecture.notes?.length || 0})
          </button>

          {lecture.hasQuiz && (
            <button
              onClick={() => setActiveTab('quiz')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                activeTab === 'quiz'
                  ? 'bg-[#5A0D1A] text-white shadow-xs'
                  : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#FAF8F5]'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              Lecture Quiz & Assessment
              {!isCompletedVideo && (
                <Lock className="w-3.5 h-3.5 text-amber-600 ml-1" />
              )}
              {progress?.quizCompleted && (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-1" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Notes & Resources */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl border border-[#EFE5E0] p-6 shadow-xs">
          <h3 className="font-serif text-lg font-bold text-[#111827] mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#5A0D1A]" />
            Attached Lecture Notes & Documents
          </h3>

          {lecture.notes && lecture.notes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {lecture.notes.map((note, index) => (
                <div
                  key={note._id || index}
                  className="flex items-center justify-between p-4 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5]/50 hover:bg-[#FAF8F5] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#5A0D1A]/10 text-[#5A0D1A] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#111827] truncate">
                        {note.title}
                      </p>
                      <p className="text-xs text-[#6B7280] uppercase tracking-wider">
                        {note.fileType || 'PDF'} • Resource
                      </p>
                    </div>
                  </div>
                  <a
                    href={note.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#5A0D1A] hover:underline shrink-0 ml-3 bg-white px-3 py-1.5 rounded-lg border border-[#EFE5E0] shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Open
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-dashed border-[#EFE5E0]">
              <FileText className="w-10 h-10 text-[#6B7280]/40 mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#111827]">No extra notes attached</p>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Instructor covered all syllabus materials inside the video presentation.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Lecture Quiz Assessment */}
      {activeTab === 'quiz' && lecture.hasQuiz && (
        <div className="bg-white rounded-2xl border border-[#EFE5E0] p-6 shadow-xs">
          {!isCompletedVideo ? (
            /* Restricted State */
            <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-[#EFE5E0]">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <h4 className="font-serif text-lg font-bold text-[#111827]">
                Quiz Assessment Locked
              </h4>
              <p className="text-sm text-[#6B7280] max-w-md mx-auto mt-1 leading-relaxed">
                You must complete watching at least <strong>{minWatch}%</strong> of the lecture video before attempting this quiz. Once finished, this quiz will immediately unlock.
              </p>
            </div>
          ) : (
            /* Active / Completed Quiz Form */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFE5E0]">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#111827]">
                    {lecture.quiz.title || 'Lecture Understanding Quiz'}
                  </h3>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {lecture.quiz.questions?.length || 0} Questions • Submitting will complete this lecture and unlock next module
                  </p>
                </div>

                {quizResult && (
                  <Badge variant="success" className="gap-1.5 px-3 py-1.5 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Score: {quizResult.score} / {quizResult.totalMarks} ({quizResult.percentage}%)
                  </Badge>
                )}
              </div>

              {/* Questions list */}
              <div className="space-y-5">
                {lecture.quiz.questions?.map((q, qIndex) => (
                  <div
                    key={q._id || qIndex}
                    className="p-5 rounded-xl border border-[#EFE5E0] bg-[#FAF8F5]/30 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-[#111827]">
                        <span className="text-[#5A0D1A] mr-1.5">Q{qIndex + 1}.</span>
                        {q.questionText}
                      </p>
                      <span className="text-xs font-bold text-[#6B7280] shrink-0 bg-white px-2 py-0.5 rounded border border-[#EFE5E0]">
                        {q.marks || 1} mark
                      </span>
                    </div>

                    {/* MCQ / True-False */}
                    {(q.type === 'mcq' || q.type === 'true_false') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {q.options?.map((opt, optIndex) => {
                          const isSelected =
                            quizAnswers[q._id]?.selectedOption === opt._id;
                          return (
                            <button
                              key={opt._id || optIndex}
                              type="button"
                              disabled={Boolean(quizResult)}
                              onClick={() => handleQuizOptionSelect(q._id, opt._id)}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center gap-2.5 ${
                                isSelected
                                  ? 'bg-[#5A0D1A] text-white border-[#5A0D1A]'
                                  : 'bg-white text-[#111827] border-[#EFE5E0] hover:border-[#5A0D1A]/50'
                              } ${quizResult ? 'cursor-default' : ''}`}
                            >
                              <span
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                                  isSelected
                                    ? 'border-white text-white font-bold'
                                    : 'border-[#EFE5E0] text-[#6B7280]'
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}
                              </span>
                              <span className="truncate">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Short answer */}
                    {q.type === 'short_answer' && (
                      <div className="pt-1">
                        <textarea
                          disabled={Boolean(quizResult)}
                          rows={2}
                          placeholder="Type your explanation or short answer..."
                          value={quizAnswers[q._id]?.textAnswer || ''}
                          onChange={(e) => handleTextAnswerChange(q._id, e.target.value)}
                          className="w-full text-xs p-3 rounded-xl border border-[#EFE5E0] bg-white focus:outline-none focus:ring-1 focus:ring-[#5A0D1A]"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex items-center justify-between border-t border-[#EFE5E0]">
                <p className="text-xs text-[#6B7280]">
                  {quizResult
                    ? 'Assessment submitted. Next lecture in the course is now unlocked.'
                    : 'Submitting records your answers and unlocks the upcoming lesson.'}
                </p>

                {!quizResult ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={submittingQuiz}
                    className="bg-[#5A0D1A] hover:bg-[#430913] text-white gap-2 font-medium"
                  >
                    <Send className="w-4 h-4" />
                    {submittingQuiz ? 'Submitting...' : 'Submit & Complete Lecture'}
                  </Button>
                ) : (
                  hasNextLecture && (
                    <Button
                      onClick={onNextLecture}
                      className="bg-[#5A0D1A] hover:bg-[#430913] text-white gap-1.5 font-medium"
                    >
                      Proceed to Next Lecture →
                    </Button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TuitionPlayer;
