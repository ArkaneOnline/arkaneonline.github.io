let levelsData = [];

// Function to load levels data from file
function loadLevelsData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);
                if (!Array.isArray(data)) {
                    throw new Error('Invalid JSON format: Expected an array of levels');
                }
                levelsData = data;
                renderLevels();
            } catch (error) {
                console.error('Error parsing JSON file:', error);
                alert('Failed to parse the JSON file. Please make sure it\'s a valid JSON file with the correct format.');
            }
        };

        reader.onerror = function () {
            alert('Error reading the file. Please try again.');
        };

        reader.readAsText(file);
    };

    input.click();
}

// Function to save levels data to file
function saveLevelsData() {
    const dataStr = JSON.stringify(levelsData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'levels.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Function to render levels in the container
function renderLevels() {
    const container = document.getElementById('levels-container');
    container.innerHTML = '';

    levelsData.forEach((level, index) => {
        const levelCard = document.createElement('div');
        levelCard.className = 'level-card';
        levelCard.innerHTML = `
            <div class="level-header">
                <div class="level-name">Level ${index + 1}</div>
                <button class="delete-level-btn" onclick="deleteLevel(${index})">Delete Level</button>
            </div>
            <div class="form-group">
                <label>Level ID</label>
                <input type="text" class="form-control" value="${level.id}" onchange="updateLevel(${index}, 'id', this.value)">
            </div>
            <div class="form-group">
                <label>Level Name</label>
                <input type="text" class="form-control" value="${level.name}" onchange="updateLevel(${index}, 'name', this.value)">
            </div>
            <div class="form-group">
                <label>Creator</label>
                <input type="text" class="form-control" value="${level.creator}" onchange="updateLevel(${index}, 'creator', this.value)">
            </div>
            <div class="form-group">
                <label>Difficulty</label>
                <input type="text" class="form-control" value="${level.difficulty}" onchange="updateLevel(${index}, 'difficulty', this.value)">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" onchange="updateLevel(${index}, 'description', this.value)">${level.description || ''}</textarea>
            </div>
            <div class="modifications">
                <div class="mod-section">
                    <div class="mod-title">Bugfixes</div>
                    <div class="mod-list" id="bugfixes-${index}">
                        ${renderModifications(level.bugfixes, index, 'bugfixes')}
                    </div>
                    <button class="add-mod-btn" onclick="addModification(${index}, 'bugfixes')">Add Bugfix</button>
                </div>
                <div class="mod-section">
                    <div class="mod-title">Low Detail Modes</div>
                    <div class="mod-list" id="ldms-${index}">
                        ${renderModifications(level.ldms, index, 'ldms')}
                    </div>
                    <button class="add-mod-btn" onclick="addModification(${index}, 'ldms')">Add LDM</button>
                </div>
            </div>
        `;
        container.appendChild(levelCard);
    });
}

// Function to render modifications (bugfixes or LDMs)
function renderModifications(mods, levelIndex, type) {
    if (!mods || mods.length === 0) {
        return '<div class="mod-item">No modifications available</div>';
    }

    return mods.map((mod, modIndex) => `
        <div class="mod-item">
            <input type="checkbox" ${mod.approved ? 'checked' : ''} 
                   onchange="updateModification(${levelIndex}, '${type}', ${modIndex}, 'approved', this.checked)">
            <input type="text" class="form-control" value="${mod.description}"
                   onchange="updateModification(${levelIndex}, '${type}', ${modIndex}, 'description', this.value)">
            <button class="delete-level-btn" onclick="deleteModification(${levelIndex}, '${type}', ${modIndex})">Delete</button>
        </div>
    `).join('');
}

// Function to update a level's property
function updateLevel(index, property, value) {
    levelsData[index][property] = value;
}

// Function to update a modification
function updateModification(levelIndex, type, modIndex, property, value) {
    levelsData[levelIndex][type][modIndex][property] = value;
}

// Function to add a new modification
function addModification(levelIndex, type) {
    if (!levelsData[levelIndex][type]) {
        levelsData[levelIndex][type] = [];
    }
    levelsData[levelIndex][type].push({
        description: '',
        approved: false
    });
    renderLevels();
}

// Function to delete a modification
function deleteModification(levelIndex, type, modIndex) {
    levelsData[levelIndex][type].splice(modIndex, 1);
    renderLevels();
}

// Function to delete a level
function deleteLevel(index) {
    if (confirm('Are you sure you want to delete this level?')) {
        levelsData.splice(index, 1);
        renderLevels();
    }
}

// Function to add a new level
function addNewLevel() {
    levelsData.push({
        id: '',
        name: '',
        creator: '',
        difficulty: '',
        description: '',
        bugfixes: [],
        ldms: []
    });
    renderLevels();
}

// Function to fetch levels data from the server
async function fetchLevelsData() {
    try {
        const response = await fetch('../levels.json');
        if (!response.ok) {
            throw new Error('Failed to load levels data');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error('Invalid JSON format: Expected an array of levels');
        }
        levelsData = data;
        renderLevels();
    } catch (error) {
        console.error('Error loading levels data:', error);
        document.getElementById('levels-container').innerHTML = `
            <div class="empty-message">
                Failed to load levels data. Please try loading a local JSON file instead.
            </div>
        `;
    }
}

// Set up event listeners
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('load-btn').addEventListener('click', loadLevelsData);
    document.getElementById('save-btn').addEventListener('click', saveLevelsData);
    document.getElementById('add-level-btn').addEventListener('click', addNewLevel);

    // Automatically fetch levels data when the page loads
    fetchLevelsData();
}); 