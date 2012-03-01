describe("chorus.dialogs.ImportScheduler", function() {
    beforeEach(function() {
        this.dataset = fixtures.datasetSourceTable();
        this.launchElement = $("<a/>");
        this.launchElement.data("dataset", this.dataset);
    });

    describe("#getNewModelAttrs", function() {
        describe("when creating a new schedule", function() {
            beforeEach(function() {
                this.launchElement.addClass("create_schedule")
                this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxView(),
                    fixtures.datasetExternalTable(),
                    fixtures.datasetHadoopExternalTable()
                ]);
                this.dialog.$(".new_table input:radio").prop("checked", false);
                this.dialog.$(".existing_table input:radio").prop("checked", true).change();
                this.dialog.$(".existing_table input[name='schedule']").prop("checked", true).change();
                this.attrs = this.dialog.getNewModelAttrs();
            });

            it("has the 'importType' parameter set to 'schedule'", function() {
                expect(this.attrs.importType).toBe("schedule");
            });
        });

        describe("when editing an existing schedule", function() {
            beforeEach(function() {
                this.launchElement.addClass("edit_schedule")
                this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxView(),
                    fixtures.datasetExternalTable(),
                    fixtures.datasetHadoopExternalTable()
                ]);
                this.dialog.$(".new_table input:radio").prop("checked", false);
                this.dialog.$(".existing_table input:radio").prop("checked", true).change();
                this.dialog.$(".existing_table input[name='schedule']").prop("checked", true).change();
                this.attrs = this.dialog.getNewModelAttrs();
            });

            it("has the 'importType' parameter set to 'schedule'", function() {
                expect(this.attrs.importType).toBe("schedule");
            });
        });

        describe("when doing a single import", function() {
            beforeEach(function() {
                 this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
                 this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                     fixtures.datasetSandboxTable(),
                     fixtures.datasetSandboxTable(),
                     fixtures.datasetSandboxView(),
                     fixtures.datasetExternalTable(),
                     fixtures.datasetHadoopExternalTable()
                 ]);
                 this.attrs = this.dialog.getNewModelAttrs();
            });

            it("has the 'importType' parameter set to 'oneTime'", function() {
                expect(this.attrs.importType).toBe("oneTime");
            });

            it("does not include any scheduling parameters", function() {
                expect(_.find(this.attrs, function(val, key) { return key.indexOf("schedule") == 0 })).toBeFalsy();
            });
        });
    });

    describe("creating a new schedule", function() {
        beforeEach(function() {
            this.launchElement.addClass("create_schedule");
            this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
            this.dialog.render();
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxTable(),
                    fixtures.datasetSandboxView(),
                    fixtures.datasetExternalTable(),
                    fixtures.datasetHadoopExternalTable()
                ]);
            });

            it("should have a checkbox for scheduling an import", function() {
                expect(this.dialog.$(".schedule_import label")).toContainTranslation("import.schedule_import");
            });

            it("should set executeAfterSave to be false on the DatasetImport", function() {
                expect(this.dialog.model.executeAfterSave).toBeFalsy();
            });

            it("should have the correct title", function() {
                expect(this.dialog.title).toMatchTranslation("import.title_schedule");
            });

            it("should have the right submit button text", function() {
                expect(this.dialog.submitText).toMatchTranslation("import.begin_schedule");
            });

            it("should show the schedule controls", function() {
                expect(this.dialog.$(".schedule_import")).toExist();
                expect(this.dialog.$(".schedule_widget")).toExist();
            });

            it("should not include views, external tables, or Hadoop tables in the dropdown", function() {
                expect(this.dialog.$(".existing_table .names option").length).toBe(2);
            });

            describe("checking the import on a schedule checkbox", function() {
                beforeEach(function() {
                    spyOn(this.dialog.scheduleView, "enable").andCallThrough();
                    this.dialog.$(".existing_table input[name='schedule']").prop("checked", true).change();
                });

                it("should enable the schedule view", function() {
                    expect(this.dialog.scheduleView.enable).toHaveBeenCalled();
                });

                context("when the schedule view is enabled", function() {
                    beforeEach(function() {
                        spyOn(this.dialog.scheduleView, "disable");
                        this.dialog.$(".existing_table input[name='schedule']").prop("checked", false).change();
                    });

                    it("should disable the schedule view", function() {
                        expect(this.dialog.scheduleView.disable).toHaveBeenCalled();
                    });
                });

                context("when 'Import into Existing Table' is checked", function() {
                    beforeEach(function() {
                        this.dialog.$(".new_table input:radio").prop("checked", false);
                        this.dialog.$(".existing_table input:radio").prop("checked", true).change();
                    });

                    context("when all the fields are filled out and the form is submitted", function() {
                        beforeEach(function() {
                            this.dialog.$("input:checked[name='truncate']").prop("checked", false).change();

                            this.dialog.$("select[name='toTable']").eq(0).attr("selected", true);

                            this.dialog.$("input[name='limit_num_rows']").prop("checked", true)
                            this.dialog.$("input[name='sampleCount']").val(123);

                            this.dialog.$(".start input[name='year']").val("2012");
                            this.dialog.$(".start input[name='month']").val("02");
                            this.dialog.$(".start input[name='day']").val("29");

                            this.dialog.$(".end input[name='year']").val("2012");
                            this.dialog.$(".end input[name='month']").val("03");
                            this.dialog.$(".end input[name='day']").val("21");

                            this.dialog.$("select.ampm").val("PM");
                            this.dialog.$("select.hours").val("12");
                            this.dialog.$("select.minutes").val("09");

                            expect(this.dialog.$("button.submit")).toBeEnabled();

                            this.dialog.$("button.submit").click();
                        });

                        it("should put the values in the correct API form fields", function() {
                            var params = this.server.lastCreate().params()
                            expect(params.truncate).toBe("false");
                            expect(params.sampleCount).toBe("123");
                            expect(params.scheduleStartTime).toBe("2012-02-29 12:09:00.0");
                            expect(params.scheduleEndTime).toBe("2012-03-21")
                            expect(params.scheduleDays).toBe("1:2");
                        });
                    });
                });
            });
        });
    });

    describe("editing an existing schedule", function() {
        beforeEach(function() {
            this.import = fixtures.datasetImport({
                id: '12',
                truncate: true,
                sampleCount: 200,
                scheduleInfo: {
                    startTime: "2013-02-21 13:30:00.0",
                    endTime: "2013-05-27",
                    frequency: "HOURLY"
                },
                toTable: "my_table",
                destinationTable: "10000|dca_demo|ddemo|BASE_TABLE|my_table",
                sourceId: "10000|dca_demo|ddemo|BASE_TABLE|somebodys_table"
            });
            this.launchElement.addClass("edit_schedule");
            this.launchElement.data("import", this.import);
            this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
            this.dialog.render();
        });

        describe("when the sandbox table fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [
                    fixtures.datasetSandboxTable({ objectName: "your_table", id: "10000|dca_demo|ddemo|BASE_TABLE|your_table" }),
                    fixtures.datasetSandboxTable({ objectName: "my_table",   id: "10000|dca_demo|ddemo|BASE_TABLE|my_table" }),
                    fixtures.datasetSandboxTable({ objectName: "her_table",  id: "10000|dca_demo|ddemo|BASE_TABLE|her_table" })
                ]);
            });

            it("has the right title", function() {
                expect(this.dialog.title).toMatchTranslation("import.title_edit_schedule");
            });

            it("has a submit button with the right text", function() {
                expect(this.dialog.$("button.submit").text()).toMatchTranslation("actions.save_changes");
            });

            it("has the right fieldset selected", function() {
                expect(this.dialog.$("input[type='radio']#import_scheduler_existing_table")).toBeChecked();
                expect(this.dialog.$("input[type='radio']#import_scheduler_new_table")).not.toBeChecked();
                expect(this.dialog.$(".existing_table fieldset")).not.toHaveClass("disabled");
                expect(this.dialog.$(".new_table fieldset")).toHaveClass("disabled");
            });

            it("has the 'schedule' checkbox checked by default", function() {
                expect(this.dialog.$("input[name='schedule']")).toBeChecked();
            });

            it("pre-populates the schedule fields with the import's settings", function() {
                expect(this.dialog.$(".start input[name='year']").val()).toBe("2013");
                expect(this.dialog.$(".start input[name='month']").val()).toBe("2");
                expect(this.dialog.$(".start input[name='day']").val()).toBe("21");

                expect(this.dialog.$(".hours").val()).toBe("1");
                expect(this.dialog.$(".minutes").val()).toBe("30");
                expect(this.dialog.$(".ampm").val()).toBe("PM");

                expect(this.dialog.$(".end input[name='year']").val()).toBe("2013");
                expect(this.dialog.$(".end input[name='month']").val()).toBe("5");
                expect(this.dialog.$(".end input[name='day']").val()).toBe("27");
            });

            it("pre-populates the destination table and truncation fields with the import's settings", function() {
                expect(this.dialog.$("select[name='toTable']").val()).toBe("my_table");
                expect(this.dialog.$(".truncate")).toBeChecked();
            });

            it("pre-populates the row limit", function() {
                expect(this.dialog.$("input[name='limit_num_rows']")).toBeChecked();
                expect(this.dialog.$("input[name='sampleCount']").val()).toBe("200");
            });
        });
    });

    describe("import now!", function() {
        beforeEach(function() {
            this.launchElement.addClass("import_now");
            this.dialog = new chorus.dialogs.ImportScheduler({launchElement: this.launchElement});
            this.dialog.render();
        });

        it("should hide the schedule controls", function() {
            expect(this.dialog.$(".schedule_import")).not.toExist();
            expect(this.dialog.$(".schedule_widget")).not.toExist();
        });

        it("should set executeAfterSave to be true on the DatasetImport", function() {
            expect(this.dialog.model.executeAfterSave).toBeTruthy();
        });

        it("should have the correct title", function() {
            expect(this.dialog.title).toMatchTranslation("import.title");
        });

        it("should the right submit button text", function() {
            expect(this.dialog.submitText).toMatchTranslation("import.begin");
        });

        it("should initialize its model with the correct datasetId and workspaceId", function() {
            expect(this.dialog.model.get("datasetId")).toBe(this.dataset.get("id"));
            expect(this.dialog.model.get("workspaceId")).toBe(this.dataset.get("workspace").id);
        });

        it("should display a loading section", function() {
            expect(this.dialog.$(".loading_section")).toExist();
        })

        it("should fetch the list of sandbox tables", function() {
            expect(this.server.lastFetchAllFor(this.dialog.sandboxTables)).toBeDefined();
        });

        context("when the fetch completes", function() {
            beforeEach(function() {
                this.server.completeFetchAllFor(this.dialog.sandboxTables, [fixtures.datasetSandboxTable(), fixtures.datasetSandboxTable()]);
            });

            it("should populate the table dropdown", function() {
                expect(this.dialog.$(".existing_table .names option").length).toBe(2);
            });

            it("should display the import destination", function() {
                expect(this.dialog.$(".destination")).toContainTranslation("import.destination", {canonicalName: this.dataset.schema().canonicalName()})
            })

            it("should have a 'Begin Import' button", function() {
                expect(this.dialog.$("button.submit")).toContainTranslation("import.begin");
                expect(this.dialog.$("button.submit")).toBeDisabled();
            });

            it("should have an 'Import Into New Table' radio button", function() {
                expect(this.dialog.$(".new_table label")).toContainTranslation("import.new_table");
            });

            it("should have a 'Limit Rows' checkbox", function() {
                expect(this.dialog.$(".new_table .limit label")).toContainTranslation("import.limit_rows");
                expect(this.dialog.$(".new_table .limit input:checkbox").prop("checked")).toBeFalsy();
            });

            it("should have a textfield for the 'Limit Rows' value", function() {
                expect(this.dialog.$(".new_table .limit input:text")).toBeDisabled();
            });

            it("should have a text entry for new table name", function() {
                expect(this.dialog.$(".new_table .name")).toBeEnabled();
            });

            it("should have an import into existing table radio button", function() {
                expect(this.dialog.$(".existing_table label")).toContainTranslation("import.existing_table");
            });

            it("should have a dropdown selector for existing tables", function() {
                expect(this.dialog.$(".existing_table .names")).toBeDisabled();
            });

            it("disables the submit button", function() {
                expect(this.dialog.$("button.submit")).toBeDisabled();
            });

            context("when 'Import into Existing Table' is checked", function() {
                beforeEach(function() {
                    this.dialog.$(".new_table input:radio").prop("checked", false);
                    this.dialog.$(".existing_table input:radio").prop("checked", true).change();
                });

                it("should enable the select", function() {
                    expect(this.dialog.$(".existing_table .names")).toBeEnabled();
                    expect(this.dialog.$(".new_table .name")).toBeDisabled();
                });

                it("should enable the submit button", function() {
                    expect(this.dialog.$("button.submit")).toBeEnabled();
                });

                context("and the form is submitted", function() {
                    beforeEach(function() {
                        this.dialog.$(".existing_table .truncate").prop("checked", true).change();
                        this.dialog.$("button.submit").click();
                    });

                    it("should save the model", function() {
                        expect(this.server.lastCreateFor(this.dialog.model).params().truncate).toBe("true");
                    });
                });

                context("when 'Import into New Table' is checked and a valid name is entered", function() {
                    beforeEach(function() {
                        this.dialog.$(".new_table input:radio").prop("checked", true).change();
                        this.dialog.$(".existing_table input:radio").prop("checked", false).change();
                        this.dialog.$(".new_table input.name").val("Foo").trigger("keyup");
                    });

                    it("should disable the 'Existing Table' dropdown", function() {
                        expect(this.dialog.$(".new_table .name")).toBeEnabled();
                        expect(this.dialog.$(".existing_table .names")).toBeDisabled();
                    });

                    context("checking the limit rows checkbox", function() {
                        beforeEach(function() {
                            this.dialog.$(".new_table .limit input:checkbox").prop("checked", true).change();
                        });

                        it("should enable the limit text input", function() {
                            expect(this.dialog.$(".new_table .limit input:text")).toBeEnabled();
                        });

                        context("entering a valid row limit", function() {
                            beforeEach(function() {
                                this.dialog.$(".new_table .limit input:text").val("345").trigger("keyup");
                            });

                            it("should enable the submit button when a row limit is entered", function() {
                                expect(this.dialog.$("button.submit")).toBeEnabled();
                            });
                        });

                        context("entering an invalid row limit", function() {
                            beforeEach(function() {
                                this.dialog.$(".new_table .limit input:text").val("ddd").trigger("keyup");
                            });

                            it("should keep the submit enabled when the row limit is unchecked", function() {
                                expect(this.dialog.$("button.submit")).toBeDisabled();
                                this.dialog.$(".new_table .limit input:checkbox").prop("checked", false).change();
                                expect(this.dialog.$("button.submit")).toBeEnabled();
                            });
                        });
                    });

                    context("when the inputs are filled with valid values", function() {
                        beforeEach(function() {
                            this.dialog.$(".new_table input.name").val("good_table_name").trigger("keyup");
                        });

                        it("enables the submit button", function() {
                            expect(this.dialog.$("button.submit")).toBeEnabled();
                        });

                        context("when the form is submitted", function() {
                            beforeEach(function() {
                                this.dialog.$("button.submit").click();
                            });

                            it("should save the model", function() {
                                expect(this.server.lastCreateFor(this.dialog.model)).toBeDefined();
                            });

                            it("should put the submit button in the loading state", function() {
                                expect(this.dialog.$("button.submit").isLoading()).toBeTruthy();
                                expect(this.dialog.$("button.submit")).toContainTranslation("import.importing");
                            });

                            context("and the save is successful", function() {
                                beforeEach(function() {
                                    spyOn(chorus, "toast");
                                    spyOn(this.dialog, "closeModal");
                                    this.dialog.model.trigger("saved");
                                });

                                it("should display a toast", function() {
                                    expect(chorus.toast).toHaveBeenCalledWith("import.success");
                                });

                                it("should close the dialog", function() {
                                    expect(this.dialog.closeModal).toHaveBeenCalled();
                                });
                            });

                            context("and the save is not successful", function() {
                                beforeEach(function() {
                                    this.server.lastCreate().fail();
                                });

                                it("should not display the loading spinner", function() {
                                    expect(this.dialog.$("button.submit").isLoading()).toBeFalsy();
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
