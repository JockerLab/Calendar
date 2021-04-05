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
            _oHolidays: {},
            _oDays: {},
            _oNonWorkingId: 0,
            _oWorkingId: 0,
            _oPartlyId: 0,
            _oCurrentYear: "2021",
            _oSelectedDates: null,

            onInit: function() {
                var oCalendar = this.byId("calendar");
                var oLegend = this.byId("legend");
                var oHead = this.byId("calendar--Head");
                var oModel = this.getOwnerComponent().getModel("holidays");
                var oHolidays = oModel.oData.children[0].children[0];
                var oDays = oModel.oData.children[0].children[1];
                oCalendar.displayDate(new Date(2021, 0));
                oHead.setVisible(false);
                this._setHolidays(oHolidays, oLegend);
                this._setDays(oDays, oCalendar);
            },

            handleCalendarSelect: function(oEvent) {
                var oCalendar = oEvent.getSource();
                this._oSelectedDates = oCalendar.getSelectedDates()[0];
                this._countDays();
            },

            getSelectedDates: function() {
                return this._oSelectedDates;
            },

            _countDays: function() {
                this._oSelectedDates.countDays = Math.round(
                    (this._oSelectedDates.getEndDate() - this._oSelectedDates.getStartDate()) / 86400000) + 1;
                this._oSelectedDates.countHolidays = 0;
                for (var oDay in this._oDays) {
                    var oDate = new Date(oDay);
                    if (this._oSelectedDates.getStartDate() <= oDate && oDate <= this._oSelectedDates.getEndDate()) {
                        this._oSelectedDates.countDays--;
                        this._oSelectedDates.countHolidays++;
                    }
                }
            },

            _addHoliday: function(oLegend, oId, oTitle) {
                oLegend.addItem(new sap.ui.unified.CalendarLegendItem({
                    text: oTitle
                }));
                this._oHolidays[oId] = oTitle;
            },

            _setHolidays: function(oHolidays, oLegend) {
                var nId = 1;
                for (var holiday of oHolidays.children) {
                    var oAttributes = holiday.attributes;
                    var oId = oAttributes.id.nodeValue;
                    var oTitle = oAttributes.title.nodeValue;
                    this._addHoliday(oLegend, oId, oTitle);
                    nId++;
                }
                this._oNonWorkingId = nId;
                this._addHoliday(oLegend, nId++, "Дополнительный выходной");
                this._oWorkingId = nId;
                this._addHoliday(oLegend, nId++, "Дополнительный рабочий день");
                this._oPartlyId = nId;
                this._addHoliday(oLegend, nId, "Сокращенный рабочий день");
            },

            _getType: function(oNumber) {
                if (oNumber < 10) {
                    return "Type0" + oNumber;
                } else {
                    return "Type" + oNumber;
                }
            },

            _setDays: function(oDays, oCalendar) {
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
                                sType = this._getType(this._oNonWorkingId);
                                oHoliday = this._oNonWorkingId;
                            }
                            break;
                        case "2":
                            sType = this._getType(this._oPartlyId);
                            oHoliday = this._oPartlyId;
                            break;
                        case "3":
                            sType = this._getType(this._oWorkingId);
                            oHoliday = this._oWorkingId;
                            break;
                    }
                    var oDate = new Date(this._oCurrentYear, oDay.split('.')[0] - 1, oDay.split('.')[1]);
                    if (oType === "1") {
                        this._oDays[oDate] = oType;
                    }
                    oCalendar.addSpecialDate(new sap.ui.unified.DateTypeRange({
						startDate : oDate,
						type : sType,
						tooltip : this._oHolidays[oHoliday]
                    }));
                }
            }
        });
    });
