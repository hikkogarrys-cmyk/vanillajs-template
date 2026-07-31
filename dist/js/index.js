const tg = window.Telegram?.WebApp;
let userId = 12345; // Дефолтный ID для тестов в браузере

if (tg) {
  tg.ready();
  tg.expand();
  
  // Вытаскиваем настоящие данные профиля из Телеграма
  if (tg.initDataUnsafe?.user) {
    userId = tg.initDataUnsafe.user.id;
    document.getElementById('user-name').innerText = tg.initDataUnsafe.user.first_name;
    if (tg.initDataUnsafe.user.photo_url) {
      document.getElementById('user-avatar').style.backgroundImage = `url(${tg.initDataUnsafe.user.photo_url})`;
    }
  }
}

const spinBtn = document.getElementById('spin-button');
const tape = document.getElementById('case-tape');
const balanceHtml = document.getElementById('balance-value');
const inventoryHtml = document.getElementById('inventory-list');

// ЗАПРОС НАСТОЯЩЕГО БАЛАНСА С СЕРВЕРА
async function loadUserData() {
  try {
    const res = await fetch(`/api/user/${userId}`);
    const data = await res.json();
    balanceHtml.innerText = data.balance;
  } catch (err) {
    balanceHtml.innerText = "0";
  }
}

loadUserData();

const items = [
  { name: '🎁 Common NFT', class: 'common' },
  { name: '💎 Rare Code', class: 'rare' },
  { name: '🔥 Epic NFT', class: 'epic' },
  { name: '👑 ЛЕГЕНДА', class: 'legendary' }
];

spinBtn.addEventListener('click', async () => {
  let currentBalance = parseInt(balanceHtml.innerText);
  if (currentBalance < 100) {
    alert('Недостаточно Stars! Пополни баланс через бота.');
    return;
  }

  spinBtn.disabled = true;

  // Имитация плавной прокрутки
  tape.style.transition = 'transform 2.5s cubic-bezier(0.1, 0.8, 0.1, 1)';
  const randomOffset = Math.floor(Math.random() * 4) * -90; 
  tape.style.transform = `translateX(${randomOffset}px)`;

  setTimeout(() => {
    const prize = items[Math.abs(randomOffset / 90)];
    
    const emptyText = inventoryHtml.querySelector('.empty-text');
    if (emptyText) emptyText.remove();

    const newGift = document.createElement('div');
    newGift.className = `inventory-item ${prize.class}`;
    newGift.innerText = prize.name;
    inventoryHtml.appendChild(newGift);

    // Списание баланса на экране
    balanceHtml.innerText = currentBalance - 100;

    tape.style.transition = 'none';
    tape.style.transform = 'translateX(0)';
    spinBtn.disabled = false;
  }, 2600);
});
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
