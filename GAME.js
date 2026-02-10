// =====================================
// AFK EMPIRE - ENHANCED EDITION
// =====================================

// ---------- STATE ----------
var coins = 0;
var clickPower = 1;
var prestige = 0;
var tab = "game";
var lastTime = 0;
var totalEarned = 0;
var totalClicks = 0;
var playtime = 0;
var adminUnlocked = false;
var scrollPos = 0;
var adminInput = { coins: "", prestige: "", gens: "", skills: "", achievements: "" };

// ---------- GENERATORS ----------
var generators = [
    { name:"Miner", amt:0, base:10, cps:1 },
    { name:"Farmer", amt:0, base:25, cps:3 },
    { name:"Factory", amt:0, base:100, cps:15 },
    { name:"Robot", amt:0, base:300, cps:50 },
    { name:"AI", amt:0, base:1000, cps:200 },
    { name:"Planet", amt:0, base:5000, cps:1000 }
];

// ---------- SKILLS ----------
var skills = [
    { name:"+50% CPS", cost:1, bought:false },
    { name:"Double Click", cost:2, bought:false },
    { name:"Auto-Click (1/sec)", cost:3, bought:false },
    { name:"+25% Prestige", cost:2, bought:false },
    { name:"Generator Boost", cost:4, bought:false },
    { name:"Lucky Strike (5%)", cost:3, bought:false }
];

// ---------- ACHIEVEMENTS ----------
var achievements = [
    { name:"First Coin", done:false },
    { name:"Century", done:false },
    { name:"Millionaire", done:false },
    { name:"Billionaire", done:false },
    { name:"First Generator", done:false },
    { name:"5 Generators", done:false },
    { name:"Prestige!", done:false },
    { name:"Prestige 10x", done:false },
    { name:"All Skills", done:false },
    { name:"The Beginning", done:false }
];

// ---------- UPGRADES ----------
var upgrades = [
    { name:"Miner+", gen:0, mult:1.5, cost:50, bought:false },
    { name:"Farmer+", gen:1, mult:1.5, cost:100, bought:false },
    { name:"Factory+", gen:2, mult:1.5, cost:400, bought:false },
    { name:"Robot+", gen:3, mult:1.5, cost:1500, bought:false },
    { name:"AI+", gen:4, mult:1.5, cost:5000, bought:false }
];

// ---------- LORE ----------
var lore = [
    { text:"A single coin appears. Your journey begins.", unlocked:false },
    { text:"You discover simple tools. Miners begin their work.", unlocked:false },
    { text:"Machines rise to aid you. The empire grows.", unlocked:false },
    { text:"Artificial intelligence awakens. No longer bound by physics.", unlocked:false },
    { text:"You reset reality itself. The cycle continues.", unlocked:false },
    { text:"With infinite prestige, you reshape existence.", unlocked:false }
];

// ---------- SAVE ----------
var saveText = "";

// =====================================
// HELPERS
// =====================================

var fmt = function(n){
    if (n < 1000) { return floor(n).toString(); }
    if (n < 1000000) { return (n/1000).toFixed(1) + "K"; }
    if (n < 1000000000) { return (n/1000000).toFixed(2) + "M"; }
    return (n/1000000000).toFixed(2) + "B";
};

var genCost = function(g){
    return floor(g.base * pow(1.15, g.amt));
};

var upgradeCost = function(u){
    return floor(u.cost * pow(1.2, generators[u.gen].amt));
};

var totalCPS = function(){
    var t = 0;
    for (var i = 0; i < generators.length; i++) {
        t += generators[i].amt * generators[i].cps;
    }
    var mult = 1 + prestige * 0.25;
    if (skills[0].bought) { mult *= 1.5; }
    if (skills[4].bought) { mult *= 1.2; }
    return t * mult;
};

