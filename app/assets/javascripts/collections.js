chorus.collections = {
    Base: Backbone.Collection.include(
        chorus.Mixins.Urls,
        chorus.Mixins.Events,
        chorus.Mixins.Fetching,
        chorus.Mixins.ServerErrors
    ).extend({
            constructorName: "Collection",

            initialize: function(models, options) {
                this.attributes = options || {};
                this.setup(arguments);
            },

            clone: function() {
                var clone = this._super('clone');
                clone.attributes = _.clone(this.attributes);
                return clone;
            },

            findWhere: function(attrs) {
                return this.find(function(model) {
                    return _.all(attrs, function(value, key) {
                        return model.get(key) === value;
                    });
                });
            },

            setup: $.noop,

            url: function(options) {
                options = _.extend({
                    per_page: this.per_page !== undefined ? this.per_page : 50,
                    page: 1
                }, options);

                var template = _.isFunction(this.urlTemplate) ? this.urlTemplate(options) : this.urlTemplate;
                var uri = new URI("/" + Handlebars.compile(template, {noEscape: true})(this.attributes));

                if (this.urlParams) {
                    var params = _.isFunction(this.urlParams) ? this.urlParams(options) : this.urlParams;
                    uri.addSearch(this.underscoreKeys(params));
                }

                uri.addSearch({
                    page: options.page,
                    per_page: options.per_page
                });

                if (options.order) {
                    uri.addSearch({
                        order: _.underscored(options.order)
                    });
                }

                if (this.order) {
                    uri.addSearch({
                        order: _.underscored(this.order)
                    });
                }

                // this ensures that IE doesn't cache 'needs_login' responses
                if (!window.jasmine) {
                    uri.addSearch({iebuster: chorus.cachebuster()});
                }

                return uri.toString();
            },

            isDeleted: function() {
                return false;
            },

            shouldTriggerImmediately: function(eventName) {
                if (eventName === "loaded") {
                    return this.loaded;
                }

                return false;
            },

            fetchPage: function(page, options) {
                if (options && options.per_page !== undefined) {
                    this.per_page = options.per_page;
                    delete options.per_page;
                }
                var url = this.url({ page: page });
                options = _.extend({}, options, { url: url });
                this.fetch(options);
                this.trigger("paginate");
            },

            fetchAll: (function() {
                var fetchPage = function(page) {
                    var self = this;
                    this.fetch({
                        url: this.url({ page: page, per_page: 1000 }),
                        silent: true,
                        update: page !== 1,
                        remove: false,
                        success: function(collection, data, xhr) {
                            var total = data.pagination ? parseInt(data.pagination.total, 10) : 1;
                            var page = data.pagination ? parseInt(data.pagination.page, 10) : 1;
                            if (page >= total) {
                                collection.trigger("reset", collection);
                                collection.trigger("loaded");
                            } else {
                                collection.loaded = false;
                                fetchPage.call(collection, page + 1);
                            }
                        },
                        error: function(collection) {
                            collection.trigger("reset", collection);
                            collection.trigger("loaded");
                        }
                    });
                };

                return function() {
                    fetchPage.call(this, 1);
                };
            })(),

            totalRecordCount: function() {
                return (this.pagination && this.pagination.records) || this.models.length;
            },

            sortDesc: function(idx) {
                // Not used. We only do ascending sort for now.
                this._sort(idx, "desc");
            },

            sortAsc: function(idx) {
                // We only support ascending sort at the moment.
                this._sort(idx, "asc");
            },

            saveTags: function(options) {
                this.each(function (model) {
                    model.tags().save(options);
                });
            },

            remove: function (models, options) {
                var i, l, index, model;
                options || (options = {});
                models = _.isArray(models) ? models.slice() : [models];
                for (i = 0, l = models.length; i < l; i++) {
                    model = this.get(models[i]);
                    if (!model) continue;
                    delete this._byId[model.id];
                    delete this._byCid[model.cid];
                    index = this.indexOf(model);
                    this.models.splice(index, 1);
                    this.length--;
                    if(this.pagination) this.pagination.records--;
                    if (!options.silent) {
                        options.index = index;
                        model.trigger('remove', model, this, options);
                    }
                    this._removeReference(model);
                }
                return this;
            },

            _prepareModel: function() {
                var model = this._super("_prepareModel", arguments);
                this.attributes || (this.attributes = {});
                if (_.isFunction(this.modelAdded)) this.modelAdded(model);
                return model;
            },

            _sort: function(idx, order) {
                // order argument not used at this time. We only support ascending sort for now.
                this.order = idx;
            }
        })
};
chorus.collections.Base.extend = chorus.classExtend;

chorus.collections.LastFetchWins = chorus.collections.Base.extend({
    lastFetchId: 0,

    makeSuccessFunction: function(options, success) {
        var fetchId = ++this.lastFetchId;
        return _.bind(function(collection, data) {
            if (fetchId !== this.lastFetchId) return;
            var parentFunction = this._super("makeSuccessFunction", [options || {}, success]);
            return parentFunction(collection, data);
        }, this);
    }
});