import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Nav } from './Nav';
import {
  TrendingUp,
  Award,
  Clock,
  Target,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { axisStroke, colors, cursorStyle, gridStroke, tooltipStyle } from './chartTheme';

const examResults = [
  {
    id: 1,
    examName: 'Data Structures & Algorithms',
    date: '2026-06-16',
    score: 88,
    totalMarks: 100,
    percentage: 88,
    timeSpent: '1h 45m',
    correctAnswers: 44,
    totalQuestions: 50,
    rank: 12,
    totalStudents: 150,
  },
  {
    id: 2,
    examName: 'Web Development Fundamentals',
    date: '2026-06-10',
    score: 85,
    totalMarks: 100,
    percentage: 85,
    timeSpent: '1h 30m',
    correctAnswers: 34,
    totalQuestions: 40,
    rank: 18,
    totalStudents: 145,
  },
  {
    id: 3,
    examName: 'Computer Networks',
    date: '2026-06-08',
    score: 92,
    totalMarks: 100,
    percentage: 92,
    timeSpent: '1h 20m',
    correctAnswers: 37,
    totalQuestions: 40,
    rank: 5,
    totalStudents: 142,
  },
  {
    id: 4,
    examName: 'Software Engineering',
    date: '2026-06-05',
    score: 78,
    totalMarks: 100,
    percentage: 78,
    timeSpent: '2h 10m',
    correctAnswers: 39,
    totalQuestions: 50,
    rank: 35,
    totalStudents: 148,
  },
];

const performanceTrend = [
  { month: 'Feb', score: 72 },
  { month: 'Mar', score: 78 },
  { month: 'Apr', score: 82 },
  { month: 'May', score: 85 },
  { month: 'Jun', score: 88 },
];

const subjectPerformance = [
  { subject: 'DSA', score: 88 },
  { subject: 'Web Dev', score: 85 },
  { subject: 'Networks', score: 92 },
  { subject: 'SE', score: 78 },
  { subject: 'DBMS', score: 0 }, // upcoming
];

const accuracyData = [
  { name: 'Correct', value: 88, color: colors.green },
  { name: 'Incorrect', value: 12, color: colors.red },
];

const questionAnalysis = {
  easy: { correct: 14, total: 15 },
  medium: { correct: 17, total: 20 },
  hard: { correct: 13, total: 15 },
};

// Label for the pie chart, drawn in a light color so it shows on the dark card.
function renderPieLabel(props: any) {
  const { name, value, cx, x, y } = props;
  return (
    <text
      x={x}
      y={y}
      fill="#e5e5e5"
      fontSize={12}
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${name}: ${value}%`}
    </text>
  );
}

export function ResultsAnalytics() {
  const averageScore = Math.round(
    examResults.reduce((acc, exam) => acc + exam.percentage, 0) / examResults.length
  );

  const totalExams = examResults.length;
  const totalTimeSpent = examResults.reduce((acc, exam) => {
    const [hours, minutes] = exam.timeSpent.split('h ');
    return acc + parseInt(hours) * 60 + parseInt(minutes);
  }, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav
        initials="JD"
        links={[
          { to: '/student', label: 'My Exams' },
          { to: '/results', label: 'Results', active: true },
        ]}
      />

      <main className="mx-auto max-w-[1600px] px-8 py-8 lg:px-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Results & Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance and identify areas for improvement
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageScore}%</div>
              <p className="mt-1 text-xs text-primary">+5% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Exams Completed
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalExams}</div>
              <p className="mt-1 text-xs text-muted-foreground">This semester</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.floor(totalTimeSpent / 60)}h</div>
              <p className="mt-1 text-xs text-muted-foreground">Total exam time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Best Rank</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5th</div>
              <p className="mt-1 text-xs text-muted-foreground">Out of 142 students</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                  <CardDescription>Your score progression over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis dataKey="month" stroke={axisStroke} />
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

              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>Scores across different subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                      <XAxis dataKey="subject" stroke={axisStroke} />
                      <YAxis domain={[0, 100]} stroke={axisStroke} />
                      <Tooltip contentStyle={tooltipStyle} cursor={cursorStyle} />
                      <Bar dataKey="score" fill={colors.green} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overall Accuracy</CardTitle>
                  <CardDescription>Correct vs Incorrect answers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={accuracyData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          dataKey="value"
                          stroke="none"
                          label={renderPieLabel}
                        >
                          {accuracyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Question Analysis</CardTitle>
                  <CardDescription>Performance by difficulty level</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(['easy', 'medium', 'hard'] as const).map((level) => (
                    <div key={level}>
                      <div className="mb-2 flex justify-between">
                        <span className="text-sm font-medium capitalize">{level}</span>
                        <span className="text-sm text-muted-foreground">
                          {questionAnalysis[level].correct}/{questionAnalysis[level].total}
                        </span>
                      </div>
                      <Progress
                        value={(questionAnalysis[level].correct / questionAnalysis[level].total) * 100}
                        className="h-2"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Detailed results */}
          <TabsContent value="detailed">
            <div className="space-y-4">
              {examResults.map((result) => (
                <Card key={result.id} className="transition-colors hover:border-primary/40">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{result.examName}</CardTitle>
                        <CardDescription className="mt-1">Completed on {result.date}</CardDescription>
                      </div>
                      <Badge
                        variant={
                          result.percentage >= 80
                            ? 'default'
                            : result.percentage >= 60
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="px-4 py-2 text-lg"
                      >
                        {result.percentage}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="text-2xl font-bold">
                          {result.score}/{result.totalMarks}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Correct Answers</p>
                        <p className="flex items-center gap-2 text-2xl font-bold">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                          {result.correctAnswers}/{result.totalQuestions}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Time Spent</p>
                        <p className="flex items-center gap-2 text-2xl font-bold">
                          <Clock className="h-5 w-5 text-sky-400" />
                          {result.timeSpent}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Rank</p>
                        <p className="flex items-center gap-2 text-2xl font-bold">
                          <Award className="h-5 w-5 text-amber-400" />
                          {result.rank}/{result.totalStudents}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={result.percentage} className="h-2" />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </Button>
                      <Button variant="outline" size="sm">
                        View Solutions
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Strengths</CardTitle>
                  <CardDescription>Topics where you excel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Computer Networks', score: 92 },
                    { name: 'Data Structures', score: 88 },
                    { name: 'Web Development', score: 85 },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-lg bg-primary/10 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <Badge>{item.score}%</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Areas to Improve</CardTitle>
                  <CardDescription>Topics needing more focus</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: 'Software Engineering', score: 78 },
                    { name: 'Hard Questions', score: 87 },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-lg bg-amber-400/10 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-400" />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <Badge variant="secondary" className="bg-amber-400/20 text-amber-300">
                        {item.score}%
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Personalized tips to improve your performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      icon: TrendingUp,
                      title: 'Focus on Software Engineering',
                      text: 'Your score is 78%. Review design patterns and SDLC concepts.',
                    },
                    {
                      icon: Clock,
                      title: 'Improve Time Management',
                      text: 'You took 2h 10m on Software Engineering. Practice solving questions faster.',
                    },
                    {
                      icon: Target,
                      title: 'Practice Hard Questions',
                      text: 'Your accuracy on hard questions is 87%. Aim for 90%+ by solving more practice problems.',
                    },
                  ].map(({ icon: Icon, title, text }) => (
                    <div key={title} className="flex gap-3 rounded-lg bg-secondary p-4">
                      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <div>
                        <p className="font-medium">{title}</p>
                        <p className="text-sm text-muted-foreground">{text}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
