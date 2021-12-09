import 'express-async-errors'
import express from 'express';
import "reflect-metadata";
import routes from './routes';
import {createConnection} from "typeorm";
import {globalErrors} from './middlewares/globalErrors'



createConnection()
.then(connection => {
  // here you can start to work with your entities
  const app = express();
  const PORT = 3333;

  app.use(express.json())
  app.use(routes);

  app.use(globalErrors)

  app.listen(PORT, async () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
  });

  console.log("banco ok")
})
.catch(error => {
  console.log("Unable to connect to the database", error)
});

