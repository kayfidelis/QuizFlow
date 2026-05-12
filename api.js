// ============================================================
// api.js — Camada de comunicação com o Apps Script
// ============================================================

const API = (() => {
  // ⚠️ CONFIGURAR: Substitua pela URL do seu Web App do Apps Script
  const BASE_URL = localStorage.getItem('qf_api_url') || '';

  function getToken() {
    return localStorage.getItem('qf_token') || '';
  }

  async function get(action, params = {}) {
    if (!BASE_URL) throw new Error('API URL não configurada');

    const url = new URL(BASE_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('token', getToken());
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, v);
    });

    const res = await fetch(url.toString(), {
      method: 'GET',
      redirect: 'follow'
    });

    if (!res.ok) throw new Error('Erro de rede: ' + res.status);
    const data = await res.json();

    if (data.code === 401) {
      Auth.logout();
      window.location.href = 'index.html';
      return;
    }

    return data;
  }

  async function post(action, body = {}) {
    if (!BASE_URL) throw new Error('API URL não configurada');

    const res = await fetch(BASE_URL, {
      method: 'POST',
      redirect: 'follow',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, token: getToken(), ...body })
    });

    if (!res.ok) throw new Error('Erro de rede: ' + res.status);
    const data = await res.json();

    if (data.code === 401) {
      Auth.logout();
      window.location.href = 'index.html';
      return;
    }

    return data;
  }

  return {
    // Auth
    login: (email, password) => post('login', { email, password }),
    register: (email, password, nome) => post('register', { email, password, nome }),
    logout: () => post('logout'),

    // Dashboard
    getDashboard: () => get('dashboard'),

    // Quizzes
    listQuizzes: () => get('list_quizzes'),
    getQuiz: (quizId) => get('get_quiz', { quiz_id: quizId }),
    createQuiz: (data) => post('create_quiz', data),
    updateQuiz: (quizId, data) => post('update_quiz', { quiz_id: quizId, ...data }),
    deleteQuiz: (quizId) => post('delete_quiz', { quiz_id: quizId }),
    duplicateQuiz: (quizId) => post('duplicate_quiz', { quiz_id: quizId }),
    getTemplates: () => get('get_templates'),

    // Code generation
    generateCode: (quizId, minify) => get('generate_code', { quiz_id: quizId, minify }),

    // Leads
    listLeads: (params) => get('list_leads', params),
    getLead: (leadId) => get('get_lead', { lead_id: leadId }),
    deleteLead: (leadId) => post('delete_lead', { lead_id: leadId }),
    exportLeadsCSV: (params) => get('export_leads_csv', params),
    leadsFilterOptions: () => get('leads_filter_options'),

    // Analytics
    getAnalytics: (quizId, params) => get('quiz_analytics', { quiz_id: quizId, ...params }),

    // Profile
    getProfile: () => get('get_profile'),
    updateProfile: (data) => post('update_profile', data),

    // Config
    setApiUrl: (url) => {
      localStorage.setItem('qf_api_url', url);
      location.reload();
    },
    getApiUrl: () => localStorage.getItem('qf_api_url') || '',
    isConfigured: () => !!localStorage.getItem('qf_api_url')
  };
})();
