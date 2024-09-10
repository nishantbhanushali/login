import express from "express"

let app  = express()
app.use(express.json());
import { router } from "./routes/auth.route.js"


app.use("/api/v1/auth", router)


export {app}