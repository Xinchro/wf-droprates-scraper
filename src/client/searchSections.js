let minSearchLimit = 2

onmessage = function(e) {
  // specify sections and terms
  let sections = e.data[0]
  let terms = e.data[1]

  let sectionsToAdd = []

  // if sections in undefined/etc. return an empty array
  if(!sections) postMessage([])

  // loop through sections
  sections.forEach((section) => {
    // temp section to add stuff to
    let tempSection = {}
    // know whether to add the section or not
    let addSection = true

    // set section title
    tempSection.section = JSON.parse(JSON.stringify(section.section))

    // copy subsections and items (if exist) to temp section
    if(section.subSections) tempSection.subSections = JSON.parse(JSON.stringify(section.subSections))
    if(section.items) tempSection.items = JSON.parse(JSON.stringify(section.items))

    // loop through each search term and check against section title
    terms.forEach(searchTerm => {
      // limit search to 2 char min
      if(searchTerm.length >= minSearchLimit) {
        // check if section title includes term
        // on first mismatch, don't add to array
        if(!section.section.toLowerCase().includes(searchTerm.toLowerCase())) {
          addSection = false
        }
      }
    })

    // if all terms match, add to array
    if(addSection) {
      sectionsToAdd.push(tempSection)
    } else if(section.subSections) {
      // check subsections with terms, if exist, and add to section
      tempSection.subSections = searchSubSections(section.subSections, terms)

      //don't add empty array
      if(tempSection.subSections.length > 0) sectionsToAdd.push(tempSection)
    } else if(section.items) {
      // check items with terms, if exist, and add to section
      tempSection.items = searchItems(section.items, terms)

      //don't add empty array
      if(tempSection.items.length > 0) sectionsToAdd.push(tempSection)
    }
  })

  // return all the sections to add
  postMessage(sectionsToAdd)
}

searchSubSections = function(subSections, terms) {
  let subSectionsToAdd = []

  subSections.forEach(subSection => {
    // temp subsection to add stuff to
    let tempSubSection = {}
    // know whether to add subsection or not
    let addSubSection = true

    // set temp sub title
    tempSubSection.subSection = JSON.parse(JSON.stringify(subSection.subSection))

    // copy items (if exist) to temp section
    if(subSection.items) tempSubSection.items = JSON.parse(JSON.stringify(subSection.items))

    // loop through each search term and check against sub title
    terms.forEach(searchTerm => {
      // limit search to 2 char min
      if(searchTerm.length >= minSearchLimit) {
        // check if sub title includes terms
        // on first mismatch, don't add to array
        if(!subSection.subSection.toLowerCase().includes(searchTerm.toLowerCase())) {
          addSubSection = false
        }
      }
    })

    // if all terms match, add to array
    if(addSubSection) {
      subSectionsToAdd.push(tempSubSection)
    } else if(subSection.items) {
      // check items with terms, if exist, and add to sub
      tempSubSection.items = searchItems(tempSubSection.items, terms)
      if(tempSubSection.items.length > 0) {
        subSectionsToAdd.push(tempSubSection)
      }
    }
  })

  // return all the subs to add
  return subSectionsToAdd
}

searchItems = function(items, terms) {
  let itemsToAdd = []

  // loop through items
  items.forEach(item => {
    let addItem = true

    // loop through search terms and check against item name
    terms.forEach(searchTerm => {
      // limit search to 2 char min
      if(searchTerm.length >= minSearchLimit) {
        // check if item name includes terms
        // on first mismatch, don't add to array
        if(!item.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          addItem = false
        }
      }
    })

    // if all terms match, add to array
    if(addItem) {
      itemsToAdd.push(item)
    }
  })

  // return all the items to add
  return itemsToAdd
}