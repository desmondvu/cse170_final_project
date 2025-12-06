let allCards = [];
let currentFilter = 'All';
let currentSearch = '';

async function loadCards() {
    try {
        const response = await fetch('cards.json');
        const data = await response.json();
        allCards = data.cards;
        
        generatePills(allCards);
        
        renderCards(allCards);
        
        updateSummary(allCards);
        
        setupSearch();
    } catch (error) {
        console.error('Error loading cards:', error);
    }
}

function generatePills(cards) {
    const pillRow = document.querySelector('.pill-row');
    if (!pillRow) return;

    const uniqueSets = [...new Set(cards.map(card => card.set))].sort();
    
    pillRow.innerHTML = '';
    
    const allPill = document.createElement('button');
    allPill.className = 'pill active';
    allPill.textContent = 'All';
    allPill.addEventListener('click', () => filterBySet('All'));
    pillRow.appendChild(allPill);
    
    uniqueSets.forEach(set => {
        const pill = document.createElement('button');
        pill.className = 'pill';
        pill.textContent = set;
        pill.addEventListener('click', () => filterBySet(set));
        pillRow.appendChild(pill);
    });
}

function filterBySet(set) {
    currentFilter = set;
    
    const pills = document.querySelectorAll('.pill');
    pills.forEach(pill => {
        if (pill.textContent === set) {
            pill.classList.add('active');
        } else {
            pill.classList.remove('active');
        }
    });
    
    applyFilters();
}

function setupSearch() {
    const searchInput = document.querySelector('.search-box input');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase().trim();
        applyFilters();
    });
}

function applyFilters() {
    let filteredCards = [...allCards];
    
    if (currentFilter !== 'All') {
        filteredCards = filteredCards.filter(card => card.set === currentFilter);
    }
    
    if (currentSearch) {
        filteredCards = filteredCards.filter(card => {
            const name = card.name.toLowerCase();
            const set = card.set.toLowerCase();
            const setNumber = card.setNumber.toLowerCase();
            return name.includes(currentSearch) || 
                   set.includes(currentSearch) || 
                   setNumber.includes(currentSearch);
        });
    }
    
    renderCards(filteredCards);
    
    updateSummary(filteredCards);
}

function renderCards(cards) {
    const cardGrid = document.querySelector('.card-grid');
    if (!cardGrid) return;
    
    cardGrid.innerHTML = '';
    
    const cardColors = ['purple', 'beige', 'sand', 'lilac'];
    
    cards.forEach((card, index) => {
        const cardElement = createCardElement(card, cardColors[index % cardColors.length]);
        cardGrid.appendChild(cardElement);
    });
}

function createCardElement(card, cardColor) {
    const article = document.createElement('article');
    article.className = `card-item dark ${cardColor}`;
    
    let badgeClass = '';
    let badgeText = '';
    
    if (card.psaGrade === 'Ungraded') {
        badgeText = 'Ungraded';
        badgeClass = 'psa-ungraded';
    } else {
        badgeText = `PSA ${card.psaGrade}`;
        const grade = parseInt(card.psaGrade);
        if (grade === 10) {
            badgeClass = 'psa-10';
        } else if (grade === 9) {
            badgeClass = 'psa-9';
        } else if (grade === 8) {
            badgeClass = 'psa-8';
        } else if (grade === 7) {
            badgeClass = 'psa-7';
        } else {
            badgeClass = 'psa-7';
        }
    }
    
    const badgeHTML = `<div class="badge ${badgeClass}">${badgeText}</div>`;
    
    let imageHTML = '';
    if (card.img) {
        imageHTML = `<div class="image-placeholder" style="background-image: url('${card.img}'); background-size: cover; background-position: center; background-repeat: no-repeat;"></div>`;
    } else {
        imageHTML = `
            <div class="image-placeholder">
                <svg viewBox="0 0 64 64">
                    <circle cx="32" cy="28" r="10" fill="none" stroke="currentColor" stroke-width="3"/>
                    <path d="M20 50c2-8 22-8 24 0" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
            </div>
        `;
    }
    
    const formattedPrice = `$${card.price.toFixed(2)}`;
    
    article.innerHTML = `
        ${badgeHTML}
        ${imageHTML}
        <div class="card-body">
            <div class="card-title">${card.name}</div>
            <div class="card-subtitle">${card.set}</div>
            <div class="card-meta">
                <span>${card.setNumber}</span>
                <span class="price">${formattedPrice}</span>
            </div>
        </div>
    `;
    
    article.style.cursor = 'pointer';
    article.addEventListener('click', () => openCardModal(card));
    
    return article;
}

function updateSummary(cards) {
    const totalCards = cards.length;
    const totalValue = cards.reduce((sum, card) => sum + card.price, 0);
    const averagePrice = totalCards > 0 ? totalValue / totalCards : 0;
    
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(statCard => {
        const label = statCard.querySelector('.stat-label');
        if (label && label.textContent === 'Total Value') {
            const valueElement = statCard.querySelector('.stat-value');
            if (valueElement) {
                valueElement.textContent = `$${totalValue.toFixed(2)}`;
            }
        }
        if (label && label.textContent === 'Total Cards') {
            const valueElement = statCard.querySelector('.stat-value');
            if (valueElement) {
                valueElement.textContent = totalCards.toString();
            }
        }
    });
    
    const heroSub = document.querySelector('.hero-sub');
    if (heroSub) {
        heroSub.textContent = `${totalCards} cards · $${totalValue.toFixed(2)}`;
    }
}

