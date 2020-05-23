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

	Papa.parse("/covid-19-endangeredlanguages/ELP-COVID.csv", {
		download: true,
		step: function(row) {
			var langName = row.data[0].trim();
			var langId = Base64.encode(row.data[0].trim());

			if(LANG_BLOCKS[langId]) {
				LANG_BLOCKS[langId].data = row.data;
				
				var searchTerm = [langName, row.data[1].trim(), row.data[2].trim()]
				.filter(function (item) { return !!item }).join(" | ");
				
				TERMS[searchTerm] = langId;
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

		var searchInput = $("#main-search");

		searchInput.autocomplete({
			source: terms,
			treshold: 1,
			maximumItems: 30,
			onSelectItem: onSelectItem,
			highlightClass: 'text-danger',
			dropdownOptions: {
				flip: false,
			}
		});
	
		$("#search-button").click(function () {
			setTimeout(function () { 
				searchInput.focus(); 
				searchInput.click();
				setTimeout(function () {
					$("#search-box .dropdown-menu.show .dropdown-item").first().click();
				}, 0)
			}, 0);
		})
	}

	$("#main-search").click(function() {
		if(window.innerWidth < 768 && (window.pageYOffset || document.documentElement.scrollTop) === 0) {
			window.location.hash = "#search-box";
		}
	}).keypress(function(e) {
	    if(e.which == 13) {
			setTimeout(function () {
				$("#search-box .dropdown-menu.show .dropdown-item").first().click();
			}, 0)
	    }
	});
})()
