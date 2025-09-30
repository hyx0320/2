// Minimal front-end chat wiring that uses APIManager (Qwen first)
class APIManager {
  constructor() {
    this.currentModel = 'qwen';
    this.apiKey = "sk-60f504ee4a404db39bd9a9faf1ff3543";
    this.apiUrl = '';
    this.availableModels = {
      qwen: ['qwen3-235b-a22b','qwen-turbo-2025-04-28','qwen-plus','qwen-turbo']
    };
  }
  setApiKey(key){ this.apiKey = key; }
  setModel(model){ this.currentModel = model; }
  setApiUrl(url){ this.apiUrl = url; }
  getAvailableModel(){
    const sel = document.getElementById('available-model-select');
    return sel?.value || 'qwen-turbo';
  }
  async sendMessage(message){
    return this.sendToQwen(message);
  }
  async sendMessageWithWebSearch(message){
    return this.sendToQwen('[WEB_SEARCH] ' + message, true);
  }
  async sendToQwen(message, webSearch=false){
    const key = this.apiKey || localStorage.getItem('dashscope_api_key');
    if(!key){ throw new Error('请先填写 DashScope API Key'); }
    const url = this.apiUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
    const payload = {
      model: this.getAvailableModel(),
      messages: [{ role: 'user', content: `请严格按照Markdown格式回答。问题：${message}` }],
      max_tokens: 2000,
      temperature: 0.7,
      enable_thinking: false
    };
    if(webSearch){
      payload.plugins = [{ web_search: { enable: true, search_result: true } }];
    }
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(payload)
    });
    if(!resp.ok){
      const txt = await resp.text();
      throw new Error(`通义千问API错误: ${resp.status} - ${txt}`);
    }
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if(!content){ throw new Error('通义千问返回格式异常'); }
    return content;
  }
}

(function(){
  // 轻量 Markdown 渲染：避免 XSS，支持常用语法
  function escapeHtml(str){
    return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[s]));
  }
  function renderMarkdown(md){
    if(!md) return '';
    // 代码块（三个反引号）优先处理
    const codeBlocks = [];
    md = md.replace(/```([\s\S]*?)```/g, (m, p1)=>{
      const idx = codeBlocks.length;
      codeBlocks.push(`<pre><code>${escapeHtml(p1)}</code></pre>`);
      return `[[CODE_BLOCK_${idx}]]`;
    });

    // 转义HTML
    md = escapeHtml(md);

    // 标题 # ## ###
    md = md.replace(/^###\s+(.*)$/gm, '<h3>$1</h3>')
           .replace(/^##\s+(.*)$/gm, '<h2>$1</h2>')
           .replace(/^#\s+(.*)$/gm, '<h1>$1</h1>');

    // 粗体、斜体、行内代码
    md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
           .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
           .replace(/`([^`]+)`/g, '<code>$1</code>');

    // 链接 [text](url)
    md = md.replace(/\[([^\]]+)\]\((https?:[^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer nofollow">$1</a>');

    // 引用与分割线
    md = md.replace(/^>\s+(.*)$/gm, '<blockquote>$1</blockquote>')
           .replace(/^---$/gm, '<hr/>');

    // 列表（简单处理）
    // 无序列表
    md = md.replace(/^(\s*)-\s+(.*)$/gm, '$1• $2');
    // 段落换行
    md = md.replace(/\n\n+/g, '</p><p>');
    md = `<p>${md}</p>`;

    // 恢复代码块占位
    md = md.replace(/\[\[CODE_BLOCK_(\d+)\]\]/g, (m, i)=> codeBlocks[Number(i)] || m);
    return md;
  }
  const api = new APIManager();
  const elMessages = document.getElementById('chat-messages');
  const elForm = document.getElementById('chat-form');
  const elText = document.getElementById('chat-text');
  const elSaveKey = document.getElementById('btn-save-key');
  const elKeyInput = document.getElementById('api-key-input');
  const elBtnSend = document.getElementById('btn-send');
  const elBtnWeb = document.getElementById('btn-web');

  // restore key
  const savedKey = localStorage.getItem('dashscope_api_key');
  if(savedKey){ elKeyInput.value = '********'; }

  elSaveKey?.addEventListener('click', ()=>{
    const v = elKeyInput.value.trim();
    if(!v || v==='********'){ alert('请输入有效的 DashScope API Key'); return; }
    localStorage.setItem('dashscope_api_key', v);
    api.setApiKey(v);
    alert('API Key 已保存到本地浏览器');
  });

  function appendMessage(role, html){
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + (role==='user' ? 'user' : 'ai');
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = html;
    wrap.appendChild(bubble);
    elMessages.appendChild(wrap);
    elMessages.scrollTop = elMessages.scrollHeight;
  }

  async function handleSend(web=false){
    const msg = elText.value.trim();
    if(!msg) return;
    appendMessage('user', msg.replace(/\n/g,'<br/>'));
    elText.value = '';
    elBtnSend.disabled = true; elBtnWeb.disabled = true;
    try{
      const answer = web ? await api.sendMessageWithWebSearch(msg) : await api.sendMessage(msg);
      appendMessage('ai', renderMarkdown(answer));
    }catch(err){
      appendMessage('ai', `<span style="color:#b91c1c">错误：${err.message}</span>`);
    }finally{
      elBtnSend.disabled = false; elBtnWeb.disabled = false;
    }
  }

  elForm?.addEventListener('submit', (e)=>{ e.preventDefault(); handleSend(false); });
  elBtnWeb?.addEventListener('click', ()=> handleSend(true));
})();
