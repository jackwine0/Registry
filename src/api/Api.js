import axios from "axios";

const API_TOKEN = import.meta.env.VITE_SUPERHERO_API_TOKEN;
const BASE_URL = `https://superheroapi.com/api.php/${API_TOKEN}`;

const cache = {
  heroById: {},
  search: {},
  pending: {}
};

// --- Get hero by ID with cache + deduping ---
export async function getHeroById(id) {
  if (cache.heroById[id]) return cache.heroById[id];
  if (cache.pending[id]) return cache.pending[id];

  const request = axios.get(`${BASE_URL}/${id}`)
    .then(res => {
      cache.heroById[id] = res.data;
      delete cache.pending[id];
      return res.data;
    })
    .catch(err => {
      delete cache.pending[id];
      console.error(`Error fetching hero ID ${id}:`, err);
      return null;
    });

  cache.pending[id] = request;
  return request;
}

// --- Get multiple heroes efficiently ---
export async function getMultipleHeroes(startId = 1, endId = 50) {
  const requests = [];
  for (let id = startId; id <= endId; id++) {
    requests.push(getHeroById(id));
  }
  const heroes = await Promise.all(requests);
  return heroes.filter(hero => hero?.name && hero?.image?.url);
}

// --- Search with caching ---
export const searchHeroes = async (name) => {
  const query = name.trim().toLowerCase();
  if (cache.search[query]) return cache.search[query];

  try {
    const response = await axios.get(`${BASE_URL}/search/${query}`);
    if (response.data.response === "error") {
      throw new Error(response.data.error);
    }
    cache.search[query] = response.data;
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};
