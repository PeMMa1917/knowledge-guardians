import { studentName } from '../shared/studentNames.mjs';
import { verifier } from './classroom.mjs';

/** School-side provisioning, before an approved class membership is assigned. */
export async function provisionStudent(db, { id, login, display, password }) {
  const username = studentName(login, 'login'),
    label = studentName(display, 'display');
  if (!username || !label) throw new Error('Choose a school-appropriate username and display name.');
  const salt = crypto.randomUUID();
  await db
    .prepare("INSERT INTO accounts(id,login,display,role,salt,verifier) VALUES (?,?,?,'student',?,?)")
    .bind(id, username, label, salt, await verifier(password, salt))
    .run();
}
