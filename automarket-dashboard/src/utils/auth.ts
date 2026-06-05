interface User {
  id: number;
  role: string;
  name: string;
}

interface JwtPayload {
  id: number;
  role: string;
  name: string;
  exp?: number;
  iat?: number;
  expiresIn?: string;
}

export const getToken = (): string | null => {
  const token = localStorage.getItem('token');
  return token;
};

export const setToken = (token: string, expirationDate: string): void => {
  console.log('💾 Storing token in localStorage:');
  console.log('  Token:', token);
  console.log('  Expiration:', expirationDate);
  
  localStorage.setItem('token', token);
  localStorage.setItem('tokenExpiration', expirationDate);
  
  // Verify storage
  const storedToken = localStorage.getItem('token');
  const storedExpiration = localStorage.getItem('tokenExpiration');
  
  console.log('✅ Verification - Token stored:', !!storedToken);
  console.log('✅ Verification - Expiration stored:', !!storedExpiration);
  console.log('  Stored token:', storedToken);
  console.log('  Stored expiration:', storedExpiration);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiration');
};

export const isTokenValid = (): boolean => {
  const token = getToken();
  const expiration = localStorage.getItem('tokenExpiration');
  
  if (!token || !expiration) {
    return false;
  }

  const expirationDate = new Date(expiration);
  const currentDate = new Date();
  const isValid = expirationDate > currentDate;
  
  return isValid;
};

export const parseJwt = (token: string): JwtPayload | null => {
  try {
    console.log('🔍 Parsing JWT token:', token);
    const parts = token.split('.');
    console.log('🔍 Token parts count:', parts.length);
    
    if (parts.length !== 3) {
      console.log('❌ Invalid JWT format - expected 3 parts, got:', parts.length);
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    console.log('🔍 Parsed JWT payload:', payload);
    return payload;
  } catch (e) {
    console.log('❌ Failed to parse JWT:', e);
    return null;
  }
};

export const getUserFromToken = (): User | null => {
  const token = getToken();
  if (!token) return null;
  
  const parsed = parseJwt(token);
  return parsed ? { 
    id: parsed.id, 
    role: parsed.role,
    name: parsed.name 
  } : null;
}; 