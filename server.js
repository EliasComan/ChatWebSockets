const handlebars = require('express-handlebars')
const express = require('express')
const bodyParser = require('body-parser')
const {Server: HttpServer} = require('http');
const { Server: IOServer, Socket} = require('socket.io');
const { faker } = require('@faker-js/faker')
const connectMongo = require('connect-mongo')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
const strategy =  require('passport-facebook').Strategy;
const dotenv = require('dotenv')
const cpus = require('os')


/* ---------------------- DATABASES ----------------------*/
dotenv.config()
//SQL
const   { mysql, optionsSlqLite3 }  = require('./src/utils/options')
const Contenedor = require('./src/contenedores/Contenedor')
const objContenedor = new Contenedor(mysql,'productos');
//MONGODB 
const mensajesdao = require('./src/daos/mensajes.dao.atlas');
const mensajes = new mensajesdao()
const MongoStore = connectMongo.create({
    mongoUrl:  `mongodb+srv://coderhouse:${process.env.PASSWORD_MONGO}@cluster0.wikgb.mongodb.net/sessions?retryWrites=true&w=majority `,
    ttl:15
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
app.engine('.hbs', handlebars.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    extname: '.hbs'
}))
//COOKIES
app.use(cookieParser());
app.use(session({
    store: MongoStore,
    secret: '123456789!@#$%^&*()',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

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


/* ---------------------- Login with facebook ----------------------*/
const FACEBOOK_APP_ID = 1489997691443335
const FACEBOOK_SECRET_KEY =  `${process.env.FACEBOOK_SECRET_KEY}`

passport.use(new strategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_SECRET_KEY,
    callbackURL: "http://localhost:8080/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  }, 
  function(accessToken, refreshToken, profile, cb) {
    console.log('accessToken: ', accessToken)
    console.log('refreshToken: ', refreshToken)
    console.log(profile);
    cb(null, profile);
  }
));
passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((obj, cb) => {
    cb(null, obj);
});
//ROUTES
app.get('/' ,(req,res) => {
    if (req.session.nombre) {
        const nombre = req.session.name;
        console.log(nombre)
        res.render('./partials/Bienvenida',{nombre:nombre})
    }else{

        res.render('./partials/login')
    }
})


app.post('/login', (req, res) => {
    const nombre = req.body.name;
    req.session.name = nombre
    if (req.session.name) {
        res.render('./partials/Bienvenida',{nombre:nombre})
    }else{
        res.redirect('/')
    }
})

app.post('/logout' , (req, res) => {
    req.session.destroy( (err) => {
        console.log(err)
    })
    res.json({data:'Hasta Luego'})
})
app.get('/logout', (req,res) => {
    res.render('./partials/logout')
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

app.get('/login/facebook', passport.authenticate('facebook'));


app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/', successRedirect: '/datos', authType: 'reauthenticate' }));

app.get('/datos', (req, res)=>{
    if(req.isAuthenticated()){
     if (!req.user.contador) {
         req.user.contador = 0
     }
     req.user.contador++
     const datosUsuario = {
         nombre: req.user.displayName,
         foto: req.user.photos[0].value,
         mail: req.user.email
     }
     res.render('./partials/datos', {contador: req.user.contador, datos: datosUsuario});
    } else {
     res.redirect('/')
     console.log('USuario no autentciado')
    }
 });
const server = httpServer.listen( process.argv[2] || 8080, () => {
    console.log('Server up')
    console.log(process.argv[2])
})

server.on('err', (error) => {
    console.log(error)
})