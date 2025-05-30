document.addEventListener('DOMContentLoaded', function() {
  
  // 🎯 CONFIGURATION GLOBALE
  const CONFIG = {
      maxLogoSize: 2 * 1024 * 1024, // 2MB
      allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp'],
      defaultValues: {
          fontSize: 16,
          logoSize: 60,
          textColor: '#333333',
          accentColor: '#007bff',
          template: 'modern',
          fontFamily: 'Arial',
          logoPosition: 'left'
      },
      emailClients: ['Gmail', 'Outlook', 'Apple Mail', 'Thunderbird', 'Yahoo Mail', 'Webmail']
  };

  // 📱 DÉTECTION MOBILE
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // 🎯 ÉLÉMENTS DU DOM
  const elements = {
      name: document.getElementById('name'),
      title: document.getElementById('title'),
      company: document.getElementById('company'),
      email: document.getElementById('email'),
      phone: document.getElementById('phone'),
      website: document.getElementById('website'),
      address: document.getElementById('address'),
      linkedin: document.getElementById('linkedin'),
      template: document.getElementById('template'),
      fontFamily: document.getElementById('fontFamily'),
      fontSize: document.getElementById('fontSize'),
      fontSizeValue: document.getElementById('fontSizeValue'),
      textColor: document.getElementById('textColor'),
      accentColor: document.getElementById('accentColor'),
      logoInput: document.getElementById('logoInput'),
      uploadBtn: document.getElementById('uploadBtn'),
      logoPreview: document.getElementById('logoPreview'),
      logoImg: document.getElementById('logoImg'),
      removeLogo: document.getElementById('removeLogo'),
      logoSize: document.getElementById('logoSize'),
      logoSizeValue: document.getElementById('logoSizeValue'),
      logoPosition: document.getElementById('logoPosition'),
      includeSocial: document.getElementById('includeSocial'),
      includeDisclaimer: document.getElementById('includeDisclaimer'),
      mobileOptimized: document.getElementById('mobileOptimized'),
      copyBtn: document.getElementById('copyBtn'),
      downloadBtn: document.getElementById('downloadBtn'),
      testBtn: document.getElementById('testBtn'),
      resetBtn: document.getElementById('resetBtn'),
      previewBtn: document.getElementById('previewBtn'),
      signaturePreview: document.getElementById('signaturePreview'),
      signatureContainer: document.getElementById('signatureContainer'),
      previewDesktop: document.getElementById('previewDesktop'),
      previewMobile: document.getElementById('previewMobile'),
      signatureSize: document.getElementById('signatureSize'),
      compatibilityScore: document.getElementById('compatibilityScore'),
      successModal: document.getElementById('successModal'),
      modalCopyBtn: document.getElementById('modalCopyBtn'),
      modalDownloadBtn: document.getElementById('modalDownloadBtn')
  };

  // 🔄 ÉTAT DE L'APPLICATION
  let appState = {
      currentLogo: null,
      previewMode: 'desktop',
      isGenerating: false,
      lastSignatureHTML: '',
      validationErrors: []
  };

  // 🛡️ PROTECTION ANTI-TÉLÉCHARGEMENT
  function addDownloadProtection() {
      const style = document.createElement('style');
      style.textContent = `
          .signature-preview img[data-protected="true"] {
              -webkit-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
              user-select: none !important;
              -webkit-user-drag: none !important;
              -moz-user-drag: none !important;
              user-drag: none !important;
              pointer-events: none !important;
              -webkit-touch-callout: none !important;
          }
          .signature-preview {
              -webkit-touch-callout: none !important;
              -webkit-user-select: text !important;
              -moz-user-select: text !important;
              user-select: text !important;
          }
          .mobile-preview {
              max-width: 320px;
              margin: 0 auto;
              transform: scale(0.8);
              transform-origin: top center;
          }
          .input-error {
              border-color: #dc3545 !important;
              box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
          }
          .preview-btn {
              padding: 8px 16px;
              margin: 0 5px;
              border: 1px solid #ddd;
              background: #fff;
              border-radius: 4px;
              cursor: pointer;
              transition: all 0.3s;
          }
          .preview-btn.active {
              background: #007bff;
              color: white;
              border-color: #007bff;
          }
          .notification {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 15px 20px;
              border-radius: 5px;
              color: white;
              font-weight: bold;
              z-index: 10000;
              animation: slideIn 0.3s ease;
          }
          .notification.success { background: #28a745; }
          .notification.error { background: #dc3545; }
          .notification.info { background: #17a2b8; }
          @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
          }
      `;
      document.head.appendChild(style);
  }

  // 📢 SYSTÈME DE NOTIFICATIONS
  function showNotification(message, type = 'info') {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
          notification.style.animation = 'slideIn 0.3s ease reverse';
          setTimeout(() => {
              if (notification.parentNode) {
                  notification.parentNode.removeChild(notification);
              }
          }, 300);
      }, 3000);
  }

  // ✅ VALIDATION DES DONNÉES
  function validateInput(field, value) {
      const validations = {
          email: (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
          phone: (val) => !val || /^[\+]?[0-9\s\-\(\)]{10,}$/.test(val),
          website: (val) => !val || /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(val),
          linkedin: (val) => !val || /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w\-_]+\/?$/.test(val),
          name: (val) => val && val.trim().length >= 2
      };
      return validations[field] ? validations[field](value) : true;
  }

  // 🎨 GÉNÉRATION DE SIGNATURE AVANCÉE
  function generateSignatureHTML(data) {
      if (!data.name && !data.title && !data.company && !data.email) {
          return '<p class="placeholder">✨ Remplissez le formulaire pour voir votre signature<br><small>La prévisualisation se met à jour automatiquement</small></p>';
      }

      let logoHTML = '';
      if (data.logo) {
          logoHTML = `<img src="${data.logo}" 
              alt="Logo ${data.company || 'entreprise'}" 
              style="width: ${data.logoSize}px; height: auto; margin: 0 10px; vertical-align: middle; -webkit-user-select: none; -moz-user-select: none; user-select: none; -webkit-user-drag: none; user-drag: none; pointer-events: none;" 
              draggable="false" 
              ondragstart="return false;" 
              oncontextmenu="return false;"
              data-protected="true">`;
      }

      let nameHTML = '';
      if (data.name) {
          nameHTML = `<div style="font-weight: bold; font-size: ${parseInt(data.fontSize) + 4}px; color: ${data.textColor}; margin-bottom: 5px; line-height: 1.2;">${data.name}</div>`;
      }

      let titleHTML = '';
      if (data.title) {
          titleHTML = `<div style="color: ${data.accentColor}; font-size: ${data.fontSize}px; margin-bottom: 3px; font-weight: 500; line-height: 1.2;">${data.title}</div>`;
      }

      let companyHTML = '';
      if (data.company) {
          companyHTML = `<div style="color: ${data.textColor}; font-size: ${data.fontSize}px; margin-bottom: 8px; line-height: 1.2;">${data.company}</div>`;
      }

      const contacts = [];
      if (data.email) {
          contacts.push(`<a href="mailto:${data.email}" style="color: ${data.accentColor}; text-decoration: none;">📧 ${data.email}</a>`);
      }
      if (data.phone) {
          const phoneClean = data.phone.replace(/\s/g, '');
          contacts.push(`<a href="tel:${phoneClean}" style="color: ${data.accentColor}; text-decoration: none;">📞 ${data.phone}</a>`);
      }
      if (data.website) {
          const websiteUrl = data.website.startsWith('http') ? data.website : 'https://' + data.website;
          contacts.push(`<a href="${websiteUrl}" style="color: ${data.accentColor}; text-decoration: none;" target="_blank" rel="noopener">🌐 ${data.website.replace(/^https?:\/\//, '')}</a>`);
      }

      let addressHTML = '';
      if (data.address) {
          addressHTML = `<div style="color: ${data.textColor}; font-size: ${parseInt(data.fontSize) - 1}px; margin-top: 5px; line-height: 1.3;">📍 ${data.address}</div>`;
      }

      let socialHTML = '';
      if (data.includeSocial && data.linkedin) {
          const linkedinUrl = data.linkedin.startsWith('http') ? data.linkedin : 'https://' + data.linkedin;
          socialHTML = `<div style="margin-top: 8px;"><a href="${linkedinUrl}" style="color: ${data.accentColor}; text-decoration: none; font-size: ${parseInt(data.fontSize) - 1}px;" target="_blank" rel="noopener">💼 LinkedIn</a></div>`;
      }

      let disclaimerHTML = '';
      if (data.includeDisclaimer) {
          disclaimerHTML = `<div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; font-size: ${parseInt(data.fontSize) - 3}px; color: #888; line-height: 1.3;">
              <em>Ce message et ses pièces jointes sont confidentiels et destinés uniquement à la personne ou aux personnes visées. Si vous avez reçu ce message par erreur, merci de le détruire et d'en informer l'expéditeur.</em>
          </div>`;
      }

      const contactHTML = contacts.length > 0 ? 
          `<div style="font-size: ${parseInt(data.fontSize) - 1}px; line-height: 1.5; margin-top: 5px;">${contacts.join(' • ')}</div>` : '';

      const textHTML = `
          <div style="font-family: ${data.fontFamily}, sans-serif;">
              ${nameHTML}
              ${titleHTML}
              ${companyHTML}
              ${contactHTML}
              ${addressHTML}
              ${socialHTML}
              ${disclaimerHTML}
          </div>
      `;

      const mobileCSS = data.mobileOptimized ? `
          @media only screen and (max-width: 600px) {
              .signature-content { display: block !important; text-align: center !important; }
              .signature-content img { display: block !important; margin: 0 auto 10px auto !important; }
              .signature-content div { text-align: center !important; }
          }
      ` : '';

      let contentHTML;
      if (data.logoPosition === 'top') {
          contentHTML = `
              <div style="text-align: center; margin-bottom: 15px;">${logoHTML}</div>
              <div style="text-align: ${data.logoPosition === 'top' ? 'center' : 'left'};">${textHTML}</div>
          `;
      } else if (data.logoPosition === 'right') {
          contentHTML = `
              <div class="signature-content" style="display: table; width: 100%;">
                  <div style="display: table-cell; vertical-align: middle;">${textHTML}</div>
                  <div style="display: table-cell; vertical-align: middle; text-align: right; width: ${parseInt(data.logoSize) + 20}px;">${logoHTML}</div>
              </div>
          `;
      } else {
          contentHTML = `
              <div class="signature-content" style="display: table; width: 100%;">
                  <div style="display: table-cell; vertical-align: middle; width: ${parseInt(data.logoSize) + 20}px;">${logoHTML}</div>
                  <div style="display: table-cell; vertical-align: middle;">${textHTML}</div>
              </div>
          `;
      }

      const protectionCSS = `-webkit-user-select: text; -moz-user-select: text; user-select: text; -webkit-touch-callout: default;`;

      const templates = {
          modern: `<div style="padding: 20px; border-left: 4px solid ${data.accentColor}; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; ${protectionCSS}"><style>${mobileCSS}</style>${contentHTML}</div>`,
          classic: `<div style="padding: 15px; border: 2px solid ${data.accentColor}; background: #ffffff; border-radius: 4px; max-width: 500px; ${protectionCSS}"><style>${mobileCSS}</style>${contentHTML}</div>`,
          minimal: `<div style="padding: 10px; background: #ffffff; max-width: 500px; ${protectionCSS}"><style>${mobileCSS}</style>${contentHTML}</div>`,
          elegant: `<div style="padding: 20px; background: #ffffff; border-bottom: 3px solid ${data.accentColor}; box-shadow: 0 1px 5px rgba(0,0,0,0.1); max-width: 500px; ${protectionCSS}"><style>${mobileCSS}</style>${contentHTML}</div>`,
          corporate: `<div style="padding: 18px; background: linear-gradient(to right, #ffffff 0%, #f8f9fa 100%); border: 1px solid #dee2e6; border-radius: 6px; max-width: 500px; ${protectionCSS}"><style>${mobileCSS}</style>${contentHTML}</div>`
      };

      return templates[data.template] || templates.modern;
  }

  // 📊 CALCUL DE LA TAILLE ET COMPATIBILITÉ
  function calculateSignatureStats(html) {
      const size = new Blob([html]).size;
      const sizeKB = (size / 1024).toFixed(1);
      let score = 100;
      if (html.includes('linear-gradient')) score -= 10;
      if (html.includes('box-shadow')) score -= 5;
      if (html.includes('border-radius')) score -= 5;
      if (size > 10240) score -= 15;
      return {
          size: sizeKB + ' KB',
          compatibility: Math.max(score, 70) + '%'
      };
  }

  // 🔄 MISE À JOUR DE LA SIGNATURE
  function updateSignature() {
      if (appState.isGenerating) return;
      appState.isGenerating = true;

      try {
          const data = {
              name: elements.name?.value?.trim() || '',
              title: elements.title?.value?.trim() || '',
              company: elements.company?.value?.trim() || '',
              email: elements.email?.value?.trim() || '',
              phone: elements.phone?.value?.trim() || '',
              website: elements.website?.value?.trim() || '',
              address: elements.address?.value?.trim() || '',
              linkedin: elements.linkedin?.value?.trim() || '',
              template: elements.template?.value || 'modern',
              fontFamily: elements.fontFamily?.value || 'Arial',
              fontSize: elements.fontSize?.value || '16',
              textColor: elements.textColor?.value || '#333333',
              accentColor: elements.accentColor?.value || '#007bff',
              logoSize: elements.logoSize?.value || '60',
              logoPosition: elements.logoPosition?.value || 'left',
              includeSocial: elements.includeSocial?.checked || false,
              includeDisclaimer: elements.includeDisclaimer?.checked || false,
              mobileOptimized: elements.mobileOptimized?.checked || true,
              logo: appState.currentLogo
          };

          appState.validationErrors = [];
          Object.keys(data).forEach(field => {
              if (!validateInput(field, data[field])) {
                  appState.validationErrors.push(field);
              }
          });

          const html = generateSignatureHTML(data);
          if (elements.signaturePreview) {
              elements.signaturePreview.innerHTML = html;
          }
          appState.lastSignatureHTML = html;

          applyImageProtection();

          const stats = calculateSignatureStats(html);
          if (elements.signatureSize) elements.signatureSize.textContent = stats.size;
          if (elements.compatibilityScore) elements.compatibilityScore.textContent = stats.compatibility;

          toggleButtons();
          updateSliderValues();
          updateValidationUI();

      } catch (error) {
          console.error('Erreur génération signature:', error);
          showNotification('❌ Erreur lors de la génération', 'error');
      } finally {
          appState.isGenerating = false;
      }
  }

  // 🎛️ MISE À JOUR DES VALEURS DES SLIDERS
  function updateSliderValues() {
      if (elements.fontSize && elements.fontSizeValue) {
          elements.fontSizeValue.textContent = elements.fontSize.value;
      }
      if (elements.logoSize && elements.logoSizeValue) {
          elements.logoSizeValue.textContent = elements.logoSize.value;
      }
  }

  // 🔘 GESTION DES BOUTONS
  function toggleButtons() {
      const hasContent = elements.name?.value?.trim() !== '';
      const isValid = appState.validationErrors.length === 0;
      
      if (elements.copyBtn) elements.copyBtn.disabled = !hasContent || !isValid;
      if (elements.downloadBtn) elements.downloadBtn.disabled = !hasContent || !isValid;
      if (elements.testBtn) elements.testBtn.disabled = !hasContent || !isValid || !elements.email?.value?.trim();
  }

  // ✅ VALIDATION UI
  function updateValidationUI() {
      document.querySelectorAll('.input-error').forEach(el => {
          el.classList.remove('input-error');
      });

      appState.validationErrors.forEach(field => {
          const element = elements[field];
          if (element) {
              element.classList.add('input-error');
          }
      });
  }

  // 🛡️ PROTECTION DES IMAGES
  function applyImageProtection() {
      const signatureImages = elements.signaturePreview?.querySelectorAll('img[data-protected="true"]') || [];
      
      signatureImages.forEach(img => {
          ['contextmenu', 'dragstart', 'selectstart'].forEach(event => {
              img.addEventListener(event, function(e) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
              });
          });

          img.addEventListener('keydown', function(e) {
              if (e.ctrlKey && ['s', 'a', 'c'].includes(e.key)) {
                  e.preventDefault();
                  return false;
              }
          });
      });
  }

  // Exposer les fonctions globalement pour la partie 2
  window.signatureApp = {
      CONFIG,
      elements,
      appState,
      showNotification,
      updateSignature,
      addDownloadProtection,
      applyImageProtection,
      toggleButtons,
      updateSliderValues,
      updateValidationUI,
      calculateSignatureStats,
      generateSignatureHTML,
      validateInput
  };

  // Initialisation
  addDownloadProtection();
  updateSignature();
});

