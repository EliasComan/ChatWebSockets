const mongoose = require('mongoose')
const { config } = require('../src/utils/config')


 mongoose.connect(config.atlas.url, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    })

class contenedorAtlas {
    constructor(colection,schema){
        this.colection = mongoose.model(colection,schema)
    }


    async save (object) { 
        return await this.colection.insertMany(object)
    }
    async saveAll (object) { 
        
        return await this.colection.insertMany(object)
    }

    async getByid ( id){ 
        return await this.colection.find({_id:id})
     
     }
    async getAll () {
       return  await this.colection.find()
        
         
        }     
    async deleteById(id){
         return await this.colection.deleteOne({_id:id})
         
     }
    deleteAll () {
     
     }

    async closeConecction (){
        return await mongoose.disconnect()
    
    }
}



module.exports =  contenedorAtlas 