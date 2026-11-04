export const normalizeAffirmation = text => text.trim().replace(/\s+/gu, ' ').toLowerCase();

export function createAffirmations(client) {
  const el = id => document.getElementById(id);
  let user = null, rows = [], busy = false, ready = false;

  const status = message => { el('affirm-status').textContent = message; };

  function render() {
    const count = rows.length;
    el('affirm-count').textContent = `${count} / 100`;
    el('affirm-progress').max = 100;
    el('affirm-progress').value = count;
    el('affirm-add').disabled = busy || !ready || count >= 100;
    el('affirm-new').disabled = busy || !ready || count >= 100;

    const list = el('affirm-list');
    list.replaceChildren();

    if (!count) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = ready ? 'Sua lista ainda está vazia. Escreva a primeira afirmação acima.' : 'Carregando suas afirmações…';
      list.append(empty);
      return;
    }

    rows.forEach((item, index) => {
      const entry = document.createElement('div');
      entry.className = 'affirm-entry';
      const number = document.createElement('span');
      number.className = 'affirm-entry-number';
      number.textContent = String(index + 1).padStart(2, '0');
      const phrase = document.createElement('p');
      phrase.textContent = item.phrase;
      entry.append(number, phrase);
      list.append(entry);
    });
  }

  async function connect(account) {
    user = account;
    ready = false;
    el('affirm-retry').hidden = true;
    render();
    try {
      const { data, error } = await client.from('affirmations')
        .select('id,phrase,created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      rows = data || [];
      ready = true;
      status(rows.length >= 100
        ? 'Você completou sua coleção de 100 afirmações!'
        : 'Cada afirmação fica salva automaticamente na sua coleção.');
    } catch {
      status('Não foi possível carregar suas afirmações. Tente novamente.');
      el('affirm-retry').hidden = false;
    }
    render();
  }

  el('affirm-retry').addEventListener('click', () => connect(user));

  el('affirm-create').addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || !ready) return;

    const phrase = el('affirm-new').value.trim().replace(/\s+/gu, ' ');
    if (!phrase) return;

    if (rows.length >= 100) {
      status('Sua coleção já chegou a 100 afirmações!');
      return;
    }

    const existing = rows.find(row => normalizeAffirmation(row.phrase) === normalizeAffirmation(phrase));
    if (existing) {
      status('Essa afirmação já está na sua lista. Escreva uma diferente para continuar.');
      return;
    }

    busy = true;
    render();
    status('Salvando afirmação…');

    try {
      const { data, error } = await client.from('affirmations')
        .insert({ user_id: user.id, phrase })
        .select('id,phrase,created_at')
        .single();
      if (error) throw error;

      rows.push(data);
      el('affirm-new').value = '';
      status(rows.length === 100
        ? '100 afirmações! Você completou sua coleção.'
        : `Afirmação salva! Faltam ${100 - rows.length} para completar as 100.`);
    } catch (error) {
      status(error?.code === '23505'
        ? 'Essa afirmação já está na sua lista. Escreva uma diferente.'
        : 'Não foi possível salvar. Tente novamente.');
    }

    busy = false;
    render();
    el('affirm-new').focus();
  });

  return { connect };
}
