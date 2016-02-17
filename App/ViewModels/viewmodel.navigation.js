// ====================
// Navigation view model
// ====================
define(['jQuery','Knockout'], function ($, ko) {

	var navigationModule = function(){
		
		var navigationMenu = this;
        		   
		// Public properties
		navigationMenu.nodes = ko.observableArray();

		// Public functions
		navigationMenu.initialize = function (nodes) {
			populateObservableNodeArray(nodes, navigationMenu.nodes);
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
			self.iconCssClass = ko.observable(node.IconCssClass);
			self.hasChildren = ko.observable(node.ChildNodes.length > 0);
			self.children = ko.observableArray();
            self.friendlyUrlSegment = ko.observable(node.FriendlyUrlSegment);          
            self.isCurrentNode = ko.pureComputed(function() {
               
                var isCurrent = false;
                
                // If the friendly URL segment matches the current URL segment, the node is the current node
                var currentFriendlyUrlSegment = window.location.href.replace(/\/$/g, '').split('?')[0].split('/').pop();
                if(currentFriendlyUrlSegment.localeCompare(self.friendlyUrlSegment()) == 0) {
                    isCurrent = true;
                }
                return isCurrent;
                
            }, this);
            
            self.excludeFromGlobalNavigation = ko.observable(node.ExcludeFromGlobalNavigation);    
            self.excludeFromCurrentNavigation = ko.observable(node.ExcludeFromCurrentNavigation);    

			populateObservableNodeArray(node.ChildNodes, self.children);
		};
	};
	
	return navigationModule;
});