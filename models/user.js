module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      username: DataTypes.STRING,
      email: DataTypes.STRING,
    },
    {
      timestamps: true,
    }
  );

  user.associate = (models) => {
    user.hasMany(models.photo, { foreignKey: "userId" });
    user.hasMany(models.searchHistory, { foreignKey: "userId" });
  };

  return user;
};
