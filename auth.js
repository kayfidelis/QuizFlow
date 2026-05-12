// ============================================================
// auth.js — Autenticação do frontend
// ============================================================

const Auth = (() => {
  const TOKEN_KEY = 'qf_token';
  const USER_KEY = 'qf_user';

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function getUser() {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
    catch(e) { return null; }
  }

  function setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function isLoggedIn() { return !!getToken(); }

  // Guard: redireciona para login se não autenticado
  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  }

  // Guard: redireciona para dashboard se já logado
  function requireGuest() {
    if (isLoggedIn()) {
      window.location.href = 'dashboard.html';
      return false;
    }
    return true;
  }

  return { getToken, getUser, setSession, logout, isLoggedIn, requireAuth, requireGuest };
})();
