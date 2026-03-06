const app = require('./src/app');
const dotenv = require('dotenv');
dotenv.config();
const connectToDB = require('./src/config/database');

const port = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectToDB();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Application startup failed:', error.message);
    process.exit(1);
  }
}

startServer();

module.exports = app;
