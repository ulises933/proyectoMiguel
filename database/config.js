import mongoose from "mongoose";
import "dotenv/config"
try{
    await mongoose.connect(process.env.URI_MONGO);
    console.log("Coneccion lograda");
}catch(error){
    console.log("Error de coneccion:" + error);

}