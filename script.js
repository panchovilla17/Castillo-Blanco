'use strict';
(() => {
  const config = window.CB_CONFIG || {};
  const number = value => /^\+?[1-9]\d{7,14}$/.test(String(value || '').trim()) ? String(value).trim() : '';
  const phone = number(config.telefono);
  const whatsapp = number(config.whatsapp).replace(/^\+/, '');
  const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.correo || '') ? config.correo : '';
  const nav = document.getElementById('main-nav');
  const menu = document.querySelector('.menu-toggle');
  const closeMenu = () => { nav?.classList.remove('open'); menu?.setAttribute('aria-expanded', 'false'); menu?.setAttribute('aria-label', 'Abrir menú'); };
  menu?.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; nav?.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú'); });
  nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  window.matchMedia('(min-width: 961px)').addEventListener('change', closeMenu);
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  // El logo original siempre se muestra sin filtros que alteren su fondo.
  const icon = id => { const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); const use = document.createElementNS('http://www.w3.org/2000/svg', 'use'); use.setAttribute('href', '#' + id); svg.append(use); svg.setAttribute('aria-hidden', 'true'); return svg; };
  const contactOptions = document.getElementById('contact-options');
  function contactLink(title, subtitle, href, symbol, external = false) {
    const link = document.createElement('a'); link.className = 'contact-option'; link.href = href;
    if (external) { link.target = '_blank'; link.rel = 'noopener'; }
    const image = document.createElement('span'); image.className = 'contact-icon'; image.append(icon(symbol));
    const text = document.createElement('span'); const strong = document.createElement('strong'); const small = document.createElement('small');
    strong.textContent = title; small.textContent = subtitle; text.append(strong, small); link.append(image, text, icon('i-arrow'));
    contactOptions?.append(link); return link;
  }
  if (phone) { document.getElementById('phone-pending')?.remove(); contactLink('Llámanos', config.telefonoVisible || phone, 'tel:' + phone, 'i-phone'); }
  if (whatsapp) contactLink('Conversemos por WhatsApp', 'Cuéntanos tu idea o consulta por CAMI', 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent('Hola, Castillo Blanco. Me gustaría conversar sobre sus aplicaciones.'), 'i-phone', true);
  if (email) contactLink('Escríbenos', email, 'mailto:' + email, 'i-mail');
  if (phone || whatsapp || email) document.getElementById('contact-channel-note')?.remove();
  try {
    const play = new URL(config.googlePlayUrl);
    if (play.protocol === 'https:' && play.hostname === 'play.google.com' && play.pathname === '/store/apps/details' && play.searchParams.get('id')) {
      const pill = document.querySelector('.status-pill');
      if (pill) { const link = document.createElement('a'); link.className = 'btn btn-primary'; link.href = play.href; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'Ver CAMI en Google Play'; pill.replaceWith(link); }
      const faq = document.getElementById('cami-faq');
      if (faq) { faq.textContent = 'CAMI está disponible en Google Play. '; const link = document.createElement('a'); link.href = play.href; link.textContent = 'Abrir ficha oficial'; link.className = 'text-link'; link.target = '_blank'; link.rel = 'noopener'; faq.append(link); }
    }
  } catch { /* Se conserva el estado de preparación si aún no hay ficha oficial. */ }
  if ('IntersectionObserver' in window && nav) {
    const links = [...nav.querySelectorAll('a[href^="#"]:not(.btn)')];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) links.forEach(link => { const active = link.hash === '#' + entry.target.id; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); });
    }, { rootMargin: '-15% 0px -55% 0px', threshold: 0 });
    links.forEach(link => { const section = document.querySelector(link.hash); if (section) observer.observe(section); });
  }
  let lastFocus;
  function openDialog(dialog) { if (!dialog) return; lastFocus = document.activeElement; dialog.showModal(); document.body.style.overflow = 'hidden'; }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => { document.body.style.overflow = ''; lastFocus?.focus(); });
    dialog.addEventListener('click', event => { const box = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close(); });
  });
  let requestText = '';
  const form = document.getElementById('project-form');
  form?.addEventListener('submit', event => {
    event.preventDefault();
    const idea = form.elements.idea;
    const name = form.elements.nombre;
    name.setCustomValidity(name.value.trim() ? '' : 'Ingresa tu nombre.');
    idea.setCustomValidity(idea.value.trim().length >= 20 ? '' : 'Cuéntanos tu idea en al menos 20 caracteres.');
    if (!form.reportValidity()) return;
    const data = new FormData(form); const value = key => String(data.get(key) || '').trim();
    requestText = ['SOLICITUD DE APP PERSONALIZADA · CASTILLO BLANCO', '', 'Nombre: ' + value('nombre'), 'Empresa: ' + (value('empresa') || 'No indicada'), 'Correo: ' + value('correo'), 'Teléfono: ' + (value('telefono') || 'No indicado'), 'Tipo de app: ' + value('tipo'), 'Plataforma: ' + value('plataforma'), '', 'Mi idea:', value('idea'), '', 'He leído la Política de Privacidad y acepto compartir estos datos para recibir una respuesta sobre mi proyecto.', '', 'Solicito una cotización. Entiendo que el anticipo del 50% se coordina después de aprobar la propuesta y que el saldo se coordina antes de la entrega final. Esta solicitud no constituye un pago.'].join('\n');
    document.getElementById('request-summary').textContent = requestText;
    const waLink = document.getElementById('send-whatsapp'); const mailLink = document.getElementById('send-email');
    if (whatsapp) { waLink.hidden = false; waLink.href = 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(requestText); }
    if (email) { mailLink.hidden = false; mailLink.href = 'mailto:' + email + '?subject=' + encodeURIComponent('Solicitud de app personalizada · ' + value('nombre')) + '&body=' + encodeURIComponent(requestText); }
    document.getElementById('request-status').textContent = 'Revisa los datos. La solicitud aún no se ha enviado.';
    document.getElementById('request-note').textContent = whatsapp || email ? 'Abrir WhatsApp o tu correo prepara un mensaje. Debes enviarlo desde esa aplicación. Si el mensaje es muy largo, descarga la solicitud y adjúntala.' : 'La atención directa todavía no está habilitada. Descarga tu solicitud para conservarla; no se enviará automáticamente.';
    openDialog(document.getElementById('request-dialog'));
  });
  ['nombre','idea'].forEach(key => form?.elements[key]?.addEventListener('input', () => form.elements[key].setCustomValidity('')));
  document.getElementById('download-request')?.addEventListener('click', () => {
    if (!requestText) return;
    const blob = new Blob(['\uFEFF' + requestText], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = 'Solicitud_App_Castillo_Blanco.txt'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 30000);
    document.getElementById('request-note').textContent = 'Se ha iniciado la descarga. El archivo contiene tus datos de contacto. Descargarlo no lo envía a Castillo Blanco.';
  });
  const paymentDialog = document.getElementById('payment-dialog');
  function updatePaymentLinks() {
    const actions = document.getElementById('payment-actions'); const status = document.getElementById('payment-status'); if (!actions) return; actions.replaceChildren();
    const reference = document.getElementById('quote-reference').value.trim();
    const message = 'Hola, Castillo Blanco. Tengo una cotización aprobada' + (reference ? ' con referencia: ' + reference : '') + '. Quiero confirmar el importe y recibir las instrucciones para pagar el anticipo del 50%.';
    const append = (text, href, external) => { const link = document.createElement('a'); link.className = 'btn btn-primary'; link.textContent = text; link.href = href; if (external) { link.target = '_blank'; link.rel = 'noopener'; } actions.append(link); };
    if (whatsapp) append('Solicitar instrucciones por WhatsApp', 'https://wa.me/' + whatsapp + '?text=' + encodeURIComponent(message), true);
    if (email) append('Solicitar instrucciones por correo', 'mailto:' + email + '?subject=' + encodeURIComponent('Anticipo de proyecto personalizado') + '&body=' + encodeURIComponent(message), false);
    if (phone) append('Llamar para coordinar', 'tel:' + phone, false);
    if (!(whatsapp || email || phone)) {
      const back = document.createElement('button'); back.type = 'button'; back.className = 'btn btn-outline'; back.textContent = 'Volver'; back.addEventListener('click', () => paymentDialog.close()); actions.append(back);
      status.textContent = 'Los medios de contacto y pago todavía no están habilitados. No se pueden realizar pagos desde esta página.';
    } else status.textContent = 'Confirmaremos contigo la cotización y el medio de pago. Esta página no solicita ni procesa datos de tarjetas.';
  }
  document.querySelectorAll('[data-payment]').forEach(button => button.addEventListener('click', () => { updatePaymentLinks(); openDialog(paymentDialog); }));
  document.getElementById('quote-reference')?.addEventListener('input', updatePaymentLinks);
})();
