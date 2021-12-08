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
app.get('/talker/:id', async (req, response) => {
  const { id } = req.params;
  const readTalkers = await fs.readFile(talkersJson, 'utf-8');
  const talkers = JSON.parse(readTalkers);
  const getTalkerById = talkers.find((talker) => talker.id === Number(id));
  if (!getTalkerById) { 
  return response.status(404).json({ message: 'Pessoa palestrante não encontrada' });
  }
  response.status(HTTP_OK_STATUS).json(getTalkerById);
});

app.listen(PORT, () => {
  console.log('Online');
});
