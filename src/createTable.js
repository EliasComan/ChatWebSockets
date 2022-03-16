const { options } =  require('./utils/options')
const knex =  require('knex')(options);

knex.schema.createTable('productos', table => { 
    table.increments('id');
    table.string('title', 25).notNullable();
    table.integer('price').notNullable();
    table.string('thumbnail',500).notNullable();
})
.then(() => {
    console.log('done')
})
.catch((err) => {
   console.log(err)
})
.finally(()=> {
    knex.destroy();
})

