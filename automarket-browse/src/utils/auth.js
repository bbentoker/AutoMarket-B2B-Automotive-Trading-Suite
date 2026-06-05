export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token, expirationDate) => {
  localStorage.setItem('token', token);
  localStorage.setItem('tokenExpiration', expirationDate);
};

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiration');
};

export const isTokenValid = () => {
  const token = getToken();
  const expiration = localStorage.getItem('tokenExpiration');
  
  if (!token || !expiration) {
    return false;
  }

  return new Date(expiration) > new Date();
};

export const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;
  
  const parsed = parseJwt(token);
  return parsed ? { 
    id: parsed.id, 
    role: parsed.role,
    name: parsed.name ,
    language: parsed.language
  } : null;
}; 