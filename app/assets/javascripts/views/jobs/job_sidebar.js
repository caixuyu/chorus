chorus.views.JobSidebar = chorus.views.Sidebar.extend({
    constructorName: "JobSidebar",
    templateName:"job_sidebar",

    events: {
        "click a.disable": "disableJob",
        "click a.enable": "enableJob",
        'click a.edit_job': 'launchEditDialog',
        'click a.run_job': 'runJob',
        'click a.delete_job': 'launchDeleteAlert'
    },

    disableJob: function(e) {
        e && e.preventDefault();
        this.model.disable();
    },

    enableJob: function(e) {
        e && e.preventDefault();
        this.model.enable({unprocessableEntity: _.bind(this.launchEditDialog, this)});
    },

    additionalContext: function () {
        return this.model ? {
            enabled: this.model.get('enabled'),
            running: this.model.isRunning()
        } : {};
    },

    launchEditDialog: function (e) {
        e && e.preventDefault();
        new chorus.dialogs.EditJob({model: this.model}).launchModal();
    },

    launchDeleteAlert: function (e) {
        e && e.preventDefault();
        new chorus.alerts.JobDelete({model: this.model}).launchModal();
    },

    runJob: function (e) {
        e && e.preventDefault();
        this.model.run();
    }
});