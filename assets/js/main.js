(function () {
	// 1 Read the HTML and associate each block to a language.
	// 2 Download the CSV and parse it for building the search indexes for Fuse.js
	// 3 Build the fuse search indexes.
	// 4 Associate the autocomplete search with the Fuse.js results

	var LANG_BLOCKS = {};
	var TERMS = {};

	$(".lang-section").each(function (item) {
		LANG_BLOCKS[this.dataset.langId] = {element: this, data: null, id: this.dataset.langId}; 
	});


	Papa.parse("/ELP-COVID.csv", {
		download: true,
		step: function(row) {
			var langName = row.data[0].trim();
			var langId = Base64.encode(row.data[0].trim());
			if(LANG_BLOCKS[langId]) {
				LANG_BLOCKS[langId].data = row.data;
				TERMS[langName] = langId;
				
				row.data[1].split(",").forEach(function (term) {
					term = term.trim();
					if(!term) return;
					TERMS[term] = langId;
				});

				var countryAndRegion = row.data[2] + " > " + row.data[3];

				TERMS[countryAndRegion] = langId;
			}
		},
		complete: function() {
			startAutocompleteSearch(TERMS)
		}
	});

	function startAutocompleteSearch(terms) {
		function onSelectItem(item, element) {
			window.location.hash = "#" + item.value;
		}

		console.log(terms);

		$("#main-search").autocomplete({
			source: terms,
			treshold: 1,
			maximumItems: 30,
			onSelectItem: onSelectItem,
			highlightClass: 'text-danger'
		});
	}
})()
