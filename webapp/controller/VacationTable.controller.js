sap.ui.define([
   "sap/ui/core/mvc/Controller",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/Sorter",
   "sap/m/Table",
   "sap/ui/core/format/DateFormat"
], 
    function (Controller, Table, JSONModel) {
        "use strict";

        return Controller.extend("itmo2021calendarsvv.controller.VacationTable", {
            _oFormatYyyymmdd: null,
            _oPressedId: null,
            _oAddButton: undefined,
            _oCancelButton: undefined,

            onInit: function() {
                this._oFormatYyyymmdd = sap.ui.core.format.DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: sap.ui.core.CalendarType.Gregorian});
                var oData = {
                    rows: []
                };
                this._sortList(oData.rows);
                var oModel = new sap.ui.model.json.JSONModel(oData);
                this.getView().setModel(oModel, "vacation");
                this._oAddButton = sap.ui.getCore().byId("__button0");
                this._oCancelButton = sap.ui.getCore().byId("__button1");
            },

            _deselectDates: function() {
                this._oAddButton.setEnabled(false);
                sap.ui.getCore().byId("__xmlview1--calendar").removeAllSelectedDates();
            },

            onPress: function(oEvent) {
                var oColumnListItem = oEvent.getSource();
                var oTable = oColumnListItem.getParent();
                oTable.setSelectedItem(oColumnListItem);
                this._oCancelButton.setEnabled(true);
                this._oPressedId = oEvent.getParameters().id.split("-");
                this._oPressedId = this._oPressedId[this._oPressedId.length - 1];
                this._deselectDates();
            },

            onLineItemSelected: function(oEvent) {
                var oColumnListItem = oEvent.getSource();
                this._oCancelButton.setEnabled(true);
                this._oPressedId = oColumnListItem.getSelectedContextPaths()[0].split("/");
                this._oPressedId = this._oPressedId[this._oPressedId.length - 1];
                this._deselectDates();
            },

            cancelVacation: function() {
                var oCurrentData = this.getView().getModel("vacation").getData();
                oCurrentData.rows.splice(this._oPressedId, 1);
                var oCurrentModel = new sap.ui.model.json.JSONModel(oCurrentData);
                this.getView().setModel(oCurrentModel, "vacation");
                this._oCancelButton.setEnabled(false);
                this._deselectDates();
            },

            getVacations: function() {
                return this.getView().getModel("vacation").getData().rows;
            },

            addVacation: function(oSelectedDates) {
                var oCurrentData = this.getView().getModel("vacation").getData();
                oCurrentData.rows.push({
                    "StartDate": this._oFormatYyyymmdd.format(oSelectedDates.getStartDate()),
                    "EndDate": this._oFormatYyyymmdd.format(oSelectedDates.getEndDate()),
                    "DaysCount": oSelectedDates.countDays + oSelectedDates.countHolidays,
                    "WorkingDays": oSelectedDates.countDays
                });
                this._sortList(oCurrentData.rows);
                var oCurrentModel = new sap.ui.model.json.JSONModel(oCurrentData);
                this.getView().setModel(oCurrentModel, "vacation");
                this._oCancelButton.setEnabled(false);
                this._deselectDates();
            },

            _sortList: function(oList) {
                oList.sort(function(a, b) {
                    var date1 = new Date(a.StartDate);
                    var date2 = new Date(b.StartDate);
                    if (date1 > date2) {
                        return 1;
                    }
                    if (date1 < date2) {
                        return -1;
                    }
                    return 0;
                });
            }

        });
    });