/*
Note: All auxiliary functions should probably be moved to mediators.
*/
Shell.commands['clear'] = function() {
	Terminal.clear();
}

Shell.commands['start'] = function() {
	player.state = state.player.start;
	Terminal.print("Hello! Type 'new' to begin, or 'load' if you already have a profile.");
};

//Create player data.
Shell.commands['new'] = function() {
	if ([state.player.start, state.player.dead].includes(player.state)) {
		player.state = state.player.name;
		Terminal.print("What is your name?");
		return;
	}
	Terminal.print("You can't quit now!");
}

Shell.commands['help'] = function() {
  let help_list = `
<h3>Commands</h3>
<p>
Go [dir]     - Go in a direction</br>
Rest         - Rest and recover HP</br>
Save         - Save progress</br>
Load         - Load a saved game</br>
Stats        - Current character info</br>
Map	         - Displays the map and legend</br>
Fight        - Used when NPC encounter occurs</br>
Inspect      - In a fight, assess enemy</br>
Shop         - Enter a shop and purchase items</br>
Buy [item]   - Purchase items from the shop</br>
Exit Shop    - Leave the shop</br>
Equip [item] - Equip an item</br>
Inv [page]   - View your inventory</br>
Quest [page] - View a list of your current quests</br>
Help         - View this page
</p>
`;
	help_list = help_list.replace(/ /g, "&nbsp;");
	$("#gameInfo").html(help_list);
  Terminal.print("Game commands can be found on the right-hand pane");
}

Shell.commands['updates'] = function() {
	$("#gameInfo").html($("#updates").html());
	Terminal.print("Updates to the game can be found on the right-hand pane");
}

Shell.commands['about'] = function() {
    let about = `
<h3>About</h3>
<p>
<b>rpg the rpg: an mmorpg</b> is a monotonous monoplayer<br>
oldschool role-playing game that started out as<br>
an assignment in one of my classes. To be<br>
succinct, this is a game where you walk around<br>
and get in fights. Or not. I can't tell you<br>
what to do, I'm just some text on a screen.
</p>
`;
    $("#gameInfo").html(about);
    Terminal.print("Information about the game can be found on the right-hand pane");
}

const advance = function(direction, response) {
	let move_probe = player.move(...direction);
	if (!move_probe[0]) {
		Terminal.print(move_probe[1]);
		return false;
	}
	response && Terminal.print(response);
	if (map.hasEncounter(player.position)) {
		encounter = new Encounter();
		let encounter_data = encounter.getEncounter();
		Terminal.print("Oh no! You ran into a level " + encounter_data.level + " " + encounter_data.name_mod + "!");
		Terminal.print("What will you do? [Fight/Inspect/Run]");
		player.state = state.player.fight;
		return false;
	}
	ui.resumeDisplay(currentDisplay);
	return true;
}

//Used for movement around map.
//Occasionally on move, an npc should be created.
Shell.commands['go'] = function() {
	if (player.state != state.player.standard) {
		Terminal.print("You can't go anywhere right now!");
		return;
	}

	let direction = Terminal.processArgs(arguments);
	if (direction === '') {
		Terminal.print("Go where?");
		return;
	}
	// Mean movements
	if (direction === 'away' || direction === 'to hell') {
		Terminal.print(randomChoice([':(', 'I\'m sorry...', 'Was... was it something I said?']));
		Terminal.suppressed = true;
		return;
	}
	// Silly movements
	if (direction === 'down') {
		if (player.state == state.player.underground) {
			Terminal.print(randomChoice(["Sorry, it's all up from here.", "Wow, bedrock already? Guess you're gonna have to turn around.", "Careful! You'll anger the mole people!", "No."]));
		} else if (map.getTile(...player.position).type == "W") {
			Terminal.print("You can't swim!");
		} else {
			Terminal.print("You start digging down. It is dark down here.");
			player.state = state.player.underground;
		}
		return;
	} else if (direction === 'up') {
		if (player.state == state.player.underground) {
			Terminal.print("You're back on level ground. It's not as dark up here.");
			player.state = state.player.standard;
		} else {
			Terminal.print("What are you doing? You are not a bird. You cannot go up.");
		}
		return;
	}
	if (['right', 'left'].includes(direction)) {
		Terminal.print(`My ${direction} or your ${direction}?`);
		this.state = (direction === 'right' ? state.terminal.direction_right : state.terminal.direction_left);
		return;
	}

	// Standard movements
	let vector = null;
	let response = null;
	switch (direction) {
		case 'north': case 'south': case 'east': case 'west':
			vector = map.getUnitVectorFromDirection(direction);
			response = `You head ${direction}.`;
			break;
		case 'back':
			vector = player.previous_direction.map(v => -v);
			response = "You go back to where you were.";
			break;
		case 'forward':
			vector = player.previous_direction;
			response = "You continue forward.";
			break;
		default:
			Terminal.print("I don't know that direction.");
			return;
	}
	advance(vector, response);
}

