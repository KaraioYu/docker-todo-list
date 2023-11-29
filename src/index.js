const express = require('express');
const app = express();

// 加载路由
const getItems = require('./routes/getItems');
const addItem = require('./routes/addItem');
const updateItem = require('./routes/updateItem');
const deleteItem = require('./routes/deleteItem');

// 设置中间件

// 加载express模块的json中间件
// 具体来讲， "app.use()" 是 Express 的一个方法，它用来加载用于处理 http 请求的 middleware（中间件）。当一个请求发送到服务器时，这个请求会依次通过各个中间件进行处理，每个中间件都可以对请求进行一些特定的处理。
// "express.json()" 是一个内置的中间件函数，它负责解析请求体中的 JSON 格式的数据，并将其转化为 JavaScript 对象。然后这个对象就会被赋值到 req.body 属性中，这样在处理请求时，我们就可以直接通过 req.body 来访问请求体中的数据了。
// 因此，如果我们希望在 Express 中处理 JSON 格式的请求数据，就需要在应用启动时添加 "app.use(express.json());" 这行代码。
app.use(express.json());

// 这行代码在Express应用中添加了一个中间件，这个中间件函数将传入的路径设置为提供静态资源的目录。
// 例如，如果你的 'static' 目录里有一个 'image.jpg'文件，那么就可以通过访问 'http://你的服务器地址/static/image.jpg' 来获取这个图片。
app.use(express.static(__dirname + '/static'));

// 设置路由
app.get('/items', getItems);
app.post('/items', addItem);
app.put('/items/:id', updateItem);
app.delete('/items/:id', deleteItem);

// 初始化数据库
const db = require('./persistence');
db.init().then(() => {
    app.listen(3000, () => console.log('Listening on port 3000'));
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

// 启动应用后，如果收到SIGINT、SIGTERM或SIGUSR2信号，则执行gracefulShutdown函数
const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
