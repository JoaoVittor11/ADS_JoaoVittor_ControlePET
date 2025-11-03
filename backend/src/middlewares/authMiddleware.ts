import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// CORREÇÃO PRINCIPAL: Adicionamos a palavra 'export' para tornar a interface pública
export interface AuthRequest extends Request {
    user?: { id: number; email: string };
}

export const proteger = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        try {
            token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: number; email: string };
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Token inválido ou expirado.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Nenhum token fornecido.' });
    }
};
