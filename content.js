// ページ内の広告要素を特定してOpenAI APIに送る
function detectAds() {
    const adElements = document.querySelectorAll('iframe, .ad, [id*="ad"], [class*="ad"], a[href*="click"], a[href*="ads"]');
    
    adElements.forEach(adElement => {
      const adText = adElement.innerText || adElement.src || adElement.href;
  
      // 広告として疑わしい要素が見つかったら、OpenAI APIに送信
      sendToOpenAI(adText, (isAd) => {
        if (isAd) {
          adElement.style.display = 'none'; // 広告を非表示にする
        }
      });
    });
  }
  
  // OpenAI APIを使って広告かどうかを判断する
  function sendToOpenAI(adContent, callback) {
    const apiKey = '<>';
  
    fetch('https://api.openai.com/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: `Is the following text an advertisement? Respond with "yes" or "no".\n\n"${adContent}"`,
        max_tokens: 5
      })
    })
    .then(response => response.json())
    .then(data => {
      const result = data.choices[0].text.trim().toLowerCase();
      if (result === 'yes') {
        callback(true);  // 広告と判断された
      } else {
        callback(false); // 広告でないと判断された
      }
    })
    .catch(error => {
      console.error('Error in OpenAI API call:', error);
      callback(false);
    });
  }
  
  // ページ読み込み時に広告を検出・解析
  document.addEventListener('DOMContentLoaded', () => {
    detectAds();
  });
  