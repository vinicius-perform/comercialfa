/**
 * Fazendo Acontecer™ - Sistema de Autenticação do Painel Administrativo
 * 
 * Credenciais Oficiais:
 * Login: admin@fa
 * Senha: admin@FA1
 * 
 * Nota: O Link da Equipe (relatorio.html) é totalmente livre e não exige credenciais.
 */

(function () {
  'use strict';

  const AUTH_KEY = 'fa_auth_user';
  const EXPECTED_USER = 'admin@fa';
  const EXPECTED_PASS = 'admin@FA1';

  function isUserAuthenticated() {
    return (
      localStorage.getItem(AUTH_KEY) === EXPECTED_USER ||
      sessionStorage.getItem(AUTH_KEY) === EXPECTED_USER
    );
  }

  function lockSystem() {
    document.documentElement.classList.add('auth-locked');
    const pwdInput = document.getElementById('auth-password');
    if (pwdInput) pwdInput.value = '';
    const errBanner = document.getElementById('auth-error-banner');
    if (errBanner) errBanner.style.display = 'none';
  }

  function unlockSystem() {
    document.documentElement.classList.remove('auth-locked');
    const errBanner = document.getElementById('auth-error-banner');
    if (errBanner) errBanner.style.display = 'none';
  }

  // Verificação imediata no carregamento do script
  if (!isUserAuthenticated()) {
    document.documentElement.classList.add('auth-locked');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const authOverlay = document.getElementById('auth-modal-overlay');
    const authCard = document.getElementById('auth-card');
    const authForm = document.getElementById('auth-form');
    const authLogin = document.getElementById('auth-login');
    const authPassword = document.getElementById('auth-password');
    const authRemember = document.getElementById('auth-remember');
    const authErrorBanner = document.getElementById('auth-error-banner');
    const authErrorText = document.getElementById('auth-error-text');
    const authPwdToggle = document.getElementById('auth-pwd-toggle');
    const btnLogout = document.getElementById('btn-sidebar-logout');

    // Inicialização do estado de autenticação
    if (isUserAuthenticated()) {
      unlockSystem();
    } else {
      lockSystem();
      if (authLogin) {
        setTimeout(() => {
          if (!authLogin.value) authLogin.value = EXPECTED_USER;
          if (authPassword) authPassword.focus();
        }, 150);
      }
    }

    // Toggle para visualizar/ocultar senha
    if (authPwdToggle && authPassword) {
      authPwdToggle.addEventListener('click', () => {
        const isPwd = authPassword.type === 'password';
        authPassword.type = isPwd ? 'text' : 'password';
        authPwdToggle.innerHTML = isPwd
          ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
               <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
               <line x1="1" y1="1" x2="23" y2="23"></line>
             </svg>`
          : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;">
               <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
               <circle cx="12" cy="12" r="3"></circle>
             </svg>`;
      });
    }

    // Submissão do formulário de autenticação
    if (authForm) {
      authForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const inputUser = (authLogin ? authLogin.value : '').trim();
        const inputPass = authPassword ? authPassword.value : '';

        // Validação (login case-insensitive, senha case-sensitive)
        if (inputUser.toLowerCase() === EXPECTED_USER.toLowerCase() && inputPass === EXPECTED_PASS) {
          // Sucesso
          if (authErrorBanner) authErrorBanner.style.display = 'none';

          if (authRemember && authRemember.checked) {
            localStorage.setItem(AUTH_KEY, EXPECTED_USER);
            sessionStorage.removeItem(AUTH_KEY);
          } else {
            sessionStorage.setItem(AUTH_KEY, EXPECTED_USER);
            localStorage.removeItem(AUTH_KEY);
          }

          unlockSystem();

          if (typeof window.showToast === 'function') {
            window.showToast('Acesso autorizado! Bem-vindo ao Painel.');
          }
        } else {
          // Falha na autenticação
          if (authErrorBanner) {
            authErrorText.textContent = 'Login ou senha incorretos. Verifique suas credenciais.';
            authErrorBanner.style.display = 'flex';
          }
          if (authCard) {
            authCard.classList.remove('shake');
            void authCard.offsetWidth; // Força repaint
            authCard.classList.add('shake');
          }
          if (authPassword) {
            authPassword.value = '';
            authPassword.focus();
          }
        }
      });
    }

    // Ação de Sair / Bloquear Painel na barra lateral
    if (btnLogout) {
      btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        localStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(AUTH_KEY);
        lockSystem();

        if (authLogin) {
          authLogin.value = EXPECTED_USER;
          if (authPassword) {
            authPassword.value = '';
            setTimeout(() => authPassword.focus(), 150);
          }
        }

        if (typeof window.showToast === 'function') {
          window.showToast('Painel bloqueado com sucesso.');
        }
      });
    }
  });

  // Exporta utilitário global caso necessário
  window.FA_AUTH = {
    isAuthenticated: isUserAuthenticated,
    lock: lockSystem,
    unlock: unlockSystem
  };
})();
