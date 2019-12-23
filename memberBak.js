/*

	MemberBak
		by Luna Catastrophe
		Created: 12/21/2019
		Latest: 12/22/2019
		Description: Backs up users of a group and restores the backup by sending invites to the backup list.

*/

const { Client, RichEmbed } = require('discord.js');
const Discord = require('discord.js');
const client = new Discord.Client();
const request = require('request');
const fs = require('fs');

const auth = require('./auth.json')

var pre = "mb!"



function helpMenu (msg) {
	msg.channel.send("Help menu goes here");
}

function logMessage (logMsg) {
	// The absolute path of the new file with its name
	var filepath = `memberBak.log`;

	console.log(logMsg);
	fs.appendFile(filepath, `${logMsg}\n`, (err) => {
	    console.log(err);
	    if (err) throw err;
	});
}

function backupFileCreate (msg, memberTags) {
	// The absolute path of the new file with its name
	var filepath = `backups/${msg.guild.name}.txt`;

	fs.writeFile(filepath, memberTags, (err) => {
	    if (err) throw err;

	    logMessage("The file was succesfully saved!");
	});

	// var guild = msg.guild.members.filter(user => !user.bot);
	// logMessage(guild)

	// fs.writeFile(filepath, guild, (err) => {
	//     if (err) throw err;

	//     logMessage("The file was succesfully saved!");
	// });

	return filepath;
}

function backupCreate (msg) {

	// Validate for administrator and server.
	if (msg.member == null) {
		logMessage("Not in a server.");
		msg.reply("This command must be run in a server channel.")
		return;
	} else logMessage("Server.");
	if (!msg.member.hasPermission(8)) {
		logMessage("Not an admin.");
		msg.reply("Only an admin may run this command.")
		return;
	} else logMessage("Admin.");

	memberTags = "";

	// logMessage(members)

	for (const [key, value] of msg.guild.members)
		if (!value.user.bot) memberTags += `${value.user.tag}\n`

	var backupFile = backupFileCreate(msg, memberTags);

	guilds[msg.guild.id] = msg.guild;
	// logMessage("guilds", guilds)

	var embed = new RichEmbed()
		// Set the title of the field
		.setTitle("Member List")
		// Set the color of the embed
		.setColor(0x40e0d0)
		// Set the main content of the embed
		.setDescription(memberTags)
		// Set the file attachment for the backup
		.attachFile(backupFile);
	// Send the embed to the user
	msg.author.send(embed);

	var embed = new RichEmbed()
		// Set the title of the field
		.setTitle("Run this to restore your backup!")
		// Set the color of the embed
		.setColor(0x40e0d0)
		// Set the main content of the embed
		.setDescription(`${pre}backup restore -n ${msg.guild.id}`);
;
	// Send the embed to the user
	msg.author.send(embed);

	var embed = new RichEmbed()
		// Set the title of the field
		.setTitle("Check your DMs!")
		// Set the color of the embed
		.setColor(0x40e0d0)
		// Set the main content of the embed
		.setDescription("You have been sent a message with the member list and a backup file.");
	// Send the embed to the user
	msg.channel.send(embed);
}

function backupRestore (msg, guild = msg.guild.id) {
	// Validate for administrator and server.
	if (msg.member == null) {
		logMessage("Not in a server.");
		msg.reply("This command must be run in a server channel.")
		return;
	} else logMessage("Server.");
	if (!msg.member.hasPermission(8)) {
		logMessage("Not an admin.");
		msg.reply("Only an admin may run this command.")
		return;
	} else logMessage("Admin.");
	if (guilds[guild])
		var members = guilds[guild].members;
	// logMessage(members);
	if (members) {
		const invite = msg.channel.createInvite()
			.then(invite =>	{
				logMessage(`Created an invite with a code of ${invite.code}`);
				members.forEach(element => element.send(
					`${msg.guild.name} has been restored! Here's the invite link!\n\n${invite.url}`)
				);
			})
			.catch(console.error);
	} else {
		logMessage("No backup exists!")
		var embed = new RichEmbed()
			// Set the title of the field
			.setTitle("Error")
			// Set the color of the embed
			.setColor(0x40e0d0)
			// Set the main content of the embed
			.setDescription("No backup exists!");
		// Send the embed to the same channel as the message
		msg.channel.send(embed);
	}
	return;
}

// STARTUP

client.on('ready', () => {
	logMessage(`Logged in as ${client.user.tag}!`);
});


//COMMAND INTERPRETER

client.on('message', msg => {
	// Process command
	if (msg.content.startsWith(pre)) {
		var cmd = msg.content.replace(pre,"")//.split(" ");
		logMessage(`Command received from ${msg.author.tag}: ${cmd}.`);
		if (cmd.length) {
			switch (cmd) {
				case "help":
					helpMenu(msg);
					break;
				case "backup create":
					msg.channel.send("creating backup...")
					backupCreate(msg)
					break;
				case "backup restore":
					msg.channel.send("restoring from backup...")
					backupRestore(msg)
					break;
			}
			if (cmd.startsWith("backup restore -n ")) {
				guildName = cmd.split(" ").splice(3).join(" ")
				console.log(guildName)
				msg.channel.send("restoring from backup...")
				backupRestore(msg, guildName)
			}
		}
	}
});


var guilds = {} // UPDATE THIS TO USE A DATABASE!

client.login(auth.token);


