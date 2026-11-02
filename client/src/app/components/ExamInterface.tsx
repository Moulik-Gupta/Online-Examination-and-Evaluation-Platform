import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import {
  Clock,
  Video,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Flag,
  Shield,
  Maximize,
} from 'lucide-react';
import { toast } from 'sonner';
import PreExamCheck from './PreExamCheck';
import { api, ApiError } from '../api';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

const VIOLATION_LIMIT = 5;
// Ignore violations for a moment after the exam starts, while fullscreen settles.
const START_GRACE_MS = 2000;

type ExamInfo = { id: number; title: string; duration_min: number };
type ExamQuestion = { id: number; text: string; options: string[] };

// The server stores start times as a number or a UTC date string. Handle both.
const parseStart = (value: number | string) => {
  if (typeof value === 'number') return value;
  const iso = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : value.replace(' ', 'T') + 'Z';
  return new Date(iso).getTime();
};

type Phase = 'check' | 'exam' | 'submitted';

// More types (no_face, multiple_faces, blocked_input) are added in the next steps.
type ViolationType ='tab_switch'| 'window_blur'| 'fullscreen_exit' | 'camera_lost'  | 'no_face'| 'multiple_faces';

type Violation = {
  id: number;
  type: ViolationType;
  detail: string;
  at: number; // timestamp in ms
};

const violationLabels: Record<ViolationType, string> = {
  tab_switch: 'Switched tab',
  window_blur: 'Left the exam window',
  fullscreen_exit: 'Left fullscreen',
  camera_lost: 'Camera stopped',
  no_face: 'Face not visible',
  multiple_faces: 'More than one face',
};

