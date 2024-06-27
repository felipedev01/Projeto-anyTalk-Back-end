import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'User already exists' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET ?? 'defaultSecret', { expiresIn: '1h' });
    res.json({ accessToken });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};

export const getProfile = async (req: Request & { user: { userId: number } }, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  res.json(user);
};
