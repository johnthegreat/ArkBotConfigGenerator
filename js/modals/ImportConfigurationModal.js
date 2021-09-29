/*
 * SPDX-FileCopyrightText: 2021 John Nahlen
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
const ImportConfigurationModal = function(saveCallback) {
	this.element = null;

	const onReceivedElement = function(element) {
		this.element = element;
		this.element.on('hidden.bs.modal',function() {
			this.element.remove();
		}.bind(this));
		this.element.find('#importConfigurationBtn').on('click',function() {
			saveCallback(this.element.find('#configuration').val());
			this.close();
		}.bind(this));
		this.element.on('shown.bs.modal',function() {
			this.element.find('#configuration').get(0).focus();
		}.bind(this));
	}.bind(this);

	this.load = function() {
		return new Promise(function(resolve,reject) {
			$.ajax({
				method: 'get',
				url: 'modals/ImportConfigurationModal.html',
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
}