var checkAchievements = function(){
    // Coin milestones
    if (!achievements[0].done && coins >= 1) {
        achievements[0].done = true; lore[0].unlocked = true;
    }
    if (!achievements[1].done && totalEarned >= 100) {
        achievements[1].done = true;
    }
    if (!achievements[2].done && totalEarned >= 1000) {
        achievements[2].done = true; lore[1].unlocked = true;
    }
    if (!achievements[3].done && totalEarned >= 1000000) {
        achievements[3].done = true; lore[2].unlocked = true;
    }
    
    // Generator milestones
    if (!achievements[4].done) {
        for (var i = 0; i < generators.length; i++) {
            if (generators[i].amt >= 1) {
                achievements[4].done = true; break;
            }
        }
    }
    
    var totalGen = 0;
    for (var i = 0; i < generators.length; i++) {
        totalGen += generators[i].amt;
    }
    if (!achievements[5].done && totalGen >= 5) {
        achievements[5].done = true; lore[3].unlocked = true;
    }
    
    // Prestige milestones
    if (!achievements[6].done && prestige >= 1) {
        achievements[6].done = true; lore[4].unlocked = true;
    }
    if (!achievements[7].done && prestige >= 10) {
        achievements[7].done = true; lore[5].unlocked = true;
    }
    
    // Skills milestone
    var skillCount = 0;
    for (var i = 0; i < skills.length; i++) {
        if (skills[i].bought) {skillCount++;}
    }
    if (!achievements[8].done && skillCount === skills.length) {
        achievements[8].done = true;
    }
    
    // Starting achievement
    if (!achievements[9].done) {
        achievements[9].done = true;
    }
};

var exportSave = function(){
    saveText = JSON.stringify({
        coins:coins, clickPower:clickPower, prestige:prestige,
        generators:generators, skills:skills, upgrades:upgrades,
        achievements:achievements, lore:lore,
        totalEarned:totalEarned, totalClicks:totalClicks, playtime:playtime
    });
};

var importSave = function(){
    try {
        var d = JSON.parse(saveText);
        coins=d.coins; clickPower=d.clickPower; prestige=d.prestige;
        generators=d.generators; skills=d.skills; upgrades=d.upgrades;
        achievements=d.achievements; lore=d.lore;
        totalEarned=d.totalEarned; totalClicks=d.totalClicks; playtime=d.playtime;
    } catch(e){}
};

// =====================================
// DRAW HELPERS
// =====================================

var drawTabs = function(){
    var tabs = ["game","skills","ups","ach","lore","stats","save"];
    for (var i = 0; i < tabs.length; i++) {
        fill(tab === tabs[i] ? 100 : 40);
        rect(i*57, 0, 57, 25);
        fill(255);
        textSize(10);
        textAlign(CENTER, CENTER);
        text(tabs[i], i*57 + 28, 13);
    }
    // Admin button in bottom left when unlocked
    if (adminUnlocked) {
        fill(200, 50, 50);
        rect(0, height-25, 50, 25);
        fill(255);
        textSize(10);
        textAlign(CENTER, CENTER);
        text("admin", 25, height-12);
    }
};

var drawGame = function(){
    textAlign(LEFT, CENTER);
    fill(255);
    textSize(12);
    text("Coins: " + fmt(coins), 10, 40);
    text("CPS: " + fmt(totalCPS()), 10, 55);
    text("Prestige: " + prestige, 10, 70);

    fill(100,200,120);
    rect(10, 80, 380, 30, 6);
    fill(0);
    text("CLICK +" + fmt(clickPower), 40, 95);

    // Generators with scrolling
    var startIdx = scrollPos;
    var visibleCount = 6;
    var endIdx = Math.min(startIdx + visibleCount, generators.length);
    
    for (var i = startIdx; i < endIdx; i++) {
        var g = generators[i];
        var y = 120 + (i - startIdx) * 30;
        fill(coins >= genCost(g) ? 70 : 40);
        rect(10, y, 380, 28, 6);
        fill(255);
        text(
            g.name + " [" + g.amt + "] +" + fmt(g.cps) + " | " + fmt(genCost(g)),
            15, y + 14
        );
    }
    
    // Scroll buttons
    fill(50);
    if (scrollPos > 0) {
        rect(10, 300, 180, 25, 4);
        fill(255);
        text("SCROLL UP", 100, 313);
    }
    
    fill(50);
    if (scrollPos < generators.length - 6) {
        rect(210, 300, 180, 25, 4);
        fill(255);
        text("SCROLL DOWN", 300, 313);
    }

    fill(200,80,80);
    rect(10, 330, 380, 30, 6);
    fill(255);
    text("PRESTIGE (1k coins)", 120, 345);
};

var drawSkills = function(){
    textSize(11);
    var startIdx = scrollPos;
    var visibleCount = 8;
    var endIdx = Math.min(startIdx + visibleCount, skills.length);
    
    for (var i = startIdx; i < endIdx; i++) {
        var s = skills[i];
        var y = 40 + (i - startIdx) * 32;
        fill(!s.bought && prestige >= s.cost ? 70 : 40);
        rect(10, y, 380, 30, 6);
        fill(255);
        var status = s.bought ? " [OWNED]" : " (Cost " + s.cost + ")";
        text(s.name + status, 15, y + 15);
    }
    
    // Scroll buttons
    fill(50);
    if (scrollPos > 0) {
        rect(10, 310, 180, 25, 4);
        fill(255);
        text("SCROLL UP", 100, 323);
    }
    
    fill(50);
    if (scrollPos < skills.length - 8) {
        rect(210, 310, 180, 25, 4);
        fill(255);
        text("SCROLL DOWN", 300, 323);
    }
};

