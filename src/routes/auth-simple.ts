import { Router } from 'express';

const router = Router();

// Ruta de prueba simple
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

export default router;