// PARTIE 2/2 - À ajouter après la partie 1

// Attendre que la partie 1 soit chargée
document.addEventListener('DOMContentLoaded', function() {
  // Récupérer les éléments de la partie 1
  const { CONFIG, elements, appState, showNotification, updateSignature, applyImageProtection } = window.signatureApp;

  // 📋 COPIE UNIVERSELLE
  async function copySignature() {
      try {
          if (navigator.clipboard && window.isSecureContext) {
              const html = appState.lastSignatureHTML;
              const blob = new Blob([html], { type: 'text/html' });
              const clipboardItem = new ClipboardItem({ 'text/html': blob });
              await navigator.clipboard.write([clipboardItem]);
              showNotification('✅ Signature copiée avec protection !', 'success');
              return;
          }

          const range = document.createRange();
          range.selectNodeContents(elements.signaturePreview);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);

          const successful = document.execCommand('copy');
          selection.removeAllRanges();

          if (successful) {
              showNotification('✅ Signature copiée !', 'success');
          } else {
              showCopyModal();
          }

      } catch (error) {
          console.error('Erreur copie:', error);
          showCopyModal();
      }
  }

  // 📋 MODAL DE COPIE MANUELLE
  function showCopyModal() {
      const modal = document.createElement('div');
      modal.className = 'copy-modal';
      modal.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,0.8); z-index: 10000;
          display: flex; align-items: center; justify-content: center;
      `;
      
      modal.innerHTML = `
          <div style="background: white; padding: 30px; border-radius: 10px; max-width: 90%; max-height: 90%; overflow: auto; font-family: Arial, sans-serif;">
              <h3>📋 Copiez le code HTML :</h3>
              <p style="color: #666;">Sélectionnez tout et copiez (Ctrl+C)</p>
              <textarea readonly style="width: 100%; height: 300px; font-family: monospace; font-size: 12px; border: 1px solid #ddd; padding: 10px;">${appState.lastSignatureHTML}</textarea>
              <button onclick="this.closest('.copy-modal').remove()" style="background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 15px;">Fermer</button>
          </div>
      `;
      
      document.body.appendChild(modal);
      modal.querySelector('textarea').select();
  }

  // 💾 TÉLÉCHARGEMENT AVANCÉ
  function downloadSignature() {
      try {
          const data = {
              name: elements.name?.value?.trim() || 'signature',
              company: elements.company?.value?.trim() || 'entreprise'
          };
          
          const fileName = `${data.name.replace(/\s+/g, '-').toLowerCase()}-signature-protegee`;
          const fullHTML = generateDownloadHTML(appState.lastSignatureHTML, data);
          const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = url;
          a.download = `${fileName}.html`;
          a.style.display = 'none';
          
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          setTimeout(() => URL.revokeObjectURL(url), 100);
          showNotification('✅ Signature téléchargée avec protection ! 🔒', 'success');
          
      } catch (error) {
          console.error('Erreur téléchargement:', error);
          showNotification('❌ Erreur lors du téléchargement', 'error');
      }
  }

  // 📄 GÉNÉRATION DU HTML DE TÉLÉCHARGEMENT
  function generateDownloadHTML(signatureHTML, data) {
      return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Signature Email - ${data.name || 'Signature'}</title>
  <style>
      body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
      .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
      .signature-container { border: 2px dashed #ddd; padding: 20px; margin: 20px 0; background: #fafafa; }
      .instructions { background: #e3f2fd; padding: 20px; border-radius: 5px; margin: 20px 0; }
      .security-notice { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
      img[data-protected="true"] {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          user-select: none !important;
          -webkit-user-drag: none !important;
          user-drag: none !important;
          pointer-events: none !important;
      }
  </style>
  <script>
      document.addEventListener('DOMContentLoaded', function() {
          document.addEventListener('contextmenu', function(e) {
              if (e.target.tagName === 'IMG' && e.target.hasAttribute('data-protected')) {
                  e.preventDefault();
                  return false;
              }
          });
          document.addEventListener('dragstart', function(e) {
              if (e.target.tagName === 'IMG' && e.target.hasAttribute('data-protected')) {
                  e.preventDefault();
                  return false;
              }
          });
          document.addEventListener('keydown', function(e) {
              if (e.ctrlKey && e.key === 's') {
                  e.preventDefault();
                  alert('🔒 Téléchargement d\\'images désactivé');
                  return false;
              }
          });
      });
  </script>
</head>
<body>
  <div class="container">
      <h1>📧 Signature Email Professionnelle</h1>
      <div class="security-notice">
          <h4>🔒 Signature Protégée</h4>
          <p>Cette signature inclut une protection anti-téléchargement d'images.</p>
      </div>
      <div class="instructions">
          <h3>📋 Instructions :</h3>
          <ol>
              <li>Sélectionnez la signature ci-dessous</li>
              <li>Copiez avec Ctrl+C</li>
              <li>Collez dans votre client email</li>
          </ol>
      </div>
      <div class="signature-container">
          ${signatureHTML}
      </div>
      <div class="instructions">
          <h3>✅ Compatible avec :</h3>
          <p>${CONFIG.emailClients.join(', ')}</p>
      </div>
  </div>
</body>
</html>`;
  }

  // 📧 TEST PAR EMAIL
  function testSignature() {
      const email = elements.email?.value?.trim();
      if (!email) {
          showNotification('❌ Veuillez renseigner votre email', 'error');
          return;
      }

      const subject = `Test de signature - ${elements.name?.value || 'Signature'}`;
      const body = `Bonjour,\n\nCeci est un test de votre nouvelle signature email.\n\nCordialement`;
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      try {
          window.location.href = mailtoLink;
          showNotification('📧 Client email ouvert pour le test', 'info');
      } catch (error) {
          showNotification('❌ Impossible d\'ouvrir le client email', 'error');
      }
  }

  // 📱 PRÉVISUALISATION MOBILE/DESKTOP
  function togglePreviewMode(mode) {
      appState.previewMode = mode;
      if (elements.previewDesktop) elements.previewDesktop.classList.toggle('active', mode === 'desktop');
      if (elements.previewMobile) elements.previewMobile.classList.toggle('active', mode === 'mobile');
      if (elements.signatureContainer) elements.signatureContainer.classList.toggle('mobile-preview', mode === 'mobile');
  }

  // 🖼️ UPLOAD DE LOGO AVANCÉ
  function handleLogoUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      if (!CONFIG.allowedImageTypes.includes(file.type)) {
          showNotification('❌ Format non supporté. Utilisez PNG, JPG ou SVG', 'error');
          return;
      }

      if (file.size > CONFIG.maxLogoSize) {
          showNotification('❌ Image trop volumineuse (max 2MB)', 'error');
          return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
          appState.currentLogo = e.target.result;
          
          if (elements.logoImg) {
              elements.logoImg.src = e.target.result;
              elements.logoImg.style.display = 'block';
          }
          
          if (elements.logoPreview) {
              elements.logoPreview.style.display = 'block';
          }
          
          updateSignature();
          showNotification('✅ Logo ajouté avec succès !', 'success');
      };
      
      reader.onerror = function() {
          showNotification('❌ Erreur lors du chargement de l\'image', 'error');
      };
      
      reader.readAsDataURL(file);
  }

  // 🗑️ SUPPRESSION DU LOGO
  function removeLogo() {
      appState.currentLogo = null;
      
      if (elements.logoInput) elements.logoInput.value = '';
      if (elements.logoImg) elements.logoImg.style.display = 'none';
      if (elements.logoPreview) elements.logoPreview.style.display = 'none';
      
      updateSignature();
      showNotification('🗑️ Logo supprimé', 'info');
  }

  // 🔄 RESET COMPLET
  function resetForm() {
      if (!confirm('Êtes-vous sûr de vouloir tout effacer ?')) return;
      
      // Reset des champs
      Object.keys(elements).forEach(key => {
          const element = elements[key];
          if (element) {
              if (element.type === 'text' || element.type === 'email' || element.type === 'tel' || element.type === 'url') {
                  element.value = '';
              } else if (element.type === 'checkbox') {
                  element.checked = key === 'mobileOptimized';
              } else if (element.tagName === 'SELECT') {
                  element.value = CONFIG.defaultValues[key] || element.options[0].value;
              } else if (element.type === 'range') {
                  element.value = CONFIG.defaultValues[key] || element.min;
              } else if (element.type === 'color') {
                  element.value = CONFIG.defaultValues[key] || '#333333';
              }
          }
      });
      
      // Reset du logo
      removeLogo();
      
      // Reset de l'état
      appState.currentLogo = null;
      appState.previewMode = 'desktop';
      appState.validationErrors = [];
      
      updateSignature();
      showNotification('🔄 Formulaire réinitialisé', 'info');
  }

  // 📱 DÉTECTION ET ADAPTATION MOBILE
  function adaptToMobile() {
      if (window.innerWidth <= 768) {
          document.body.classList.add('mobile-layout');
          
          // Ajuster les tailles par défaut pour mobile
          if (elements.fontSize && !elements.fontSize.value) {
              elements.fontSize.value = '14';
          }
          if (elements.logoSize && !elements.logoSize.value) {
              elements.logoSize.value = '50';
          }
      } else {
          document.body.classList.remove('mobile-layout');
      }
  }

  // 🎯 EVENT LISTENERS
  function setupEventListeners() {
      // Champs de texte - mise à jour en temps réel
      ['name', 'title', 'company', 'email', 'phone', 'website', 'address', 'linkedin'].forEach(field => {
          if (elements[field]) {
              elements[field].addEventListener('input', updateSignature);
              elements[field].addEventListener('blur', updateSignature);
          }
      });

      // Sélecteurs et options
      ['template', 'fontFamily', 'logoPosition'].forEach(field => {
          if (elements[field]) {
              elements[field].addEventListener('change', updateSignature);
          }
      });

      // Sliders
      ['fontSize', 'logoSize'].forEach(field => {
          if (elements[field]) {
              elements[field].addEventListener('input', updateSignature);
          }
      });

      // Couleurs
      ['textColor', 'accentColor'].forEach(field => {
          if (elements[field]) {
              elements[field].addEventListener('change', updateSignature);
          }
      });

      // Checkboxes
      ['includeSocial', 'includeDisclaimer', 'mobileOptimized'].forEach(field => {
          if (elements[field]) {
              elements[field].addEventListener('change', updateSignature);
          }
      });

      // Boutons principaux
      if (elements.copyBtn) elements.copyBtn.addEventListener('click', copySignature);
      if (elements.downloadBtn) elements.downloadBtn.addEventListener('click', downloadSignature);
      if (elements.testBtn) elements.testBtn.addEventListener('click', testSignature);
      if (elements.resetBtn) elements.resetBtn.addEventListener('click', resetForm);

      // Logo
      if (elements.logoInput) elements.logoInput.addEventListener('change', handleLogoUpload);
      if (elements.uploadBtn) elements.uploadBtn.addEventListener('click', () => elements.logoInput?.click());
      if (elements.removeLogo) elements.removeLogo.addEventListener('click', removeLogo);

      // Prévisualisation
      if (elements.previewDesktop) elements.previewDesktop.addEventListener('click', () => togglePreviewMode('desktop'));
      if (elements.previewMobile) elements.previewMobile.addEventListener('click', () => togglePreviewMode('mobile'));

      // Responsive
      window.addEventListener('resize', adaptToMobile);
      
      // Drag & Drop pour le logo
      if (elements.uploadBtn) {
          elements.uploadBtn.addEventListener('dragover', (e) => {
              e.preventDefault();
              e.currentTarget.classList.add('drag-over');
          });
          
          elements.uploadBtn.addEventListener('dragleave', (e) => {
              e.currentTarget.classList.remove('drag-over');
          });
          
          elements.uploadBtn.addEventListener('drop', (e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('drag-over');
              
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                  const event = { target: { files: [files[0]] } };
                  handleLogoUpload(event);
              }
          });
      }

      // Raccourcis clavier
      document.addEventListener('keydown', (e) => {
          if (e.ctrlKey || e.metaKey) {
              switch(e.key) {
                  case 's':
                      e.preventDefault();
                      downloadSignature();
                      break;
                  case 'c':
                      if (e.shiftKey) {
                          e.preventDefault();
                          copySignature();
                      }
                      break;
                  case 'r':
                      if (e.shiftKey) {
                          e.preventDefault();
                          resetForm();
                      }
                      break;
              }
          }
      });
  }

  // 🚀 INITIALISATION FINALE
  function initializeApp() {
      setupEventListeners();
      adaptToMobile();
      
      // Charger les valeurs par défaut
      Object.keys(CONFIG.defaultValues).forEach(key => {
          if (elements[key] && !elements[key].value) {
              if (elements[key].type === 'checkbox') {
                  elements[key].checked = CONFIG.defaultValues[key];
              } else {
                  elements[key].value = CONFIG.defaultValues[key];
              }
          }
      });
      
      // Première génération
      updateSignature();
      
      // Message de bienvenue
      setTimeout(() => {
          showNotification('🎉 Générateur de signature prêt !', 'success');
      }, 500);
      
      console.log('📧 Générateur de signature email initialisé avec succès !');
      console.log('🔒 Protection anti-téléchargement activée');
      console.log('📱 Support mobile activé');
      console.log('⚡ Toutes les fonctionnalités sont opérationnelles');
  }

  // Exposer les nouvelles fonctions
  window.signatureApp = {
      ...window.signatureApp,
      copySignature,
      downloadSignature,
      testSignature,
      resetForm,
      handleLogoUpload,
      removeLogo,
      togglePreviewMode,
      generateDownloadHTML,
      showCopyModal,
      setupEventListeners,
      adaptToMobile,
      initializeApp
  };

  // Démarrage de l'application
  initializeApp();
});

