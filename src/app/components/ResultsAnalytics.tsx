import { Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Home, 
  TrendingUp, 
  Award, 
  Clock, 
  Target,
  ChevronRight,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle
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
  Legend, 
  ResponsiveContainer 
} from 'recharts';

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
    totalStudents: 150
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
    totalStudents: 145
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
    totalStudents: 142
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
    totalStudents: 148
  }
];

const performanceTrend = [
  { month: 'Feb', score: 72 },
  { month: 'Mar', score: 78 },
  { month: 'Apr', score: 82 },
  { month: 'May', score: 85 },
  { month: 'Jun', score: 88 }
];

const subjectPerformance = [
  { subject: 'DSA', score: 88 },
  { subject: 'Web Dev', score: 85 },
  { subject: 'Networks', score: 92 },
  { subject: 'SE', score: 78 },
  { subject: 'DBMS', score: 0 } // Upcoming
];

const accuracyData = [
  { name: 'Correct', value: 88, color: '#10b981' },
  { name: 'Incorrect', value: 12, color: '#ef4444' }
];

const questionAnalysis = {
  easy: { attempted: 15, correct: 14, total: 15 },
  medium: { attempted: 20, correct: 17, total: 20 },
  hard: { attempted: 15, correct: 13, total: 15 }
};

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-5 w-5 text-indigo-600" />
              <span className="text-xl font-bold text-indigo-600">ExamGuard</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/student">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Results & Analytics</h1>
          <p className="text-muted-foreground">
            Track your performance and identify areas for improvement
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageScore}%</div>
              <p className="text-xs text-green-600 mt-1">
                +5% from last month
              </p>
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
              <p className="text-xs text-muted-foreground mt-1">
                This semester
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Time Spent
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.floor(totalTimeSpent / 60)}h</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total exam time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Best Rank
              </CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">5th</div>
              <p className="text-xs text-muted-foreground mt-1">
                Out of 142 students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                  <CardDescription>Your score progression over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={performanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        dot={{ fill: '#6366f1', r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Subject-wise Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>Scores across different subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Accuracy Distribution */}
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
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {accuracyData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Question Difficulty Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle>Question Analysis</CardTitle>
                  <CardDescription>Performance by difficulty level</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Easy</span>
                      <span className="text-sm text-muted-foreground">
                        {questionAnalysis.easy.correct}/{questionAnalysis.easy.total}
                      </span>
                    </div>
                    <Progress 
                      value={(questionAnalysis.easy.correct / questionAnalysis.easy.total) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Medium</span>
                      <span className="text-sm text-muted-foreground">
                        {questionAnalysis.medium.correct}/{questionAnalysis.medium.total}
                      </span>
                    </div>
                    <Progress 
                      value={(questionAnalysis.medium.correct / questionAnalysis.medium.total) * 100} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Hard</span>
                      <span className="text-sm text-muted-foreground">
                        {questionAnalysis.hard.correct}/{questionAnalysis.hard.total}
                      </span>
                    </div>
                    <Progress 
                      value={(questionAnalysis.hard.correct / questionAnalysis.hard.total) * 100} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Detailed Results Tab */}
          <TabsContent value="detailed">
            <div className="space-y-4">
              {examResults.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{result.examName}</CardTitle>
                        <CardDescription className="mt-1">
                          Completed on {result.date}
                        </CardDescription>
                      </div>
                      <Badge 
                        variant={result.percentage >= 80 ? 'default' : result.percentage >= 60 ? 'secondary' : 'destructive'}
                        className="text-lg px-4 py-2"
                      >
                        {result.percentage}%
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Score</p>
                        <p className="text-2xl font-bold">{result.score}/{result.totalMarks}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Correct Answers</p>
                        <p className="text-2xl font-bold flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          {result.correctAnswers}/{result.totalQuestions}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Time Spent</p>
                        <p className="text-2xl font-bold flex items-center gap-2">
                          <Clock className="h-5 w-5 text-indigo-600" />
                          {result.timeSpent}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Rank</p>
                        <p className="text-2xl font-bold flex items-center gap-2">
                          <Award className="h-5 w-5 text-orange-500" />
                          {result.rank}/{result.totalStudents}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={result.percentage} className="h-2" />
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                      <Button variant="outline" size="sm">
                        View Solutions
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Strengths</CardTitle>
                  <CardDescription>Topics where you excel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Computer Networks</span>
                    </div>
                    <Badge className="bg-green-600">92%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Data Structures</span>
                    </div>
                    <Badge className="bg-green-600">88%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Web Development</span>
                    </div>
                    <Badge className="bg-green-600">85%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Areas to Improve</CardTitle>
                  <CardDescription>Topics needing more focus</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Software Engineering</span>
                    </div>
                    <Badge variant="secondary" className="bg-orange-200 text-orange-800">78%</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                      <span className="font-medium">Hard Questions</span>
                    </div>
                    <Badge variant="secondary" className="bg-orange-200 text-orange-800">87%</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Personalized tips to improve your performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-3 p-4 bg-indigo-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Focus on Software Engineering</p>
                      <p className="text-sm text-muted-foreground">
                        Your score is 78%. Review design patterns and SDLC concepts.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-indigo-50 rounded-lg">
                    <Clock className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Improve Time Management</p>
                      <p className="text-sm text-muted-foreground">
                        You took 2h 10m on Software Engineering. Practice solving questions faster.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-indigo-50 rounded-lg">
                    <Target className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Practice Hard Questions</p>
                      <p className="text-sm text-muted-foreground">
                        Your accuracy on hard questions is 87%. Aim for 90%+ by solving more practice problems.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
