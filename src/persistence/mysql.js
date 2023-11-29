const waitPort = require('wait-port');
const fs = require('fs');
const mysql = require('mysql2');

const {
    MYSQL_HOST: HOST,
    MYSQL_HOST_FILE: HOST_FILE,
    MYSQL_USER: USER,
    MYSQL_USER_FILE: USER_FILE,
    MYSQL_PASSWORD: PASSWORD,
    MYSQL_PASSWORD_FILE: PASSWORD_FILE,
    MYSQL_DB: DB,
    MYSQL_DB_FILE: DB_FILE,
} = process.env;

let pool;

console.log(process.env);

// 异步函数，用于初始化
async function init() {
    // 从文件中读取HOST
    const host = HOST_FILE ? fs.readFileSync(HOST_FILE) : HOST;
    // 从文件中读取USER
    const user = USER_FILE ? fs.readFileSync(USER_FILE) : USER;
    // 从文件中读取PASSWORD
    const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE) : PASSWORD;
    // 从文件中读取DB
    const database = DB_FILE ? fs.readFileSync(DB_FILE) : DB;

    // 等待端口3306连接成功
    await waitPort({ 
        host, 
        port: 3306,
        timeout: 10000,
        waitForDns: true,
    });

    // 创建连接池
    pool = mysql.createPool({
        connectionLimit: 5,
        host,
        user,
        password,
        database,
        charset: 'utf8mb4',
    });

    // 执行查询语句，创建todo_items表，如果存在则不创建
    return new Promise((acc, rej) => {
        pool.query(
            'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean) DEFAULT CHARSET utf8mb4',
            err => {
                if (err) return rej(err);

                console.log(`Connected to mysql db at host ${HOST}`);
                acc();
            },
        );
    });
}

// 异步函数，用于销毁连接池
async function teardown() {
    return new Promise((acc, rej) => {
        pool.end(err => {
            if (err) rej(err);
            else acc();
        });
    });
}

// 异步函数，用于获取所有todo_items
async function getItems() {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM todo_items', (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(item =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                ),
            );
        });
    });
}

// 异步函数，用于获取指定id的todo_items
async function getItem(id) {
    return new Promise((acc, rej) => {
        pool.query('SELECT * FROM todo_items WHERE id=?', [id], (err, rows) => {
            if (err) return rej(err);
            acc(
                rows.map(item =>
                    Object.assign({}, item, {
                        completed: item.completed === 1,
                    }),
                )[0],
            );
        });
    });
}

// 异步函数，用于存储todo_items
async function storeItem(item) {
    return new Promise((acc, rej) => {
        pool.query(
            'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
            [item.id, item.name, item.completed ? 1 : 0],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

// 异步函数，用于更新todo_items
async function updateItem(id, item) {
    return new Promise((acc, rej) => {
        pool.query(
            'UPDATE todo_items SET name=?, completed=? WHERE id=?',
            [item.name, item.completed ? 1 : 0, id],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

// 异步函数，用于删除todo_items
async function removeItem(id) {
    return new Promise((acc, rej) => {
        pool.query('DELETE FROM todo_items WHERE id = ?', [id], err => {
            if (err) return rej(err);
            acc();
        });
    });
}

module.exports = {
    init,
    teardown,
    getItems,
    getItem,
    storeItem,
    updateItem,
    removeItem,
};
