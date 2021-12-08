const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const HTTP_OK_STATUS = 200;
const PORT = '3000';

const fs = require('fs/promises');

const talkersJson = './talker.json';

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (_request, response) => {
  response.status(HTTP_OK_STATUS).send();
});

app.get('/talker', async (_request, response) => {
  const talkers = await fs.readFile(talkersJson, 'utf-8');
  response.status(HTTP_OK_STATUS).send(JSON.parse(talkers));
});

app.listen(PORT, () => {
  console.log('Online');
});
