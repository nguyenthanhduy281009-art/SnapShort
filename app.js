/**
 * LinkShort - Static Version
 * Multi-language, Ripple effects, Toast, QR Generation, Copy
 */

// ============================================================
// Language System
// ============================================================
const LangSystem = {
  currentLang: 'vi',
  translations: {},
  availableLangs: [
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ],

  async init() {
    const storedLang = localStorage.getItem('linkshort_lang');
    const browserLang = navigator.language.substring(0, 2);

    if (storedLang) {
      this.currentLang = storedLang;
    } else {
      const isAvailable = this.availableLangs.some(l => l.code === browserLang);
      this.currentLang = isAvailable ? browserLang : 'vi';
      localStorage.setItem('linkshort_lang', this.currentLang);
    }

    await this.loadLanguage(this.currentLang);
    this.renderLanguageDropdown();
    this.applyTranslations();
    this.updateLanguageButton();
  },

  async loadLanguage(langCode) {
    try {
      const response = await fetch(`lang/${langCode}.json`);
      if (!response.ok) throw new Error('Language file not found');
      this.translations = await response.json();
      this.currentLang = langCode;
      localStorage.setItem('linkshort_lang', langCode);
      document.documentElement.setAttribute('lang', langCode);
    } catch (error) {
      console.error('Failed to load language:', langCode, error);
      if (langCode !== 'vi') {
        await this.loadLanguage('vi');
      }
    }
  },

  t(key) {
    return this.translations.translations?.[key] || key;
  },

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });

    document.querySelectorAll('[data-i18n-meta]').forEach(el => {
      const key = el.getAttribute('data-i18n-meta');
      el.content = this.t(key);
    });
  },

  updateLanguageButton() {
    const btn = document.getElementById('langToggleBtn');
    if (!btn) return;
    const currentLangObj = this.availableLangs.find(l => l.code === this.currentLang);
    if (currentLangObj) {
      btn.innerHTML = `<span>${currentLangObj.flag}</span> <span>${currentLangObj.name}</span> <i class="fas fa-chevron-down"></i>`;
    }
  },

  async changeLanguage(langCode) {
    if (langCode === this.currentLang) {
      document.getElementById('langDropdown').classList.remove('show');
      return;
    }

    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.add('show');

    await this.loadLanguage(langCode);
    this.applyTranslations();
    this.updateLanguageButton();
    this.renderLanguageDropdown();

    const resultSection = document.getElementById('resultSection');
    if (resultSection && resultSection.classList.contains('show')) {
      await App.renderResult();
    }

    if (loadingOverlay) {
      setTimeout(() => loadingOverlay.classList.remove('show'), 200);
    }

    Toast.show(this.t('toast_success'), 'success');
    document.getElementById('langDropdown').classList.remove('show');
  },

  renderLanguageDropdown() {
    const dropdown = document.getElementById('langDropdown');
    if (!dropdown) return;
    dropdown.innerHTML = this.availableLangs.map(lang => `
      <button class="lang-option ${lang.code === this.currentLang ? 'active' : ''}" 
              onclick="LangSystem.changeLanguage('${lang.code}')"
              type="button">
        <span>${lang.flag}</span>
        <span>${lang.name}</span>
      </button>
    `).join('');
  }
};

// ============================================================
// Toast Notification System
// ============================================================
const Toast = {
  container: null,
  init() {
    this.container = document.getElementById('toastContainer');
  },
  show(message, type = 'success', duration = 3000) {
    if (!this.container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};

// ============================================================
// Ripple Effect
// ============================================================
const RippleEffect = {
  init() {
    document.querySelectorAll('.btn, .btn-copy, .btn-download, .lang-option, .theme-toggle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ripple = document.createElement('span');
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        ripple.className = 'ripple';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
      });
    });
  }
};

