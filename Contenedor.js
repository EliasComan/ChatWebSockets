const fs =  require('fs');
const knexLib = require('knex')

class Contenedor {
    constructor(options,tabla){
        this.knex = knexLib(options)
        this.tabla = tabla
    }

    createTablemariaDB ( ) {

        return this.knex.schema.dropTableIfExists(this.tabla)
        .finally ( 
            () => {  this.knex.schema.createTable(this.tabla, table => { 
            table.increments('id');
            table.string('title', 25).notNullable();
            table.integer('price').notNullable();
            table.string('thumbnail',500).notNullable();
            })
        })
    }
    createTableSqlite3 (){
        return  this.knex.schema.createTable(this.tabla, table => { 
            table.increments('id');
            table.string('email', 25).notNullable();
            table.string('mensaje',200).notNullable();
            table.string('timestamp',50).notNullable();
            })
    }

    save (object) { 
       return  this.knex(this.tabla).insert(object)
    }
    getByid ( id){ 
        return this.knex.from(this.tabla).select('*').where('id', '=', id)
     
     }
    getAll () {
       return  this.knex.from(this.tabla).select('*')
         
        }     
    deleteById(id){
        return this.knex.from(this.tabla).where('id', '=', id).del()
         
     }
    replaceById(newData){
      return this.knex.from(this.tabla).where('id', newData.id).update({title:newData.title, price:newData.price, thumbnail:newData.thumbnail })
      
     }
    deleteAll () {
     
     }

     closeConecction (){
            this.knex.destroy()
     }
}



module.exports = Contenedor;