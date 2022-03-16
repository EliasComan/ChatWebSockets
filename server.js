const handlebars = require('express-handlebars')
const express = require('express')
const bodyParser = require('body-parser')
const {Server: HttpServer} = require('http');
const {Server: IOServer} = require('socket.io');


//DATABASES
const { options } = require('./src/utils/options')
const { optionsSlqLite3 } = require('./src/utils/optionsSqlite3')

const Contenedor = require('./Contenedor.js')
const objContenedor = new Contenedor(options);

const Contenedorsqlite3 = require('./ContenedorSqlite3')
const objContenedorqlite3 = new Contenedorsqlite3(optionsSlqLite3)


/* ---------------------- Instancia de express ----------------------*/
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);



//MIDDLEWEARS
app.use(express.json())
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine', 'hbs')
app.set('views', './views')

//WEBSOCKETS

const mensajePrueba = [{
    email: 'comanelias5@gmail.com',
    mensaje: 'Este es un mensaje',
    timestamp: new Date().toLocaleString()
}]
let mensajesDatabase = []

io.on('connection',  async socket => {
    const data = objContenedor.getAll()
    data.then(results => { 
    io.sockets.emit('tabla', JSON.parse(JSON.stringify(results)));
        })
        .catch(err => console.log(err))
    

    console.log('Un cliente se ha conectado '+ socket.id);

        const mensajes =objContenedorqlite3.getAll();
        mensajes.then ( res => {
            mensajesDatabase = res
           })
    socket.emit('mensajes', mensajesDatabase);
   

    socket.on('new-message', async data => {
        const newMessage = await  objContenedorqlite3.save(data)
        const mensajes = objContenedorqlite3.getAll();
        mensajes.then ( res => {
            mensajesDatabase = res
            io.sockets.emit('mensajes', mensajesDatabase) 
           })
    });

    socket.on('delete', id => {
        const del = objContenedor.deleteById(id)
            del.then( () =>{
                const data = objContenedor.getAll()
                data.then(results => { 
                io.sockets.emit('tabla', JSON.parse(JSON.stringify(results)));
                    })

                 } )
    })

    socket.on('edit', data => {
        const edit = objContenedor.replaceById(data)
            edit.then ( ()=>{ 

                const data = objContenedor.getAll()
                data.then(results => { 
                io.sockets.emit('tabla', JSON.parse(JSON.stringify(results)));
                    })

            })

    })
    
    socket.on('filterById', id => {
        const filter = objContenedor.getByid(id)
        filter.then (results => {
            io.sockets.emit('tabla', JSON.parse(JSON.stringify(results)));

        })
    })
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


app.post('/productos', (req, res) => {
    const data = {
        title: req.body.title,
        price: req.body.price,
        thumbnail: req.body.thumbnail,
    }
    console.log(data)
    const guardar = objContenedor.save(data);
    guardar.then( () => {
        console.log('done')
        res.redirect('/')
    })
    .catch ( err => {console.log(err)})
})





const PORT = 8081;
const server = httpServer.listen(PORT, () => {
    console.log('Escuchando en el puerto ' + PORT);
})

server.on('err', (error) => {
    console.log(error)
})