// ============================================================
// Theme System
// ============================================================
const ThemeSystem = {
  currentTheme: 'light',
  init() {
    const stored = localStorage.getItem('linkshort_theme');
    if (stored) {
      this.currentTheme = stored;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme = prefersDark ? 'dark' : 'light';
      localStorage.setItem('linkshort_theme', this.currentTheme);
    }
    this.applyTheme();
  },
  toggle() {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('linkshort_theme', this.currentTheme);
    this.applyTheme();
  },
  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    const icon = document.getElementById('themeIcon');
    if (icon) {
      icon.className = this.currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    }
  }
};

// ============================================================
// QR Generator (using davidshimjs/qrcodejs)
// ============================================================
const QRGenerator = {
  generatePNG(text, size = 256) {
    return new Promise((resolve, reject) => {
      try {
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);

        const qr = new QRCode(tempDiv, {
          text: text,
          width: size,
          height: size,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.M
        });

        setTimeout(() => {
          try {
            const canvas = tempDiv.querySelector('canvas');
            if (canvas) {
              const dataUrl = canvas.toDataURL('image/png');
              document.body.removeChild(tempDiv);
              resolve(dataUrl);
            } else {
              const img = tempDiv.querySelector('img');
              if (img && img.src) {
                document.body.removeChild(tempDiv);
                resolve(img.src);
              } else {
                document.body.removeChild(tempDiv);
                reject(new Error('QR render failed'));
              }
            }
          } catch (e) {
            document.body.removeChild(tempDiv);
            reject(e);
          }
        }, 100);
      } catch (e) {
        reject(e);
      }
    });
  },

  async downloadPNG(text, filename = 'qrcode') {
    try {
      const dataUrl = await this.generatePNG(text, 512);
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download PNG error:', e);
    }
  },

  async generateSVG(text, size = 512) {
    const tempDiv = document.createElement('div');
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);

    const qr = new QRCode(tempDiv, {
      text: text,
      width: size,
      height: size,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const canvas = tempDiv.querySelector('canvas');
          if (canvas) {
            const imageData = canvas.getContext('2d').getImageData(0, 0, size, size);
            const data = imageData.data;
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
            svg += `<rect width="${size}" height="${size}" fill="#ffffff"/>`;
            for (let y = 0; y < size; y++) {
              for (let x = 0; x < size; x++) {
                const idx = (y * size + x) * 4;
                if (data[idx] < 128) {
                  svg += `<rect x="${x}" y="${y}" width="1" height="1" fill="#000000"/>`;
                }
              }
            }
            svg += '</svg>';
            document.body.removeChild(tempDiv);
            resolve(svg);
          } else {
            document.body.removeChild(tempDiv);
            reject(new Error('QR render failed'));
          }
        } catch (e) {
          document.body.removeChild(tempDiv);
          reject(e);
        }
      }, 100);
    });
  },

  async downloadSVG(text, filename = 'qrcode') {
    try {
      const svg = await this.generateSVG(text, 512);
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${filename}.svg`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Download SVG error:', e);
    }
  },

  async renderToImage(imgElement, text, size = 256) {
    try {
      const dataUrl = await this.generatePNG(text, size);
      imgElement.src = dataUrl;
      imgElement.alt = 'QR Code';
      return true;
    } catch (e) {
      console.error('QR render error:', e);
      return false;
    }
  }
};

// ============================================================
// Copy to Clipboard
// ============================================================
const CopyHelper = {
  async copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    }
  }
};

// ============================================================
// URL Validator
// ============================================================
function isValidURL(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// ============================================================
// Main App Controller
// ============================================================
const App = {
  currentResult: null,

  init() {
    Toast.init();
    ThemeSystem.init();
    RippleEffect.init();
    this.bindEvents();
  },

  bindEvents() {
    document.getElementById('btnGenerate').addEventListener('click', () => this.process());
    document.getElementById('themeToggle').addEventListener('click', () => ThemeSystem.toggle());

    document.getElementById('langToggleBtn').addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('langDropdown').classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('langDropdown');
      const toggle = document.getElementById('langToggleBtn');
      if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });

    document.getElementById('urlInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.process();
      }
    });
  },

  /**
   * Process: shorten link via TinyURL API + generate QR
   */
  async process() {
    const input = document.getElementById('urlInput');
    const url = input.value.trim();

    if (!url) {
      Toast.show(LangSystem.t('toast_error_empty'), 'error');
      return;
    }

    if (!isValidURL(url)) {
      Toast.show(LangSystem.t('toast_error_url'), 'error');
      return;
    }

    this.showLoading(true);

    try {
      // Use TinyURL free API for shortening
      let shortUrl = url;
      try {
        const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const text = await response.text();
          if (text && text.startsWith('http')) {
            shortUrl = text.trim();
          }
        }
      } catch (apiError) {
        console.warn('Shortening API failed, using original URL:', apiError);
      }

      this.currentResult = {
        originalUrl: url,
        shortUrl: shortUrl,
      };
      await this.renderResult();
    } catch (error) {
      console.error('Error:', error);
      Toast.show(LangSystem.t('toast_error_server'), 'error');
    }

    this.showLoading(false);
  },

  showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
      overlay.classList.add('show');
    } else {
      overlay.classList.remove('show');
    }
  },

  async renderResult() {
    if (!this.currentResult) return;

    const resultSection = document.getElementById('resultSection');
    const { originalUrl, shortUrl } = this.currentResult;

    let html = '<div class="result-divider"></div>';

    // Shortened URL
    html += `<div class="result-label">${LangSystem.t('result_shortened')}</div>`;
    html += `<div class="result-row">`;
    html += `<div class="result-url"><a href="${this.escapeHtml(shortUrl)}" target="_blank" rel="noopener">${this.escapeHtml(shortUrl)}</a></div>`;
    html += `<button class="btn-copy" onclick="App.copyShortUrl()" id="btnCopyUrl">`;
    html += `<i class="fas fa-copy"></i> ${LangSystem.t('btn_copy_short')}</button>`;
    html += `</div>`;

    // QR Code
    html += `<div class="qr-display">`;
    html += `<img id="qrImage" class="qr-image" src="" alt="QR Code">`;
    html += `</div>`;

    // Action buttons
    html += `<div class="result-actions">`;
    html += `<button class="btn-copy" onclick="App.copyShortUrl()">`;
    html += `<i class="fas fa-copy"></i> ${LangSystem.t('btn_copy_short')}</button>`;
    html += `<button class="btn-download" onclick="QRGenerator.downloadPNG('${this.escapeHtml(shortUrl)}')">`;
    html += `<i class="fas fa-download"></i> ${LangSystem.t('btn_download_png')}</button>`;
    html += `<button class="btn-download" onclick="QRGenerator.downloadSVG('${this.escapeHtml(shortUrl)}')">`;
    html += `<i class="fas fa-download"></i> ${LangSystem.t('btn_download_svg')}</button>`;
    html += `</div>`;

    resultSection.innerHTML = html;
    resultSection.classList.add('show');

    // Generate QR image from short URL
    const qrImg = document.getElementById('qrImage');
    if (qrImg) {
      await QRGenerator.renderToImage(qrImg, shortUrl, 256);
    }

    resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  },

  async copyShortUrl() {
    const text = this.currentResult ? this.currentResult.shortUrl : '';
    const success = await CopyHelper.copy(text);

    if (success) {
      Toast.show(LangSystem.t('toast_copied'), 'success');
      const btns = document.querySelectorAll('.btn-copy');
      btns.forEach(btn => {
        btn.classList.add('copied');
        btn.innerHTML = `<i class="fas fa-check"></i> ${LangSystem.t('toast_copied')}`;
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = `<i class="fas fa-copy"></i> ${LangSystem.t('btn_copy_short')}`;
        }, 2000);
      });
    }
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

// ============================================================
// Initialize on DOM Ready
// ============================================================
document.addEventListener('DOMContentLoaded', async () => {
  await LangSystem.init();
  App.init();
});
