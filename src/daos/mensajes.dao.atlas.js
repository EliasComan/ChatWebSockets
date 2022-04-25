const fs = require('fs')
const  contenedorAtlas  = require('../contenedores/contenedorAtlas')


class productosDaoAtlas extends contenedorAtlas{
    constructor(){
        super('mensajes', {
            email:{type:String, require:true},
            timestamp:{type:String, require: true},
            message:{type:String, require: true}
        })
    }
}

module.exports =  productosDaoAtlas