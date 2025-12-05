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

function openPopupPost(event) {
    if (event) {
        event.stopPropagation();
    }
    var popupPost = document.getElementById("myPopupPost");
    if (popupPost) {
        popupPost.classList.toggle("show");
    }
}

document.addEventListener('click', function(event) {
    var popupPost = document.getElementById("myPopupPost");
    var floatingAdd = document.querySelector('.floating-add');
    
    if (popupPost && popupPost.classList.contains('show')) {
        if (floatingAdd && !floatingAdd.contains(event.target) && !popupPost.contains(event.target)) {
            popupPost.classList.remove("show");
        }
    }
});

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

function openPopupManageCards(event) {
    if (event) {
        event.stopPropagation();
    }
    var popupManageCards = document.getElementById("myPopupManageCards");
    if (popupManageCards) {
        popupManageCards.classList.toggle("show");
    }
}

document.addEventListener('click', function(event) {
    var popupManageCards = document.getElementById("myPopupManageCards");
    var manageCardsButton = document.querySelector('.action-btn[aria-label="Manage cards"]');
    
    if (popupManageCards && popupManageCards.classList.contains('show')) {
        if (manageCardsButton && !manageCardsButton.contains(event.target) && !popupManageCards.contains(event.target)) {
            popupManageCards.classList.remove("show");
        }
    }
});

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
    const closeBtn = document.querySelector('.close');
    
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
    
    // Handle toggle button clicks with higher priority
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleSidebar();
        }, true); // Use capture phase
    }
    
    if (sidebarToggleFloat) {
        sidebarToggleFloat.addEventListener('click', function(event) {
            event.stopPropagation();
            toggleSidebar();
        }, true); // Use capture phase
    }

    // Close sidebar when clicking outside (only on mobile)
    document.addEventListener('click', function(event) {
        if (window.innerWidth <= 769) {
            const sideNav = document.getElementById('sideNav');
            const sidebarToggle = document.getElementById('sidebarToggle');
            const sidebarToggleFloat = document.getElementById('sidebarToggleFloat');
            const body = document.body;
            
            // Don't process if clicking on toggle buttons
            if ((sidebarToggle && sidebarToggle.contains(event.target)) ||
                (sidebarToggleFloat && sidebarToggleFloat.contains(event.target))) {
                return;
            }
            
            if (sideNav && sideNav.classList.contains('collapsed')) {
                // Check if click is outside sidebar
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
