import pool from './database';
import { User } from './models';

export async function getUserById(id: number): Promise<User | null> {
  const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return res.rows[0] || null;
}

export async function getUsers() {
  const { rows } = await pool.query('SELECT * FROM users');
  return rows;
}

export async function addUser(user: User) {
  const { username, email } = user;
  const query = `
      INSERT INTO users (username, email)
      VALUES ($1, $2)
      RETURNING *;
    `;
  const values = [username, email];

  try {
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function deleteUser(id: number): Promise<boolean> {
  try {
    const res = await pool.query('DELETE FROM users WHERE id = $1', [id]);
    // If res.rowCount is 1, it means one row was affected (i.e., one user was deleted)
    return res.rowCount === 1;
  } catch (err) {
    console.error(err);
    throw err; // Re-throw the error for the caller to handle
  }
}
