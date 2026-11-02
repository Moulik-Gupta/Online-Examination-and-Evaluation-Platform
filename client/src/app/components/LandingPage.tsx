import { Link } from 'react-router';
import { Shield, Camera, Maximize, Eye, Clock, BarChart3, Lock, ArrowRight } from 'lucide-react';

const checks = [
  { icon: Camera, title: 'Face check', text: 'The webcam checks for one face in frame. No face, or more than one, for a few seconds is logged.' },
  { icon: Maximize, title: 'Fullscreen', text: 'Leaving fullscreen is logged as a warning, with the time.' },
  { icon: Eye, title: 'Tab-switch detection', text: 'Switching tabs or windows is logged with a time.' },
  { icon: Lock, title: 'Copy and paste blocked', text: 'Copy, paste and right-click are blocked during the exam.' },
  { icon: Clock, title: 'Auto-submit', text: 'Five warnings, or the timer running out, submits the exam.' },
  { icon: BarChart3, title: 'Review for admins', text: 'Scores and a timestamped warning log for every attempt.' },
];

const log = [
  { time: '10:09:41', event: 'Switched tab', level: 'warn' },
  { time: '10:15:03', event: 'Face not visible', level: 'warn' },
  { time: '10:21:58', event: 'Left fullscreen', level: 'warn' },
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
              Online exams with proctoring built in.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-neutral-400">
              CheatBlock watches the webcam, fullscreen and browser during an exam, and keeps a
              timestamped log of anything that looks wrong, for a person to review.
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
              Every warning is saved with a time so admins can review it later.
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
            <p className="mt-10 max-w-3xl text-sm text-neutral-400">
              Browser proctoring is a deterrent and an evidence log, not a guarantee. It cannot see a
              second device or a person outside the camera, and it can flag honest mistakes such as
              poor light. The log is for a person to review, not proof of cheating.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-8 lg:px-12 py-8 text-center text-sm text-neutral-500">
        CheatBlock. Built by Moulik Gupta and Shubh Verma.
      </footer>
    </div>
  );
}