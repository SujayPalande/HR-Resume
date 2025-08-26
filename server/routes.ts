import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertResumeSchema } from "@shared/schema";
import multer, { type MulterError } from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Extend Express Request to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
      cb(null, uploadDir);
    },
    filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all resumes
  app.get("/api/resumes", async (req, res) => {
    try {
      const resumes = await storage.getAllResumes();
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  // Get specific resume
  app.get("/api/resumes/:id", async (req, res) => {
    try {
      const resume = await storage.getResume(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      res.json(resume);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  // Upload resume
  app.post("/api/resumes/upload", upload.single('resume'), async (req: MulterRequest, res) => {
    try {
      console.log('Upload route called');
      if (!req.file) {
        console.error('No file uploaded');
        return res.status(400).json({ message: "No file uploaded" });
      }

      const resumeData = {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileSize: req.file.size,
        fileType: req.file.mimetype,
        candidateName: req.body.candidateName || null,
        position: req.body.position || null,
        filePath: req.file.path,
      };
      console.log('Resume data:', resumeData);

      let validatedData;
      try {
        validatedData = insertResumeSchema.parse(resumeData);
      } catch (zodError) {
        console.error('Zod validation error:', zodError);
        const zErr = zodError instanceof z.ZodError ? zodError : undefined;
        return res.status(400).json({ message: "Invalid resume data", errors: zErr ? zErr.errors : zodError });
      }

      let resume;
      try {
        resume = await storage.createResume(validatedData);
        console.log('Resume inserted:', resume);
      } catch (dbError) {
        console.error('DB Insert Error:', dbError);
        return res.status(500).json({ message: "Database insert failed", error: dbError instanceof Error ? dbError.message : String(dbError) });
      }
      res.status(201).json(resume);
    } catch (error) {
      console.error('General upload error:', error);
      res.status(500).json({ message: "Failed to upload resume", error: error instanceof Error ? error.message : String(error) });
    }
  });

  // Delete resume
  app.delete("/api/resumes/:id", async (req, res) => {
    try {
      const resume = await storage.getResume(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }

      // Delete file from filesystem
      if (fs.existsSync(resume.filePath)) {
        fs.unlinkSync(resume.filePath);
      }

      await storage.deleteResume(req.params.id);
      res.json({ message: "Resume deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  // Search resumes
  app.get("/api/resumes/search/:query", async (req, res) => {
    try {
      const resumes = await storage.searchResumes(req.params.query);
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to search resumes" });
    }
  });

  // Serve uploaded files
  app.get("/api/files/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }

    res.sendFile(filePath);
  });

  const httpServer = createServer(app);
  return httpServer;
}
