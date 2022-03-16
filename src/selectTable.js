const { options } =  require('./utils/options')
const knex =  require('knex')(options);

knex.from('productos').select('*')
    .then(products => {
        console.log(products)
    }).catch(err => 
        {console.log (err)
        })
    .finally( () => 
        knex.destroy())