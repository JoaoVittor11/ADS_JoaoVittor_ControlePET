import { Request, Response } from 'express';
import pool from '../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middlewares/authMiddleware';

// ============================================
// FUNÇÃO DE CADASTRO DO TUTOR (SEM PET)
// ============================================
export const cadastrarTutor = async (req: Request, res: Response) => {
    try {
        const {
            nome_completo,
            telefone,
            endereco,
            cpf,
            email,
            senha,
            confirm_password
        } = req.body;

        console.log('[DEBUG CADASTRO TUTOR] Dados recebidos:', { nome_completo, cpf, email });

        if (!nome_completo?.trim() || !cpf?.trim() || !email?.trim() || !senha?.trim()) {
            console.log('[DEBUG CADASTRO TUTOR] Erro: Campos obrigatórios não preenchidos.');
            return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
        }

        if (senha !== confirm_password) {
            console.log('[DEBUG CADASTRO TUTOR] Erro: Senhas não conferem.');
            return res.status(400).json({ message: 'As senhas não conferem.' });
        }

        const tutorExistente = await pool.query(
            'SELECT * FROM tutores WHERE cpf = $1', [cpf.trim()]
        );

        if (tutorExistente.rows.length > 0) {
            console.log(`[DEBUG CADASTRO TUTOR] Erro: CPF ${cpf} já cadastrado.`);
            return res.status(400).json({ message: 'CPF já cadastrado.' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const queryTutor = `
            INSERT INTO tutores (nome_completo, telefone, endereco, cpf, email, senha)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, nome_completo, cpf, email, telefone, endereco
        `;
        
        const resultTutor = await pool.query(queryTutor, [
            nome_completo.trim(),
            (telefone || '').trim(),
            (endereco || '').trim(),
            cpf.trim(),
            email.trim(),
            senhaHash
        ]);

        console.log('[DEBUG CADASTRO TUTOR] Tutor cadastrado com sucesso!');
        res.status(201).json({
            message: 'Cadastro realizado com sucesso!',
            tutor: resultTutor.rows[0]
        });

    } catch (error: any) {
        console.error('[DEBUG CADASTRO TUTOR] Erro:', error.message);
        res.status(500).json({ message: `Erro ao cadastrar: ${error.message}` });
    }
};

// ============================================
// FUNÇÃO DE CADASTRO DE PET (APÓS LOGIN)
// ============================================
export const cadastrarPet = async (req: AuthRequest, res: Response) => {
    try {
        const tutorId = req.user?.id;

        if (!tutorId) {
            console.log('[DEBUG CADASTRO PET] Erro: Usuário não autenticado.');
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const { nome, idade, pelagem, problemas_medicos, notas_vacinas } = req.body;

        console.log('[DEBUG CADASTRO PET] Dados recebidos:', { nome, idade, tutorId });

        if (!nome?.trim()) {
            console.log('[DEBUG CADASTRO PET] Erro: Nome do pet é obrigatório.');
            return res.status(400).json({ message: 'Nome do pet é obrigatório.' });
        }

        console.log(`[DEBUG CADASTRO PET] Inserindo pet: ${nome} para tutor ID: ${tutorId}`);

        const queryPet = `
            INSERT INTO pets (id_tutor, nome, idade, pelagem, problemas_medicos, notas_vacinas)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, nome, idade, pelagem, problemas_medicos, notas_vacinas
        `;
        
        try {
            const resultPet = await pool.query(queryPet, [
                tutorId,
                nome.trim(),
                (idade || '').trim(),
                (pelagem || '').trim(),
                (problemas_medicos || '').trim(),
                (notas_vacinas || '').trim()
            ]);

            console.log(`[DEBUG CADASTRO PET] Pet inserido com sucesso! ID: ${resultPet.rows[0].id}`);
            res.status(201).json({
                message: 'Pet cadastrado com sucesso!',
                pet: resultPet.rows[0]
            });
        } catch (dbError: any) {
            console.error('[DEBUG CADASTRO PET] Erro de banco de dados:', dbError.message);
            console.error('[DEBUG CADASTRO PET] Detalhes:', dbError);
            res.status(500).json({ message: `Erro ao cadastrar pet: ${dbError.message}` });
        }

    } catch (error: any) {
        console.error('[DEBUG CADASTRO PET] Erro geral:', error.message);
        res.status(500).json({ message: `Erro ao cadastrar pet: ${error.message}` });
    }
};

// ============================================
// FUNÇÃO DE LISTAR PETS DO TUTOR
// ============================================
export const listarPetsTutor = async (req: AuthRequest, res: Response) => {
    try {
        const tutorId = req.user?.id;

        if (!tutorId) {
            console.log('[DEBUG LISTAR PETS] Erro: Usuário não autenticado.');
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        console.log(`[DEBUG LISTAR PETS] Buscando pets do tutor ID: ${tutorId}`);

        const query = `
            SELECT id, id_tutor, nome, idade, pelagem, problemas_medicos, notas_vacinas
            FROM pets
            WHERE id_tutor = $1
            ORDER BY nome
        `;

        const resultado = await pool.query(query, [tutorId]);

        console.log(`[DEBUG LISTAR PETS] ${resultado.rows.length} pets encontrados`);
        res.status(200).json({
            message: 'Pets recuperados com sucesso!',
            pets: resultado.rows
        });

    } catch (error: any) {
        console.error('[DEBUG LISTAR PETS] Erro:', error.message);
        res.status(500).json({ message: `Erro ao listar pets: ${error.message}` });
    }
};

// ============================================
// FUNÇÃO DE ATUALIZAR PET
// ============================================
export const atualizarPet = async (req: AuthRequest, res: Response) => {
    try {
        const tutorId = req.user?.id;
        const { petId } = req.params;

        if (!tutorId) {
            console.log('[DEBUG ATUALIZAR PET] Erro: Usuário não autenticado.');
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        if (!petId) {
            console.log('[DEBUG ATUALIZAR PET] Erro: ID do pet não fornecido.');
            return res.status(400).json({ message: 'ID do pet é obrigatório.' });
        }

        const { nome, idade, pelagem, problemas_medicos, notas_vacinas } = req.body;

        console.log(`[DEBUG ATUALIZAR PET] Atualizando pet ID: ${petId} do tutor ID: ${tutorId}`);
        console.log('[DEBUG ATUALIZAR PET] Dados recebidos:', { nome, idade, pelagem, problemas_medicos, notas_vacinas });

        if (!nome?.trim()) {
            console.log('[DEBUG ATUALIZAR PET] Erro: Nome do pet é obrigatório.');
            return res.status(400).json({ message: 'Nome do pet é obrigatório.' });
        }

        const nomeTrimmed = nome?.trim();
        const idadeTrimmed = idade?.trim() || '';
        const pelagemTrimmed = pelagem?.trim() || '';
        const problemasTrimmed = problemas_medicos?.trim() || '';
        const vacinasTrimmed = notas_vacinas?.trim() || '';

        const verificarPet = await pool.query(
            'SELECT * FROM pets WHERE id = $1 AND id_tutor = $2',
            [petId, tutorId]
        );

        if (verificarPet.rows.length === 0) {
            console.log(`[DEBUG ATUALIZAR PET] Erro: Pet ${petId} não encontrado ou não pertence ao tutor.`);
            return res.status(404).json({ message: 'Pet não encontrado.' });
        }

        const query = `
            UPDATE pets
            SET nome = $1, idade = $2, pelagem = $3, problemas_medicos = $4, notas_vacinas = $5
            WHERE id = $6 AND id_tutor = $7
            RETURNING id, id_tutor, nome, idade, pelagem, problemas_medicos, notas_vacinas
        `;

        try {
            const resultado = await pool.query(query, [
                nomeTrimmed,
                idadeTrimmed,
                pelagemTrimmed,
                problemasTrimmed,
                vacinasTrimmed,
                petId,
                tutorId
            ]);

            console.log('[DEBUG ATUALIZAR PET] Pet atualizado com sucesso!');
            res.status(200).json({
                message: 'Pet atualizado com sucesso!',
                pet: resultado.rows[0]
            });
        } catch (dbError: any) {
            console.error('[DEBUG ATUALIZAR PET] Erro de banco de dados:', dbError.message);
            res.status(500).json({ message: `Erro de banco: ${dbError.message}` });
        }

    } catch (error: any) {
        console.error('[DEBUG ATUALIZAR PET] Erro inesperado:', error.message);
        res.status(500).json({ message: `Erro ao atualizar pet: ${error.message}` });
    }
};

// ============================================
// FUNÇÃO DE DELETAR PET
// ============================================
export const deletarPet = async (req: AuthRequest, res: Response) => {
    try {
        const tutorId = req.user?.id;
        const { petId } = req.params;

        if (!tutorId) {
            console.log('[DEBUG DELETAR PET] Erro: Usuário não autenticado.');
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        if (!petId) {
            console.log('[DEBUG DELETAR PET] Erro: ID do pet não fornecido.');
            return res.status(400).json({ message: 'ID do pet é obrigatório.' });
        }

        console.log(`[DEBUG DELETAR PET] Deletando pet ID: ${petId} do tutor ID: ${tutorId}`);

        const verificarPet = await pool.query(
            'SELECT * FROM pets WHERE id = $1 AND id_tutor = $2',
            [petId, tutorId]
        );

        if (verificarPet.rows.length === 0) {
            console.log(`[DEBUG DELETAR PET] Erro: Pet ${petId} não encontrado ou não pertence ao tutor.`);
            return res.status(404).json({ message: 'Pet não encontrado.' });
        }

        const query = 'DELETE FROM pets WHERE id = $1 AND id_tutor = $2';

        try {
            await pool.query(query, [petId, tutorId]);

            console.log('[DEBUG DELETAR PET] Pet deletado com sucesso!');
            res.status(200).json({
                message: 'Pet deletado com sucesso!'
            });
        } catch (dbError: any) {
            console.error('[DEBUG DELETAR PET] Erro de banco de dados:', dbError.message);
            res.status(500).json({ message: `Erro de banco: ${dbError.message}` });
        }

    } catch (error: any) {
        console.error('[DEBUG DELETAR PET] Erro inesperado:', error.message);
        res.status(500).json({ message: `Erro ao deletar pet: ${error.message}` });
    }
};

// ============================================
// FUNÇÃO DE LOGIN
// ============================================
export const loginTutor = async (req: Request, res: Response) => {
    const { cpf, senha } = req.body;
    console.log(`[DEBUG LOGIN] Tentativa de login recebida para CPF: ${cpf}`);

    if (!cpf?.trim() || !senha?.trim()) {
        console.log('[DEBUG LOGIN] Erro: CPF ou senha não fornecidos.');
        return res.status(400).json({ message: 'CPF e senha são obrigatórios.' });
    }

    try {
        const query = 'SELECT * FROM tutores WHERE cpf = $1';
        console.log(`[DEBUG LOGIN] Executando query com CPF: ${cpf.trim()}`);
        const resultado = await pool.query(query, [cpf.trim()]);

        if (resultado.rows.length === 0) {
            console.log(`[DEBUG LOGIN] Erro: Nenhum tutor encontrado para o CPF: ${cpf}`);
            return res.status(401).json({ message: 'CPF ou Senha inválidos.' });
        }

        const tutor = resultado.rows[0];
        console.log('[DEBUG LOGIN] Tutor encontrado:', { id: tutor.id, nome: tutor.nome_completo });

        console.log('[DEBUG LOGIN] Comparando senhas...');
        const senhaCorreta = await bcrypt.compare(senha.trim(), tutor.senha);
        console.log(`[DEBUG LOGIN] Resultado da comparação de senha: ${senhaCorreta}`);

        if (!senhaCorreta) {
            console.log('[DEBUG LOGIN] Erro: Senha incorreta.');
            return res.status(401).json({ message: 'CPF ou Senha inválidos.' });
        }

        console.log('[DEBUG LOGIN] Senha correta. Gerando token...');
        const payload = { id: tutor.id, cpf: tutor.cpf };
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(payload, secret, { expiresIn: '8h' });

        console.log('[DEBUG LOGIN] Token gerado com sucesso!');
        res.status(200).json({
            message: 'Login bem-sucedido!',
            tutor: { 
                id: tutor.id, 
                nome_completo: tutor.nome_completo, 
                cpf: tutor.cpf,
                email: tutor.email,
                telefone: tutor.telefone,
                endereco: tutor.endereco
            },
            token: token
        });

    } catch (error: any) {
        console.error('[DEBUG LOGIN] Erro inesperado durante o login:', error.message);
        res.status(500).json({ message: 'Erro interno do servidor.' });
    }
};

// ============================================
// FUNÇÃO DE PERFIL - GET
// ============================================
export const getPerfilTutor = async (req: AuthRequest, res: Response) => {
    try {
        const tutorId = req.user?.id;

        if (!tutorId) {
            console.log('[DEBUG PERFIL] Erro: Usuário não autenticado.');
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        console.log(`[DEBUG PERFIL] Buscando perfil do tutor ID: ${tutorId}`);
        const query = 'SELECT * FROM tutores WHERE id = $1';
        const resultado = await pool.query(query, [tutorId]);

        if (resultado.rows.length === 0) {
            console.log(`[DEBUG PERFIL] Erro: Tutor não encontrado para ID: ${tutorId}`);
            return res.status(404).json({ message: 'Tutor não encontrado' });
        }

        console.log('[DEBUG PERFIL] Perfil encontrado com sucesso!');
        res.status(200).json(resultado.rows[0]);

    } catch (error: any) {
        console.error('[DEBUG PERFIL] Erro inesperado ao buscar perfil:', error.message);
        res.status(500).json({ message: 'Erro ao buscar perfil' });
    }
};

// ============================================
// FUNÇÃO DE PERFIL - PUT (ATUALIZAR)
// ============================================
export const atualizarPerfilTutor = async (req: AuthRequest, res: Response) => {
    try {
        const tutorId = req.user?.id;

        if (!tutorId) {
            console.log('[DEBUG PERFIL UPDATE] Erro: Usuário não autenticado.');
            return res.status(401).json({ message: 'Usuário não autenticado.' });
        }

        const { nome_completo, email, telefone, endereco } = req.body;

        console.log(`[DEBUG PERFIL UPDATE] Atualizando perfil do tutor ID: ${tutorId}`);
        console.log('[DEBUG PERFIL UPDATE] Dados recebidos (antes do trim):', { nome_completo, email, telefone, endereco });

        const nomeTrimmed = nome_completo?.trim();
        const emailTrimmed = email?.trim();
        const telefoneTrimmed = telefone?.trim();
        const enderecoTrimmed = endereco?.trim() || '';

        console.log('[DEBUG PERFIL UPDATE] Dados após trim:', { nomeTrimmed, emailTrimmed, telefoneTrimmed, enderecoTrimmed });

        if (!nomeTrimmed || !emailTrimmed || !telefoneTrimmed) {
            console.log('[DEBUG PERFIL UPDATE] Erro: Campos obrigatórios não preenchidos.');
            return res.status(400).json({ message: 'Nome, email e telefone são obrigatórios.' });
        }

        const query = `
            UPDATE tutores 
            SET nome_completo = $1, email = $2, telefone = $3, endereco = $4
            WHERE id = $5
            RETURNING id, nome_completo, email, telefone, endereco, cpf
        `;

        try {
            const resultado = await pool.query(query, [
                nomeTrimmed,
                emailTrimmed,
                telefoneTrimmed,
                enderecoTrimmed,
                tutorId
            ]);

            if (resultado.rows.length === 0) {
                console.log('[DEBUG PERFIL UPDATE] Erro: Tutor não encontrado.');
                return res.status(404).json({ message: 'Tutor não encontrado' });
            }

            console.log('[DEBUG PERFIL UPDATE] Perfil atualizado com sucesso!');
            console.log('[DEBUG PERFIL UPDATE] Dados atualizados no banco:', resultado.rows[0]);
            
            res.status(200).json({
                message: 'Perfil atualizado com sucesso!',
                tutor: resultado.rows[0]
            });
        } catch (dbError: any) {
            console.error('[DEBUG PERFIL UPDATE] Erro de banco de dados:', dbError.message);
            console.error('[DEBUG PERFIL UPDATE] Detalhes do erro:', dbError);
            res.status(500).json({ message: `Erro de banco: ${dbError.message}` });
        }

    } catch (error: any) {
        console.error('[DEBUG PERFIL UPDATE] Erro inesperado:', error.message);
        console.error('[DEBUG PERFIL UPDATE] Stack:', error.stack);
        res.status(500).json({ message: `Erro ao atualizar perfil: ${error.message}` });
    }
};
