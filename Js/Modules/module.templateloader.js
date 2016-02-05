// ====================
// Template loader module
// ====================
define(['Knockout','jQuery'], function (ko, $) {
   
   var templateLoaderModule = function () {
	   
	   this.initialize = function () {
		   
		   // See http://knockoutjs.com/documentation/component-loaders.html
			var templateFromUrlLoader = {
				loadTemplate: function (name, templateConfig, callback) {
					if (templateConfig.fromUrl) {
						// Uses jQuery's ajax facility to load the markup from a file
						// Get the site collection URL. In SharePoint Online, host named site collections does not exists
						// So the format will be always <tenant.sharepoint.com>/sites/<url> or <tenant.sharepoint.com>/teams/<url>
						// window.location.pathname
						var siteCollectionUrl = window.location.protocol + "//" + window.location.host + _spPageContextInfo.siteServerRelativeUrl;
						var fullUrl = siteCollectionUrl + '/Style Library/NavigationSample/Html/' + templateConfig.fromUrl;
						$.get(fullUrl, function (markupString) {
							// We need an array of DOM nodes, not a string.
							// We can use the default loader to convert to the
							// required format.
							ko.components.defaultLoader.loadTemplate(name, markupString, callback);
						});
					} else {
						// Unrecognized config format. Let another loader handle it.
						callback(null);
					}
				}
			};

			// Register it
			ko.components.loaders.unshift(templateFromUrlLoader);

			// Override default registration method to support re-registering an existing component
			var defaultRegistration = ko.components.register;

			ko.components.register = function (componentName, config) {
				if (ko.components.isRegistered(componentName)) {
					ko.components.unregister(componentName);
				}
				defaultRegistration(componentName, config);
			};		
	   }
   }

   return templateLoaderModule;
   
});

