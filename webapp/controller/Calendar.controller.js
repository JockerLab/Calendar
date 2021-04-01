sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/unified/DateRange", 
    "sap/ui/unified/CalendarLegendItem",
    "sap/ui/unified/DateTypeRange",
    "sap/m/MessageToast", 
    "sap/ui/core/format/DateFormat", 
    "sap/ui/core/library",
    "sap/ui/model/xml/XMLModel"
],
	function(Controller, DateRange, MessageToast, DateFormat, coreLibrary, CalendarLegendItem, DateTypeRange) {
        "use strict";

	    return Controller.extend("itmo2021calendarsvv.controller.Calendar", {
            _holidays: {},
            _currentYear: "2021",

            onInit: function() {
                var oCalendar = this.byId("calendar");
                var oLegend = this.byId("legend");
                var oHead = this.byId("calendar--Head");
                var oModel = this.getOwnerComponent().getModel("holidays");
                var oHolidays = oModel.oData.children[0].children[0];
                var oDays = oModel.oData.children[0].children[1];
                oCalendar.displayDate(new Date(2021, 0));
                oHead.setVisible(false);
                this._getHolidays(oHolidays, oLegend);
                this._getDays(oDays, oCalendar);
            },

            _getHolidays: function(oHolidays, oLegend) {
                for (var holiday of oHolidays.children) {
                    var oAttributes = holiday.attributes;
                    var oId = oAttributes.id.nodeValue;
                    var oTitle = oAttributes.title.nodeValue;
                    oLegend.addItem(new sap.ui.unified.CalendarLegendItem({
						text: oTitle
                    }));
                    this._holidays[oId] = oTitle;
                }
            },

            _getDays: function(oDays, oCalendar) {
                for (var day of oDays.children) {
                    var oAttributes = day.attributes;
                    var oDay = oAttributes.d !== undefined ? oAttributes.d.nodeValue : null;
                    var oType = oAttributes.t !== undefined ? oAttributes.t.nodeValue : null;
                    var oHoliday = oAttributes.h !== undefined ? oAttributes.h.nodeValue : null;
                    var oFrom = oAttributes.f !== undefined ? oAttributes.f.nodeValue : null;
                    var sType = "";
                    
                    if (oType === "1") {
                        sType = sap.ui.unified.CalendarDayType.NonWorking;
                    } else {
                        sType = sap.ui.unified.CalendarDayType.None;
                    }
                    if (oHoliday !== null) {
                        if (oHoliday < 10) {
                            sType = "Type0" + oHoliday;
                        } else {
                            sType = "Type" + oHoliday;
                        }
                    }

                    var oDate = new Date(this._currentYear, oDay.split('.')[0] - 1, oDay.split('.')[1]);
                    oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate : oDate,
						type : sType,
						tooltip : this._holidays[oHoliday]
                    }));
                }
            }
        });

    });
