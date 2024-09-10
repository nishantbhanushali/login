import { app } from "./app.js";
import dotenv from "dotenv"
import {connectdb} from "./db/index.js";

dotenv.config({ 
    path: './.env' 
});



let PORT = process.env.PORT || 8001


app.get("/", (req, res) =>{
    res.json("helo wrdl")
})

connectdb()
  .then(() => {
    // Start the server after the DB is connected
    app.listen(PORT, () => {
      console.log('This server is working on port ' + PORT);
    });
  })
  .catch((error) => {
    // Handle the error if MongoDB connection fails
    console.error('MongoDB not connected:', error.message);
    process.exit(1); // Optionally exit the process if the DB connection is critical
  });