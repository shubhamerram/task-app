const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
}).catch((error) => console.log(error))