const handlebars = require('express-handlebars')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const {Server: HttpServer} = require('http');
const {Server: IOServer} = require('socket.io');


const Contenedor = require('../Ej2')
const objContenedor = new Contenedor();
const datos =  objContenedor.getAll()

/* ---------------------- Instancia de express ----------------------*/
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);



//MIDDLEWEARS
app.use(morgan('tiny'))
app.use(express.json())
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine', 'hbs')
app.set('views', './views')

//WEBSOCKETS
const productos = './views/partials/productos.hbs'
const mensajes = [{
    email: 'comanelias5@gmail.com',
    mensaje: 'Este es un mensaje'
}]
io.on('connection',socket => {
    console.log('Un cliente se ha conectado');
    socket.emit('mensajes', mensajes);
    io.sockets.emit('tabla',{datos:datos})

    socket.on('new-message',data => {
        mensajes.push(data);
        io.sockets.emit('mensajes', mensajes);
    });
 });



//ENGINE
app.engine('hbs', handlebars.engine({
    extname:'.hbs',
    defaultLayout: 'main.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
})
)
                    
//ROUTES
app.get('/' ,(req,res) => {
    res.render('./partials/formulario')
    
})

app.get('/productos', (req, res ) => {
    
    res.render('./partials/productos',{datos:datos, exist:true})
})

app.post('/productos', (req, res) => {
    const lastId = datos[datos.length-1].id;
    const data = {
        title: req.body.title,
        price: req.body.price,
        thumbnail: req.body.thumbnail,
        id:lastId+1
    }
    datos.push(data)
    res.redirect('/')
    
})





const PORT = 8081;
const server = httpServer.listen(PORT, () => {
    console.log('Escuchando en el puerto ' + PORT);
})

server.on('err', (error) => {
    console.log(error)
})



