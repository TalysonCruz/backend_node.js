import express from "express"
import publicRoutes from "./routes/public.js"
import privateRoutes from "./routes/private.js"
import cors from "cors"
const app = express();

app.use(cors())
app.use(express.json());
app.use("/", publicRoutes)
app.use("/", privateRoutes)


app.listen(3000, () => console.log("Servidor Online"))