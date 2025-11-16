require('dotenv').config();
const app = require('./src/app');
const dbConnect = require('./src/db/db');
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  dbConnect();
});