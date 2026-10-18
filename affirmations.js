export const normalizeAffirmation = text => text.trim().replace(/\s+/gu, ' ').toLowerCase();

export function createAffirmations(client) {
  const el = id => document.getElementById(id);
  let user, rows = [], activeId = '', busy = false, ready = false, pending = null;
  const drafts = new Map();
  const active = () => rows.find(row => row.id === activeId);
  const status = message => { el('affirm-status').textContent = message; };
  function render() {
    const row = active();
    el('affirm-select').replaceChildren();
    if (!rows.length) el('affirm-select').add(new Option(ready ? 'Crie sua primeira afirmação' : 'Carregando…', ''));
    rows.forEach(item => el('affirm-select').add(new Option(`${item.phrase} · ${item.repetitions}/100`, item.id)));
    el('affirm-select').value = activeId;
    el('affirm-select').disabled = busy || !rows.length;
    el('affirm-add').disabled = busy || !ready;
    el('affirm-new').disabled = busy || !ready;
    el('affirm-session').hidden = !row;
    if (!row) return;
    el('affirm-phrase').textContent = row.phrase;
    el('affirm-count').textContent = `${row.repetitions} / 100`;
    el('affirm-progress').value = row.repetitions;
    el('affirm-send').disabled = busy || row.repetitions >= 100;
    el('affirm-input').disabled = busy || row.repetitions >= 100;
    el('affirm-send').textContent = busy ? 'Enviando…' : 'Enviar';
  }
  async function connect(account) {
    user = account;
    ready = false;
    el('affirm-retry').hidden = true;
    render();
    try {
      const { data, error } = await client.from('affirmations').select('id,phrase,repetitions,created_at').eq('user_id', user.id).order('created_at');
      if (error) throw error;
      rows = data;
      activeId = rows.some(row => row.id === activeId) ? activeId : rows[0]?.id || '';
      ready = true;
      status(active()?.repetitions === 100 ? '100 repetições concluídas. Você pode começar outra afirmação.' : 'Seu progresso fica salvo por afirmação, inclusive entre dias.');
    } catch {
      status('Não foi possível carregar suas afirmações. Tente novamente.');
      el('affirm-retry').hidden = false;
    }
    render();
  }
  el('affirm-retry').addEventListener('click', () => connect(user));
  el('affirm-select').addEventListener('change', event => {
    drafts.set(activeId, el('affirm-input').value);
    activeId = event.target.value;
    pending = null;
    el('affirm-input').value = drafts.get(activeId) || '';
    status(active()?.repetitions === 100 ? '100 repetições concluídas!' : 'Continue de onde parou.');
    render();
  });
  el('affirm-create').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !ready) return;
    const phrase = el('affirm-new').value.trim().replace(/\s+/gu, ' ');
    if (!phrase) return;
    const existing = rows.find(row => normalizeAffirmation(row.phrase) === normalizeAffirmation(phrase));
    if (existing) {
      status('Essa afirmação já existe. Selecione-a acima para continuar seu contador.');
      return;
    }
    busy = true; render(); status('Criando afirmação…');
    try {
      const { data, error } = await client.from('affirmations').insert({user_id:user.id, phrase}).select('id,phrase,repetitions,created_at').single();
      if (error) throw error;
      drafts.set(activeId, el('affirm-input').value);
      rows.push(data); activeId = data.id; pending = null;
      el('affirm-new').value = ''; el('affirm-input').value = '';
      status('Afirmação criada. Seu novo contador começa em 0.');
    } catch { status('Não foi possível criar. Tente novamente; se ela já foi salva, recarregue a página.'); }
    busy = false; render(); el('affirm-input').focus();
  });
  async function send(event) {
    event.preventDefault();
    const row = active();
    if (busy || !ready || !row || row.repetitions >= 100) return;
    const text = el('affirm-input').value;
    if (!text.trim()) { status('Digite sua afirmação antes de enviar.'); return; }
    if (normalizeAffirmation(text) !== normalizeAffirmation(row.phrase)) {
      status('Escreva a mesma frase da afirmação selecionada para contar a repetição.'); return;
    }
    if (!pending || pending.affirmation !== row.id || pending.text !== text) pending = {affirmation:row.id, text, id:crypto.randomUUID()};
    busy = true; render(); status('Salvando repetição…');
    try {
      const { data, error } = await client.rpc('submit_affirmation', {p_id:row.id,p_submission:pending.id,p_text:text});
      if (error) throw error;
      row.repetitions = data;
      pending = null; drafts.delete(row.id); el('affirm-input').value = '';
      status(data === 100 ? '100 repetições concluídas! Seu progresso está salvo.' : 'Repetição salva.');
    } catch { status('Não foi possível confirmar o salvamento. Envie novamente para tentar, sem duplicar a repetição.'); }
    busy = false; render(); el('affirm-input').focus();
  }
  el('affirm-send-form').addEventListener('submit', send);
  el('affirm-input').addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && !event.repeat) send(event);
  });
  return { connect };
}
