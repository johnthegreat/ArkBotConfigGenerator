/*
 * SPDX-FileCopyrightText: 2021 John Nahlen
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/* global _, $ */
function ConfirmActionModal(opts) {
	opts = _.extend({
		title: 'Are you sure?',
		message: 'Are you sure you wish to continue?',
		saveCallback: _.noop
	},opts);
	this.element = null;

	this.load = function() {
		return new Promise(function(resolve, reject) {
			if (ConfirmActionModal.modalHtml === null) {
				$.ajax({
					method: 'get',
					url: 'modals/ConfirmActionModal.html',
					success: function(modalHtml) {
						ConfirmActionModal.modalHtml = modalHtml;
						this.element = $(_.clone(modalHtml));
						this.init();
						resolve();
					}.bind(this),
					error: function() {
						reject.apply(this,arguments);
					}.bind(this)
				});
			} else {
				this.element = $(_.clone(ConfirmActionModal.modalHtml));
				this.init();
				resolve();
			}
		}.bind(this));
	}.bind(this);

	this.init = function() {
		this.element.on('hidden.bs.modal',function() {
			this.element.remove();
		}.bind(this));

		this.element.find('[data-dismiss="modal"]').on('click',function() {
			this.hide();
		}.bind(this));

		this.element.find('#confirmBtn').on('click',function() {
			this.hide();
			if (_.isFunction(opts.saveCallback)) {
				opts.saveCallback();
			}
		}.bind(this));

		this.element.find('h4.modal-title').text(opts.title);
		this.element.find('div.modal-body > p').text(opts.message);
	}.bind(this);

	this.show = function() {
		$(this.element).modal();
	}.bind(this);

	this.hide = function() {
		$(this.element).modal('hide');
	};
}
ConfirmActionModal.modalHtml = null;
