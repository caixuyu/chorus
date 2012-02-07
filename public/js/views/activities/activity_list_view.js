chorus.views.ActivityList = chorus.views.Base.extend({
    className:"activity_list",
    useLoadingSection:true,

    events:{
        "click .morelinks a.more,.morelinks a.less":"toggleCommentList",
        "click .more_activities a":"fetchMoreActivities"
    },

    toggleCommentList:function (event) {
        event.preventDefault();
        $(event.target).closest(".comments").toggleClass("more")
    },

    fetchMoreActivities:function (ev) {
        ev.preventDefault();
        var pageToFetch = parseInt(this.collection.pagination.page) + 1;
        this.collection.fetchPage(pageToFetch, { add:true });
    },

    additionalContext:function () {
        var ctx = {
            headingText:this.options.headingText,
            suppressHeading: this.options.suppressHeading
        };

        if (this.collection.loaded && this.collection.pagination) {
            var page = parseInt(this.collection.pagination.page);
            var total = parseInt(this.collection.pagination.total);
            ctx.showMoreLink = total > page;
        }

        return ctx;
    },

    postRender:function () {
        $(this.el).addClass(this.options.additionalClass);
        var ul = this.$("ul");
        this.collection.each(function (model) {
            var view = new chorus.views.Activity({model:model, displayStyle:this.options.displayStyle});
            ul.append(view.render().el);
        }, this);
    }
});