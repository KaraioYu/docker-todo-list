const db = require('../persistence');

module.exports = async (req, res) => {
    // 获取数据库中的项目
    const items = await db.getItems();
    // 返回项目列表
    res.send(items);
};
