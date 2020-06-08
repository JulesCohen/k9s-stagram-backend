const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const postsRoutes = require("./routes/posts-routes");
const app = express();

app.use(bodyParser.json());
app.use("/api/posts", postsRoutes);
app.listen(process.env.PORT || 5000);
