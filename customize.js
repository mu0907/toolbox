document.addEventListener('DOMContentLoaded', () => {
    // 初期設定を読み込む
    chrome.storage.local.get({
      theme: 'light',
      adBlock: false,
      summary: false,
      sync: false,
      searchEngines: {
        google: true,
        yahoo: true,
        bing: true,
        duckduckgo: true,
        brave: true,
      }
    }, (settings) => {
      // テーマ
      document.getElementById('themeLight').checked = settings.theme === 'light';
      document.getElementById('themeDark').checked = settings.theme === 'dark';
  
      // 各機能
      document.getElementById('toggleAdBlock').checked = settings.adBlock;
      document.getElementById('toggleSummary').checked = settings.summary;
      document.getElementById('toggleSync').checked = settings.sync;
  
      // 検索エンジン
      document.getElementById('enableGoogle').checked = settings.searchEngines.google;
      document.getElementById('enableYahoo').checked = settings.searchEngines.yahoo;
      document.getElementById('enableBing').checked = settings.searchEngines.bing;
      document.getElementById('enableDuckDuckGo').checked = settings.searchEngines.duckduckgo;
      document.getElementById('enableBrave').checked = settings.searchEngines.brave;
    });
  
    // 設定保存
    document.getElementById('saveSettingsBtn').addEventListener('click', () => {
      const theme = document.getElementById('themeLight').checked ? 'light' : 'dark';
      const adBlock = document.getElementById('toggleAdBlock').checked;
      const summary = document.getElementById('toggleSummary').checked;
      const sync = document.getElementById('toggleSync').checked;
  
      const searchEngines = {
        google: document.getElementById('enableGoogle').checked,
        yahoo: document.getElementById('enableYahoo').checked,
        bing: document.getElementById('enableBing').checked,
        duckduckgo: document.getElementById('enableDuckDuckGo').checked,
        brave: document.getElementById('enableBrave').checked,
      };
  
      // 設定を保存
      chrome.storage.local.set({ theme, adBlock, summary, sync, searchEngines }, () => {
        alert('設定が保存されました！');
      });
    });
  });


  
  