// 🎨 CORRECTION ALIGNEMENT LOGO - À ajouter à la fin du script.js

// Attendre que tout soit chargé
document.addEventListener('DOMContentLoaded', function() {
  
  // Remplacer la fonction generateSignatureHTML existante
  if (window.signatureApp) {
      
      // 🎨 NOUVELLE FONCTION AVEC ALIGNEMENT PARFAIT
      window.signatureApp.generateSignatureHTML = function(data) {
          if (!data.name && !data.title && !data.company && !data.email) {
              return '<p class="placeholder">✨ Remplissez le formulaire pour voir votre signature<br><small>La prévisualisation se met à jour automatiquement</small></p>';
          }

          let logoHTML = '';
          if (data.logo) {
              logoHTML = `<img src="${data.logo}" 
                  alt="Logo ${data.company || 'entreprise'}" 
                  style="width: ${data.logoSize}px; height: auto; display: block; -webkit-user-select: none; -moz-user-select: none; user-select: none; -webkit-user-drag: none; user-drag: none; pointer-events: none;" 
                  draggable="false" 
                  ondragstart="return false;" 
                  oncontextmenu="return false;"
                  data-protected="true">`;
          }

          let nameHTML = '';
          if (data.name) {
              nameHTML = `<div style="font-weight: bold; font-size: ${parseInt(data.fontSize) + 4}px; color: ${data.textColor}; margin-bottom: 5px; line-height: 1.2;">${data.name}</div>`;
          }

          let titleHTML = '';
          if (data.title) {
              titleHTML = `<div style="color: ${data.accentColor}; font-size: ${data.fontSize}px; margin-bottom: 3px; font-weight: 500; line-height: 1.2;">${data.title}</div>`;
          }

          let companyHTML = '';
          if (data.company) {
              companyHTML = `<div style="color: ${data.textColor}; font-size: ${data.fontSize}px; margin-bottom: 8px; line-height: 1.2;">${data.company}</div>`;
          }

          const contacts = [];
          if (data.email) {
              contacts.push(`<a href="mailto:${data.email}" style="color: ${data.accentColor}; text-decoration: none;">📧 ${data.email}</a>`);
          }
          if (data.phone) {
              const phoneClean = data.phone.replace(/\s/g, '');
              contacts.push(`<a href="tel:${phoneClean}" style="color: ${data.accentColor}; text-decoration: none;">📞 ${data.phone}</a>`);
          }
          if (data.website) {
              const websiteUrl = data.website.startsWith('http') ? data.website : 'https://' + data.website;
              contacts.push(`<a href="${websiteUrl}" style="color: ${data.accentColor}; text-decoration: none;" target="_blank" rel="noopener">🌐 ${data.website.replace(/^https?:\/\//, '')}</a>`);
          }

          let addressHTML = '';
          if (data.address) {
              addressHTML = `<div style="color: ${data.textColor}; font-size: ${parseInt(data.fontSize) - 1}px; margin-top: 5px; line-height: 1.3;">📍 ${data.address}</div>`;
          }

          let socialHTML = '';
          if (data.includeSocial && data.linkedin) {
              const linkedinUrl = data.linkedin.startsWith('http') ? data.linkedin : 'https://' + data.linkedin;
              socialHTML = `<div style="margin-top: 8px;"><a href="${linkedinUrl}" style="color: ${data.accentColor}; text-decoration: none; font-size: ${parseInt(data.fontSize) - 1}px;" target="_blank" rel="noopener">💼 LinkedIn</a></div>`;
          }

          let disclaimerHTML = '';
          if (data.includeDisclaimer) {
              disclaimerHTML = `<div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee; font-size: ${parseInt(data.fontSize) - 3}px; color: #888; line-height: 1.3;">
                  <em>Ce message et ses pièces jointes sont confidentiels et destinés uniquement à la personne ou aux personnes visées. Si vous avez reçu ce message par erreur, merci de le détruire et d'en informer l'expéditeur.</em>
              </div>`;
          }

          const contactHTML = contacts.length > 0 ? 
              `<div style="font-size: ${parseInt(data.fontSize) - 1}px; line-height: 1.5; margin-top: 5px;">${contacts.join(' • ')}</div>` : '';

          const textHTML = `
              <div style="font-family: ${data.fontFamily}, sans-serif;">
                  ${nameHTML}
                  ${titleHTML}
                  ${companyHTML}
                  ${contactHTML}
                  ${addressHTML}
                  ${socialHTML}
                  ${disclaimerHTML}
              </div>
          `;

          const mobileCSS = data.mobileOptimized ? `
              @media only screen and (max-width: 600px) {
                  .signature-content,
                  .signature-content table,
                  .signature-content tbody,
                  .signature-content tr {
                      display: block !important;
                      width: 100% !important;
                  }
                  .signature-content td {
                      display: block !important;
                      width: 100% !important;
                      text-align: center !important;
                      padding: 5px 0 !important;
                  }
                  .signature-logo {
                      margin-bottom: 15px !important;
                  }
              }
          ` : '';

          let contentHTML;
          const logoSize = parseInt(data.logoSize);
          
          if (data.logoPosition === 'top') {
              contentHTML = `
                  <div class="signature-logo" style="text-align: center; margin-bottom: 15px;">
                      ${logoHTML}
                  </div>
                  <div class="signature-text" style="text-align: center;">
                      ${textHTML}
                  </div>
              `;
          } else if (data.logoPosition === 'right') {
              contentHTML = `
                  <table class="signature-content" style="width: 100%; border-collapse: collapse; margin: 0; padding: 0;">
                      <tr>
                          <td class="signature-text" style="vertical-align: middle; padding: 0; margin: 0;">
                              ${textHTML}
                          </td>
                          <td class="signature-logo" style="vertical-align: middle; text-align: right; width: ${logoSize + 20}px; padding: 0; margin: 0; padding-left: 15px;">
                              ${logoHTML}
                          </td>
                      </tr>
                  </table>
              `;
          } else { // left (par défaut)
              contentHTML = `
                  <table class="signature-content" style="width: 100%; border-collapse: collapse; margin: 0; padding: 0;">
                      <tr>
                          <td class="signature-logo" style="vertical-align: middle; width: ${logoSize + 20}px; padding: 0; margin: 0; padding-right: 15px;">
                              ${logoHTML}
                          </td>
                          <td class="signature-text" style="vertical-align: middle; padding: 0; margin: 0;">
                              ${textHTML}
                          </td>
                      </tr>
                  </table>
              `;
          }

          const protectionCSS = `-webkit-user-select: text; -moz-user-select: text; user-select: text; -webkit-touch-callout: default;`;

          const templates = {
              modern: `<div style="padding: 20px; border-left: 4px solid ${data.accentColor}; background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 500px; ${protectionCSS}"><style>${mobileCSS}</style>${contentHTML}</div>`,
              classic: `<div style="padding: 15px; border: 2px solid ${data.accentColor}; background: #ffffff; border-radius: 4px; max-width: 500px; ${protectionCSS}"><style>${mobileCSS}</style>${contentHTML}</div>`,
              minimal: `<div style="padding: 10px; background: #ffffff; max-width: 500px; ${protectionCSS}"><style>${mobileCSS}</style>${contentHTML}</div>`,
              elegant: `<div style="padding: 20px; background: #ffffff; border-bottom: 3px solid ${data.accentColor}; box-shadow: 0 1px 5px rgba(0,0,0,0.1); max-width: 500px; ${protectionCSS}"><style>${mobileCSS}</style>${contentHTML}</div>`,
              corporate: `<div style="padding: 18px; background: linear-gradient(to right, #ffffff 0%, #f8f9fa 100%); border: 1px solid #dee2e6; border-radius: 6px; max-width: 500px; ${protectionCSS}"><style>${mobileCSS}</style>${contentHTML}</div>`
          };

          return templates[data.template] || templates.modern;
      };

      // 🎨 STYLES CSS POUR ALIGNEMENT PARFAIT
      function addPerfectAlignmentCSS() {
          const style = document.createElement('style');
          style.id = 'perfect-alignment-css';
          style.textContent = `
              .signature-preview table {
                  border-collapse: collapse !important;
                  border-spacing: 0 !important;
                  margin: 0 !important;
                  padding: 0 !important;
              }
              
              .signature-preview td {
                  border: none !important;
                  margin: 0 !important;
                  vertical-align: middle !important;
              }
              
              .signature-preview img[data-protected="true"] {
                  display: block !important;
                  max-width: 100% !important;
                  height: auto !important;
                  vertical-align: middle !important;
              }
              
              .signature-content {
                  mso-table-lspace: 0pt !important;
                  mso-table-rspace: 0pt !important;
              }
          `;
          
          const oldStyle = document.getElementById('perfect-alignment-css');
          if (oldStyle) oldStyle.remove();
          
          document.head.appendChild(style);
      }

      // 🎯 BOUTON AUTO-ALIGNEMENT
      function addAutoAlignButton() {
          const logoSizeElement = window.signatureApp.elements.logoSize;
          if (logoSizeElement && !document.getElementById('autoAlignBtn')) {
              const autoAlignBtn = document.createElement('button');
              autoAlignBtn.id = 'autoAlignBtn';
              autoAlignBtn.type = 'button';
              autoAlignBtn.innerHTML = '🎯 Auto';
              autoAlignBtn.style.cssText = `
                  background: #28a745;
                  color: white;
                  border: none;
                  padding: 6px 10px;
                  border-radius: 4px;
                  cursor: pointer;
                  font-size: 11px;
                  margin-left: 8px;
                  transition: all 0.3s;
              `;
              
              autoAlignBtn.addEventListener('click', function() {
                  const textContent = window.signatureApp.elements.signaturePreview?.querySelector('.signature-text');
                  if (textContent) {
                      const textHeight = textContent.offsetHeight;
                      let recommendedSize = Math.min(Math.max(textHeight * 0.8, 40), 120);
                      recommendedSize = Math.round(recommendedSize / 10) * 10;
                      
                      logoSizeElement.value = recommendedSize;
                      window.signatureApp.updateSignature();
                      window.signatureApp.showNotification(`🎯 Logo ajusté à ${recommendedSize}px`, 'success');
                  }
              });
              
              logoSizeElement.parentElement.appendChild(autoAlignBtn);
          }
      }

      // 🚀 INITIALISATION
      addPerfectAlignmentCSS();
      
      // Attendre que les éléments soient prêts
      setTimeout(() => {
          addAutoAlignButton();
          window.signatureApp.updateSignature();
      }, 1000);

      console.log('🎨 Alignement logo corrigé - Symétrie parfaite activée !');
  }
});

