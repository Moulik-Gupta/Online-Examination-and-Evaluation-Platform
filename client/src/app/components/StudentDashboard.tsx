import { Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Nav } from './Nav';
import { Clock, Calendar, Award, TrendingUp } from 'lucide-react';

const upcomingExams = [
  {
    id: 1,
    title: 'Data Structures & Algorithms',
    date: '2026-06-20',
    time: '10:00 AM',
    duration: '120 min',
    questions: 50,
    status: 'scheduled',
  },
  {
    id: 2,
    title: 'Database Management Systems',
    date: '2026-06-22',
    time: '2:00 PM',
    duration: '90 min',
    questions: 40,
    status: 'scheduled',
  },
  {
    id: 3,
    title: 'Operating Systems',
    date: '2026-06-25',
    time: '11:00 AM',
    duration: '150 min',
    questions: 60,
    status: 'scheduled',
  },
];

const completedExams = [
  {
    id: 4,
    title: 'Web Development Fundamentals',
    date: '2026-06-10',
    score: 85,
    totalMarks: 100,
    status: 'completed',
  },
  {
    id: 5,
    title: 'Computer Networks',
    date: '2026-06-08',
    score: 92,
    totalMarks: 100,
    status: 'completed',
  },
  {
    id: 6,
    title: 'Software Engineering',
    date: '2026-06-05',
    score: 78,
    totalMarks: 100,
    status: 'completed',
  },
];

export function StudentDashboard() {
  const averageScore = Math.round(
    completedExams.reduce((acc, exam) => acc + exam.score, 0) / completedExams.length
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav
        initials="JD"
        userLabel="Welcome, John Doe"
        links={[
          { to: '/student', label: 'My Exams', active: true },
          { to: '/results', label: 'Results' },
        ]}
      />

      <main className="mx-auto max-w-[1600px] px-8 py-8 lg:px-12">
        {/* Stats */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming Exams
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingExams.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Scheduled this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedExams.length}</div>
              <p className="mt-1 text-xs text-muted-foreground">Exams finished</p>
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
              <p className="mt-1 text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Time Spent</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.5h</div>
              <p className="mt-1 text-xs text-muted-foreground">Total exam time</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Upcoming exams */}
          <section className="lg:col-span-2">
            <h2 className="mb-4 text-2xl font-bold">Upcoming Exams</h2>
            <div className="space-y-4">
              {upcomingExams.map((exam) => (
                <Card key={exam.id} className="transition-colors hover:border-primary/40">
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
                      <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
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
          </section>

          {/* Recent results */}
          <section>
            <h2 className="mb-4 text-2xl font-bold">Recent Results</h2>
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
                          variant={
                            exam.score >= 80 ? 'default' : exam.score >= 60 ? 'secondary' : 'destructive'
                          }
                        >
                          {exam.score >= 80 ? 'Excellent' : exam.score >= 60 ? 'Good' : 'Needs Improvement'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Link to="/results" className="block">
                <Button variant="outline" className="w-full">
                  View All Results
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
