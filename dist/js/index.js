// Старт Telegram SDK
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const spinBtn = document.getElementById('spin-button');
const tape = document.getElementById('case-tape');
const balanceHtml = document.getElementById('balance-value');
const inventoryHtml = document.getElementById('inventory-list');

let balance = 1000;
const items = [
  { name: '🎁 Обычный NFT', class: 'common' },
  { name: '💎 Редкий Код', class: 'rare' },
  { name: '🔥 Эпик Скин', class: 'epic' },
  { name: '👑 ЛЕГЕНДА', class: 'legendary' }
];

spinBtn.addEventListener('click', () => {
  if (balance < 100) {
    alert('Недостаточно Stars!');
    return;
  }

  balance -= 100;
  balanceHtml.innerText = balance;
  spinBtn.disabled = true;

  // Анимация рулетки
  tape.style.transition = 'transform 2.5s cubic-bezier(0.1, 0.8, 0.1, 1)';
  const randomOffset = Math.floor(Math.random() * 4) * -80; 
  tape.style.transform = `translateX(${randomOffset}px)`;

  setTimeout(() => {
    const prize = items[Math.abs(randomOffset / 80)];
    
    const emptyText = inventoryHtml.querySelector('.empty-text');
    if (emptyText) emptyText.remove();

    const newGift = document.createElement('div');
    newGift.className = `inventory-item ${prize.class}`;
    newGift.innerText = prize.name;
    inventoryHtml.appendChild(newGift);

    tape.style.transition = 'none';
    tape.style.transform = 'translateX(0)';
    spinBtn.disabled = false;
  }, 2600);
});
          title: 'TON Connect',
          icon: window.location.origin + window.location.pathname + 'ton.svg'
        },
      ];

      var root = document.getElementById('root');
      var appContext = {
        initData: initData,
        launchParams: launchParams,
        miniApp: miniApp,
        navigator: navigator,
        themeParams: themeParams,
        utils: utils,
        viewport: viewport,
        tonConnectUI: tonConnectUI,
        routes: routes
      };
      var prevPage;

      function renderCurrentRoute() {
        var route = routes.find(function(r) {
          return r.pathname === navigator.pathname;
        });
        if (!route) {
          navigator.replace('/');
          return;
        }
        if (prevPage && typeof prevPage.destroy === 'function') {
          prevPage.destroy();
        }
        prevPage = new route.Page(appContext);
        if (typeof prevPage.init === 'function') {
          prevPage.init();
        }
        prevPage.render(root);
      }

      navigator.on('change', renderCurrentRoute);
      renderCurrentRoute();
    });
  });
})();
