// ====================
// Navbar component
// ====================
define(['jQuery',
        'Knockout',
        'text!Templates/template.mainmenu.html', 
        'NavigationViewModel',
        'TaxonomyModule',
        'UtilityModule',  
        'OfficeUiNavBar',
        'OfficeUiContextualMenu'], function($, ko, htmlTemplate, NavigationViewModelRef, TaxonomyModuleRef, UtilityModuleRef) {
            
    
    var taxonomyModule = new TaxonomyModuleRef();
    var utilityModule = new UtilityModuleRef();

    function mainMenuComponent(params) {
                
        var self = this;
        var isCached = false;
        
        // Use the existing navigation view model intialized with the term set id passed as parameter in the DOM element
        ko.utils.extend(self, new NavigationViewModelRef());
        
        // Initialize Office UI Fabric components logic for the main menu
        if ($.fn.NavBar && $.fn.ContextualMenu) {
            $('.ms-NavBar').NavBar();
            $('.ms-NavBar').ContextualMenu();
        }
                
        if (localStorage.mainMenuNodes != null) {

            // Make sure there is a value in the cache
            if (JSON.parse(localStorage.mainMenuNodes).length > 0) {               
                // Load navigation tree from the local storage browser cache
                self.initialize(JSON.parse(localStorage.mainMenuNodes));    
                
                isCached = true;            
            }          
        }
        
        if (!isCached) {
            
            // Initialize the main menu with taxonomy terms            
            taxonomyModule.getNavigationTaxonomyNodes(params.termSetId, false)
                .done(function (navigationTree) {
                    
                    // Initialize the mainMenu view model
                    self.initialize(navigationTree);
                                                                    
                    // Set the navigation tree in the local storage of the browser
                    localStorage.mainMenuNodes = utilityModule.stringifyTreeObject(navigationTree);
                                            
            }).fail(function(sender, args) {
                console.log('Error. ' + args.get_message() + '\n' + args.get_stackTrace());
            });
        }
                     
        // We need a custom knockout binding to ensure DOM manipulations execute after the nav bar rendering (see the template.mainmenu.html file)
        ko.bindingHandlers.loadSearchBox = {
            init: function(elem) {
                
                // Hide the OOTB search box						
                $("#searchInputBox").hide();
                
                // Deactivate all OOTB events (we just want to be able to put some keywords here and redirect to the search results page, no fancy features like scopes,  search button etc.)
                $("#searchInputBox input").prop('onfocus', null).off('focus');
                $("#searchInputBox input").prop('onblur', null).off('blur');
                $("#searchInputBox input").prop('onkeydown', null).off('keydown');
                
                // Modify the CSS to integrate nicely with the navabr 
                $("#searchInputBox input").removeClass().addClass("ms-TextField-field");
                
                // Remove the default value "Search this site..."
                $("#searchInputBox input").val("");

                // Add the input only to the nav bar
                $(elem).append($("#searchInputBox input"));					
            }
        }
    }
  
    // Return component definition
    return { viewModel: mainMenuComponent, template: htmlTemplate };
});