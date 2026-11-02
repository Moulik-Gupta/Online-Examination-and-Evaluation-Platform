import { Link } from 'react-router';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Shield, Video, Clock, BarChart3, CheckCircle2, Lock, Users, FileText } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-indigo-400" />
            <span className="text-2xl font-bold text-white">ExamGuard</span>
          </div>
          <div className="flex gap-4">
            <Link to="/student">
              <Button variant="ghost" className="text-white hover:text-indigo-300">
                Student Portal
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" className="border-indigo-400 text-white hover:bg-indigo-900">
                Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Secure Online Examination Platform
            </h1>
            <p className="text-xl text-indigo-200 mb-8">
              Conduct exams with confidence using our advanced proctoring technology, 
              automated evaluation, and comprehensive analytics.
            </p>
            <div className="flex gap-4">
              <Link to="/student">
                <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Take Exam
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Create Exam
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex gap-8">
              <div>
                <div className="text-3xl font-bold text-white">10K+</div>
                <div className="text-indigo-300">Exams Conducted</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">99.9%</div>
                <div className="text-indigo-300">Uptime</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">50K+</div>
                <div className="text-indigo-300">Students</div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-2xl opacity-30"></div>
            <ImageWithFallback 
              src="https://images.unsplash.com/photo-1513258496099-48168024aec0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwc3R1ZHlpbmclMjBjb21wdXRlcnxlbnwxfHx8fDE3ODE2MjAwNzd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Student taking online exam"
              className="relative rounded-2xl shadow-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Powerful Features
        </h2>
        <p className="text-xl text-indigo-200 text-center mb-12">
          Everything you need for secure and efficient online examinations
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all">
            <CardHeader>
              <Clock className="h-12 w-12 text-indigo-400 mb-4" />
              <CardTitle className="text-white">Timed Exams</CardTitle>
              <CardDescription className="text-indigo-200">
                Automatic timers with customizable duration and warnings
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all">
            <CardHeader>
              <Video className="h-12 w-12 text-indigo-400 mb-4" />
              <CardTitle className="text-white">AI Proctoring</CardTitle>
              <CardDescription className="text-indigo-200">
                Real-time webcam monitoring and suspicious activity detection
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all">
            <CardHeader>
              <CheckCircle2 className="h-12 w-12 text-indigo-400 mb-4" />
              <CardTitle className="text-white">Auto Evaluation</CardTitle>
              <CardDescription className="text-indigo-200">
                Instant grading for MCQs and automated scoring
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 transition-all">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-indigo-400 mb-4" />
              <CardTitle className="text-white">Analytics</CardTitle>
              <CardDescription className="text-indigo-200">
                Comprehensive reports and performance insights
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">1. Create Exam</h3>
            <p className="text-indigo-200">
              Build question banks and configure exam settings
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">2. Invite Students</h3>
            <p className="text-indigo-200">
              Share exam links with students via email or portal
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">3. Monitor Live</h3>
            <p className="text-indigo-200">
              AI proctoring tracks and flags suspicious behavior
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">4. View Results</h3>
            <p className="text-indigo-200">
              Get instant results with detailed analytics
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-none">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of institutions using ExamGuard for secure online assessments
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/student">
                <Button size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50">
                  Start as Student
                </Button>
              </Link>
              <Link to="/admin">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Create as Admin
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-indigo-400" />
              <span className="text-white">ExamGuard © 2026</span>
            </div>
            <div className="text-indigo-300">
              Secure • Reliable • Advanced
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
