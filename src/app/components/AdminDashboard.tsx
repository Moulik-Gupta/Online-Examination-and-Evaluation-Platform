import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Home, 
  Plus, 
  FileText, 
  Users, 
  BarChart3, 
  Settings,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const exams = [
  {
    id: 1,
    title: 'Data Structures & Algorithms',
    date: '2026-06-20',
    time: '10:00 AM',
    duration: 120,
    totalQuestions: 50,
    enrolled: 150,
    completed: 145,
    status: 'upcoming'
  },
  {
    id: 2,
    title: 'Database Management Systems',
    date: '2026-06-22',
    time: '2:00 PM',
    duration: 90,
    totalQuestions: 40,
    enrolled: 148,
    completed: 0,
    status: 'upcoming'
  },
  {
    id: 3,
    title: 'Web Development Fundamentals',
    date: '2026-06-10',
    time: '11:00 AM',
    duration: 90,
    totalQuestions: 40,
    enrolled: 145,
    completed: 145,
    status: 'completed'
  }
];

const performanceData = [
  { examName: 'DSA', avgScore: 76, passRate: 85 },
  { examName: 'Web Dev', avgScore: 82, passRate: 92 },
  { examName: 'Networks', avgScore: 78, passRate: 88 },
  { examName: 'SE', avgScore: 74, passRate: 82 }
];

const enrollmentTrend = [
  { month: 'Jan', students: 120 },
  { month: 'Feb', students: 135 },
  { month: 'Mar', students: 142 },
  { month: 'Apr', students: 148 },
  { month: 'May', students: 155 },
  { month: 'Jun', students: 150 }
];

export function AdminDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    title: '',
    date: '',
    time: '',
    duration: '',
    totalQuestions: '',
    description: ''
  });

  const handleCreateExam = () => {
    toast.success('Exam Created!', {
      description: `${newExam.title} has been scheduled successfully.`
    });
    setIsCreateDialogOpen(false);
    setNewExam({
      title: '',
      date: '',
      time: '',
      duration: '',
      totalQuestions: '',
      description: ''
    });
  };

  const totalStudents = 150;
  const totalExams = exams.length;
  const activeExams = exams.filter(e => e.status === 'upcoming').length;
  const avgScore = 77;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Header */}
      <nav className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-5 w-5 text-indigo-600" />
              <span className="text-xl font-bold text-indigo-600">ExamGuard Admin</span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                AD
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage exams, monitor students, and analyze performance
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-5 w-5 mr-2" />
                Create New Exam
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Exam</DialogTitle>
                <DialogDescription>
                  Fill in the details to schedule a new examination
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Exam Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Data Structures & Algorithms"
                    value={newExam.title}
                    onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newExam.date}
                      onChange={(e) => setNewExam({...newExam, date: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newExam.time}
                      onChange={(e) => setNewExam({...newExam, time: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="90"
                      value={newExam.duration}
                      onChange={(e) => setNewExam({...newExam, duration: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="questions">Total Questions</Label>
                    <Input
                      id="questions"
                      type="number"
                      placeholder="40"
                      value={newExam.totalQuestions}
                      onChange={(e) => setNewExam({...newExam, totalQuestions: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Exam description and instructions..."
                    value={newExam.description}
                    onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateExam}>Create Exam</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStudents}</div>
              <p className="text-xs text-green-600 mt-1">
                +12 this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Exams
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalExams}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeExams} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Average Score
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgScore}%</div>
              <p className="text-xs text-green-600 mt-1">
                +3% improvement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pass Rate
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Overall success rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="exams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="exams">Exams</TabsTrigger>
            <TabsTrigger value="questions">Question Bank</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-4">
            {exams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{exam.title}</CardTitle>
                      <CardDescription className="mt-2 flex gap-4">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {exam.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {exam.time}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant={exam.status === 'upcoming' ? 'default' : 'secondary'}>
                      {exam.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="text-lg font-bold">{exam.duration} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Questions</p>
                      <p className="text-lg font-bold">{exam.totalQuestions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Enrolled</p>
                      <p className="text-lg font-bold">{exam.enrolled}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-lg font-bold">{exam.completed}</p>
                    </div>
                  </div>
                  {exam.status === 'completed' && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>Completion Rate</span>
                        <span>{Math.round((exam.completed / exam.enrolled) * 100)}%</span>
                      </div>
                      <Progress value={(exam.completed / exam.enrolled) * 100} />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {exam.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Results
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Question Bank Tab */}
          <TabsContent value="questions">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Question Bank</CardTitle>
                  <CardDescription>Manage your exam questions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input placeholder="Search questions..." className="flex-1" />
                      <Select>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="All Subjects" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Subjects</SelectItem>
                          <SelectItem value="dsa">Data Structures</SelectItem>
                          <SelectItem value="web">Web Development</SelectItem>
                          <SelectItem value="db">Databases</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Import
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {[
                        { subject: 'DSA', question: 'What is the time complexity of binary search?', difficulty: 'Medium' },
                        { subject: 'DSA', question: 'Which data structure uses LIFO principle?', difficulty: 'Easy' },
                        { subject: 'Web', question: 'What is the purpose of useState hook?', difficulty: 'Medium' },
                        { subject: 'DB', question: 'Explain ACID properties', difficulty: 'Hard' }
                      ].map((q, idx) => (
                        <div key={idx} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">{q.subject}</Badge>
                                <Badge 
                                  variant={q.difficulty === 'Easy' ? 'default' : q.difficulty === 'Medium' ? 'secondary' : 'destructive'}
                                  className="text-xs"
                                >
                                  {q.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm">{q.question}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
                    <p className="text-2xl font-bold">245</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">By Difficulty</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Easy</span>
                        <span className="font-medium">85</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Medium</span>
                        <span className="font-medium">110</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Hard</span>
                        <span className="font-medium">50</span>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Exam Performance</CardTitle>
                  <CardDescription>Average scores and pass rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="examName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar key="avgScore" dataKey="avgScore" fill="#6366f1" name="Avg Score" radius={[8, 8, 0, 0]} />
                      <Bar key="passRate" dataKey="passRate" fill="#10b981" name="Pass Rate %" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Student Enrollment Trend</CardTitle>
                  <CardDescription>Monthly enrollment statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={enrollmentTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="students" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest exam submissions and student activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { student: 'John Doe', exam: 'Web Development', score: 85, time: '2 hours ago' },
                      { student: 'Jane Smith', exam: 'Data Structures', score: 92, time: '3 hours ago' },
                      { student: 'Mike Johnson', exam: 'Computer Networks', score: 78, time: '5 hours ago' },
                      { student: 'Sarah Williams', exam: 'Software Engineering', score: 88, time: '6 hours ago' }
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                            {activity.student.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{activity.student}</p>
                            <p className="text-sm text-muted-foreground">{activity.exam}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={activity.score >= 80 ? 'default' : 'secondary'}>
                            {activity.score}%
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
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
