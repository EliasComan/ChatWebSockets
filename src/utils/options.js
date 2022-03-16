const mysql =   {
    client: 'mysql',
    connection: {
        host: 'localhost',
        user: 'root',
        database: 'productos'
    }
}

const optionsSlqLite3 = {
    client: 'better-sqlite3',
    connection: { filename:  './DB/ecommerce.db3' },
    useNullAsDefault: true
}
module.exports =  { mysql, optionsSlqLite3}

