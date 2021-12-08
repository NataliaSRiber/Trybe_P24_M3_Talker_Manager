const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const fs = require('fs/promises');
// const { request } = require('http');

const talkersJson = './talker.json';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

// requisito 1
app.get('/talker', async (_request, response) => {
  const talkers = await fs.readFile(talkersJson, 'utf-8');
  response.status(HTTP_OK_STATUS).json(JSON.parse(talkers));
});

// requisito 2
app.get('/talker/:id', async (request, response) => {
  const { id } = request.params;
  const readTalkers = await fs.readFile(talkersJson, 'utf-8');
  const talkers = JSON.parse(readTalkers);
  const getTalkerById = talkers.find((talker) => talker.id === Number(id));
  if (!getTalkerById) { 
    return response.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  response.status(HTTP_OK_STATUS).json(getTalkerById);
});

// requisito 3
const crypto = require('crypto');

function generateToken() {
  return crypto.randomBytes(8).toString('hex');
}

const emailValidation = (request, response, next) => {
  const { email } = request.body;
  
  // Fonte regex:https://www.horadecodar.com.br/2020/09/07/expressao-regular-para-validar-e-mail-javascript-regex/
  const emailTest = /\S+@\S+\.\S+/;
  if (!email) {
    return response.status(400).json({ message: 'O campo "email" é obrigatório' });
  }
  
  if (emailTest.test(email) === false) {
    return response.status(400).json({ message: 'O "email" deve ter o formato "email@email.com"' });
  }
  next();
};

const passwordValidation = (request, response, next) => {
  const { password } = request.body;
  const passwordLength = 6;
    if (!password) {
    return response.status(400).json({ message: 'O campo "password" é obrigatório' });
  }
  if (password.length < passwordLength) {
    return response.status(400).json({ message: 'O "password" deve ter pelo menos 6 caracteres' });
  }
  next();
};

app.post('/login', emailValidation, passwordValidation, (request, response) => {
  const token = generateToken();

  response.status(HTTP_OK_STATUS).json({ token: `${token}` });
});

app.listen(PORT, () => {
  console.log('Online');
});
