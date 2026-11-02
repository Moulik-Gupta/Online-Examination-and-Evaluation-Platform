import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
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
} from 'lucide-react';
import { toast } from 'sonner';

const examData = {
  title: 'Data Structures & Algorithms',
  duration: 7200, // 2 hours in seconds
  questions: [
    {
      id: 1,
      question: 'What is the time complexity of binary search?',
      options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
      correctAnswer: 1,
    },
    {
      id: 2,
      question: 'Which data structure uses LIFO principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
      correctAnswer: 1,
    },
    {
      id: 3,
      question: 'What is the worst-case time complexity of Quick Sort?',
      options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
      correctAnswer: 1,
    },
    {
      id: 4,
      question: 'Which traversal method uses a queue?',
      options: ['Pre-order', 'In-order', 'Post-order', 'Level-order'],
      correctAnswer: 3,
    },
    {
      id: 5,
      question: 'What is a perfect binary tree?',
      options: [
        'A tree where all nodes have two children',
        'A tree where all leaf nodes are at the same level',
        'A tree with maximum nodes at each level',
        'Both B and C',
      ],
      correctAnswer: 3,
    },
  ],
};

export function ExamInterface() {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(examData.duration);
  const [isProctoringActive, setIsProctoringActive] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  const [proctoringAlerts, setProctoringAlerts] = useState<string[]>([]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Webcam proctoring
  useEffect(() => {
    startProctoring();

    // Detect tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const alert = `Tab switched at ${new Date().toLocaleTimeString()}`;
        setProctoringAlerts((prev) => [...prev, alert]);
        toast.warning('Warning: Tab switching detected!', {
          description: 'This activity has been recorded.',
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopProctoring();
    };
  }, []);

  const startProctoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsProctoringActive(true);
        toast.success('Proctoring Started', {
          description: 'Your webcam is now being monitored.',
        });
      }
    } catch (error) {
      toast.error('Camera Access Required', {
        description: 'Please allow camera access to continue with the exam.',
      });
    }
  };

  const stopProctoring = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      setIsProctoringActive(false);
    }
  };

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
    if (currentQuestion < examData.questions.length - 1) {
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

  const handleSubmitExam = () => {
    stopProctoring();
    toast.success('Exam Submitted!', {
      description: 'Your answers have been recorded.',
    });
    setTimeout(() => {
      navigate('/results');
    }, 1500);
  };

  const progress = ((currentQuestion + 1) / examData.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;
  const currentQuestionData = examData.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-8 py-4 lg:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="h-7 w-7 text-primary" />
              <div>
                <h1 className="text-xl font-bold">{examData.title}</h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of {examData.questions.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Video className={`h-5 w-5 ${isProctoringActive ? 'text-primary' : 'text-red-400'}`} />
                <span className="text-sm">{isProctoringActive ? 'Proctoring Active' : 'Camera Off'}</span>
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
            {/* Proctoring alerts */}
            {proctoringAlerts.length > 0 && (
              <Card className="border-amber-400/30 bg-amber-400/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-300">
                    <AlertTriangle className="h-5 w-5" />
                    Proctoring Alerts ({proctoringAlerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {proctoringAlerts.slice(-3).map((alert, index) => (
                      <p key={index} className="text-sm text-amber-200">
                        • {alert}
                      </p>
                    ))}
                  </div>
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
                <p className="mb-6 text-lg">{currentQuestionData.question}</p>

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
                {currentQuestion === examData.questions.length - 1 ? (
                  <Button onClick={handleSubmitExam}>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Submit Exam
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
                  Proctoring Monitor
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
                  Your activity is being monitored for security
                </p>
              </CardContent>
            </Card>

            {/* Navigator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Question Navigator</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {answeredCount} of {examData.questions.length} answered
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {examData.questions.map((q, index) => (
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
                    <span>Not Answered</span>
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
                <CardTitle className="text-base">Exam Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Questions</span>
                  <span className="font-medium">{examData.questions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Answered</span>
                  <span className="font-medium text-primary">{answeredCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Not Answered</span>
                  <span className="font-medium text-amber-400">
                    {examData.questions.length - answeredCount}
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
