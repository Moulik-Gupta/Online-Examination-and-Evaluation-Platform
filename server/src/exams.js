import { Router } from 'express';
import db from './db.js';
import { requireAuth, requireRole } from './auth.js';

const router = Router();

const VIOLATION_TYPES = [
  'tab_switch',
  'window_blur',
  'fullscreen_exit',
  'camera_lost',
  'no_face',
  'multiple_faces',
];

// Correct answers are never selected here, so they can never be sent to the browser.
router.get('/exams', requireAuth, (req, res) => {
  const exams = db
    .prepare(
      `SELECT e.id, e.title, e.scheduled_at, e.duration_min, e.description,
              (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) AS question_count
       FROM exams e ORDER BY e.id`
    )
    .all();
  res.json({ exams });
});

router.get('/exams/:id', requireAuth, (req, res) => {
  const exam = db
    .prepare('SELECT id, title, scheduled_at, duration_min, description FROM exams WHERE id = ?')
    .get(Number(req.params.id));
  if (!exam) return res.status(404).json({ error: 'Exam not found' });

  const questions = db
    .prepare('SELECT id, text, options FROM questions WHERE exam_id = ? ORDER BY id')
    .all(exam.id)
    .map((q) => ({ id: q.id, text: q.text, options: JSON.parse(q.options) }));
  res.json({ exam, questions });
});

// Finds an attempt that belongs to the signed-in student and is not submitted yet.
function getOwnOpenAttempt(req, res) {
  const attempt = db
    .prepare('SELECT * FROM attempts WHERE id = ? AND user_id = ?')
    .get(Number(req.params.id), req.user.id);
  if (!attempt) {
    res.status(404).json({ error: 'Attempt not found' });
    return null;
  }
  if (attempt.submitted_at) {
    res.status(409).json({ error: 'Attempt already submitted' });
    return null;
  }
  return attempt;
}

router.post('/attempts', requireAuth, requireRole('student'), (req, res) => {
  const examId = Number(req.body?.examId);
  if (!Number.isInteger(examId)) return res.status(400).json({ error: 'examId is required' });
  if (!db.prepare('SELECT id FROM exams WHERE id = ?').get(examId)) {
    return res.status(404).json({ error: 'Exam not found' });
  }

  // Resume an unfinished attempt instead of creating a second one.
  const open = db
    .prepare('SELECT id, started_at FROM attempts WHERE user_id = ? AND exam_id = ? AND submitted_at IS NULL')
    .get(req.user.id, examId);
  if (open) return res.json({ attemptId: open.id, startedAt: open.started_at });

  const startedAt = new Date().toISOString();
  const result = db
    .prepare('INSERT INTO attempts (user_id, exam_id, started_at) VALUES (?, ?, ?)')
    .run(req.user.id, examId, startedAt);
  res.status(201).json({ attemptId: Number(result.lastInsertRowid), startedAt });
});

router.post('/attempts/:id/violations', requireAuth, requireRole('student'), (req, res) => {
  const attempt = getOwnOpenAttempt(req, res);
  if (!attempt) return;

  const { type, detail } = req.body ?? {};
  if (!VIOLATION_TYPES.includes(type)) {
    return res.status(400).json({ error: 'Unknown violation type' });
  }
  db.prepare('INSERT INTO violations (attempt_id, type, detail, occurred_at) VALUES (?, ?, ?, ?)').run(
    attempt.id,
    type,
    typeof detail === 'string' ? detail.slice(0, 200) : null,
    new Date().toISOString()
  );
  res.status(201).json({ ok: true });
});

// The server scores the exam. The browser's own score is never used.
router.post('/attempts/:id/submit', requireAuth, requireRole('student'), (req, res) => {
  const attempt = getOwnOpenAttempt(req, res);
  if (!attempt) return;

  const given = req.body?.answers ?? {};
  const questions = db
    .prepare('SELECT id, correct_index FROM questions WHERE exam_id = ?')
    .all(attempt.exam_id);
  const saveAnswer = db.prepare(
    'INSERT OR REPLACE INTO answers (attempt_id, question_id, chosen_index) VALUES (?, ?, ?)'
  );

  let score = 0;
  db.exec('BEGIN');
  try {
    for (const q of questions) {
      const chosen = given[q.id];
      if (Number.isInteger(chosen)) {
        saveAnswer.run(attempt.id, q.id, chosen);
        if (chosen === q.correct_index) score++;
      }
    }
    db.prepare('UPDATE attempts SET submitted_at = ?, score = ? WHERE id = ?').run(
      new Date().toISOString(),
      score,
      attempt.id
    );
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
  res.json({ score, total: questions.length });
});

export default router;