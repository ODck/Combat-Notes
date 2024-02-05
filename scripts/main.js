// Declare the combatNotes variable that will be used later
let combatNotes;

// This hook runs once when the game is initialized
Hooks.once("init", () => {
    console.log(`Combat Notes | Initialization`);
    combatNotes = new CombatNotes();
});


// This hook runs when the canvas is ready to be displayed
Hooks.on("canvasReady", function () {
    console.log('CombatNotes | Canvas Ready!');
    if (game.combat.isActive) {
        let token = game.combat.combatant.token;
        combatNotes.triggerCombatReminder(token);
    }
});

// This hook runs when the combat data is updated
Hooks.on("updateCombat", (combat, changed) => {
    let token = game.combat.combatant.token;
    combatNotes.triggerCombatReminder(token);
});

// This hook runs when the Token HUD is rendered
Hooks.on('renderTokenHUD', async (tokenHUD, html) => {
    var elements = document.querySelectorAll('[data-action="combat"]');
    let insert = document.createElement('div');
    insert.innerHTML = `<div class="control-icon"><i class="fa-solid fa-note-sticky"></i></div>`
    elements[0].after(insert);
    insert.addEventListener('click', () => {
        let token = canvas.tokens.controlled[0].document;

        if (combatNotes.hasReminders(token)) {
            combatNotes.triggerCombatReminder(token)
        }
        else {
            combatNotes.setReminder(token)
        }
    })
});