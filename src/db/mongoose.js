const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/airline2", {
    useNewUrlParser: true,
    useUnifiedTopology: true
    // useCreateIndex: true
});

mongoose.connection.once("open", function() {
    console.log("mongodb database connection established successfully");
});

