const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

/**
 * "Persistência"
 */
const repositories = [];

/**
 * Middleware para validar o ID
 */
function validateID(request, response, next) {
  const { id } = request.params;

  if(!isUuid(id)){
    return response.status(400).json({ error: "Not a valid ID."});
  }

  const repositoryIndex = repositories.findIndex( repository => repository.id == id);

  if(repositoryIndex < 0 ){
    return response.status(400).json({error: "Repository not found."});
  }

  return next();
}

app.use('/repositories/:id', validateID);

/**
 * Rotas
 */
app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(), 
    title, 
    url,
    techs,
    likes: 0
  }
  
  repositories.push(repository);
  
  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const { title, url, techs } = request.body; // conceito: PUT altera TODOS os campos, então a API assume que todos os campos serão reenviados

  const repositoryIndex = repositories.findIndex( repository => repository.id == id);
  
  const likes = repositories[repositoryIndex].likes; 

  const repository = {
    id,
    title,
    url,
    techs,
    likes
  }

  repositories[repositoryIndex] = repository;

  return response.json(repository);
});

app.delete("/repositories/:id", (request, response, next) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex( repository => repository.id == id );

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send(); // 204: No Content
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex( repository => repository.id == id );

  const likes = repositories[repositoryIndex].likes + 1;

  repositories[repositoryIndex].likes = likes;

  return response.json({ likes });
});

module.exports = app;
