import { Router } from 'express';
import db from './db.js';
import { requireAuth, requireRole } from './auth.js';

const router = Router();

// A student's own finished attempts.
router.get('/results', requireAuth, (req, res) => {
  const results = db
    .prepare(
      `SELECT a.id, e.title, a.submitted_at, a.score,
              (SELECT COUNT(*) FROM questions q WHERE q.exam_id = a.exam_id) AS total,
              (SELECT COUNT(*) FROM violations v WHERE v.attempt_id = a.id) AS violations
       FROM attempts a JOIN exams e ON e.id = a.exam_id
       WHERE a.user_id = ? AND a.submitted_at IS NOT NULL
       ORDER BY a.submitted_at DESC`
    )
    .all(req.user.id);
  res.json({ results });
});

// Everything below this line is admin only.
router.use('/admin', requireAuth, requireRole('admin'));

const validExam = (b) =>
  typeof b?.title === 'string' && b.title.trim() !== '' &&
  Number.isInteger(b.duration_min) && b.duration_min > 0;

const validQuestion = (b) =>
  typeof b?.text === 'string' && b.text.trim() !== '' &&
  Array.isArray(b.options) && b.options.length >= 2 && b.options.length <= 6 &&
  b.options.every((o) => typeof o === 'string' && o.trim() !== '') &&
  Number.isInteger(b.correct_index) && b.correct_index >= 0 && b.correct_index < b.options.length;

router.post('/admin/exams', (req, res) => {
  if (!validExam(req.body)) return res.status(400).json({ error: 'Title and a positive duration_min are required' });
  const { title, scheduled_at = null, duration_min, description = null } = req.body;
  const r = db
    .prepare('INSERT INTO exams (title, scheduled_at, duration_min, description) VALUES (?, ?, ?, ?)')
    .run(title.trim(), scheduled_at, duration_min, description);
  res.status(201).json({ id: Number(r.lastInsertRowid) });
});

router.put('/admin/exams/:id', (req, res) => {
  if (!validExam(req.body)) return res.status(400).json({ error: 'Title and a positive duration_min are required' });
  const { title, scheduled_at = null, duration_min, description = null } = req.body;
  const r = db
    .prepare('UPDATE exams SET title = ?, scheduled_at = ?, duration_min = ?, description = ? WHERE id = ?')
    .run(title.trim(), scheduled_at, duration_min, description, Number(req.params.id));
  if (r.changes === 0) return res.status(404).json({ error: 'Exam not found' });
  res.json({ ok: true });
});

router.delete('/admin/exams/:id', (req, res) => {
  const id = Number(req.params.id);
  if (db.prepare('SELECT 1 FROM attempts WHERE exam_id = ?').get(id)) {
    return res.status(409).json({ error: 'This exam has attempts and cannot be deleted' });
  }
  const r = db.prepare('DELETE FROM exams WHERE id = ?').run(id);
  if (r.changes === 0) return res.status(404).json({ error: 'Exam not found' });
  res.json({ ok: true });
});

// Admins see correct answers here; students never do.
router.get('/admin/exams/:id/questions', (req, res) => {
  const questions = db
    .prepare('SELECT id, text, options, correct_index FROM questions WHERE exam_id = ? ORDER BY id')
    .all(Number(req.params.id))
    .map((q) => ({ ...q, options: JSON.parse(q.options) }));
  res.json({ questions });
});

router.post('/admin/exams/:id/questions', (req, res) => {
  const examId = Number(req.params.id);
  if (!db.prepare('SELECT 1 FROM exams WHERE id = ?').get(examId)) return res.status(404).json({ error: 'Exam not found' });
  if (!validQuestion(req.body)) return res.status(400).json({ error: 'Need text, 2-6 options and a valid correct_index' });
  const { text, options, correct_index } = req.body;
  const r = db
    .prepare('INSERT INTO questions (exam_id, text, options, correct_index) VALUES (?, ?, ?, ?)')
    .run(examId, text.trim(), JSON.stringify(options), correct_index);
  res.status(201).json({ id: Number(r.lastInsertRowid) });
});

router.put('/admin/questions/:id', (req, res) => {
  if (!validQuestion(req.body)) return res.status(400).json({ error: 'Need text, 2-6 options and a valid correct_index' });
  const { text, options, correct_index } = req.body;
  const r = db
    .prepare('UPDATE questions SET text = ?, options = ?, correct_index = ? WHERE id = ?')
    .run(text.trim(), JSON.stringify(options), correct_index, Number(req.params.id));
  if (r.changes === 0) return res.status(404).json({ error: 'Question not found' });
  res.json({ ok: true });
});

router.delete('/admin/questions/:id', (req, res) => {
  const r = db.prepare('DELETE FROM questions WHERE id = ?').run(Number(req.params.id));
  if (r.changes === 0) return res.status(404).json({ error: 'Question not found' });
  res.json({ ok: true });
});

router.get('/admin/attempts', (req, res) => {
  const attempts = db
    .prepare(
      `SELECT a.id, u.name AS student, u.email, e.title AS exam, a.started_at, a.submitted_at, a.score,
              (SELECT COUNT(*) FROM questions q WHERE q.exam_id = a.exam_id) AS total,
              (SELECT COUNT(*) FROM violations v WHERE v.attempt_id = a.id) AS violations
       FROM attempts a
       JOIN users u ON u.id = a.user_id
       JOIN exams e ON e.id = a.exam_id
       ORDER BY a.started_at DESC`
    )
    .all();
  res.json({ attempts });
});

router.get('/admin/attempts/:id/violations', (req, res) => {
  const violations = db
    .prepare('SELECT id, type, detail, occurred_at FROM violations WHERE attempt_id = ? ORDER BY occurred_at')
    .all(Number(req.params.id));
  res.json({ violations });
});

export default router;