module.exports = (sequelize, DataTypes) => {
  const tag = sequelize.define(
    "tag",
    {
      name: DataTypes.STRING,
      photoId: {
        type: DataTypes.INTEGER,
        references: {
          model: "photo",
          key: "id",
        },
      },
    },
    { timestamps: true }
  );

  tag.associate = (models) => {
    tag.belongsTo(models.photo, { foreignKey: "photoId" });
  };
  return tag;
};
