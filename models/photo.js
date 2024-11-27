module.exports = (sequelize, DataTypes) => {
  const photo = sequelize.define(
    "photo",
    {
      imageUrl: DataTypes.STRING,
      description: DataTypes.STRING,
      altDescription: DataTypes.STRING,
      dateSaved: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: {
          module: "user",
          key: "id",
        },
      },
    },
    { timestamps: true }
  );

  photo.associate = (models) => {
    photo.belongsTo(models.user, { foreignKey: "userId" });
    photo.hasMany(models.tag, { foreignKey: "photoId" });
  };
  return photo;
};
