module.exports = (sequelize, DataTypes) => {
    const EmailTemplate = sequelize.define(
        "EmailTemplate",
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: { type: DataTypes.STRING, allowNull: false },
            subject: { type: DataTypes.STRING, allowNull: false },
            body: { type: DataTypes.TEXT, allowNull: false },
        },
        {
            tableName: "email_templates",
            underscored: true,
            timestamps: true,
        }
    );

    return EmailTemplate;
};
