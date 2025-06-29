const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];

const db = {};
const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
);

fs.readdirSync(__dirname)
    .filter(
        (file) =>
            file.indexOf(".") !== 0 &&
            file !== basename &&
            file.slice(-3) === ".js" &&
            fs.statSync(path.join(__dirname, file)).isFile()
    )
    .forEach((file) => {
        try {
            const model = require(path.join(__dirname, file));
            if (typeof model === 'function') {
                const modelInstance = model(sequelize, Sequelize.DataTypes);
                db[modelInstance.name] = modelInstance;
            }
        } catch (error) {
            console.warn(`Warning: Could not load model from file ${file}:`, error.message);
        }
    });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