//Apologize after saying 'go away'
Shell.commands['sorry'] = function() {
	Terminal.suppressed = false;
	Terminal.print(randomChoice(["It's okay c:", "I forgive you.", "Yay! Friends again!"]));
}

//Followup to go left/right
Shell.commands['my'] = function() {
	let direction = Terminal.processArgs(arguments);

	if (
		!['left', 'right'].includes(direction) ||
		![state.terminal.direction_left, state.terminal.direction_right].includes(this.state)
	) {
		Terminal.print("What?");
		return;
	}
	if ((this.state == state.terminal.direction_right && direction == "left") ||
		(this.state == state.terminal.direction_left && direction == "right")) {
		Terminal.print("That's not what you said before.");
		return;
	}
	let delta = player.previous_direction.reverse()
		.map(v => v*((direction==="left" && player.previous_direction[1]) ? -1 : 1))
		.map(v => v*((direction==="right" && player.previous_direction[0]) ? -1 : 1));
	// Fun has been had, back to serious business
	this.state = state.terminal.standard;
	advance(delta, `You head to your ${direction}.`);
}

//Followup to go left/right
Shell.commands['your'] = function() {
	let direction = Terminal.processArgs(arguments);
	if (
		(direction == 'left' && this.state == state.terminal.direction_left) ||
		(direction == 'right' && this.state == state.terminal.direction_right)) {
		Terminal.print('I\'m a computer. I have no sense of direction.');
	}	else {
		Terminal.print('What?');
	}
	this.state = state.terminal.standard;
}

//Resets player to full health
Shell.commands['rest'] = function() {
	$('#game').fadeOut(2000, () => {
		Terminal.setPromptActive(false);
		player.rest();
		Terminal.clear();
		$('#game').fadeIn(2000, () => {
			Terminal.print('You feel rested.');
			Terminal.setPromptActive(true);
		});
	});
	$('#gameInfo').fadeOut(2000, () => {
		$('#gameInfo').fadeIn(2000);
	});
}

//Saves player data
Shell.commands['save'] = function() {
	//Write data to save
	if (![state.player.standard, state.player.underground].includes(player.state)) {
		Terminal.print("You can't save right now!");
		return;
	}
	setCookie("player_save", {p:player}, 365);
	// Shops don't currently save
}

//If data exists, load the player
Shell.commands['load'] = function() {
	let obj = checkCookie();
	if (obj == '') {
		Terminal.print("No load data exists yet.");
		return;
	}
	let previous_state = player.state;
	player.load(obj.p);
	// Initialize the map
  //shopList = obj.s.shopList;
	if (previous_state == state.player.dead) {
		Terminal.print("Welcome back from the dead, " + player.name);
	} else {
		Terminal.print("Welcome back, " + player.name);
	}
}

Shell.commands['stats'] = function() {
	currentDisplay = "STATS";
	//Use CLI script to make list formatting
	ui.drawStatsWindow();
	Terminal.print("Stats are available in the top-right window.");
}

// Displays the map in the GameInfo pane
Shell.commands['map'] = function() {
	if (player.state == state.player.underground) {
		Terminal.print("It's too dark to read the map!");
		return;
	}
	if ([
		state.player.standard,
		state.player.fight,
		state.player.shop
	].includes(player.state)) {
		currentDisplay = "MAP";
		ui.drawMap(map);
		Terminal.print("The map is available in the top-right window.");
		return;
	}
	Terminal.print("You can't access the map right now.");
}

Shell.commands['fight'] = function() {
	if (player.state == state.player.dead) {
		Terminal.print("That's what got you into this mess."); return;
	}
	if (player.state == state.player.fight) {
		combat.setUpEncounter(player, npc);
	} else if (isNpcOnTile(player.X, player.Y)) {
    if (npcList[currentNpcIndex].npc == null) {
      npcList[currentNpcIndex].npc = new Npc();
      npcList[currentNpcIndex].npc.createNpc(false);
    }
		combat.setUpEncounter(player, npcList[currentNpcIndex].npc);
    currentNpcIndex = null;
  }	else {
		Terminal.print("Fight what? There's nothing else around.");
	}
}

const inspect_npc = function(npc) {
	let npc_damage = npc.combat_stats.damageRollQty+"d"+npc.combat_stats.damageRollMax;
	if (npc.combat_stats.damageModifier > 0) {
		npc_damage += "+"+npc.combat_stats.damageModifier;
	} else if (npc.combat_stats.damageModifier < 0) {
		npc_damage += "-"+npc.combat_stats.damageModifier;
	}
	if (npc.combat_stats.attackSpeed != 1) {
		npc_damage += " x " + npc.combat_stats.attackSpeed;
	}
	let data = {
		list: {
			'Name':npc.name_mod,
			'Level':npc.level,
			'Health':npc.combat_stats.currentHP + "/" + npc.combat_stats.maxHP,
			'Damage':npc_damage,
			'Defense':npc.combat_stats.defense,
		},
	};
	if (typeof allNpcs[npc.name] !== "undefined") {
		data.display = {
			'Description': allNpcs[npc.name].description,
		}
	}
	return data;
}

