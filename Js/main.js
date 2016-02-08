require.config({
	
	paths: {
		
		// SharePoint native libraries
		'SP_RuntimeJs': window.location.origin + "/_layouts/15/sp.runtime",
		'SP_Js': window.location.origin + "/_layouts/15/sp",
		'SP_TaxonomyJs': window.location.origin + "/_layouts/15/sp.taxonomy",
		'SP_PublishingJs': window.location.origin + "/_layouts/15/sp.publishing",
		
		// Third party libraries
		// They can alternatively loaded by CDN (See https://github.com/requirejs/example-jquery-cdn)
        'jQuery': 'Lib/jquery-2.2.0.min',
        'Knockout': 'Lib/knockout-3.4.0',
		
		// RequireJS Plugins
		// We use domReady RequireJS plugin instead of $(document).ready()
		// See http://requirejs.org/docs/api.html#pageload
		'domReady' : 'Plugins/domReady',
		
		// Office UI Fabric scripts
		'OfficeUiNavBar' : 'OfficeUI/Jquery.NavBar',
		'OfficeUiContextualMenu' : 'OfficeUI/Jquery.ContextualMenu',
		
		// Application modules
		// Paths are relative to the main.js script inside the style library
		'TaxonomyModule' :  'Modules/module.taxonomy',
		'NavBarModule' : 'Modules/module.navigation',
		'TemplateLoaderModule' : 'Modules/module.templateloader',
        'UtilityModule' : 'Modules/module.utility',
    },
	
    shim: {
		
        'jQuery': {
            exports: '$'
        },
		
        'Knockout': {
			deps: ['jQuery'],
            exports: 'ko'
        },
		
		'SP_Js' : {
			deps: ['SP_RuntimeJs']
        },
		
		'SP_TaxonomyJs' : {
			deps: ['SP_Js']
        },
		
		'SP_PublishingJs' : {
			deps: ['SP_Js']
        },

		'OfficeUiNavBar' : {
			deps: ['jQuery']
        },
		
		'OfficeUiContextualMenu' : {
			deps: ['jQuery']
        },
		
		'TaxonomyModule' : {
			deps: ['SP_Js', 'SP_TaxonomyJs', 'SP_PublishingJs']
        },
		
		'TemplateLoaderModule' : {
			deps: ['SP_Js']
        }
    }
});

require(['domReady!',
		'jQuery', 
		'Knockout',
		'NavBarModule',
		'TaxonomyModule',
		'TemplateLoaderModule',
        'UtilityModule',
		'OfficeUiNavBar',
		'OfficeUiContextualMenu'],
		function (domReady, $, ko, navbarModuleRef, taxonomyModuleRef, templateloaderModuleRef, utilityModuleRef) {

	// At this moment, the DOM is already ready ;) (via domReady! dependency)
    
    // Get references to modules
    var taxonomyModule = new taxonomyModuleRef();
    var navbarModule = new navbarModuleRef();
    var templateloaderModule = new templateloaderModuleRef();
    var utilityModule = new utilityModuleRef();
    
	// Register Knockout components
	templateloaderModule.initialize();
	
	// Insert the navbar on the top of the "Oslo" master page
	var tableRow = $(".contentwrapper").closest(".ms-tableRow");				
	$("<div class=\"ms-NavBar\" data-bind='component: \"navbar-component\"'></div>").insertBefore(tableRow);
    
    // Initialize Office UI Fabric components logic
	if ($.fn.NavBar) {
		$('.ms-NavBar').NavBar();
		$('.ms-NavBar').ContextualMenu();
	}
	
	// Hide the default SharePoint navigationmenu
	$("#DeltaHorizontalQuickLaunch").hide()
		  
   // Check if the local storage is available for the browser (cache of the browser) 
   if (window.localStorage != null)   {
       // Check if navigation nodes are already in the local storage
       if (localStorage.navbarNodes != null) {
           
            // Load navigation tree from the local storage browser cache
            navbarModule.initialize(JSON.parse(localStorage.navbarNodes));	
                    
            // Apply bindings only to the navbar component
            ko.applyBindings(navbarModule, $(".ms-NavBar")[0]);	
            
            loadContextualMenu();
       }
       else {
           loadMainMenu().done(function(){
               loadContextualMenu();
           });
       }
   }
   else {
        loadMainMenu().done(function(){
               loadContextualMenu();
        });
   }
     
   function loadMainMenu() {
       
       var deferred = new $.Deferred();
       
        // Initialize the navigation menu with taxonomy terms
        // If the second parameter is true, it restricts nodes to the current navigation term (used for the contextual menu)
        // For this example, we use the "Site map" term set
        taxonomyModule.getGlobalNavigationTaxonomyNodes("52d6944d-bd98-48c1-ba45-57d4efe2f941", false)
            .done(function (navigationTree) {
				
                navbarModule.initialize(navigationTree);	
                
                // Apply bindings only to the navbar component
                ko.applyBindings(navbarModule, $(".ms-NavBar")[0]);	
                
                // Set the navigation tree in the local storage of the browser
                localStorage.navbarNodes = utilityModule.stringifyTreeObject(navigationTree);
                
                deferred.resolve();	
                
        }).fail(function() {
            
            deferred.reject();	
        });	 
        
        return deferred.promise();
   } 
   
   function loadContextualMenu(){
       
        // Check if the contexutal menu tag is present on the page
        if ($(".contextualmenu-component").length > 0) {                                   
            // Contextual menu
            taxonomyModule.getGlobalNavigationTaxonomyNodes("52d6944d-bd98-48c1-ba45-57d4efe2f941", true)
                .done(function (navigationTree) {
            
                    // Get a new instance of navbar module to avoid conflict with the main menu
                    var navbarModule = new navbarModuleRef();
                    navbarModule.initialize(navigationTree);	
                                            
                    $(".contextualmenu-component").ContextualMenu();
                    
                    // We can't use the custom element '<contextualmenu-component>' in SharePoint HTML source (removed automatically) so we use the classic syntax with custom CSS class instead
                    // To add the contextual menu on a page insert the following HTML snippet:
                    // <div class="contextualmenu-component" data-bind='component : "contextualmenu-component"'></div>
                    
                    // Apply bindings only to the navbar component
                    ko.applyBindings(navbarModule, $(".contextualmenu-component")[0]);	
                });	
        }	
   }              
});