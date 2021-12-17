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

const crypto = require('crypto');
// const { request } = require('http');

function generateToken() {
  return crypto.randomBytes(8).toString('hex');
}

const auth = (request, response, next) => {
  const token = request.headers.authorization; // coloco no headers no insomnia e chamo aqui
      
  if (!token) return response.status(401).json({ message: 'Token não encontrado' });
  if (token.length !== 16) {
    return response.status(401).json({ message: 'Token inválido' });
  }
  next();
};

// requisito 7
app.get('/talker/search', auth, async (request, response) => {
  const { q } = request.query;
  try {
    const readFile = await fs.readFile(talkersJson, 'utf-8');
    const talkers = JSON.parse(readFile);

    if (!q) {
      return response.status(HTTP_OK_STATUS).json(talkers);
    }
    
    const getSearchItem = talkers
      .filter((talker) => talker.name.toLowerCase().includes(q.toLowerCase()));
    if (!getSearchItem) {
      return response.status(HTTP_OK_STATUS).json([]);
    }
    return response.status(HTTP_OK_STATUS).json(getSearchItem);
  } catch (error) {
    console.error(error);
  }
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

app.post('/login', emailValidation, passwordValidation, (_request, response) => {
  const token = generateToken();

  response.status(HTTP_OK_STATUS).json({ token: `${token}` });
});

// requisito 4
const nameValidation = (request, response, next) => {
  const nameLength = 3;
  const { name } = request.body;
  if (!name) {
    return response.status(400).json({ message: 'O campo "name" é obrigatório' });
  }
  if (name.length < nameLength) {
    return response.status(400).json({ message: 'O "name" deve ter pelo menos 3 caracteres' });
  }
  next();
};

const ageValidation = (request, response, next) => {
  const minAge = 18;
  const { age } = request.body;
  if (!age) {
    return response.status(400).json({ message: 'O campo "age" é obrigatório' });
  }
  if (age < minAge) {
    return response.status(400).json({ message: 'A pessoa palestrante deve ser maior de idade' });
  }
  next();
};

// Fonte regex: https://stackoverflow.com/questions/5465375/javascript-date-regex-dd-mm-yyyy

const talkValidation = (request, response, next) => {
  const { talk } = request.body;
  if (!talk || talk.rate === undefined || talk.rate === '' || !talk.watchedAt) { // tive que alterar
    return response.status(400).json({
      message: 'O campo "talk" é obrigatório e "watchedAt" e "rate" não podem ser vazios' });
  }
  next();
};

const dateValidation = (request, response, next) => {
  const dateValidation1 = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const { talk } = request.body;

  if (!dateValidation1.test(talk.watchedAt)) {
    return response.status(400).json({ 
      message: 'O campo "watchedAt" deve ter o formato "dd/mm/aaaa"' });
  }
  next();
};

const rateValidation = (request, response, next) => {
  const minRate = 1;
  const maxRate = 5;
  const { talk } = request.body;
  if (talk.rate < minRate || talk.rate > maxRate) {
    return response.status(400).json({ 
      message: 'O campo "rate" deve ser um inteiro de 1 à 5' });
  }
  next();
};

app.post('/talker', 
  auth, 
  nameValidation, 
  ageValidation,
  talkValidation, 
  dateValidation,
  rateValidation, 
  async (request, response) => {
  try {
    const { name, age, talk } = request.body;
    const readTalkers = await fs.readFile(talkersJson, 'utf-8');
    let talkers = JSON.parse(readTalkers);
    const newTalker = { 
      id: talkers.length + 1, 
      name, 
      age,
      talk, 
    };
    talkers = [...talkers, newTalker];
    await fs.writeFile(talkersJson, JSON.stringify(talkers));
    return response.status(201).json(newTalker);
  } catch (error) {
    console.error(error.message);
  }
});

// requisito 5
app.put('/talker/:id', 
  auth, 
  nameValidation, 
  ageValidation,
  talkValidation, 
  dateValidation,
  rateValidation, 
  async (request, response) => {
  try {
    const { id } = request.params;
    const { name, age, talk } = request.body;
    const readFile = await fs.readFile(talkersJson, 'utf-8'); 
    const talkers = JSON.parse(readFile); 
    
    const talkerUpdate = talkers.findIndex((talker) => talker.id === Number(id));
    talkers[talkerUpdate] = { ...talkers[talkerUpdate], name, age, talk };
    await fs.writeFile(talkersJson, JSON.stringify(talkers)); 
    response.status(HTTP_OK_STATUS).json(talkers[talkerUpdate]);
  } catch (error) {
    console.error(error.message);
  }
});

// requisito 6
app.delete('/talker/:id', auth, async (request, response) => {
  const { id } = request.params;
  try {
    const readFile = await fs.readFile(talkersJson, 'utf-8'); 
    const talkers = JSON.parse(readFile);
    const deleteTalker = talkers.filter((talker) => talker.id !== Number(id));
    await fs.writeFile(talkersJson, JSON.stringify(deleteTalker));
    return response.status(HTTP_OK_STATUS).json({ 
      message: 'Pessoa palestrante deletada com sucesso' });
  } catch (error) {
    console.error(error.message);
  }  
});

app.listen(PORT, () => {
  console.log('Online');
});
