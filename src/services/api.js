import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/game`,
});

export const getStatus = async () => {
  const { data } = await api.get('/status');
  return data;
};

export const submitGuess = async (guess) => {
  const { data } = await api.post('/guess', { guess });
  return data;
};

export const submitGuessWithWinner = async (guess, username) => {
  const { data } = await api.post('/guess', { guess, username });
  return data;
};

export const getWinners = async () => {
  const { data } = await api.get('/winners');
  return data;
};
