import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/game`,
});

export const getStatus = async () => {
  const { data } = await api.get('/status');
  return data;
};

export const submitGuess = async (guess, turnstileToken) => {
  const { data } = await api.post('/guess', { guess, 'cf-turnstile-token': turnstileToken });
  return data;
};

export const saveWinner = async (username, guesses, turnstileToken) => {
  const { data } = await api.post('/winners', { username, guesses, 'cf-turnstile-token': turnstileToken });
  return data;
};

export const getWinners = async () => {
  const { data } = await api.get('/winners');
  return data;
};
