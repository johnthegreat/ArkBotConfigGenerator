/*
 * SPDX-FileCopyrightText: 2021 John Nahlen
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const ServersTableDataManager = function(element) {
	this.element = element;

	const rowTemplate = Handlebars.compile(`
				<tr data-id="{{_id}}">
					<td>{{key}}</td>
					<td>{{saveFilePath}}</td>
					<td>{{ip}}</td>
					<td>{{queryPort}}</td>
					<td>{{clusterKey}}</td>
					<td>{{displayAddress}}</td>
					<td>{{rconPort}}</td>
					<td>{{rconPassword}}</td>
					<td>{{serverManagement.enabled}}</td>
					<td>{{serverManagement.serverExecutablePath}}</td>
					<td>{{serverManagement.serverExecutableArguments}}</td>
					<td>{{serverManagement.steamCmdExecutablePath}}</td>
					<td>{{serverManagement.serverInstallDirPath}}</td>
					<td>{{serverManagement.usePowershellOutputRedirect}}</td>
					<td>{{disableChatNotifications}}</td>
					<td>
						<button type="button" data-role="editServer" class="btn btn-sm btn-default">
							<i class="glyphicon glyphicon-pencil"></i> Edit
						</button>

						<button type="button" data-role="cloneServer" class="btn btn-sm btn-default">
							<i class="glyphicon glyphicon-duplicate"></i> Clone
						</button>

						<button type="button" data-role="deleteServer" class="btn btn-sm btn-danger">
							<i class="glyphicon glyphicon-remove"></i> Delete
						</button>
					</td>
				</tr>
			`);

	this.addRow = function(row) {
		this.element.find('tbody').append(rowTemplate(row));
	}.bind(this);

	this.updateRow = function(rowId, row) {
		this.element.find('tbody > tr[data-id="' + rowId + '"]').html($(rowTemplate(row)).html());
	}.bind(this);

	this.deleteRow = function(rowId) {
		this.element.find('tbody > tr[data-id="' + rowId + '"]').remove();
	}.bind(this);

	this.element.on('click','tr[data-id] button[data-role="editServer"]',function(e) {
		const serverId = $(e.target).closest('tr[data-id]').attr('data-id');
		const server = serversById[serverId];
		const createEditServerModal = new CreateEditServerModal(server, function(_updatedServer) {
			serversById[_updatedServer._id] = _updatedServer;
			this.updateRow(_updatedServer._id, _updatedServer);
			eventEmitter.emit('updateConfig');
		}.bind(this));
		createEditServerModal.load().then(function() {
			createEditServerModal.open();
		});
	}.bind(this));

	this.element.on('click','tr[data-id] button[data-role="cloneServer"]',function(e) {
		const serverId = $(e.target).closest('tr[data-id]').attr('data-id');
		console.log(serverId);
		const server = serversById[serverId];
		if (server) {
			const newServer = _.clone(server);
			newServer._id = _serverId++;
			serversById[newServer._id] = newServer;
			this.addRow(newServer);
			eventEmitter.emit('updateConfig');
		}
	}.bind(this));

	this.element.on('click','tr[data-id] button[data-role="deleteServer"]',function(e) {
		const serverId = $(e.target).closest('tr[data-id]').attr('data-id');

		const confirmActionModal = new ConfirmActionModal({
			saveCallback: function() {
				delete serversById[serverId];
				this.deleteRow(serverId);
				eventEmitter.emit('updateConfig');
			}.bind(this)
		});
		confirmActionModal.load().then(function() {
			confirmActionModal.show();
		});
	}.bind(this));
};