Shell.commands['inspect'] = function() {
	if (state.player == state.player.fight) {
		ui.drawNpcInfo(inspect_npc(npc));
		Terminal.print(randomChoice(["Hmm... Interesting.", "Cool!", "Ooh, seems tough.", "Inspect away!"]));
		Terminal.print("What will you do? [Fight/Inspect/Run]");
	} else if (isNpcOnTile(player.X, player.Y)) {
		// If the character hasn't been cached, create it now
    if (npcList[currentNpcIndex].npc == null) {
      npcList[currentNpcIndex].npc = new Npc();
      npcList[currentNpcIndex].npc.createNpc(false);
    }
		// Not a fan of the global npc above or currentNpcIndex here.
		ui.drawNpcInfo(inspect_npc(npcList[currentNpcIndex]));
    Terminal.print("What will you do? [Fight/Inspect/Talk/Leave]");
  }	else {
    Terminal.print("Nothing to inspect");
	}
}

const run_direction = function(direction, response) {
	const can_continue = true;
	Terminal.promptActive = false;
	run_timeout = setTimeout(function() {
		can_continue = advance(direction, response);
		runDirection(direction, "");
	}, 400);
	if (player.state == state.player.fight || !can_continue) {
		clearTimeout(run_timeout);
		Terminal.promptActive = true;
	}
}

Shell.commands['run'] = function() {
	if (player.state == state.player.dead) {
		Terminal.print("You should have done that sooner.");
		return;
	}
	if (player.state == state.player.fight) {
		//Set fight to over
		player.state = state.player.standard;

		Terminal.print(randomChoice(
			["You ran from the " + npc.name_mod + ". Coward.",
			"You valiantly flee from the " + npc.name_mod + ", tail betwixt your legs.",
			"The " + npc.name_mod + " is probably making fun of you to their friends by now.",
			"You barely escape before the " + npc.name_mod + " could hurt you.",
			"Ooh, smart move. You run from the " + npc.name_mod + ".",
			"History will remember of the time that you almost fought the " + npc.name_mod + ".",
			"You ran from the " + npc.name_mod + ". It just wanted to be friends."]));

		ui.resumeDisplay();
		return;
	}
	if (player.state != state.player.standard) {
		Terminal.print("What?");
		return;
	}
	// Move in a direction until an npc is encountered.
	let direction = Terminal.processArgs(arguments);
	if (!['north', 'south', 'east', 'west'].includes(direction)) {
		Terminal.print("I don't know that direction.");
		return;
	}
	run_direction(map.getUnitVectorFromDirection(direction), `You start running ${direction}.`);
}

//Displays the user's inventory
Shell.commands['inv'] = Shell.commands['inventory'] = function() {
	let args = Terminal.processArgs(arguments);
	let invPage = parseInt(args);
	if (isNaN(invPage) || invPage < 1) {
		invPage = 1;
	}
	ui.drawInventoryWindow(invPage);
	Terminal.print("Inventory is available in the top-right window.");
}

//Displays all items currently wielded by player
Shell.commands['wielding'] = Shell.commands['equipped'] = Shell.commands['equipment'] = function(terminal) {
	if (player.state == state.player.start) { return; }
	currentDisplay = "WIELDING";
  if (player.wielding.length == 0)
  {
    Terminal.print("You don't have anything equipped!");
    return;
  }
  ui.drawEquippedWindow();
}

Shell.commands['shop'] = Shell.commands['enter'] = function() {
	if (![state.player.shop, state.player.standard].includes(player.state)) {
		Terminal.print("This is a horrible time to go shopping.");
		return;
	}
	// Scan the world for shops on the tile
	if (player.state == state.player.standard) {
		currentShopIndex = null;
		for (let i in shopList) {
			if (shopList[i].x != player.X || shopList[i].y != player.Y) {
				continue;
			}
			if (shopList[i].shop == null) {
				shopList[i].shop = new Shop(player);
				shopList[i].shop.init();
			}
			currentShopIndex = i;
			restock();
			player.state = state.player.shop;
			Terminal.print("You enter the shop");
			break;
		}
		if (currentShopIndex == null) {
			Terminal.print("There's no shop here.");
			return;
		}
	}
	player.state == state.player.shop && displayShopInfo();
}

