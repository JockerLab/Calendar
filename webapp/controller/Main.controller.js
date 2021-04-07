sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
	"sap/ui/core/Fragment",
   "sap/ui/model/json/JSONModel",
   "sap/ui/core/format/DateFormat",
   "sap/m/Table"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageToast, Fragment, JSONModel, DateFormat, Table) {
		"use strict";

		return Controller.extend("itmo2021calendarsvv.controller.Main", {
            _aDays: [],
            _nCurrentYear: 2021,
            _nNonWorkingId: 0,
            _nPartlyId: 0,
            _nPressedId: 0,
            _nWorkingId: 0,
            _oButtonsEnabledProperty: {},
            _oCalendar: null,
            _oFormatYyyymmdd: null,
            _oHolidays: {},
            _oLegend: null,
            _oSelectedDates: null,
            _oVacationTable: null,
            _sError: "",

            onInit: function() {
                this._oCalendar = this.byId("calendar");
                this._oLegend = this.byId("legend");
                this._oVacationTable = this.byId("vacationTable");
                this._oFormatYyyymmdd = DateFormat.getInstance({
                    pattern: "yyyy-MM-dd", 
                    calendarType: sap.ui.core.CalendarType.Gregorian
                });
                this._oButtonsEnabledProperty = {
                    "Add": "isAddButtonEnabled",
                    "Cancel": "isCancelButtonEnabled"
                };
                this._oCalendar.displayDate(new Date(2021, 0));

                var oHead = this.byId("calendar--Head");
                var oHolidaysModel = this.getOwnerComponent().getModel("holidays");
                var oHolidays = oHolidaysModel.oData.children[0].children[0];
                var oDays = oHolidaysModel.oData.children[0].children[1];
                oHead.setVisible(false);
                this._setHolidays(oHolidays);
                this._setDays(oDays);
                
                var oData = {
                    rows: [],
                    isAddButtonEnabled: false,
                    isCancelButtonEnabled: false
                };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "vacation");
            },

            handleCalendarSelect: function(oEvent) {
                this._oSelectedDates = this._oCalendar.getSelectedDates()[0];
                this._setEnabledButton(this._oButtonsEnabledProperty.Add, false);
                if (this._oSelectedDates.getStartDate() && this._oSelectedDates.getEndDate()) {
                    this._countDays();
                    this._setEnabledButton(this._oButtonsEnabledProperty.Add, true);
                }
                this._setEnabledButton(this._oButtonsEnabledProperty.Cancel, false);
                this._oVacationTable.removeSelections();
            },

			onAddVacation: function(oEvent) {
                var aVacations = this._getVacationData().rows;
                if (this._checkVacation(aVacations, this._oSelectedDates)) {
                    this._addVacation();
                } else {
                    MessageToast.show("Нельзя добавить отпуск. " + this._sError);
                }
            },

            onCancelVacation: function(oEvent) {
                this._oVacationTable.removeSelections();
                this._cancelVacation();
            },

            onLineItemSelected: function(oEvent) {
                this._selectLine(oEvent.getSource());
            },

            onPress: function(oEvent) {
                var oColumnListItem = oEvent.getSource();
                this._oVacationTable.setSelectedItem(oColumnListItem);
                this._selectLine(oColumnListItem.getList());
            },

            _addHoliday: function(oId, oTitle) {
                this._oLegend.addItem(new sap.ui.unified.CalendarLegendItem({
                    text: oTitle
                }));
                this._oHolidays[oId] = oTitle;
            },

            _addVacation: function() {
                this._updateVacationModel(a => {
                    a.rows.push({
                        "StartDate": this._oFormatYyyymmdd.format(this._oSelectedDates.getStartDate()),
                        "EndDate": this._oFormatYyyymmdd.format(this._oSelectedDates.getEndDate()),
                        "DaysCount": this._oSelectedDates.countDays + this._oSelectedDates.countHolidays,
                        "WorkingDays": this._oSelectedDates.countDays
                    });
                    this._sortList(a.rows);
                });
            },

            _cancelVacation: function() {
                this._updateVacationModel(a => { a.rows.splice(this._nPressedId, 1) });
            },

            _updateVacationModel: function(f) {
                var oVacationData = this._getVacationData();
                f(oVacationData);
                this.getView().getModel("vacation").refresh();
                this._setEnabledButton(this._oButtonsEnabledProperty.Cancel, false);
                this._deselectDates();
            },

            _checkCountDaysMin: function(aVacations, oSelectedDates) {
                var nSumDays = oSelectedDates.countDays;
                var bResult = true;
                var bFlag = (oSelectedDates.countDays >= 14);
                aVacations.forEach(oVacation => {
                    if (oVacation.WorkingDays >= 14 && bFlag) {
                        bResult = false;
                    }
                    if (oVacation.WorkingDays >= 14) {
                        bFlag = true;
                    }
                    nSumDays += oVacation.WorkingDays;
                });
                if ((28 - nSumDays < 14 && !bFlag) || (aVacations.length === 3 && !bFlag)) {
                    bResult = false;
                }
                if (!bResult) {
                    this._sError = "Один отпуск должен иметь длительность не менее 14 дней";
                }
                return bResult;
            },

            _checkCountDaysSum: function(aVacations, oSelectedDates) {
                var nCountDays = oSelectedDates.countDays;
                aVacations.forEach(oVacation => {
                    nCountDays += oVacation.WorkingDays;
                });
                var bResult = nCountDays <= 28;
                if (!bResult) {
                    this._sError = "Суммарная длительность отпусков должна быть не более 28 дней";
                }
                return bResult;
            },

            _checkCountVacations: function(aVacations) {
                var bResult = aVacations.length < 4;
                if (!bResult) {
                    this._sError = "Количество отпусков должно быть не более 4";
                }
                return bResult;
            },

            _checkIntersection: function(aVacations, oSelectedDates) {
                var bResult = true;
                var iDate = new Date(oSelectedDates.getStartDate());
                while (iDate <= oSelectedDates.getEndDate()) {
                    if (!bResult) {
                        break;
                    }
                    aVacations.forEach(oVacation => {
                        var oStartVacation = new Date(oVacation.StartDate);
                        oStartVacation.setHours(0);
                        var oEndVacation = new Date(oVacation.EndDate); 
                        oEndVacation.setHours(0);
                        if (oStartVacation <= iDate && iDate <= oEndVacation) {
                            bResult = false;
                        }
                    });
                    iDate.setDate(iDate.getDate() + 1);
                }
                if (!bResult) {
                    this._sError = "Отпуски не должны пересекаться";
                }
                return bResult;
            },

            _checkVacation: function(aVacations, oSelectedDates) {
                return this._checkCountDaysSum(aVacations, oSelectedDates) && 
                    this._checkCountDaysMin(aVacations, oSelectedDates) && 
                    this._checkCountVacations(aVacations) && 
                    this._checkIntersection(aVacations, oSelectedDates);
            },

            _countDays: function() {
                this._oSelectedDates.countDays = Math.round(
                    (this._oSelectedDates.getEndDate() - this._oSelectedDates.getStartDate()) / 86400000) + 1;
                this._oSelectedDates.countHolidays = 0;
                this._aDays.forEach(oDay => {
                    var oDate = new Date(oDay);
                    if (this._oSelectedDates.getStartDate() <= oDate && oDate <= this._oSelectedDates.getEndDate()) {
                        this._oSelectedDates.countDays--;
                        this._oSelectedDates.countHolidays++;
                    }
                });
            },

            _deselectDates: function() {
                this._setEnabledButton(this._oButtonsEnabledProperty.Add, false);
                this._oCalendar.removeAllSelectedDates();
            },

            _getType: function(oNumber) {
                if (oNumber < 10) {
                    return "Type0" + oNumber;
                } else {
                    return "Type" + oNumber;
                }
            },

            _getVacationData: function() {
                return this.getView().getModel("vacation").getData();
            },

            _selectLine: function(oLine) {
                this._nPressedId = oLine.getSelectedContextPaths()[0].split("/");
                this._nPressedId = this._nPressedId[this._nPressedId.length - 1];
                this._setEnabledButton(this._oButtonsEnabledProperty.Cancel, true);
                this._deselectDates();
            },

            _setDays: function(oDays) {
                for (var oChild of oDays.children) {
                    var oAttributes = oChild.attributes;
                    var oDay = oAttributes.d !== undefined ? oAttributes.d.nodeValue : null;
                    var oType = oAttributes.t !== undefined ? oAttributes.t.nodeValue : null;
                    var oHoliday = oAttributes.h !== undefined ? oAttributes.h.nodeValue : null;
                    var oFrom = oAttributes.f !== undefined ? oAttributes.f.nodeValue : null;
                    var sType = "";
                    
                    switch (oType) {
                        case "1":
                            if (oHoliday !== null) {
                                sType = this._getType(oHoliday);
                            } else {
                                sType = this._getType(this._nNonWorkingId);
                                oHoliday = this._nNonWorkingId;
                            }
                            break;
                        case "2":
                            sType = this._getType(this._nPartlyId);
                            oHoliday = this._nPartlyId;
                            break;
                        case "3":
                            sType = this._getType(this._nWorkingId);
                            oHoliday = this._nWorkingId;
                            break;
                    }
                    var oDate = new Date(this._nCurrentYear, oDay.split('.')[0] - 1, oDay.split('.')[1]);
                    if (oType === "1") {
                        this._aDays.push(oDate);
                    }
                    this._oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate : oDate,
						type : sType,
						tooltip : this._oHolidays[oHoliday]
                    }));
                }
            },

            _setEnabledButton: function(sPropertyName, bValue) {
                this._getVacationData()[sPropertyName] = bValue;
                this.getView().getModel("vacation").refresh();
            },

            _setHolidays: function(oHolidays) {
                var nId = 1;
                for (var holiday of oHolidays.children) {
                    var oAttributes = holiday.attributes;
                    var oId = oAttributes.id.nodeValue;
                    var oTitle = oAttributes.title.nodeValue;
                    this._addHoliday(oId, oTitle);
                    nId++;
                }
                this._nNonWorkingId = nId;
                this._addHoliday(nId++, "Дополнительный выходной");
                this._nWorkingId = nId;
                this._addHoliday(nId++, "Дополнительный рабочий день");
                this._nPartlyId = nId;
                this._addHoliday(nId, "Сокращенный рабочий день");
            },

            _sortList: function(oList) {
                oList.sort(function(a, b) {
                    var date1 = new Date(a.StartDate);
                    var date2 = new Date(b.StartDate);
                    return date1 - date2;
                });
            }

		});
	});
