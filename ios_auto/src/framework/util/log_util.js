
var Logger = {

	/**
	 * 用例开始
	 * @param log
     */
	start:function (log) {
		UIALogger.logStart(log);
	},
	
	fail:function (log) {
		UIALogger.logFail(log);
	},

	issue:function (log) {
		UIALogger.logIssue(log);
	},

	pass:function (log) {
		UIALogger.logPass(log);
	},

	debug:function (log) {
		UIALogger.logDebug(log);
	},

	error:function (log) {
		UIALogger.logError(log);
	},

	log:function (log) {
		UIALogger.logMessage(log);
	},

	warn:function (log) {
		UIALogger.logWarning(log);
	},
}
