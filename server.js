const handlebars = require('express-handlebars')
const express = require('express')
const bodyParser = require('body-parser')
const {Server: HttpServer} = require('http');
const { Server: IOServer} = require('socket.io');
const { faker } = require('@faker-js/faker')
const connectMongo = require('connect-mongo')
const cookieParser = require('cookie-parser');
const session = require('express-session');


/* ---------------------- DATABASES ----------------------*/
//SQL
const   { mysql, optionsSlqLite3 }  = require('./src/utils/options')
const Contenedor = require('./contenedores/Contenedor.js')
const objContenedor = new Contenedor(mysql,'productos');
//const objContenedorqlite3 = new Contenedor(optionsSlqLite3,'mensajes')
//MONGODB 
const mensajesdao = require('./daos/mensajes.dao.atlas');
const mensajes = new mensajesdao()
const MongoStore = connectMongo.create({
   mongoUrl: 'mongodb+srv://coderhouse:coderhouse@cluster0.wikgb.mongodb.net/sessions?retryWrites=true&w=majority',
   ttl:100
})


/* ---------------------- Instancia de express ----------------------*/
const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);

/* ---------------------- MIDDLEWEARS ----------------------*/
app.use(express.json())
app.use(bodyParser.urlencoded({extended : true}))
app.set('view engine', 'hbs')
app.set('views', './views')
//COOKIES
app.use(cookieParser());
app.use(session({
    store: MongoStore,
    secret: '123456789!@#$%^&*()',
    resave: false,
    saveUninitialized: false
}));
    

//WEBSOCKETS

let mensajesDatabase = []

io.on('connection',  async socket => {
    const data = objContenedor.getAll()
    data.then(results => { 
    io.sockets.emit('tabla', JSON.parse(JSON.stringify(results)));
        })
        .catch(err => console.log(err))

        const getMensajes =mensajes.getAll();
        
        getMensajes.then ( res => {
            mensajesDatabase = res
           })
    socket.emit('mensajes', mensajesDatabase);
   

    socket.on('new-message', async data => {
        await  mensajes.save(data)
        const getMensajes = mensajes.getAll();
        getMensajes.then ( res => {
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
        
app.get('/session', (req,res) => {
    if (req.session.contador) {
        req.session.contador++;
        res.send(`Ud ha visitado el sitio ${req.session.contador} veces`)
    } else {
        req.session.contador = 1;
        res.send('Bienvenido!');
    }
})

//ROUTES
app.get('/' ,(req,res) => {
    if (req.session.contador) {
        req.session.contador++
    }
    else{
        req.session.contador = 1
    }
    res.render('./partials/formulario',{session:req.session.contador})
})

function generarRandomObjeto() {
    return {
        title: faker.commerce.product(),
        price: faker.commerce.price(50, 5200, 0, '$'),
        thumbnail: faker.image.business(1234, 2345, true)
    }
}
app.get('/api/productos-test', (req, res) => {
   const productosgenerados = []
    for (let index = 0; index < 5; index++) {
        const element = generarRandomObjeto();
        productosgenerados.push(element)
        
    }
    res.render('./partials/productos',{exist:true, datos:productosgenerados})


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





const PORT = 8181;
const server = httpServer.listen(PORT, () => {
    console.log('Escuchando en el puerto ' + PORT);
})

server.on('err', (error) => {
    console.log(error)
})



