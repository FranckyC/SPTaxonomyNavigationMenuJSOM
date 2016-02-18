# Taxonomy navigation menu for SharePoint Online using Office UI Fabric and JSOM

# Getting started

----------

### Complete description

The complete description of key points of this example is available here:

- [Associated blog post (FRENCH)](http://thecollaborationcorner.com/2016/02/09/creer-un-menu-de-navigation-par-taxonomie-pour-sharepoint-online-en-utilisant-jsom-et-office-ui-fabric)

### Summary

This is an example of a taxonomy navigation menu for SharePoint Online using Office UI Fabric and JSOM. Here are the key points of this solution:

- This is a generic solution that you can use without modification except your own term set configuration

- All CSS and menu logic come from the [Office UI Fabric components](http://dev.office.com/fabric/components). The navigation menu is responsive by default.
 
- The navigation menu is added through the [KnockoutJs 'component' binding mechanism](http://knockoutjs.com/documentation/component-binding.html)

- All script dependencies are managed through [RequireJS](http://requirejs.org/), avoiding us to use the SP.SOD nightmare system.

- The deployment sequence is done via PnP cmdlets and SharePoint CSOM

- We use the default "**oslo**" master page from a publishing site with JavaScript injection to insert the navigation bar in all pages

- The navigation menu supports multiple languages

- The default search box is integrated to the navigation bar only by jQuery manipulations

- Both friendly URLs and simple link URLs are supported 

- Components synchronization is done via the Pub/Sub pattern. We use [AmplifyJS](http://amplifyjs.com/) to manage this mechanism.

- Global and Current navigation visibility settings for each term are supported. You can use these properties in your HTML views (see `Templates\template.mainmenu.html` to see an example).

- The source term set for the menu don't have to be necessarily the term set used for the web navigation (for example in the case you only want simple links in your menu). However, to benefit of the friendly URLs, you can use directly the navigation term set configured for the navigation (like this example) **OR** a term set that reuses terms from it to get friendly URLs work.

- The browser local storage is used in this example to show how to cache the main menu navigation nodes

Feel free to extend the current code to meet you requirements. Enjoy!

### Final result
Here is what you get after deploying this example:

![Final result](http://thecollaborationcorner.com/wp-content/uploads/2016/02/final_taxonomy_menu.png)

A responsive navigation menu wired to a taxonomy term set and using the Office Ui Fabric Css classes for rendering.

![Responsive by default](http://thecollaborationcorner.com/wp-content/uploads/2016/02/final_taxonomy_menu_responsive.png)

###Disclaimer

THIS CODE IS PROVIDED AS IS WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.

### Prerequisites

Before starting, you need to install some prerequisites:

- Install the [SharePoint Online Client Components SDK](https://www.microsoft.com/en-ca/download/details.aspx?id=42038). CSOM dlls are deployed in the GAC and used by the `Utility\Navigation.ps1` script via `Add-Type`
- Install [PnP PowerShell cmdlets for SharePoint Online v16](https://github.com/OfficeDev/PnP-PowerShell/tree/master/Binaries)
- Provision a site collection with the "Publishing site" template or with the publishing infrastructure features activated

### Installation

- Download the source code as ZIP from GitHUb and extract it to your destination folder
- Start a PowerShell session as an administrator an call the `Deploy.ps1` script with your parameters like this:

```csharp
$UserName = "username@<your_tenant>.onmicrosoft.com"
$Password = "<your_password>"
$SiteUrl = "https://<your_tenant>.sharepoint.com/sites/<your_site_collection>"

Set-Location "<your_installation_folder>\SPTaxonomyNavigationMenuJSOM"

$Script = ".\Deploy.ps1" 
& $Script -SiteUrl $SiteUrl -UserName $UserName -Password $Password

```

### Usage

#### Use navigation menu with your own term set

By default, the term set used for the menu is the sample term set provisioned with this example. You can use your own term set by specifying the the id in the DOM element for the component in the `main.js` script:

```javascript
...
$("<div class=\"ms-NavBar\"><component-mainmenu params='termSetId: \"<your_termset_id>\"'></component-mainmenu></div>").insertBefore(tableRow);
...
```

...and in the `Deploy.ps1` script:
```
...
$SiteMapTermSetId = "<your_term_set_id>"
...
```
Your term set must be flagged as a navigation term set.

Main menu nodes are cached in the browser local storage. To clear the local storage value, just delete the value `mainMenuNodes` and reload the page.

![Delete the local storage value](http://thecollaborationcorner.com/wp-content/uploads/2016/02/final_local_storage2.png)

#### Icons configuration

For each navigation term, you can configure an specific icon from the [Office UI Fabric styles](http://dev.office.com/fabric/styles), to do so, just add the "IconCssClas" custom property with the desired Css class. 

![Icon configuration for a term](http://thecollaborationcorner.com/wp-content/uploads/2016/02/icon_configuration.png)

In this example, only the first menu level display icons.

#### Contextual menu and breadcrumb

You can add a contextual menu and breadcrumb components to your page just by adding the following HTML markup in a SharePoint page (in a Script Editor Web Part or in a rich HTML field).

`<component-contextualmenu></component-contextualmenu>`

`<component-breadcrumb></component-breadcrumb>`

The main JavaScript will look for these specific DOM elements add will add them dynamically to your page:

Notes:

- You don't need to pass the term set id because the nodes are always deduced form the main menu (whatever if they've been retrieved from the cache or directly from a CSOM call). To do this, we use the Pub/Sub pattern via AmplifyJS library.

- For the contextual menu, only the siblings and children who have been flagged to appear in the current navigation are displayed (the display is controlled directly in the HTML of the template view).

![Contextual menu and breadcrumb](http://thecollaborationcorner.com/wp-content/uploads/2016/02/final_contextual_and_breadcrumb.png)

----------