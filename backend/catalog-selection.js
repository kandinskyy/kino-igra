const categories = require('../shared/catalog-categories.json');
const superheroIds = new Set(require('../shared/superhero-catalog.json').works.map(work => work.id));
const categoryIds = new Set(categories.map(category => category.id));
const specialIds = new Set(categories.filter(category => category.special).map(category => category.id));

function validCategorySelection(selection) {
  if (!Array.isArray(selection) || !selection.length || selection.some(id => !categoryIds.has(id))) return false;
  const unique = [...new Set(selection)];
  return !unique.some(id => specialIds.has(id)) || unique.length === 1;
}

/** Special collections reference existing records instead of duplicating them. */
function selectedCatalog(catalog, selection = ['films']) {
  if (!validCategorySelection(selection)) throw Error('Особую категорию нельзя сочетать с обычными');
  const uniqueIds = new Set();
  return catalog.filter(movie => {
    const selected = selection.includes('superheroes')
      ? superheroIds.has(movie.id) && ['films', 'series', 'cartoons'].includes(movie.category)
      : selection.includes(movie.category);
    if (!selected || uniqueIds.has(movie.id)) return false;
    uniqueIds.add(movie.id);
    return true;
  });
}

module.exports = { validCategorySelection, selectedCatalog };
