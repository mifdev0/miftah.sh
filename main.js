// Initialize Lucide icons
lucide.createIcons();

// Global state
let commandHistory = [];
let historyIndex = -1;
let data = {};

// Load data from JSON
async function loadData() {
    try {
        const response = await fetch('data.json');
        data = await response.json();
        initializeFooter();
    } catch (error) {
        console.error('Failed to load data.json:', error);
    }
}

// Format subscriber count: 1234567 → "1.2M", 12345 → "12.3K"
function formatCount(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    return String(n);
}

// Initialize footer with data, then fetch live subscriber count
async function initializeFooter() {
    const footerPill = document.getElementById('footer-pill');
    if (!data.contact) return;

    const renderPill = (subCount) => {
        footerPill.innerHTML = `
            <img src="${data.profile.avatar}" alt="Avatar" class="footer-avatar">
            <span class="footer-username">${data.contact.username}</span>
            <div class="footer-divider"></div>
            <a href="${data.contact.youtube}" target="_blank" class="footer-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
                <span>${subCount}</span>
            </a>
            <a href="${data.contact.instagram}" target="_blank" class="footer-social-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
            </a>
        `;
        lucide.createIcons();
    };

    // Render loading state first
    renderPill('...');

    try {
        const res = await fetch('/api/youtube-subscribers');
        const { count } = await res.json();
        if (count != null) {
            renderPill(formatCount(count));
        } else {
            renderPill('?');
        }
    } catch (e) {
        renderPill('?');
    }
}

// Terminal output functions
const terminalOutput = document.getElementById('terminal-output');

