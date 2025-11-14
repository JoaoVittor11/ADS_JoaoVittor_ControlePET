import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'João Vittor',
    pass: 'cvbzukthdpqoeuqa' // use "senha de app" do Gmail, NÃO sua senha normal
  }
});

export async function enviarEmailConfirmacao(to: string, assunto: string, texto: string) {
  const mailOptions = {
    from: 'deoliveira.joaovittor@gmail.com',
    to,
    subject: assunto,
    text: texto
  };

  return transporter.sendMail(mailOptions);
}
