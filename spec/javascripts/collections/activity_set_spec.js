describe("chorus.collections.ActivitySet", function() {
    beforeEach(function() {
        fixtures.model = 'ActivitySet';
        this.collection = new chorus.collections.ActivitySet([], {
            entityType: "workspace",
            entityId: "45"
        });
    });

    describe("#url", function() {
        context("when the collection has the 'insights' attribute set to true", function() {
            beforeEach(function() {
                this.collection.attributes.insights = true;
            });

            it("returns the url for fetching all insights", function() {
                expect(this.collection.url()).toHaveUrlPath("/edc/commentinsight/");
            });

            context("and the workspace attribute", function() {
                beforeEach(function() {
                    this.collection.attributes.workspace = fixtures.workspace();
                });

                it("includes the workspace id in the url parameters", function() {
                    expect(this.collection.url()).toContainQueryParams({ workspaceId: this.collection.attributes.workspace.get("id") })
                });
            });
        });

        context("when the collection does *not* have the 'insights' attribute", function() {
            it("returns the url for fetching all the activities for the entity", function() {
                expect(this.collection.url()).toHaveUrlPath("/edc/activitystream/workspace/45");
            });
        });
    });
});

