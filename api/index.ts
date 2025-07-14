import app, { PORT } from './server'

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`)
})
