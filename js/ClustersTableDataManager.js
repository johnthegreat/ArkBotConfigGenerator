/*
 * SPDX-FileCopyrightText: 2021 John Nahlen
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
/* global Handlebars */
const ClustersTableDataManager = function(element) {
	this.element = element;

	const rowTemplate = Handlebars.compile(`<tr data-id="{{_id}}">
				<td>{{clusterKey}}</td>
				<td>{{savePath}}</td>
				<td>
					<button type="button" data-role="editCluster" class="btn btn-sm btn-default">
						<i class="glyphicon glyphicon-pencil"></i> Edit
					</button>

					<button type="button" data-role="cloneCluster" class="btn btn-sm btn-default">
						<i class="glyphicon glyphicon-duplicate"></i> Clone
					</button>

					<button type="button" data-role="deleteCluster" class="btn btn-sm btn-danger">
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

	this.element.on('click','tr[data-id] button[data-role="editCluster"]',function(e) {
		const clusterId = $(e.target).closest('tr[data-id]').attr('data-id');
		const cluster = clustersById[clusterId];

		const createEditClusterModal = new CreateEditClusterModal(cluster, function(_updatedCluster) {
			clustersById[clusterId] = _updatedCluster;
			this.updateRow(clusterId,_updatedCluster);
			eventEmitter.emit('updateConfig');
		}.bind(this));
		createEditClusterModal.load().then(function() {
			createEditClusterModal.open();
		});
	}.bind(this));

	this.element.on('click','tr[data-id] button[data-role="cloneCluster"]',function(e) {
		const clusterId = $(e.target).closest('tr[data-id]').attr('data-id');
		console.log(clusterId);
		const cluster = clustersById[clusterId];
		if (cluster) {
			const newCluster = _.clone(cluster);
			newCluster._id = _clusterId++;
			clustersById[newCluster._id] = newCluster;
			this.addRow(newCluster);
			eventEmitter.emit('updateConfig');
		}
	}.bind(this));

	this.element.on('click','tr[data-id] button[data-role="deleteCluster"]',function(e) {
		const clusterId = $(e.target).closest('tr[data-id]').attr('data-id');

		const confirmActionModal = new ConfirmActionModal({
			saveCallback: function() {
				delete clustersById[clusterId];
				this.deleteRow(clusterId);
				eventEmitter.emit('updateConfig');
			}.bind(this)
		});
		confirmActionModal.load().then(function() {
			confirmActionModal.show();
		});
	}.bind(this));
};
