const { options } =  require('./utils/options')
const knex =  require('knex')(options);

knex.from('productos').where('id', 5).update({price:12})
    .then(products => {
        console.log(products)
    }).catch(err => 
        {console.log (err)
        })
    .finally( () => 
        knex.destroy())