// Purchases an object in shop inventory and adds it to player's inventory
// Future: Steal might be an option?
Shell.commands['purchase'] = Shell.commands['buy'] = function() {
	if (player.state != state.player.shop) { Terminal.print("What?"); return }
	let selection = Terminal.processArgs(arguments);
	let selection_index = shopList[currentShopIndex].shop.inventory.getIndexFromPattern(selection);
	if (selection_index == null) {
		Terminal.print("There's nothing here by that name.");
		return;
	} else if (selection_index == -1) {
		Terminal.print("You're going to have to be more specific.");
		return;
	}
	if (selection_index == null) {
		Terminal.print("There's nothing here by that name.");
		return;
	}
	let item = shopList[currentShopIndex].shop.inventory[i];
	if (player.gold < item.cost) {
		Terminal.print("You can't afford that!");
		return;
	}
	player.gold -= item.cost;
	shopList[currentShopIndex].shop.inventory.splice(selection_index, 1);
	player.inventory.push(item);
	Terminal.print("You purchased the " + item.name + " for " + item.cost + " gold.");
	displayShopInfo();
}

// Sells any obtained items back to the shop for 1/2 gold
Shell.commands['sell'] = function() {
	if (player.state != state.player.shop) {
		Terminal.print("Nobody here is interested."); return;
	}
	let selection = Terminal.processArgs(arguments);
	let selection_index = player.wielding.getIndexFromPattern(selection);
	if (selection_index != null) {
		Terminal.print("You can't sell something you're wearing! Take it off first.");
		return;
	}
	selection_index = player.inventory.getIndexFromPattern(selection);
	if (selection_index == null) {
		Terminal.print("You don't have anything by that name.");
		return;
	} else if (selection_index == -1) {
		Terminal.print("You're going to have to be more specific.");
		return;
	}
	let item = player.inventory.splice(selection_index, 1).shift();
	let cost = Math.floor(item.cost / 2);
	shopList[i].shop.inventory.push(item);
	player.gold += cost;
	Terminal.print("You sell the " + item.name + " for " + cost + " gold.");
	displayShopInfo();
}

Shell.commands['leave'] = Shell.commands['exit'] = function() {
	if (player.state != state.player.shop) {
		Terminal.print("But we're having so much fun!")
		Terminal.print("Be sure to save, but you don't need to tell me you're leaving.");
		return;
	}
	Terminal.print("You leave the shop.");
	player.state = state.player.standard;
	Terminal.resetGameInfo();
}

Shell.commands['equip'] = function() {
	// This should be a middleware for a player.equip, honestly
	let selection = Terminal.processArgs(arguments);
	// TODO Use the same behavior as shop, checking for pattern-matched items.
	let selection_index = player.inventory.getIndexFromPattern(selection);
	if (selection_index == null) {
		Terminal.print("You don't have anything by that name worth equipping.");
		return;
	} else if (selection_index == -1) {
		Terminal.print("You're going to have to be more specific.");
		return;
	}
	// Each body part can only have one equipped item; unattach current items before wielding
	for (let i in player.wielding) {
		if (player.wielding[i].type == player.inventory[selection_index].type) {
			continue;
		}
		let old_item = player.wielding.splice(i, 1).shift();
		Terminal.print("You unequip the " + old_item.name + ".");
		break;
	}
	player.wielding.push(player.inventory[selection_index]);
	Terminal.print("You equip the " + player.inventory[selection_index].name + ".");
	player.applyWielding();
	// Update the player stat window when appropriate
	ui.resumeDisplay();
}

Shell.commands['unequip'] = function() {
	if (player.wielding.length == 0) { Terminal.print("Nothing to unequip"); return; }
	let selection = Terminal.processArgs(arguments);
	let selection_index = player.wielding.getIndexFromPattern(selection);
	if (selection_index == null) {
		Terminal.print("You don't have anything by that to unequip.");
		return;
	} else if (selection_index == -1) {
		Terminal.print("You're going to have to be more specific.");
		return;
	}
	let item = player.wielding.splice(selection_index, 1).shift();
	Terminal.print("You unequip the " + item.name + ".");// Update the player stat window when appropriate
	player.applyWielding();
	ui.resumeDisplay();
}

/* Used in quests */
Shell.commands['talk'] = function() {
  /* If current tile has an NPC, talk to it to reveal information */
  if (!isNpcOnTile(player.X, player.Y)) {
    Terminal.print("You're talking to yourself.");
		return;
  }
  Terminal.print("You strike up a conversation");
  if (npcList[currentNpcIndex].npc == null) {
    npcList[currentNpcIndex].npc = new Npc();
    npcList[currentNpcIndex].npc.createNpc(false);
    player.quests[currentNpcIndex] = npcList[currentNpcIndex].npc.quest;
  }
  $("#gameInfo").html(getQuestText());
  updateQuest();
  currentNpcIndex = null;
}