// api.js — GET only, com createQuiz dividido em 2 chamadas
const API = (() => {
  const BASE_URL = 'https://script.google.com/macros/s/AKfycbzsvNDhG6igTKUURd_X4yw28VPprTJpNNZh9oxqkPh4a3i-CK_0OM0kEucXByirZOsQiA/exec';

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
    if (data && data.code === 401) { Auth.logout(); window.location.href = 'index.html'; return; }
    return data;
  }

  // Divide payload grande em chunks e envia via múltiplas chamadas de sync
  async function syncEtapasChunked(quizId, etapas) {
    // Envia etapas em grupos de 2 para não estourar a URL
    const CHUNK = 2;
    for (let i = 0; i < etapas.length; i += CHUNK) {
      const chunk = etapas.slice(i, i + CHUNK);
      await call({
        action: 'sync_etapas_chunk',
        quiz_id: quizId,
        etapas: JSON.stringify(chunk),
        offset: i,
        total: etapas.length,
        is_last: (i + CHUNK >= etapas.length) ? '1' : '0'
      });
    }
  }

  async function createQuiz(data) {
    // Extrai etapas antes de enviar
    let etapas = null;
    try {
      etapas = typeof data.etapas === 'string' ? JSON.parse(data.etapas) : data.etapas;
    } catch(e) {}

    // 1. Cria o quiz sem etapas
    const payload = { ...data };
    delete payload.etapas;
    const res = await call({ action: 'create_quiz', ...payload });
    if (!res?.success) return res;

    // 2. Se tem etapas, sincroniza em chunks
    if (etapas && Array.isArray(etapas) && etapas.length > 0) {
      await syncEtapasChunked(res.data.id, etapas);
    }

    return res;
  }

  async function updateQuiz(id, data) {
    let etapas = null;
    try {
      etapas = typeof data.etapas === 'string' ? JSON.parse(data.etapas) : data.etapas;
    } catch(e) {}

    const payload = { ...data };
    delete payload.etapas;
    const res = await call({ action: 'update_quiz', quiz_id: id, ...payload });
    if (!res?.success) return res;

    if (etapas && Array.isArray(etapas) && etapas.length > 0) {
      await syncEtapasChunked(id, etapas);
    }

    return res;
  }

  return {
    getBaseUrl: () => BASE_URL,
    call: (params) => call(params),
    login:              (email, password)       => call({ action:'login', email, password }),
    register:           (email, password, nome) => call({ action:'register', email, password, nome }),
    logout:             ()                      => call({ action:'logout' }),
    getDashboard:       ()                      => call({ action:'dashboard' }),
    listQuizzes:        ()                      => call({ action:'list_quizzes' }),
    getQuiz:            (id)                    => call({ action:'get_quiz', quiz_id:id }),
    createQuiz,
    updateQuiz,
    deleteQuiz:         (id)                    => call({ action:'delete_quiz', quiz_id:id }),
    duplicateQuiz:      (id)                    => call({ action:'duplicate_quiz', quiz_id:id }),
    getTemplates:       ()                      => call({ action:'get_templates' }),
    generateCode:       (id, minify)            => call({ action:'generate_code', quiz_id:id, minify }),
    listLeads:          (params)                => call({ action:'list_leads', ...params }),
    getLead:            (id)                    => call({ action:'get_lead', lead_id:id }),
    deleteLead:         (id)                    => call({ action:'delete_lead', lead_id:id }),
    exportLeadsCSV:     (params)                => call({ action:'export_leads_csv', ...params }),
    leadsFilterOptions: ()                      => call({ action:'leads_filter_options' }),
    getAnalytics:       (id, params)            => call({ action:'quiz_analytics', quiz_id:id, ...params }),
    getProfile:         ()                      => call({ action:'get_profile' }),
    updateProfile:      (data)                  => call({ action:'update_profile', ...data }),
    generateQuizAI:     (params)                => call({ action:'generate_quiz_ai', ...params }),
    setApiUrl:          (url)                   => { localStorage.setItem('qf_api_url', url); location.reload(); },
    getApiUrl:          ()                      => BASE_URL,
    isConfigured:       ()                      => true
  };
})();
