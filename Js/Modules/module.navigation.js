// ====================
// Navbar module
// ====================
define(['jQuery','Knockout'], function ($, ko) {

	var navigationModule = function(){
		
		var navbar = this;
		
		// Public properties
		navbar.nodes = ko.observableArray();

		// Public functions
		navbar.initialize = function (nodes) {
			populateObservableNodeArray(nodes, navbar.nodes);
		};

		// Private functions
		var populateObservableNodeArray = function (nodes, observableArray) {
			
			for (var i = 0; i < nodes.length; i++) {
				observableArray.push(new nodeViewModel(nodes[i]));
			}
		};

		var nodeViewModel = function (node) {
			var self = this;

			self.title = ko.observable(node.Title);
			self.url = ko.observable(node.Url);
			self.hasChildren = ko.observable(node.ChildNodes.length > 0);
			self.children = ko.observableArray();

			populateObservableNodeArray(node.ChildNodes, self.children);
		};
		
		// Register navbar component
		ko.components.register('navbar-component', {
			template: { fromUrl: 'navbar.html' },
		});	

		// We need a custom knockout binding to ensure DOM manipulations execute after the nav bar rendering (see the navbar.html file)
		ko.bindingHandlers.loadSearchBox = {
				  init: function(elem) {
					  
						// Hide the OOTB search box						
						$("#searchInputBox").hide();
						
						// Deactivate all OOTB events (we just want to be able to put some keywords here and redirect to the search results page, no fancy features like scopes, etc.)
						$("#searchInputBox input").prop('onfocus',null).off('focus');
						$("#searchInputBox input").prop('onblur',null).off('blur');
						$("#searchInputBox input").prop('onkeydown',null).off('keydown');
						
						// Modify the CSS to integrate nicely with the navabr 
						$("#searchInputBox input").removeClass().addClass("ms-TextField-field");
						
						// Remove the default value "Search this site..."
						$("#searchInputBox input").val("");

						// Add to the nav bar
						$(elem).append($("#searchInputBox input"));					
				  }
			}		
	};
	
	return navigationModule;

});