import { Request, Response } from 'express';
import pool from '../config/database';
import bcrypt from 'bcryptjs';

// Exporta a função diretamente
export const cadastrarTutor = async (req: Request, res: Response) => {
    const { nome_completo, telefone, endereco, cpf, email, senha } = req.body;

    if (!nome_completo || !cpf || !email || !senha || !telefone) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const senhaCriptografada = await bcrypt.hash(senha, salt);

        const query = `
            INSERT INTO Tutores (nome_completo, telefone, endereco, cpf, email, senha)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, nome_completo, email;
        `;
        
        const values = [nome_completo, telefone, endereco, cpf, email, senhaCriptografada];

        const resultado = await pool.query(query, values);

        res.status(201).json(resultado.rows[0]);

    } catch (error: any) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'CPF ou E-mail já cadastrado.' });
        }
        console.error('Erro ao cadastrar tutor:', error);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};
