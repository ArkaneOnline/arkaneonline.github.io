// JSON data structure that will be loaded from external file
let levelsData = [];
let filteredLevels = [];

// Pagination variables
const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let totalPages = 1;

// Function to get paginated data
function getPaginatedData() {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredLevels.slice(startIndex, endIndex);
}

// Function to update pagination controls
function updatePaginationControls() {
    const container = document.getElementById('levels-container');
    if (!container) return;

    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-controls';

    totalPages = Math.ceil(filteredLevels.length / ITEMS_PER_PAGE);

    let paginationHTML = `
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(1)">
            First
        </button>
        <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
            Previous
        </button>
        <span class="page-info">Page ${currentPage} of ${totalPages}</span>
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
            Next
        </button>
        <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${totalPages})">
            Last
        </button>
    `;

    paginationContainer.innerHTML = paginationHTML;

    // Remove existing pagination controls if they exist
    const existingPagination = document.querySelector('.pagination-controls');
    if (existingPagination) {
        existingPagination.remove();
    }

    // Insert pagination controls after the container
    container.parentNode.insertBefore(paginationContainer, container.nextSibling);
}

// Function to change page
function changePage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderLevels();
}

// Function to load levels data from various sources with better error handling
function loadLevelsData() {
    const container = document.getElementById('levels-container');
    if (!container) return;

    if (isLocalEnvironment()) {
        tryXHRJSON();
    } else {
        tryFetchJSON()
            .catch(error => {
                if (container) {
                    container.innerHTML = `
                        <div class="empty-message">
                            Failed to load levels data. Please try again later.
                        </div>
                    `;
                }
            });
    }
}

// Check if we're in a local file environment
function isLocalEnvironment() {
    return window.location.protocol === 'file:';
}

// Try to load using fetch API
async function tryFetchJSON() {
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`levels.json?t=${timestamp}`);
        if (!response.ok) {
            throw new Error('Failed to load levels data');
        }
        processJsonData(await response.json());
        return true;
    } catch (error) {
        return false;
    }
}

// Try to load using XMLHttpRequest (works better for local files in some browsers)
function tryXHRJSON() {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    const timestamp = new Date().getTime();
    xhr.open('GET', `levels.json?t=${timestamp}`, true);

    xhr.onload = function () {
        if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
            try {
                const data = JSON.parse(xhr.responseText);
                processJsonData(data);
            } catch (e) {
                // Already using default data, so just log the error
            }
        }
    };

    xhr.onerror = function () {
        // Already using default data, so just log the error
    };

    xhr.send();
}

