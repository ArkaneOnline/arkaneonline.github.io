// JSON data structure that will be loaded from external file
let levelsData = [];
let filteredLevels = [];
let currentFilter = 'all';

// Default embedded JSON data to ensure the site works without loading external files
const defaultLevelsData = [
    {
        "id": "54166263",
        "name": "Test Name",
        "creator": "Test Creator",
        "difficulty": "Extreme Demon",
        "description": "A cosmic journey through space and time. Verify code: 284531",
        "bugfixes": [
            {
                "description": "Fixed collision at 35% where player could clip through a block",
                "approved": true
            },
            {
                "description": "Fixed timing issue at wave section (68%)",
                "approved": true
            },
            {
                "description": "Removed invisible spike at 42%",
                "approved": false
            }
        ],
        "ldms": [
            {
                "description": "Low Detail Mode (Removes background effects)",
                "approved": true
            },
            {
                "description": "Ultra Low Detail Mode (Removes all particles and glow)",
                "approved": true
            }
        ]
    }
];

// Function to load levels data from various sources with better error handling
function loadLevelsData() {
    // First, we'll use the embedded data as a starting point
    processJsonData(defaultLevelsData);

    // Then try to load from external file (fetch or XHR) to replace the default data
    if (isLocalEnvironment()) {
        // If we're in a local environment, try XMLHttpRequest first
        console.log("Local environment detected, trying XMLHttpRequest for local file access");
        tryXHRJSON();
    } else {
        // If hosted, try fetch API first
        tryFetchJSON()
            .catch(error => {
                console.warn("Fetch failed, using embedded data:", error);
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
        const response = await fetch('levels.json');
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
    xhr.open('GET', 'levels.json', true);

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
    const container = document.getElementById('levels-container');

    if (filteredLevels.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                No levels match your search criteria.
            </div>
        `;
        return;
    }

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
        if (currentFilter === 'has-bugfixes') return level.bugfixes && level.bugfixes.length > 0;
        if (currentFilter === 'has-ldm') return level.ldms && level.ldms.length > 0;

        return true;
    });

    renderLevels();
}

// Set up event listeners
window.addEventListener('DOMContentLoaded', () => {
    // Load data when page loads
    loadLevelsData();

    // Search functionality
    document.getElementById('search-input').addEventListener('input', filterLevels);

    // File input for local JSON loading
    document.getElementById('json-file-input').addEventListener('change', handleFileSelect);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Apply filter
            currentFilter = btn.getAttribute('data-filter');
            filterLevels();
        });
    });
}); 