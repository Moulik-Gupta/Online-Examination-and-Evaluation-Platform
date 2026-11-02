import { Link } from 'react-router';
import { Shield, Camera, Maximize, Eye, Clock, BarChart3, Lock, ArrowRight } from 'lucide-react';

const checks = [
  { icon: Camera, title: 'Face check', text: 'The webcam confirms exactly one person is in frame for the whole exam.' },
  { icon: Maximize, title: 'Fullscreen lock', text: 'Leaving fullscreen is logged as a violation the moment it happens.' },
  { icon: Eye, title: 'Tab-switch detection', text: 'Switching tabs or windows is caught and timestamped.' },
  { icon: Lock, title: 'Copy and paste blocked', text: 'Copy, paste and right-click are disabled during the exam.' },
  { icon: Clock, title: 'Auto-submit', text: 'Too many violations, or the timer running out, submits the exam.' },
  { icon: BarChart3, title: 'Reports for admins', text: 'Scores and a per-student violation log, ready to review.' },
];

const log = [
  { time: '10:02:14', event: 'Exam started', level: 'ok' },
  { time: '10:09:41', event: 'Tab switch detected', level: 'warn' },
  { time: '10:15:03', event: 'No face in frame', level: 'warn' },
  { time: '10:15:09', event: 'Face restored', level: 'ok' },
  { time: '10:21:58', event: 'Fullscreen exited', level: 'bad' },
];

const dot: Record<string, string> = {
  ok: 'bg-emerald-400',
  warn: 'bg-amber-400',
  bad: 'bg-red-500',
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="mx-auto flex max-w-[1600px] items-center justify-between px-8 lg:px-12 py-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="h-6 w-6 text-emerald-400" />
          CheatBlock
        </div>
        <nav className="flex items-center gap-6 text-sm text-neutral-400">
          <Link to="/student" className="hover:text-white">Student</Link>
          <Link to="/admin" className="hover:text-white">Admin</Link>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-[1600px] items-center gap-12 px-8 lg:px-12 pb-20 pt-16 lg:grid-cols-2">
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-widest text-emerald-400">
              Online exam proctoring
            </p>
            <h1 className="text-5xl font-bold leading-tight sm:text-6xl">
              Exams you can trust. Cheating, blocked.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-neutral-400">
              CheatBlock watches the webcam, the screen and the browser during an exam,
              and keeps a timestamped record of everything that looks wrong.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/student"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-8 lg:px-12 py-3 font-semibold text-neutral-950 hover:bg-emerald-300"
              >
                Start an exam <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/admin"
                className="inline-flex items-center rounded-lg border border-white/20 px-8 lg:px-12 py-3 font-semibold hover:bg-white/10"
              >
                Admin dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-neutral-900 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="font-medium">Session log</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-neutral-400">
                Sample
              </span>
            </div>
            <ul className="space-y-3">
              {log.map((row) => (
                <li key={row.time} className="flex items-center gap-3 rounded-lg bg-neutral-950 px-4 py-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${dot[row.level]}`} />
                  <span className="font-mono text-sm text-neutral-500">{row.time}</span>
                  <span className="text-sm">{row.event}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-neutral-500">
              Every violation is saved with a time so admins can review it later.
            </p>
          </div>
        </section>

        <section className="border-t border-white/10 bg-neutral-900/50">
          <div className="mx-auto max-w-[1600px] px-8 lg:px-12 py-20">
            <h2 className="text-3xl font-bold">What it checks</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {checks.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-xl border border-white/10 bg-neutral-950 p-6">
                  <Icon className="mb-4 h-6 w-6 text-emerald-400" />
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-sm text-neutral-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-8 lg:px-12 py-8 text-center text-sm text-neutral-500">
        CheatBlock. Built by Moulik Gupta and Shubh Verma.
      </footer>
    </div>
  );
}