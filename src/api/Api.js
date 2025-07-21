import axios from "axios";

const API_TOKEN = import.meta.env.VITE_SUPERHERO_API_TOKEN;
const BASE_URL = `https://superheroapi.com/api.php/${API_TOKEN}`;
// ... rest of code
const cache = {};

export async function getHeroById(id) {
  if (cache[id]) return cache[id];

  try {
    const res = await axios.get(`${BASE_URL}/${id}`);
    cache[id] = res.data;
    return res.data;
  } catch (err) {
    console.error(`Error fetching hero ID ${id}:`, err);
    return null;
  }
}

export async function getMultipleHeroes(startId = 1, endId = 50) {
  const requests = [];
  for (let id = startId; id <= endId; id++) {
    requests.push(getHeroById(id));
  }

  const heroes = await Promise.all(requests);
  return heroes.filter(hero => hero?.name && hero?.image?.url);
}

export const searchHeroes = async (name) => {
  try {
    const response = await axios.get(`${BASE_URL}/search/${name}`);
    if (response.data.response === "error") {
      throw new Error(response.data.error);
    }
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};