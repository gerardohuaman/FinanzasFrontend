const express = require('express')
const path = require('path')
const app = express()

const appPath = path.join(__dirname, 'dist', 'FinanzasFrontend', 'browser')
app.use(express.static(appPath))

app.get('/*', function(req, res) {
    res.sendFile(path.join(appPath, 'index.html'))
})

const port = process.env.PORT || 8080
app.listen(port, () => {
    console.log(`Frontend de Angular corriendo en el puerto ${port}`)
})