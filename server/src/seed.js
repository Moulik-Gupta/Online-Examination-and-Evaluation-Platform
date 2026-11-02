import db from './db.js';
import { hashPassword } from './auth.js';

const existing = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
if (existing > 0) {
  console.log('Database already has data. To start fresh, stop the server, delete cheatblock.db, and run again.');
  process.exit(0);
}

const addUser = db.prepare(
  'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
);
addUser.run('Admin', 'admin@cheatblock.local', hashPassword('admin123'), 'admin');
addUser.run('Student', 'student@cheatblock.local', hashPassword('student123'), 'student');

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

console.log('Seeded.');
console.log('  admin:   admin@cheatblock.local / admin123');
console.log('  student: student@cheatblock.local / student123');