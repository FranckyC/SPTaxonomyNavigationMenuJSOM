// ====================
// Taxonomy module
// ====================
define([], function () {
	
	var taxonomyModule = function(){
	
		// TODO: Implement cache mecanism for faster loading?
		this.getGlobalNavigationTaxonomyNodes = function (termSetId, restrictToCurrentTerm) {

			var deferred = new $.Deferred();

			var context = SP.ClientContext.get_current();
			var currentWeb = SP.ClientContext.get_current().get_web();

			// Create view to return all navigation terms
			var termSetView = new SP.Publishing.Navigation.NavigationTermSetView(context, currentWeb, 'GlobalNavigationTaxonomyProvider');
			termSetView.set_excludeTermsByProvider(true);

			var taxSession = SP.Taxonomy.TaxonomySession.getTaxonomySession(context);
			var termStore = taxSession.getDefaultSiteCollectionTermStore();
			var termSet = termStore.getTermSet(termSetId);

			// The method 'getTermSetForWeb' gets the cached read only version of the term set
			// https://msdn.microsoft.com/EN-US/library/office/microsoft.sharepoint.publishing.navigation.taxonomynavigation.gettermsetforweb.aspx
			// Ex: var webNavigationTermSet = SP.Publishing.Navigation.TaxonomyNavigation.getTermSetForWeb(context, currentWeb, 'GlobalNavigationTaxonomyProvider', true);
			// In our case, we use 'getAsResolvedByWeb' method instead to retrieve a taxonomy term set as a navigation term set regardless if it is bound to the current web. The downside of this approach is that the results are not retrieved from cache causing performance impacts om the initial loading
			var webNavigationTermSet = SP.Publishing.Navigation.NavigationTermSet.getAsResolvedByWeb(context, termSet, currentWeb, 'GlobalNavigationTaxonomyProvider');
			context.load(webNavigationTermSet);

			var firstLevelNavigationTerms = webNavigationTermSet.getWithNewView(termSetView).get_terms();
			var allNavigationterms = webNavigationTermSet.getWithNewView(termSetView).getAllTerms();

			// Remove the potential '/' at the end of the URL
			var currentUrl = window.location.pathname.replace(/\/$/g, '');

			// If the current URL is not equal to the root site URL
			if (restrictToCurrentTerm && (currentUrl.localeCompare(_spPageContextInfo.siteServerRelativeUrl) != 0)) {

				// Get the current navigation term from the URL
				var currentTerm = webNavigationTermSet.findTermForUrl(currentUrl);
				firstLevelNavigationTerms = currentTerm.get_parent().get_terms();
			}

			context.load(allNavigationterms, 'Include(Id, Terms, Title, FriendlyUrlSegment)');
			context.load(firstLevelNavigationTerms, 'Include(Id, Terms, Title, FriendlyUrlSegment)');

			context.executeQueryAsync(function () {

				getTermNodesAsFlat(context, allNavigationterms).done(function (nodes) {
					 
					var navigationTree = getTermNodesAsTree(context, nodes, firstLevelNavigationTerms);

					deferred.resolve(navigationTree);

				});

			}, function (sender, args) {
				deferred.reject(sender, args);
			});

			return deferred.promise();
		};

		// Get the navigation hierarchy as a flat list
		// This list will be used to easily find a node without dealing too much with asynchronous calls and recursion 
		var getTermNodesAsFlat = function (context, allTerms) {

			function getSingleTermNodeInfo(fn){

				if (i < termCount)
				{
					var currentTerm = termsEnumerator.get_current();
					var termNode = {
						"Id": currentTerm.get_id().toString(),
						"Title": currentTerm.get_title().get_value(),
						"Url": "",
						"TaxonomyTerm": currentTerm,
						"FriendlyUrlSegment": currentTerm.get_friendlyUrlSegment().get_value(),
						"ChildNodes": [],
					}

					getNavigationTermUrl(context, currentTerm).done(function (termUrl) {

						termNode.Url = termUrl
						termNodes.push(termNode);
						i++;
						termsEnumerator.moveNext();
						getSingleTermNodeInfo(fn);
					});           
				}
				else
				{
					fn(termNodes);
				}       
			}

			var deferred = new $.Deferred();

			var termsEnumerator = allTerms.getEnumerator();
			var termCount = allTerms.get_count();
			var i = 0;
			var termNodes = new Array();

			termsEnumerator.moveNext();
			getSingleTermNodeInfo(function (navNodes) {

				deferred.resolve(navNodes);

			});

			return deferred.promise();
		}
	 
		// Find a specific navigation term in the flat list of all navigation terms
		var findTermNode = function (allTerms, termId) {
	 
			for (i = 0; i < allTerms.length; i++) {

				if (allTerms[i].Id.localeCompare(termId.toString()) === 0)
				{
					return allTerms[i];
				}
			}
			return null;
		}

		var getTermNodesAsTree = function (context, allTerms, currentNodeTerms) {

			// Special thanks to this blog post:  https://social.msdn.microsoft.com/Forums/office/en-US/ede1aa39-4c47-4308-9aef-3b036ec9b318/get-navigation-taxonomy-term-tree-in-sharepoint-app?forum=appsforsharepoint
			var termsEnumerator = currentNodeTerms.getEnumerator();
			var termNodes = new Array();

			while (termsEnumerator.moveNext()) {

				// Get the corresponding navigation node in the flat tree
				var currentNode= findTermNode(allTerms, termsEnumerator.get_current().get_id().toString());
		  
				var subTerms = currentNode.TaxonomyTerm.get_terms();
				if (subTerms.get_count() > 0) {

					currentNode.ChildNodes = getTermNodesAsTree(context, allTerms, subTerms)
				}

				termNodes.push(currentNode);
			}

			return termNodes;
		}

		var getNavigationTermUrl = function (context, navigationTerm) {

			var deferred = new $.Deferred();

			// This method get the resolved URL whatever if it is a simple link or a friendly URL
			var termUrl = navigationTerm.getResolvedDisplayUrl();

			context.load(navigationTerm);

			context.executeQueryAsync(function () {

				deferred.resolve(termUrl.get_value());

			}, function (sender, args) {

				deferred.reject(sender, args);
			});

			return deferred.promise()
		}
		
	};
	
	return taxonomyModule;	
});

