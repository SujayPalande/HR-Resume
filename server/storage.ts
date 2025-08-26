import { type Resume, type InsertResume } from "@shared/schema";
import pool from "./db";

export interface IStorage {
  getResume(id: string): Promise<Resume | undefined>;
  getAllResumes(): Promise<Resume[]>;
  createResume(resume: InsertResume): Promise<Resume>;
  deleteResume(id: string): Promise<void>;
  searchResumes(query: string): Promise<Resume[]>;
}

export class PostgresStorage implements IStorage {
  async getResume(id: string): Promise<Resume | undefined> {
    const result = await pool.query('SELECT * FROM resumes WHERE id = $1', [id]);
    return result.rows[0];
  }

  async getAllResumes(): Promise<Resume[]> {
    const result = await pool.query('SELECT * FROM resumes ORDER BY uploaded_at DESC');
    return result.rows;
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const result = await pool.query(
      `INSERT INTO resumes (file_name, original_name, file_size, file_type, candidate_name, position, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        insertResume.fileName,
        insertResume.originalName,
        insertResume.fileSize,
        insertResume.fileType,
        insertResume.candidateName ?? null,
        insertResume.position ?? null,
        insertResume.filePath
      ]
    );
    return result.rows[0];
  }

  async deleteResume(id: string): Promise<void> {
    await pool.query('DELETE FROM resumes WHERE id = $1', [id]);
  }

  async searchResumes(query: string): Promise<Resume[]> {
    const lowerQuery = `%${query.toLowerCase()}%`;
    const result = await pool.query(
      `SELECT * FROM resumes WHERE 
        LOWER(original_name) LIKE $1 OR 
        LOWER(COALESCE(candidate_name, '')) LIKE $1 OR 
        LOWER(COALESCE(position, '')) LIKE $1
       ORDER BY uploaded_at DESC`,
      [lowerQuery]
    );
    return result.rows;
  }
}

export const storage = new PostgresStorage();
