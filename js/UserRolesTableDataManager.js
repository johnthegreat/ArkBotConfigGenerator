/*
 * SPDX-FileCopyrightText: 2021 John Nahlen
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/* global Handlebars */
const UserRolesTableDataManager = function(element) {
	this.element = element;

	const rowTemplate = Handlebars.compile(`<tr data-id="{{role}}">
				<td>{{role}}</td>
				<td>{{steamIds}}</td>
				<td>
					<button type="button" data-role="editUserRole" class="btn btn-sm btn-default">
						<i class="glyphicon glyphicon-pencil"></i> Edit
					</button>

					<button type="button" data-role="deleteUserRole" class="btn btn-sm btn-danger">
						<i class="glyphicon glyphicon-remove"></i> Delete
					</button>
				</td>
			</tr>`);

	this.addRow = function(row) {
		this.element.find('tbody').append($(rowTemplate(row)));
	}.bind(this);

	this.updateRow = function(rowId, row) {
		this.element.find('tbody > tr[data-id="' + rowId + '"]').html($(rowTemplate(row)).html());
	}.bind(this);

	this.deleteRow = function(rowId) {
		this.element.find('tbody > tr[data-id="' + rowId + '"]').remove();
	}.bind(this);

	this.element.on('click','tr[data-id] button[data-role="editUserRole"]',function(e) {
		const role = $(e.target).closest('tr[data-id]').attr('data-id');
		const userRoles = userRolesByName[role];

		const createEditClusterModal = new CreateEditUserRoleModal(userRoles, function(_userRoles) {
			userRolesByName[role] = _userRoles;
			this.updateRow(role,_userRoles);
			eventEmitter.emit('updateConfig');
		}.bind(this));
		createEditClusterModal.load().then(function() {
			createEditClusterModal.open();
		});
	}.bind(this));

	this.element.on('click','tr[data-id] button[data-role="deleteUserRole"]',function(e) {
		const role = $(e.target).closest('tr[data-id]').attr('data-id');

		const confirmActionModal = new ConfirmActionModal({
			saveCallback: function() {
				delete userRolesByName[role];
				this.deleteRow(role);
				eventEmitter.emit('updateConfig');
			}.bind(this)
		});
		confirmActionModal.load().then(function() {
			confirmActionModal.show();
		});
	}.bind(this));
};
