chrome.action.onClicked.addListener(execScript)

async function execScript() {
	sortTabs("url", () => {
		chrome.tabs.query({}, tabs => {
			const groups = {}
			tabs.forEach(tab => {
				let url;
				try{
					url = new URL(tab.url).host;				
				}
				catch{
					return;
				}
				if(!Object.keys(groups).find(u => u == url)){
					groups[url] = [tab.id]
				}
				else{
					groups[url].push(tab.id);
				}
			});
	
			queue = [];
	
			Object.entries(groups).forEach(([url, ids]) => {
				chrome.tabs.ungroup(ids, () => {
					chrome.tabs.group({
						tabIds: ids
					});
				})
			})
		});	
	});
	
}

function sortTabs(prop, cb){
	prop = prop || "url";
	chrome.tabs.query({currentWindow: true}, function(tabs){
	  tabs.sort(function(a,b){
		return a[prop] == b[prop] ? 0 : (a[prop] < b[prop] ? -1 : 1);
	  });
	  tabs.forEach(function(tab){
		chrome.tabs.move(tab.id, {index: -1});
	  });
	  cb();
	});
}
