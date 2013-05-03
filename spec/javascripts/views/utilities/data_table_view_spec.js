describe("chorus.views.DataTable", function() {
    beforeEach(function() {
        this.task = rspecFixtures.dataPreviewTaskResults({
            columns: [
                { name: "id", typeCategory: "WHOLE_NUMBER" },
                { name: "city", typeCategory: "OTHER" },
                { name: "state", typeCategory: "OTHER" },
                { name: "zip", typeCategory: "OTHER" }
            ],
            rows: [
                [1, "Oakland", "CA", "94612"],
                [2, "Arcata", "CA", "95521"] ,
                [3, "Lafayette", "IN", null]
            ]
        });

        this.view = new chorus.views.DataTable({ model: this.task });
    });

    describe("falsy data", function() {
        it("outputs a string 0 for a numeric 0", function() {
            this.task.get("rows")[0] = [0];
            this.view.render();

            expect(this.view.$(".slick-row:eq(0) .slick-cell:eq(0)").text()).toBe("0");
        });

        it("outputs a string false for a boolean false", function() {
            this.task.get("rows")[0] = [false];
            this.view.render();

            expect(this.view.$(".slick-row:eq(0) .slick-cell:eq(0)").text()).toBe("false");
        });

        it("outputs empty string for a null", function() {
            this.task.get("rows")[0] = [null];
            this.view.render();

            expect(this.view.$(".slick-row:eq(0) .slick-cell:eq(0)").html()).toBe("");
        });
    });

    describe("#render", function() {
        beforeEach(function() {
            stubDefer();
            spyOn($.fn, "jScrollPane").andCallThrough();
            this.view.render();
        });

        describe('resizeGridToResultsConsole', function() {
            it("resizes the data grid", function () {
                spyOn(this.view.grid, 'resizeCanvas');
                spyOn(this.view.grid, 'invalidate');
                this.view.resizeGridToResultsConsole();

                expect(this.view.grid.resizeCanvas).toHaveBeenCalled();
                expect(this.view.grid.invalidate).toHaveBeenCalled();
            });
        });

        it("sets the cell's value as a title tag on each cell", function () {
            var $originCell = this.view.$(".slick-row:eq(0) .slick-cell:eq(0) span");
            expect($originCell.attr('title')).toBe($originCell.text());
        });

        it("renders a column for every column of the result", function() {
            expect(this.view.$(".slick-header-column").length).toBe(4);
        });

        it("renders a column header for each column, with the column's name", function() {
            var columNames = ["id", "city", "state", "zip"];

            _(columNames).each(_.bind(function(columName, i){
                expect(this.view.$(".slick-header-column:eq("+i+")").text()).toBe(columName);
            }, this));
        });
    });
});
