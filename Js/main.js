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
		'TemplateLoaderModule' : 'Modules/module.templateloader'		
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
		'OfficeUiNavBar',
		'OfficeUiContextualMenu'],
		function (domReady, $, ko, navbarModuleRef, taxonomyModuleRef, templateloaderModuleRef) {

	// At this moment, the DOM is already ready ;) (via domReady! dependency)
	
	// Register Knockout components
	var templateloaderModule = new templateloaderModuleRef();
	templateloaderModule.initialize();
	
	// Insert the navbar on the top of the "Oslo" master page
	var tableRow = $(".contentwrapper").closest(".ms-tableRow");				
	$("<div class=\"ms-NavBar\" data-bind='component: \"navbar-component\"'></div>").insertBefore(tableRow);
	
	// Hide the default menu
	$("#DeltaHorizontalQuickLaunch").hide()
		
	// Initialize Office UI Fabric components logic
	if ($.fn.NavBar) {
		$('.ms-NavBar').NavBar();
		$('.ms-NavBar').ContextualMenu();
	}

	var taxonomyModule = new taxonomyModuleRef();

	// Initialize the navigation menu with taxonomy terms
	// If the second parameter is true, it restricts nodes to the current navigation term (use this for a contextual menu)
	// For this example, we use the "Site map" term set
	taxonomyModule.getGlobalNavigationTaxonomyNodes("52d6944d-bd98-48c1-ba45-57d4efe2f941", false)
		.done(function (navigationTree) {

			var navbarModule = new navbarModuleRef();					
			navbarModule.initialize(navigationTree);	
			
			// Apply bindings only to the navbar component
			ko.applyBindings(navbarModule, $(".ms-NavBar")[0]);	
			
			// Contextual menu
			taxonomyModule.getGlobalNavigationTaxonomyNodes("52d6944d-bd98-48c1-ba45-57d4efe2f941", true)
				.done(function (navigationTree) {

					var navbarModule = new navbarModuleRef();					
					navbarModule.initialize(navigationTree);	
					
					// Check if the contexutal menu tag is present
					if ($(".contextualmenu-component").length > 0)
					{
						$(".contextualmenu-component").ContextualMenu();
						
						// Can't use custom element '<contextualmenu-component>' in SharePoint HTML source so we use the classic syntax with custom class instead
						// To add the contextual menu on a page insert the following html
						// <div class="contextualmenu-component" data-bind='component : "contextualmenu-component"'></div>
						
						// Apply bindings only to the navbar component
						ko.applyBindings(navbarModule, $(".contextualmenu-component")[0]);	
					}			
			});	
			
						
	});	
});