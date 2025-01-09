import mongoose from "mongoose";

const connectdb = async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        console.log("MongoDB connected successfully")

    

    } catch (error) {
        console.log("ERROR",error);
    }
}
export default connectdb;