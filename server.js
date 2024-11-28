const { app } = require("./index");
const { sequelize } = require("./models");

sequelize
  .authenticate()
  .then(() => console.log("Database connected successfully :) "))
  .catch((error) =>
    console.log(`Unable to connect to Database, since ${error}`)
  );

app.listen(3000, () => {
  console.log(`Example app listening on http://localhost:${3000}`);
});
