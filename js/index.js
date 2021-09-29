/*
 * SPDX-FileCopyrightText: 2021 John Nahlen
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
let clustersById = {};
let serversById = {};
let _clusterId = 1;
let _serverId = 1;
let userRolesByName = {};
let clusterTableDataManager;
let serverTableDataManager;
let userRolesTableDataManager;

const eventEmitter = new EventEmitter();

function getClusters() {
	return _.values(_.map(_.cloneDeep(clustersById),function(cluster) {
		// Delete _id, was for internal use only
		delete cluster._id;
		// Use 'key' instead of 'clusterKey'
		cluster.key = cluster.clusterKey;
		delete cluster.clusterKey;
		return cluster;
	}));
}

function getServers() {
	return _.values(_.map(_.cloneDeep(serversById),function(server) {
		delete server._id;
		return server;
	}));
}

let configObject = {
	"botName": "",
	"botUrl": "",
	"appUrl": "",
	"tempFileOutputDirPath": "",
	"steamApiKey": "",
	"discord": {
		"discordBotEnabled": false,
		"botToken": "",
		"enabledChannels": [],
		"infoTopicChannel": "",
		"announcementChannel": "",
		"memberRoleName": "",
		"disableDeveloperFetchSaveData": false,
		"accessControl": {
			"channels": {
				"public": ["@everyone", "admin", "developer"],
				"private": ["@everyone", "admin", "developer"]
			},
			"commands": {
				"admin": ["admin", "developer"],
				"cloud": ["admin", "developer"],
				"rcon": ["admin", "developer"],
				"debug": ["developer"],
				"commands": ["@everyone"],
				"version": ["@everyone"],
				"servers": ["@everyone"],
				"linksteam": ["@everyone"],
				"unlinksteam": ["@everyone"],
				"whoami": ["@everyone"],
				"disabled": ["@everyone"]
			}
		},
		"steamOpenIdRelyingServiceListenPrefix": "http://+:60002/openid/",
		"steamOpenIdRedirectUri": ""
	},
	"userRoles": [
		{
			"role": "admin",
			"steamIds": []
		}
	],
	"accessControl": {
		"pages": {
			"home": ["guest"],
			"server": ["guest"],
			"player": ["self", "admin"],
			"admin-server": ["admin"]
		},
		"home": {
			"myprofile": ["user"],
			"serverlist": ["guest"],
			"serverdetails": ["guest"],
			"online": ["guest"],
			"externalresources": ["guest"]
		},
		"server": {
			"players": ["guest"],
			"tribes": ["guest"],
			"wildcreatures": ["admin"],
			"wildcreatures-basestats": ["admin"],
			"wildcreatures-ids": ["admin"],
			"wildcreatures-statistics": ["admin"]
		},
		"player": {
			"profile": ["guest"],
			"profile-detailed": ["self", "admin"],
			"creatures": ["guest"],
			"creatures-basestats": ["self", "admin"],
			"creatures-ids": ["admin"],
			"creatures-cloud": ["guest"],
			"breeding": ["self", "admin"],
			"crops": ["self", "admin"],
			"generators": ["self", "admin"],
			"kibbles-eggs": ["self", "admin"],
			"tribelog": ["self", "admin"]
		},
		"admin-server": {
			"players": ["admin"],
			"tribes": ["admin"],
			"structures": ["admin"],
			"structures-rcon": ["disabled"]
		}
	},
	"backups": {
		"backupsEnabled": false,
		"backupsDirectoryPath": ""
	},
	"webApiListenPrefix": "http://+:60001/",
	"webAppListenPrefix": "http://+:80/",
	"webAppRedirectListenPrefix": [
	],
	"powershellFilePath": "",
	"useCompatibilityChangeWatcher": true,
	"ssl": {
		"enabled": false,
		"challengeListenPrefix": "",
		"name": "",
		"password": "",
		"email": "",
		"domains": [
		],
		"ports": [],
		"useCompatibilityNonSNIBindings": true
	},
	"arkMultipliers": {
		"eggHatchSpeedMultiplier": 1.0,
		"babyMatureSpeedMultiplier": 1.0,
		"cuddleIntervalMultiplier": 1.0
	},
	"savegameExtractionMaxDegreeOfParallelism": null,
	"anonymizeWebApiData": false,
	"discordLogLevel": "",
	"servers": [],
	"clusters": []
};

function getUpdatedConfigFromDOM() {
	// Update config object from the DOM

	configObject['steamApiKey'] = $('#steamApiKey').val();
	configObject['botName'] = $('#botName').val();
	configObject['botUrl'] = $('#botUrl').val();
	configObject['appUrl'] = $('#appUrl').val();

	const isDiscordEnabled = $('#discordEnabled').is(":checked");
	configObject['discord']['discordBotEnabled'] = isDiscordEnabled;
	if (isDiscordEnabled) {
		configObject['discord']['botToken'] = $('#botToken').val();
		configObject['discord']['enabledChannels'] = $('input[name="discordEnabledChannel[]"]').get().map(function(e) {
			return $(e).val();
		}).filter(function(val) {
			return val !== "";
		});
		configObject['discord']['infoTopicChannel'] = $('#discordInfoTopicChannel').val();
		configObject['discord']['announcementChannel'] = $('#discordAnnouncementChannel').val();
		configObject['discord']['memberRoleName'] = $('#discordMemberRoleName').val();
		configObject['discord']['disableDeveloperFetchSaveData'] = $('input[name="disableDeveloperFetchSaveData"]:checked').val() === "true";
		configObject['discord']['steamOpenIdRelyingServiceListenPrefix'] = $('#steamOpenIdRelyingServiceListenPrefix').val();
		configObject['discord']['steamOpenIdRedirectUri'] = $('#steamOpenIdRedirectUri').val();
	}
	configObject['discordLogLevel'] = $('#discordLogLevel').val();

	const isBackupsEnabled = $('#backupsEnabled').is(':checked');
	configObject['backups']['backupsEnabled'] = isBackupsEnabled;
	if (isBackupsEnabled) {
		configObject['backups']['backupsDirectoryPath'] = $('#backupsDirectoryPath').val();
	}

	configObject['webApiListenPrefix'] = $('#webApiListenPrefix').val();
	configObject['webAppListenPrefix'] = $('#webAppListenPrefix').val();
	configObject['webAppRedirectListenPrefix'] = $('input[name="webAppRedirectListenPrefix[]"]').get().map(function(e) {
		return $(e).val();
	}).filter(function(val) {
		return val !== "";
	});

	const isSSLEnabled = $('#sslEnabled').is(':checked');
	configObject['ssl']['enabled'] = isSSLEnabled;
	if (isSSLEnabled) {
		configObject['ssl']['challengeListenPrefix'] = $('#challengeListenPrefix').val();
		configObject['ssl']['name'] = $('#sslName').val();
		configObject['ssl']['password'] = $('#sslPassword').val();
		configObject['ssl']['email'] = $('#sslEmail').val();
		configObject['ssl']['domains'] = $('input[name="sslDomains[]"]').get().map(function(e) {
			return $(e).val();
		}).filter(function(val) {
			return val !== "";
		});
		configObject['ssl']['ports'] = $('input[name="sslPorts[]"]').get().map(function(e) {
			return $(e).val();
		}).filter(function(val) {
			return val !== "";
		});
		configObject['ssl']['useCompatibilityNonSNIBindings'] = $('input[name="useCompatibilityNonSNIBindings"]:checked').val() === "true";
	}

	configObject['powershellFilePath'] = $('#powershellFilePath').val();
	configObject['useCompatibilityChangeWatcher'] = $('input[name="useCompatibilityChangeWatcher"]:checked').val() === "true";
	configObject['savegameExtractionMaxDegreeOfParallelism'] = $('#savegameExtractionMaxDegreeOfParallelism').val();
	configObject['anonymizeWebApiData'] = $('input[name="anonymizeWebApiData"]:checked').val() === "true";
	configObject['arkMultipliers']['eggHatchSpeedMultiplier'] = $('#eggHatchSpeedMultiplier').val();
	configObject['arkMultipliers']['babyMatureSpeedMultiplier'] = $('#babyMatureSpeedMultiplier').val();
	configObject['arkMultipliers']['cuddleIntervalMultiplier'] = $('#cuddleIntervalMultiplier').val();
	configObject['tempFileOutputDirPath'] = $('#tempFileOutputDirPath').val();
	configObject['clusters'] = getClusters();
	configObject['servers'] = getServers();
	configObject['userRoles'] = Object.values(userRolesByName);
	return configObject;
}

function updateDOMFromConfig(config) {
	// Update DOM from the config object.

	$('#steamApiKey').val(config['steamApiKey']);
	$('#botName').val(config['botName']);
	$('#botUrl').val(config['botUrl']);
	$('#appUrl').val(config['appUrl']);

	if (config['discord']) {
		if (config['discord']['discordBotEnabled'] === true) {
			$('#discordEnabled').prop(checked, true);
		}

		$('#botToken').val(config['discord']['botToken']);
		if (_.isArray(config['discord']['enabledChannels'])) {
			config['discord']['enabledChannels'].forEach(function(enabledChannel) {
				if (_.isString(enabledChannel)) {
					$newField = addDiscordEnabledChannelField();
					$newField.val(enabledChannel);
				}
			});
		}
		$('#discordInfoTopicChannel').val(config['discord']['infoTopicChannel']);
		$('#discordAnnouncementChannel').val(config['discord']['announcementChannel']);
		$('#discordMemberRoleName').val(config['discord']['memberRoleName']);
		$('#steamOpenIdRelyingServiceListenPrefix').val(config['discord']['steamOpenIdRelyingServiceListenPrefix']);
		$('#steamOpenIdRedirectUri').val(config['discord']['steamOpenIdRedirectUri']);
		$('#discordLogLevel').val(config['discordLogLevel']);
	}

	if (config['backups']) {
		if (config['backups']['backupsEnabled'] === true) {
			$('#backupsEnabled').prop('checked',true);
		}

		$('#backupsDirectoryPath').val(config['backups']['backupsDirectoryPath']);
	}

	$('#webApiListenPrefix').val(config['webApiListenPrefix']);
	$('#webAppListenPrefix').val(config['webAppListenPrefix']);
	/*config['webAppRedirectListenPrefix'] = $('input[name="webAppRedirectListenPrefix[]"]').get().map(function(e) {
		return $(e).val();
	});*/

	if (config['ssl']) {
		if (config['ssl']['enabled'] === true) {
			$('#sslEnabled').prop('checked',true);
		}

		$('#challengeListenPrefix').val(config['ssl']['challengeListenPrefix']);
		$('#sslName').val(config['ssl']['name']);
		$('#sslPassword').val(config['ssl']['password']);
		$('#sslEmail').val(config['ssl']['email']);

		if (_.isArray(config['ssl']['domains'])) {
			config['ssl']['domains'].forEach(function(sslDomain) {
				if (_.isString(sslDomain)) {
					const $field = addSSLDomainField();
					$field.val(sslDomain);
				}
			});
		}

		if (_.isArray(config['ssl']['ports'])) {
			config['ssl']['ports'].forEach(function(sslPort) {
				const $field = addSSLPortField();
				$field.val(sslPort);
			});
		}

		$('input[name="useCompatibilityNonSNIBindings"][value="' + config['ssl']['useCompatibilityNonSNIBindings'] + '"]').prop('checked',true);
	}

	$('#powershellFilePath').val(config['powershellFilePath']);
	$('input[name="useCompatibilityChangeWatcher"][value="' + config['useCompatibilityChangeWatcher'] + '"]').prop('checked',true);
	$('#savegameExtractionMaxDegreeOfParallelism').val(config['savegameExtractionMaxDegreeOfParallelism']);
	$('input[name="anonymizeWebApiData"][value="' + config['anonymizeWebApiData'] + '"]').prop('checked',true);
	if (config['arkMultipliers']) {
		$('#eggHatchSpeedMultiplier').val(config['arkMultipliers']['eggHatchSpeedMultiplier']);
		$('#babyMatureSpeedMultiplier').val(config['arkMultipliers']['babyMatureSpeedMultiplier']);
		$('#cuddleIntervalMultiplier').val(config['arkMultipliers']['cuddleIntervalMultiplier']);
	}
	$('#tempFileOutputDirPath').val(config['tempFileOutputDirPath']);

	//config['clusters'] = getClusters();
	//config['servers'] = getServers();
}

