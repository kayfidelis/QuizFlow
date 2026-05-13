// api.js — todas as chamadas via GET (evita preflight CORS)
const API = (() => {
  const BASE_URL = 'https://script.google.com/macros/s/AKfycbxVONM2rNPWjSrJJ0d4RDTmUaJh53k-2IrOG-tromEY6e02GtQdrQ-km1QD51UjTorfhw/exec';

  function getToken() { return localStorage.getItem('qf_token') || ''; }

  async function call(params) {
    const url = new URL(BASE_URL);
    url.searchParams.set('token', getToken());
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '') return;
      url.searchParams.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    });
    const res = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
    if (!res.ok) throw new Error('Erro de rede: ' + res.status);
    const data = await res.json();
    if (data.code === 401) { Auth.logout(); window.location.href = 'index.html'; return; }
    return data;
  }

  return {
    // Auth
    login:              (email, password)      => call({ action:'login', email, password }),
    register:           (email, password, nome)=> call({ action:'register', email, password, nome }),
    logout:             ()                     => call({ action:'logout' }),

    // Dashboard
    getDashboard:       ()                     => call({ action:'dashboard' }),

    // Quizzes
    listQuizzes:        ()                     => call({ action:'list_quizzes' }),
    getQuiz:            (id)                   => call({ action:'get_quiz', quiz_id:id }),
    createQuiz:         (data)                 => call({ action:'create_quiz', ...data }),
    updateQuiz:         (id, data)             => call({ action:'update_quiz', quiz_id:id, ...data }),
    deleteQuiz:         (id)                   => call({ action:'delete_quiz', quiz_id:id }),
    duplicateQuiz:      (id)                   => call({ action:'duplicate_quiz', quiz_id:id }),
    getTemplates:       ()                     => call({ action:'get_templates' }),
    generateCode:       (id, minify)           => call({ action:'generate_code', quiz_id:id, minify }),

    // Leads
    listLeads:          (params)               => call({ action:'list_leads', ...params }),
    getLead:            (id)                   => call({ action:'get_lead', lead_id:id }),
    deleteLead:         (id)                   => call({ action:'delete_lead', lead_id:id }),
    exportLeadsCSV:     (params)               => call({ action:'export_leads_csv', ...params }),
    leadsFilterOptions: ()                     => call({ action:'leads_filter_options' }),

    // Analytics
    getAnalytics:       (id, params)           => call({ action:'quiz_analytics', quiz_id:id, ...params }),

    // Perfil
    getProfile:         ()                     => call({ action:'get_profile' }),
    updateProfile:      (data)                 => call({ action:'update_profile', ...data }),

    // IA
    generateQuizAI:     (params)               => call({ action:'generate_quiz_ai', ...params }),

    // Config
    setApiUrl:          (url)                  => { localStorage.setItem('qf_api_url', url); location.reload(); },
    getApiUrl:          ()                     => BASE_URL,
    isConfigured:       ()                     => true
  };
})();
