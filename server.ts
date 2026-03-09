import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("appraisals.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS appraisals (
    id TEXT PRIMARY KEY,
    company_name TEXT,
    status TEXT,
    risk_score INTEGER,
    recommendation TEXT,
    loan_limit TEXT,
    interest_rate TEXT,
    risk_categories TEXT,
    cam_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    input_data TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT,
    action TEXT,
    entity_id TEXT,
    entity_name TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Helper to log actions
  const logAction = (userEmail: string, action: string, entityId: string, entityName: string) => {
    const stmt = db.prepare("INSERT INTO audit_logs (user_email, action, entity_id, entity_name) VALUES (?, ?, ?, ?)");
    stmt.run(userEmail, action, entityId, entityName);
  };

  // API Routes
  app.get("/api/appraisals", (req, res) => {
    const rows = db.prepare("SELECT * FROM appraisals ORDER BY created_at DESC").all();
    const parsedRows = rows.map((row: any) => ({
      ...row,
      risk_categories: row.risk_categories ? JSON.parse(row.risk_categories) : null,
      input_data: row.input_data ? JSON.parse(row.input_data) : null
    }));
    res.json(parsedRows);
  });

  app.get("/api/appraisals/:id", (req, res) => {
    const row: any = db.prepare("SELECT * FROM appraisals WHERE id = ?").get(req.params.id);
    if (row) {
      // Log view action
      logAction(req.headers['x-user-email'] as string || 'system@nexus.ai', 'VIEW_APPRAISAL', req.params.id, row.company_name);
      res.json({
        ...row,
        risk_categories: row.risk_categories ? JSON.parse(row.risk_categories) : null,
        input_data: row.input_data ? JSON.parse(row.input_data) : null
      });
    } else {
      res.status(404).json({ error: "Appraisal not found" });
    }
  });

  app.post("/api/appraisals", (req, res) => {
    const { id, company_name, status, risk_score, recommendation, loan_limit, interest_rate, risk_categories, cam_content, input_data } = req.body;
    const stmt = db.prepare(`
      INSERT INTO appraisals (id, company_name, status, risk_score, recommendation, loan_limit, interest_rate, risk_categories, cam_content, input_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id, 
      company_name, 
      status, 
      risk_score, 
      recommendation, 
      loan_limit, 
      interest_rate, 
      JSON.stringify(risk_categories), 
      cam_content, 
      JSON.stringify(input_data)
    );
    
    // Log create action
    logAction(req.headers['x-user-email'] as string || 'system@nexus.ai', 'CREATE_APPRAISAL', id, company_name);
    
    res.json({ success: true });
  });

  app.delete("/api/appraisals/:id", (req, res) => {
    const row = db.prepare("SELECT company_name FROM appraisals WHERE id = ?").get(req.params.id);
    if (row) {
      db.prepare("DELETE FROM appraisals WHERE id = ?").run(req.params.id);
      // Log delete action
      logAction(req.headers['x-user-email'] as string || 'system@nexus.ai', 'DELETE_APPRAISAL', req.params.id, row.company_name);
    }
    res.json({ success: true });
  });

  app.get("/api/audit-logs", (req, res) => {
    const rows = db.prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC").all();
    res.json(rows);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
