import app, { PORT } from './server.js'

export default app
export { PORT }

app.listen(PORT, () => {
  console.log(`[DEV] API escuchando en http://localhost:${PORT}`)
})