function addOutput(content, isCommand = false) {
    const line = document.createElement('div');
    line.className = 'terminal-line';
    
    if (isCommand) {
        line.innerHTML = `
            <div class="terminal-prompt-line">
                <span class="prompt">visitor@miftah:~$</span>
                <span class="command-text">${content}</span>
            </div>
        `;
    } else {
        line.innerHTML = `<div class="output-text">${content}</div>`;
    }
    
    terminalOutput.appendChild(line);
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function addRichOutput(htmlContent) {
    const line = document.createElement('div');
    line.className = 'terminal-line rich-output';
    line.innerHTML = htmlContent;
    line.style.opacity = '0';
    terminalOutput.appendChild(line);
    
    // Fade in animation
    setTimeout(() => {
        line.style.transition = 'opacity 0.3s ease-in';
        line.style.opacity = '1';
    }, 50);
    
    lucide.createIcons();
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

function typeText(text, callback) {
    let index = 0;
    const line = document.createElement('div');
    line.className = 'terminal-line';
    const output = document.createElement('div');
    output.className = 'output-text';
    line.appendChild(output);
    terminalOutput.appendChild(line);

    const interval = setInterval(() => {
        if (index < text.length) {
            output.textContent += text[index];
            index++;
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        } else {
            clearInterval(interval);
            if (callback) callback();
        }
    }, 10);
}

// Welcome message
function showWelcome() {
    const now = new Date();
    const dateStr = now.toDateString();
    const timeStr = now.toTimeString().split(' ')[0];
    
    typeText(`Last login: ${dateStr} ${timeStr} on console`, () => {
        typeText(`Welcome to Miftah's portfolio. Type /help to see available commands.`);
    });
}

// Command handlers
const commands = {
    '/help': () => {
        const helpText = `
/profile      Learn more about me
/projects     View my latest work
/experience   My journey so far
/skills       Tech stack I use
/music        My Spotify playlist
/contact      Get in touch
/clear        Clear terminal buffer`;
        typeText(helpText);
    },
    
    '/clear': () => {
        terminalOutput.innerHTML = '';
    },
    
    '/profile': () => {
        typeText('Loading profile...', () => {
            const profileCard = `
                <div class="profile-card">
                    <img src="${data.profile.avatar}" alt="${data.profile.name}" class="profile-avatar">
                    <div class="profile-info">
                        <h2 class="profile-name">${data.profile.name}</h2>
                        <p class="profile-tagline">${data.profile.tagline}</p>
                        <div class="profile-status">
                            <span class="status-dot"></span>
                            <span>${data.profile.status}</span>
                        </div>
                        <p class="profile-description">${data.profile.description}</p>
                    </div>
                </div>
            `;
            addRichOutput(profileCard);
        });
    },
    
    '/projects': () => {
        typeText('Loading projects...', () => {
            let projectsHTML = '<div class="projects-grid">';
            data.projects.forEach(project => {
                projectsHTML += `
                    <div class="project-card">
                        <img src="${project.thumbnail}" alt="${project.name}" class="project-thumbnail">
                        <div class="project-info">
                            <h3 class="project-name">${project.name}</h3>
                            <p class="project-description">${project.description}</p>
                            <div class="project-links">
                                <a href="${project.github}" target="_blank" class="project-link">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                                    <span>GitHub</span>
                                </a>
                                <a href="${project.demo}" target="_blank" class="project-link">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                                    <span>Live Demo</span>
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            });
            projectsHTML += '</div>';
            addRichOutput(projectsHTML);
        });
    },
    
    '/experience': () => {
        typeText('Loading experience...', () => {
            let experienceHTML = '<div class="experience-timeline">';
            data.experience.forEach((exp, index) => {
                experienceHTML += `
                    <div class="experience-item">
                        <div class="experience-dot"></div>
                        <div class="experience-content">
                            <div class="experience-year">${exp.year}</div>
                            <div class="experience-role">${exp.role}</div>
                            <div class="experience-company">${exp.company}</div>
                            <div class="experience-type">${exp.type}</div>
                        </div>
                    </div>
                `;
            });
            experienceHTML += '</div>';
            addRichOutput(experienceHTML);
        });
    },
    
    '/skills': () => {
        typeText('Loading skills...', () => {
            let skillsHTML = '<div class="skills-container">';
            for (const [category, skills] of Object.entries(data.skills)) {
                skillsHTML += `
                    <div class="skills-category">
                        <h3 class="skills-category-title">${category}</h3>
                        <div class="skills-list">
                            ${skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                        </div>
                    </div>
                `;
            }
            skillsHTML += '</div>';
            addRichOutput(skillsHTML);
        });
    },
    
    '/music': () => {
        typeText('Loading playlist...', () => {
            const playlistId = data.music.link.split('/playlist/')[1]?.split('?')[0];
            const musicCard = `
                <iframe style="border-radius:12px"
                    src="https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0"
                    width="100%" height="152" frameBorder="0" allowfullscreen=""
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy">
                </iframe>
            `;
            addRichOutput(musicCard);
        });
    },
    
    '/contact': () => {
        typeText('Loading contact info...', () => {
            const contactList = `
                <div class="contact-container">
                    <div class="contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/></svg>
                        <span class="contact-label">Email</span>
                        <a href="mailto:${data.contact.email}" class="contact-link">${data.contact.email}</a>
                    </div>
                    <div class="contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                        <span class="contact-label">GitHub</span>
                        <a href="${data.contact.github}" target="_blank" class="contact-link">${data.contact.github}</a>
                    </div>
                    <div class="contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                        <span class="contact-label">LinkedIn</span>
                        <a href="${data.contact.linkedin}" target="_blank" class="contact-link">${data.contact.linkedin}</a>
                    </div>
                    <div class="contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
                        <span class="contact-label">YouTube</span>
                        <a href="${data.contact.youtube}" target="_blank" class="contact-link">${data.contact.youtube}</a>
                    </div>
                    <div class="contact-item">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                        <span class="contact-label">Instagram</span>
                        <a href="${data.contact.instagram}" target="_blank" class="contact-link">${data.contact.instagram}</a>
                    </div>
                </div>
            `;
            addRichOutput(contactList);
        });
    }
};

// Handle command input
const terminalInput = document.getElementById('terminal-input');
const suggestionsEl = document.getElementById('suggestions');

const COMMAND_LIST = [
    { cmd: '/help',       desc: 'Show all commands' },
    { cmd: '/profile',    desc: 'About me' },
    { cmd: '/projects',   desc: 'My work' },
    { cmd: '/experience', desc: 'Work history' },
    { cmd: '/skills',     desc: 'Tech stack' },
    { cmd: '/music',      desc: 'My Spotify playlist' },
    { cmd: '/contact',    desc: 'Get in touch' },
    { cmd: '/clear',      desc: 'Clear terminal' },
];

let activeIndex = -1;

function showSuggestions(val) {
    const filtered = val === '/'
        ? COMMAND_LIST
        : COMMAND_LIST.filter(c => c.cmd.startsWith(val));

    if (!filtered.length || !val.startsWith('/')) {
        hideSuggestions();
        return;
    }

    activeIndex = -1;
    suggestionsEl.innerHTML = filtered.map((c, i) => `
        <div class="suggestion-item" data-cmd="${c.cmd}">
            <span class="suggestion-cmd">${c.cmd}</span>
            <span class="suggestion-desc">${c.desc}</span>
        </div>
    `).join('');

    suggestionsEl.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            terminalInput.value = item.dataset.cmd;
            hideSuggestions();
            terminalInput.focus();
        });
    });

    suggestionsEl.classList.add('visible');
}

function hideSuggestions() {
    suggestionsEl.classList.remove('visible');
    suggestionsEl.innerHTML = '';
    activeIndex = -1;
}

function navigateSuggestions(dir) {
    const items = suggestionsEl.querySelectorAll('.suggestion-item');
    if (!items.length) return false;
    items[activeIndex]?.classList.remove('active');
    activeIndex = (activeIndex + dir + items.length) % items.length;
    items[activeIndex].classList.add('active');
    terminalInput.value = items[activeIndex].dataset.cmd;
    return true;
}

terminalInput.addEventListener('input', () => {
    showSuggestions(terminalInput.value);
});

terminalInput.addEventListener('keydown', (e) => {
    if (suggestionsEl.classList.contains('visible')) {
        if (e.key === 'ArrowUp')   { e.preventDefault(); navigateSuggestions(-1); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); navigateSuggestions(1);  return; }
        if (e.key === 'Escape')    { hideSuggestions(); return; }
        if (e.key === 'Tab') {
            e.preventDefault();
            const first = suggestionsEl.querySelector('.suggestion-item');
            if (first) { terminalInput.value = first.dataset.cmd; hideSuggestions(); }
            return;
        }
    }

    if (e.key === 'Enter') {
        hideSuggestions();
        const command = terminalInput.value.trim();
        if (command) {
            addOutput(command, true);
            commandHistory.push(command);
            historyIndex = commandHistory.length;
            if (commands[command]) {
                commands[command]();
            } else {
                typeText(`bash: ${command}: command not found. Type /help for available commands.`);
            }
            terminalInput.value = '';
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            terminalInput.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            terminalInput.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            terminalInput.value = '';
        }
    }
});

// Auto-focus input
terminalInput.focus();
document.querySelector('.terminal-container').addEventListener('click', (e) => {
    if (e.target.tagName !== 'A' && !window.getSelection().toString()) {
        terminalInput.focus();
    }
});

// Initialize
loadData();
showWelcome();
