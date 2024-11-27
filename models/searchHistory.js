module.exports = (sequelize, DataTypes) => {
  const searchHistory = sequelize.define("searchHistory", {
    query: DataTypes.INTEGER,
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: "user",
        key: "id",
      },
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  searchHistory.associate = (models) => {
    searchHistory.belongsTo(models.user, { foriegnKey: "userId" });
  };

  return searchHistory;
};
