/*
 * SPDX-FileCopyrightText: 2021 John Nahlen
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const CreateEditServerModal = function(existingObject,saveCallback) {
	this.element = null;

	const onReceivedElement = function(element) {
		this.element = element;
		this.element.on('hidden.bs.modal',function() {
			this.element.remove();
		}.bind(this));
		this.element.find('#createServerBtn').on('click',function() {
			const serverKey = this.element.find('#serverKey').val();
			const saveFilePath = this.element.find('#saveFilePath').val();
			const ip = this.element.find('#ip').val();
			const queryPort = this.element.find('#queryPort').val();
			const clusterKey = this.element.find('#clusterKey').val();
			const displayAddress = this.element.find('#displayAddress').val();
			const rconPort = this.element.find('#rconPort').val();
			const rconPassword = this.element.find('#rconPassword').val();
			const serverManagementEnabled = this.element.find('#serverManagementEnabled').is(':checked');
			const serverManagementServerExecutablePath = this.element.find('#serverExecutablePath').val();
			const serverManagementServerExecutableArguments = this.element.find('#serverExecutableArguments').val();
			const serverManagementSteamCmdExecutablePath = this.element.find('#steamCmdExecutablePath').val();
			const serverManagementServerInstallDirPath = this.element.find('#serverInstallDirPath').val();
			const serverManagementUsePowershellOutputRedirect = this.element.find('input[name="usePowershellOutputRedirect"]:checked').val() === 'true';
			const disableChatNotifications = this.element.find('input[name="disableChatNotifications"]:checked').val() === 'true';

			saveCallback({
				_id: existingObject !== null ? existingObject._id : null,
				key: serverKey,
				saveFilePath: saveFilePath,
				ip: ip,
				queryPort: queryPort,
				clusterKey: clusterKey,
				displayAddress: displayAddress,
				rconPort: rconPort,
				rconPassword: rconPassword,
				serverManagement: {
					enabled: serverManagementEnabled,
					serverExecutablePath: serverManagementServerExecutablePath,
					serverExecutableArguments: serverManagementServerExecutableArguments,
					steamCmdExecutablePath: serverManagementSteamCmdExecutablePath,
					serverInstallDirPath: serverManagementServerInstallDirPath,
					usePowershellOutputRedirect: serverManagementUsePowershellOutputRedirect
				},
				disableChatNotifications: disableChatNotifications
			});
			this.close();
		}.bind(this));
		this.element.on('shown.bs.modal',function() {
			this.element.find('#serverKey').get(0).focus();
			this.element.find('[data-toggle="tooltip"]').tooltip();
		}.bind(this));

		if (existingObject !== null) {
			this.element.find('#serverKey').val(existingObject.key);
			this.element.find('#saveFilePath').val(existingObject.saveFilePath);
			this.element.find('#ip').val(existingObject.ip);
			this.element.find('#queryPort').val(existingObject.queryPort);
			this.element.find('#clusterKey').val(existingObject.clusterKey);
			this.element.find('#displayAddress').val(existingObject.displayAddress);
			this.element.find('#rconPort').val(existingObject.rconPort);
			this.element.find('#rconPassword').val(existingObject.rconPassword);
			if (existingObject.serverManagement) {
				if (existingObject.serverManagement.enabled) {
					this.element.find('#serverManagementEnabled').prop('checked',true);
				}
				this.element.find('#serverExecutablePath').val(existingObject.serverManagement.serverExecutablePath);
				this.element.find('#serverExecutableArguments').val(existingObject.serverManagement.serverExecutableArguments);
				this.element.find('#steamCmdExecutablePath').val(existingObject.serverManagement.steamCmdExecutablePath);
				this.element.find('#serverInstallDirPath').val(existingObject.serverManagement.serverInstallDirPath);
				this.element.find('input[name="usePowershellOutputRedirect"][value="' + existingObject.serverManagement.usePowershellOutputRedirect + '"]').prop('checked',true);
			}
			this.element.find('input[name="disableChatNotifications"][value="' + existingObject.disableChatNotifications + '"]').prop('checked',true);

			this.element.find('#createServerBtn').text('Update');
			this.element.find('[data-role="mode"]').text('Update');
		}
	}.bind(this);

	this.load = function() {
		return new Promise(function(resolve,reject) {
			$.ajax({
				method: 'get',
				url: 'modals/CreateEditServerModal.html',
				success: function(modalHtml) {
					onReceivedElement($(modalHtml));
					resolve(this.element);
				}.bind(this),
				error: function() {
					reject.apply(this,arguments);
				}.bind(this)
			});
		}.bind(this));
	}.bind(this);

	this.open = function() {
		this.element.modal({});
	}.bind(this);

	this.close = function() {
		this.element.modal('hide');
	}.bind(this);
};
