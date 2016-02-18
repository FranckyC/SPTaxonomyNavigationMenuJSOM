// ====================
// Navbar component
// ====================
define(['jQuery',
        'Knockout',
        'text!Templates/template.breadcrumb.html', 
        'NavigationViewModel',
        'TaxonomyModule',
        'UtilityModule'], function($, ko, htmlTemplate, NavigationViewModelRef, TaxonomyModuleRef, UtilityModuleRef) {
    
    var taxonomyModule = new TaxonomyModuleRef();
    var utilityModule = new UtilityModuleRef();
        
    var getBreadcrumbNodes = function (nodes) {
  
        var breadcrumbNodes = new Array();   
           
        // Get the current node from the current URL
        var currentFriendlyUrlSegment = utilityModule.getCurrentFriendlyUrlSegment();
        var currentNode = utilityModule.getNodeByFriendlyUrlSegment(nodes, currentFriendlyUrlSegment);

        if (currentNode != undefined) {
         
            breadcrumbNodes.push(currentNode);                         

            while (currentNode.ParentFriendlyUrlSegment != null) {                    
                var parentNode = utilityModule.getNodeByFriendlyUrlSegment(nodes, currentNode.ParentFriendlyUrlSegment);
                breadcrumbNodes.push(parentNode);
                currentNode = parentNode;
            }     

            breadcrumbNodes = breadcrumbNodes.reverse();    
        }
        
        return breadcrumbNodes;
    }

    function breadcrumbComponent(params) {
                
        var self = this;
        var isCached = false;
        
        // Use the existing navigation view model intialized with the term set id passed as parameter in the DOM element
        ko.utils.extend(self, new NavigationViewModelRef());
                        
       if (localStorage.mainMenuNodes != null) {
            
            // Make sure there is a value in the cache
            if (JSON.parse(localStorage.mainMenuNodes).length > 0) {              
                    
                // Breadcrumb menu nodes are deduced from the main menu
                var nodes = JSON.parse(localStorage.mainMenuNodes);          
                                                        
                self.initialize(getBreadcrumbNodes(nodes));
                
                isCached = true;                        	                 
            }
        }
        
        if (!isCached) {
            
            // Get all the nodes from the main menu    
            taxonomyModule.getNavigationTaxonomyNodes(params.termSetId, false)
                .done(function (navigationTree) {
                    
                    self.initialize(getBreadcrumbNodes(navigationTree));                                                               
                                            
            }).fail(function(sender, args) {
                console.log('Error. ' + args.get_message() + '\n' + args.get_stackTrace());
            });
        }                   
    }
  
    // Return component definition
    return { viewModel: breadcrumbComponent, template: htmlTemplate };
});