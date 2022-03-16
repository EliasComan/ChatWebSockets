const fs =  require('fs');
const knexLib = require('knex')

class Contenedor {
    constructor(options){
        this.knex = knexLib(options)
    }

    createTable ( ) {

        return this.knex.schema.dropTableIfExists('productoss')
        .finally ( 
            () => {  this.knex.schema.createTable('productos', table => { 
            table.increments('id');
            table.string('title', 25).notNullable();
            table.integer('price').notNullable();
            table.string('thumbnail',500).notNullable();
            })
        })
    }

    save (object) { 
       return  this.knex('productos').insert(object)
    }
    getByid ( id){ 
        return this.knex.from('productos').select('*').where('id', '=', id)
     
     }
    getAll () {
       return  this.knex.from('productos').select('*')
         
        }     
    deleteById(id){
        return this.knex.from('productos').where('id', '=', id).del()
         
     }
    replaceById(newData){
      return this.knex.from('productos').where('id', newData.id).update({title:newData.title, price:newData.price, thumbnail:newData.thumbnail })
      
     }
    deleteAll () {
     
     }

     closeConecction (){
            this.knex.destroy()
     }
}



module.exports = Contenedor;