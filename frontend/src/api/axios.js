import axios from 'axios';


const instance = axios.create({
baseURL: 'https://tezz.kg/api/',
headers: { 'Content-Type': 'application/json' },
});


// attach token if present
const token = typeof window !== 'undefined' ? localStorage.getItem('access') : null;
if (token) instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;


export default instance;