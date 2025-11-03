import { Request, Response } from 'express';
import pool from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/authMiddleware'; 

export const cadastrarTutor = async (req: Request, res: Response) => {
    // ... código existente ...
};

// ============================================
// FUNÇÃO DE LOGIN COM DEBUG ADICIONADO
// ============================================
export const loginTutor = async (req: Request, res: Response) => {
    const { cpf, senha } = req.body; 
    console.log(`[DEBUG LOGIN] Tentativa de login recebida para CPF: ${cpf}`); // LOG 1

    if (!cpf || !senha) {
        console.log('[DEBUG LOGIN] Erro: CPF ou senha não fornecidos.'); // LOG 2
        return res.status(400).json({ message: 'CPF e senha são obrigatórios.' });
    }

    try {
        const query = 'SELECT * FROM Tutores WHERE cpf = $1';
        console.log(`[DEBUG LOGIN] Executando query: ${query} com CPF: ${cpf}`); // LOG 3
        const resultado = await pool.query(query, [cpf]);

        if (resultado.rows.length === 0) {
            console.log(`[DEBUG LOGIN] Erro: Nenhum tutor encontrado para o CPF: ${cpf}`); // LOG 4
            return res.status(401).json({ message: 'CPF ou Senha inválidos.' }); 
        }

        const tutor = resultado.rows[0];
        console.log('[DEBUG LOGIN] Tutor encontrado:', { id: tutor.id, nome: tutor.nome_completo, cpf: tutor.cpf }); // LOG 5 (Não logar a senha hash)

        // Compara a senha enviada com a senha criptografada no banco
        console.log('[DEBUG LOGIN] Comparando senha fornecida com a senha no banco...'); // LOG 6
        const senhaCorreta = await bcrypt.compare(senha, tutor.senha);
        console.log(`[DEBUG LOGIN] Resultado da comparação de senha: ${senhaCorreta}`); // LOG 7

        if (!senhaCorreta) {
            console.log('[DEBUG LOGIN] Erro: Senha incorreta.'); // LOG 8
            return res.status(401).json({ message: 'CPF ou Senha inválidos.' });
        }

        console.log('[DEBUG LOGIN] Senha correta. Gerando token...'); // LOG 9
        const payload = { id: tutor.id, cpf: tutor.cpf }; 
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(payload, secret, { expiresIn: '8h' });

        res.status(200).json({ 
            message: 'Login bem-sucedido!', 
            tutor: { id: tutor.id, nome: tutor.nome_completo, cpf: tutor.cpf }, 
            token: token
        });

    } catch (error) {
        console.error('[DEBUG LOGIN] Erro inesperado durante o login:', error); // LOG 10
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// Função de perfil (mantém como está por enquanto)
export const getPerfilTutor = async (req: AuthRequest, res: Response) => {
    // ... código existente ...
};

