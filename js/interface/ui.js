function UI() {
 // The object used to handle any specific gameInfo display data
}

UI.prototype.drawMap = function(map) {
  var isShop, isNPC;
  var table = $("<table>");
  table.css("line-height", "4px");
  table.css("font-size", "4px");
  for (var y=-10; y<10; y++)
  {
    var row = $("<tr>");
    for (var x=-20; x<20; x++)
    {
      if (x == 0 && y == 0)
      {
        var player_tile = $('<td>').text(map.customTiles.player.symbol).css("color", map.customTiles.player.style);
        row.append(player_tile);
      } else {
        isShop = false;
        isNPC = false;
        for (var i in shopList)
        {
          if (shopList[i].x == x+player.position[0] && shopList[i].y == y+player.position[1])
          {
            row.append($('<td>').text(map.customTiles.shop.symbol).css("color", map.customTiles.shop.style));
            isShop = true;
            continue;
          }
        }
        for (var i in npcList)
        {
          if (npcList[i].x == x+player.position[0] && npcList[i].y == y+player.position[1])
          {
            row.append($('<td>').text(map.customTiles.npc.symbol).css("color", map.customTiles.npc.color));
            isNPC = true;
            continue;
          }
        }
        if (!isShop && !isNPC)
        {
          var tile = map.getTile(x+player.position[0], y+player.position[1]);
          row.append($('<td>').text(tile.symbol).css("color", tile.style));
        }
      }
    }
    table.append(row);
  }
  mapInfo = "<br>";
  $("#gameInfo").html(table.html() + mapInfo);
}

// Return
UI.prototype.resumeDisplay = function() {
  switch (currentDisplay) {
    case "MAP": this.drawMap(map); break;
    case "STATS": this.drawStatsWindow(); break;
    case "INVENTORY": this.drawInventoryWindow(); break;
    default: Terminal.resetGameInfo();
  }
}

// Print player stats
UI.prototype.drawStatsWindow = function() {
  var statList = $('<ul>');
  var player_damage = player.combat_stats.damageRollQty+"d"+player.combat_stats.damageRollMax;
  if (player.combat_stats.damageModifier > 0) {
    player_damage += "+"+player.combat_stats.damageModifier;
  } else if (player.combat_stats.damageModifier < 0) {
    player_damage += "-"+player.combat_stats.damageModifier;
  }
  if (player.combat_stats.attackSpeed != 1) {
    player_damage += " x " + player.combat_stats.attackSpeed;
  }
	statList.append($('<li>').text("Name: " + player.name));
	statList.append($('<li>').text("Race: " + player.race.charAt(0).toUpperCase() + player.race.slice(1)));
	statList.append($('<li>').text("Class: " + player.playerClass.charAt(0).toUpperCase() + player.playerClass.slice(1)));
	statList.append($('<li>').text("Level: " + player.level));
	statList.append($('<li>').text("Exp Needed: " + player.getExpNeeded()));
	statList.append($('<li>').text("Gold: " + player.gold));
	statList.append($('<li>').text("Health: " + player.combat_stats.currentHP + "/" + player.combat_stats.maxHP));
	statList.append($('<li>').text("Damage: " + player_damage));
	statList.append($('<li>').text("Defense: " + (player.combat_stats.defense)));
	var coord;
	if (player.Y > 0)
		coord = player.Y + "S";
	if (player.Y == 0)
		coord = player.Y;
	if (player.Y < 0)
		coord = (-1*player.Y) + "N";
	coord += ", "
	if (player.X > 0)
		coord += player.X + "E";
	if (player.X == 0)
		coord += player.X;
	if (player.X < 0)
		coord += (-1*player.X) + "W";
	statList.append($('<li>').text("Location: " + coord));
	$("#gameInfo").html("<h3>Player Stats<br><ul>"+statList.html()+"</ul></h3>");
}

// Display the invPage-nth page of the Player's inventory
UI.prototype.drawInventoryWindow = function(invPage) {
  if (typeof invPage === "undefined") { invPage = 1; }
  let display = "<h3>Player Inventory</h3>";
  let invList = $('<ul>');
  if (player.inventory.length == 0) {
    invList.append($("<li>").html("You've got nothing!"));
  }
  // Display 6 items per inventory page
  let page_offset = (invPage-1)*5;
	for (let i = 0; page_offset+i<player.inventory.length && i<6; i++) {
		let page_index = page_offset+i;
    invList.append($('<li>').html(player.inventory[page_index].name + "<br>   " + toString(player.inventory[page_index])));
	}
  display += invList[0].outerHTML;
  $("#gameInfo").html(display);
}

// Display all items the user currently has equippedd
UI.prototype.drawEquippedWindow = function() {
  var equipList = $('<ul>');
  var padding = "        ";
  for (var i = 0; i<player.inventory.length; i++)
  {
    var equip_slots = {'Head':0, 'Neck':0, 'Chest':0, 'Arms':0, 'Legs':0, 'Feet':0, 'Weapon':0}
    for (var i in equip_slots)
    {
      for (var j=0; j<player.wielding.length; j++)
      {
        if (player.wielding[j].type == i || player.wielding[j].type == 'Wield' && i == "Weapon")
        {
          equip_slots[i] = player.wielding[j];
          continue;
        }
      }
      let item_name = "<i>None</i>";
      if (equip_slots[i]) {
        item_name = equip_slots[i].name
      }
      equipList.append($('<li>').html(i + ":" + padding.substr(0, 8-i.length).replace(/ /g, '&nbsp;') + item_name));
    }
  }
	$("#gameInfo").html("<h3>Equipped Items</h3><ul>" + equipList.html());
}

UI.prototype.drawNpcInfo = function(npcData) {
  var statList = $('<ul>');
  for (var i in npcData.list) {
    statList.append($('<li>').text(i + ": " + npcData.list[i]));
  }
  var gameText = "Stats<br><ul>"+statList.html()+"</ul>";
  if (npcData.display !== undefined) {
    gameText += "<br><i>"+npcData.display['Description']+"</i>";
  }
  $("#gameInfo").html("<h3>"+gameText+"</h3>");
}

UI.prototype.drawDefaultView = function() {
  document.getElementById("gameInfo").innerHTML =
	"<h3><pre>                    _   _\n _ __ _ __   __ _  | |_| |__   ___   _ __ _ __   __ _ \n| '__| '_ \\ / _` | | __| '_ \\ / _ \\ | '__| '_ \\ / _` |\n| |  | |_) | (_| | | |_| | | |  __/ | |  | |_) | (_| |\n|_|  | .__/ \\__, |  \\__|_| |_|\\___| |_|  | .__/ \\__, |\n     |_|    |___/                        |_|    |___/ \n</pre></h3>"
	$('#gameInfo').hide().fadeIn(2000);
}

UI.prototype.drawTombstone = function() {
  document.getElementById("gameInfo").innerHTML =
  "<h3><pre>              __.....__\n            .'         ':,\n           /  __  _  __  \\\\\n           | |_)) || |_))||\n           | | \\\\ || |   ||\n           |             ||   _,\n           |             ||.-(_{}\n           |             |/    `\n           |        ,_ (\\;|/)\n         \\\\|       {}_)-,||`\n         \\\\;/,,;;;;;;;,\\\\|//,\n        .;;;;;;;;;;;;;;;;,\n       \\,;;;;;;;;;;;;;;;;,//\n      \\\\;;;;;;;;;;;;;;;;,//\n     ,\\';;;;;;;;;;;;;;;;'\n    ,;;;;;;;;;;;;;;;;''`\n</pre></h3>";
  $('#gameInfo').hide().fadeIn(2000);
}