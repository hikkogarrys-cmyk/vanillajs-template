import './Home.css';

export function renderHome(container) {
  container.innerHTML = `
    <div class="game-container">
      <div class="balance-block">
        <span class="star-icon">⭐</span>
        <span id="balance-value">1,000</span> Stars
      </div>

      <div class="roulette-wrapper">
        <div class="roulette-pointer"></div>
        <div class="roulette-tape" id="case-tape">
          <div class="gift-item common">🎁 Common NFT</div>
          <div class="gift-item rare">💎 Rare Code</div>
          <div class="gift-item epic">🔥 Epic Stars</div>
          <div class="gift-item legendary">👑 Legendary NFT</div>
        </div>
      </div>

      <button class="open-btn" id="spin-button">🎁 Открыть кейс (100 ⭐)</button>

      <div class="inventory-section">
        <h3>🎒 Твой инвентарь подарков</h3>
        <div class="inventory-grid" id="inventory-list">
          <div class="empty-text">Пока тут пусто. Открой свой первый кейс!</div>
        </div>
      </div>
    </div>
  `;

  // Логика кручения кейса
  const spinBtn = document.getElementById('spin-button');
  const tape = document.getElementById('case-tape');
  const balanceHtml = document.getElementById('balance-value');
  const inventoryHtml = document.getElementById('inventory-list');
  
  let balance = 1000;
  const items = [
    { name: '🎁 Common NFT', class: 'common' },
    { name: '💎 Rare Code', class: 'rare' },
    { name: '🔥 Epic Stars', class: 'epic' },
    { name: '👑 Legendary NFT', class: 'legendary' }
  ];

  spinBtn.addEventListener('click', () => {
    if (balance < 100) {
      alert('Недостаточно Stars! Пополни баланс.');
      return;
    }

    balance -= 100;
    balanceHtml.innerText = balance;
    spinBtn.disabled = true;

    // Имитация плавной прокрутки рулетки
    tape.style.transition = 'transform 3s cubic-bezier(0.1, 0.8, 0.1, 1)';
    const randomOffset = Math.floor(Math.random() * 4) * -80; 
    tape.style.transform = `translateX(${randomOffset}px)`;

    setTimeout(() => {
      const prize = items[Math.abs(randomOffset / 80)];
      
      // Добавляем в инвентарь
      const emptyText = inventoryHtml.querySelector('.empty-text');
      if (emptyText) emptyText.remove();

      const newGift = document.createElement('div');
      newGift.className = `inventory-item ${prize.class}`;
      newGift.innerText = prize.name;
      inventoryHtml.appendChild(newGift);

      alert(`Поздравляем! Вы выиграли: ${prize.name}`);
      
      // Сброс рулетки для нового кручения
      tape.style.transition = 'none';
      tape.style.transform = 'translateX(0)';
      spinBtn.disabled = false;
    }, 3100);
  });
}
