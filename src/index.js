const express = require('express');
const app = express();
require('./db/mongoose');

const userRoutes = require('./routes/user');
const taskRoutes = require('./routes/task');
const PORT = process.env.PORT

app.use(express.json());
app.use(userRoutes);
app.use(taskRoutes);
app.listen(PORT, () => {
    console.log('Server started on port '+PORT);
})