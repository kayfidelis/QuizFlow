// ============================================================
// utils.js — Utilitários do frontend
// ============================================================

// Toast notifications
const Toast = (() => {
  let container;

  function getContainer() {
    if (!container) {
      container = document.createElement('div');
      container.id = 'qf-toasts';
      container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
      document.body.appendChild(container);
    }
    return container;
  }

  function show(message, type = 'info', duration = 3500) {
    const c = getContainer();
    const toast = document.createElement('div');
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    const colors = {
      success: '#10B981',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#6366F1'
    };

    toast.style.cssText = `
      display:flex;align-items:center;gap:12px;padding:14px 18px;
      background:#1A1B2E;border:1px solid rgba(255,255,255,0.08);
      border-left:3px solid ${colors[type]};border-radius:10px;
      color:#E2E8F0;font-size:0.875rem;font-family:inherit;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);max-width:360px;
      animation:toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1);
      cursor:pointer;
    `;

    toast.innerHTML = `
      <span style="color:${colors[type]};font-weight:700;font-size:1rem;">${icons[type]}</span>
      <span style="flex:1;line-height:1.4;">${message}</span>
      <span style="opacity:0.4;font-size:0.75rem;">×</span>
    `;

    // Injetar animação CSS se não existir
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = '@keyframes toastIn{from{opacity:0;transform:translateY(12px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes toastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(8px)}}';
      document.head.appendChild(style);
    }

    c.appendChild(toast);
    toast.addEventListener('click', () => remove(toast));

    setTimeout(() => remove(toast), duration);
    return toast;
  }

  function remove(toast) {
    toast.style.animation = 'toastOut 0.25s ease forwards';
    setTimeout(() => toast.remove(), 250);
  }

  return {
    success: (msg, d) => show(msg, 'success', d),
    error: (msg, d) => show(msg, 'error', d),
    warning: (msg, d) => show(msg, 'warning', d),
    info: (msg, d) => show(msg, 'info', d)
  };
})();

// Loading state helper
function setLoading(btn, loading, text) {
  if (!btn) return;
  if (loading) {
    btn.dataset.originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner"></span> ${text || 'Carregando...'}`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || btn.innerHTML;
  }
}

// Formata data em português
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Formata número com separadores
function formatNumber(n) {
  return Number(n || 0).toLocaleString('pt-BR');
}

// Formata percentual
function formatPct(n) {
  return Number(n || 0).toFixed(1) + '%';
}

// Formata tempo em segundos para legível
function formatTime(seconds) {
  if (!seconds) return '0s';
  if (seconds < 60) return seconds + 's';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + 'm ' + (s > 0 ? s + 's' : '');
}

// Copia texto para clipboard
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch(e) {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-100px;left:-100px;';
    document.body.appendChild(ta);
    ta.focus(); ta.select();
    try { document.execCommand('copy'); return true; }
    catch(e2) { return false; }
    finally { ta.remove(); }
  }
}

// Download de arquivo
function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType || 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Skeleton loader helper
function showSkeleton(container, count = 3) {
  container.innerHTML = Array(count).fill(`
    <div class="skeleton-card">
      <div class="skeleton" style="height:20px;width:60%;margin-bottom:12px;border-radius:6px;"></div>
      <div class="skeleton" style="height:14px;width:40%;border-radius:6px;"></div>
    </div>
  `).join('');
}

// Debounce
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// Confirma ação destrutiva
function confirmAction(message) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:10000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);';

    overlay.innerHTML = `
      <div style="background:#1A1B2E;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;max-width:420px;width:90%;box-shadow:0 24px 64px rgba(0,0,0,0.5);">
        <div style="font-size:2rem;margin-bottom:16px;text-align:center;">⚠️</div>
        <p style="color:#E2E8F0;font-size:0.95rem;line-height:1.6;text-align:center;margin-bottom:28px;">${message}</p>
        <div style="display:flex;gap:12px;">
          <button id="confirm-cancel" style="flex:1;padding:12px;background:transparent;border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:#E2E8F0;font-size:0.875rem;cursor:pointer;">Cancelar</button>
          <button id="confirm-ok" style="flex:1;padding:12px;background:#EF4444;border:none;border-radius:8px;color:white;font-size:0.875rem;font-weight:600;cursor:pointer;">Confirmar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#confirm-ok').onclick = () => { overlay.remove(); resolve(true); };
    overlay.querySelector('#confirm-cancel').onclick = () => { overlay.remove(); resolve(false); };
    overlay.onclick = (e) => { if (e.target === overlay) { overlay.remove(); resolve(false); } };
  });
}

// Inicializa sidebar e navbar
function initSidebar() {
  const user = Auth.getUser();
  if (!user) return;

  const nameEl = document.getElementById('sidebar-user-name');
  const emailEl = document.getElementById('sidebar-user-email');
  if (nameEl) nameEl.textContent = user.nome || user.email;
  if (emailEl) emailEl.textContent = user.email;

  // Marca link ativo
  const currentPage = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // Logout
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try { await API.logout(); } catch(e) {}
      Auth.logout();
      window.location.href = 'index.html';
    });
  }

  // Mobile sidebar toggle
  const toggleBtn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }
}

// Popula select de quizzes
async function populateQuizSelect(selectEl, currentValue) {
  try {
    const res = await API.listQuizzes();
    if (res?.success && res.data) {
      selectEl.innerHTML = '<option value="">Todos os quizzes</option>' +
        res.data.map(q => `<option value="${q.id}" ${q.id === currentValue ? 'selected' : ''}>${q.nome}</option>`).join('');
    }
  } catch(e) {}
}
