import { pathToFileURL } from 'node:url';
import db from './db.js';
import { hashPassword } from './auth.js';

// Creates the demo users and exam when the database is empty. Returns true if it seeded.
export function seedIfEmpty() {
  const existing = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (existing > 0) return false;

  // Local development falls back to simple passwords. In production they must be set.
  const isProd = process.env.NODE_ENV === 'production';
  const adminPassword = process.env.ADMIN_PASSWORD || (isProd ? '' : 'admin123');
  const studentPassword = process.env.STUDENT_PASSWORD || (isProd ? '' : 'student123');
  if (!adminPassword || !studentPassword) {
    throw new Error('Set ADMIN_PASSWORD and STUDENT_PASSWORD before running in production.');
  }

  const addUser = db.prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  );
  addUser.run('Admin', 'admin@cheatblock.local', hashPassword(adminPassword), 'admin');
  addUser.run('Student', 'student@cheatblock.local', hashPassword(studentPassword), 'student');

  const exam = db
    .prepare(
      'INSERT INTO exams (title, scheduled_at, duration_min, description) VALUES (?, ?, ?, ?)'
    )
    .run(
      'Data Structures & Algorithms',
      new Date().toISOString(),
      120,
      'Core concepts: complexity, stacks, sorting and trees.'
    );
  const examId = Number(exam.lastInsertRowid);

  const questions = [
    ['What is the time complexity of binary search?', ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], 1],
    ['Which data structure uses LIFO principle?', ['Queue', 'Stack', 'Array', 'Linked List'], 1],
    ['What is the worst-case time complexity of Quick Sort?', ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'], 1],
    ['Which traversal method uses a queue?', ['Pre-order', 'In-order', 'Post-order', 'Level-order'], 3],
    [
      'What is a perfect binary tree?',
      [
        'A tree where all nodes have two children',
        'A tree where all leaf nodes are at the same level',
        'A tree with maximum nodes at each level',
        'Both B and C',
      ],
      3,
    ],
  ];

  const addQuestion = db.prepare(
    'INSERT INTO questions (exam_id, text, options, correct_index) VALUES (?, ?, ?, ?)'
  );
  for (const [text, options, correct] of questions) {
    addQuestion.run(examId, text, JSON.stringify(options), correct);
  }

  console.log('Seeded demo data.');
  return true;
}

// Run directly with "pnpm seed".
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!seedIfEmpty()) {
    console.log('Database already has data. To start fresh, stop the server, delete cheatblock.db, and run again.');
  } else if (process.env.NODE_ENV !== 'production') {
    console.log('  admin:   admin@cheatblock.local / admin123');
    console.log('  student: student@cheatblock.local / student123');
  }
}