var drawUpgrades = function(){
    textSize(11);
    var startIdx = scrollPos;
    var visibleCount = 8;
    var endIdx = Math.min(startIdx + visibleCount, upgrades.length);
    
    for (var i = startIdx; i < endIdx; i++) {
        var u = upgrades[i];
        var y = 40 + (i - startIdx) * 32;
        var cost = upgradeCost(u);
        fill(!u.bought && coins >= cost ? 70 : 40);
        rect(10, y, 380, 30, 6);
        fill(255);
        var status = u.bought ? " [OWNED]" : " | " + fmt(cost);
        text(u.name + " x" + u.mult.toFixed(1) + status, 15, y + 15);
    }
    
    // Scroll buttons
    fill(50);
    if (scrollPos > 0) {
        rect(10, 310, 180, 25, 4);
        fill(255);
        text("SCROLL UP", 100, 323);
    }
    
    fill(50);
    if (scrollPos < upgrades.length - 8) {
        rect(210, 310, 180, 25, 4);
        fill(255);
        text("SCROLL DOWN", 300, 323);
    }
};

var drawAchievements = function(){
    textSize(11);
    fill(255);
    var count = 0;
    for (var i = 0; i < achievements.length; i++) {
        if (count < 12) {
            var y = 40 + (count % 12) * 25;
            if (y + 25 > 350) {continue;}
            text((achievements[i].done ? "✔ " : "✖ ") + achievements[i].name, 10, y);
            count++;
        }
    }
};

var drawLore = function(){
    textSize(11);
    fill(200);
    var y = 40;
    for (var i = 0; i < lore.length; i++) {
        if (lore[i].unlocked) {
            text("• " + lore[i].text, 10, y, 380, 40);
            y += 50;
        }
    }
};

var drawStats = function(){
    textSize(11);
    fill(255);
    textAlign(LEFT, CENTER);
    text("Total Earned: " + fmt(totalEarned), 10, 50);
    text("Total Clicks: " + fmt(totalClicks), 10, 75);
    text("Play Time: " + floor(playtime) + "s", 10, 100);
    text("Avg CPS: " + fmt(totalEarned / (playtime > 0 ? playtime : 1)), 10, 125);
    
    var boughtSkills = 0;
    for (var i = 0; i < skills.length; i++) {
        if (skills[i].bought) {boughtSkills++;}
    }
    text("Skills Bought: " + boughtSkills + "/" + skills.length, 10, 150);
    
    var totalGen = 0;
    for (var i = 0; i < generators.length; i++) {
        totalGen += generators[i].amt;
    }
    text("Total Generators: " + totalGen, 10, 175);
};

var drawAdmin = function(){
    textSize(11);
    fill(255);
    textAlign(LEFT, TOP);
    text("== ADMIN PANEL ==", 10, 40);
    
    textSize(9);
    var inputHeight = 25;
    var inputSpacing = 40;
    
    // Coins input
    text("Add Coins:", 10, 60);
    fill(80);
    rect(10, 75, 150, inputHeight, 4);
    fill(255);
    textSize(10);
    textAlign(LEFT, CENTER);
    text(adminInput.coins, 15, 87);
    
    fill(150, 50, 50);
    rect(170, 75, 60, inputHeight, 4);
    fill(255);
    text("ADD", 190, 87);
    
    // Prestige input
    textSize(9);
    textAlign(LEFT, TOP);
    text("Add Prestige:", 10, 120);
    fill(80);
    rect(10, 135, 150, inputHeight, 4);
    fill(255);
    textSize(10);
    textAlign(LEFT, CENTER);
    text(adminInput.prestige, 15, 147);
    
    fill(150, 50, 50);
    rect(170, 135, 60, inputHeight, 4);
    fill(255);
    text("ADD", 190, 147);
    
    // Generators input
    textSize(9);
    textAlign(LEFT, TOP);
    text("Add Gens (each):", 10, 180);
    fill(80);
    rect(10, 195, 150, inputHeight, 4);
    fill(255);
    textSize(10);
    textAlign(LEFT, CENTER);
    text(adminInput.gens, 15, 207);
    
    fill(150, 50, 50);
    rect(170, 195, 60, inputHeight, 4);
    fill(255);
    text("ADD", 190, 207);
    
    // Other buttons
    fill(100, 100, 150);
    rect(10, 250, 125, 30, 6);
    fill(255);
    textSize(10);
    textAlign(CENTER, CENTER);
    text("Buy All Skills", 72, 265);
    
    fill(100, 100, 150);
    rect(145, 250, 125, 30, 6);
    fill(255);
    text("Unlock Achievements", 207, 265);
    
    fill(200, 80, 80);
    rect(280, 250, 110, 30, 6);
    fill(255);
    text("RESET GAME", 335, 265);
};

