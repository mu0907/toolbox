const adSelectors = [
    '.ad', '#ad', '[id^="ad-"]', '[class*="advertisement"]', '[class*="sponsored"]',
    'iframe[src*="ad"]', 'iframe[src*="sponsor"]'
  ];
  
  // 広告要素をすべて取得して非表示にする
  adSelectors.forEach(selector => {
    const ads = document.querySelectorAll(selector);
    ads.forEach(ad => ad.style.display = 'none');
  });
  
  // ミューテーションオブザーバーで新しい広告が追加されたら非表示にする
  const observer = new MutationObserver(() => {
    adSelectors.forEach(selector => {
      const ads = document.querySelectorAll(selector);
      ads.forEach(ad => ad.style.display = 'none');
    });
  });
  
  // DOMの変更を監視
  observer.observe(document.body, { childList: true, subtree: true });

