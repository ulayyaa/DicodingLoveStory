import { getActiveRoute } from '../routes/url-parser';
import { ACCESS_TOKEN_KEY } from '../config';

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem('accessToken');

    if (!accessToken === 'null' || accessToken === 'undefined') {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('putAccessToken: error:', error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('getLogout: error:', error);
    return false;
  }
}

const unauthenticatedRoutesOnly = ['/login', '/register'];

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    location.hash = '/';
    return null;
  }

  return page;
}

export function checkAuthenticatedRoute(page) {
  const isLogin = !!getAccessToken();
  if (!isLogin) {
    // Ganti hash
    if (location.hash !== '#/login') {
      location.hash = '/login';
    }
    // Paksa render ulang
    setTimeout(() => {
      if (window.app && typeof window.app.renderPage === 'function') {
        window.app.renderPage();
      }
    }, 0);
    return null;
  }
  return page;
}

export function getLogout() {
  removeAccessToken();
}