var drawSave = function(){
    textSize(10);
    fill(80);
    rect(10, 40, 180, 30, 6);
    rect(210, 40, 180, 30, 6);
    fill(255);
    text("EXPORT", 100, 55);
    text("IMPORT", 300, 55);
    textSize(9);
    text(saveText.substring(0,700), 10, 80, 380, 300);
};

// =====================================
// MAIN DRAW
// =====================================

draw = function(){
    background(15);

    var now = millis();
    var dt = (now - lastTime) / 1000;
    lastTime = now;
    
    coins += totalCPS() * dt;
    totalEarned += totalCPS() * dt;
    playtime += dt;
    
    // Auto-click
    if (skills[2].bought) {
        coins += clickPower * dt;
        totalEarned += clickPower * dt;
    }
    
    // Lucky strike
    if (skills[5].bought && random(1) < 0.0005 * dt) {
        coins += totalEarned * 0.1;
    }

    drawTabs();

    if (tab === "game") {drawGame();}
    if (tab === "skills") {drawSkills();}
    if (tab === "ups") {drawUpgrades();}
    if (tab === "ach") {drawAchievements();}
    if (tab === "lore") {drawLore();}
    if (tab === "stats") {drawStats();}
    if (tab === "admin") {drawAdmin();}
    if (tab === "save") {drawSave();}

    checkAchievements();
};

// =====================================
// INPUT
// =====================================

