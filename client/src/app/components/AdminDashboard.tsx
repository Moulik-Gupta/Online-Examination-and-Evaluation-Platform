import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Nav } from './Nav';
import { Plus, FileText, Users, AlertTriangle, BarChart3, Calendar, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, ApiError } from '../api';

type Exam = {
  id: number;
  title: string;
  scheduled_at: string | null;
  duration_min: number;
  description: string | null;
  question_count: number;
};

type Attempt = {
  id: number;
  student: string;
  email: string;
  exam: string;
  started_at: string;
  submitted_at: string | null;
  score: number | null;
  total: number | null;
  violations: number;
};

type Violation = { id: number; type: string; detail: string; occurred_at: string };

const violationLabels: Record<string, string> = {
  tab_switch: 'Switched tab',
  window_blur: 'Left the exam window',
  fullscreen_exit: 'Left fullscreen',
  camera_lost: 'Camera stopped',
  no_face: 'Face not visible',
  multiple_faces: 'More than one face',
};

const emptyExam = { title: '', date: '', time: '', duration: '', description: '' };
const inputClass = 'border border-border bg-background';
const errorText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong.');

export function AdminDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newExam, setNewExam] = useState(emptyExam);
  const [logAttempt, setLogAttempt] = useState<Attempt | null>(null);
  const [log, setLog] = useState<Violation[] | null>(null);

  const load = async () => {
    try {
      const [e, a] = await Promise.all([
        api<{ exams: Exam[] }>('/exams'),
        api<{ attempts: Attempt[] }>('/admin/attempts'),
      ]);
      setExams(e.exams);
      setAttempts(a.attempts);
    } catch (err) {
      toast.error('Could not load data', { description: errorText(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreateExam = async () => {
    const duration = parseInt(newExam.duration);
    if (!newExam.title.trim() || !duration || duration < 1) {
      toast.error('Add a title and a duration in minutes.');
      return;
    }
    const scheduled_at = newExam.date
      ? new Date(`${newExam.date}T${newExam.time || '00:00'}`).toISOString()
      : undefined;
    try {
      await api('/admin/exams', {
        method: 'POST',
        body: {
          title: newExam.title.trim(),
          scheduled_at,
          duration_min: duration,
          description: newExam.description.trim() || undefined,
        },
      });
      toast.success('Exam created', { description: `${newExam.title} is now in the list.` });
      setIsCreateDialogOpen(false);
      setNewExam(emptyExam);
      load();
    } catch (err) {
      toast.error('Could not create the exam', { description: errorText(err) });
    }
  };

  const handleDeleteExam = async (exam: Exam) => {
    if (!window.confirm(`Delete "${exam.title}" and its questions?`)) return;
    try {
      await api(`/admin/exams/${exam.id}`, { method: 'DELETE' });
      toast.success('Exam deleted');
      load();
    } catch (err) {
      toast.error('Could not delete the exam', { description: errorText(err) });
    }
  };

  const openLog = async (attempt: Attempt) => {
    setLogAttempt(attempt);
    setLog(null);
    try {
      const data = await api<{ violations: Violation[] }>(`/admin/attempts/${attempt.id}/violations`);
      setLog(data.violations);
    } catch (err) {
      toast.error('Could not load the log', { description: errorText(err) });
      setLogAttempt(null);
    }
  };

  const submitted = attempts.filter((a) => a.submitted_at && a.total);
  const avgScore = submitted.length
    ? Math.round(submitted.reduce((sum, a) => sum + ((a.score ?? 0) / (a.total ?? 1)) * 100, 0) / submitted.length)
    : 0;
  const totalViolations = attempts.reduce((sum, a) => sum + a.violations, 0);
  const fmt = (value: string | null) => (value ? new Date(value).toLocaleString() : '—');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav section="Admin" initials="AD" />

      <main className="mx-auto max-w-[1600px] px-8 py-8 lg:px-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Admin dashboard</h1>
            <p className="text-muted-foreground">Manage exams and review attempts and warnings</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-5 w-5" />
                Create exam
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create exam</DialogTitle>
                <DialogDescription>Add the details. You can add questions afterwards.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    className={inputClass}
                    placeholder="e.g. Data Structures & Algorithms"
                    value={newExam.title}
                    onChange={(e) => setNewExam({ ...newExam, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date (optional)</Label>
                    <Input
                      id="date"
                      type="date"
                      className={inputClass}
                      value={newExam.date}
                      onChange={(e) => setNewExam({ ...newExam, date: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time (optional)</Label>
                    <Input
                      id="time"
                      type="time"
                      className={inputClass}
                      value={newExam.time}
                      onChange={(e) => setNewExam({ ...newExam, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    className={inputClass}
                    placeholder="90"
                    value={newExam.duration}
                    onChange={(e) => setNewExam({ ...newExam, duration: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    className={inputClass}
                    value={newExam.description}
                    onChange={(e) => setNewExam({ ...newExam, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateExam}>Create exam</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Exams', value: exams.length, icon: FileText },
            { label: 'Attempts', value: attempts.length, icon: Users },
            { label: 'Average score', value: `${avgScore}%`, icon: BarChart3 },
            { label: 'Total warnings', value: totalViolations, icon: AlertTriangle },
          ].map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="exams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="attempts">Attempts</TabsTrigger>
          </TabsList>

          <TabsContent value="exams" className="space-y-4">
            {loading && <p className="text-muted-foreground">Loading…</p>}
            {!loading && exams.length === 0 && (
              <p className="text-muted-foreground">No exams yet. Create one to get started.</p>
            )}
            {exams.map((exam) => (
              <Card key={exam.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                  <div>
                    <h3 className="text-lg font-semibold">{exam.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {exam.scheduled_at ? fmt(exam.scheduled_at) : 'Not scheduled'}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {exam.duration_min} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4" />
                        {exam.question_count} questions
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteExam(exam)}
                    className="text-red-400 hover:bg-red-400/10 hover:text-red-300"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="attempts">
            <Card>
              <CardHeader>
                <CardTitle>Attempts</CardTitle>
                <CardDescription>
                  The warning log is evidence for you to review, not proof of cheating.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {attempts.length === 0 ? (
                  <p className="text-muted-foreground">No attempts yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-muted-foreground">
                        <tr className="border-b border-border">
                          <th className="py-2 pr-4 font-medium">Student</th>
                          <th className="py-2 pr-4 font-medium">Exam</th>
                          <th className="py-2 pr-4 font-medium">Started</th>
                          <th className="py-2 pr-4 font-medium">Score</th>
                          <th className="py-2 pr-4 font-medium">Warnings</th>
                          <th className="py-2 font-medium"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {attempts.map((a) => (
                          <tr key={a.id} className="border-b border-border last:border-0">
                            <td className="py-3 pr-4">
                              <p className="font-medium">{a.student}</p>
                              <p className="text-xs text-muted-foreground">{a.email}</p>
                            </td>
                            <td className="py-3 pr-4">{a.exam}</td>
                            <td className="py-3 pr-4">{fmt(a.started_at)}</td>
                            <td className="py-3 pr-4">
                              {a.submitted_at ? `${a.score}/${a.total}` : <Badge variant="secondary">In progress</Badge>}
                            </td>
                            <td className={`py-3 pr-4 ${a.violations > 0 ? 'text-amber-400' : ''}`}>
                              {a.violations}
                            </td>
                            <td className="py-3 text-right">
                              <Button variant="outline" size="sm" onClick={() => openLog(a)}>
                                View log
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!logAttempt} onOpenChange={(open) => !open && setLogAttempt(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Warning log</DialogTitle>
              <DialogDescription>
                {logAttempt?.student} · {logAttempt?.exam}
              </DialogDescription>
            </DialogHeader>
            {log === null ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : log.length === 0 ? (
              <p className="text-sm text-muted-foreground">No warnings were recorded.</p>
            ) : (
              <ul className="max-h-80 space-y-3 overflow-y-auto">
                {log.map((v) => (
                  <li key={v.id} className="text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-amber-400">{violationLabels[v.type] ?? v.type}</span>
                      <span className="text-xs text-muted-foreground">{fmt(v.occurred_at)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{v.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}