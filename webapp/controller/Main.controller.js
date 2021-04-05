sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller, MessageToast) {
		"use strict";

		return Controller.extend("itmo2021calendarsvv.controller.Main", {
            _oVacationController: undefined,
            _oCalendarController: undefined,
            _sError: "",

            onInit: function() {
                this._oVacationController = sap.ui.getCore().byId("__xmlview0").getController();
                this._oCalendarController = sap.ui.getCore().byId("__xmlview1").getController();
                sap.ui.getCore().byId("__button0").setEnabled(false);
                sap.ui.getCore().byId("__button1").setEnabled(false);
            },

			onAddVacation: function(oEvent) {
                var oSelectedDates = this._oCalendarController.getSelectedDates();
                if (this._checkVacation(this._oVacationController.getVacations(), oSelectedDates)) {
                    this._oVacationController.addVacation(oSelectedDates);
                } else {
                    MessageToast.show("Нельзя добавить отпуск. " + this._sError);
                }
            },

            onCancelVacation: function(oEvent) {
                this._oVacationController.cancelVacation();
            },

            _checkVacation: function(oVacations, oSelectedDates) {
                return this._checkCountDaysSum(oVacations, oSelectedDates) && 
                    this._checkCountDaysMin(oVacations, oSelectedDates) && 
                    this._checkCountVacations(oVacations) && 
                    this._checkIntersection(oVacations, oSelectedDates);
            },

            _checkCountDaysSum: function(oVacations, oSelectedDates) {
                var oCountDays = oSelectedDates.countDays;
                for (var iVacation of oVacations) {
                    oCountDays += iVacation.WorkingDays;
                }
                var bResult = oCountDays <= 28;
                if (!bResult) {
                    this._sError = "Суммарная длительность отпусков должна быть не более 28 дней";
                }
                return bResult;
            },

            _checkCountDaysMin: function(oVacations, oSelectedDates) {
                var oSumDays = oSelectedDates.countDays;
                var bResult = true;
                var bFlag = (oSelectedDates.countDays >= 14);
                for (var iVacation of oVacations) {
                    if (iVacation.WorkingDays >= 14 && bFlag) {
                        bResult = false;
                        break;
                    }
                    if (iVacation.WorkingDays >= 14) {
                        bFlag = true;
                    }
                    oSumDays += iVacation.WorkingDays;
                }
                if (28 - oSumDays < 14 && !bFlag) {
                    bResult = false;
                }
                if (oVacations.length === 3 && !bFlag) {
                    bResult = false;
                }
                if (!bResult) {
                    this._sError = "Один отпуск должен иметь длительность не менее 14 дней";
                }
                return bResult;
            },

            _checkCountVacations: function(oVacations) {
                var bResult = oVacations.length < 4;
                if (!bResult) {
                    this._sError = "Количество отпусков должно быть не более 4";
                }
                return bResult;
            },

            _checkIntersection: function(oVacations, oSelectedDates) {
                var bResult = true;
                var iDate = new Date(oSelectedDates.getStartDate());
                while (iDate <= oSelectedDates.getEndDate()) {
                    if (!bResult) {
                        break;
                    }
                    for (var iVacation of oVacations) {
                        var oStartVacation = new Date(iVacation.StartDate);
                        oStartVacation.setHours(0);
                        var oEndVacation = new Date(iVacation.EndDate); 
                        oEndVacation.setHours(0);
                        if (oStartVacation <= iDate && iDate <= oEndVacation) {
                            bResult = false;
                            break;
                        }
                    }
                    iDate.setDate(iDate.getDate() + 1);
                }
                if (!bResult) {
                    this._sError = "Отпуски не должны пересекаться";
                }
                return bResult;
            }

		});
	});
