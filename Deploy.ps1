[CmdletBinding()]
Param(
	[Parameter(Mandatory=$True,Position=1)]
	[string]$SiteUrl,

	[Parameter(Mandatory=$True)]
	[string]$UserName,

	[Parameter(Mandatory=$True)]
	[string]$Password
)

# -----------------
# Include utility scripts
# -----------------
.".\Utility\Navigation.ps1" 

# -----------------
# Connect to the site
# -----------------

$PasswordAsSecure = ConvertTo-SecureString $Password -AsPlainText -Force
$Credentials = New-Object System.Management.Automation.PSCredential ($UserName , $PasswordAsSecure)
Connect-SPOnline -Url $SiteUrl -Credentials $Credentials

$SiteMapTermSetId = "52d6944d-bd98-48c1-ba45-57d4efe2f941"

# -----------------
# Provision a dummy taxonomy term set
# -----------------
$0 = $myInvocation.MyCommand.Definition
$CommandDirectory = [System.IO.Path]::GetDirectoryName($0)

$TaxonomyconfigurationFilePath = $CommandDirectory + ".\Taxonomy.xml"
Import-SPOTermGroupFromXml -Path $TaxonomyconfigurationFilePath

# -----------------
# Set the term set to be the navigation term set for the web
# -----------------

# Warning: Using CSOM is different form using PnP cmdlets
# Don't use the "Get-SPOContext" PnP cmdlet to retrieve the context when working with CSOM
# If you do so, you will get an error when converting "ClientContext" to "ClientRuntimeContext" and other CSOM surprises
$Context = New-Object Microsoft.SharePoint.Client.ClientContext($SiteUrl) 
$SPCredentials = New-Object Microsoft.SharePoint.Client.SharePointOnlineCredentials($UserName, $PasswordAsSecure)
$Context.Credentials = $SPCredentials

MapTermSetToNavigationContext -Context $Context -TermSetId $SiteMapTermSetId -GlobalNavigation
# Event if we don't use the current navigation, we have to set it with the same term set (don't work otherwise)
MapTermSetToNavigationContext -Context $Context -TermSetId $SiteMapTermSetId -CurrentNavigation

$Context.Dispose()

# -----------------
# Upload files in the style library (folders are created automatically by the PnP cmdlet)
# -----------------
Add-SPOFile -Path ".\Html\navbar.html" -Folder "/Style Library/NavigationSample/Html" -Checkout
Add-SPOFile -Path ".\Js\Modules\module.navigation.js" -Folder "/Style Library/NavigationSample/Js/Modules" -Checkout
Add-SPOFile -Path ".\Js\Modules\module.taxonomy.js" -Folder "/Style Library/NavigationSample/Js/Modules" -Checkout
Add-SPOFile -Path ".\Js\Modules\module.templateloader.js" -Folder "/Style Library/NavigationSample/Js/Modules" -Checkout
Add-SPOFile -Path ".\Js\OfficeUI\Jquery.NavBar.js" -Folder "/Style Library/NavigationSample/Js/OfficeUI" -Checkout
Add-SPOFile -Path ".\Js\OfficeUI\Jquery.ContextualMenu.js" -Folder "/Style Library/NavigationSample/Js/OfficeUI" -Checkout
Add-SPOFile -Path ".\Js\main.js" -Folder "/Style Library/NavigationSample/Js" -Checkout
Add-SPOFile -Path ".\Js\require.js" -Folder "/Style Library/NavigationSample/Js" -Checkout
Add-SPOFile -Path ".\Js\Lib\jquery-2.2.0.min.js" -Folder "/Style Library/NavigationSample/Js/Lib/" -Checkout
Add-SPOFile -Path ".\Js\Lib\knockout-3.4.0.js"-Folder "/Style Library/NavigationSample/Js/Lib/" -Checkout
Add-SPOFile -Path ".\Js\Plugins\domReady.js"-Folder "/Style Library/NavigationSample/Js/Plugins/" -Checkout

# -----------------
# Add CSS and Js links to all pages
# -----------------
$OfficeUiCoreCss = "document.write('<link rel=""stylesheet"" href=""https://appsforoffice.microsoft.com/fabric/1.0/fabric.min.css""/>');"
$OfficeUiComponentsCss = "document.write('<link rel=""stylesheet"" href=""https://appsforoffice.microsoft.com/fabric/1.0/fabric.components.min.css""/>');"
$RequireJs = "document.write('<script data-main=""$SiteUrl/Style Library/NavigationSample/Js/main"" src=""$SiteUrl/Style Library/NavigationSample/Js/require.js""><\/script>');"

Remove-SPOJavaScriptLink -Name OfficeUiCoreCss -Scope Site -Force
Remove-SPOJavaScriptLink -Name OfficeUiComponentsCss -Scope Site -Force
Remove-SPOJavaScriptLink -Name RequireJs -Scope Site -Force

# Add Office UI Fabric Css
Add-SPOJavaScriptBlock -Key OfficeUiComponentsCss -Script $OfficeUiComponentsCss -Scope Site
Add-SPOJavaScriptBlock -Key OfficeUiCoreCss -Script $OfficeUiCoreCss -Scope Site

# Add Js library link
# Don't use the Add-SPOJavaScriptLink cmdlet to add JavaScript files because you CAN'T guarantee the loading order ("Sequence" parameter is useless...). 
# We use RequireJS to avoid the SP.SOD mecanism nigthmare and properly define loading sequence and dependencies for JS files ;)
Add-SPOJavaScriptBlock -Key RequireJs -Script $RequireJs -Scope Site

# Set the "Oslo" master page
# In PnP Core:
# - SetCustomMasterPageByName() = Site Master Page
# - SetMasterPageByName() = System Master Page
# You need to use directly the .master file instead of the .html one.
Set-SPOMasterPage -CustomMasterPageSiteRelativeUrl "_catalogs/masterpage/oslo.master"