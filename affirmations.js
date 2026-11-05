export const normalizeAffirmation = text => text.trim().replace(/\s+/gu, ' ').toLowerCase();

export function createAffirmations(client) {
  const el = id => document.getElementById(id);
  let user = null, rows = [], selectedId = null, busy = false, ready = false;

  const status = message => { el('affirm-status').textContent = message; };
  const selected = () => rows.find(row => row.id === selectedId) || null;

  function render() {
    el('affirm-total-count').textContent = `${rows.length} / 100`;
    el('affirm-collection-progress').max = 100;
    el('affirm-collection-progress').value = rows.length;

    const list = el('affirm-list');
    list.replaceChildren();

    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'muted affirm-empty';
      empty.textContent = ready ? 'Sua lista ainda está vazia. Clique em “Criar afirmação” para começar.' : 'Carregando suas afirmações…';
      list.append(empty);
    } else {
      rows.forEach((item, index) => {
        const entry = document.createElement('article');
        entry.className = 'affirm-entry' + (item.id === selectedId ? ' is-selected' : '');
        const number = document.createElement('span');
        number.className = 'affirm-entry-number';
        number.textContent = String(index + 1).padStart(2, '0');

        const body = document.createElement('div');
        body.className = 'affirm-entry-body';
        const phrase = document.createElement('p');
        phrase.textContent = item.phrase;
        const meta = document.createElement('small');
        meta.textContent = `${item.repetitions || 0} / 100 repetições`;
        body.append(phrase, meta);

        const actions = document.createElement('div');
        actions.className = 'affirm-entry-actions';
        const practice = document.createElement('button');
        practice.type = 'button';
        practice.className = 'btn quiet';
        practice.textContent = item.id === selectedId ? 'Selecionada' : 'Praticar';
        practice.disabled = busy || item.id === selectedId;
        practice.addEventListener('click', () => {
          selectedId = item.id;
          el('affirm-phrase').textContent = item.phrase;
          el('affirm-session').hidden = false;
          el('affirm-input').value = '';
          render();
          el('affirm-input').focus();
        });

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'btn quiet affirm-delete';
        remove.textContent = 'Excluir';
        remove.disabled = busy;
        remove.addEventListener('click', () => deleteAffirmation(item));

        actions.append(practice, remove);
        entry.append(number, body, actions);
        list.append(entry);
      });
    }

    const item = selected();
    el('affirm-session').hidden = !item;
    if (item) {
      el('affirm-phrase').textContent = item.phrase;
      el('affirm-count').textContent = `${item.repetitions || 0} / 100`;
      el('affirm-progress').max = 100;
      el('affirm-progress').value = item.repetitions || 0;
      el('affirm-input').disabled = busy;
      el('affirm-send').disabled = busy || (item.repetitions || 0) >= 100;
    }

    el('affirm-add').disabled = busy || !ready || rows.length >= 100;
    el('affirm-new').disabled = busy || !ready || rows.length >= 100;
    el('affirm-create-toggle').disabled = busy || !ready || rows.length >= 100;
  }

  async function connect(account) {
    user = account;
    ready = false;
    el('affirm-retry').hidden = true;
    render();
    try {
      const { data, error } = await client.from('affirmations')
        .select('id,phrase,created_at,repetitions')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      rows = data || [];
      ready = true;
      status(rows.length >= 100
        ? 'Sua coleção chegou a 100 afirmações.'
        : 'Crie uma afirmação ou escolha uma da lista para praticar.');
    } catch (error) {
      console.error('Erro ao carregar afirmações:', error);
      ready = false;
      status('Não foi possível carregar suas afirmações. Confira sua conexão e tente novamente.');
      el('affirm-retry').hidden = false;
    }
    render();
  }

  async function deleteAffirmation(item) {
    if (busy || !window.confirm(`Excluir esta afirmação?\n\n“${item.phrase}”\n\nO progresso dela também será apagado.`)) return;
    busy = true;
    render();
    status('Excluindo afirmação…');
    try {
      const { error } = await client.from('affirmations')
        .delete()
        .eq('id', item.id)
        .eq('user_id', user.id);
      if (error) throw error;
      rows = rows.filter(row => row.id !== item.id);
      if (selectedId === item.id) {
        selectedId = null;
        el('affirm-session').hidden = true;
      }
      status('Afirmação excluída.');
    } catch (error) {
      console.error('Erro ao excluir afirmação:', error);
      status(`Não foi possível excluir: ${error?.message || 'tente novamente.'}`);
    }
    busy = false;
    render();
  }

  el('affirm-retry').addEventListener('click', () => connect(user));

  el('affirm-create-toggle').addEventListener('click', () => {
    const form = el('affirm-create');
    form.hidden = !form.hidden;
    el('affirm-create-toggle').setAttribute('aria-expanded', String(!form.hidden));
    el('affirm-create-toggle').textContent = form.hidden ? '+ Criar afirmação' : 'Cancelar';
    if (!form.hidden) el('affirm-new').focus();
  });

  el('affirm-create').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !ready) return;

    const phrase = el('affirm-new').value.trim().replace(/\s+/gu, ' ');
    if (!phrase) return;
    if (rows.length >= 100) {
      status('Sua coleção já chegou a 100 afirmações!');
      return;
    }
    if (rows.some(row => normalizeAffirmation(row.phrase) === normalizeAffirmation(phrase))) {
      status('Essa afirmação já está na sua lista. Escreva uma diferente.');
      return;
    }

    busy = true;
    render();
    status('Salvando afirmação…');
    try {
      const { data, error } = await client.from('affirmations')
        .insert({ user_id: user.id, phrase })
        .select('id,phrase,created_at,repetitions')
        .single();
      if (error) throw error;
      rows.push(data);
      el('affirm-new').value = '';
      el('affirm-create').hidden = true;
      el('affirm-create-toggle').setAttribute('aria-expanded', 'false');
      el('affirm-create-toggle').textContent = '+ Criar afirmação';
      status('Afirmação criada! Agora você pode selecioná-la para praticar.');
    } catch (error) {
      console.error('Erro ao salvar afirmação:', error);
      status(error?.code === '23505'
        ? 'Essa afirmação já está na sua lista. Escreva uma diferente.'
        : `Não foi possível salvar: ${error?.message || 'tente novamente.'}`);
    }
    busy = false;
    render();
  });

  el('affirm-session-close').addEventListener('click', () => {
    selectedId = null;
    el('affirm-session').hidden = true;
    render();
  });

  el('affirm-send-form').addEventListener('submit', async event => {
    event.preventDefault();
    const item = selected();
    if (busy || !item) return;
    const typed = el('affirm-input').value.trim().replace(/\s+/gu, ' ');
    if (!typed) return;
    if (normalizeAffirmation(typed) !== normalizeAffirmation(item.phrase)) {
      status('A frase ainda não está igual à afirmação selecionada. Tente novamente.');
      return;
    }
    if ((item.repetitions || 0) >= 100) {
      status('Você já completou 100 repetições desta afirmação.');
      return;
    }

    busy = true;
    render();
    status('Salvando repetição…');
    try {
      const { data, error } = await client.rpc('submit_affirmation', {
        p_id: item.id,
        p_submission: crypto.randomUUID(),
        p_text: typed
      });
      if (error) throw error;
      item.repetitions = Number(data);
      el('affirm-input').value = '';
      status(item.repetitions >= 100
        ? '100 de 100! Você completou esta afirmação.'
        : `Muito bem! ${item.repetitions} de 100 repetições concluídas.`);
    } catch (error) {
      console.error('Erro ao registrar repetição:', error);
      status(`Não foi possível registrar: ${error?.message || 'tente novamente.'}`);
    }
    busy = false;
    render();
    if ((item.repetitions || 0) < 100) el('affirm-input').focus();
  });

  el('affirm-input').addEventListener('keydown', event => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      el('affirm-send-form').requestSubmit();
    }
  });

  return { connect };
}
