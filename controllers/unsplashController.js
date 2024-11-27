const axiosInstance = require("../lib/axios.lib");
const { validateQuery } = require("../service/index.service");

const searchImages = async (req, res) => {
  try {
    // getting query from body
    let { query } = req.query;

    // validating query
    let isValidQuery = validateQuery(query);

    // checking in query if any error occrs
    if (isValidQuery.length > 0) {
      return res.status(400).json({ errors: isValidQuery });
    }

    // checking clienti-id in getting or not
    if (!process.env.CLIENT_ID) {
      throw new Error("Client_ID is missing :) ");
    }

    // getting response from unsplash via api endpoint
    const response = await axiosInstance.get(`/search/photos?query=${query}`, {
      headers: {
        Authorization: `Client-ID ${process.env.CLIENT_ID}`,
      },
    });

    // if response data is zero
    if (response.data.results.length === 0) {
      return res
        .status(200)
        .json({ message: "No images found for the given query." });
    }

    // extracting data from response
    const extractedData = response.data.results.map(
      ({ urls, description, alt_description }) => ({
        imageUrl: urls.regular,
        description,
        altDescription: alt_description,
      })
    );
    // sending json response to client
    res.json(extractedData);
  } catch (error) {
    res
      .status(500)
      .json({ error: `Failed to GET photos, since ${error.message}` });
  }
};

module.exports = { searchImages };
