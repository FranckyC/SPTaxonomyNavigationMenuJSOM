// ====================
// Contextual menu component
// ====================
define(['jQuery',
        'Knockout',
        'text!Templates/template.contextualmenu.html', 
        'NavigationViewModel',
        'TaxonomyModule'], function($, ko, htmlTemplate, NavigationViewModelRef, TaxonomyModuleRef) {
            
    var taxonomyModule = new TaxonomyModuleRef();
    
    var getNodeByFriendlyUrlSegment =  function (nodes, currentFriendlyUrlSegment) {
        
        if (nodes) {
            for (var i = 0; i < nodes.length; i++) {
                if (nodes[i].FriendlyUrlSegment == currentFriendlyUrlSegment) {
                    return nodes[i];
                }
                var found = getNodeByFriendlyUrlSegment(nodes[i].ChildNodes, currentFriendlyUrlSegment);
                if (found) return found;
            }
        }
    }
       
    function contextualMenuComponent(params) {
                
        var self = this;
        var isCached = false;
                
        // Use the existing navigation view model intialized with the term set id passed as parameter
        ko.utils.extend(self, new NavigationViewModelRef());      
        
        // Apply Office UI Fabric logic to the contextual menu
        if ($.fn.ContextualMenu) {
            $("component-contextualmenu").ContextualMenu();    
        }  
                       
        if (localStorage.mainMenuNodes != null) {
            
            // Make sure there is a value in the cache
            if (JSON.parse(localStorage.mainMenuNodes).length > 0) {              
                    
                // Contextual menu nodes are deduced from the main menu
                // The contextual menu is like the 'current navigation' in SharePoint, so you can configure visibility for each node in the term store
                var nodes = JSON.parse(localStorage.mainMenuNodes);      
                var navigationTree = nodes;
                        
                // Get the current node from the current URL
                var currentFriendlyUrlSegment = window.location.href.replace(/\/$/g, '').split('?')[0].split('/').pop();
                var currentNode = getNodeByFriendlyUrlSegment(nodes, currentFriendlyUrlSegment);
                
                // If there is no 'ParentFriendlyUrlSegment', this is a root term
                if (currentNode.ParentFriendlyUrlSegment != null) {
                    navigationTree = getNodeByFriendlyUrlSegment(nodes, currentNode.ParentFriendlyUrlSegment);
                    
                    if (navigationTree.ChildNodes.length > 0) {
                        // Display all siblings and child nodes from the current node (just like the CSOM results)
                        // Siblings = children of my own parent ;)
                        navigationTree = navigationTree.ChildNodes;
                    }
                }
                                                        
                self.initialize(navigationTree);
                
                isCached = true;                        	                 
            }
        }

        if (!isCached) {
            
            // If the second parameter is true, it restricts nodes to the current navigation term               
            taxonomyModule.getNavigationTaxonomyNodes(params.termSetId, true)
                .done(function (navigationTree) {
                    
                    // Initialize the mainMenu view model
                    self.initialize(navigationTree);
    
            }).fail(function(sender, args) {
                console.log('Error. ' + args.get_message() + '\n' + args.get_stackTrace());
            });
        }
    }
  
    // Return component definition
    return { viewModel: contextualMenuComponent, template: htmlTemplate };
});