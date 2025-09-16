import express from 'express';
import { fileURLToPath } from 'url';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import mysql from 'mysql2/promise';
import { Connector } from '@google-cloud/cloud-sql-connector';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
dotenv.config();

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup multer for temp uploads
const tempDir = path.join(__dirname, '..', 'uploads', 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
const upload = multer({ dest: tempDir });

import { execFile } from 'child_process';

// In-memory store for tokens (replace with DB for production)
const tempImages = {};

const app = express();
app.use(cors());
app.use(express.json());

// Get receta info by ID (for RecetaView)
app.get('/api/receta/:id', async (req, res) => {
  const recetaId = req.params.id;
  if (!recetaId) return res.status(400).json({ error: 'ID de receta requerido.' });
  try {
    // Get receta, patient, doctor info
    const [recetaRows] = await pool.query(
      `SELECT r.ID_Receta, r.Fecha_Receta, r.Hash_Receta, r.Receta_Detalle,
              p.ID_Paciente, p.Nombre_Paciente, p.Correo_Paciente,
              m.ID_Medico, m.Nombre_Medico, m.Correo_Medico,
              CASE WHEN d.ID_Receta IS NOT NULL THEN 'Dispensada' ELSE 'Pendiente' END AS status
       FROM Receta r
       JOIN Paciente p ON r.ID_Paciente = p.ID_Paciente
       JOIN Medico m ON r.ID_Medico = m.ID_Medico
       LEFT JOIN Dispensado d ON r.ID_Receta = d.ID_Receta
       WHERE r.ID_Receta = ?`,
      [recetaId]
    );
    if (recetaRows.length === 0) return res.status(404).json({ error: 'Receta no encontrada.' });
    const receta = recetaRows[0];
    // Get medications
    const [medRows] = await pool.query(
      `SELECT rm.Dosis, med.Nombre_Medicina
       FROM Receta_Medicina rm
       JOIN Medicina med ON rm.Codigo_Medicina = med.ID_Medicina
       WHERE rm.ID_Receta = ?`,
      [recetaId]
    );
    receta.medicamentos = medRows;
    // Parse Receta_Detalle JSON if present
    if (receta.Receta_Detalle) {
      try {
        receta.recetaDetalle = JSON.parse(receta.Receta_Detalle);
      } catch {}
    }
    res.json(receta);
  } catch (err) {
    console.error('Error obteniendo receta:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Validate receta authenticity on blockchain
app.get('/api/receta/blockchain/:id', async (req, res) => {
  const recetaId = req.params.id;
  if (!recetaId) return res.status(400).json({ error: 'ID de receta requerido.' });
  try {
    const pythonPath = 'python';
    const scriptPath = path.join(__dirname, '..', 'PruebaBlockchain', 'Get.py');
    execFile(pythonPath, [scriptPath, recetaId], (error, stdout, stderr) => {
      if (error) {
        console.error('Blockchain error:', error, stderr);
        return res.status(500).json({ error: 'Blockchain error', details: stderr });
      }
      // Parse stdout for contentHash and signature
  const contentHashMatch = stdout.match(/contentHash\s*:\s*(0x)?([0-9a-fA-F]{64})/);
const signatureMatch = stdout.match(/signature\s*:\s*(0x)?([0-9a-fA-F]{64})/);
const result = {
  contentHash: contentHashMatch ? '0x' + contentHashMatch[2] : null,
  signature: signatureMatch ? '0x' + signatureMatch[2] : null,
  raw: stdout
};
      console.log('Blockchain result:', result);
      res.json(result);
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
    console.log(err);
  }
});

// Mark receta as dispensada (validated/dispensed)
app.post('/api/receta/dispensar', async (req, res) => {
  const { farmaciaId, recetaId } = req.body;
  if (!farmaciaId || !recetaId) {
    return res.status(400).json({ error: 'farmaciaId y recetaId requeridos.' });
  }
  try {
  const fecha = new Date().toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS
    await pool.query(
      'INSERT INTO Dispensado (ID_Farmacia, ID_Receta, Fecha_Dispensado) VALUES (?, ?, ?)',
      [farmaciaId, recetaId, fecha]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get multiple recetas by array of IDs (for shared access)
app.post('/api/recetas-shared', async (req, res) => {
  const { receta_ids } = req.body;
  if (!Array.isArray(receta_ids) || receta_ids.length === 0) {
    return res.status(400).json({ error: 'receta_ids array requerido.' });
  }
  try {
    const recetas = [];
    for (const recetaId of receta_ids) {
      // Get receta, patient, doctor info
      const [recetaRows] = await pool.query(
        `SELECT r.ID_Receta, r.Fecha_Receta, r.Hash_Receta, r.Receta_Detalle,
                p.ID_Paciente, p.Nombre_Paciente, p.Correo_Paciente,
                m.ID_Medico, m.Nombre_Medico, m.Correo_Medico, m.Llave_Publica_Medico,
                CASE WHEN d.ID_Receta IS NOT NULL THEN 'Dispensada' ELSE 'Pendiente' END AS status
         FROM Receta r
         JOIN Paciente p ON r.ID_Paciente = p.ID_Paciente
         JOIN Medico m ON r.ID_Medico = m.ID_Medico
         LEFT JOIN Dispensado d ON r.ID_Receta = d.ID_Receta
         WHERE r.ID_Receta = ?`,
        [recetaId]
      );
      if (recetaRows.length === 0) continue;
      const receta = recetaRows[0];
      // Get medications
      const [medRows] = await pool.query(
        `SELECT rm.Dosis, med.Nombre_Medicina
         FROM Receta_Medicina rm
         JOIN Medicina med ON rm.Codigo_Medicina = med.ID_Medicina
         WHERE rm.ID_Receta = ?`,
        [recetaId]
      );
      receta.medicamentos = medRows;
      // Parse Receta_Detalle JSON if present
      if (receta.Receta_Detalle) {
        try {
          receta.recetaDetalle = JSON.parse(receta.Receta_Detalle);
        } catch {}
      }
      recetas.push(receta);
    }
    res.json(recetas);
  } catch (err) {
    console.error('Error obteniendo recetas compartidas:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Get medico info by usuarioId
// Get patient info by usuarioId
// Get pharmacy info by ID_Farmacia or ID_Usuario
app.get('/api/farmacias', async (req, res) => {
  const farmaciaId = req.query.id;
  const usuarioId = req.query.usuarioId;
  if (!farmaciaId && !usuarioId) return res.status(400).json({ error: 'id o usuarioId requerido.' });
  try {
    let query = 'SELECT * FROM Farmacia';
    let params = [];
    if (farmaciaId) {
      query += ' WHERE ID_Farmacia = ?';
      params = [farmaciaId];
    } else if (usuarioId) {
      query += ' WHERE ID_Usuario = ?';
      params = [usuarioId];
    }
    const [rows] = await pool.query(query, params);
    if (rows.length === 0) return res.status(404).json({ error: 'Farmacia no encontrada.' });
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo información de la farmacia:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});
app.get('/api/paciente/info', async (req, res) => {
  const usuarioId = req.query.usuarioId;
  if (!usuarioId) return res.status(400).json({ error: 'usuarioId requerido.' });
  try {
    const [rows] = await pool.query(
      'SELECT ID_Paciente, Nombre_Paciente, Correo_Paciente, Telefono_Paciente FROM Paciente WHERE ID_Usuario = ?',
      [usuarioId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Paciente no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error obteniendo información del paciente:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// Get Recetas information
app.get('/api/recetas-list', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT   r.ID_Receta AS Receta_ID_Receta,
      r.*, 
      p.*, 
      m.*,
      d.ID_Receta AS dispensado_receta, 
      d.*, 
      f.*, CASE WHEN d.ID_Receta IS NOT NULL THEN 'Dispensada' ELSE 'Pendiente' END AS status
       FROM Receta r
       JOIN Paciente p ON r.ID_Paciente = p.ID_Paciente
       JOIN Medico m ON r.ID_Medico = m.ID_Medico
       LEFT JOIN Dispensado d ON r.ID_Receta = d.ID_Receta
       LEFT JOIN Farmacia f ON d.ID_Farmacia = f.ID_Farmacia
       ORDER BY r.Fecha_Receta DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('Error obteniendo recetas:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});



app.get('/api/medico/info', async (req, res) => {
  const usuarioId = req.query.usuarioId;
  if (!usuarioId) return res.status(400).json({ error: 'usuarioId requerido.' });
  try {
    const [rows] = await pool.query(
      'SELECT ID_Medico, Nombre_Medico, Correo_Medico, Telefono_Medico, Llave_Publica_Medico FROM Medico WHERE ID_Usuario = ?',
      [usuarioId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Médico no encontrado.' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error obteniendo información del médico:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// fetch medico list
app.get('/api/medico-list', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Medico'
    );
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error('Error obteniendo información del médico:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// fetch farmacia list
app.get('/api/farmacia-list', async (req,res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Farmacia'
    );
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error('Error obteniendo información de la farmacia:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// List active shared accesses
app.get('/api/shared-access', async (req, res) => {
  try {
    const now = new Date();
    const userId = req.query.user_id;
    let query = 'SELECT id, recipient_name AS name, recipient_type AS type, UNIX_TIMESTAMP(expires_at)*1000 AS expiresAt FROM shared_access WHERE expires_at > ?';
    let params = [now];
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }
    console.log('Shared access query:', query, params); // Debug log
    const [rows] = await db.query(query, params);
    res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error('Error in /api/shared-access:', err);
    res.json([]); // Always return an array, even on error
  }
});

// Revoke shared access by id
app.delete('/api/shared-access/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM shared_access WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Access not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al revocar acceso' });
  }
});

// Save new shared access
app.post('/api/shared-access', async (req, res) => {
  console.log('POST /api/shared-access called', req.body);
  const { user_id, recipient_name, recipient_type, expires_at, receta_ids } = req.body;
  if (!user_id || !recipient_name || !recipient_type || !expires_at || !receta_ids || !Array.isArray(receta_ids) || receta_ids.length === 0) {
    return res.status(400).json({ error: 'Missing required fields or receta_ids.' });
  }
  try {
    const [result] = await db.query(
      'INSERT INTO shared_access (user_id, recipient_name, recipient_type, expires_at, receta_ids) VALUES (?, ?, ?, FROM_UNIXTIME(? / 1000), ?)',
      [user_id, recipient_name, recipient_type, expires_at, JSON.stringify(receta_ids)]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar acceso compartido' });
  }
});

// Upload temporary image
app.post('/api/upload-temporary-image', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });
  // Save file with original extension
  const ext = path.extname(req.file.originalname);
  const newFilename = req.file.filename + ext;
  const oldPath = path.join(tempDir, req.file.filename);
  const newPath = path.join(tempDir, newFilename);
  fs.renameSync(oldPath, newPath);
  // Generate token and expiration (e.g., 10 min)
  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = Date.now() + 10 * 60 * 1000;
  tempImages[token] = {
    filename: newFilename,
    originalname: req.file.originalname,
    expiresAt
  };
  res.json({ token, expiresAt, url: `/api/temp-image/${token}` });
});

// Serve temporary image
app.get('/api/temp-image/:token', (req, res) => {
  const { token } = req.params;
  const entry = tempImages[token];
  if (!entry) return res.status(404).json({ error: 'Invalid or expired token.' });
  if (Date.now() > entry.expiresAt) {
    // Delete file and entry
    fs.unlink(path.join(tempDir, entry.filename), () => {});
    delete tempImages[token];
    return res.status(410).json({ error: 'Token expired.' });
  }
  const filePath = path.join(tempDir, entry.filename);
  const ext = path.extname(entry.originalname).toLowerCase();
  let mimeType = 'application/octet-stream';
  if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
  else if (ext === '.png') mimeType = 'image/png';
  else if (ext === '.gif') mimeType = 'image/gif';
  else if (ext === '.bmp') mimeType = 'image/bmp';
  else if (ext === '.webp') mimeType = 'image/webp';
  res.setHeader('Content-Type', mimeType);
  res.sendFile(filePath);
});

// Use Cloud SQL Connector for secure connection
const connector = new Connector();
let clientOpts = {};
let pool;
let db;
async function setupDb() {
  clientOpts = await connector.getOptions({
    instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME, // e.g. 'project:region:instance'
    ipType: 'PUBLIC',
    driver: 'mysql'
  });
  pool = mysql.createPool({
    ...clientOpts,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  db = pool;
}
setupDb();

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos.' });
  }
  try {
    const [rows] = await pool.query(
      'SELECT * FROM Usuario WHERE Usuario = ? AND Contrasena = ?',
      [username, password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas.' });
    }
    // Update last activity for doctor if applicable
    const user = rows[0];
    if (user.Rol === 'medico') {
      await pool.query('UPDATE Medico SET UltimaActividad = NOW() WHERE ID_Usuario = ?', [user.ID_Usuario]);
    }
    // Opcional: no enviar la contraseña de vuelta
    const { Contrasena, ...userData } = user;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Change password endpoint
app.post('/api/cambiar-contrasena', async (req, res) => {
  const { usuarioId, contrasenaActual, contrasenaNueva } = req.body;
  if (!usuarioId || !contrasenaActual || !contrasenaNueva) {
    return res.status(400).json({ error: 'usuarioId, contraseña actual y nueva requeridos.' });
  }
  try {
    // Get current password
    const [rows] = await pool.query(
      'SELECT Contrasena FROM Usuario WHERE ID_Usuario = ?',
      [usuarioId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    if (rows[0].Contrasena !== contrasenaActual) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta.' });
    }
    // Update password
    await pool.query(
      'UPDATE Usuario SET Contrasena = ? WHERE ID_Usuario = ?',
      [contrasenaNueva, usuarioId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar la contraseña.' });
  }
});

app.get('/api/medicos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Medico');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all patients
app.get('/api/pacientes', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Paciente');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all medicines
app.get('/api/medicinas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Medicina');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get prescription count by doctor
app.get('/api/medico/recetas-count', async (req, res) => {
  const medicoId = req.query.medicoId;
  if (!medicoId) return res.status(400).json({ error: 'medicoId requerido.' });
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM Receta WHERE ID_Medico = ?',
      [medicoId]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get prescriptions by patient
app.get('/api/recetas-paciente', async (req, res) => {
  const pacienteId = req.query.pacienteId;
  if (!pacienteId) return res.status(400).json({ error: 'pacienteId requerido.' });
  try {
    const [rows] = await pool.query(
      `SELECT r.ID_Receta, r.ID_Medico, m.Nombre_Medico, m.Correo_Medico, r.Fecha_Receta,
              me.Nombre_Medicina, rm.Dosis, r.Receta_Detalle,
              CASE WHEN d.ID_Receta IS NOT NULL THEN 'Dispensada' ELSE 'Pendiente' END AS status
       FROM Receta r
       JOIN Medico m ON r.ID_Medico = m.ID_Medico
       JOIN Receta_Medicina rm ON r.ID_Receta = rm.ID_Receta
       JOIN Medicina me ON rm.Codigo_Medicina = me.ID_Medicina
       LEFT JOIN Dispensado d ON r.ID_Receta = d.ID_Receta
       WHERE r.ID_Paciente = ?
       ORDER BY r.Fecha_Receta DESC`,
      [pacienteId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create prescription
app.post('/api/recetas', async (req, res) => {
  const { pacienteId, medicoId, medicamentos, contentHash, signature, recetaDetalle } = req.body;
  // medicamentos: [{ id, dosis }]
  if (!pacienteId || !medicoId || !Array.isArray(medicamentos) || medicamentos.length === 0) {
    return res.status(400).json({ error: 'Datos de receta incompletos.' });
  }
  try {
    // Generate unique hash for receta
    const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const recetaString = `${pacienteId}|${medicoId}|${fecha}|${JSON.stringify(medicamentos)}`;
    const recetaHash = '0x' + crypto.createHash('sha256').update(recetaString).digest('hex');

    // Insert receta in SQL with generated hash
    const [recetaResult] = await pool.query(
      'INSERT INTO Receta (ID_Paciente, ID_Medico, Fecha_Receta, Hash_Receta, Receta_Detalle) VALUES (?, ?, ?, ?, ?)',
      [pacienteId, medicoId, fecha, recetaHash, JSON.stringify(recetaDetalle || {})]
    );
    const recetaId = recetaResult.insertId;
    for (const med of medicamentos) {
      await pool.query(
        'INSERT INTO Receta_Medicina (ID_Receta, Codigo_Medicina, Dosis) VALUES (?, ?, ?)',
        [recetaId, med.id, med.dosis]
      );
    }
    await pool.query('UPDATE Medico SET UltimaActividad = NOW() WHERE ID_Medico = ?', [medicoId]);

    // Blockchain: always call insertar.py using Llave_Publica_Medico as signature
    const prescriptionId = String(recetaId);
    // Get doctor's public key (firma) from Medico table
    let firma = null;
    try {
      const [medicoRows] = await pool.query('SELECT Llave_Publica_Medico FROM Medico WHERE ID_Medico = ?', [medicoId]);
      if (medicoRows.length > 0 && medicoRows[0].Llave_Publica_Medico) {
        firma = medicoRows[0].Llave_Publica_Medico;
      } else {
        firma = '0x'; // fallback if not present
      }
    } catch (err) {
      firma = '0x';
    }
    // Call Insertar.py (async, do not block response)
    const pythonPath = 'python';
    const scriptPath = path.join(__dirname, '..', 'PruebaBlockchain', 'Insertar.py');
    execFile(pythonPath, [scriptPath, prescriptionId, recetaHash, firma], (error, stdout, stderr) => {
      if (error) {
        console.error('Blockchain error:', error, stderr);
      } else {
        console.log('Receta registrada en blockchain:', stdout);
      }
    });
    // Respond immediately with DB result
    res.json({ success: true, recetaId, recetaHash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fetch prescriptions by doctor with blockchain data
app.get('/api/recetas', async (req, res) => {
  const medicoId = req.query.medicoId;
  if (!medicoId) return res.status(400).json({ error: 'medicoId requerido.' });
  try {
    const [rows] = await pool.query(
      `SELECT r.ID_Receta, r.Fecha_Receta, r.Hash_Receta, p.Nombre_Paciente, me.Nombre_Medicina, rm.Dosis, r.Receta_Detalle,
        CASE WHEN d.ID_Receta IS NOT NULL THEN 'Dispensada' ELSE 'Pendiente' END AS status
       FROM Receta r
       JOIN Paciente p ON r.ID_Paciente = p.ID_Paciente
       JOIN Receta_Medicina rm ON r.ID_Receta = rm.ID_Receta
       JOIN Medicina me ON rm.Codigo_Medicina = me.ID_Medicina
       LEFT JOIN Dispensado d ON r.ID_Receta = d.ID_Receta
       WHERE r.ID_Medico = ?
       ORDER BY r.Fecha_Receta DESC`,
      [medicoId]
    );
    // For each prescription, fetch blockchain data
    const promises = rows.map(presc => {
      return new Promise(resolve => {
        execFile('python', [
          path.join(__dirname, '..', 'PruebaBlockchain', 'Get.py'),
          String(presc.ID_Receta)
        ], (error, stdout, stderr) => {
          if (error) {
            presc.blockchain = { error: stderr };
          } else {
            presc.blockchain = stdout;
          }
          resolve(presc);
        });
      });
    });
    const enriched = await Promise.all(promises);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get shared access by ID
app.get('/api/shared-access/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT receta_ids FROM shared_access WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Acceso compartido no encontrado.' });
    let receta_ids = [];
    try {
      const raw = rows[0].receta_ids;
      receta_ids = Array.isArray(raw) ? raw : JSON.parse(raw);
      if (!Array.isArray(receta_ids)) receta_ids = [receta_ids];
    } catch {
      receta_ids = [];
    }
    res.json({ receta_ids });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener acceso compartido.' });
  }
});

// Get shared access by entity
app.get('/api/shared-entity/:entity', async (req, res) => {
  const { recipient_name, recipient_type } = req.query;
  try {
    let query = 'SELECT receta_ids FROM shared_access WHERE recipient_name = ? AND recipient_type = ?';
    let params = [recipient_name, recipient_type];

    const [rows] = await db.query(query, params);
    if (rows.length === 0) return res.status(404).json({ error: 'Acceso compartido no encontrado.' });
    let receta_ids = [];
    for (const row of rows) {
      try {
        const raw = row.receta_ids;
        let ids = Array.isArray(raw) ? raw : JSON.parse(raw);
        if (!Array.isArray(ids)) ids = [ids];
        receta_ids.push(...ids);
      } catch {
        // skip invalid JSON
      }
    }
    // Remove duplicates
    receta_ids = Array.from(new Set(receta_ids));
    res.json({ receta_ids });
  } catch (err) {
    console.error('Error in /api/shared-entity:', err);
    res.status(500).json({ error: 'Error al obtener acceso compartido.' });
  }
});

app.get('/', (req, res) => {
  res.send('Reto Blockchain Backend is running');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
