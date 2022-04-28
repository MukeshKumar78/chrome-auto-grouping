document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("Groupify").addEventListener('click', execScript);
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("UnGroupify").addEventListener('click', UnGroupifyFunction);
});


async function UnGroupifyFunction() {
    chrome.tabs.query({}, tabs => {
        chrome.tabs.ungroup(tabs.map(tab => tab.id));
    })
}

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
					}, id => {
						console.log(url)
						chrome.tabGroups.update(id, {
							title: (url.split('.')[0] == "www" || url.split('.')[0] == "web" ? url.split('.')[1] : url.split('.')[0])
						});
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


function getHostName(url) {
	var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
	if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
		var hostname = match[2].split(".");
		return hostname[0];
	}
	else {
		return null;
	}
}