function addDiscordEnabledChannelField() {
	const $nextEnabledChannelInput = $('input[name="discordEnabledChannel[]"]:eq(0)').clone().val('');
	$('#discordEnabledChannelContainer').append($nextEnabledChannelInput);
	$nextEnabledChannelInput.get(0).focus();
	return $nextEnabledChannelInput;
}

function addSSLDomainField() {
	const $el = $('input[name="sslDomains[]"]:eq(0)').clone().val('');
	$('#sslDomainsContainer').append($el);
	$el.get(0).focus();
	return $el;
}

function addSSLPortField() {
	const $el = $('input[name="sslPorts[]"]:eq(0)').clone().val('');
	$('#sslPortsContainer').append($el);
	$el.get(0).focus();
	return $el;
}

function addWebAppRedirectListenPrefixField() {
	const $el = $('input[name="webAppRedirectListenPrefix[]"]:eq(0)').clone().val('');
	$('#webAppRedirectListenPrefixContainer').append($el);
	$el.get(0).focus();
	return $el;
}

$(function() {
	$('[data-toggle="tooltip"]').tooltip();

	const clipboard = new ClipboardJS('#copyToClipboardBtn');

	const $generatedConfig = $("#generatedConfig");
	const updateGeneratedConfig = function(newConfig) {
		$generatedConfig.text(JSON.stringify(configObject, null, 4));
	};

	eventEmitter.on('updateConfig',function() {
		updateGeneratedConfig(getUpdatedConfigFromDOM());
	});

	$('#collapseSteam, #collapseBotConfig, #collapseDiscord, #collapseUserRoles, #collapseAccessControl, #collapseBackups, #collapseWebAppConfig, #collapseMiscellaneous, #collapseClusters, #collapseServers').on('hide.bs.collapse', function(e) {
		const $i = $(e.target).siblings().find('a[data-toggle="collapse"] i[data-role="icon"]');
		$i.removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
	}).on('show.bs.collapse', function(e) {
		const $i = $(e.target).siblings().find('a[data-toggle="collapse"] i[data-role="icon"]');
		$i.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
	});

	clusterTableDataManager = new ClustersTableDataManager($('#clustersTable'));
	serverTableDataManager = new ServersTableDataManager($('#serversTable'));
	userRolesTableDataManager = new UserRolesTableDataManager($('#userRolesTable'));

	$('#discordEnabled').on('change',function(e) {
		const $sels = $('#botToken, input[name="discordEnabledChannel[]"], #discordInfoTopicChannel, #discordAnnouncementChannel, #discordMemberRoleName, input[name="disableDeveloperFetchSaveData"], #steamOpenIdRelyingServiceListenPrefix, #steamOpenIdRedirectUri, #discordLogLevel, #addDiscordEnabledChannelsBtn');
		if ($(e.target).is(":checked")) {
			$sels.removeAttr('disabled');
		} else {
			$sels.attr('disabled','disabled');
		}
	}).trigger('change');

	$('#backupsEnabled').on('change',function(e) {
		if ($(e.target).is(":checked")) {
			$('#backupsDirectoryPath').removeAttr('disabled');
		} else {
			$('#backupsDirectoryPath').attr('disabled','disabled');
		}
	}).trigger('change');

	$('#sslEnabled').on('change',function(e) {
		const $sels = $('#challengeListenPrefix, #sslName, #sslPassword, #sslEmail, input[name="sslDomains[]"], input[name="sslPorts[]"], input[name="useCompatibilityNonSNIBindings"], #addSSLDomainsBtn, #addSSLPortsBtn');
		if ($(e.target).is(":checked")) {
			$sels.removeAttr('disabled');
		} else {
			$sels.attr('disabled','disabled');
		}
	}).trigger('change');

	$('#addDiscordEnabledChannelsBtn').on('click',function() {
		addDiscordEnabledChannelField();
	});

	$('#addSSLDomainsBtn').on('click',function() {
		addSSLDomainField();
	});

	$('#addSSLPortsBtn').on('click',function() {
		addSSLPortField();
	});

	$('#addWebAppRedirectListenPrefixBtn').on('click',function() {
		addWebAppRedirectListenPrefixField();
	});

	$('#addUserRoleBtn').on('click',function() {
		const createEditUserRoleModal = new CreateEditUserRoleModal(null, function(userRole) {
			console.log(userRole);
			userRolesByName[userRole.role] = userRole;
			userRolesTableDataManager.addRow(userRole);
			eventEmitter.emit('updateConfig');
		});
		createEditUserRoleModal.load().then(function() {
			createEditUserRoleModal.open();
		});
	});

	$('#addClusterBtn').on('click', function() {
		const createEditClusterModal = new CreateEditClusterModal(null,function(cluster) {
			cluster._id = _clusterId++;
			clustersById[cluster._id] = cluster;
			clusterTableDataManager.addRow(cluster);
			eventEmitter.emit('updateConfig');
		});
		createEditClusterModal.load().then(function() {
			createEditClusterModal.open();
		});
	});

	$("#addServerBtn").on("click", function() {
		const createEditServerModal = new CreateEditServerModal(null, function(server) {
			server._id = _serverId++;
			serversById[server._id] = server;
			serverTableDataManager.addRow(server);
		});
		createEditServerModal.load().then(function() {
			createEditServerModal.open();
		});
	});

	$("#generateConfigurationButton").on("click", function() {
		configObject = getUpdatedConfigFromDOM();
		updateGeneratedConfig(configObject);
		// Scroll the config into view
		$generatedConfig.get(0).scrollIntoView();
	});

	$(document).on('input','input, select',function() {
		configObject = getUpdatedConfigFromDOM();
		updateGeneratedConfig(configObject);
	});

	$('#importConfigButton').on('click',function() {
		const importConfigurationModal = new ImportConfigurationModal(function(configText) {
			let configObject = {};
			try {
				configObject = JSON.parse(configText);
			} catch (err) {
				console.log('Invalid JSON.');
				console.error(err);
			}

			updateDOMFromConfig(configObject);
			updateGeneratedConfig(configObject);
		});
		importConfigurationModal.load().then(function() {
			importConfigurationModal.open();
		});
	});

	updateGeneratedConfig(configObject);
});
