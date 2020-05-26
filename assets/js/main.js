(function () {
	// 1 Read the HTML and associate each block to a language.
	// 2 Download the CSV and parse it for building the search indexes for Fuse.js
	// 3 Build the fuse search indexes.
	// 4 Associate the autocomplete search with the Fuse.js results

	var LANG_BLOCKS = {};
	var TERMS = {};
	var COUNTRIES = {};

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
				
				TERMS[searchTerm] = {id: langId, type: "lang"};

				// We want to index too languages
				row.data[2].split(",").forEach(function (country) {
					country = country.trim().toLowerCase();
					country = country.charAt(0).toUpperCase() + country.slice(1);

					var countryId = Base64.encode(country);

					TERMS[country] = {id: Base64.encode(country), type: "country"};

					if(COUNTRIES[countryId]) {
						COUNTRIES[countryId].push(langId);
					} else {
						COUNTRIES[countryId] = [langId];
					}
				})
			}
		},
		complete: function() {
			startAutocompleteSearch(TERMS)
		}
	});

	var typeMapping = {
		lang: {text: "LANG", css: "background-red"},
		country: {text: "COUNTRY", css: "background-green"},
	}

	function buttonRenderer (value, labelHTML, labelText, opt) {

		var mapping = typeMapping[value.type];

		return '<button type="button" class="dropdown-item" data-selected-label="' + labelText +'" data-value="' + value.id + '" data-type="' + value.type + '">' + 
			'<span class="' + mapping.css + ' rounded px-1 mr-2 text-white">' + 
				mapping.text + 
			"</span>" +
			labelHTML + 
		'</button>';
	}

	function filterByLang (countryId) {
		var idsToShow = COUNTRIES[countryId];

		var languageBlocks = document.querySelectorAll(".lang-section");
		languageBlocks.forEach(function (element) {
			element.style.display = "none";
		});

		idsToShow.forEach(function (id) {
			var element = document.getElementById(id);
			if(!element) return;
			element.style.display = "";
		});

		document.getElementById("languages-filtered-warning").classList.remove("d-none");
	}

	function resetLangsVisibility () {
		var languageBlocks = document.querySelectorAll(".lang-section");
		languageBlocks.forEach(function (element) {
			element.style.display = "";
		});

		document.getElementById("languages-filtered-warning").classList.add("d-none");
	}

	function startAutocompleteSearch(terms) {
		function onSelectItem(item, input) {
			var type = $(item.element).data('type');

			if(type === "country") {
				filterByLang(item.value)
			} else if (type === "lang") {
				resetLangsVisibility();
				window.location.hash = "#" + item.value;
			}

			$(':focus').blur();
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
			},
			buttonRenderer: buttonRenderer, 
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

		$("#show-all-languages").click(resetLangsVisibility);
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
