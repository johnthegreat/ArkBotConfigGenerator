/*
 * SPDX-FileCopyrightText: 2021 John Nahlen
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const CreateEditClusterModal = function(existingObject, saveCallback) {
	this.element = null;

	const onReceivedElement = function(element) {
		this.element = element;
		this.element.on('hidden.bs.modal',function() {
			this.element.remove();
		}.bind(this));
		this.element.find('#createClusterBtn').on('click',function() {
			const clusterKey = this.element.find('#modalClusterKey').val();
			const savePath = this.element.find('#modalSavePath').val();

			const returnObject = {};
			if (existingObject !== null) {
				returnObject._id = existingObject._id;
			}
			returnObject.clusterKey = clusterKey;
			returnObject.savePath = savePath;
			saveCallback(returnObject);
			this.close();
		}.bind(this));
		this.element.on('shown.bs.modal',function() {
			this.element.find('#modalClusterKey').get(0).focus();
			this.element.find('[data-toggle="tooltip"]').tooltip();
		}.bind(this));

		if (existingObject !== null) {
			this.element.find('#modalClusterKey').val(existingObject.clusterKey);
			this.element.find('#modalSavePath').val(existingObject.savePath);

			this.element.find('#createClusterBtn').text('Update');
			this.element.find('[data-role="mode"]').text('Update');
		}
	}.bind(this);

	this.load = function() {
		return new Promise(function(resolve,reject) {
			$.ajax({
				method: 'get',
				url: 'modals/CreateEditClusterModal.html',
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
