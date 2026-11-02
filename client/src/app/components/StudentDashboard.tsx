import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Nav } from './Nav';
import { api } from '../api';
import { Clock, Calendar, Award, TrendingUp, AlertTriangle } from 'lucide-react';

type Exam = {
  id: number;
  title: string;
  scheduled_at: string | null;
  duration_min: number;
  description: string | null;
  question_count: number;
};

type Result = {
  id: number;
  title: string;
  submitted_at: string;
  score: number;
  total: number;
  violations: number;
};

const percent = (r: Result) => (r.total ? Math.round((r.score / r.total) * 100) : 0);

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
    : 'No date set';

const formatTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '';

export function StudentDashboard() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [doneIds, setDoneIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api<{ exams: Exam[] }>('/exams'),
      api<{ results: Result[] }>('/results'),
      api<{ examIds: number[] }>('/completed-exams'),
    ])
      .then(([e, r, c]) => {
        if (cancelled) return;
        setExams(e.exams);
        setResults(r.results);
        setDoneIds(new Set(c.examIds));
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your exams');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const averageScore = results.length
    ? Math.round(results.reduce((sum, r) => sum + percent(r), 0) / results.length)
    : null;
  const totalViolations = results.reduce((sum, r) => sum + r.violations, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav
        links={[
          { to: '/student', label: 'My exams', active: true },
          { to: '/results', label: 'Results' },
        ]}
      />

      <main className="mx-auto max-w-[1600px] px-8 py-8 lg:px-12">
        {loading && <p className="text-muted-foreground">Loading your exams…</p>}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && !error && (
          <>
            {/* Stats */}
            <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Available exams</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{exams.filter((e) => !doneIds.has(e.id)).length}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Ready to take</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{results.length}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Exams finished</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Average score</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{averageScore === null ? '—' : `${averageScore}%`}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Across finished exams</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalViolations}</div>
                  <p className="mt-1 text-xs text-muted-foreground">Across finished exams</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* Available exams */}
              <section className="lg:col-span-2">
                <h2 className="mb-4 text-2xl font-bold">Available exams</h2>
                {exams.length === 0 ? (
                  <p className="text-muted-foreground">No exams are available yet.</p>
                ) : (
                  <div className="space-y-4">
                    {exams.map((exam) => (
                      <Card key={exam.id} className="transition-colors hover:border-primary/40">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{exam.title}</CardTitle>
                              <CardDescription className="mt-2">
                                <span className="flex gap-4 text-sm">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {formatDate(exam.scheduled_at)}
                                  </span>
                                  {exam.scheduled_at && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {formatTime(exam.scheduled_at)}
                                    </span>
                                  )}
                                </span>
                              </CardDescription>
                            </div>
                            {doneIds.has(exam.id) ? (
                              <Badge variant="secondary">Completed</Badge>
                            ) : (
                              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                                Available
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          {exam.description && (
                            <p className="mb-4 text-sm text-muted-foreground">{exam.description}</p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex gap-6 text-sm text-muted-foreground">
                              <span>Duration: {exam.duration_min} min</span>
                              <span>Questions: {exam.question_count}</span>
                            </div>
                            {doneIds.has(exam.id) ? (
                              <Link to="/results">
                                <Button variant="outline">View result</Button>
                              </Link>
                            ) : (
                              <Link to={`/exam/${exam.id}`}>
                                <Button>Start exam</Button>
                              </Link>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              {/* Recent results */}
              <section>
                <h2 className="mb-4 text-2xl font-bold">Recent results</h2>
                {results.length === 0 ? (
                  <p className="text-muted-foreground">You haven't finished any exams yet.</p>
                ) : (
                  <div className="space-y-4">
                    {results.slice(0, 3).map((r) => {
                      const pct = percent(r);
                      return (
                        <Card key={r.id}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-base">{r.title}</CardTitle>
                            <CardDescription className="text-xs">{formatDate(r.submitted_at)}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Score</span>
                                <span className="font-bold">
                                  {r.score}/{r.total}
                                </span>
                              </div>
                              <Progress value={pct} />
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  {r.violations} {r.violations === 1 ? 'warning' : 'warnings'}
                                </span>
                                <Badge variant={pct >= 80 ? 'default' : pct >= 60 ? 'secondary' : 'destructive'}>
                                  {pct >= 80 ? 'Excellent' : pct >= 60 ? 'Good' : 'Needs improvement'}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    <Link to="/results" className="block">
                      <Button variant="outline" className="w-full">
                        View all results
                      </Button>
                    </Link>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}