mousePressed = function(){
    // Secret admin activation - bottom left 50x25 pixels (after click)
    if (mouseX < 50 && mouseY > height-25 && !adminUnlocked) {
        adminUnlocked = true;
        return;
    }
    
    // Admin button click in bottom left
    if (adminUnlocked && mouseX < 50 && mouseY > height-25) {
        tab = "admin";
        scrollPos = 0;
        return;
    }
    
    var tabs = ["game","skills","ups","ach","lore","stats","save"];
    for (var i = 0; i < tabs.length; i++) {
        if (mouseY < 25 && mouseX > i*57 && mouseX < i*57+57) {tab = tabs[i]; scrollPos = 0;}
    }

    if (tab === "game") {
        // Click button
        if (mouseX > 10 && mouseX < 190 && mouseY > 80 && mouseY < 110) {
            coins += clickPower;
            totalEarned += clickPower;
            totalClicks++;
            if (skills[5].bought && random(1) < 0.05) {
                coins += totalEarned * 0.1;
            }
        }
        
        // Scroll up
        if (mouseX > 10 && mouseX < 190 && mouseY > 300 && mouseY < 325 && scrollPos > 0) {
            scrollPos--;
        }
        
        // Scroll down
        if (mouseX > 210 && mouseX < 390 && mouseY > 300 && mouseY < 325 && scrollPos < generators.length - 6) {
            scrollPos++;
        }

        // Generator clicks with scroll offset
        var startIdx = scrollPos;
        for (var j = startIdx; j < Math.min(startIdx + 6, generators.length); j++) {
            var y = 120 + (j - startIdx) * 30;
            var g = generators[j];
            if (mouseX > 10 && mouseX < 390 && mouseY > y && mouseY < y+28 && coins >= genCost(g)) {
                coins -= genCost(g); g.amt++;
            }
        }

        // Prestige button
        if (mouseX > 10 && mouseX < 390 && mouseY > 330 && mouseY < 360 && coins >= 1000) {
            prestige++; coins = 0;
            for (var k = 0; k < generators.length; k++) {generators[k].amt = 0;}
        }
    }

    if (tab === "skills") {
        // Scroll up
        if (mouseX > 10 && mouseX < 190 && mouseY > 310 && mouseY < 335 && scrollPos > 0) {
            scrollPos--;
        }
        
        // Scroll down
        if (mouseX > 210 && mouseX < 390 && mouseY > 310 && mouseY < 335 && scrollPos < skills.length - 8) {
            scrollPos++;
        }
        
        // Skill clicks with scroll offset
        var startIdx = scrollPos;
        for (var s = startIdx; s < Math.min(startIdx + 8, skills.length); s++) {
            var sy = 40 + (s - startIdx) * 32;
            if (!skills[s].bought && prestige >= skills[s].cost && mouseX > 10 && mouseX < 390 && mouseY > sy && mouseY < sy+30) {
                prestige -= skills[s].cost; skills[s].bought = true;
                if (s===1) {clickPower *=2;}
            }
        }
    }

    if (tab === "ups") {
        // Scroll up
        if (mouseX > 10 && mouseX < 190 && mouseY > 310 && mouseY < 335 && scrollPos > 0) {
            scrollPos--;
        }
        
        // Scroll down
        if (mouseX > 210 && mouseX < 390 && mouseY > 310 && mouseY < 335 && scrollPos < upgrades.length - 8) {
            scrollPos++;
        }
        
        // Upgrade clicks with scroll offset
        var startIdx = scrollPos;
        for (var u = startIdx; u < Math.min(startIdx + 8, upgrades.length); u++) {
            var uy = 40 + (u - startIdx) * 32;
            var upg = upgrades[u];
            if (!upg.bought && coins >= upgradeCost(upg) && mouseX > 10 && mouseX < 390 && mouseY > uy && mouseY < uy+30) {
                coins -= upgradeCost(upg);
                upg.bought = true;
                generators[upg.gen].cps *= upg.mult;
            }
        }
    }

    if (tab === "save") {
        if (mouseX > 10 && mouseX < 190 && mouseY > 40 && mouseY < 70) {exportSave();}
        if (mouseX > 210 && mouseX < 390 && mouseY > 40 && mouseY < 70) {importSave();}
    }
    
    if (tab === "admin") {
        // Coins input add button
        if (mouseX > 170 && mouseX < 230 && mouseY > 75 && mouseY < 100 && adminInput.coins) {
            coins += parseInt(adminInput.coins, 10) || 0;
            totalEarned += parseInt(adminInput.coins, 10) || 0;
            adminInput.coins = "";
        }
        
        // Prestige input add button
        if (mouseX > 170 && mouseX < 230 && mouseY > 135 && mouseY < 160 && adminInput.prestige) {
            prestige += parseInt(adminInput.prestige, 10) || 0;
            adminInput.prestige = "";
        }
        
        // Generators input add button
        if (mouseX > 170 && mouseX < 230 && mouseY > 195 && mouseY < 220 && adminInput.gens) {
            for (var g = 0; g < generators.length; g++) {
                generators[g].amt += parseInt(adminInput.gens, 10) || 0;
            }
            adminInput.gens = "";
        }
        
        // Buy All Skills
        if (mouseX > 10 && mouseX < 135 && mouseY > 250 && mouseY < 280) {
            for (var s = 0; s < skills.length; s++) {
                if (!skills[s].bought) {
                    skills[s].bought = true;
                    if (s === 1) { clickPower *= 2; }
                }
            }
        }
        
        // Unlock Achievements
        if (mouseX > 145 && mouseX < 270 && mouseY > 250 && mouseY < 280) {
            for (var a = 0; a < achievements.length; a++) {
                achievements[a].done = true;
            }
            for (var l = 0; l < lore.length; l++) {
                lore[l].unlocked = true;
            }
        }
        
        // Reset Game
        if (mouseX > 280 && mouseX < 390 && mouseY > 250 && mouseY < 280) {
            coins = 0;
            clickPower = 1;
            prestige = 0;
            totalEarned = 0;
            totalClicks = 0;
            playtime = 0;
            adminInput = { coins: "", prestige: "", gens: "", skills: "", achievements: "" };
            for (var r = 0; r < generators.length; r++) {
                generators[r].amt = 0;
            }
            for (var sk = 0; sk < skills.length; sk++) {
                skills[sk].bought = false;
            }
            for (var up = 0; up < upgrades.length; up++) {
                upgrades[up].bought = false;
            }
            for (var ac = 0; ac < achievements.length; ac++) {
                achievements[ac].done = false;
            }
            for (var lo = 0; lo < lore.length; lo++) {
                lore[lo].unlocked = false;
            }
        }
    }
};

// Handle keyboard input for admin text fields
keyPressed = function(){
    if (tab === "admin") {
        if (keyCode === BACKSPACE) {
            adminInput.coins = adminInput.coins.slice(0, -1);
            return false;
        }
        
        var charCode = String.fromCharCode(keyCode);
        if (/[0-9]/.test(charCode)) {
            adminInput.coins += charCode;
            return false;
        }
    }
};