// 🎴 TÉLÉCHARGEMENT FORMAT CARTE AVEC LIENS - VERSION CORRIGÉE
// À ajouter à la fin de votre script.js

document.addEventListener('DOMContentLoaded', function() {
  
  // Attendre que signatureApp soit prêt
  setTimeout(function() {
      
      // 🎨 GÉNÉRATION DE CARTE SIGNATURE SIMPLIFIÉE
      function generateSignatureCard(data) {
          const cardHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Carte Signature - ${data.name || 'Signature'}</title>
  <style>
      body { 
          font-family: Arial, sans-serif; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px;
          margin: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
      }
      
      .signature-card {
          background: white;
          border-radius: 15px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.2);
          overflow: hidden;
          width: 550px;
          min-height: 300px;
      }
      
      .card-header {
          background: ${data.accentColor || '#007bff'};
          padding: 20px;
          color: white;
      }
      
      .card-content {
          padding: 25px;
      }
      
      .name {
          font-size: 24px;
          font-weight: bold;
          color: #333;
          margin-bottom: 8px;
      }
      
      .title {
          font-size: 16px;
          color: ${data.accentColor || '#007bff'};
          margin-bottom: 5px;
          font-weight: 600;
      }
      
      .company {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
      }
      
      .contact-item {
          display: block;
          padding: 8px 12px;
          margin: 5px 0;
          background: #f8f9fa;
          border-radius: 20px;
          text-decoration: none;
          color: ${data.accentColor || '#007bff'};
          transition: all 0.3s ease;
          border: 1px solid #e9ecef;
      }
      
      .contact-item:hover {
          background: ${data.accentColor || '#007bff'};
          color: white;
          transform: translateX(5px);
      }
      
      .address {
          margin-top: 15px;
          padding: 10px;
          background: #fff3cd;
          border-radius: 8px;
          color: #856404;
          font-size: 12px;
      }
      
      .logo-img {
          float: right;
          width: ${data.logoSize || 80}px;
          height: auto;
          border-radius: 8px;
          margin-left: 20px;
      }
      
      @media print {
          body { background: white; padding: 0; }
          .signature-card { box-shadow: none; }
      }
  </style>
</head>
<body>
  <div class="signature-card">
      <div class="card-header">
          <h1 style="margin: 0; font-size: 20px;">📧 Signature Professionnelle</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Carte de contact interactive</p>
      </div>
      
      <div class="card-content">
          ${data.logo ? `<img src="${data.logo}" alt="Logo" class="logo-img" />` : ''}
          
          ${data.name ? `<div class="name">${data.name}</div>` : ''}
          ${data.title ? `<div class="title">${data.title}</div>` : ''}
          ${data.company ? `<div class="company">${data.company}</div>` : ''}
          
          ${data.email ? `<a href="mailto:${data.email}" class="contact-item">📧 ${data.email}</a>` : ''}
          ${data.phone ? `<a href="tel:${data.phone.replace(/\s/g, '')}" class="contact-item">📞 ${data.phone}</a>` : ''}
          ${data.website ? `<a href="${data.website.startsWith('http') ? data.website : 'https://' + data.website}" target="_blank" class="contact-item">🌐 ${data.website.replace(/^https?:\/\//, '')}</a>` : ''}
          ${data.includeSocial && data.linkedin ? `<a href="${data.linkedin.startsWith('http') ? data.linkedin : 'https://' + data.linkedin}" target="_blank" class="contact-item">💼 LinkedIn</a>` : ''}
          
          ${data.address ? `<div class="address"><strong>📍 Adresse :</strong><br>${data.address}</div>` : ''}
          
          <div style="margin-top: 20px; font-size: 12px; color: #666;">
              💡 Tous les liens sont cliquables dans cette version HTML
          </div>
      </div>
  </div>
</body>
</html>`;
          
          return cardHTML;
      }

      // 📥 TÉLÉCHARGEMENT SÉCURISÉ DE LA CARTE
      function downloadSignatureCard() {
          try {
              console.log('🎴 Début téléchargement carte...');
              
              // Récupérer les données du formulaire
              let data = {};
              
              // Méthode sécurisée pour récupérer les données
              try {
                  if (window.signatureApp && window.signatureApp.collectFormData) {
                      data = window.signatureApp.collectFormData();
                  } else {
                      // Fallback : récupération manuelle
                      data = {
                          name: document.getElementById('name')?.value || '',
                          title: document.getElementById('title')?.value || '',
                          company: document.getElementById('company')?.value || '',
                          email: document.getElementById('email')?.value || '',
                          phone: document.getElementById('phone')?.value || '',
                          website: document.getElementById('website')?.value || '',
                          address: document.getElementById('address')?.value || '',
                          linkedin: document.getElementById('linkedin')?.value || '',
                          includeSocial: document.getElementById('includeSocial')?.checked || false,
                          accentColor: document.getElementById('accentColor')?.value || '#007bff',
                          logoSize: document.getElementById('logoSize')?.value || '80',
                          logo: document.getElementById('logoPreview')?.src || ''
                      };
                  }
              } catch (e) {
                  console.error('Erreur collecte données:', e);
              }
              
              console.log('📊 Données collectées:', data);
              
              if (!data.name && !data.email) {
                  alert('❌ Veuillez renseigner au moins le nom et l\'email');
                  return;
              }
              
              const cardHTML = generateSignatureCard(data);
              const fileName = `carte-signature-${(data.name || 'signature').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.html`;
              
              console.log('📄 HTML généré, taille:', cardHTML.length);
              
              // Méthode de téléchargement compatible
              if (window.navigator && window.navigator.msSaveBlob) {
                  // Internet Explorer
                  const blob = new Blob([cardHTML], { type: 'text/html;charset=utf-8' });
                  window.navigator.msSaveBlob(blob, fileName);
              } else {
                  // Navigateurs modernes
                  const blob = new Blob([cardHTML], { type: 'text/html;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = fileName;
                  a.style.display = 'none';
                  
                  document.body.appendChild(a);
                  a.click();
                  
                  // Nettoyage
                  setTimeout(() => {
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                  }, 1000);
              }
              
              // Notification de succès
              if (window.signatureApp && window.signatureApp.showNotification) {
                  window.signatureApp.showNotification('🎴 Carte téléchargée avec succès !', 'success');
              } else {
                  alert('🎴 Carte téléchargée avec succès !');
              }
              
              console.log('✅ Téléchargement carte terminé');
              
          } catch (error) {
              console.error('❌ Erreur téléchargement carte:', error);
              alert('❌ Erreur lors du téléchargement de la carte: ' + error.message);
          }
      }

      // 🖼️ TÉLÉCHARGEMENT IMAGE SIMPLIFIÉ
      function downloadSignatureAsImage() {
          try {
              console.log('🖼️ Début téléchargement image...');
              
              // Récupérer les données
              let data = {};
              try {
                  if (window.signatureApp && window.signatureApp.collectFormData) {
                      data = window.signatureApp.collectFormData();
                  } else {
                      data = {
                          name: document.getElementById('name')?.value || '',
                          title: document.getElementById('title')?.value || '',
                          company: document.getElementById('company')?.value || '',
                          email: document.getElementById('email')?.value || '',
                          phone: document.getElementById('phone')?.value || '',
                          accentColor: document.getElementById('accentColor')?.value || '#007bff'
                      };
                  }
              } catch (e) {
                  console.error('Erreur collecte données image:', e);
              }
              
              if (!data.name && !data.email) {
                  alert('❌ Veuillez renseigner au moins le nom et l\'email');
                  return;
              }
              
              // Créer un canvas simple
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              canvas.width = 800;
              canvas.height = 400;
              
              // Fond
              ctx.fillStyle = '#f8f9fa';
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // Bordure
              ctx.strokeStyle = data.accentColor || '#007bff';
              ctx.lineWidth = 4;
              ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);
              
              // Texte
              ctx.fillStyle = '#333';
              ctx.font = 'bold 32px Arial';
              ctx.fillText(data.name || 'Nom', 50, 100);
              
              if (data.title) {
                  ctx.fillStyle = data.accentColor || '#007bff';
                  ctx.font = '24px Arial';
                  ctx.fillText(data.title, 50, 140);
              }
              
              if (data.company) {
                  ctx.fillStyle = '#666';
                  ctx.font = '20px Arial';
                  ctx.fillText(data.company, 50, 180);
              }
              
              if (data.email) {
                  ctx.fillStyle = data.accentColor || '#007bff';
                  ctx.font = '18px Arial';
                  ctx.fillText('📧 ' + data.email, 50, 220);
              }
              
              if (data.phone) {
                  ctx.fillText('📞 ' + data.phone, 50, 250);
              }
              
              // Note
              ctx.fillStyle = '#999';
              ctx.font = '14px Arial';
              ctx.fillText('💡 Téléchargez la version HTML pour des liens cliquables', 50, 320);
              
              // Télécharger
              canvas.toBlob(function(blob) {
                  if (!blob) {
                      alert('❌ Erreur lors de la génération de l\'image');
                      return;
                  }
                  
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `signature-${(data.name || 'image').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.png`;
                  a.style.display = 'none';
                  
                  document.body.appendChild(a);
                  a.click();
                  
                  setTimeout(() => {
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                  }, 1000);
                  
                  if (window.signatureApp && window.signatureApp.showNotification) {
                      window.signatureApp.showNotification('🖼️ Image PNG téléchargée !', 'success');
                  } else {
                      alert('🖼️ Image PNG téléchargée !');
                  }
                  
              }, 'image/png', 0.9);
              
              console.log('✅ Téléchargement image terminé');
              
          } catch (error) {
              console.error('❌ Erreur téléchargement image:', error);
              alert('❌ Erreur lors du téléchargement de l\'image: ' + error.message);
          }
      }

      // 🔘 AJOUTER LES BOUTONS
      function addCardDownloadButtons() {
          try {
              // Trouver le bouton de téléchargement existant
              const downloadBtn = document.getElementById('downloadBtn') || 
                                document.querySelector('button[onclick*="download"]') ||
                                document.querySelector('.download-btn') ||
                                document.querySelector('button:contains("Télécharger")');
              
              if (!downloadBtn) {
                  console.log('❌ Bouton de téléchargement original non trouvé');
                  return;
              }
              
              if (document.getElementById('cardDownloadBtn')) {
                  console.log('✅ Boutons déjà ajoutés');
                  return;
              }
              
              console.log('🔘 Ajout des nouveaux boutons...');
              
              // Créer les nouveaux boutons
              const cardBtn = document.createElement('button');
              cardBtn.id = 'cardDownloadBtn';
              cardBtn.type = 'button';
              cardBtn.innerHTML = '🎴 Carte';
              cardBtn.style.cssText = `
                  background: #ff6b6b;
                  color: white;
                  border: none;
                  padding: 10px 15px;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 14px;
                  margin-left: 10px;
                  transition: all 0.3s ease;
              `;
              
              const pngBtn = document.createElement('button');
              pngBtn.id = 'pngDownloadBtn';
              pngBtn.type = 'button';
              pngBtn.innerHTML = '🖼️ PNG';
              pngBtn.style.cssText = `
                  background: #74b9ff;
                  color: white;
                  border: none;
                  padding: 10px 15px;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 14px;
                  margin-left: 10px;
                  transition: all 0.3s ease;
              `;
              
              // Ajouter les événements
              cardBtn.addEventListener('click', function(e) {
                  e.preventDefault();
                  downloadSignatureCard();
              });
              
              pngBtn.addEventListener('click', function(e) {
                  e.preventDefault();
                  downloadSignatureAsImage();
              });
              
              // Effets hover
              [cardBtn, pngBtn].forEach(btn => {
                  btn.addEventListener('mouseenter', function() {
                      this.style.transform = 'translateY(-2px)';
                      this.style.opacity = '0.9';
                  });
                  
                  btn.addEventListener('mouseleave', function() {
                      this.style.transform = 'translateY(0)';
                      this.style.opacity = '1';
                  });
              });
              
              // Insérer après le bouton original
              downloadBtn.parentNode.insertBefore(cardBtn, downloadBtn.nextSibling);
              downloadBtn.parentNode.insertBefore(pngBtn, cardBtn.nextSibling);
              
              console.log('✅ Boutons ajoutés avec succès');
              
          } catch (error) {
              console.error('❌ Erreur ajout boutons:', error);
          }
      }

      // 🚀 INITIALISATION
      console.log('🎴 Initialisation téléchargement carte...');
      
      // Exposer les fonctions globalement
      window.downloadSignatureCard = downloadSignatureCard;
      window.downloadSignatureAsImage = downloadSignatureAsImage;
      
      // Ajouter les boutons après un délai
      setTimeout(addCardDownloadButtons, 2000);
      
      console.log('✅ Module téléchargement carte initialisé');
      
  }, 1500); // Attendre que tout soit chargé
  
});