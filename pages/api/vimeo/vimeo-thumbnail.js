import axios from 'axios';

export default async (req, res) => {
  const { videoId } = req.body;

  const url = `https://vimeo.com/api/v2/video/${videoId}.json`;

  try {
    const response = await axios.get(url);

    if (response.status !== 200) {
      console.error(`Error fetchingVimeo thumbnail: ${response.statusText}`);
      return res.status(500).json({ error: 'Failed to fetch Vimeo thumbnail' });
    }

    const videoData = response.data[0]; // JSON response is an array
    const thumbnailUrl = videoData.thumbnail_large;

    res.status(200).json({ thumbnailUrl });
  } catch (error) {
    console.error('Error fetching Vimeo thumbnail:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({ error: 'Failed to fetchVimeo thumbnail' });
  }
};
