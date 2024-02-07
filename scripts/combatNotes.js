// "Combat Notes: Token Action Tracker"
class CombatNotes {

    constructor() {
        this.activeDialog = null;
    }

    hasReminders(token) {
        return COMBATNOTES_ID in token.flags && Object.keys(token.flags[COMBATNOTES_ID]).length > 0
    }

    triggerCombatReminder(token) {
        console.log(`Combat Notes | Trigger`);

        if (this.activeDialog != null) {
            this.activeDialog.close();
        }
        this.activeDialog = null;
        this.showCombatReminderDialog(token);
    }

    showCombatReminderDialog(token) {
        if (!token.isOwner) {
            return;
        }

        if (this.hasReminders(token)) {

            let flags = token.flags[COMBATNOTES_ID];
            let content = `
            <h2 class="flexrow" style="align-items: center">
                <div class="flex3"><strong>${token.name}</strong> ${game.i18n.localize('COMBAT-NOTES.dialog-header')}</div>
                <button class="flex0" style="height:28px; margin:5px 0 5px 0" onclick="setReminderForToken('${token.id}')"><i class="fa-solid fa-plus"></i></button>
            </h2>
            <ul>`;
            Object.keys(flags).forEach(flagName => {
                content += `<li class="flexrow" style="align-items: center">
                            <p class="flex3">${flags[flagName].value}<p>
                            <button class="flex0" onclick="removeReminderForToken('${token.id}', '${flagName}')"><i class="fa-solid fa-trash"></i></button>
                        </li>`;
            });

            content += "</ul>";

            this.activeDialog = new Dialog({
                title: game.i18n.localize('COMBAT-NOTES.dialog-title'),
                content: content,
                buttons: {}
            }).render(true);
        }
    }

    setReminder(token) {

        if (this.setReminderDialog != null)
            this.setReminderDialog.close();

        this.setReminderDialog = new Dialog({
            title: game.i18n.localize('REMEMBER-NEW-ACTION.dialog-title'),
            content: game.system.id === 'pf2e' ?
                `        
                <div>
                    <label for="input-field">${game.i18n.localize('REMEMBER-NEW-ACTION.dialog-header')}</label>
                    <input type="text" id="cr-input-field" name="input-field" style="margin-top: 5px; margin-bottom: 5px">
                    <div style="clear:both;"></div>
                    <div style="text-align: right;">
                        <label for="effect-checkbox">${game.i18n.localize('REMEMBER-NEW-ACTION.action-effect')}</label>
                        <input type="checkbox" id="effect-checkbox" name="effect-checkbox" style="float: right;">
                    </div>
                </div>`
                : `
                <div>
                        <label for="input-field">${game.i18n.localize('REMEMBER-NEW-ACTION.dialog-header')}</label>
                        <input type="text" id="cr-input-field" name="input-field" style="margin-top: 5px; margin-bottom: 5px">
                    </div>
                `,
            buttons: {
                submit: {
                    label: game.i18n.localize('REMEMBER-NEW-ACTION.submit-button'),
                    callback: (html) => {
                        const inputValue = html.find('#cr-input-field')[0].value;
                        if (game.system.id === 'pf2e') {
                            const effectValue = html.find('#effect-checkbox')[0].checked;
                            if (effectValue === false) { storeReminderInToken(token, inputValue); }
                            else {
                                createEffectInToken(token, inputValue)
                            }
                        }
                        else {
                            storeReminderInToken(token, inputValue)
                        }
                    }
                },
                cancel: {
                    label: game.i18n.localize('REMEMBER-NEW-ACTION.cancel-button')
                }
            },
            default: "submit"
        }).render(true);
    }


    removeReminder(token, flagName) {
        if (!token.isOwner) {
            ui.notifications.warn(game.i18n.localize('UI-NOTIFICATION.remove-action-error-owner'));
            return;
        }
        token.unsetFlag(COMBATNOTES_ID, flagName).then(()=>{
            combatNotes.triggerCombatReminder(token);
        });
    }
}

function removeReminderForToken(tokenID, flagName) {
    let token = canvas.tokens.get(tokenID).document;
    //combatNotes declaration in main.js
    combatNotes.removeReminder(token, flagName);
}

function setReminderForToken(tokenID) {
    let token = canvas.tokens.get(tokenID).document;
    //combatNotes declaration in main.js
    combatNotes.setReminder(token);
}

// Function to store the input value in token flags
function storeReminderInToken(token, reminder) {
    let flagKey = COMBATNOTES_ID in token.flags ? Object.keys(token.flags[COMBATNOTES_ID]).length : 0;
    const flagData = {
        name: "CombatNotes",
        type: "string", 
        value: reminder
    };

    token.setFlag(COMBATNOTES_ID, flagKey, flagData).then(()=>{
        combatNotes.triggerCombatReminder(token);
    });
    ui.notifications.info(game.i18n.localize('UI-NOTIFICATION.new-action-ok'));
}

async function createEffectInToken(token, inputValue) {
    const data = { ...DUMMY_EFFECT, ...{ name: inputValue } }
    const customEffect = await Item.create(data, { "parent": token.actor })
}