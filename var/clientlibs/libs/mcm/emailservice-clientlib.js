CQ.EmailService = CQ.EmailService || {};
CQ.EmailService.getConfiguration = function(){
	  var et = document.getElementsByName("cfgpath");
      var cfgPath = "";
      if(et.length > 0){
          cfgPath = et[0].value;
      }	
      return cfgPath;
}

CQ.EmailService.checkEmailService = function()
{
	//context
    if(document.getElementsByName("cfgpath").length == 0){                  
          if(this.xtype=='panel')
          {
        	  this.add({
                "xtype": "static",
                "italic": true,
                "small": true,
                "style": "color:gray;",
                "text": CQ.I18n.getMessage("Email Service not configured")
              });
        	  this.doLayout();
          }
          return false;
    }
    return true;
}
CQ.EmailServiceActionsConfig = (function(){
	return {
			
			optionsCache: {},
			ADD_SUBSCRIBER: "addSubscriber",
			DELETE_SUBSCRIBER:"deleteSubscriber",
			AUTO_RESPONDER:"autoResponder",
			actionsDialogPath:{},
			getProviders: function(){
				var opts = [];
				var es = document.getElementsByName("cfgpath");
				for(var i = 0 ; i < es.length ; i++)
				{
					var v1 = es[i].value;
					var t1 = es[i].value.substr(es[i].value.lastIndexOf('/') + 1);
					opts.push({value:v1,text:t1});
				}
			    opts.sort(function(l1, l2) {
			        if (l1.text < l2.text) {
			            return -1;
			        } else if (l1.text == l2.text) {
			            return 0;
			        } else {
			            return 1;
			        }
			    });
			    return opts;	
		    },
			getESListOptions: function(contentPath) {
				
					var filters;
					if(this.filters && typeof this.filters == "function")
						filters = this.filters();
			        return CQ.EmailServiceActionsConfig.getOptions(contentPath,"getlist",filters);
			},

		    getESEmailOptions: function(contentPath){
		    	
		    	return CQ.EmailServiceActionsConfig.getOptions(contentPath,"getemails");
		    },
			getESEmailClassificationOptions: function(contentPath) {
			
				return CQ.EmailServiceActionsConfig.getOptions(contentPath,"getemailclassifications");
			},
			getOptions: function(contentPath,operation,filterParams) {
				//this function caches the options fetched using the key cfgPath(calculated below) + operation + filterParams			
			try{
			  var opts = []; 
			  var cfgPath = CQ.EmailService.getConfiguration();
			  if(cfgPath == undefined || cfgPath === "")
				  return opts;
			  var cacheKey = cfgPath + operation + (filterParams ? filterParams : "");
			  if(CQ.EmailServiceActionsConfig.optionsCache[cacheKey]!=null && CQ.EmailServiceActionsConfig.optionsCache[cacheKey]!=undefined)
				  return CQ.EmailServiceActionsConfig.optionsCache[cacheKey]; 		      
	          var url =  "/_jcr_content.emailservice.json?operation=" + operation + "&cfgpath=" + cfgPath + (filterParams? "&" +filterParams : "");
	          var url1 = CQ.HTTP.get(url);
	          var data = CQ.HTTP.eval(url1);
			  for (var item in data ) {
			
			    var t1= data[item].name;
			    var v1= data[item].id;
			    var error = data[item].error;
			
			    if(t1 && v1){
			        opts.push({value: v1, text: t1});
			    }else if(error){
			      var content= contentPath + ".json";
			          var contentData = CQ.HTTP.eval(url);
			          contentData.leadCreationError = errorCode;
			          return [];
			        }
			  }
	             
	          opts.sort(function(l1, l2) {
	                if (l1.text < l2.text) {
	                    return -1;
	                } else if (l1.text == l2.text) {
	                    return 0;
	                } else {
	                    return 1;
	                }
	            });
	            CQ.EmailServiceActionsConfig.optionsCache[cacheKey] = opts;	          
	            return opts;
	          } catch (e) {
	            CQ.Log.error("CQ.utils.WCM#"+ operation + " failed: " + e.message);
	          }
	          return [];		
	       }
	}
})();

CQ.EmailServiceActionsConfig.actionSelection = CQ.Ext.extend(CQ.form.Selection,{
	

    constructor: function(config) {
        var defaults = {

        };

        CQ.Util.applyDefaults(config, defaults);
        CQ.EmailServiceActionsConfig.actionSelection.superclass.constructor.call(this,config);
        this.processPath();
    },
    /**
     * Overwrite handling of the initial case where value is not set yet.
     */
    setValue: function(value) {
        if (typeof value == "undefined" || value === null){
            try{
                value = this.optionsConfig.store.data.items[0].data.value;
            }
            catch (e)
            {
                CQ.Log.debug("Error EmailServiceActionSelection option data not initialized: {0}", e.message);            
            }
        }
        CQ.EmailServiceActionsConfig.actionSelection.superclass.setValue.call(this, value);
    }    
});

CQ.Ext.reg("emailServiceActionSelection", CQ.EmailServiceActionsConfig.actionSelection);

CQ.EmailServiceActionsConfig.addActionConfiguration = function(action,configTab,record){
	try{
		if(configTab.xtype!="dialogfieldset")
			return;
		var config = CQ.EmailServiceActionsConfig.fetchActionConfiguration(action);
		if(config){
			var form = configTab.findParentByType('form').getForm();
			for(var i in config){
                if (!config[i] || (typeof config[i] == "string") || (typeof config[i] == "boolean")) {
                    continue;
                }
                var wi = configTab.add(config[i]);
                form.add(wi);
                configTab.doLayout();
                wi.processRecord(record);
			}
		}
	}catch(e){
        CQ.Log.debug("Error while adding action configuration{0} : {1}", action,e.message);
	}
};

CQ.EmailServiceActionsConfig.fetchActionConfiguration = function(action){
	if(typeof action != "string")
		return undefined;
	var url = CQ.EmailServiceActionsConfig.actionsDialogPath[action]; 
	if(!url)
		return undefined;
	return CQ.utils.Util.formatData(CQ.HTTP.eval(url));
};
