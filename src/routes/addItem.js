const db = require('../persistence');
const {v4 : uuid} = require('uuid');

module.exports = async (req, res) => {
    // 创建一个新项
    const item = {
        id: uuid(),
        name: req.body.name,
        completed: false,
    };

    // 将新项存储到数据库中
    await db.storeItem(item);
    // 返回新项
    res.send(item);
};