export function ExamInterface() {
  const navigate = useNavigate();
  const { examId } = useParams();

  const [exam, setExam] = useState<ExamInfo | null>(null);
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>('check');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isProctoringActive, setIsProctoringActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const [violations, setViolations] = useState<Violation[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const deadlineRef = useRef(0);
  const graceUntilRef = useRef(0);
  const submittedRef = useRef(false);
  const attemptIdRef = useRef<number | null>(null);
  const pendingRef = useRef<Promise<unknown>[]>([]);
  const violationsRef = useRef<Violation[]>([]);
  const navTimeoutRef = useRef<number | undefined>(undefined);
  // These always point at the latest functions, so timers and listeners never go stale.
  const submitRef = useRef<() => void>(() => {});
  const addViolationRef = useRef<(type: ViolationType, detail: string) => void>(() => {});

  // Load the exam and its questions from the server.
  useEffect(() => {
    let cancelled = false;
    api<{ exam: ExamInfo; questions: ExamQuestion[] }>(`/exams/${examId}`)
      .then((data) => {
        if (cancelled) return;
        setExam(data.exam);
        setQuestions(data.questions);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err instanceof ApiError ? err.message : 'Could not load the exam.');
      });
    return () => {
      cancelled = true;
    };
  }, [examId]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setIsProctoringActive(false);
  };

  // Records a violation. When the limit is reached, the exam is submitted.
  const addViolation = (type: ViolationType, detail: string) => {
    if (submittedRef.current) return;
    if (Date.now() < graceUntilRef.current) return;

    const violation: Violation = {
      id: violationsRef.current.length + 1,
      type,
      detail,
      at: Date.now(),
    };
    violationsRef.current = [...violationsRef.current, violation];
    if (attemptIdRef.current) {
      const post = api(`/attempts/${attemptIdRef.current}/violations`, {
        method: 'POST',
        body: { type, detail },
      }).catch(() => {});
      pendingRef.current.push(post);
    }
    setViolations(violationsRef.current);

    const count = violationsRef.current.length;
    if (count >= VIOLATION_LIMIT) {
      toast.error('Violation limit reached', {
        description: 'Your exam is being submitted.',
      });
      submitRef.current();
    } else {
      toast.warning(`Warning ${count} of ${VIOLATION_LIMIT}: ${violationLabels[type]}`, {
        description: 'This has been recorded.',
      });
    }
  };
  addViolationRef.current = addViolation;

  // Called by the pre-exam check once the camera works and fullscreen has started.
  const handleStartExam = async (mediaStream: MediaStream) => {
    if (!exam) return;
    let attempt: { attemptId: number; startedAt: number | string };
    try {
      attempt = await api<{ attemptId: number; startedAt: number | string }>('/attempts', {
        method: 'POST',
        body: { examId: exam.id },
      });
    } catch (err) {
      mediaStream.getTracks().forEach((track) => track.stop());
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      toast.error('Could not start the exam', {
        description: err instanceof ApiError ? err.message : 'Check your connection and try again.',
      });
      return;
    }
    attemptIdRef.current = attempt.attemptId;

    streamRef.current = mediaStream;
    setStream(mediaStream);
    setIsProctoringActive(true);
    setIsFullscreen(true);

    mediaStream.getVideoTracks().forEach((track) => {
      track.onended = () => {
        setIsProctoringActive(false);
        addViolationRef.current('camera_lost', 'Camera was disconnected or turned off');
      };
    });

    // The deadline comes from the server's start time, so a refresh resumes correctly.
    graceUntilRef.current = Date.now() + START_GRACE_MS;
    deadlineRef.current = parseStart(attempt.startedAt) + exam.duration_min * 60 * 1000;
    setTimeRemaining(Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000)));
    setPhase('exam');
  };

  // Show the camera in the sidebar preview once the exam screen exists.
  useEffect(() => {
    if (phase === 'exam' && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [phase, stream]);

  // Timer. Uses a deadline, so it stays correct even if the browser slows the tab down.
  useEffect(() => {
    if (phase !== 'exam') return;

    const tick = () => {
      const left = Math.max(0, Math.ceil((deadlineRef.current - Date.now()) / 1000));
      setTimeRemaining(left);
      if (left === 0) {
        submitRef.current();
      }
    };

    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Tab switch, window blur and fullscreen detection.
  useEffect(() => {
    if (phase !== 'exam') return;

    let blurTimer: number | undefined;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addViolationRef.current('tab_switch', 'The exam tab was hidden');
      }
    };

    // Switching tabs also fires blur. Wait a moment, and skip it if the tab is hidden,
    // so one action is not counted twice.
    const handleBlur = () => {
      window.clearTimeout(blurTimer);
      blurTimer = window.setTimeout(() => {
        if (!document.hidden && !document.hasFocus()) {
          addViolationRef.current('window_blur', 'Focus moved to another window');
        }
      }, 300);
    };

    const handleFullscreenChange = () => {
      const inFullscreen = !!document.fullscreenElement;
      setIsFullscreen(inFullscreen);
      if (!inFullscreen) {
        addViolationRef.current('fullscreen_exit', 'Fullscreen mode was closed');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.clearTimeout(blurTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [phase]);

  // Face detection: no face, or more than one, for 4+ seconds is a violation.
  useEffect(() => {
    if (phase !== 'exam') return;

    let cancelled = false;
    let detector: FaceDetector | null = null;
    let timer: number | undefined;
    let issue: ViolationType | null = null;
    let issueSince = 0;

    const check = () => {
      const video = videoRef.current;
      if (!detector || !video || video.readyState < 2 || document.hidden) {
        issue = null;
        return;
      }
      const count = detector.detectForVideo(video, performance.now()).detections.length;
      const current: ViolationType | null =
        count === 0 ? 'no_face' : count > 1 ? 'multiple_faces' : null;

      if (current !== issue) {
        issue = current;
        issueSince = Date.now();
      } else if (current && Date.now() - issueSince >= 4000) {
        addViolationRef.current(
          current,
          current === 'no_face' ? 'No face in the camera for 4 seconds' : 'More than one face in the camera'
        );
        issueSince = Date.now() + 6000; // wait 10s before counting the same problem again
      }
    };

    const start = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm');
        const created = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
          },
          runningMode: 'VIDEO',
        });
        if (cancelled) {
          created.close();
          return;
        }
        detector = created;
        timer = window.setInterval(check, 500);
      } catch {
        toast.error('Face detection could not start', {
          description: 'Check your internet connection and reload.',
        });
      }
    };

    start();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
      detector?.close();
    };
  }, [phase]);

  // Block copy, paste, cut, right-click and common shortcuts.
  // These are not counted as violations, only blocked.
  useEffect(() => {
    if (phase !== 'exam') return;

    const notify = () =>
      toast.warning('That action is blocked during the exam.', { id: 'blocked-input' });

    const block = (e: Event) => {
      e.preventDefault();
      notify();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      const blocked =
        (mod && ['c', 'v', 'x', 'a', 'p', 's', 'u'].includes(key)) ||
        (mod && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        key === 'f12' ||
        key === 'printscreen';
      if (blocked) {
        e.preventDefault();
        notify();
      }
    };

    const events = ['copy', 'cut', 'paste', 'contextmenu'];
    events.forEach((name) => document.addEventListener(name, block));
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      events.forEach((name) => document.removeEventListener(name, block));
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [phase]);  

  // Leaving the page for any reason: turn the camera off and leave fullscreen.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      window.clearTimeout(navTimeoutRef.current);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const toggleFlag = (questionId: number) => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const returnToFullscreen = () => {
    document.documentElement.requestFullscreen().catch(() => {
      toast.error('Could not enter fullscreen', {
        description: 'Allow fullscreen for this site and try again.',
      });
    });
  };

  // Sends the answers to the server and shows the server's score.
  const sendSubmission = async () => {
    setSubmitError(null);
    try {
      await Promise.allSettled(pendingRef.current); // let queued violations arrive first
      const result = await api<{ score: number; total: number }>(
        `/attempts/${attemptIdRef.current}/submit`,
        { method: 'POST', body: { answers } }
      );
      toast.success('Exam submitted', {
        description: `You answered ${result.score} of ${result.total} correctly.`,
      });
      navTimeoutRef.current = window.setTimeout(() => {
        navigate('/results', {
          state: { score: result.score, total: result.total, violations: violationsRef.current.length },
        });
      }, 1500);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Could not reach the server.');
    }
  };

  const handleSubmitExam = () => {
    // Guard: the button, the timer and the violation limit can all fire this.
    if (submittedRef.current) return;
    submittedRef.current = true;

    stopCamera();
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setPhase('submitted');
    sendSubmission();
  };
  submitRef.current = handleSubmitExam;

  if (loadError || !exam) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">{loadError ? 'Could not load this exam' : 'Loading exam…'}</p>
          {loadError && (
            <>
              <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
              <Button className="mt-4" onClick={() => navigate('/student')}>
                Back to dashboard
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (phase === 'check') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <PreExamCheck
          examTitle={exam.title}
          durationMin={exam.duration_min}
          violationLimit={VIOLATION_LIMIT}
          onStart={handleStartExam}
        />
      </div>
    );
  }

  if (phase === 'submitted') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
          {submitError ? (
            <>
              <p className="mt-4 text-lg font-medium">Your answers are not saved yet</p>
              <p className="mt-1 text-sm text-muted-foreground">{submitError}</p>
              <Button className="mt-4" onClick={sendSubmission}>
                Try again
              </Button>
            </>
          ) : (
            <>
              <p className="mt-4 text-lg font-medium">Exam submitted</p>
              <p className="mt-1 text-sm text-muted-foreground">Taking you to your results…</p>
            </>
          )}
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const currentQuestionData = questions[currentQuestion];
  const nearLimit = violations.length >= VIOLATION_LIMIT - 1;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-8 py-4 lg:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{exam.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Video className={`h-5 w-5 ${isProctoringActive ? 'text-primary' : 'text-red-400'}`} />
                <span className="text-sm">{isProctoringActive ? 'Proctoring active' : 'Camera off'}</span>
              </div>
              <div
                className={`flex items-center gap-2 text-sm ${
                  nearLimit ? 'text-red-400' : violations.length > 0 ? 'text-amber-400' : 'text-muted-foreground'
                }`}
              >
                <AlertTriangle className="h-5 w-5" />
                <span>
                  Warnings {violations.length}/{VIOLATION_LIMIT}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-amber-400/10 px-4 py-2">
                <Clock className="h-5 w-5 text-amber-400" />
                <span className="text-lg font-bold text-amber-400">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1600px] px-8 py-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Question area */}
          <div className="space-y-6 lg:col-span-2">
            {/* Fullscreen warning */}
            {!isFullscreen && (
              <Card className="border-red-400/30 bg-red-400/10">
                <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                  <div className="flex items-center gap-3 text-red-300">
                    <Maximize className="h-5 w-5 shrink-0" />
                    <p className="text-sm">
                      You left fullscreen. Return to fullscreen to continue the exam.
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={returnToFullscreen}>
                    Return to fullscreen
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Question */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">Question {currentQuestion + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFlag(currentQuestionData.id)}
                    className={flaggedQuestions.has(currentQuestionData.id) ? 'text-amber-400' : ''}
                  >
                    <Flag
                      className={`h-4 w-4 ${
                        flaggedQuestions.has(currentQuestionData.id) ? 'fill-current' : ''
                      }`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-6 text-lg">{currentQuestionData.text}</p>

                <RadioGroup
                  value={answers[currentQuestionData.id]?.toString()}
                  onValueChange={(value) =>
                    handleAnswerChange(currentQuestionData.id, parseInt(value))
                  }
                >
                  <div className="space-y-4">
                    {currentQuestionData.options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-center space-x-3 rounded-lg border-2 p-4 transition-colors ${
                          answers[currentQuestionData.id] === index
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePreviousQuestion} disabled={currentQuestion === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {currentQuestion === questions.length - 1 ? (
                  <Button onClick={handleSubmitExam}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit exam
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Webcam */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Video className="h-4 w-4" />
                  Proctoring monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video overflow-hidden rounded-lg bg-neutral-900">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                  {isProctoringActive && (
                    <div className="absolute right-2 top-2">
                      <Badge className="bg-red-600 text-white">
                        <span className="mr-1 animate-pulse">●</span> Live
                      </Badge>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Your activity is being monitored. The camera is not recorded.
                </p>
              </CardContent>
            </Card>

            {/* Violation log */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Violation log</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {violations.length} of {VIOLATION_LIMIT} warnings used
                </p>
              </CardHeader>
              <CardContent>
                {violations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No violations so far.</p>
                ) : (
                  <ul className="max-h-48 space-y-3 overflow-y-auto">
                    {[...violations].reverse().map((v) => (
                      <li key={v.id} className="text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-amber-400">{violationLabels[v.type]}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(v.at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{v.detail}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Navigator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Question navigator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {answeredCount} of {questions.length} answered
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((q, index) => (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestion(index)}
                      className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                        index === currentQuestion
                          ? 'bg-primary text-primary-foreground'
                          : answers[q.id] !== undefined
                          ? 'bg-primary/20 text-primary'
                          : 'bg-secondary text-muted-foreground hover:bg-accent'
                      } ${flaggedQuestions.has(q.id) ? 'ring-2 ring-amber-400' : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-primary/20"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-secondary"></div>
                    <span>Not answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-secondary ring-2 ring-amber-400"></div>
                    <span>Flagged</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exam statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total questions</span>
                  <span className="font-medium">{questions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Answered</span>
                  <span className="font-medium text-primary">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Not answered</span>
                  <span className="font-medium text-amber-400">
                    {questions.length - answeredCount}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Flagged</span>
                  <span className="font-medium text-amber-400">{flaggedQuestions.size}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}