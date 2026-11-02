import { Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Clock, Calendar, Award, TrendingUp, Home, BookOpen } from 'lucide-react';

const upcomingExams = [
  {
    id: 1,
    title: 'Data Structures & Algorithms',
    date: '2026-06-20',
    time: '10:00 AM',
    duration: '120 min',
    questions: 50,
    status: 'scheduled'
  },
  {
    id: 2,
    title: 'Database Management Systems',
    date: '2026-06-22',
    time: '2:00 PM',
    duration: '90 min',
    questions: 40,
    status: 'scheduled'
  },
  {
    id: 3,
    title: 'Operating Systems',
    date: '2026-06-25',
    time: '11:00 AM',
    duration: '150 min',
    questions: 60,
    status: 'scheduled'
  }
];

const completedExams = [
  {
    id: 4,
    title: 'Web Development Fundamentals',
    date: '2026-06-10',
    score: 85,
    totalMarks: 100,
    status: 'completed'
  },
  {
    id: 5,
    title: 'Computer Networks',
    date: '2026-06-08',
    score: 92,
    totalMarks: 100,
    status: 'completed'
  },
  {
    id: 6,
    title: 'Software Engineering',
    date: '2026-06-05',
    score: 78,
    totalMarks: 100,
    status: 'completed'
  }
];

export function StudentDashboard() {
  const averageScore = Math.round(
    completedExams.reduce((acc, exam) => acc + exam.score, 0) / completedExams.length
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      {/* Header */}
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-5 w-5 text-indigo-600" />
                <span className="text-xl font-bold text-indigo-600">ExamGuard</span>
              </Link>
              <div className="flex gap-4">
                <Button variant="ghost" className="text-indigo-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  My Exams
                </Button>
                <Link to="/results">
                  <Button variant="ghost">Results</Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">Welcome, <strong>John Doe</strong></span>
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                JD
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Exams
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingExams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Scheduled this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedExams.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Exams finished
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Overall performance
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
              <div className="text-2xl font-bold">6.5h</div>
              <p className="text-xs text-muted-foreground mt-1">
                Total exam time
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Exams */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Upcoming Exams</h2>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{exam.title}</CardTitle>
                        <CardDescription className="mt-2">
                          <span className="flex gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {exam.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {exam.time}
                            </span>
                          </span>
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        Scheduled
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span>Duration: {exam.duration}</span>
                        <span>Questions: {exam.questions}</span>
                      </div>
                      <Link to={`/exam/${exam.id}`}>
                        <Button>Start Exam</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Results */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Results</h2>
            <div className="space-y-4">
              {completedExams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{exam.title}</CardTitle>
                    <CardDescription className="text-xs">{exam.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Score</span>
                        <span className="font-bold">
                          {exam.score}/{exam.totalMarks}
                        </span>
                      </div>
                      <Progress value={exam.score} />
                      <div className="text-right">
                        <Badge
                          variant={exam.score >= 80 ? 'default' : exam.score >= 60 ? 'secondary' : 'destructive'}
                        >
                          {exam.score >= 80 ? 'Excellent' : exam.score >= 60 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Link to="/results">
                <Button variant="outline" className="w-full">
                  View All Results
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