// Function to process JSON data (used by both remote and local loading)
function processJsonData(data) {
    try {
        if (!Array.isArray(data)) {
            throw new Error('Invalid JSON format: Expected an array of levels');
        }

        levelsData = data;
        filteredLevels = [...levelsData];
        renderLevels();

        // Reset search
        document.getElementById('search-input').value = '';
    } catch (error) {
        const container = document.getElementById('levels-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-message">
                    Failed to process levels data. The JSON format appears to be invalid.
                </div>
            `;
        }
    }
}

// Function to render levels in the container
function renderLevels() {
    const container = document.getElementById('levels-container');
    if (!container) return;

    // Add level count display
    const countDisplay = document.createElement('div');
    countDisplay.className = 'level-count';

    if (filteredLevels.length > 0) {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
        const endIndex = Math.min(startIndex + ITEMS_PER_PAGE - 1, filteredLevels.length);
        countDisplay.textContent = `Showing ${startIndex} to ${endIndex} of ${filteredLevels.length} levels`;
    } else {
        countDisplay.textContent = `Showing 0 of ${levelsData.length} levels`;
    }

    // Remove existing count display if it exists
    const existingCount = document.querySelector('.level-count');
    if (existingCount) {
        existingCount.remove();
    }

    // Insert count display before the container
    container.parentNode.insertBefore(countDisplay, container);

    if (filteredLevels.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                No levels match your search criteria.
            </div>
        `;
        return;
    }

    // Add fade out effect
    container.style.opacity = '0';
    container.style.transform = 'scale(0.95)';

    setTimeout(() => {
        let html = '';
        const paginatedData = getPaginatedData();

        paginatedData.forEach(level => {
            html += `
                <div class="level-card">
                    <div class="level-header">
                        <div class="level-name">${level.name}</div>
                        <div class="level-id">ID: ${level.id}</div>
                    </div>
                    <div class="level-info">
                        <div class="level-creator">By ${level.creator}</div>
                        <div class="level-difficulty" style="background-color: ${getDifficultyColor(level.difficulty)}">
                            ${level.difficulty}
                        </div>
                        ${level.description ? `<div class="level-description">${level.description}</div>` : ''}
                    </div>
                    <div class="modifications">
                        ${renderBugfixes(level.bugfixes)}
                        ${renderLDMs(level.ldms)}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Add fade in effect
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';
        }, 50);

        // Update pagination controls
        updatePaginationControls();
    }, 300);
}

// Render the bugfixes section
function renderBugfixes(bugfixes) {
    if (!bugfixes || bugfixes.length === 0) {
        return `
            <div class="mod-section">
                <div class="mod-title">
                    <span>Bugfixes</span>
                </div>
                <div class="mod-list">
                    <div class="mod-item">No bugfixes available</div>
                </div>
            </div>
        `;
    }

    let html = `
        <div class="mod-section">
            <div class="mod-title">
                <span>Bugfixes</span>
            </div>
            <ul class="mod-list">
    `;

    bugfixes.forEach(fix => {
        html += `
            <li class="mod-item">
                <span class="mod-status ${fix.approved ? 'approved' : 'denied'}"></span>
                <span>${fix.description}</span>
            </li>
        `;
    });

    html += `
            </ul>
        </div>
    `;
    return html;
}

// Render the LDMs section
function renderLDMs(ldms) {
    if (!ldms || ldms.length === 0) {
        return `
            <div class="mod-section">
                <div class="mod-title">
                    <span>Low Detail Modes</span>
                </div>
                <div class="mod-list">
                    <div class="mod-item">No LDMs available</div>
                </div>
            </div>
        `;
    }

    let html = `
        <div class="mod-section">
            <div class="mod-title">
                <span>Low Detail Modes</span>
            </div>
            <ul class="mod-list">
    `;

    ldms.forEach(ldm => {
        html += `
            <li class="mod-item">
                <span class="mod-status ${ldm.approved ? 'approved' : 'denied'}"></span>
                <span>${ldm.description}</span>
            </li>
        `;
    });

    html += `
            </ul>
        </div>
    `;
    return html;
}

// Get color based on difficulty
function getDifficultyColor(difficulty) {
    const difficultyColors = {
        'Easy': '#4CAF50',
        'Normal': '#2196F3',
        'Hard': '#FF9800',
        'Harder': '#F44336',
        'Insane': '#9C27B0',
        'Easy Demon': '#7986CB',
        'Medium Demon': '#FFB74D',
        'Hard Demon': '#F44336',
        'Insane Demon': '#9C27B0',
        'Extreme Demon': '#D32F2F'
    };

    return difficultyColors[difficulty] || '#607D8B';
}

// Filter levels based on search query
function filterLevels() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();

    filteredLevels = levelsData.filter(level => {
        return level.name.toLowerCase().includes(searchQuery) ||
            level.creator.toLowerCase().includes(searchQuery) ||
            level.id.toString().includes(searchQuery) ||
            level.difficulty.toLowerCase().includes(searchQuery) ||
            (level.description && level.description.toLowerCase().includes(searchQuery));
    });

    renderLevels();
}

// Set up event listeners
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', filterLevels);
    }
}

// Initialize everything when the DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(() => {
        setupEventListeners();
        loadLevelsData();
    }, 100);
}); 