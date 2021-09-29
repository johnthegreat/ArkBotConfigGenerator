/*
 * SPDX-FileCopyrightText: 2021 John Nahlen
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const CreateEditUserRoleModal = function(existingObject,saveCallback) {
	this.element = null;

	const addSteamIdField = function() {
		const $el = this.element.find('input[name="steamIds[]"]:eq(0)').clone().val('');
		this.element.find('#steamIdContainer').append($el);
		$el.get(0).focus();
		return $el;
	}.bind(this);

	const onReceivedElement = function(element) {
		this.element = element;
		this.element.on('hidden.bs.modal',function() {
			this.element.remove();
		}.bind(this));
		this.element.find('#modalCreateUserRoleBtn').on('click',function() {
			const returnObject = {};
			if (existingObject !== null) {
				returnObject._id = existingObject._id;
			}
			returnObject.role = this.element.find('#userRole').val();
			returnObject.steamIds = this.element.find('input[name="steamIds[]"]').get().map(function(e) {
				return $(e).val();
			}).filter(function(val) {
				return val !== "";
			});
			saveCallback(returnObject);
			this.close();
		}.bind(this));
		this.element.find('#addSteamIdBtn').on('click',function() {
			addSteamIdField();
		});
		this.element.on('shown.bs.modal',function() {
			this.element.find('#userRole').get(0).focus();
			this.element.find('[data-toggle="tooltip"]').tooltip();
		}.bind(this));

		if (existingObject !== null) {
			this.element.find('#userRole').val(existingObject.role);

			if (_.isArray(existingObject.steamIds) && existingObject.steamIds.length > 0) {
				this.element.find('input[name="steamIds[]"]:eq(0)').val(existingObject.steamIds[0]);
				for(let i=1;i<existingObject.steamIds.length;i++) {
					const $field = addSteamIdField();
					$field.val(existingObject.steamIds[i]);
				}
			}

			this.element.find('#modalCreateUserRoleBtn').text('Update');
			this.element.find('[data-role="mode"]').text('Update');
		}
	}.bind(this);

	this.load = function() {
		return new Promise(function(resolve,reject) {
			$.ajax({
				method: 'get',
				url: 'modals/CreateEditUserRoleModal.html',
				success: function(modalHtml) {
					onReceivedElement($(modalHtml));
					resolve(this.element);
				}.bind(this),
				error: function() {
					reject.apply(this,arguments);
				}.bind(this)
			});
		});
	};

	this.open = function() {
		this.element.modal({});
	}.bind(this);

	this.close = function() {
		this.element.modal('hide');
	}.bind(this);
};
