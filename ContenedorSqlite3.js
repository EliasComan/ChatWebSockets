const fs =  require('fs');
const knexLib = require('knex')

class Contenedor {
    constructor(options){
        this.knex = knexLib(options)
    }


    createTable ( ) {
       // return this.knex.schema.dropTableIfExists('mensajes')
       // .finally ( () => {
         return  this.knex.schema.createTable('mensajes', table => { 
            table.increments('id');
            table.string('email', 25).notNullable();
            table.string('mensaje',200).notNullable();
            table.string('timestamp',50).notNullable();
            })
        //})
    }
    save (object) { 
       return  this.knex('mensajes').insert(object)
    }
    getAll () {
       return  this.knex.from('mensajes').select('*')
         
        }     

     closeConecction (){
            this.knex.destroy()
     }
}



module.exports = Contenedor;