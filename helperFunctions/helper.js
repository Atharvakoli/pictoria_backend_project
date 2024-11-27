const { tag: tagModel } = require("../models");

const getTagsByPhotoId = async (photoId) => {
  const tags = await tagModel.findAll({ where: { photoId } });
  return tags;
};

const getPhotosWitTags = async (photosData) => {
  const tagsData = await getTagsByPhotoId(photosData.id);
  let tags = [];
  for (let i = 0; i < tagsData.length; i++) {
    tags.push(tagsData[i].dataValues.name);
  }

  return {
    ...photosData,
    tags,
  };
};

module.exports = { getPhotosWitTags };
