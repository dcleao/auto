
var IQble = A.IQueryable = A.create(IEble);

// Null IQueryable
var NQble = A.create(IQble);

// Query implementation for enumerable-likes
var EbleQ = F_extend(IQble, function(s) {
    s = toEble(s);
    this.enumerate = function() { return s.enumerate(); };
});

//var AdhoqQ = F_extend(IQble, function(enumerate) {
//this.enumerate = enumerate;
//});

/*
 * Stack execution model, for selectMany? --> etor.parent
 * 
 * Query(able)
 * DONE
 * GENERAL
 * .select() // as(), cast() would safely receive only one argument
 * .where()
 * .selectMany()
 * .take(n)
 * .takeWhile(pred)
 * .skip(n)
 * .skipWhile(pred)
 * .reverse()
 * .call(name, arg1, ...)
 * .apply(name, args)
 * .distinct()
 * .concat(seq)
 * TEST
 *  .any(pred)
 *  .all(pred)
 * REDUCE
 *  .indexOf(item)
 *  .at(index)
 *  .reduce()
 *  .count() -> n
 *  .array()
 *  .first(pred)
 *  .last (pred)
 *  .single()
 *  .min()
 *  .max()
 *  .orderBy() // sort
 *  .sum()
 *  .avg()
 *  .object()
 *  .each
 * 
 * TODO
 * GENERAL
 * .ofType()
 * .except(seq)
 * .union(seq)
 * 
 * .intersect(seq)
 * .groupBy(key, groupConstructor) -> Groups
 * .zip(seq)
 * 
 *  TEST
 *  .contains(item)
 *  .empty()
 *  
 *  REDUCE
 *  .indexOf(item)
 *  .at(index)
 *  .single()
 *  .orderBy() // sort
 *  .avg()
 *  .object()
 */
