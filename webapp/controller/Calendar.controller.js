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
            _nonWorkingId: 0,
            _workingId: 0,
            _partlyId: 0,
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

            _addHoliday: function(oLegend, oId, oTitle) {
                oLegend.addItem(new sap.ui.unified.CalendarLegendItem({
                    text: oTitle
                }));
                this._holidays[oId] = oTitle;
            },

            _getHolidays: function(oHolidays, oLegend) {
                var nId = 1;
                for (var holiday of oHolidays.children) {
                    var oAttributes = holiday.attributes;
                    var oId = oAttributes.id.nodeValue;
                    var oTitle = oAttributes.title.nodeValue;
                    this._addHoliday(oLegend, oId, oTitle);
                    nId++;
                }
                this._nonWorkingId = nId;
                this._addHoliday(oLegend, nId++, "Дополнительный выходной");
                this._workingId = nId;
                this._addHoliday(oLegend, nId++, "Дополнительный рабочий день");
                this._partlyId = nId;
                this._addHoliday(oLegend, nId, "Сокращенный рабочий день");
            },

            _getType: function(oNumber) {
                if (oNumber < 10) {
                    return "Type0" + oNumber;
                } else {
                    return "Type" + oNumber;
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
                    
                    switch (oType) {
                        case "1":
                            if (oHoliday !== null) {
                                sType = this._getType(oHoliday);
                            } else {
                                sType = this._getType(this._nonWorkingId);
                                oHoliday = this._nonWorkingId;
                            }
                            break;
                        case "2":
                            sType = this._getType(this._partlyId);
                            oHoliday = this._partlyId;
                            break;
                        case "3":
                            sType = this._getType(this._workingId);
                            oHoliday = this._workingId;
                            break;
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
