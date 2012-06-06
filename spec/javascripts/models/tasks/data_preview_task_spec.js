describe("chorus.models.DataPreviewTask", function() {
    beforeEach(function() {
        this.model = new chorus.models.DataPreviewTask({
            databaseObject: {id: 1234},
            rows: [
                ["1", "2"],
                ["3", "4"]
            ],
            columns: [
                {
                    name: "first_column",
                    data_type: "character varying (256)",
                    type_category: "STRING",
                    description: "first column comment"
                },
                {
                    name: "second_column",
                    data_type: "integer",
                    type_category: "WHOLE_NUMBER",
                    description: "second column comment"
                }
            ]
        });
    });

    it("has the right url", function() {
       expect(this.model.url()).toBe("/database_objects/1234/previews");
    });

    it("uses the objectName as its 'name'", function() {
        this.model.set({ objectName: "mike_the_table" });
        expect(this.model.name()).toBe("mike_the_table");
    });

    it("puts rows into the format columnOrientedData expects", function() {
        expect(this.model.getRows()).toEqual([
            {first_column: "1", second_column: "2"},
            {first_column: "3", second_column: "4"}
        ])
    });

});
