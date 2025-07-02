import express, { type Express, type Request, type Response } from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import axios from 'axios';
import Joi from 'joi';
import dotenv from 'dotenv';

dotenv.config();

interface ContactData {
  fullName: string;
  email: string;
  phone: string;
  message: string;
  recaptcha: string;
}

interface RecaptchaResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

const app: Express = express();

// Configuración de CORS más flexible
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CORS_ORIGIN
    ].filter(Boolean); 

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('No permitido por CORS'), false);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'landing_cars',
  port: parseInt(process.env.DB_PORT || '3306')
};

const connectDB = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Conectado a la base de datos MySQL');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullName VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    return connection;
  } catch (error) {
    console.error('Error al conectar con MySQL:', error);
    process.exit(1);
  }
};

const db = await connectDB();

// Ruta de prueba para verificar CORS
app.get('/api/test-cors', (req: Request, res: Response) => {
  res.json({ 
    message: 'CORS funcionando correctamente',
    origin: req.headers.origin || 'No origin',
    timestamp: new Date().toISOString()
  });
});

const contactSchema = Joi.object({
  fullName: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(/^\d{10}$/).required(),
  message: Joi.string().min(10).required(),
  recaptcha: Joi.string().required()
});

app.post('/api/contact', async (req: Request, res: Response): Promise<any> => {
  const secret = process.env.RECAPTCHA_SECRET;
  const { fullName, email, phone, message, recaptcha }: ContactData = req.body;

  const { error } = contactSchema.validate({ fullName, email, phone, message, recaptcha });
  if (error) {
    return res.status(400).json({ error: 'Datos inválidos', details: error.details });
  }

  try {
    const { data: recaptchaRes }: { data: RecaptchaResponse } = await axios.post(
      process.env.RECAPTCHA_URL || 'https://www.google.com/recaptcha/api/siteverify',
      new URLSearchParams({
        secret: secret || '',
        response: recaptcha
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (recaptchaRes.success) {
      try {
        const query = `INSERT INTO contacts (fullName, email, phone, message) VALUES (?, ?, ?, ?)`;
        const [result] = await db.execute(query, [fullName, email, phone, message]);
        const insertResult = result as mysql.ResultSetHeader;
        
        return res.status(200).json({ 
          message: 'Datos guardados correctamente', 
          id: insertResult.insertId 
        });
      } catch (error) {
        console.error('Error al guardar los datos:', error);
        return res.status(500).json({ error: 'Error al guardar los datos' });
      }
    } else {
      console.error('Error de reCAPTCHA:', recaptchaRes);
      return res.status(400).json({ error: 'Error de reCAPTCHA', details: recaptchaRes['error-codes'] });
    }
  } catch (error) {
    console.error('Error al verificar reCAPTCHA:', error);
    return res.status(500).json({ error: 'Error al verificar reCAPTCHA' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
