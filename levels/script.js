// Immediate debug
console.log('Script file loaded');
alert('Script file loaded - check console for more details');

// JSON data structure that will be loaded from external file
let levelsData = [];
let filteredLevels = [];
let currentFilter = 'all';

// Function to load levels data from various sources with better error handling
function loadLevelsData() {
    console.log('Loading levels data...');
    if (isLocalEnvironment()) {
        // If we're in a local environment, try XMLHttpRequest first
        console.log("Local environment detected, trying XMLHttpRequest for local file access");
        tryXHRJSON();
    } else {
        // If hosted, try fetch API first
        tryFetchJSON()
            .catch(error => {
                console.error("Failed to load levels data:", error);
                document.getElementById('levels-container').innerHTML = `
                    <div class="empty-message">
                        Failed to load levels data. Please try again later.
                    </div>
                `;
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
        // Add timestamp to prevent caching
        const timestamp = new Date().getTime();
        const response = await fetch(`levels.json?t=${timestamp}`);
        if (!response.ok) {
            throw new Error('Failed to load levels data');
        }
        processJsonData(await response.json());
        console.log("Successfully loaded data via fetch");
        return true;
    } catch (error) {
        console.warn('Fetch method failed:', error);
        return false;
    }
}

// Try to load using XMLHttpRequest (works better for local files in some browsers)
function tryXHRJSON() {
    const xhr = new XMLHttpRequest();
    xhr.overrideMimeType("application/json");
    // Add timestamp to prevent caching
    const timestamp = new Date().getTime();
    xhr.open('GET', `levels.json?t=${timestamp}`, true);

    xhr.onload = function () {
        if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) {
            try {
                const data = JSON.parse(xhr.responseText);
                processJsonData(data);
                console.log("Successfully loaded data via XHR");
            } catch (e) {
                console.warn("XHR JSON parse error:", e);
                // Already using default data, so just log the error
            }
        } else {
            console.warn("XHR request failed or returned empty");
            // Already using default data, so just log the error
        }
    };

    xhr.onerror = function () {
        console.warn("XHR request error");
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

        // Reset search and filters
        document.getElementById('search-input').value = '';
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-filter') === 'all') {
                btn.classList.add('active');
            }
        });
        currentFilter = 'all';
    } catch (error) {
        console.error('Error processing JSON data:', error);
        document.getElementById('levels-container').innerHTML = `
            <div class="empty-message">
                Failed to process levels data. The JSON format appears to be invalid.
            </div>
        `;
    }
}

// Function to handle local file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Update file name display
    document.getElementById('file-name-display').textContent = file.name;

    // Show loading message
    document.getElementById('levels-container').innerHTML = `
        <div class="empty-message">
            Loading levels from local file...
        </div>
    `;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = JSON.parse(e.target.result);
            processJsonData(data);
        } catch (error) {
            console.error('Error parsing JSON file:', error);
            document.getElementById('levels-container').innerHTML = `
                <div class="empty-message">
                    Failed to parse the JSON file. Please make sure it's a valid JSON file with the correct format.
                </div>
            `;
        }
    };

    reader.onerror = function () {
        document.getElementById('levels-container').innerHTML = `
            <div class="empty-message">
                Error reading the file. Please try again with a different file.
            </div>
        `;
    };

    reader.readAsText(file);
}

// Function to render levels in the container
function renderLevels() {
    console.log('Rendering levels...');
    const container = document.getElementById('levels-container');

    // Add level count display
    const countDisplay = document.createElement('div');
    countDisplay.className = 'level-count';
    countDisplay.textContent = `Showing ${filteredLevels.length} of ${levelsData.length} levels`;

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

    // Add fade out effect with longer duration
    container.style.opacity = '0';
    container.style.transform = 'scale(0.95)';

    setTimeout(() => {
        let html = '';
        filteredLevels.forEach(level => {
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

        // Add fade in effect with longer duration
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';
        }, 50);
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
        const matchesSearch =
            level.name.toLowerCase().includes(searchQuery) ||
            level.creator.toLowerCase().includes(searchQuery) ||
            level.id.toString().includes(searchQuery);

        if (!matchesSearch) return false;

        // Apply category filter
        if (currentFilter === 'all') return true;
        if (currentFilter === 'has-bugfixes') {
            return Array.isArray(level.bugfixes) && level.bugfixes.length > 0 && level.bugfixes.some(fix => fix.approved === true);
        }
        if (currentFilter === 'has-ldm') {
            return Array.isArray(level.ldms) && level.ldms.length > 0 && level.ldms.some(ldm => ldm.approved === true);
        }

        return true;
    });

    console.log(`Filtered to ${filteredLevels.length} levels with filter: ${currentFilter}`);
    renderLevels();
}

// Set up event listeners
function setupEventListeners() {
    console.log('Setting up event listeners...');

    // Search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        console.log('Found search input, adding listener');
        searchInput.addEventListener('input', filterLevels);
    } else {
        console.error('Search input not found!');
    }

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    console.log(`Found ${filterButtons.length} filter buttons`);

    filterButtons.forEach(btn => {
        const filterType = btn.getAttribute('data-filter');
        console.log(`Setting up click listener for button: ${filterType}`);

        btn.addEventListener('click', function (e) {
            console.log(`Filter button clicked: ${filterType}`);
            e.preventDefault();

            // Update active button
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Apply filter
            currentFilter = filterType;
            console.log(`Current filter set to: ${currentFilter}`);
            filterLevels();
        });
    });
}

// Initialize everything when the DOM is ready
if (document.readyState === 'loading') {
    console.log('Document still loading, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    console.log('Document already loaded, initializing immediately');
    initialize();
}

function initialize() {
    console.log('Initializing application...');
    setupEventListeners();
    loadLevelsData();
} 