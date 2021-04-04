sap.ui.define([
	"sap/ui/core/mvc/Controller"
],
	/**
	 * @param {typeof sap.ui.core.mvc.Controller} Controller
	 */
	function (Controller) {
		"use strict";

		return Controller.extend("itmo2021calendarsvv.controller.Main", {
            _oVacationController: undefined,
            _oCalendarController: undefined,

            onInit: function() {
                this._oVacationController = sap.ui.getCore().byId("__xmlview0").getController();
                this._oCalendarController = sap.ui.getCore().byId("__xmlview1").getController();
            },

			onAddVacation: function(oEvent) {
                var oSelectedDates = this._oCalendarController.getSelectedDates();
                this._checkDates(this._oVacationController.getVacations(), oSelectedDates);
                this._oVacationController.addVacation(oSelectedDates);
            },

            onCancelVacation: function(oEvent) {
                this._oVacationController.cancelVacation();
            },

            _checkDates(oVacations, oSelectedDates) {

            }
		});
	});
