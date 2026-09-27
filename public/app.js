const executiveSelect = document.querySelector('#executive');
const dateSelect = document.querySelector('#date');
const status = document.querySelector('#status');
const visitsElement = document.querySelector('#visits');
const template = document.querySelector('#visit-template');

function setStatus(message, isError = false) {
  status.textContent = message;
  status.classList.toggle('error', isError);
}

function formatTime(visitAt) {
  const time = visitAt.slice(11, 16);
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  return `${((hours + 11) % 12) + 1}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function addVisit(visit) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector('.visit-card');
  const outcome = fragment.querySelector('.outcome');
  const nextAction = fragment.querySelector('.next-action');
  const button = fragment.querySelector('.save');
  const message = fragment.querySelector('.card-message');
  const briefText = fragment.querySelector('.brief-text');

  fragment.querySelector('.visit-time').textContent = formatTime(visit.visit_at);
  fragment.querySelector('.customer').textContent = visit.customer_name;
  fragment.querySelector('.details').textContent = `${visit.project} · ${visit.config}`;
  fragment.querySelector('.phone').textContent = `Phone ${visit.phone}`;
  briefText.textContent = visit.brief;
  outcome.value = visit.outcome;
  nextAction.value = visit.next_action;
  const badge = fragment.querySelector('.outcome-badge');
  badge.textContent = visit.outcome || 'Pending';
  badge.classList.toggle('pending', !visit.outcome);

  button.addEventListener('click', async () => {
    message.textContent = '';
    if (!outcome.value) {
      message.textContent = 'Choose an outcome before saving.';
      message.className = 'card-message error';
      outcome.focus();
      return;
    }
    button.disabled = true;
    button.textContent = 'Saving…';
    try {
      const response = await fetch(`/visits/${encodeURIComponent(visit.visit_id)}/outcome`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outcome: outcome.value, next_action: nextAction.value })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Could not save the update.');
      visit = payload.visit;
      outcome.value = visit.outcome;
      nextAction.value = visit.next_action;
      badge.textContent = visit.outcome;
      badge.classList.remove('pending');
      briefText.textContent = visit.brief;
      message.textContent = 'Saved.';
      message.className = 'card-message success';
    } catch (error) {
      message.textContent = error.message;
      message.className = 'card-message error';
    } finally {
      button.disabled = false;
      button.textContent = 'Save update';
    }
  });
  visitsElement.append(card);
}

async function loadVisits() {
  visitsElement.replaceChildren();
  setStatus('Loading visits…');
  try {
    const query = new URLSearchParams({ executive: executiveSelect.value, date: dateSelect.value });
    const response = await fetch(`/visits?${query}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Could not load visits.');
    if (payload.visits.length === 0) {
      setStatus('No visits scheduled for this executive and date.');
      return;
    }
    setStatus(`${payload.visits.length} visit${payload.visits.length === 1 ? '' : 's'} scheduled.`);
    payload.visits.forEach(addVisit);
  } catch (error) {
    setStatus(error.message, true);
  }
}

executiveSelect.addEventListener('change', loadVisits);
dateSelect.addEventListener('change', loadVisits);
loadVisits();