function openPostModal() {
    const modal = document.getElementById('postModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closePostModal() {
    const modal = document.getElementById('postModal');
    if (modal) {
        modal.style.display = 'none';
    }
}


function popupFilter(event) {
    if (event) {
        event.stopPropagation();
    }
    var popupFilter = document.getElementById("myPopupFilter");
    if (popupFilter) {
        popupFilter.classList.toggle("show");
    }
}

document.addEventListener('click', function(event) {
    var popupFilter = document.getElementById("myPopupFilter");
    var filterButton = document.querySelector('.icon-button[aria-label="Filter cards"]');
    
    if (popupFilter && popupFilter.classList.contains('show')) {
        if (filterButton && !filterButton.contains(event.target) && !popupFilter.contains(event.target)) {
            popupFilter.classList.remove("show");
        }
    }
});

function openManageCardsModal() {
    const modal = document.getElementById('manageCardsModal');
    if (!modal) return;
    
    renderManageCardsList();
    modal.style.display = 'flex';
}

function closeManageCardsModal() {
    const modal = document.getElementById('manageCardsModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function renderManageCardsList() {
    const manageCardsList = document.getElementById('manageCardsList');
    if (!manageCardsList) return;
    
    manageCardsList.innerHTML = '';
    
    if (allCards.length === 0) {
        manageCardsList.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 20px;">No cards in your portfolio</p>';
        return;
    }
    
    allCards.forEach((card, index) => {
        const cardItem = document.createElement('div');
        cardItem.className = 'manage-card-item';
        cardItem.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px;
            background: #fff;
            border-radius: 12px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
            border: 1px solid rgba(35, 54, 66, 0.08);
        `;
        
        const cardInfo = document.createElement('div');
        cardInfo.style.cssText = 'flex: 1; display: flex; align-items: center; gap: 16px;';
        
        const cardImage = document.createElement('div');
        cardImage.style.cssText = `
            width: 80px;
            height: 112px;
            border-radius: 8px;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            background-color: #f0f0f0;
            flex-shrink: 0;
        `;
        if (card.img) {
            cardImage.style.backgroundImage = `url('${card.img}')`;
        }
        
        const cardDetails = document.createElement('div');
        cardDetails.style.cssText = 'flex: 1;';
        
        const cardName = document.createElement('div');
        cardName.textContent = card.name;
        cardName.style.cssText = 'font-weight: 700; font-size: 18px; margin-bottom: 4px; color: var(--text);';
        
        const cardSet = document.createElement('div');
        cardSet.textContent = `${card.set} • ${card.setNumber}`;
        cardSet.style.cssText = 'color: var(--muted); font-size: 14px; margin-bottom: 4px;';
        
        const cardPrice = document.createElement('div');
        cardPrice.textContent = `$${card.price.toFixed(2)}`;
        cardPrice.style.cssText = 'font-weight: 600; color: var(--accent); font-size: 16px;';
        
        cardDetails.appendChild(cardName);
        cardDetails.appendChild(cardSet);
        cardDetails.appendChild(cardPrice);
        
        cardInfo.appendChild(cardImage);
        cardInfo.appendChild(cardDetails);
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.style.cssText = `
            padding: 10px 20px;
            background: #dc3545;
            color: #fff;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
        `;
        deleteButton.addEventListener('mouseenter', function() {
            this.style.background = '#c82333';
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
        });
        deleteButton.addEventListener('mouseleave', function() {
            this.style.background = '#dc3545';
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
        deleteButton.addEventListener('click', () => deleteCard(card.id));
        
        cardItem.appendChild(cardInfo);
        cardItem.appendChild(deleteButton);
        manageCardsList.appendChild(cardItem);
    });
}

function deleteCard(cardId) {
    if (confirm('Are you sure you want to delete this card from your portfolio?')) {
        allCards = allCards.filter(card => card.id !== cardId);
        
        // Don't save to localStorage - cards will reset on refresh for prototype
        generatePills(allCards);
        renderCards(allCards);
        updateSummary(allCards);
        renderManageCardsList();
    }
}


function openCardModal(card) {
    const modal = document.getElementById('cardModal');
    if (!modal) return;
    
    document.getElementById('modalCardName').textContent = card.name;
    
    const modalImage = document.getElementById('modalCardImage');
    if (modalImage && card.img) {
        modalImage.style.backgroundImage = `url('${card.img}')`;
        modalImage.style.display = 'block';
    } else if (modalImage) {
        modalImage.style.display = 'none';
    }
    
    document.getElementById('modalSet').textContent = card.set;
    document.getElementById('modalSetNumber').textContent = card.setNumber;
    document.getElementById('modalRarity').textContent = card.rarity || 'N/A';
    document.getElementById('modalArtist').textContent = card.artist || 'N/A';
    document.getElementById('modalReleaseDate').textContent = card.releaseDate || 'N/A';
    document.getElementById('modalPrice').textContent = `$${card.price.toFixed(2)}`;
    document.getElementById('modalDescription').textContent = card.description || 'No description available.';
    
    const psaBadge = document.getElementById('modalPSABadge');
    let badgeClass = '';
    let badgeText = '';
    
    if (card.psaGrade === 'Ungraded') {
        badgeText = 'Ungraded';
        badgeClass = 'psa-ungraded';
    } else {
        badgeText = `PSA ${card.psaGrade}`;
        const grade = parseInt(card.psaGrade);
        if (grade === 10) {
            badgeClass = 'psa-10';
        } else if (grade === 9) {
            badgeClass = 'psa-9';
        } else if (grade === 8) {
            badgeClass = 'psa-8';
        } else if (grade === 7) {
            badgeClass = 'psa-7';
        } else {
            badgeClass = 'psa-7';
        }
    }
    
    psaBadge.className = `modal-psa-badge badge ${badgeClass}`;
    psaBadge.textContent = badgeText;
    
    if (card.population) {
        const total = card.population.total;
        document.getElementById('modalTotalGraded').textContent = total.toLocaleString();
        
        const grades = [
            { id: '10', value: card.population.psa10 },
            { id: '9', value: card.population.psa9 },
            { id: '8', value: card.population.psa8 },
            { id: '7', value: card.population.psa7 },
            { id: '6', value: card.population.psa6Lower }
        ];
        
        const maxValue = Math.max(...grades.map(g => g.value));
        
        grades.forEach(grade => {
            const bar = document.getElementById(`bar-${grade.id}`);
            const count = document.getElementById(`count-${grade.id}`);
            
            if (bar && count) {
                const percentage = maxValue > 0 ? (grade.value / maxValue) * 100 : 0;
                bar.style.width = `${percentage}%`;
                count.textContent = grade.value.toLocaleString();
            }
        });
    }
    
    modal.style.display = 'flex';
}

function closeCardModal() {
    const modal = document.getElementById('cardModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('cardModal');
    const closeBtn = modal ? modal.querySelector('.close') : null;
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCardModal);
    }
    
    if (modal) {
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeCardModal();
            }
        });
    }
    
    const postModal = document.getElementById('postModal');
    if (postModal) {
        const postCloseBtn = postModal.querySelector('.close');
        if (postCloseBtn) {
            postCloseBtn.addEventListener('click', closePostModal);
        }
        window.addEventListener('click', function(event) {
            if (event.target === postModal) {
                closePostModal();
            }
        });
    }
    
    const manageCardsModal = document.getElementById('manageCardsModal');
    if (manageCardsModal) {
        const manageCloseBtn = manageCardsModal.querySelector('.close');
        if (manageCloseBtn) {
            manageCloseBtn.addEventListener('click', closeManageCardsModal);
        }
        window.addEventListener('click', function(event) {
            if (event.target === manageCardsModal) {
                closeManageCardsModal();
            }
        });
    }
});

function openCameraModal() {
    const modal = document.getElementById('cameraModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeCameraModal() {
    const modal = document.getElementById('cameraModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const cameraModal = document.getElementById('cameraModal');
    
    if (cameraModal) {
        window.addEventListener('click', function(event) {
            if (event.target === cameraModal) {
                closeCameraModal();
            }
        });
    }
});

function toggleSidebar() {
    const sideNav = document.getElementById('sideNav');
    const body = document.body;
    if (sideNav) {
        const isCollapsed = sideNav.classList.toggle('collapsed');
        if (window.innerWidth <= 769) {
            if (isCollapsed) {
                body.classList.add('sidebar-open');
            } else {
                body.classList.remove('sidebar-open');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebarToggleFloat = document.getElementById('sidebarToggleFloat');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleSidebar();
        }, true)
    }
    
    if (sidebarToggleFloat) {
        sidebarToggleFloat.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleSidebar();
        }, true);
    }

    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 769) {
            const sideNav = document.getElementById('sideNav');
            const sidebarToggle = document.getElementById('sidebarToggle');
            const sidebarToggleFloat = document.getElementById('sidebarToggleFloat');
            const body = document.body;
            
            if ((sidebarToggle && sidebarToggle.contains(event.target)) ||
                (sidebarToggleFloat && sidebarToggleFloat.contains(event.target))) {
                return;
            }
            
            if (sideNav && sideNav.classList.contains('collapsed')) {
                if (!sideNav.contains(event.target)) {
                    sideNav.classList.remove('collapsed');
                    body.classList.remove('sidebar-open');
                }
            }
        }
    });

    window.addEventListener('resize', function() {
        const sideNav = document.getElementById('sideNav');
        const body = document.body;
        if (window.innerWidth > 769 && sideNav) {
            sideNav.classList.remove('collapsed');
            body.classList.remove('sidebar-open');
        }
    });
});

document.addEventListener('DOMContentLoaded', loadCards);
