const { options } =  require('./utils/options')
const knex =  require('knex')(options);

const productos = [ 
    {
        title: "Escuadra",
        price: 123.,
        thumbnail:"https://cdn3.iconfinder.com/data/icons/education-209/64/ruler-triangle-stationary-school-256.png",
    },
    {
        title: "Calculadora",
        price: 234,
        thumbnail: "https://cdn3.iconfinder.com/data/icons/education-209/64/calculator-math-tool-school-256.png",
    },
    {
        title: "Globo Terráqueo",
        price: 345,
        thumbnail:"https://cdn3.iconfinder.com/data/icons/education-209/64/globe-earth-geograhy-planet-school-256.png",
    },
    {
        title: "Lapiz",
        price: 122,
        thumbnail:"https://cdn1.iconfinder.com/data/icons/material-design-icons-light/24/pencil-256.png",
    },
    {
        title: "Tijeras",
        price: 522,
        thumbnail: "https://cdn1.iconfinder.com/data/icons/school-and-education-outline/64/Education_Line-34-256.png",
    },
    {
        title: "Borrador",
        price: 54,
        thumbnail:"https://cdn0.iconfinder.com/data/icons/aami-web-internet/64/aami15-42-256.png",
    },
    {
        title: "mochila",
        price: 5400,
        thumbnail: "https://cdn0.iconfinder.com/data/icons/education-364/24/schoolbag-backpack-bag-school-education-learning-128.png",
    },
    {
        title: "Tijeras",
        price: 522.67,
        thumbnail: "https://cdn1.iconfinder.com/data/icons/school-and-education-outline/64/Education_Line-34-256.png",
    },
    {
        title: "Anotador",
        price: 865.67,
        thumbnail: "https://cdn1.iconfinder.com/data/icons/office-322/24/notebook-book-notepad-spiral-256.png",
    },
    {
        title: "Compas",
        price: 264.22,
        thumbnail: "https://cdn2.iconfinder.com/data/icons/lined-office-and-school-supplies/512/compass-256.png",
    }


]

knex('productos').insert(productos)
        .then (()=> {
            console.log('done')

        })
        .catch(err => 
            {console.log (err)
            })
        .finally( () => 
            knex.destroy())

            