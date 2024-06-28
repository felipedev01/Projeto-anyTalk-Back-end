import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../middleware';

const router = Router();
const prisma = new PrismaClient();

interface RegisterRequest extends Request {
  body: {
    name: string;
    email: string;
    password: string;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

router.post('/register', async (req: RegisterRequest, res: Response) => {
  const { name, email, password } = req.body;
  console.log('Request Body:', req.body); // Log completo do corpo da requisição
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'User already exists' });
  }
});

router.post('/login', async (req: LoginRequest, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide all required fields' });
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET as string);
  res.json({ user, token });

})
  router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
})

export default router; 


