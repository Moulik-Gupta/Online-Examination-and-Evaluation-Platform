import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Nav } from './Nav';
import { TrendingUp, Award, AlertTriangle, Target, CheckCircle2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { axisStroke, colors, gridStroke, tooltipStyle } from './chartTheme';
import { api, ApiError } from '../api';
import { useAuth } from '../auth';

type Result = {
  id: number;
  title: string;
  submitted_at: string;
  score: number;
  total: number;
  violations: number;
};

const percent = (r: Result) => (r.total > 0 ? Math.round((r.score / r.total) * 100) : 0);

export function ResultsAnalytics() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ results: Result[] }>('/results')
      .then((data) => setResults(data.results))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load results.'));
  }, []);

  const initials = (user?.name ?? '')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const sorted = [...(results ?? [])].sort(
    (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
  );
  const chartData = sorted.map((r, i) => ({ name: `#${i + 1}`, score: percent(r) }));
  const averageScore = sorted.length
    ? Math.round(sorted.reduce((sum, r) => sum + percent(r), 0) / sorted.length)
    : 0;
  const bestScore = sorted.length ? Math.max(...sorted.map(percent)) : 0;
  const totalViolations = sorted.reduce((sum, r) => sum + r.violations, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav
        initials={initials}
        links={[
          { to: '/student', label: 'My Exams' },
          { to: '/results', label: 'Results', active: true },
        ]}
      />

      <main className="mx-auto max-w-[1600px] px-8 py-8 lg:px-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Results</h1>
          <p className="text-muted-foreground">Your finished exams and how you did</p>
        </div>

        {error && <p className="text-red-400">{error}</p>}
        {!error && results === null && <p className="text-muted-foreground">Loading results…</p>}

        {results && results.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center">
              <p className="font-medium">No results yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Finish an exam and it will show up here.</p>
              <Button className="mt-4" onClick={() => navigate('/student')}>
                Go to my exams
              </Button>
            </CardContent>
          </Card>
        )}

        {results && results.length > 0 && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Average score', value: `${averageScore}%`, icon: TrendingUp },
                { label: 'Exams completed', value: String(sorted.length), icon: Award },
                { label: 'Best score', value: `${bestScore}%`, icon: Target },
                { label: 'Total warnings', value: String(totalViolations), icon: AlertTriangle },
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

            {sorted.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Score over time</CardTitle>
                  <CardDescription>Each point is one finished exam, oldest first</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis dataKey="name" stroke={axisStroke} />
                      <YAxis domain={[0, 100]} stroke={axisStroke} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke={colors.green}
                        strokeWidth={3}
                        dot={{ fill: colors.green, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {[...sorted].reverse().map((r) => {
                const pct = percent(r);
                return (
                  <Card key={r.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{r.title}</CardTitle>
                          <CardDescription className="mt-1">
                            Submitted {new Date(r.submitted_at).toLocaleString()}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={pct >= 80 ? 'default' : pct >= 60 ? 'secondary' : 'destructive'}
                          className="px-4 py-2 text-lg"
                        >
                          {pct}%
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Correct answers</p>
                          <p className="flex items-center gap-2 text-2xl font-bold">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            {r.score}/{r.total}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Warnings</p>
                          <p
                            className={`flex items-center gap-2 text-2xl font-bold ${
                              r.violations > 0 ? 'text-amber-400' : ''
                            }`}
                          >
                            <AlertTriangle className="h-5 w-5" />
                            {r.violations}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress value={pct} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}