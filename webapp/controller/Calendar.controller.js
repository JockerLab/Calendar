sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/unified/DateRange", 
    "sap/m/MessageToast", 
    "sap/ui/core/format/DateFormat", 
    "sap/ui/core/library"
],
	function(Controller, DateRange, MessageToast, DateFormat, coreLibrary) {
        "use strict";

        var CalendarType = coreLibrary.CalendarType;

	    return Controller.extend("itmo2021calendarsvv.controller.Calendar", {
            oFormatYyyymmdd: null,
            oLastSelectedDates: null,

            onInit: function() {
                this.oFormatYyyymmdd = DateFormat.getInstance({pattern: "yyyy-MM-dd", calendarType: CalendarType.Gregorian});
                var oCalendar = this.byId("calendar");
                oCalendar.displayDate(new Date(2021, 0));
                var oHead = this.byId("calendar--Head");
                oHead.setVisible(false);
            }
        });

    });