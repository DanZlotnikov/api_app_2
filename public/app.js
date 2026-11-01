const chatEl = document.getElementById('chat');
const formEl = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');
const fileNameEl = document.getElementById('file-name');
const removeFileBtn = document.getElementById('remove-file');
const sendBtn = document.getElementById('send-btn');

let selectedFile = null;

renderEmptyState();

fileInput.addEventListener('change', () => {
  selectedFile = fileInput.files[0] || null;
  updateFilePreview();
});

removeFileBtn.addEventListener('click', () => {
  selectedFile = null;
  fileInput.value = '';
  updateFilePreview();
});

messageInput.addEventListener('input', () => {
  messageInput.style.height = 'auto';
  messageInput.style.height = Math.min(messageInput.scrollHeight, 160) + 'px';
});

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    formEl.requestSubmit();
  }
});

formEl.addEventListener('submit', async (e) => {
  e.preventDefault();

  const text = messageInput.value.trim();
  if (!text && !selectedFile) return;

  removeEmptyState();
  addMessage('user', text, selectedFile ? selectedFile.name : null);

  const formData = new FormData();
  formData.append('message', text);
  if (selectedFile) formData.append('file', selectedFile);

  messageInput.value = '';
  messageInput.style.height = 'auto';
  const fileToClear = selectedFile;
  selectedFile = null;
  fileInput.value = '';
  updateFilePreview();

  setSending(true);
  const loadingEl = addMessage('loading', 'Thinking...');

  try {
    const res = await fetch('/api/chat', { method: 'POST', body: formData });
    const data = await res.json();
    loadingEl.remove();

    if (!res.ok) {
      addMessage('error', data.error || 'Something went wrong.');
    } else {
      addMessage('assistant', data.reply);
    }
  } catch (err) {
    loadingEl.remove();
    addMessage('error', 'Could not reach the server. Please try again.');
  } finally {
    setSending(false);
  }
});

function addMessage(role, text, attachmentName) {
  const el = document.createElement('div');
  el.className = `message ${role}`;

  if (attachmentName) {
    const tag = document.createElement('span');
    tag.className = 'attachment-tag';
    tag.textContent = `📎 ${attachmentName}`;
    el.appendChild(tag);
  }

  const body = document.createElement('span');
  body.textContent = text;
  el.appendChild(body);

  chatEl.appendChild(el);
  chatEl.scrollTop = chatEl.scrollHeight;
  return el;
}

function updateFilePreview() {
  if (selectedFile) {
    fileNameEl.textContent = `📎 ${selectedFile.name}`;
    filePreview.classList.remove('hidden');
  } else {
    filePreview.classList.add('hidden');
  }
}

function setSending(isSending) {
  sendBtn.disabled = isSending;
}

function renderEmptyState() {
  const el = document.createElement('div');
  el.className = 'empty-state';
  el.id = 'empty-state';
  el.textContent = 'Start a conversation. You can optionally attach a file.';
  chatEl.appendChild(el);
}

function removeEmptyState() {
  const el = document.getElementById('empty-state');
  if (el) el.remove();
}
