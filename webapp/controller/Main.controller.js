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
                return this._checkCountDays(oSelectedDates) && 
                    this._checkCountVacations(oVacations) && 
                    this._checkIntersection(oVacations, oSelectedDates);
            },

            _checkCountDays: function(oSelectedDates) {
                var bResult = 14 <= oSelectedDates.countDays && oSelectedDates.countDays <= 28;
                if (!bResult) {
                    this._sError = "Количество рабочих дней должно быть не менее 14 и не более 28";
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
