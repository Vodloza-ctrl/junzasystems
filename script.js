/* ============================================================
   JUNZA CHAT SYSTEMS — Global Script
   ============================================================ */

(function () {
  'use strict';

  /* ── Scroll-triggered animations ─────────────────────────── */
  const observerOpts = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOpts);

  document.querySelectorAll('.animate-up').forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

  /* ── WhatsApp bot demo simulator ─────────────────────────── */
  const demoFlow = {
    start: {
      bot: 'Hi 👋 Which business template would you like to try?\n\n1. Restaurant\n2. Clinic\n3. Hotel\n4. Car Dealer\n5. Church\n6. School\n7. Tourism',
      choices: ['Restaurant', 'Clinic', 'Hotel', 'Car Dealer']
    },
    Restaurant: {
      bot: 'Great choice! 🍽\n\nThis restaurant bot can:\n• Table reservations\n• Show the menu\n• Handle takeaway orders\n• Share directions & hours',
      choices: ['Book a table', 'See menu', 'Back ↩']
    },
    'Book a table': {
      bot: 'How many people?\n\n1. Just me\n2. 2–4 people\n3. 5+ people (group)',
      choices: ['2–4 people', 'Back ↩']
    },
    '2–4 people': {
      bot: 'Available tomorrow:\n\n🕘 09:00\n🕐 13:00\n🕕 18:30\n\nWhich time works?',
      choices: ['13:00', 'Back ↩']
    },
    '13:00': {
      bot: '✅ Perfect! Booking captured for tomorrow at 13:00 for 2–4 guests.\n\nA team member will confirm shortly.',
      choices: ['Start over']
    },
    Clinic: {
      bot: 'Clinic bot 🏥\n\nThis bot handles:\n• Appointment booking\n• Services & hours\n• Location & directions\n• Patient enquiries',
      choices: ['Book appointment', 'See services', 'Back ↩']
    },
    Hotel: {
      bot: 'Hotel bot 🏨\n\nCaptures:\n• Room availability\n• Rates & types\n• Check-in/out info\n• Directions',
      choices: ['Check availability', 'Back ↩']
    },
    'Car Dealer': {
      bot: 'Car Dealer bot 🚗\n\nStructures:\n• Vehicle interest\n• Budget & model\n• Spec/photo requests\n• Test drive leads',
      choices: ['Browse cars', 'Back ↩']
    },
    'See menu': {
      bot: '🍽 Today\'s Highlights:\n\n• Sadza & Nyama — $6\n• Grilled Chicken — $8\n• Veggie Stir Fry — $5\n\nFull menu on request!',
      choices: ['Book a table', 'Back ↩']
    },
    'Book appointment': {
      bot: 'Available slots tomorrow:\n\n🕘 09:00\n🕚 11:00\n🕑 14:00\n🕓 16:00\n\nWhich time works?',
      choices: ['09:00', 'Back ↩']
    },
    '09:00': {
      bot: '✅ Appointment request captured for tomorrow 09:00.\n\nOur receptionist will confirm.',
      choices: ['Start over']
    },
    'See services': {
      bot: '🏥 Services offered:\n\n• General consultations\n• Dental\n• Paediatrics\n• Lab tests\n\nWalk-ins welcome Mon–Fri.',
      choices: ['Book appointment', 'Back ↩']
    },
    'Check availability': {
      bot: 'What dates are you looking at?\n\nType your check-in date or choose:\n\n• This weekend\n• Next week\n• Custom dates',
      choices: ['This weekend', 'Back ↩']
    },
    'This weekend': {
      bot: '🏨 Available this weekend:\n\n• Standard Room — $45/night\n• Deluxe Room — $70/night\n• Suite — $110/night\n\nShall I pass your details to reservations?',
      choices: ['Yes please', 'Back ↩']
    },
    'Yes please': {
      bot: '✅ Great! A reservation agent will contact you on this number within 1 hour.',
      choices: ['Start over']
    },
    'Browse cars': {
      bot: 'What\'s your budget range?\n\n• Under $5,000\n• $5,000–$12,000\n• $12,000+',
      choices: ['$5,000–$12,000', 'Back ↩']
    },
    '$5,000–$12,000': {
      bot: '🚗 Available in your range:\n\n• Toyota Vitz 2016 — $6,500\n• Honda Fit 2015 — $7,200\n• Nissan Note 2017 — $9,800\n\nWant specs or photos for any?',
      choices: ['Toyota Vitz', 'Back ↩']
    },
    'Toyota Vitz': {
      bot: '✅ Great choice! Sending your interest to our sales team.\n\nThey\'ll WhatsApp you full specs and photos shortly.',
      choices: ['Start over']
    },
    'Back ↩': null,
    'Start over': null
  };

  function initSimulator() {
    const body   = document.getElementById('sim-body');
    const chips  = document.getElementById('sim-chips');
    if (!body || !chips) return;

    let history = [];

    function renderMessage(text, type) {
      const div = document.createElement('div');
      div.className = `bubble ${type}`;
      div.style.whiteSpace = 'pre-wrap';
      div.textContent = text;
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
    }

    function renderTyping() {
      const div = document.createElement('div');
      div.className = 'bubble bot typing-indicator';
      div.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
      body.appendChild(div);
      body.scrollTop = body.scrollHeight;
      return div;
    }

    function renderChips(choices) {
      chips.innerHTML = '';
      choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.textContent = choice;
        btn.addEventListener('click', () => handleChoice(choice));
        chips.appendChild(btn);
      });
    }

    function handleChoice(choice) {
      if (choice === 'Back ↩') {
        history.pop();
        const prev = history[history.length - 1] || 'start';
        const node = demoFlow[prev];
        renderMessage(choice, 'user');
        goTo(prev);
        return;
      }
      if (choice === 'Start over') {
        history = [];
        renderMessage(choice, 'user');
        goTo('start');
        return;
      }

      history.push(choice);
      renderMessage(choice, 'user');

      const node = demoFlow[choice];
      if (!node) {
        goTo('start');
        return;
      }
      goTo(choice);
    }

    function goTo(key) {
      chips.innerHTML = '';
      const node = demoFlow[key];
      if (!node) {
        setTimeout(() => goTo('start'), 400);
        return;
      }
      const indicator = renderTyping();
      setTimeout(() => {
        indicator.remove();
        renderMessage(node.bot, 'bot');
        if (node.choices) renderChips(node.choices);
      }, 700);
    }

    goTo('start');
  }

  /* ── Keyword demo banner ──────────────────────────────────── */
  function initKeywordBanner() {
    const keywords = ['RESTAURANT', 'CLINIC', 'HOTEL', 'CAR', 'CHURCH', 'SCHOOL', 'TOURISM'];
    const el = document.getElementById('keyword-cycle');
    if (!el) return;

    let i = 0;
    el.textContent = keywords[i];

    setInterval(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-8px)';
      setTimeout(() => {
        i = (i + 1) % keywords.length;
        el.textContent = keywords[i];
        el.style.transition = 'none';
        el.style.opacity = '0';
        el.style.transform = 'translateY(8px)';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = 'opacity .3s, transform .3s';
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          });
        });
      }, 300);
      el.style.transition = 'opacity .3s, transform .3s';
    }, 2000);
  }

  /* ── Smooth active nav link highlight ────────────────────── */
  function initNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav-links a');
    if (!sections.length || !links.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove('active'));
          const link = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
          if (link) link.classList.add('active');
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => io.observe(s));
  }

  /* ── Init ─────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initSimulator();
    initKeywordBanner();
    initNavHighlight();
  });

})();
