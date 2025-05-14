document.addEventListener('DOMContentLoaded', function() {
    function resolveImagePath(path) {
        if (!path) return '';
        
        if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
            return path;
        }
        
        const baseUrl = window.location.href.replace(/\/[^/]*$/, '/');
        return new URL(path, baseUrl).href;
    }

    fetch('config.json')
        .then(response => response.json())
        .then(config => {
            const launchLogo = document.getElementById('launch-logo');
            launchLogo.src = resolveImagePath(config.lunch_screen.logo);
            launchLogo.onerror = function() {
                this.style.display = 'none';
            };
            
            document.getElementById('launch-title').textContent = config.lunch_screen.text;
            document.getElementById('launch-madeby').textContent = config.lunch_screen.text_made;
            
            document.getElementById('app-title').textContent = config.title;
            
            if (!sessionStorage.getItem('launchShown')) {
                setTimeout(() => {
                    document.getElementById('launch-screen').style.opacity = '0';
                    setTimeout(() => {
                        document.getElementById('launch-screen').style.display = 'none';
                        document.getElementById('app').style.display = 'flex';
                        loadContent(config, 'home_menu');
                        setupNavigation(config);
                    }, 500);
                }, 2000);
                sessionStorage.setItem('launchShown', 'true');
            } else {
                document.getElementById('launch-screen').style.display = 'none';
                document.getElementById('app').style.display = 'flex';
                loadContent(config, 'home_menu');
                setupNavigation(config);
            }
        })
        .catch(error => console.error('Error loading config:', error));
    
    function parseMinecraftFormatting(text) {
        if (!text) return '';
        
        const formatMap = {
            '§0': '</span><span style="color: #000000">',
            '§1': '</span><span style="color: #0000AA">',
            '§2': '</span><span style="color: #00AA00">',
            '§3': '</span><span style="color: #00AAAA">',
            '§4': '</span><span style="color: #AA0000">',
            '§5': '</span><span style="color: #AA00AA">',
            '§6': '</span><span style="color: #FFAA00">',
            '§7': '</span><span style="color: #AAAAAA">',
            '§8': '</span><span style="color: #555555">',
            '§9': '</span><span style="color: #5555FF">',
            '§a': '</span><span style="color: #55FF55">',
            '§b': '</span><span style="color: #55FFFF">',
            '§c': '</span><span style="color: #FF5555">',
            '§d': '</span><span style="color: #FF55FF">',
            '§e': '</span><span style="color: #FFFF55">',
            '§f': '</span><span style="color: #FFFFFF">',
            '§l': '</span><span style="font-weight: bold">',
            '§o': '</span><span style="font-style: italic">',
            '§r': '</span><span style="color: inherit; font-weight: normal; font-style: normal">',
            '§n': '</span><span style="text-decoration: underline">',
            '§m': '</span><span style="text-decoration: line-through">',
            '§k': '</span><span class="obfuscated">'
        };
        
        let result = '<span>' + text;
        for (const [code, html] of Object.entries(formatMap)) {
            result = result.split(code).join(html);
        }
        return result + '</span>';
    }
    
    function loadContent(config, menuId) {
        const contentArea = document.getElementById('main-content');
        contentArea.innerHTML = '';
        
        const contents = config.konten[menuId];
        if (!contents) return;
        
        contents.forEach(content => {
            const card = document.createElement('div');
            card.className = 'content-card';
            
            if (content.gambar) {
                const img = document.createElement('img');
                img.src = resolveImagePath(content.gambar);
                img.className = 'card-image';
                img.alt = content.judul || '';
                img.onerror = function() {
                    this.style.display = 'none';
                };
                card.appendChild(img);
            }
            
            if (content.judul) {
                const title = document.createElement('h2');
                title.className = 'card-title';
                title.innerHTML = parseMinecraftFormatting(content.judul);
                card.appendChild(title);
            }
            
            if (content.deskripsi) {
                const desc = document.createElement('p');
                desc.className = 'card-description';
                desc.innerHTML = parseMinecraftFormatting(content.deskripsi);
                card.appendChild(desc);
            }
            
            if (content.divider) {
                const divider = document.createElement('div');
                divider.className = `divider ${content.divider.tebal === 'tebal' ? 'divider-thick' : 'divider-thin'}`;
                if (content.divider.warna) {
                    divider.style.backgroundColor = content.divider.warna;
                }
                card.appendChild(divider);
            }
            
            if (content.unduh && Array.isArray(content.unduh)) {
                const btnContainer = document.createElement('div');
                btnContainer.style.marginTop = '15px';
                
                content.unduh.forEach(dl => {
                    const btn = document.createElement('button');
                    btn.className = 'download-btn';
                    btn.innerHTML = `<i class="fas fa-download"></i> ${dl.text}`;
                    if (dl.tooltips) {
                        btn.title = dl.tooltips;
                    }
                    
                    btn.addEventListener('click', () => {
                        if (dl.path.startsWith('http')) {
                            window.open(dl.path, '_blank');
                        } else {
                            const fileUrl = resolveImagePath(dl.path);
                            window.open(fileUrl, '_blank');
                        }
                    });
                    
                    btnContainer.appendChild(btn);
                });
                
                card.appendChild(btnContainer);
            }
            
            contentArea.appendChild(card);
        });
    }

    function setupNavigation(config) {
        const nav = document.getElementById('bottom-nav');
        nav.innerHTML = '';
        
        config.app.forEach(item => {
            const btn = document.createElement('div');
            btn.className = 'nav-btn';
            btn.id = item.id;
            
            const iconPath = resolveImagePath(item.icon);
            
            btn.innerHTML = `
                <img src="${iconPath}" alt="${item.text}" 
                     style="width: 24px; height: 24px; margin-bottom: 4px;"
                     onerror="this.onerror=null;this.src='${resolveImagePath('ikon/default.png')}';">
                <span>${item.text}</span>
            `;
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('.nav-btn').forEach(b => {
                    b.classList.remove('active');
                });
                
                btn.classList.add('active');
                
                loadContent(config, item.id);
            });
            
            nav.appendChild(btn);
        });
        
        document.getElementById('home_menu').classList.add('active');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                })
                .catch(err => {
                });
        });
    }
});
