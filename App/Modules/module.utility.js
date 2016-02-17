// ====================
// Utility module
// ====================
define([], function () {
 
 	var utilityModule = function(){
         
         this.stringifyTreeObject = function (object) {
                   
             var cache = [];
             var stringified = JSON.stringify(object, function(key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return;
                        }
                        // Store value in our collection
                        cache.push(value);
                    }
                    return value;
                });
                cache = null;
                
             return stringified;
         } 
    }

    return utilityModule  
});