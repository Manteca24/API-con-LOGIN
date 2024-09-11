const express = require('express');
const router = express.Router();
const { generateToken, verifyToken } = require('../middlewares/authMiddleware');
const users = require('../data/users');
const axios = require('axios')

router.get('/', (req, res) => {
  if(!req.session.token){
  res.send(`
      <form action="/login" method="post">
      <label for="username">Usuario:</label>
      <input type="text" id="username" name="username" required>
      <label for="password">Contraseña:</label>
      <input type="password" id="password" name="password" required>
      <button type="submit">Iniciar sesión</button>
  </form>
      <a href="/search">search</a>`);

  } else {
      res.send(`
          <h1> ¡Estás autenticado!</h1>
          <h2>Ya puedes acceder a la info de los personajes de Rick&Morty</h2>
           <a href="/search">Acceder a la página de búsqueda</a>
              <form action="/logout" method="post"> 
              <button type="submit">Cerrar sesión</button> 
              </form> 
      `)
  }
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password
  );

  if (!user) {
      res.status(401).json({ message: 'Credenciales incorrectas' });
      
  } else {
      const token = generateToken(user);
      req.session.token = token;
      res.redirect('/search');
  }
});

router.get('/search', verifyToken, (req, res) => {
  const userId = req.user;
  const user = users.find((u) => u.id === userId);
  
  if (!user) {
      res.status(401).json({ message: 'Usuario no encontrado' })
      
  } else {
      res.send(` <h1>Bienvenid@ a Rick&Morty API, ${user.name}!</h1> 
          <form action="/characters/search" method="post">
              <label for="characterName">Nombre del personaje:</label>
              <input type="text" id="characterName" name="name" placeholder="Rick" />
              <button type="submit">Buscar</button>
          </form>
          <div id="characterInfo"></div>
          <form action="/logout" method="post"> 
          <button type="submit">Cerrar sesión</button> 
          </form> 
          <a href="/">Home</a> `)
  } 
  });

  

router.get("/characters", verifyToken, async (req,res) => 
  {
  try {
      const url = "https://rickandmortyapi.com/api/character"
      const response = await axios.get(url);
      const characters = response.data.results.map(character => {
        const {name, status, gender, species, image, origin: {name: origin}} = character
        return {name, status, gender, species, image, origin}})
        res.json(characters);
      
      } catch (err){ 
      res.status(500).json({error: `personaje no encontrado, ${err}`})
  }
})

// pendiente: que salgan todas las páginas

router.post("/characters/search", verifyToken, async (req, res) => {
  const name = req.body.name
  res.redirect(`/characters/${name}`
  
  )
})
router.get("/characters/:name", verifyToken, async (req,res) => {
  const url = "https://rickandmortyapi.com/api/character"
  const name = req.params.name
  try { 
      const response = await axios.get(`${url}?name=${name}`)
      const characterData = response.data.results.map(character => {
          const {name, status, gender, species, image, origin: {name: origin}} = character
          return {name, status, gender, species, image, origin}
      })
      res.json(characterData)
  } catch (err){ 
      res.status(500).json({error: `personaje no encontrado, ${err}`})
  }
})

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});


module.exports = router