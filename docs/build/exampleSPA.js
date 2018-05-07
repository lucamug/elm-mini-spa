
(function() {
'use strict';

function F2(fun)
{
  function wrapper(a) { return function(b) { return fun(a,b); }; }
  wrapper.arity = 2;
  wrapper.func = fun;
  return wrapper;
}

function F3(fun)
{
  function wrapper(a) {
    return function(b) { return function(c) { return fun(a, b, c); }; };
  }
  wrapper.arity = 3;
  wrapper.func = fun;
  return wrapper;
}

function F4(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return fun(a, b, c, d); }; }; };
  }
  wrapper.arity = 4;
  wrapper.func = fun;
  return wrapper;
}

function F5(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return fun(a, b, c, d, e); }; }; }; };
  }
  wrapper.arity = 5;
  wrapper.func = fun;
  return wrapper;
}

function F6(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return fun(a, b, c, d, e, f); }; }; }; }; };
  }
  wrapper.arity = 6;
  wrapper.func = fun;
  return wrapper;
}

function F7(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return fun(a, b, c, d, e, f, g); }; }; }; }; }; };
  }
  wrapper.arity = 7;
  wrapper.func = fun;
  return wrapper;
}

function F8(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) {
    return fun(a, b, c, d, e, f, g, h); }; }; }; }; }; }; };
  }
  wrapper.arity = 8;
  wrapper.func = fun;
  return wrapper;
}

function F9(fun)
{
  function wrapper(a) { return function(b) { return function(c) {
    return function(d) { return function(e) { return function(f) {
    return function(g) { return function(h) { return function(i) {
    return fun(a, b, c, d, e, f, g, h, i); }; }; }; }; }; }; }; };
  }
  wrapper.arity = 9;
  wrapper.func = fun;
  return wrapper;
}

function A2(fun, a, b)
{
  return fun.arity === 2
    ? fun.func(a, b)
    : fun(a)(b);
}
function A3(fun, a, b, c)
{
  return fun.arity === 3
    ? fun.func(a, b, c)
    : fun(a)(b)(c);
}
function A4(fun, a, b, c, d)
{
  return fun.arity === 4
    ? fun.func(a, b, c, d)
    : fun(a)(b)(c)(d);
}
function A5(fun, a, b, c, d, e)
{
  return fun.arity === 5
    ? fun.func(a, b, c, d, e)
    : fun(a)(b)(c)(d)(e);
}
function A6(fun, a, b, c, d, e, f)
{
  return fun.arity === 6
    ? fun.func(a, b, c, d, e, f)
    : fun(a)(b)(c)(d)(e)(f);
}
function A7(fun, a, b, c, d, e, f, g)
{
  return fun.arity === 7
    ? fun.func(a, b, c, d, e, f, g)
    : fun(a)(b)(c)(d)(e)(f)(g);
}
function A8(fun, a, b, c, d, e, f, g, h)
{
  return fun.arity === 8
    ? fun.func(a, b, c, d, e, f, g, h)
    : fun(a)(b)(c)(d)(e)(f)(g)(h);
}
function A9(fun, a, b, c, d, e, f, g, h, i)
{
  return fun.arity === 9
    ? fun.func(a, b, c, d, e, f, g, h, i)
    : fun(a)(b)(c)(d)(e)(f)(g)(h)(i);
}

//import Native.List //

var _elm_lang$core$Native_Array = function() {

// A RRB-Tree has two distinct data types.
// Leaf -> "height"  is always 0
//         "table"   is an array of elements
// Node -> "height"  is always greater than 0
//         "table"   is an array of child nodes
//         "lengths" is an array of accumulated lengths of the child nodes

// M is the maximal table size. 32 seems fast. E is the allowed increase
// of search steps when concatting to find an index. Lower values will
// decrease balancing, but will increase search steps.
var M = 32;
var E = 2;

// An empty array.
var empty = {
	ctor: '_Array',
	height: 0,
	table: []
};


function get(i, array)
{
	if (i < 0 || i >= length(array))
	{
		throw new Error(
			'Index ' + i + ' is out of range. Check the length of ' +
			'your array first or use getMaybe or getWithDefault.');
	}
	return unsafeGet(i, array);
}


function unsafeGet(i, array)
{
	for (var x = array.height; x > 0; x--)
	{
		var slot = i >> (x * 5);
		while (array.lengths[slot] <= i)
		{
			slot++;
		}
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array = array.table[slot];
	}
	return array.table[i];
}


// Sets the value at the index i. Only the nodes leading to i will get
// copied and updated.
function set(i, item, array)
{
	if (i < 0 || length(array) <= i)
	{
		return array;
	}
	return unsafeSet(i, item, array);
}


function unsafeSet(i, item, array)
{
	array = nodeCopy(array);

	if (array.height === 0)
	{
		array.table[i] = item;
	}
	else
	{
		var slot = getSlot(i, array);
		if (slot > 0)
		{
			i -= array.lengths[slot - 1];
		}
		array.table[slot] = unsafeSet(i, item, array.table[slot]);
	}
	return array;
}


function initialize(len, f)
{
	if (len <= 0)
	{
		return empty;
	}
	var h = Math.floor( Math.log(len) / Math.log(M) );
	return initialize_(f, h, 0, len);
}

function initialize_(f, h, from, to)
{
	if (h === 0)
	{
		var table = new Array((to - from) % (M + 1));
		for (var i = 0; i < table.length; i++)
		{
		  table[i] = f(from + i);
		}
		return {
			ctor: '_Array',
			height: 0,
			table: table
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = initialize_(f, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i-1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

function fromList(list)
{
	if (list.ctor === '[]')
	{
		return empty;
	}

	// Allocate M sized blocks (table) and write list elements to it.
	var table = new Array(M);
	var nodes = [];
	var i = 0;

	while (list.ctor !== '[]')
	{
		table[i] = list._0;
		list = list._1;
		i++;

		// table is full, so we can push a leaf containing it into the
		// next node.
		if (i === M)
		{
			var leaf = {
				ctor: '_Array',
				height: 0,
				table: table
			};
			fromListPush(leaf, nodes);
			table = new Array(M);
			i = 0;
		}
	}

	// Maybe there is something left on the table.
	if (i > 0)
	{
		var leaf = {
			ctor: '_Array',
			height: 0,
			table: table.splice(0, i)
		};
		fromListPush(leaf, nodes);
	}

	// Go through all of the nodes and eventually push them into higher nodes.
	for (var h = 0; h < nodes.length - 1; h++)
	{
		if (nodes[h].table.length > 0)
		{
			fromListPush(nodes[h], nodes);
		}
	}

	var head = nodes[nodes.length - 1];
	if (head.height > 0 && head.table.length === 1)
	{
		return head.table[0];
	}
	else
	{
		return head;
	}
}

// Push a node into a higher node as a child.
function fromListPush(toPush, nodes)
{
	var h = toPush.height;

	// Maybe the node on this height does not exist.
	if (nodes.length === h)
	{
		var node = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
		nodes.push(node);
	}

	nodes[h].table.push(toPush);
	var len = length(toPush);
	if (nodes[h].lengths.length > 0)
	{
		len += nodes[h].lengths[nodes[h].lengths.length - 1];
	}
	nodes[h].lengths.push(len);

	if (nodes[h].table.length === M)
	{
		fromListPush(nodes[h], nodes);
		nodes[h] = {
			ctor: '_Array',
			height: h + 1,
			table: [],
			lengths: []
		};
	}
}

// Pushes an item via push_ to the bottom right of a tree.
function push(item, a)
{
	var pushed = push_(item, a);
	if (pushed !== null)
	{
		return pushed;
	}

	var newTree = create(item, a.height);
	return siblise(a, newTree);
}

// Recursively tries to push an item to the bottom-right most
// tree possible. If there is no space left for the item,
// null will be returned.
function push_(item, a)
{
	// Handle resursion stop at leaf level.
	if (a.height === 0)
	{
		if (a.table.length < M)
		{
			var newA = {
				ctor: '_Array',
				height: 0,
				table: a.table.slice()
			};
			newA.table.push(item);
			return newA;
		}
		else
		{
		  return null;
		}
	}

	// Recursively push
	var pushed = push_(item, botRight(a));

	// There was space in the bottom right tree, so the slot will
	// be updated.
	if (pushed !== null)
	{
		var newA = nodeCopy(a);
		newA.table[newA.table.length - 1] = pushed;
		newA.lengths[newA.lengths.length - 1]++;
		return newA;
	}

	// When there was no space left, check if there is space left
	// for a new slot with a tree which contains only the item
	// at the bottom.
	if (a.table.length < M)
	{
		var newSlot = create(item, a.height - 1);
		var newA = nodeCopy(a);
		newA.table.push(newSlot);
		newA.lengths.push(newA.lengths[newA.lengths.length - 1] + length(newSlot));
		return newA;
	}
	else
	{
		return null;
	}
}

// Converts an array into a list of elements.
function toList(a)
{
	return toList_(_elm_lang$core$Native_List.Nil, a);
}

function toList_(list, a)
{
	for (var i = a.table.length - 1; i >= 0; i--)
	{
		list =
			a.height === 0
				? _elm_lang$core$Native_List.Cons(a.table[i], list)
				: toList_(list, a.table[i]);
	}
	return list;
}

// Maps a function over the elements of an array.
function map(f, a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? f(a.table[i])
				: map(f, a.table[i]);
	}
	return newA;
}

// Maps a function over the elements with their index as first argument.
function indexedMap(f, a)
{
	return indexedMap_(f, a, 0);
}

function indexedMap_(f, a, from)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: new Array(a.table.length)
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths;
	}
	for (var i = 0; i < a.table.length; i++)
	{
		newA.table[i] =
			a.height === 0
				? A2(f, from + i, a.table[i])
				: indexedMap_(f, a.table[i], i == 0 ? from : from + a.lengths[i - 1]);
	}
	return newA;
}

function foldl(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = 0; i < a.table.length; i++)
		{
			b = foldl(f, b, a.table[i]);
		}
	}
	return b;
}

function foldr(f, b, a)
{
	if (a.height === 0)
	{
		for (var i = a.table.length; i--; )
		{
			b = A2(f, a.table[i], b);
		}
	}
	else
	{
		for (var i = a.table.length; i--; )
		{
			b = foldr(f, b, a.table[i]);
		}
	}
	return b;
}

// TODO: currently, it slices the right, then the left. This can be
// optimized.
function slice(from, to, a)
{
	if (from < 0)
	{
		from += length(a);
	}
	if (to < 0)
	{
		to += length(a);
	}
	return sliceLeft(from, sliceRight(to, a));
}

function sliceRight(to, a)
{
	if (to === length(a))
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(0, to);
		return newA;
	}

	// Slice the right recursively.
	var right = getSlot(to, a);
	var sliced = sliceRight(to - (right > 0 ? a.lengths[right - 1] : 0), a.table[right]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (right === 0)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(0, right),
		lengths: a.lengths.slice(0, right)
	};
	if (sliced.table.length > 0)
	{
		newA.table[right] = sliced;
		newA.lengths[right] = length(sliced) + (right > 0 ? newA.lengths[right - 1] : 0);
	}
	return newA;
}

function sliceLeft(from, a)
{
	if (from === 0)
	{
		return a;
	}

	// Handle leaf level.
	if (a.height === 0)
	{
		var newA = { ctor:'_Array', height:0 };
		newA.table = a.table.slice(from, a.table.length + 1);
		return newA;
	}

	// Slice the left recursively.
	var left = getSlot(from, a);
	var sliced = sliceLeft(from - (left > 0 ? a.lengths[left - 1] : 0), a.table[left]);

	// Maybe the a node is not even needed, as sliced contains the whole slice.
	if (left === a.table.length - 1)
	{
		return sliced;
	}

	// Create new node.
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice(left, a.table.length + 1),
		lengths: new Array(a.table.length - left)
	};
	newA.table[0] = sliced;
	var len = 0;
	for (var i = 0; i < newA.table.length; i++)
	{
		len += length(newA.table[i]);
		newA.lengths[i] = len;
	}

	return newA;
}

// Appends two trees.
function append(a,b)
{
	if (a.table.length === 0)
	{
		return b;
	}
	if (b.table.length === 0)
	{
		return a;
	}

	var c = append_(a, b);

	// Check if both nodes can be crunshed together.
	if (c[0].table.length + c[1].table.length <= M)
	{
		if (c[0].table.length === 0)
		{
			return c[1];
		}
		if (c[1].table.length === 0)
		{
			return c[0];
		}

		// Adjust .table and .lengths
		c[0].table = c[0].table.concat(c[1].table);
		if (c[0].height > 0)
		{
			var len = length(c[0]);
			for (var i = 0; i < c[1].lengths.length; i++)
			{
				c[1].lengths[i] += len;
			}
			c[0].lengths = c[0].lengths.concat(c[1].lengths);
		}

		return c[0];
	}

	if (c[0].height > 0)
	{
		var toRemove = calcToRemove(a, b);
		if (toRemove > E)
		{
			c = shuffle(c[0], c[1], toRemove);
		}
	}

	return siblise(c[0], c[1]);
}

// Returns an array of two nodes; right and left. One node _may_ be empty.
function append_(a, b)
{
	if (a.height === 0 && b.height === 0)
	{
		return [a, b];
	}

	if (a.height !== 1 || b.height !== 1)
	{
		if (a.height === b.height)
		{
			a = nodeCopy(a);
			b = nodeCopy(b);
			var appended = append_(botRight(a), botLeft(b));

			insertRight(a, appended[1]);
			insertLeft(b, appended[0]);
		}
		else if (a.height > b.height)
		{
			a = nodeCopy(a);
			var appended = append_(botRight(a), b);

			insertRight(a, appended[0]);
			b = parentise(appended[1], appended[1].height + 1);
		}
		else
		{
			b = nodeCopy(b);
			var appended = append_(a, botLeft(b));

			var left = appended[0].table.length === 0 ? 0 : 1;
			var right = left === 0 ? 1 : 0;
			insertLeft(b, appended[left]);
			a = parentise(appended[right], appended[right].height + 1);
		}
	}

	// Check if balancing is needed and return based on that.
	if (a.table.length === 0 || b.table.length === 0)
	{
		return [a, b];
	}

	var toRemove = calcToRemove(a, b);
	if (toRemove <= E)
	{
		return [a, b];
	}
	return shuffle(a, b, toRemove);
}

// Helperfunctions for append_. Replaces a child node at the side of the parent.
function insertRight(parent, node)
{
	var index = parent.table.length - 1;
	parent.table[index] = node;
	parent.lengths[index] = length(node);
	parent.lengths[index] += index > 0 ? parent.lengths[index - 1] : 0;
}

function insertLeft(parent, node)
{
	if (node.table.length > 0)
	{
		parent.table[0] = node;
		parent.lengths[0] = length(node);

		var len = length(parent.table[0]);
		for (var i = 1; i < parent.lengths.length; i++)
		{
			len += length(parent.table[i]);
			parent.lengths[i] = len;
		}
	}
	else
	{
		parent.table.shift();
		for (var i = 1; i < parent.lengths.length; i++)
		{
			parent.lengths[i] = parent.lengths[i] - parent.lengths[0];
		}
		parent.lengths.shift();
	}
}

// Returns the extra search steps for E. Refer to the paper.
function calcToRemove(a, b)
{
	var subLengths = 0;
	for (var i = 0; i < a.table.length; i++)
	{
		subLengths += a.table[i].table.length;
	}
	for (var i = 0; i < b.table.length; i++)
	{
		subLengths += b.table[i].table.length;
	}

	var toRemove = a.table.length + b.table.length;
	return toRemove - (Math.floor((subLengths - 1) / M) + 1);
}

// get2, set2 and saveSlot are helpers for accessing elements over two arrays.
function get2(a, b, index)
{
	return index < a.length
		? a[index]
		: b[index - a.length];
}

function set2(a, b, index, value)
{
	if (index < a.length)
	{
		a[index] = value;
	}
	else
	{
		b[index - a.length] = value;
	}
}

function saveSlot(a, b, index, slot)
{
	set2(a.table, b.table, index, slot);

	var l = (index === 0 || index === a.lengths.length)
		? 0
		: get2(a.lengths, a.lengths, index - 1);

	set2(a.lengths, b.lengths, index, l + length(slot));
}

// Creates a node or leaf with a given length at their arrays for perfomance.
// Is only used by shuffle.
function createNode(h, length)
{
	if (length < 0)
	{
		length = 0;
	}
	var a = {
		ctor: '_Array',
		height: h,
		table: new Array(length)
	};
	if (h > 0)
	{
		a.lengths = new Array(length);
	}
	return a;
}

// Returns an array of two balanced nodes.
function shuffle(a, b, toRemove)
{
	var newA = createNode(a.height, Math.min(M, a.table.length + b.table.length - toRemove));
	var newB = createNode(a.height, newA.table.length - (a.table.length + b.table.length - toRemove));

	// Skip the slots with size M. More precise: copy the slot references
	// to the new node
	var read = 0;
	while (get2(a.table, b.table, read).table.length % M === 0)
	{
		set2(newA.table, newB.table, read, get2(a.table, b.table, read));
		set2(newA.lengths, newB.lengths, read, get2(a.lengths, b.lengths, read));
		read++;
	}

	// Pulling items from left to right, caching in a slot before writing
	// it into the new nodes.
	var write = read;
	var slot = new createNode(a.height - 1, 0);
	var from = 0;

	// If the current slot is still containing data, then there will be at
	// least one more write, so we do not break this loop yet.
	while (read - write - (slot.table.length > 0 ? 1 : 0) < toRemove)
	{
		// Find out the max possible items for copying.
		var source = get2(a.table, b.table, read);
		var to = Math.min(M - slot.table.length, source.table.length);

		// Copy and adjust size table.
		slot.table = slot.table.concat(source.table.slice(from, to));
		if (slot.height > 0)
		{
			var len = slot.lengths.length;
			for (var i = len; i < len + to - from; i++)
			{
				slot.lengths[i] = length(slot.table[i]);
				slot.lengths[i] += (i > 0 ? slot.lengths[i - 1] : 0);
			}
		}

		from += to;

		// Only proceed to next slots[i] if the current one was
		// fully copied.
		if (source.table.length <= to)
		{
			read++; from = 0;
		}

		// Only create a new slot if the current one is filled up.
		if (slot.table.length === M)
		{
			saveSlot(newA, newB, write, slot);
			slot = createNode(a.height - 1, 0);
			write++;
		}
	}

	// Cleanup after the loop. Copy the last slot into the new nodes.
	if (slot.table.length > 0)
	{
		saveSlot(newA, newB, write, slot);
		write++;
	}

	// Shift the untouched slots to the left
	while (read < a.table.length + b.table.length )
	{
		saveSlot(newA, newB, write, get2(a.table, b.table, read));
		read++;
		write++;
	}

	return [newA, newB];
}

// Navigation functions
function botRight(a)
{
	return a.table[a.table.length - 1];
}
function botLeft(a)
{
	return a.table[0];
}

// Copies a node for updating. Note that you should not use this if
// only updating only one of "table" or "lengths" for performance reasons.
function nodeCopy(a)
{
	var newA = {
		ctor: '_Array',
		height: a.height,
		table: a.table.slice()
	};
	if (a.height > 0)
	{
		newA.lengths = a.lengths.slice();
	}
	return newA;
}

// Returns how many items are in the tree.
function length(array)
{
	if (array.height === 0)
	{
		return array.table.length;
	}
	else
	{
		return array.lengths[array.lengths.length - 1];
	}
}

// Calculates in which slot of "table" the item probably is, then
// find the exact slot via forward searching in  "lengths". Returns the index.
function getSlot(i, a)
{
	var slot = i >> (5 * a.height);
	while (a.lengths[slot] <= i)
	{
		slot++;
	}
	return slot;
}

// Recursively creates a tree with a given height containing
// only the given item.
function create(item, h)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: [item]
		};
	}
	return {
		ctor: '_Array',
		height: h,
		table: [create(item, h - 1)],
		lengths: [1]
	};
}

// Recursively creates a tree that contains the given tree.
function parentise(tree, h)
{
	if (h === tree.height)
	{
		return tree;
	}

	return {
		ctor: '_Array',
		height: h,
		table: [parentise(tree, h - 1)],
		lengths: [length(tree)]
	};
}

// Emphasizes blood brotherhood beneath two trees.
function siblise(a, b)
{
	return {
		ctor: '_Array',
		height: a.height + 1,
		table: [a, b],
		lengths: [length(a), length(a) + length(b)]
	};
}

function toJSArray(a)
{
	var jsArray = new Array(length(a));
	toJSArray_(jsArray, 0, a);
	return jsArray;
}

function toJSArray_(jsArray, i, a)
{
	for (var t = 0; t < a.table.length; t++)
	{
		if (a.height === 0)
		{
			jsArray[i + t] = a.table[t];
		}
		else
		{
			var inc = t === 0 ? 0 : a.lengths[t - 1];
			toJSArray_(jsArray, i + inc, a.table[t]);
		}
	}
}

function fromJSArray(jsArray)
{
	if (jsArray.length === 0)
	{
		return empty;
	}
	var h = Math.floor(Math.log(jsArray.length) / Math.log(M));
	return fromJSArray_(jsArray, h, 0, jsArray.length);
}

function fromJSArray_(jsArray, h, from, to)
{
	if (h === 0)
	{
		return {
			ctor: '_Array',
			height: 0,
			table: jsArray.slice(from, to)
		};
	}

	var step = Math.pow(M, h);
	var table = new Array(Math.ceil((to - from) / step));
	var lengths = new Array(table.length);
	for (var i = 0; i < table.length; i++)
	{
		table[i] = fromJSArray_(jsArray, h - 1, from + (i * step), Math.min(from + ((i + 1) * step), to));
		lengths[i] = length(table[i]) + (i > 0 ? lengths[i - 1] : 0);
	}
	return {
		ctor: '_Array',
		height: h,
		table: table,
		lengths: lengths
	};
}

return {
	empty: empty,
	fromList: fromList,
	toList: toList,
	initialize: F2(initialize),
	append: F2(append),
	push: F2(push),
	slice: F3(slice),
	get: F2(get),
	set: F3(set),
	map: F2(map),
	indexedMap: F2(indexedMap),
	foldl: F3(foldl),
	foldr: F3(foldr),
	length: length,

	toJSArray: toJSArray,
	fromJSArray: fromJSArray
};

}();
//import Native.Utils //

var _elm_lang$core$Native_Basics = function() {

function div(a, b)
{
	return (a / b) | 0;
}
function rem(a, b)
{
	return a % b;
}
function mod(a, b)
{
	if (b === 0)
	{
		throw new Error('Cannot perform mod 0. Division by zero error.');
	}
	var r = a % b;
	var m = a === 0 ? 0 : (b > 0 ? (a >= 0 ? r : r + b) : -mod(-a, -b));

	return m === b ? 0 : m;
}
function logBase(base, n)
{
	return Math.log(n) / Math.log(base);
}
function negate(n)
{
	return -n;
}
function abs(n)
{
	return n < 0 ? -n : n;
}

function min(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) < 0 ? a : b;
}
function max(a, b)
{
	return _elm_lang$core$Native_Utils.cmp(a, b) > 0 ? a : b;
}
function clamp(lo, hi, n)
{
	return _elm_lang$core$Native_Utils.cmp(n, lo) < 0
		? lo
		: _elm_lang$core$Native_Utils.cmp(n, hi) > 0
			? hi
			: n;
}

var ord = ['LT', 'EQ', 'GT'];

function compare(x, y)
{
	return { ctor: ord[_elm_lang$core$Native_Utils.cmp(x, y) + 1] };
}

function xor(a, b)
{
	return a !== b;
}
function not(b)
{
	return !b;
}
function isInfinite(n)
{
	return n === Infinity || n === -Infinity;
}

function truncate(n)
{
	return n | 0;
}

function degrees(d)
{
	return d * Math.PI / 180;
}
function turns(t)
{
	return 2 * Math.PI * t;
}
function fromPolar(point)
{
	var r = point._0;
	var t = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(r * Math.cos(t), r * Math.sin(t));
}
function toPolar(point)
{
	var x = point._0;
	var y = point._1;
	return _elm_lang$core$Native_Utils.Tuple2(Math.sqrt(x * x + y * y), Math.atan2(y, x));
}

return {
	div: F2(div),
	rem: F2(rem),
	mod: F2(mod),

	pi: Math.PI,
	e: Math.E,
	cos: Math.cos,
	sin: Math.sin,
	tan: Math.tan,
	acos: Math.acos,
	asin: Math.asin,
	atan: Math.atan,
	atan2: F2(Math.atan2),

	degrees: degrees,
	turns: turns,
	fromPolar: fromPolar,
	toPolar: toPolar,

	sqrt: Math.sqrt,
	logBase: F2(logBase),
	negate: negate,
	abs: abs,
	min: F2(min),
	max: F2(max),
	clamp: F3(clamp),
	compare: F2(compare),

	xor: F2(xor),
	not: not,

	truncate: truncate,
	ceiling: Math.ceil,
	floor: Math.floor,
	round: Math.round,
	toFloat: function(x) { return x; },
	isNaN: isNaN,
	isInfinite: isInfinite
};

}();
//import //

var _elm_lang$core$Native_Utils = function() {

// COMPARISONS

function eq(x, y)
{
	var stack = [];
	var isEqual = eqHelp(x, y, 0, stack);
	var pair;
	while (isEqual && (pair = stack.pop()))
	{
		isEqual = eqHelp(pair.x, pair.y, 0, stack);
	}
	return isEqual;
}


function eqHelp(x, y, depth, stack)
{
	if (depth > 100)
	{
		stack.push({ x: x, y: y });
		return true;
	}

	if (x === y)
	{
		return true;
	}

	if (typeof x !== 'object')
	{
		if (typeof x === 'function')
		{
			throw new Error(
				'Trying to use `(==)` on functions. There is no way to know if functions are "the same" in the Elm sense.'
				+ ' Read more about this at http://package.elm-lang.org/packages/elm-lang/core/latest/Basics#=='
				+ ' which describes why it is this way and what the better version will look like.'
			);
		}
		return false;
	}

	if (x === null || y === null)
	{
		return false
	}

	if (x instanceof Date)
	{
		return x.getTime() === y.getTime();
	}

	if (!('ctor' in x))
	{
		for (var key in x)
		{
			if (!eqHelp(x[key], y[key], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	// convert Dicts and Sets to lists
	if (x.ctor === 'RBNode_elm_builtin' || x.ctor === 'RBEmpty_elm_builtin')
	{
		x = _elm_lang$core$Dict$toList(x);
		y = _elm_lang$core$Dict$toList(y);
	}
	if (x.ctor === 'Set_elm_builtin')
	{
		x = _elm_lang$core$Set$toList(x);
		y = _elm_lang$core$Set$toList(y);
	}

	// check if lists are equal without recursion
	if (x.ctor === '::')
	{
		var a = x;
		var b = y;
		while (a.ctor === '::' && b.ctor === '::')
		{
			if (!eqHelp(a._0, b._0, depth + 1, stack))
			{
				return false;
			}
			a = a._1;
			b = b._1;
		}
		return a.ctor === b.ctor;
	}

	// check if Arrays are equal
	if (x.ctor === '_Array')
	{
		var xs = _elm_lang$core$Native_Array.toJSArray(x);
		var ys = _elm_lang$core$Native_Array.toJSArray(y);
		if (xs.length !== ys.length)
		{
			return false;
		}
		for (var i = 0; i < xs.length; i++)
		{
			if (!eqHelp(xs[i], ys[i], depth + 1, stack))
			{
				return false;
			}
		}
		return true;
	}

	if (!eqHelp(x.ctor, y.ctor, depth + 1, stack))
	{
		return false;
	}

	for (var key in x)
	{
		if (!eqHelp(x[key], y[key], depth + 1, stack))
		{
			return false;
		}
	}
	return true;
}

// Code in Generate/JavaScript.hs, Basics.js, and List.js depends on
// the particular integer values assigned to LT, EQ, and GT.

var LT = -1, EQ = 0, GT = 1;

function cmp(x, y)
{
	if (typeof x !== 'object')
	{
		return x === y ? EQ : x < y ? LT : GT;
	}

	if (x instanceof String)
	{
		var a = x.valueOf();
		var b = y.valueOf();
		return a === b ? EQ : a < b ? LT : GT;
	}

	if (x.ctor === '::' || x.ctor === '[]')
	{
		while (x.ctor === '::' && y.ctor === '::')
		{
			var ord = cmp(x._0, y._0);
			if (ord !== EQ)
			{
				return ord;
			}
			x = x._1;
			y = y._1;
		}
		return x.ctor === y.ctor ? EQ : x.ctor === '[]' ? LT : GT;
	}

	if (x.ctor.slice(0, 6) === '_Tuple')
	{
		var ord;
		var n = x.ctor.slice(6) - 0;
		var err = 'cannot compare tuples with more than 6 elements.';
		if (n === 0) return EQ;
		if (n >= 1) { ord = cmp(x._0, y._0); if (ord !== EQ) return ord;
		if (n >= 2) { ord = cmp(x._1, y._1); if (ord !== EQ) return ord;
		if (n >= 3) { ord = cmp(x._2, y._2); if (ord !== EQ) return ord;
		if (n >= 4) { ord = cmp(x._3, y._3); if (ord !== EQ) return ord;
		if (n >= 5) { ord = cmp(x._4, y._4); if (ord !== EQ) return ord;
		if (n >= 6) { ord = cmp(x._5, y._5); if (ord !== EQ) return ord;
		if (n >= 7) throw new Error('Comparison error: ' + err); } } } } } }
		return EQ;
	}

	throw new Error(
		'Comparison error: comparison is only defined on ints, '
		+ 'floats, times, chars, strings, lists of comparable values, '
		+ 'and tuples of comparable values.'
	);
}


// COMMON VALUES

var Tuple0 = {
	ctor: '_Tuple0'
};

function Tuple2(x, y)
{
	return {
		ctor: '_Tuple2',
		_0: x,
		_1: y
	};
}

function chr(c)
{
	return new String(c);
}


// GUID

var count = 0;
function guid(_)
{
	return count++;
}


// RECORDS

function update(oldRecord, updatedFields)
{
	var newRecord = {};

	for (var key in oldRecord)
	{
		newRecord[key] = oldRecord[key];
	}

	for (var key in updatedFields)
	{
		newRecord[key] = updatedFields[key];
	}

	return newRecord;
}


//// LIST STUFF ////

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return {
		ctor: '::',
		_0: hd,
		_1: tl
	};
}

function append(xs, ys)
{
	// append Strings
	if (typeof xs === 'string')
	{
		return xs + ys;
	}

	// append Lists
	if (xs.ctor === '[]')
	{
		return ys;
	}
	var root = Cons(xs._0, Nil);
	var curr = root;
	xs = xs._1;
	while (xs.ctor !== '[]')
	{
		curr._1 = Cons(xs._0, Nil);
		xs = xs._1;
		curr = curr._1;
	}
	curr._1 = ys;
	return root;
}


// CRASHES

function crash(moduleName, region)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '` ' + regionToString(region) + '\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function crashCase(moduleName, region, value)
{
	return function(message) {
		throw new Error(
			'Ran into a `Debug.crash` in module `' + moduleName + '`\n\n'
			+ 'This was caused by the `case` expression ' + regionToString(region) + '.\n'
			+ 'One of the branches ended with a crash and the following value got through:\n\n    ' + toString(value) + '\n\n'
			+ 'The message provided by the code author is:\n\n    '
			+ message
		);
	};
}

function regionToString(region)
{
	if (region.start.line == region.end.line)
	{
		return 'on line ' + region.start.line;
	}
	return 'between lines ' + region.start.line + ' and ' + region.end.line;
}


// TO STRING

function toString(v)
{
	var type = typeof v;
	if (type === 'function')
	{
		return '<function>';
	}

	if (type === 'boolean')
	{
		return v ? 'True' : 'False';
	}

	if (type === 'number')
	{
		return v + '';
	}

	if (v instanceof String)
	{
		return '\'' + addSlashes(v, true) + '\'';
	}

	if (type === 'string')
	{
		return '"' + addSlashes(v, false) + '"';
	}

	if (v === null)
	{
		return 'null';
	}

	if (type === 'object' && 'ctor' in v)
	{
		var ctorStarter = v.ctor.substring(0, 5);

		if (ctorStarter === '_Tupl')
		{
			var output = [];
			for (var k in v)
			{
				if (k === 'ctor') continue;
				output.push(toString(v[k]));
			}
			return '(' + output.join(',') + ')';
		}

		if (ctorStarter === '_Task')
		{
			return '<task>'
		}

		if (v.ctor === '_Array')
		{
			var list = _elm_lang$core$Array$toList(v);
			return 'Array.fromList ' + toString(list);
		}

		if (v.ctor === '<decoder>')
		{
			return '<decoder>';
		}

		if (v.ctor === '_Process')
		{
			return '<process:' + v.id + '>';
		}

		if (v.ctor === '::')
		{
			var output = '[' + toString(v._0);
			v = v._1;
			while (v.ctor === '::')
			{
				output += ',' + toString(v._0);
				v = v._1;
			}
			return output + ']';
		}

		if (v.ctor === '[]')
		{
			return '[]';
		}

		if (v.ctor === 'Set_elm_builtin')
		{
			return 'Set.fromList ' + toString(_elm_lang$core$Set$toList(v));
		}

		if (v.ctor === 'RBNode_elm_builtin' || v.ctor === 'RBEmpty_elm_builtin')
		{
			return 'Dict.fromList ' + toString(_elm_lang$core$Dict$toList(v));
		}

		var output = '';
		for (var i in v)
		{
			if (i === 'ctor') continue;
			var str = toString(v[i]);
			var c0 = str[0];
			var parenless = c0 === '{' || c0 === '(' || c0 === '<' || c0 === '"' || str.indexOf(' ') < 0;
			output += ' ' + (parenless ? str : '(' + str + ')');
		}
		return v.ctor + output;
	}

	if (type === 'object')
	{
		if (v instanceof Date)
		{
			return '<' + v.toString() + '>';
		}

		if (v.elm_web_socket)
		{
			return '<websocket>';
		}

		var output = [];
		for (var k in v)
		{
			output.push(k + ' = ' + toString(v[k]));
		}
		if (output.length === 0)
		{
			return '{}';
		}
		return '{ ' + output.join(', ') + ' }';
	}

	return '<internal structure>';
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	eq: eq,
	cmp: cmp,
	Tuple0: Tuple0,
	Tuple2: Tuple2,
	chr: chr,
	update: update,
	guid: guid,

	append: F2(append),

	crash: crash,
	crashCase: crashCase,

	toString: toString
};

}();
var _elm_lang$core$Basics$never = function (_p0) {
	never:
	while (true) {
		var _p1 = _p0;
		var _v1 = _p1._0;
		_p0 = _v1;
		continue never;
	}
};
var _elm_lang$core$Basics$uncurry = F2(
	function (f, _p2) {
		var _p3 = _p2;
		return A2(f, _p3._0, _p3._1);
	});
var _elm_lang$core$Basics$curry = F3(
	function (f, a, b) {
		return f(
			{ctor: '_Tuple2', _0: a, _1: b});
	});
var _elm_lang$core$Basics$flip = F3(
	function (f, b, a) {
		return A2(f, a, b);
	});
var _elm_lang$core$Basics$always = F2(
	function (a, _p4) {
		return a;
	});
var _elm_lang$core$Basics$identity = function (x) {
	return x;
};
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<|'] = F2(
	function (f, x) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['|>'] = F2(
	function (x, f) {
		return f(x);
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>>'] = F3(
	function (f, g, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<<'] = F3(
	function (g, f, x) {
		return g(
			f(x));
	});
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['++'] = _elm_lang$core$Native_Utils.append;
var _elm_lang$core$Basics$toString = _elm_lang$core$Native_Utils.toString;
var _elm_lang$core$Basics$isInfinite = _elm_lang$core$Native_Basics.isInfinite;
var _elm_lang$core$Basics$isNaN = _elm_lang$core$Native_Basics.isNaN;
var _elm_lang$core$Basics$toFloat = _elm_lang$core$Native_Basics.toFloat;
var _elm_lang$core$Basics$ceiling = _elm_lang$core$Native_Basics.ceiling;
var _elm_lang$core$Basics$floor = _elm_lang$core$Native_Basics.floor;
var _elm_lang$core$Basics$truncate = _elm_lang$core$Native_Basics.truncate;
var _elm_lang$core$Basics$round = _elm_lang$core$Native_Basics.round;
var _elm_lang$core$Basics$not = _elm_lang$core$Native_Basics.not;
var _elm_lang$core$Basics$xor = _elm_lang$core$Native_Basics.xor;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['||'] = _elm_lang$core$Native_Basics.or;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['&&'] = _elm_lang$core$Native_Basics.and;
var _elm_lang$core$Basics$max = _elm_lang$core$Native_Basics.max;
var _elm_lang$core$Basics$min = _elm_lang$core$Native_Basics.min;
var _elm_lang$core$Basics$compare = _elm_lang$core$Native_Basics.compare;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>='] = _elm_lang$core$Native_Basics.ge;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<='] = _elm_lang$core$Native_Basics.le;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['>'] = _elm_lang$core$Native_Basics.gt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['<'] = _elm_lang$core$Native_Basics.lt;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/='] = _elm_lang$core$Native_Basics.neq;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['=='] = _elm_lang$core$Native_Basics.eq;
var _elm_lang$core$Basics$e = _elm_lang$core$Native_Basics.e;
var _elm_lang$core$Basics$pi = _elm_lang$core$Native_Basics.pi;
var _elm_lang$core$Basics$clamp = _elm_lang$core$Native_Basics.clamp;
var _elm_lang$core$Basics$logBase = _elm_lang$core$Native_Basics.logBase;
var _elm_lang$core$Basics$abs = _elm_lang$core$Native_Basics.abs;
var _elm_lang$core$Basics$negate = _elm_lang$core$Native_Basics.negate;
var _elm_lang$core$Basics$sqrt = _elm_lang$core$Native_Basics.sqrt;
var _elm_lang$core$Basics$atan2 = _elm_lang$core$Native_Basics.atan2;
var _elm_lang$core$Basics$atan = _elm_lang$core$Native_Basics.atan;
var _elm_lang$core$Basics$asin = _elm_lang$core$Native_Basics.asin;
var _elm_lang$core$Basics$acos = _elm_lang$core$Native_Basics.acos;
var _elm_lang$core$Basics$tan = _elm_lang$core$Native_Basics.tan;
var _elm_lang$core$Basics$sin = _elm_lang$core$Native_Basics.sin;
var _elm_lang$core$Basics$cos = _elm_lang$core$Native_Basics.cos;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['^'] = _elm_lang$core$Native_Basics.exp;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['%'] = _elm_lang$core$Native_Basics.mod;
var _elm_lang$core$Basics$rem = _elm_lang$core$Native_Basics.rem;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['//'] = _elm_lang$core$Native_Basics.div;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['/'] = _elm_lang$core$Native_Basics.floatDiv;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['*'] = _elm_lang$core$Native_Basics.mul;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['-'] = _elm_lang$core$Native_Basics.sub;
var _elm_lang$core$Basics_ops = _elm_lang$core$Basics_ops || {};
_elm_lang$core$Basics_ops['+'] = _elm_lang$core$Native_Basics.add;
var _elm_lang$core$Basics$toPolar = _elm_lang$core$Native_Basics.toPolar;
var _elm_lang$core$Basics$fromPolar = _elm_lang$core$Native_Basics.fromPolar;
var _elm_lang$core$Basics$turns = _elm_lang$core$Native_Basics.turns;
var _elm_lang$core$Basics$degrees = _elm_lang$core$Native_Basics.degrees;
var _elm_lang$core$Basics$radians = function (t) {
	return t;
};
var _elm_lang$core$Basics$GT = {ctor: 'GT'};
var _elm_lang$core$Basics$EQ = {ctor: 'EQ'};
var _elm_lang$core$Basics$LT = {ctor: 'LT'};
var _elm_lang$core$Basics$JustOneMore = function (a) {
	return {ctor: 'JustOneMore', _0: a};
};

var _elm_lang$core$Maybe$withDefault = F2(
	function ($default, maybe) {
		var _p0 = maybe;
		if (_p0.ctor === 'Just') {
			return _p0._0;
		} else {
			return $default;
		}
	});
var _elm_lang$core$Maybe$Nothing = {ctor: 'Nothing'};
var _elm_lang$core$Maybe$andThen = F2(
	function (callback, maybeValue) {
		var _p1 = maybeValue;
		if (_p1.ctor === 'Just') {
			return callback(_p1._0);
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$Just = function (a) {
	return {ctor: 'Just', _0: a};
};
var _elm_lang$core$Maybe$map = F2(
	function (f, maybe) {
		var _p2 = maybe;
		if (_p2.ctor === 'Just') {
			return _elm_lang$core$Maybe$Just(
				f(_p2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map2 = F3(
	function (func, ma, mb) {
		var _p3 = {ctor: '_Tuple2', _0: ma, _1: mb};
		if (((_p3.ctor === '_Tuple2') && (_p3._0.ctor === 'Just')) && (_p3._1.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A2(func, _p3._0._0, _p3._1._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map3 = F4(
	function (func, ma, mb, mc) {
		var _p4 = {ctor: '_Tuple3', _0: ma, _1: mb, _2: mc};
		if ((((_p4.ctor === '_Tuple3') && (_p4._0.ctor === 'Just')) && (_p4._1.ctor === 'Just')) && (_p4._2.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A3(func, _p4._0._0, _p4._1._0, _p4._2._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map4 = F5(
	function (func, ma, mb, mc, md) {
		var _p5 = {ctor: '_Tuple4', _0: ma, _1: mb, _2: mc, _3: md};
		if (((((_p5.ctor === '_Tuple4') && (_p5._0.ctor === 'Just')) && (_p5._1.ctor === 'Just')) && (_p5._2.ctor === 'Just')) && (_p5._3.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A4(func, _p5._0._0, _p5._1._0, _p5._2._0, _p5._3._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});
var _elm_lang$core$Maybe$map5 = F6(
	function (func, ma, mb, mc, md, me) {
		var _p6 = {ctor: '_Tuple5', _0: ma, _1: mb, _2: mc, _3: md, _4: me};
		if ((((((_p6.ctor === '_Tuple5') && (_p6._0.ctor === 'Just')) && (_p6._1.ctor === 'Just')) && (_p6._2.ctor === 'Just')) && (_p6._3.ctor === 'Just')) && (_p6._4.ctor === 'Just')) {
			return _elm_lang$core$Maybe$Just(
				A5(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0, _p6._4._0));
		} else {
			return _elm_lang$core$Maybe$Nothing;
		}
	});

//import Native.Utils //

var _elm_lang$core$Native_List = function() {

var Nil = { ctor: '[]' };

function Cons(hd, tl)
{
	return { ctor: '::', _0: hd, _1: tl };
}

function fromArray(arr)
{
	var out = Nil;
	for (var i = arr.length; i--; )
	{
		out = Cons(arr[i], out);
	}
	return out;
}

function toArray(xs)
{
	var out = [];
	while (xs.ctor !== '[]')
	{
		out.push(xs._0);
		xs = xs._1;
	}
	return out;
}

function foldr(f, b, xs)
{
	var arr = toArray(xs);
	var acc = b;
	for (var i = arr.length; i--; )
	{
		acc = A2(f, arr[i], acc);
	}
	return acc;
}

function map2(f, xs, ys)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]')
	{
		arr.push(A2(f, xs._0, ys._0));
		xs = xs._1;
		ys = ys._1;
	}
	return fromArray(arr);
}

function map3(f, xs, ys, zs)
{
	var arr = [];
	while (xs.ctor !== '[]' && ys.ctor !== '[]' && zs.ctor !== '[]')
	{
		arr.push(A3(f, xs._0, ys._0, zs._0));
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map4(f, ws, xs, ys, zs)
{
	var arr = [];
	while (   ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A4(f, ws._0, xs._0, ys._0, zs._0));
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function map5(f, vs, ws, xs, ys, zs)
{
	var arr = [];
	while (   vs.ctor !== '[]'
		   && ws.ctor !== '[]'
		   && xs.ctor !== '[]'
		   && ys.ctor !== '[]'
		   && zs.ctor !== '[]')
	{
		arr.push(A5(f, vs._0, ws._0, xs._0, ys._0, zs._0));
		vs = vs._1;
		ws = ws._1;
		xs = xs._1;
		ys = ys._1;
		zs = zs._1;
	}
	return fromArray(arr);
}

function sortBy(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		return _elm_lang$core$Native_Utils.cmp(f(a), f(b));
	}));
}

function sortWith(f, xs)
{
	return fromArray(toArray(xs).sort(function(a, b) {
		var ord = f(a)(b).ctor;
		return ord === 'EQ' ? 0 : ord === 'LT' ? -1 : 1;
	}));
}

return {
	Nil: Nil,
	Cons: Cons,
	cons: F2(Cons),
	toArray: toArray,
	fromArray: fromArray,

	foldr: F3(foldr),

	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	sortBy: F2(sortBy),
	sortWith: F2(sortWith)
};

}();
var _elm_lang$core$List$sortWith = _elm_lang$core$Native_List.sortWith;
var _elm_lang$core$List$sortBy = _elm_lang$core$Native_List.sortBy;
var _elm_lang$core$List$sort = function (xs) {
	return A2(_elm_lang$core$List$sortBy, _elm_lang$core$Basics$identity, xs);
};
var _elm_lang$core$List$singleton = function (value) {
	return {
		ctor: '::',
		_0: value,
		_1: {ctor: '[]'}
	};
};
var _elm_lang$core$List$drop = F2(
	function (n, list) {
		drop:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return list;
			} else {
				var _p0 = list;
				if (_p0.ctor === '[]') {
					return list;
				} else {
					var _v1 = n - 1,
						_v2 = _p0._1;
					n = _v1;
					list = _v2;
					continue drop;
				}
			}
		}
	});
var _elm_lang$core$List$map5 = _elm_lang$core$Native_List.map5;
var _elm_lang$core$List$map4 = _elm_lang$core$Native_List.map4;
var _elm_lang$core$List$map3 = _elm_lang$core$Native_List.map3;
var _elm_lang$core$List$map2 = _elm_lang$core$Native_List.map2;
var _elm_lang$core$List$any = F2(
	function (isOkay, list) {
		any:
		while (true) {
			var _p1 = list;
			if (_p1.ctor === '[]') {
				return false;
			} else {
				if (isOkay(_p1._0)) {
					return true;
				} else {
					var _v4 = isOkay,
						_v5 = _p1._1;
					isOkay = _v4;
					list = _v5;
					continue any;
				}
			}
		}
	});
var _elm_lang$core$List$all = F2(
	function (isOkay, list) {
		return !A2(
			_elm_lang$core$List$any,
			function (_p2) {
				return !isOkay(_p2);
			},
			list);
	});
var _elm_lang$core$List$foldr = _elm_lang$core$Native_List.foldr;
var _elm_lang$core$List$foldl = F3(
	function (func, acc, list) {
		foldl:
		while (true) {
			var _p3 = list;
			if (_p3.ctor === '[]') {
				return acc;
			} else {
				var _v7 = func,
					_v8 = A2(func, _p3._0, acc),
					_v9 = _p3._1;
				func = _v7;
				acc = _v8;
				list = _v9;
				continue foldl;
			}
		}
	});
var _elm_lang$core$List$length = function (xs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p4, i) {
				return i + 1;
			}),
		0,
		xs);
};
var _elm_lang$core$List$sum = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x + y;
			}),
		0,
		numbers);
};
var _elm_lang$core$List$product = function (numbers) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return x * y;
			}),
		1,
		numbers);
};
var _elm_lang$core$List$maximum = function (list) {
	var _p5 = list;
	if (_p5.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$max, _p5._0, _p5._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$minimum = function (list) {
	var _p6 = list;
	if (_p6.ctor === '::') {
		return _elm_lang$core$Maybe$Just(
			A3(_elm_lang$core$List$foldl, _elm_lang$core$Basics$min, _p6._0, _p6._1));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$member = F2(
	function (x, xs) {
		return A2(
			_elm_lang$core$List$any,
			function (a) {
				return _elm_lang$core$Native_Utils.eq(a, x);
			},
			xs);
	});
var _elm_lang$core$List$isEmpty = function (xs) {
	var _p7 = xs;
	if (_p7.ctor === '[]') {
		return true;
	} else {
		return false;
	}
};
var _elm_lang$core$List$tail = function (list) {
	var _p8 = list;
	if (_p8.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p8._1);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List$head = function (list) {
	var _p9 = list;
	if (_p9.ctor === '::') {
		return _elm_lang$core$Maybe$Just(_p9._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$List_ops = _elm_lang$core$List_ops || {};
_elm_lang$core$List_ops['::'] = _elm_lang$core$Native_List.cons;
var _elm_lang$core$List$map = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, acc) {
					return {
						ctor: '::',
						_0: f(x),
						_1: acc
					};
				}),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$filter = F2(
	function (pred, xs) {
		var conditionalCons = F2(
			function (front, back) {
				return pred(front) ? {ctor: '::', _0: front, _1: back} : back;
			});
		return A3(
			_elm_lang$core$List$foldr,
			conditionalCons,
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$maybeCons = F3(
	function (f, mx, xs) {
		var _p10 = f(mx);
		if (_p10.ctor === 'Just') {
			return {ctor: '::', _0: _p10._0, _1: xs};
		} else {
			return xs;
		}
	});
var _elm_lang$core$List$filterMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$foldr,
			_elm_lang$core$List$maybeCons(f),
			{ctor: '[]'},
			xs);
	});
var _elm_lang$core$List$reverse = function (list) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (x, y) {
				return {ctor: '::', _0: x, _1: y};
			}),
		{ctor: '[]'},
		list);
};
var _elm_lang$core$List$scanl = F3(
	function (f, b, xs) {
		var scan1 = F2(
			function (x, accAcc) {
				var _p11 = accAcc;
				if (_p11.ctor === '::') {
					return {
						ctor: '::',
						_0: A2(f, x, _p11._0),
						_1: accAcc
					};
				} else {
					return {ctor: '[]'};
				}
			});
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$foldl,
				scan1,
				{
					ctor: '::',
					_0: b,
					_1: {ctor: '[]'}
				},
				xs));
	});
var _elm_lang$core$List$append = F2(
	function (xs, ys) {
		var _p12 = ys;
		if (_p12.ctor === '[]') {
			return xs;
		} else {
			return A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, y) {
						return {ctor: '::', _0: x, _1: y};
					}),
				ys,
				xs);
		}
	});
var _elm_lang$core$List$concat = function (lists) {
	return A3(
		_elm_lang$core$List$foldr,
		_elm_lang$core$List$append,
		{ctor: '[]'},
		lists);
};
var _elm_lang$core$List$concatMap = F2(
	function (f, list) {
		return _elm_lang$core$List$concat(
			A2(_elm_lang$core$List$map, f, list));
	});
var _elm_lang$core$List$partition = F2(
	function (pred, list) {
		var step = F2(
			function (x, _p13) {
				var _p14 = _p13;
				var _p16 = _p14._0;
				var _p15 = _p14._1;
				return pred(x) ? {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: x, _1: _p16},
					_1: _p15
				} : {
					ctor: '_Tuple2',
					_0: _p16,
					_1: {ctor: '::', _0: x, _1: _p15}
				};
			});
		return A3(
			_elm_lang$core$List$foldr,
			step,
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: {ctor: '[]'}
			},
			list);
	});
var _elm_lang$core$List$unzip = function (pairs) {
	var step = F2(
		function (_p18, _p17) {
			var _p19 = _p18;
			var _p20 = _p17;
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: _p19._0, _1: _p20._0},
				_1: {ctor: '::', _0: _p19._1, _1: _p20._1}
			};
		});
	return A3(
		_elm_lang$core$List$foldr,
		step,
		{
			ctor: '_Tuple2',
			_0: {ctor: '[]'},
			_1: {ctor: '[]'}
		},
		pairs);
};
var _elm_lang$core$List$intersperse = F2(
	function (sep, xs) {
		var _p21 = xs;
		if (_p21.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var step = F2(
				function (x, rest) {
					return {
						ctor: '::',
						_0: sep,
						_1: {ctor: '::', _0: x, _1: rest}
					};
				});
			var spersed = A3(
				_elm_lang$core$List$foldr,
				step,
				{ctor: '[]'},
				_p21._1);
			return {ctor: '::', _0: _p21._0, _1: spersed};
		}
	});
var _elm_lang$core$List$takeReverse = F3(
	function (n, list, taken) {
		takeReverse:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return taken;
			} else {
				var _p22 = list;
				if (_p22.ctor === '[]') {
					return taken;
				} else {
					var _v23 = n - 1,
						_v24 = _p22._1,
						_v25 = {ctor: '::', _0: _p22._0, _1: taken};
					n = _v23;
					list = _v24;
					taken = _v25;
					continue takeReverse;
				}
			}
		}
	});
var _elm_lang$core$List$takeTailRec = F2(
	function (n, list) {
		return _elm_lang$core$List$reverse(
			A3(
				_elm_lang$core$List$takeReverse,
				n,
				list,
				{ctor: '[]'}));
	});
var _elm_lang$core$List$takeFast = F3(
	function (ctr, n, list) {
		if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
			return {ctor: '[]'};
		} else {
			var _p23 = {ctor: '_Tuple2', _0: n, _1: list};
			_v26_5:
			do {
				_v26_1:
				do {
					if (_p23.ctor === '_Tuple2') {
						if (_p23._1.ctor === '[]') {
							return list;
						} else {
							if (_p23._1._1.ctor === '::') {
								switch (_p23._0) {
									case 1:
										break _v26_1;
									case 2:
										return {
											ctor: '::',
											_0: _p23._1._0,
											_1: {
												ctor: '::',
												_0: _p23._1._1._0,
												_1: {ctor: '[]'}
											}
										};
									case 3:
										if (_p23._1._1._1.ctor === '::') {
											return {
												ctor: '::',
												_0: _p23._1._0,
												_1: {
													ctor: '::',
													_0: _p23._1._1._0,
													_1: {
														ctor: '::',
														_0: _p23._1._1._1._0,
														_1: {ctor: '[]'}
													}
												}
											};
										} else {
											break _v26_5;
										}
									default:
										if ((_p23._1._1._1.ctor === '::') && (_p23._1._1._1._1.ctor === '::')) {
											var _p28 = _p23._1._1._1._0;
											var _p27 = _p23._1._1._0;
											var _p26 = _p23._1._0;
											var _p25 = _p23._1._1._1._1._0;
											var _p24 = _p23._1._1._1._1._1;
											return (_elm_lang$core$Native_Utils.cmp(ctr, 1000) > 0) ? {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A2(_elm_lang$core$List$takeTailRec, n - 4, _p24)
														}
													}
												}
											} : {
												ctor: '::',
												_0: _p26,
												_1: {
													ctor: '::',
													_0: _p27,
													_1: {
														ctor: '::',
														_0: _p28,
														_1: {
															ctor: '::',
															_0: _p25,
															_1: A3(_elm_lang$core$List$takeFast, ctr + 1, n - 4, _p24)
														}
													}
												}
											};
										} else {
											break _v26_5;
										}
								}
							} else {
								if (_p23._0 === 1) {
									break _v26_1;
								} else {
									break _v26_5;
								}
							}
						}
					} else {
						break _v26_5;
					}
				} while(false);
				return {
					ctor: '::',
					_0: _p23._1._0,
					_1: {ctor: '[]'}
				};
			} while(false);
			return list;
		}
	});
var _elm_lang$core$List$take = F2(
	function (n, list) {
		return A3(_elm_lang$core$List$takeFast, 0, n, list);
	});
var _elm_lang$core$List$repeatHelp = F3(
	function (result, n, value) {
		repeatHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) {
				return result;
			} else {
				var _v27 = {ctor: '::', _0: value, _1: result},
					_v28 = n - 1,
					_v29 = value;
				result = _v27;
				n = _v28;
				value = _v29;
				continue repeatHelp;
			}
		}
	});
var _elm_lang$core$List$repeat = F2(
	function (n, value) {
		return A3(
			_elm_lang$core$List$repeatHelp,
			{ctor: '[]'},
			n,
			value);
	});
var _elm_lang$core$List$rangeHelp = F3(
	function (lo, hi, list) {
		rangeHelp:
		while (true) {
			if (_elm_lang$core$Native_Utils.cmp(lo, hi) < 1) {
				var _v30 = lo,
					_v31 = hi - 1,
					_v32 = {ctor: '::', _0: hi, _1: list};
				lo = _v30;
				hi = _v31;
				list = _v32;
				continue rangeHelp;
			} else {
				return list;
			}
		}
	});
var _elm_lang$core$List$range = F2(
	function (lo, hi) {
		return A3(
			_elm_lang$core$List$rangeHelp,
			lo,
			hi,
			{ctor: '[]'});
	});
var _elm_lang$core$List$indexedMap = F2(
	function (f, xs) {
		return A3(
			_elm_lang$core$List$map2,
			f,
			A2(
				_elm_lang$core$List$range,
				0,
				_elm_lang$core$List$length(xs) - 1),
			xs);
	});

var _elm_lang$core$Array$append = _elm_lang$core$Native_Array.append;
var _elm_lang$core$Array$length = _elm_lang$core$Native_Array.length;
var _elm_lang$core$Array$isEmpty = function (array) {
	return _elm_lang$core$Native_Utils.eq(
		_elm_lang$core$Array$length(array),
		0);
};
var _elm_lang$core$Array$slice = _elm_lang$core$Native_Array.slice;
var _elm_lang$core$Array$set = _elm_lang$core$Native_Array.set;
var _elm_lang$core$Array$get = F2(
	function (i, array) {
		return ((_elm_lang$core$Native_Utils.cmp(0, i) < 1) && (_elm_lang$core$Native_Utils.cmp(
			i,
			_elm_lang$core$Native_Array.length(array)) < 0)) ? _elm_lang$core$Maybe$Just(
			A2(_elm_lang$core$Native_Array.get, i, array)) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$core$Array$push = _elm_lang$core$Native_Array.push;
var _elm_lang$core$Array$empty = _elm_lang$core$Native_Array.empty;
var _elm_lang$core$Array$filter = F2(
	function (isOkay, arr) {
		var update = F2(
			function (x, xs) {
				return isOkay(x) ? A2(_elm_lang$core$Native_Array.push, x, xs) : xs;
			});
		return A3(_elm_lang$core$Native_Array.foldl, update, _elm_lang$core$Native_Array.empty, arr);
	});
var _elm_lang$core$Array$foldr = _elm_lang$core$Native_Array.foldr;
var _elm_lang$core$Array$foldl = _elm_lang$core$Native_Array.foldl;
var _elm_lang$core$Array$indexedMap = _elm_lang$core$Native_Array.indexedMap;
var _elm_lang$core$Array$map = _elm_lang$core$Native_Array.map;
var _elm_lang$core$Array$toIndexedList = function (array) {
	return A3(
		_elm_lang$core$List$map2,
		F2(
			function (v0, v1) {
				return {ctor: '_Tuple2', _0: v0, _1: v1};
			}),
		A2(
			_elm_lang$core$List$range,
			0,
			_elm_lang$core$Native_Array.length(array) - 1),
		_elm_lang$core$Native_Array.toList(array));
};
var _elm_lang$core$Array$toList = _elm_lang$core$Native_Array.toList;
var _elm_lang$core$Array$fromList = _elm_lang$core$Native_Array.fromList;
var _elm_lang$core$Array$initialize = _elm_lang$core$Native_Array.initialize;
var _elm_lang$core$Array$repeat = F2(
	function (n, e) {
		return A2(
			_elm_lang$core$Array$initialize,
			n,
			_elm_lang$core$Basics$always(e));
	});
var _elm_lang$core$Array$Array = {ctor: 'Array'};

//import Native.Utils //

var _elm_lang$core$Native_Char = function() {

return {
	fromCode: function(c) { return _elm_lang$core$Native_Utils.chr(String.fromCharCode(c)); },
	toCode: function(c) { return c.charCodeAt(0); },
	toUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toUpperCase()); },
	toLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLowerCase()); },
	toLocaleUpper: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleUpperCase()); },
	toLocaleLower: function(c) { return _elm_lang$core$Native_Utils.chr(c.toLocaleLowerCase()); }
};

}();
var _elm_lang$core$Char$fromCode = _elm_lang$core$Native_Char.fromCode;
var _elm_lang$core$Char$toCode = _elm_lang$core$Native_Char.toCode;
var _elm_lang$core$Char$toLocaleLower = _elm_lang$core$Native_Char.toLocaleLower;
var _elm_lang$core$Char$toLocaleUpper = _elm_lang$core$Native_Char.toLocaleUpper;
var _elm_lang$core$Char$toLower = _elm_lang$core$Native_Char.toLower;
var _elm_lang$core$Char$toUpper = _elm_lang$core$Native_Char.toUpper;
var _elm_lang$core$Char$isBetween = F3(
	function (low, high, $char) {
		var code = _elm_lang$core$Char$toCode($char);
		return (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(low)) > -1) && (_elm_lang$core$Native_Utils.cmp(
			code,
			_elm_lang$core$Char$toCode(high)) < 1);
	});
var _elm_lang$core$Char$isUpper = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('A'),
	_elm_lang$core$Native_Utils.chr('Z'));
var _elm_lang$core$Char$isLower = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('a'),
	_elm_lang$core$Native_Utils.chr('z'));
var _elm_lang$core$Char$isDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('9'));
var _elm_lang$core$Char$isOctDigit = A2(
	_elm_lang$core$Char$isBetween,
	_elm_lang$core$Native_Utils.chr('0'),
	_elm_lang$core$Native_Utils.chr('7'));
var _elm_lang$core$Char$isHexDigit = function ($char) {
	return _elm_lang$core$Char$isDigit($char) || (A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('a'),
		_elm_lang$core$Native_Utils.chr('f'),
		$char) || A3(
		_elm_lang$core$Char$isBetween,
		_elm_lang$core$Native_Utils.chr('A'),
		_elm_lang$core$Native_Utils.chr('F'),
		$char));
};

var _elm_lang$core$Color$fmod = F2(
	function (f, n) {
		var integer = _elm_lang$core$Basics$floor(f);
		return (_elm_lang$core$Basics$toFloat(
			A2(_elm_lang$core$Basics_ops['%'], integer, n)) + f) - _elm_lang$core$Basics$toFloat(integer);
	});
var _elm_lang$core$Color$rgbToHsl = F3(
	function (red, green, blue) {
		var b = _elm_lang$core$Basics$toFloat(blue) / 255;
		var g = _elm_lang$core$Basics$toFloat(green) / 255;
		var r = _elm_lang$core$Basics$toFloat(red) / 255;
		var cMax = A2(
			_elm_lang$core$Basics$max,
			A2(_elm_lang$core$Basics$max, r, g),
			b);
		var cMin = A2(
			_elm_lang$core$Basics$min,
			A2(_elm_lang$core$Basics$min, r, g),
			b);
		var c = cMax - cMin;
		var lightness = (cMax + cMin) / 2;
		var saturation = _elm_lang$core$Native_Utils.eq(lightness, 0) ? 0 : (c / (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)));
		var hue = _elm_lang$core$Basics$degrees(60) * (_elm_lang$core$Native_Utils.eq(cMax, r) ? A2(_elm_lang$core$Color$fmod, (g - b) / c, 6) : (_elm_lang$core$Native_Utils.eq(cMax, g) ? (((b - r) / c) + 2) : (((r - g) / c) + 4)));
		return {ctor: '_Tuple3', _0: hue, _1: saturation, _2: lightness};
	});
var _elm_lang$core$Color$hslToRgb = F3(
	function (hue, saturation, lightness) {
		var normHue = hue / _elm_lang$core$Basics$degrees(60);
		var chroma = (1 - _elm_lang$core$Basics$abs((2 * lightness) - 1)) * saturation;
		var x = chroma * (1 - _elm_lang$core$Basics$abs(
			A2(_elm_lang$core$Color$fmod, normHue, 2) - 1));
		var _p0 = (_elm_lang$core$Native_Utils.cmp(normHue, 0) < 0) ? {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 1) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: x, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 2) < 0) ? {ctor: '_Tuple3', _0: x, _1: chroma, _2: 0} : ((_elm_lang$core$Native_Utils.cmp(normHue, 3) < 0) ? {ctor: '_Tuple3', _0: 0, _1: chroma, _2: x} : ((_elm_lang$core$Native_Utils.cmp(normHue, 4) < 0) ? {ctor: '_Tuple3', _0: 0, _1: x, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 5) < 0) ? {ctor: '_Tuple3', _0: x, _1: 0, _2: chroma} : ((_elm_lang$core$Native_Utils.cmp(normHue, 6) < 0) ? {ctor: '_Tuple3', _0: chroma, _1: 0, _2: x} : {ctor: '_Tuple3', _0: 0, _1: 0, _2: 0}))))));
		var r = _p0._0;
		var g = _p0._1;
		var b = _p0._2;
		var m = lightness - (chroma / 2);
		return {ctor: '_Tuple3', _0: r + m, _1: g + m, _2: b + m};
	});
var _elm_lang$core$Color$toRgb = function (color) {
	var _p1 = color;
	if (_p1.ctor === 'RGBA') {
		return {red: _p1._0, green: _p1._1, blue: _p1._2, alpha: _p1._3};
	} else {
		var _p2 = A3(_elm_lang$core$Color$hslToRgb, _p1._0, _p1._1, _p1._2);
		var r = _p2._0;
		var g = _p2._1;
		var b = _p2._2;
		return {
			red: _elm_lang$core$Basics$round(255 * r),
			green: _elm_lang$core$Basics$round(255 * g),
			blue: _elm_lang$core$Basics$round(255 * b),
			alpha: _p1._3
		};
	}
};
var _elm_lang$core$Color$toHsl = function (color) {
	var _p3 = color;
	if (_p3.ctor === 'HSLA') {
		return {hue: _p3._0, saturation: _p3._1, lightness: _p3._2, alpha: _p3._3};
	} else {
		var _p4 = A3(_elm_lang$core$Color$rgbToHsl, _p3._0, _p3._1, _p3._2);
		var h = _p4._0;
		var s = _p4._1;
		var l = _p4._2;
		return {hue: h, saturation: s, lightness: l, alpha: _p3._3};
	}
};
var _elm_lang$core$Color$HSLA = F4(
	function (a, b, c, d) {
		return {ctor: 'HSLA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$hsla = F4(
	function (hue, saturation, lightness, alpha) {
		return A4(
			_elm_lang$core$Color$HSLA,
			hue - _elm_lang$core$Basics$turns(
				_elm_lang$core$Basics$toFloat(
					_elm_lang$core$Basics$floor(hue / (2 * _elm_lang$core$Basics$pi)))),
			saturation,
			lightness,
			alpha);
	});
var _elm_lang$core$Color$hsl = F3(
	function (hue, saturation, lightness) {
		return A4(_elm_lang$core$Color$hsla, hue, saturation, lightness, 1);
	});
var _elm_lang$core$Color$complement = function (color) {
	var _p5 = color;
	if (_p5.ctor === 'HSLA') {
		return A4(
			_elm_lang$core$Color$hsla,
			_p5._0 + _elm_lang$core$Basics$degrees(180),
			_p5._1,
			_p5._2,
			_p5._3);
	} else {
		var _p6 = A3(_elm_lang$core$Color$rgbToHsl, _p5._0, _p5._1, _p5._2);
		var h = _p6._0;
		var s = _p6._1;
		var l = _p6._2;
		return A4(
			_elm_lang$core$Color$hsla,
			h + _elm_lang$core$Basics$degrees(180),
			s,
			l,
			_p5._3);
	}
};
var _elm_lang$core$Color$grayscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$greyscale = function (p) {
	return A4(_elm_lang$core$Color$HSLA, 0, 0, 1 - p, 1);
};
var _elm_lang$core$Color$RGBA = F4(
	function (a, b, c, d) {
		return {ctor: 'RGBA', _0: a, _1: b, _2: c, _3: d};
	});
var _elm_lang$core$Color$rgba = _elm_lang$core$Color$RGBA;
var _elm_lang$core$Color$rgb = F3(
	function (r, g, b) {
		return A4(_elm_lang$core$Color$RGBA, r, g, b, 1);
	});
var _elm_lang$core$Color$lightRed = A4(_elm_lang$core$Color$RGBA, 239, 41, 41, 1);
var _elm_lang$core$Color$red = A4(_elm_lang$core$Color$RGBA, 204, 0, 0, 1);
var _elm_lang$core$Color$darkRed = A4(_elm_lang$core$Color$RGBA, 164, 0, 0, 1);
var _elm_lang$core$Color$lightOrange = A4(_elm_lang$core$Color$RGBA, 252, 175, 62, 1);
var _elm_lang$core$Color$orange = A4(_elm_lang$core$Color$RGBA, 245, 121, 0, 1);
var _elm_lang$core$Color$darkOrange = A4(_elm_lang$core$Color$RGBA, 206, 92, 0, 1);
var _elm_lang$core$Color$lightYellow = A4(_elm_lang$core$Color$RGBA, 255, 233, 79, 1);
var _elm_lang$core$Color$yellow = A4(_elm_lang$core$Color$RGBA, 237, 212, 0, 1);
var _elm_lang$core$Color$darkYellow = A4(_elm_lang$core$Color$RGBA, 196, 160, 0, 1);
var _elm_lang$core$Color$lightGreen = A4(_elm_lang$core$Color$RGBA, 138, 226, 52, 1);
var _elm_lang$core$Color$green = A4(_elm_lang$core$Color$RGBA, 115, 210, 22, 1);
var _elm_lang$core$Color$darkGreen = A4(_elm_lang$core$Color$RGBA, 78, 154, 6, 1);
var _elm_lang$core$Color$lightBlue = A4(_elm_lang$core$Color$RGBA, 114, 159, 207, 1);
var _elm_lang$core$Color$blue = A4(_elm_lang$core$Color$RGBA, 52, 101, 164, 1);
var _elm_lang$core$Color$darkBlue = A4(_elm_lang$core$Color$RGBA, 32, 74, 135, 1);
var _elm_lang$core$Color$lightPurple = A4(_elm_lang$core$Color$RGBA, 173, 127, 168, 1);
var _elm_lang$core$Color$purple = A4(_elm_lang$core$Color$RGBA, 117, 80, 123, 1);
var _elm_lang$core$Color$darkPurple = A4(_elm_lang$core$Color$RGBA, 92, 53, 102, 1);
var _elm_lang$core$Color$lightBrown = A4(_elm_lang$core$Color$RGBA, 233, 185, 110, 1);
var _elm_lang$core$Color$brown = A4(_elm_lang$core$Color$RGBA, 193, 125, 17, 1);
var _elm_lang$core$Color$darkBrown = A4(_elm_lang$core$Color$RGBA, 143, 89, 2, 1);
var _elm_lang$core$Color$black = A4(_elm_lang$core$Color$RGBA, 0, 0, 0, 1);
var _elm_lang$core$Color$white = A4(_elm_lang$core$Color$RGBA, 255, 255, 255, 1);
var _elm_lang$core$Color$lightGrey = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$grey = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGrey = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightGray = A4(_elm_lang$core$Color$RGBA, 238, 238, 236, 1);
var _elm_lang$core$Color$gray = A4(_elm_lang$core$Color$RGBA, 211, 215, 207, 1);
var _elm_lang$core$Color$darkGray = A4(_elm_lang$core$Color$RGBA, 186, 189, 182, 1);
var _elm_lang$core$Color$lightCharcoal = A4(_elm_lang$core$Color$RGBA, 136, 138, 133, 1);
var _elm_lang$core$Color$charcoal = A4(_elm_lang$core$Color$RGBA, 85, 87, 83, 1);
var _elm_lang$core$Color$darkCharcoal = A4(_elm_lang$core$Color$RGBA, 46, 52, 54, 1);
var _elm_lang$core$Color$Radial = F5(
	function (a, b, c, d, e) {
		return {ctor: 'Radial', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Color$radial = _elm_lang$core$Color$Radial;
var _elm_lang$core$Color$Linear = F3(
	function (a, b, c) {
		return {ctor: 'Linear', _0: a, _1: b, _2: c};
	});
var _elm_lang$core$Color$linear = _elm_lang$core$Color$Linear;

//import Native.Utils //

var _elm_lang$core$Native_Scheduler = function() {

var MAX_STEPS = 10000;


// TASKS

function succeed(value)
{
	return {
		ctor: '_Task_succeed',
		value: value
	};
}

function fail(error)
{
	return {
		ctor: '_Task_fail',
		value: error
	};
}

function nativeBinding(callback)
{
	return {
		ctor: '_Task_nativeBinding',
		callback: callback,
		cancel: null
	};
}

function andThen(callback, task)
{
	return {
		ctor: '_Task_andThen',
		callback: callback,
		task: task
	};
}

function onError(callback, task)
{
	return {
		ctor: '_Task_onError',
		callback: callback,
		task: task
	};
}

function receive(callback)
{
	return {
		ctor: '_Task_receive',
		callback: callback
	};
}


// PROCESSES

function rawSpawn(task)
{
	var process = {
		ctor: '_Process',
		id: _elm_lang$core$Native_Utils.guid(),
		root: task,
		stack: null,
		mailbox: []
	};

	enqueue(process);

	return process;
}

function spawn(task)
{
	return nativeBinding(function(callback) {
		var process = rawSpawn(task);
		callback(succeed(process));
	});
}

function rawSend(process, msg)
{
	process.mailbox.push(msg);
	enqueue(process);
}

function send(process, msg)
{
	return nativeBinding(function(callback) {
		rawSend(process, msg);
		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function kill(process)
{
	return nativeBinding(function(callback) {
		var root = process.root;
		if (root.ctor === '_Task_nativeBinding' && root.cancel)
		{
			root.cancel();
		}

		process.root = null;

		callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sleep(time)
{
	return nativeBinding(function(callback) {
		var id = setTimeout(function() {
			callback(succeed(_elm_lang$core$Native_Utils.Tuple0));
		}, time);

		return function() { clearTimeout(id); };
	});
}


// STEP PROCESSES

function step(numSteps, process)
{
	while (numSteps < MAX_STEPS)
	{
		var ctor = process.root.ctor;

		if (ctor === '_Task_succeed')
		{
			while (process.stack && process.stack.ctor === '_Task_onError')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_fail')
		{
			while (process.stack && process.stack.ctor === '_Task_andThen')
			{
				process.stack = process.stack.rest;
			}
			if (process.stack === null)
			{
				break;
			}
			process.root = process.stack.callback(process.root.value);
			process.stack = process.stack.rest;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_andThen')
		{
			process.stack = {
				ctor: '_Task_andThen',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_onError')
		{
			process.stack = {
				ctor: '_Task_onError',
				callback: process.root.callback,
				rest: process.stack
			};
			process.root = process.root.task;
			++numSteps;
			continue;
		}

		if (ctor === '_Task_nativeBinding')
		{
			process.root.cancel = process.root.callback(function(newRoot) {
				process.root = newRoot;
				enqueue(process);
			});

			break;
		}

		if (ctor === '_Task_receive')
		{
			var mailbox = process.mailbox;
			if (mailbox.length === 0)
			{
				break;
			}

			process.root = process.root.callback(mailbox.shift());
			++numSteps;
			continue;
		}

		throw new Error(ctor);
	}

	if (numSteps < MAX_STEPS)
	{
		return numSteps + 1;
	}
	enqueue(process);

	return numSteps;
}


// WORK QUEUE

var working = false;
var workQueue = [];

function enqueue(process)
{
	workQueue.push(process);

	if (!working)
	{
		setTimeout(work, 0);
		working = true;
	}
}

function work()
{
	var numSteps = 0;
	var process;
	while (numSteps < MAX_STEPS && (process = workQueue.shift()))
	{
		if (process.root)
		{
			numSteps = step(numSteps, process);
		}
	}
	if (!process)
	{
		working = false;
		return;
	}
	setTimeout(work, 0);
}


return {
	succeed: succeed,
	fail: fail,
	nativeBinding: nativeBinding,
	andThen: F2(andThen),
	onError: F2(onError),
	receive: receive,

	spawn: spawn,
	kill: kill,
	sleep: sleep,
	send: F2(send),

	rawSpawn: rawSpawn,
	rawSend: rawSend
};

}();
//import //

var _elm_lang$core$Native_Platform = function() {


// PROGRAMS

function program(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flags !== 'undefined')
				{
					throw new Error(
						'The `' + moduleName + '` module does not need flags.\n'
						+ 'Call ' + moduleName + '.worker() with no arguments and you should be all set!'
					);
				}

				return initialize(
					impl.init,
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function programWithFlags(impl)
{
	return function(flagDecoder)
	{
		return function(object, moduleName)
		{
			object['worker'] = function worker(flags)
			{
				if (typeof flagDecoder === 'undefined')
				{
					throw new Error(
						'Are you trying to sneak a Never value into Elm? Trickster!\n'
						+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
						+ 'Use `program` instead if you do not want flags.'
					);
				}

				var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
				if (result.ctor === 'Err')
				{
					throw new Error(
						moduleName + '.worker(...) was called with an unexpected argument.\n'
						+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
						+ result._0
					);
				}

				return initialize(
					impl.init(result._0),
					impl.update,
					impl.subscriptions,
					renderer
				);
			};
		};
	};
}

function renderer(enqueue, _)
{
	return function(_) {};
}


// HTML TO PROGRAM

function htmlToProgram(vnode)
{
	var emptyBag = batch(_elm_lang$core$Native_List.Nil);
	var noChange = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		emptyBag
	);

	return _elm_lang$virtual_dom$VirtualDom$program({
		init: noChange,
		view: function(model) { return main; },
		update: F2(function(msg, model) { return noChange; }),
		subscriptions: function (model) { return emptyBag; }
	});
}


// INITIALIZE A PROGRAM

function initialize(init, update, subscriptions, renderer)
{
	// ambient state
	var managers = {};
	var updateView;

	// init and update state in main process
	var initApp = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
		var model = init._0;
		updateView = renderer(enqueue, model);
		var cmds = init._1;
		var subs = subscriptions(model);
		dispatchEffects(managers, cmds, subs);
		callback(_elm_lang$core$Native_Scheduler.succeed(model));
	});

	function onMessage(msg, model)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {
			var results = A2(update, msg, model);
			model = results._0;
			updateView(model);
			var cmds = results._1;
			var subs = subscriptions(model);
			dispatchEffects(managers, cmds, subs);
			callback(_elm_lang$core$Native_Scheduler.succeed(model));
		});
	}

	var mainProcess = spawnLoop(initApp, onMessage);

	function enqueue(msg)
	{
		_elm_lang$core$Native_Scheduler.rawSend(mainProcess, msg);
	}

	var ports = setupEffects(managers, enqueue);

	return ports ? { ports: ports } : {};
}


// EFFECT MANAGERS

var effectManagers = {};

function setupEffects(managers, callback)
{
	var ports;

	// setup all necessary effect managers
	for (var key in effectManagers)
	{
		var manager = effectManagers[key];

		if (manager.isForeign)
		{
			ports = ports || {};
			ports[key] = manager.tag === 'cmd'
				? setupOutgoingPort(key)
				: setupIncomingPort(key, callback);
		}

		managers[key] = makeManager(manager, callback);
	}

	return ports;
}

function makeManager(info, callback)
{
	var router = {
		main: callback,
		self: undefined
	};

	var tag = info.tag;
	var onEffects = info.onEffects;
	var onSelfMsg = info.onSelfMsg;

	function onMessage(msg, state)
	{
		if (msg.ctor === 'self')
		{
			return A3(onSelfMsg, router, msg._0, state);
		}

		var fx = msg._0;
		switch (tag)
		{
			case 'cmd':
				return A3(onEffects, router, fx.cmds, state);

			case 'sub':
				return A3(onEffects, router, fx.subs, state);

			case 'fx':
				return A4(onEffects, router, fx.cmds, fx.subs, state);
		}
	}

	var process = spawnLoop(info.init, onMessage);
	router.self = process;
	return process;
}

function sendToApp(router, msg)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		router.main(msg);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function sendToSelf(router, msg)
{
	return A2(_elm_lang$core$Native_Scheduler.send, router.self, {
		ctor: 'self',
		_0: msg
	});
}


// HELPER for STATEFUL LOOPS

function spawnLoop(init, onMessage)
{
	var andThen = _elm_lang$core$Native_Scheduler.andThen;

	function loop(state)
	{
		var handleMsg = _elm_lang$core$Native_Scheduler.receive(function(msg) {
			return onMessage(msg, state);
		});
		return A2(andThen, loop, handleMsg);
	}

	var task = A2(andThen, loop, init);

	return _elm_lang$core$Native_Scheduler.rawSpawn(task);
}


// BAGS

function leaf(home)
{
	return function(value)
	{
		return {
			type: 'leaf',
			home: home,
			value: value
		};
	};
}

function batch(list)
{
	return {
		type: 'node',
		branches: list
	};
}

function map(tagger, bag)
{
	return {
		type: 'map',
		tagger: tagger,
		tree: bag
	}
}


// PIPE BAGS INTO EFFECT MANAGERS

function dispatchEffects(managers, cmdBag, subBag)
{
	var effectsDict = {};
	gatherEffects(true, cmdBag, effectsDict, null);
	gatherEffects(false, subBag, effectsDict, null);

	for (var home in managers)
	{
		var fx = home in effectsDict
			? effectsDict[home]
			: {
				cmds: _elm_lang$core$Native_List.Nil,
				subs: _elm_lang$core$Native_List.Nil
			};

		_elm_lang$core$Native_Scheduler.rawSend(managers[home], { ctor: 'fx', _0: fx });
	}
}

function gatherEffects(isCmd, bag, effectsDict, taggers)
{
	switch (bag.type)
	{
		case 'leaf':
			var home = bag.home;
			var effect = toEffect(isCmd, home, taggers, bag.value);
			effectsDict[home] = insert(isCmd, effect, effectsDict[home]);
			return;

		case 'node':
			var list = bag.branches;
			while (list.ctor !== '[]')
			{
				gatherEffects(isCmd, list._0, effectsDict, taggers);
				list = list._1;
			}
			return;

		case 'map':
			gatherEffects(isCmd, bag.tree, effectsDict, {
				tagger: bag.tagger,
				rest: taggers
			});
			return;
	}
}

function toEffect(isCmd, home, taggers, value)
{
	function applyTaggers(x)
	{
		var temp = taggers;
		while (temp)
		{
			x = temp.tagger(x);
			temp = temp.rest;
		}
		return x;
	}

	var map = isCmd
		? effectManagers[home].cmdMap
		: effectManagers[home].subMap;

	return A2(map, applyTaggers, value)
}

function insert(isCmd, newEffect, effects)
{
	effects = effects || {
		cmds: _elm_lang$core$Native_List.Nil,
		subs: _elm_lang$core$Native_List.Nil
	};
	if (isCmd)
	{
		effects.cmds = _elm_lang$core$Native_List.Cons(newEffect, effects.cmds);
		return effects;
	}
	effects.subs = _elm_lang$core$Native_List.Cons(newEffect, effects.subs);
	return effects;
}


// PORTS

function checkPortName(name)
{
	if (name in effectManagers)
	{
		throw new Error('There can only be one port named `' + name + '`, but your program has multiple.');
	}
}


// OUTGOING PORTS

function outgoingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'cmd',
		cmdMap: outgoingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var outgoingPortMap = F2(function cmdMap(tagger, value) {
	return value;
});

function setupOutgoingPort(name)
{
	var subs = [];
	var converter = effectManagers[name].converter;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function onEffects(router, cmdList, state)
	{
		while (cmdList.ctor !== '[]')
		{
			// grab a separate reference to subs in case unsubscribe is called
			var currentSubs = subs;
			var value = converter(cmdList._0);
			for (var i = 0; i < currentSubs.length; i++)
			{
				currentSubs[i](value);
			}
			cmdList = cmdList._1;
		}
		return init;
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function subscribe(callback)
	{
		subs.push(callback);
	}

	function unsubscribe(callback)
	{
		// copy subs into a new array in case unsubscribe is called within a
		// subscribed callback
		subs = subs.slice();
		var index = subs.indexOf(callback);
		if (index >= 0)
		{
			subs.splice(index, 1);
		}
	}

	return {
		subscribe: subscribe,
		unsubscribe: unsubscribe
	};
}


// INCOMING PORTS

function incomingPort(name, converter)
{
	checkPortName(name);
	effectManagers[name] = {
		tag: 'sub',
		subMap: incomingPortMap,
		converter: converter,
		isForeign: true
	};
	return leaf(name);
}

var incomingPortMap = F2(function subMap(tagger, finalTagger)
{
	return function(value)
	{
		return tagger(finalTagger(value));
	};
});

function setupIncomingPort(name, callback)
{
	var sentBeforeInit = [];
	var subs = _elm_lang$core$Native_List.Nil;
	var converter = effectManagers[name].converter;
	var currentOnEffects = preInitOnEffects;
	var currentSend = preInitSend;

	// CREATE MANAGER

	var init = _elm_lang$core$Native_Scheduler.succeed(null);

	function preInitOnEffects(router, subList, state)
	{
		var postInitResult = postInitOnEffects(router, subList, state);

		for(var i = 0; i < sentBeforeInit.length; i++)
		{
			postInitSend(sentBeforeInit[i]);
		}

		sentBeforeInit = null; // to release objects held in queue
		currentSend = postInitSend;
		currentOnEffects = postInitOnEffects;
		return postInitResult;
	}

	function postInitOnEffects(router, subList, state)
	{
		subs = subList;
		return init;
	}

	function onEffects(router, subList, state)
	{
		return currentOnEffects(router, subList, state);
	}

	effectManagers[name].init = init;
	effectManagers[name].onEffects = F3(onEffects);

	// PUBLIC API

	function preInitSend(value)
	{
		sentBeforeInit.push(value);
	}

	function postInitSend(value)
	{
		var temp = subs;
		while (temp.ctor !== '[]')
		{
			callback(temp._0(value));
			temp = temp._1;
		}
	}

	function send(incomingValue)
	{
		var result = A2(_elm_lang$core$Json_Decode$decodeValue, converter, incomingValue);
		if (result.ctor === 'Err')
		{
			throw new Error('Trying to send an unexpected type of value through port `' + name + '`:\n' + result._0);
		}

		currentSend(result._0);
	}

	return { send: send };
}

return {
	// routers
	sendToApp: F2(sendToApp),
	sendToSelf: F2(sendToSelf),

	// global setup
	effectManagers: effectManagers,
	outgoingPort: outgoingPort,
	incomingPort: incomingPort,

	htmlToProgram: htmlToProgram,
	program: program,
	programWithFlags: programWithFlags,
	initialize: initialize,

	// effect bags
	leaf: leaf,
	batch: batch,
	map: F2(map)
};

}();

var _elm_lang$core$Platform_Cmd$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Cmd$none = _elm_lang$core$Platform_Cmd$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Cmd_ops = _elm_lang$core$Platform_Cmd_ops || {};
_elm_lang$core$Platform_Cmd_ops['!'] = F2(
	function (model, commands) {
		return {
			ctor: '_Tuple2',
			_0: model,
			_1: _elm_lang$core$Platform_Cmd$batch(commands)
		};
	});
var _elm_lang$core$Platform_Cmd$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Cmd$Cmd = {ctor: 'Cmd'};

var _elm_lang$core$Platform_Sub$batch = _elm_lang$core$Native_Platform.batch;
var _elm_lang$core$Platform_Sub$none = _elm_lang$core$Platform_Sub$batch(
	{ctor: '[]'});
var _elm_lang$core$Platform_Sub$map = _elm_lang$core$Native_Platform.map;
var _elm_lang$core$Platform_Sub$Sub = {ctor: 'Sub'};

var _elm_lang$core$Platform$hack = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Platform$sendToSelf = _elm_lang$core$Native_Platform.sendToSelf;
var _elm_lang$core$Platform$sendToApp = _elm_lang$core$Native_Platform.sendToApp;
var _elm_lang$core$Platform$programWithFlags = _elm_lang$core$Native_Platform.programWithFlags;
var _elm_lang$core$Platform$program = _elm_lang$core$Native_Platform.program;
var _elm_lang$core$Platform$Program = {ctor: 'Program'};
var _elm_lang$core$Platform$Task = {ctor: 'Task'};
var _elm_lang$core$Platform$ProcessId = {ctor: 'ProcessId'};
var _elm_lang$core$Platform$Router = {ctor: 'Router'};

var _elm_lang$core$Result$toMaybe = function (result) {
	var _p0 = result;
	if (_p0.ctor === 'Ok') {
		return _elm_lang$core$Maybe$Just(_p0._0);
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _elm_lang$core$Result$withDefault = F2(
	function (def, result) {
		var _p1 = result;
		if (_p1.ctor === 'Ok') {
			return _p1._0;
		} else {
			return def;
		}
	});
var _elm_lang$core$Result$Err = function (a) {
	return {ctor: 'Err', _0: a};
};
var _elm_lang$core$Result$andThen = F2(
	function (callback, result) {
		var _p2 = result;
		if (_p2.ctor === 'Ok') {
			return callback(_p2._0);
		} else {
			return _elm_lang$core$Result$Err(_p2._0);
		}
	});
var _elm_lang$core$Result$Ok = function (a) {
	return {ctor: 'Ok', _0: a};
};
var _elm_lang$core$Result$map = F2(
	function (func, ra) {
		var _p3 = ra;
		if (_p3.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(
				func(_p3._0));
		} else {
			return _elm_lang$core$Result$Err(_p3._0);
		}
	});
var _elm_lang$core$Result$map2 = F3(
	function (func, ra, rb) {
		var _p4 = {ctor: '_Tuple2', _0: ra, _1: rb};
		if (_p4._0.ctor === 'Ok') {
			if (_p4._1.ctor === 'Ok') {
				return _elm_lang$core$Result$Ok(
					A2(func, _p4._0._0, _p4._1._0));
			} else {
				return _elm_lang$core$Result$Err(_p4._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p4._0._0);
		}
	});
var _elm_lang$core$Result$map3 = F4(
	function (func, ra, rb, rc) {
		var _p5 = {ctor: '_Tuple3', _0: ra, _1: rb, _2: rc};
		if (_p5._0.ctor === 'Ok') {
			if (_p5._1.ctor === 'Ok') {
				if (_p5._2.ctor === 'Ok') {
					return _elm_lang$core$Result$Ok(
						A3(func, _p5._0._0, _p5._1._0, _p5._2._0));
				} else {
					return _elm_lang$core$Result$Err(_p5._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p5._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p5._0._0);
		}
	});
var _elm_lang$core$Result$map4 = F5(
	function (func, ra, rb, rc, rd) {
		var _p6 = {ctor: '_Tuple4', _0: ra, _1: rb, _2: rc, _3: rd};
		if (_p6._0.ctor === 'Ok') {
			if (_p6._1.ctor === 'Ok') {
				if (_p6._2.ctor === 'Ok') {
					if (_p6._3.ctor === 'Ok') {
						return _elm_lang$core$Result$Ok(
							A4(func, _p6._0._0, _p6._1._0, _p6._2._0, _p6._3._0));
					} else {
						return _elm_lang$core$Result$Err(_p6._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p6._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p6._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p6._0._0);
		}
	});
var _elm_lang$core$Result$map5 = F6(
	function (func, ra, rb, rc, rd, re) {
		var _p7 = {ctor: '_Tuple5', _0: ra, _1: rb, _2: rc, _3: rd, _4: re};
		if (_p7._0.ctor === 'Ok') {
			if (_p7._1.ctor === 'Ok') {
				if (_p7._2.ctor === 'Ok') {
					if (_p7._3.ctor === 'Ok') {
						if (_p7._4.ctor === 'Ok') {
							return _elm_lang$core$Result$Ok(
								A5(func, _p7._0._0, _p7._1._0, _p7._2._0, _p7._3._0, _p7._4._0));
						} else {
							return _elm_lang$core$Result$Err(_p7._4._0);
						}
					} else {
						return _elm_lang$core$Result$Err(_p7._3._0);
					}
				} else {
					return _elm_lang$core$Result$Err(_p7._2._0);
				}
			} else {
				return _elm_lang$core$Result$Err(_p7._1._0);
			}
		} else {
			return _elm_lang$core$Result$Err(_p7._0._0);
		}
	});
var _elm_lang$core$Result$mapError = F2(
	function (f, result) {
		var _p8 = result;
		if (_p8.ctor === 'Ok') {
			return _elm_lang$core$Result$Ok(_p8._0);
		} else {
			return _elm_lang$core$Result$Err(
				f(_p8._0));
		}
	});
var _elm_lang$core$Result$fromMaybe = F2(
	function (err, maybe) {
		var _p9 = maybe;
		if (_p9.ctor === 'Just') {
			return _elm_lang$core$Result$Ok(_p9._0);
		} else {
			return _elm_lang$core$Result$Err(err);
		}
	});

var _elm_lang$core$Task$onError = _elm_lang$core$Native_Scheduler.onError;
var _elm_lang$core$Task$andThen = _elm_lang$core$Native_Scheduler.andThen;
var _elm_lang$core$Task$spawnCmd = F2(
	function (router, _p0) {
		var _p1 = _p0;
		return _elm_lang$core$Native_Scheduler.spawn(
			A2(
				_elm_lang$core$Task$andThen,
				_elm_lang$core$Platform$sendToApp(router),
				_p1._0));
	});
var _elm_lang$core$Task$fail = _elm_lang$core$Native_Scheduler.fail;
var _elm_lang$core$Task$mapError = F2(
	function (convert, task) {
		return A2(
			_elm_lang$core$Task$onError,
			function (_p2) {
				return _elm_lang$core$Task$fail(
					convert(_p2));
			},
			task);
	});
var _elm_lang$core$Task$succeed = _elm_lang$core$Native_Scheduler.succeed;
var _elm_lang$core$Task$map = F2(
	function (func, taskA) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return _elm_lang$core$Task$succeed(
					func(a));
			},
			taskA);
	});
var _elm_lang$core$Task$map2 = F3(
	function (func, taskA, taskB) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return _elm_lang$core$Task$succeed(
							A2(func, a, b));
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map3 = F4(
	function (func, taskA, taskB, taskC) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return _elm_lang$core$Task$succeed(
									A3(func, a, b, c));
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map4 = F5(
	function (func, taskA, taskB, taskC, taskD) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return _elm_lang$core$Task$succeed(
											A4(func, a, b, c, d));
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$map5 = F6(
	function (func, taskA, taskB, taskC, taskD, taskE) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (a) {
				return A2(
					_elm_lang$core$Task$andThen,
					function (b) {
						return A2(
							_elm_lang$core$Task$andThen,
							function (c) {
								return A2(
									_elm_lang$core$Task$andThen,
									function (d) {
										return A2(
											_elm_lang$core$Task$andThen,
											function (e) {
												return _elm_lang$core$Task$succeed(
													A5(func, a, b, c, d, e));
											},
											taskE);
									},
									taskD);
							},
							taskC);
					},
					taskB);
			},
			taskA);
	});
var _elm_lang$core$Task$sequence = function (tasks) {
	var _p3 = tasks;
	if (_p3.ctor === '[]') {
		return _elm_lang$core$Task$succeed(
			{ctor: '[]'});
	} else {
		return A3(
			_elm_lang$core$Task$map2,
			F2(
				function (x, y) {
					return {ctor: '::', _0: x, _1: y};
				}),
			_p3._0,
			_elm_lang$core$Task$sequence(_p3._1));
	}
};
var _elm_lang$core$Task$onEffects = F3(
	function (router, commands, state) {
		return A2(
			_elm_lang$core$Task$map,
			function (_p4) {
				return {ctor: '_Tuple0'};
			},
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					_elm_lang$core$Task$spawnCmd(router),
					commands)));
	});
var _elm_lang$core$Task$init = _elm_lang$core$Task$succeed(
	{ctor: '_Tuple0'});
var _elm_lang$core$Task$onSelfMsg = F3(
	function (_p7, _p6, _p5) {
		return _elm_lang$core$Task$succeed(
			{ctor: '_Tuple0'});
	});
var _elm_lang$core$Task$command = _elm_lang$core$Native_Platform.leaf('Task');
var _elm_lang$core$Task$Perform = function (a) {
	return {ctor: 'Perform', _0: a};
};
var _elm_lang$core$Task$perform = F2(
	function (toMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(_elm_lang$core$Task$map, toMessage, task)));
	});
var _elm_lang$core$Task$attempt = F2(
	function (resultToMessage, task) {
		return _elm_lang$core$Task$command(
			_elm_lang$core$Task$Perform(
				A2(
					_elm_lang$core$Task$onError,
					function (_p8) {
						return _elm_lang$core$Task$succeed(
							resultToMessage(
								_elm_lang$core$Result$Err(_p8)));
					},
					A2(
						_elm_lang$core$Task$andThen,
						function (_p9) {
							return _elm_lang$core$Task$succeed(
								resultToMessage(
									_elm_lang$core$Result$Ok(_p9)));
						},
						task))));
	});
var _elm_lang$core$Task$cmdMap = F2(
	function (tagger, _p10) {
		var _p11 = _p10;
		return _elm_lang$core$Task$Perform(
			A2(_elm_lang$core$Task$map, tagger, _p11._0));
	});
_elm_lang$core$Native_Platform.effectManagers['Task'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Task$init, onEffects: _elm_lang$core$Task$onEffects, onSelfMsg: _elm_lang$core$Task$onSelfMsg, tag: 'cmd', cmdMap: _elm_lang$core$Task$cmdMap};

//import Native.Utils //

var _elm_lang$core$Native_Debug = function() {

function log(tag, value)
{
	var msg = tag + ': ' + _elm_lang$core$Native_Utils.toString(value);
	var process = process || {};
	if (process.stdout)
	{
		process.stdout.write(msg);
	}
	else
	{
		console.log(msg);
	}
	return value;
}

function crash(message)
{
	throw new Error(message);
}

return {
	crash: crash,
	log: F2(log)
};

}();
//import Maybe, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_String = function() {

function isEmpty(str)
{
	return str.length === 0;
}
function cons(chr, str)
{
	return chr + str;
}
function uncons(str)
{
	var hd = str[0];
	if (hd)
	{
		return _elm_lang$core$Maybe$Just(_elm_lang$core$Native_Utils.Tuple2(_elm_lang$core$Native_Utils.chr(hd), str.slice(1)));
	}
	return _elm_lang$core$Maybe$Nothing;
}
function append(a, b)
{
	return a + b;
}
function concat(strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join('');
}
function length(str)
{
	return str.length;
}
function map(f, str)
{
	var out = str.split('');
	for (var i = out.length; i--; )
	{
		out[i] = f(_elm_lang$core$Native_Utils.chr(out[i]));
	}
	return out.join('');
}
function filter(pred, str)
{
	return str.split('').map(_elm_lang$core$Native_Utils.chr).filter(pred).join('');
}
function reverse(str)
{
	return str.split('').reverse().join('');
}
function foldl(f, b, str)
{
	var len = str.length;
	for (var i = 0; i < len; ++i)
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function foldr(f, b, str)
{
	for (var i = str.length; i--; )
	{
		b = A2(f, _elm_lang$core$Native_Utils.chr(str[i]), b);
	}
	return b;
}
function split(sep, str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(sep));
}
function join(sep, strs)
{
	return _elm_lang$core$Native_List.toArray(strs).join(sep);
}
function repeat(n, str)
{
	var result = '';
	while (n > 0)
	{
		if (n & 1)
		{
			result += str;
		}
		n >>= 1, str += str;
	}
	return result;
}
function slice(start, end, str)
{
	return str.slice(start, end);
}
function left(n, str)
{
	return n < 1 ? '' : str.slice(0, n);
}
function right(n, str)
{
	return n < 1 ? '' : str.slice(-n);
}
function dropLeft(n, str)
{
	return n < 1 ? str : str.slice(n);
}
function dropRight(n, str)
{
	return n < 1 ? str : str.slice(0, -n);
}
function pad(n, chr, str)
{
	var half = (n - str.length) / 2;
	return repeat(Math.ceil(half), chr) + str + repeat(half | 0, chr);
}
function padRight(n, chr, str)
{
	return str + repeat(n - str.length, chr);
}
function padLeft(n, chr, str)
{
	return repeat(n - str.length, chr) + str;
}

function trim(str)
{
	return str.trim();
}
function trimLeft(str)
{
	return str.replace(/^\s+/, '');
}
function trimRight(str)
{
	return str.replace(/\s+$/, '');
}

function words(str)
{
	return _elm_lang$core$Native_List.fromArray(str.trim().split(/\s+/g));
}
function lines(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split(/\r\n|\r|\n/g));
}

function toUpper(str)
{
	return str.toUpperCase();
}
function toLower(str)
{
	return str.toLowerCase();
}

function any(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return true;
		}
	}
	return false;
}
function all(pred, str)
{
	for (var i = str.length; i--; )
	{
		if (!pred(_elm_lang$core$Native_Utils.chr(str[i])))
		{
			return false;
		}
	}
	return true;
}

function contains(sub, str)
{
	return str.indexOf(sub) > -1;
}
function startsWith(sub, str)
{
	return str.indexOf(sub) === 0;
}
function endsWith(sub, str)
{
	return str.length >= sub.length &&
		str.lastIndexOf(sub) === str.length - sub.length;
}
function indexes(sub, str)
{
	var subLen = sub.length;

	if (subLen < 1)
	{
		return _elm_lang$core$Native_List.Nil;
	}

	var i = 0;
	var is = [];

	while ((i = str.indexOf(sub, i)) > -1)
	{
		is.push(i);
		i = i + subLen;
	}

	return _elm_lang$core$Native_List.fromArray(is);
}


function toInt(s)
{
	var len = s.length;

	// if empty
	if (len === 0)
	{
		return intErr(s);
	}

	// if hex
	var c = s[0];
	if (c === '0' && s[1] === 'x')
	{
		for (var i = 2; i < len; ++i)
		{
			var c = s[i];
			if (('0' <= c && c <= '9') || ('A' <= c && c <= 'F') || ('a' <= c && c <= 'f'))
			{
				continue;
			}
			return intErr(s);
		}
		return _elm_lang$core$Result$Ok(parseInt(s, 16));
	}

	// is decimal
	if (c > '9' || (c < '0' && c !== '-' && c !== '+'))
	{
		return intErr(s);
	}
	for (var i = 1; i < len; ++i)
	{
		var c = s[i];
		if (c < '0' || '9' < c)
		{
			return intErr(s);
		}
	}

	return _elm_lang$core$Result$Ok(parseInt(s, 10));
}

function intErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to an Int");
}


function toFloat(s)
{
	// check if it is a hex, octal, or binary number
	if (s.length === 0 || /[\sxbo]/.test(s))
	{
		return floatErr(s);
	}
	var n = +s;
	// faster isNaN check
	return n === n ? _elm_lang$core$Result$Ok(n) : floatErr(s);
}

function floatErr(s)
{
	return _elm_lang$core$Result$Err("could not convert string '" + s + "' to a Float");
}


function toList(str)
{
	return _elm_lang$core$Native_List.fromArray(str.split('').map(_elm_lang$core$Native_Utils.chr));
}
function fromList(chars)
{
	return _elm_lang$core$Native_List.toArray(chars).join('');
}

return {
	isEmpty: isEmpty,
	cons: F2(cons),
	uncons: uncons,
	append: F2(append),
	concat: concat,
	length: length,
	map: F2(map),
	filter: F2(filter),
	reverse: reverse,
	foldl: F3(foldl),
	foldr: F3(foldr),

	split: F2(split),
	join: F2(join),
	repeat: F2(repeat),

	slice: F3(slice),
	left: F2(left),
	right: F2(right),
	dropLeft: F2(dropLeft),
	dropRight: F2(dropRight),

	pad: F3(pad),
	padLeft: F3(padLeft),
	padRight: F3(padRight),

	trim: trim,
	trimLeft: trimLeft,
	trimRight: trimRight,

	words: words,
	lines: lines,

	toUpper: toUpper,
	toLower: toLower,

	any: F2(any),
	all: F2(all),

	contains: F2(contains),
	startsWith: F2(startsWith),
	endsWith: F2(endsWith),
	indexes: F2(indexes),

	toInt: toInt,
	toFloat: toFloat,
	toList: toList,
	fromList: fromList
};

}();

var _elm_lang$core$String$fromList = _elm_lang$core$Native_String.fromList;
var _elm_lang$core$String$toList = _elm_lang$core$Native_String.toList;
var _elm_lang$core$String$toFloat = _elm_lang$core$Native_String.toFloat;
var _elm_lang$core$String$toInt = _elm_lang$core$Native_String.toInt;
var _elm_lang$core$String$indices = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$indexes = _elm_lang$core$Native_String.indexes;
var _elm_lang$core$String$endsWith = _elm_lang$core$Native_String.endsWith;
var _elm_lang$core$String$startsWith = _elm_lang$core$Native_String.startsWith;
var _elm_lang$core$String$contains = _elm_lang$core$Native_String.contains;
var _elm_lang$core$String$all = _elm_lang$core$Native_String.all;
var _elm_lang$core$String$any = _elm_lang$core$Native_String.any;
var _elm_lang$core$String$toLower = _elm_lang$core$Native_String.toLower;
var _elm_lang$core$String$toUpper = _elm_lang$core$Native_String.toUpper;
var _elm_lang$core$String$lines = _elm_lang$core$Native_String.lines;
var _elm_lang$core$String$words = _elm_lang$core$Native_String.words;
var _elm_lang$core$String$trimRight = _elm_lang$core$Native_String.trimRight;
var _elm_lang$core$String$trimLeft = _elm_lang$core$Native_String.trimLeft;
var _elm_lang$core$String$trim = _elm_lang$core$Native_String.trim;
var _elm_lang$core$String$padRight = _elm_lang$core$Native_String.padRight;
var _elm_lang$core$String$padLeft = _elm_lang$core$Native_String.padLeft;
var _elm_lang$core$String$pad = _elm_lang$core$Native_String.pad;
var _elm_lang$core$String$dropRight = _elm_lang$core$Native_String.dropRight;
var _elm_lang$core$String$dropLeft = _elm_lang$core$Native_String.dropLeft;
var _elm_lang$core$String$right = _elm_lang$core$Native_String.right;
var _elm_lang$core$String$left = _elm_lang$core$Native_String.left;
var _elm_lang$core$String$slice = _elm_lang$core$Native_String.slice;
var _elm_lang$core$String$repeat = _elm_lang$core$Native_String.repeat;
var _elm_lang$core$String$join = _elm_lang$core$Native_String.join;
var _elm_lang$core$String$split = _elm_lang$core$Native_String.split;
var _elm_lang$core$String$foldr = _elm_lang$core$Native_String.foldr;
var _elm_lang$core$String$foldl = _elm_lang$core$Native_String.foldl;
var _elm_lang$core$String$reverse = _elm_lang$core$Native_String.reverse;
var _elm_lang$core$String$filter = _elm_lang$core$Native_String.filter;
var _elm_lang$core$String$map = _elm_lang$core$Native_String.map;
var _elm_lang$core$String$length = _elm_lang$core$Native_String.length;
var _elm_lang$core$String$concat = _elm_lang$core$Native_String.concat;
var _elm_lang$core$String$append = _elm_lang$core$Native_String.append;
var _elm_lang$core$String$uncons = _elm_lang$core$Native_String.uncons;
var _elm_lang$core$String$cons = _elm_lang$core$Native_String.cons;
var _elm_lang$core$String$fromChar = function ($char) {
	return A2(_elm_lang$core$String$cons, $char, '');
};
var _elm_lang$core$String$isEmpty = _elm_lang$core$Native_String.isEmpty;

var _elm_lang$core$Dict$foldr = F3(
	function (f, acc, t) {
		foldr:
		while (true) {
			var _p0 = t;
			if (_p0.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v1 = f,
					_v2 = A3(
					f,
					_p0._1,
					_p0._2,
					A3(_elm_lang$core$Dict$foldr, f, acc, _p0._4)),
					_v3 = _p0._3;
				f = _v1;
				acc = _v2;
				t = _v3;
				continue foldr;
			}
		}
	});
var _elm_lang$core$Dict$keys = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, keyList) {
				return {ctor: '::', _0: key, _1: keyList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$values = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, valueList) {
				return {ctor: '::', _0: value, _1: valueList};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$toList = function (dict) {
	return A3(
		_elm_lang$core$Dict$foldr,
		F3(
			function (key, value, list) {
				return {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: key, _1: value},
					_1: list
				};
			}),
		{ctor: '[]'},
		dict);
};
var _elm_lang$core$Dict$foldl = F3(
	function (f, acc, dict) {
		foldl:
		while (true) {
			var _p1 = dict;
			if (_p1.ctor === 'RBEmpty_elm_builtin') {
				return acc;
			} else {
				var _v5 = f,
					_v6 = A3(
					f,
					_p1._1,
					_p1._2,
					A3(_elm_lang$core$Dict$foldl, f, acc, _p1._3)),
					_v7 = _p1._4;
				f = _v5;
				acc = _v6;
				dict = _v7;
				continue foldl;
			}
		}
	});
var _elm_lang$core$Dict$merge = F6(
	function (leftStep, bothStep, rightStep, leftDict, rightDict, initialResult) {
		var stepState = F3(
			function (rKey, rValue, _p2) {
				stepState:
				while (true) {
					var _p3 = _p2;
					var _p9 = _p3._1;
					var _p8 = _p3._0;
					var _p4 = _p8;
					if (_p4.ctor === '[]') {
						return {
							ctor: '_Tuple2',
							_0: _p8,
							_1: A3(rightStep, rKey, rValue, _p9)
						};
					} else {
						var _p7 = _p4._1;
						var _p6 = _p4._0._1;
						var _p5 = _p4._0._0;
						if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) < 0) {
							var _v10 = rKey,
								_v11 = rValue,
								_v12 = {
								ctor: '_Tuple2',
								_0: _p7,
								_1: A3(leftStep, _p5, _p6, _p9)
							};
							rKey = _v10;
							rValue = _v11;
							_p2 = _v12;
							continue stepState;
						} else {
							if (_elm_lang$core$Native_Utils.cmp(_p5, rKey) > 0) {
								return {
									ctor: '_Tuple2',
									_0: _p8,
									_1: A3(rightStep, rKey, rValue, _p9)
								};
							} else {
								return {
									ctor: '_Tuple2',
									_0: _p7,
									_1: A4(bothStep, _p5, _p6, rValue, _p9)
								};
							}
						}
					}
				}
			});
		var _p10 = A3(
			_elm_lang$core$Dict$foldl,
			stepState,
			{
				ctor: '_Tuple2',
				_0: _elm_lang$core$Dict$toList(leftDict),
				_1: initialResult
			},
			rightDict);
		var leftovers = _p10._0;
		var intermediateResult = _p10._1;
		return A3(
			_elm_lang$core$List$foldl,
			F2(
				function (_p11, result) {
					var _p12 = _p11;
					return A3(leftStep, _p12._0, _p12._1, result);
				}),
			intermediateResult,
			leftovers);
	});
var _elm_lang$core$Dict$reportRemBug = F4(
	function (msg, c, lgot, rgot) {
		return _elm_lang$core$Native_Debug.crash(
			_elm_lang$core$String$concat(
				{
					ctor: '::',
					_0: 'Internal red-black tree invariant violated, expected ',
					_1: {
						ctor: '::',
						_0: msg,
						_1: {
							ctor: '::',
							_0: ' and got ',
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Basics$toString(c),
								_1: {
									ctor: '::',
									_0: '/',
									_1: {
										ctor: '::',
										_0: lgot,
										_1: {
											ctor: '::',
											_0: '/',
											_1: {
												ctor: '::',
												_0: rgot,
												_1: {
													ctor: '::',
													_0: '\nPlease report this bug to <https://github.com/elm-lang/core/issues>',
													_1: {ctor: '[]'}
												}
											}
										}
									}
								}
							}
						}
					}
				}));
	});
var _elm_lang$core$Dict$isBBlack = function (dict) {
	var _p13 = dict;
	_v14_2:
	do {
		if (_p13.ctor === 'RBNode_elm_builtin') {
			if (_p13._0.ctor === 'BBlack') {
				return true;
			} else {
				break _v14_2;
			}
		} else {
			if (_p13._0.ctor === 'LBBlack') {
				return true;
			} else {
				break _v14_2;
			}
		}
	} while(false);
	return false;
};
var _elm_lang$core$Dict$sizeHelp = F2(
	function (n, dict) {
		sizeHelp:
		while (true) {
			var _p14 = dict;
			if (_p14.ctor === 'RBEmpty_elm_builtin') {
				return n;
			} else {
				var _v16 = A2(_elm_lang$core$Dict$sizeHelp, n + 1, _p14._4),
					_v17 = _p14._3;
				n = _v16;
				dict = _v17;
				continue sizeHelp;
			}
		}
	});
var _elm_lang$core$Dict$size = function (dict) {
	return A2(_elm_lang$core$Dict$sizeHelp, 0, dict);
};
var _elm_lang$core$Dict$get = F2(
	function (targetKey, dict) {
		get:
		while (true) {
			var _p15 = dict;
			if (_p15.ctor === 'RBEmpty_elm_builtin') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				var _p16 = A2(_elm_lang$core$Basics$compare, targetKey, _p15._1);
				switch (_p16.ctor) {
					case 'LT':
						var _v20 = targetKey,
							_v21 = _p15._3;
						targetKey = _v20;
						dict = _v21;
						continue get;
					case 'EQ':
						return _elm_lang$core$Maybe$Just(_p15._2);
					default:
						var _v22 = targetKey,
							_v23 = _p15._4;
						targetKey = _v22;
						dict = _v23;
						continue get;
				}
			}
		}
	});
var _elm_lang$core$Dict$member = F2(
	function (key, dict) {
		var _p17 = A2(_elm_lang$core$Dict$get, key, dict);
		if (_p17.ctor === 'Just') {
			return true;
		} else {
			return false;
		}
	});
var _elm_lang$core$Dict$maxWithDefault = F3(
	function (k, v, r) {
		maxWithDefault:
		while (true) {
			var _p18 = r;
			if (_p18.ctor === 'RBEmpty_elm_builtin') {
				return {ctor: '_Tuple2', _0: k, _1: v};
			} else {
				var _v26 = _p18._1,
					_v27 = _p18._2,
					_v28 = _p18._4;
				k = _v26;
				v = _v27;
				r = _v28;
				continue maxWithDefault;
			}
		}
	});
var _elm_lang$core$Dict$NBlack = {ctor: 'NBlack'};
var _elm_lang$core$Dict$BBlack = {ctor: 'BBlack'};
var _elm_lang$core$Dict$Black = {ctor: 'Black'};
var _elm_lang$core$Dict$blackish = function (t) {
	var _p19 = t;
	if (_p19.ctor === 'RBNode_elm_builtin') {
		var _p20 = _p19._0;
		return _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$Black) || _elm_lang$core$Native_Utils.eq(_p20, _elm_lang$core$Dict$BBlack);
	} else {
		return true;
	}
};
var _elm_lang$core$Dict$Red = {ctor: 'Red'};
var _elm_lang$core$Dict$moreBlack = function (color) {
	var _p21 = color;
	switch (_p21.ctor) {
		case 'Black':
			return _elm_lang$core$Dict$BBlack;
		case 'Red':
			return _elm_lang$core$Dict$Black;
		case 'NBlack':
			return _elm_lang$core$Dict$Red;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a double black node more black!');
	}
};
var _elm_lang$core$Dict$lessBlack = function (color) {
	var _p22 = color;
	switch (_p22.ctor) {
		case 'BBlack':
			return _elm_lang$core$Dict$Black;
		case 'Black':
			return _elm_lang$core$Dict$Red;
		case 'Red':
			return _elm_lang$core$Dict$NBlack;
		default:
			return _elm_lang$core$Native_Debug.crash('Can\'t make a negative black node less black!');
	}
};
var _elm_lang$core$Dict$LBBlack = {ctor: 'LBBlack'};
var _elm_lang$core$Dict$LBlack = {ctor: 'LBlack'};
var _elm_lang$core$Dict$RBEmpty_elm_builtin = function (a) {
	return {ctor: 'RBEmpty_elm_builtin', _0: a};
};
var _elm_lang$core$Dict$empty = _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
var _elm_lang$core$Dict$isEmpty = function (dict) {
	return _elm_lang$core$Native_Utils.eq(dict, _elm_lang$core$Dict$empty);
};
var _elm_lang$core$Dict$RBNode_elm_builtin = F5(
	function (a, b, c, d, e) {
		return {ctor: 'RBNode_elm_builtin', _0: a, _1: b, _2: c, _3: d, _4: e};
	});
var _elm_lang$core$Dict$ensureBlackRoot = function (dict) {
	var _p23 = dict;
	if ((_p23.ctor === 'RBNode_elm_builtin') && (_p23._0.ctor === 'Red')) {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p23._1, _p23._2, _p23._3, _p23._4);
	} else {
		return dict;
	}
};
var _elm_lang$core$Dict$lessBlackTree = function (dict) {
	var _p24 = dict;
	if (_p24.ctor === 'RBNode_elm_builtin') {
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$lessBlack(_p24._0),
			_p24._1,
			_p24._2,
			_p24._3,
			_p24._4);
	} else {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	}
};
var _elm_lang$core$Dict$balancedTree = function (col) {
	return function (xk) {
		return function (xv) {
			return function (yk) {
				return function (yv) {
					return function (zk) {
						return function (zv) {
							return function (a) {
								return function (b) {
									return function (c) {
										return function (d) {
											return A5(
												_elm_lang$core$Dict$RBNode_elm_builtin,
												_elm_lang$core$Dict$lessBlack(col),
												yk,
												yv,
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, xk, xv, a, b),
												A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, zk, zv, c, d));
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$core$Dict$blacken = function (t) {
	var _p25 = t;
	if (_p25.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p25._1, _p25._2, _p25._3, _p25._4);
	}
};
var _elm_lang$core$Dict$redden = function (t) {
	var _p26 = t;
	if (_p26.ctor === 'RBEmpty_elm_builtin') {
		return _elm_lang$core$Native_Debug.crash('can\'t make a Leaf red');
	} else {
		return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, _p26._1, _p26._2, _p26._3, _p26._4);
	}
};
var _elm_lang$core$Dict$balanceHelp = function (tree) {
	var _p27 = tree;
	_v36_6:
	do {
		_v36_5:
		do {
			_v36_4:
			do {
				_v36_3:
				do {
					_v36_2:
					do {
						_v36_1:
						do {
							_v36_0:
							do {
								if (_p27.ctor === 'RBNode_elm_builtin') {
									if (_p27._3.ctor === 'RBNode_elm_builtin') {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._3._0.ctor) {
												case 'Red':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																		break _v36_2;
																	} else {
																		if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																			break _v36_3;
																		} else {
																			break _v36_6;
																		}
																	}
																}
															}
														case 'NBlack':
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																		break _v36_4;
																	} else {
																		break _v36_6;
																	}
																}
															}
														default:
															if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
																break _v36_0;
															} else {
																if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
																	break _v36_1;
																} else {
																	break _v36_6;
																}
															}
													}
												case 'NBlack':
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															}
														case 'NBlack':
															if (_p27._0.ctor === 'BBlack') {
																if ((((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																	break _v36_4;
																} else {
																	if ((((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																		break _v36_5;
																	} else {
																		break _v36_6;
																	}
																}
															} else {
																break _v36_6;
															}
														default:
															if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
																break _v36_5;
															} else {
																break _v36_6;
															}
													}
												default:
													switch (_p27._4._0.ctor) {
														case 'Red':
															if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
																break _v36_2;
															} else {
																if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
																	break _v36_3;
																} else {
																	break _v36_6;
																}
															}
														case 'NBlack':
															if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
																break _v36_4;
															} else {
																break _v36_6;
															}
														default:
															break _v36_6;
													}
											}
										} else {
											switch (_p27._3._0.ctor) {
												case 'Red':
													if ((_p27._3._3.ctor === 'RBNode_elm_builtin') && (_p27._3._3._0.ctor === 'Red')) {
														break _v36_0;
													} else {
														if ((_p27._3._4.ctor === 'RBNode_elm_builtin') && (_p27._3._4._0.ctor === 'Red')) {
															break _v36_1;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._3._3.ctor === 'RBNode_elm_builtin')) && (_p27._3._3._0.ctor === 'Black')) && (_p27._3._4.ctor === 'RBNode_elm_builtin')) && (_p27._3._4._0.ctor === 'Black')) {
														break _v36_5;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										}
									} else {
										if (_p27._4.ctor === 'RBNode_elm_builtin') {
											switch (_p27._4._0.ctor) {
												case 'Red':
													if ((_p27._4._3.ctor === 'RBNode_elm_builtin') && (_p27._4._3._0.ctor === 'Red')) {
														break _v36_2;
													} else {
														if ((_p27._4._4.ctor === 'RBNode_elm_builtin') && (_p27._4._4._0.ctor === 'Red')) {
															break _v36_3;
														} else {
															break _v36_6;
														}
													}
												case 'NBlack':
													if (((((_p27._0.ctor === 'BBlack') && (_p27._4._3.ctor === 'RBNode_elm_builtin')) && (_p27._4._3._0.ctor === 'Black')) && (_p27._4._4.ctor === 'RBNode_elm_builtin')) && (_p27._4._4._0.ctor === 'Black')) {
														break _v36_4;
													} else {
														break _v36_6;
													}
												default:
													break _v36_6;
											}
										} else {
											break _v36_6;
										}
									}
								} else {
									break _v36_6;
								}
							} while(false);
							return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._3._1)(_p27._3._3._2)(_p27._3._1)(_p27._3._2)(_p27._1)(_p27._2)(_p27._3._3._3)(_p27._3._3._4)(_p27._3._4)(_p27._4);
						} while(false);
						return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._3._1)(_p27._3._2)(_p27._3._4._1)(_p27._3._4._2)(_p27._1)(_p27._2)(_p27._3._3)(_p27._3._4._3)(_p27._3._4._4)(_p27._4);
					} while(false);
					return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._3._1)(_p27._4._3._2)(_p27._4._1)(_p27._4._2)(_p27._3)(_p27._4._3._3)(_p27._4._3._4)(_p27._4._4);
				} while(false);
				return _elm_lang$core$Dict$balancedTree(_p27._0)(_p27._1)(_p27._2)(_p27._4._1)(_p27._4._2)(_p27._4._4._1)(_p27._4._4._2)(_p27._3)(_p27._4._3)(_p27._4._4._3)(_p27._4._4._4);
			} while(false);
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_elm_lang$core$Dict$Black,
				_p27._4._3._1,
				_p27._4._3._2,
				A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3, _p27._4._3._3),
				A5(
					_elm_lang$core$Dict$balance,
					_elm_lang$core$Dict$Black,
					_p27._4._1,
					_p27._4._2,
					_p27._4._3._4,
					_elm_lang$core$Dict$redden(_p27._4._4)));
		} while(false);
		return A5(
			_elm_lang$core$Dict$RBNode_elm_builtin,
			_elm_lang$core$Dict$Black,
			_p27._3._4._1,
			_p27._3._4._2,
			A5(
				_elm_lang$core$Dict$balance,
				_elm_lang$core$Dict$Black,
				_p27._3._1,
				_p27._3._2,
				_elm_lang$core$Dict$redden(_p27._3._3),
				_p27._3._4._3),
			A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p27._1, _p27._2, _p27._3._4._4, _p27._4));
	} while(false);
	return tree;
};
var _elm_lang$core$Dict$balance = F5(
	function (c, k, v, l, r) {
		var tree = A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
		return _elm_lang$core$Dict$blackish(tree) ? _elm_lang$core$Dict$balanceHelp(tree) : tree;
	});
var _elm_lang$core$Dict$bubble = F5(
	function (c, k, v, l, r) {
		return (_elm_lang$core$Dict$isBBlack(l) || _elm_lang$core$Dict$isBBlack(r)) ? A5(
			_elm_lang$core$Dict$balance,
			_elm_lang$core$Dict$moreBlack(c),
			k,
			v,
			_elm_lang$core$Dict$lessBlackTree(l),
			_elm_lang$core$Dict$lessBlackTree(r)) : A5(_elm_lang$core$Dict$RBNode_elm_builtin, c, k, v, l, r);
	});
var _elm_lang$core$Dict$removeMax = F5(
	function (c, k, v, l, r) {
		var _p28 = r;
		if (_p28.ctor === 'RBEmpty_elm_builtin') {
			return A3(_elm_lang$core$Dict$rem, c, l, r);
		} else {
			return A5(
				_elm_lang$core$Dict$bubble,
				c,
				k,
				v,
				l,
				A5(_elm_lang$core$Dict$removeMax, _p28._0, _p28._1, _p28._2, _p28._3, _p28._4));
		}
	});
var _elm_lang$core$Dict$rem = F3(
	function (color, left, right) {
		var _p29 = {ctor: '_Tuple2', _0: left, _1: right};
		if (_p29._0.ctor === 'RBEmpty_elm_builtin') {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p30 = color;
				switch (_p30.ctor) {
					case 'Red':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
					case 'Black':
						return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBBlack);
					default:
						return _elm_lang$core$Native_Debug.crash('cannot have bblack or nblack nodes at this point');
				}
			} else {
				var _p33 = _p29._1._0;
				var _p32 = _p29._0._0;
				var _p31 = {ctor: '_Tuple3', _0: color, _1: _p32, _2: _p33};
				if ((((_p31.ctor === '_Tuple3') && (_p31._0.ctor === 'Black')) && (_p31._1.ctor === 'LBlack')) && (_p31._2.ctor === 'Red')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._1._1, _p29._1._2, _p29._1._3, _p29._1._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/LBlack/Red',
						color,
						_elm_lang$core$Basics$toString(_p32),
						_elm_lang$core$Basics$toString(_p33));
				}
			}
		} else {
			if (_p29._1.ctor === 'RBEmpty_elm_builtin') {
				var _p36 = _p29._1._0;
				var _p35 = _p29._0._0;
				var _p34 = {ctor: '_Tuple3', _0: color, _1: _p35, _2: _p36};
				if ((((_p34.ctor === '_Tuple3') && (_p34._0.ctor === 'Black')) && (_p34._1.ctor === 'Red')) && (_p34._2.ctor === 'LBlack')) {
					return A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Black, _p29._0._1, _p29._0._2, _p29._0._3, _p29._0._4);
				} else {
					return A4(
						_elm_lang$core$Dict$reportRemBug,
						'Black/Red/LBlack',
						color,
						_elm_lang$core$Basics$toString(_p35),
						_elm_lang$core$Basics$toString(_p36));
				}
			} else {
				var _p40 = _p29._0._2;
				var _p39 = _p29._0._4;
				var _p38 = _p29._0._1;
				var newLeft = A5(_elm_lang$core$Dict$removeMax, _p29._0._0, _p38, _p40, _p29._0._3, _p39);
				var _p37 = A3(_elm_lang$core$Dict$maxWithDefault, _p38, _p40, _p39);
				var k = _p37._0;
				var v = _p37._1;
				return A5(_elm_lang$core$Dict$bubble, color, k, v, newLeft, right);
			}
		}
	});
var _elm_lang$core$Dict$map = F2(
	function (f, dict) {
		var _p41 = dict;
		if (_p41.ctor === 'RBEmpty_elm_builtin') {
			return _elm_lang$core$Dict$RBEmpty_elm_builtin(_elm_lang$core$Dict$LBlack);
		} else {
			var _p42 = _p41._1;
			return A5(
				_elm_lang$core$Dict$RBNode_elm_builtin,
				_p41._0,
				_p42,
				A2(f, _p42, _p41._2),
				A2(_elm_lang$core$Dict$map, f, _p41._3),
				A2(_elm_lang$core$Dict$map, f, _p41._4));
		}
	});
var _elm_lang$core$Dict$Same = {ctor: 'Same'};
var _elm_lang$core$Dict$Remove = {ctor: 'Remove'};
var _elm_lang$core$Dict$Insert = {ctor: 'Insert'};
var _elm_lang$core$Dict$update = F3(
	function (k, alter, dict) {
		var up = function (dict) {
			var _p43 = dict;
			if (_p43.ctor === 'RBEmpty_elm_builtin') {
				var _p44 = alter(_elm_lang$core$Maybe$Nothing);
				if (_p44.ctor === 'Nothing') {
					return {ctor: '_Tuple2', _0: _elm_lang$core$Dict$Same, _1: _elm_lang$core$Dict$empty};
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Dict$Insert,
						_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _elm_lang$core$Dict$Red, k, _p44._0, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty)
					};
				}
			} else {
				var _p55 = _p43._2;
				var _p54 = _p43._4;
				var _p53 = _p43._3;
				var _p52 = _p43._1;
				var _p51 = _p43._0;
				var _p45 = A2(_elm_lang$core$Basics$compare, k, _p52);
				switch (_p45.ctor) {
					case 'EQ':
						var _p46 = alter(
							_elm_lang$core$Maybe$Just(_p55));
						if (_p46.ctor === 'Nothing') {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Remove,
								_1: A3(_elm_lang$core$Dict$rem, _p51, _p53, _p54)
							};
						} else {
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Dict$Same,
								_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p46._0, _p53, _p54)
							};
						}
					case 'LT':
						var _p47 = up(_p53);
						var flag = _p47._0;
						var newLeft = _p47._1;
						var _p48 = flag;
						switch (_p48.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, newLeft, _p54)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, newLeft, _p54)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, newLeft, _p54)
								};
						}
					default:
						var _p49 = up(_p54);
						var flag = _p49._0;
						var newRight = _p49._1;
						var _p50 = flag;
						switch (_p50.ctor) {
							case 'Same':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Same,
									_1: A5(_elm_lang$core$Dict$RBNode_elm_builtin, _p51, _p52, _p55, _p53, newRight)
								};
							case 'Insert':
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Insert,
									_1: A5(_elm_lang$core$Dict$balance, _p51, _p52, _p55, _p53, newRight)
								};
							default:
								return {
									ctor: '_Tuple2',
									_0: _elm_lang$core$Dict$Remove,
									_1: A5(_elm_lang$core$Dict$bubble, _p51, _p52, _p55, _p53, newRight)
								};
						}
				}
			}
		};
		var _p56 = up(dict);
		var flag = _p56._0;
		var updatedDict = _p56._1;
		var _p57 = flag;
		switch (_p57.ctor) {
			case 'Same':
				return updatedDict;
			case 'Insert':
				return _elm_lang$core$Dict$ensureBlackRoot(updatedDict);
			default:
				return _elm_lang$core$Dict$blacken(updatedDict);
		}
	});
var _elm_lang$core$Dict$insert = F3(
	function (key, value, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(
				_elm_lang$core$Maybe$Just(value)),
			dict);
	});
var _elm_lang$core$Dict$singleton = F2(
	function (key, value) {
		return A3(_elm_lang$core$Dict$insert, key, value, _elm_lang$core$Dict$empty);
	});
var _elm_lang$core$Dict$union = F2(
	function (t1, t2) {
		return A3(_elm_lang$core$Dict$foldl, _elm_lang$core$Dict$insert, t2, t1);
	});
var _elm_lang$core$Dict$filter = F2(
	function (predicate, dictionary) {
		var add = F3(
			function (key, value, dict) {
				return A2(predicate, key, value) ? A3(_elm_lang$core$Dict$insert, key, value, dict) : dict;
			});
		return A3(_elm_lang$core$Dict$foldl, add, _elm_lang$core$Dict$empty, dictionary);
	});
var _elm_lang$core$Dict$intersect = F2(
	function (t1, t2) {
		return A2(
			_elm_lang$core$Dict$filter,
			F2(
				function (k, _p58) {
					return A2(_elm_lang$core$Dict$member, k, t2);
				}),
			t1);
	});
var _elm_lang$core$Dict$partition = F2(
	function (predicate, dict) {
		var add = F3(
			function (key, value, _p59) {
				var _p60 = _p59;
				var _p62 = _p60._1;
				var _p61 = _p60._0;
				return A2(predicate, key, value) ? {
					ctor: '_Tuple2',
					_0: A3(_elm_lang$core$Dict$insert, key, value, _p61),
					_1: _p62
				} : {
					ctor: '_Tuple2',
					_0: _p61,
					_1: A3(_elm_lang$core$Dict$insert, key, value, _p62)
				};
			});
		return A3(
			_elm_lang$core$Dict$foldl,
			add,
			{ctor: '_Tuple2', _0: _elm_lang$core$Dict$empty, _1: _elm_lang$core$Dict$empty},
			dict);
	});
var _elm_lang$core$Dict$fromList = function (assocs) {
	return A3(
		_elm_lang$core$List$foldl,
		F2(
			function (_p63, dict) {
				var _p64 = _p63;
				return A3(_elm_lang$core$Dict$insert, _p64._0, _p64._1, dict);
			}),
		_elm_lang$core$Dict$empty,
		assocs);
};
var _elm_lang$core$Dict$remove = F2(
	function (key, dict) {
		return A3(
			_elm_lang$core$Dict$update,
			key,
			_elm_lang$core$Basics$always(_elm_lang$core$Maybe$Nothing),
			dict);
	});
var _elm_lang$core$Dict$diff = F2(
	function (t1, t2) {
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, v, t) {
					return A2(_elm_lang$core$Dict$remove, k, t);
				}),
			t1,
			t2);
	});

//import Native.Scheduler //

var _elm_lang$core$Native_Time = function() {

var now = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	callback(_elm_lang$core$Native_Scheduler.succeed(Date.now()));
});

function setInterval_(interval, task)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var id = setInterval(function() {
			_elm_lang$core$Native_Scheduler.rawSpawn(task);
		}, interval);

		return function() { clearInterval(id); };
	});
}

return {
	now: now,
	setInterval_: F2(setInterval_)
};

}();
var _elm_lang$core$Time$setInterval = _elm_lang$core$Native_Time.setInterval_;
var _elm_lang$core$Time$spawnHelp = F3(
	function (router, intervals, processes) {
		var _p0 = intervals;
		if (_p0.ctor === '[]') {
			return _elm_lang$core$Task$succeed(processes);
		} else {
			var _p1 = _p0._0;
			var spawnRest = function (id) {
				return A3(
					_elm_lang$core$Time$spawnHelp,
					router,
					_p0._1,
					A3(_elm_lang$core$Dict$insert, _p1, id, processes));
			};
			var spawnTimer = _elm_lang$core$Native_Scheduler.spawn(
				A2(
					_elm_lang$core$Time$setInterval,
					_p1,
					A2(_elm_lang$core$Platform$sendToSelf, router, _p1)));
			return A2(_elm_lang$core$Task$andThen, spawnRest, spawnTimer);
		}
	});
var _elm_lang$core$Time$addMySub = F2(
	function (_p2, state) {
		var _p3 = _p2;
		var _p6 = _p3._1;
		var _p5 = _p3._0;
		var _p4 = A2(_elm_lang$core$Dict$get, _p5, state);
		if (_p4.ctor === 'Nothing') {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{
					ctor: '::',
					_0: _p6,
					_1: {ctor: '[]'}
				},
				state);
		} else {
			return A3(
				_elm_lang$core$Dict$insert,
				_p5,
				{ctor: '::', _0: _p6, _1: _p4._0},
				state);
		}
	});
var _elm_lang$core$Time$inMilliseconds = function (t) {
	return t;
};
var _elm_lang$core$Time$millisecond = 1;
var _elm_lang$core$Time$second = 1000 * _elm_lang$core$Time$millisecond;
var _elm_lang$core$Time$minute = 60 * _elm_lang$core$Time$second;
var _elm_lang$core$Time$hour = 60 * _elm_lang$core$Time$minute;
var _elm_lang$core$Time$inHours = function (t) {
	return t / _elm_lang$core$Time$hour;
};
var _elm_lang$core$Time$inMinutes = function (t) {
	return t / _elm_lang$core$Time$minute;
};
var _elm_lang$core$Time$inSeconds = function (t) {
	return t / _elm_lang$core$Time$second;
};
var _elm_lang$core$Time$now = _elm_lang$core$Native_Time.now;
var _elm_lang$core$Time$onSelfMsg = F3(
	function (router, interval, state) {
		var _p7 = A2(_elm_lang$core$Dict$get, interval, state.taggers);
		if (_p7.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var tellTaggers = function (time) {
				return _elm_lang$core$Task$sequence(
					A2(
						_elm_lang$core$List$map,
						function (tagger) {
							return A2(
								_elm_lang$core$Platform$sendToApp,
								router,
								tagger(time));
						},
						_p7._0));
			};
			return A2(
				_elm_lang$core$Task$andThen,
				function (_p8) {
					return _elm_lang$core$Task$succeed(state);
				},
				A2(_elm_lang$core$Task$andThen, tellTaggers, _elm_lang$core$Time$now));
		}
	});
var _elm_lang$core$Time$subscription = _elm_lang$core$Native_Platform.leaf('Time');
var _elm_lang$core$Time$State = F2(
	function (a, b) {
		return {taggers: a, processes: b};
	});
var _elm_lang$core$Time$init = _elm_lang$core$Task$succeed(
	A2(_elm_lang$core$Time$State, _elm_lang$core$Dict$empty, _elm_lang$core$Dict$empty));
var _elm_lang$core$Time$onEffects = F3(
	function (router, subs, _p9) {
		var _p10 = _p9;
		var rightStep = F3(
			function (_p12, id, _p11) {
				var _p13 = _p11;
				return {
					ctor: '_Tuple3',
					_0: _p13._0,
					_1: _p13._1,
					_2: A2(
						_elm_lang$core$Task$andThen,
						function (_p14) {
							return _p13._2;
						},
						_elm_lang$core$Native_Scheduler.kill(id))
				};
			});
		var bothStep = F4(
			function (interval, taggers, id, _p15) {
				var _p16 = _p15;
				return {
					ctor: '_Tuple3',
					_0: _p16._0,
					_1: A3(_elm_lang$core$Dict$insert, interval, id, _p16._1),
					_2: _p16._2
				};
			});
		var leftStep = F3(
			function (interval, taggers, _p17) {
				var _p18 = _p17;
				return {
					ctor: '_Tuple3',
					_0: {ctor: '::', _0: interval, _1: _p18._0},
					_1: _p18._1,
					_2: _p18._2
				};
			});
		var newTaggers = A3(_elm_lang$core$List$foldl, _elm_lang$core$Time$addMySub, _elm_lang$core$Dict$empty, subs);
		var _p19 = A6(
			_elm_lang$core$Dict$merge,
			leftStep,
			bothStep,
			rightStep,
			newTaggers,
			_p10.processes,
			{
				ctor: '_Tuple3',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Dict$empty,
				_2: _elm_lang$core$Task$succeed(
					{ctor: '_Tuple0'})
			});
		var spawnList = _p19._0;
		var existingDict = _p19._1;
		var killTask = _p19._2;
		return A2(
			_elm_lang$core$Task$andThen,
			function (newProcesses) {
				return _elm_lang$core$Task$succeed(
					A2(_elm_lang$core$Time$State, newTaggers, newProcesses));
			},
			A2(
				_elm_lang$core$Task$andThen,
				function (_p20) {
					return A3(_elm_lang$core$Time$spawnHelp, router, spawnList, existingDict);
				},
				killTask));
	});
var _elm_lang$core$Time$Every = F2(
	function (a, b) {
		return {ctor: 'Every', _0: a, _1: b};
	});
var _elm_lang$core$Time$every = F2(
	function (interval, tagger) {
		return _elm_lang$core$Time$subscription(
			A2(_elm_lang$core$Time$Every, interval, tagger));
	});
var _elm_lang$core$Time$subMap = F2(
	function (f, _p21) {
		var _p22 = _p21;
		return A2(
			_elm_lang$core$Time$Every,
			_p22._0,
			function (_p23) {
				return f(
					_p22._1(_p23));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Time'] = {pkg: 'elm-lang/core', init: _elm_lang$core$Time$init, onEffects: _elm_lang$core$Time$onEffects, onSelfMsg: _elm_lang$core$Time$onSelfMsg, tag: 'sub', subMap: _elm_lang$core$Time$subMap};

var _elm_lang$core$Debug$crash = _elm_lang$core$Native_Debug.crash;
var _elm_lang$core$Debug$log = _elm_lang$core$Native_Debug.log;

//import Maybe, Native.Array, Native.List, Native.Utils, Result //

var _elm_lang$core$Native_Json = function() {


// CORE DECODERS

function succeed(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'succeed',
		msg: msg
	};
}

function fail(msg)
{
	return {
		ctor: '<decoder>',
		tag: 'fail',
		msg: msg
	};
}

function decodePrimitive(tag)
{
	return {
		ctor: '<decoder>',
		tag: tag
	};
}

function decodeContainer(tag, decoder)
{
	return {
		ctor: '<decoder>',
		tag: tag,
		decoder: decoder
	};
}

function decodeNull(value)
{
	return {
		ctor: '<decoder>',
		tag: 'null',
		value: value
	};
}

function decodeField(field, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'field',
		field: field,
		decoder: decoder
	};
}

function decodeIndex(index, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'index',
		index: index,
		decoder: decoder
	};
}

function decodeKeyValuePairs(decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'key-value',
		decoder: decoder
	};
}

function mapMany(f, decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'map-many',
		func: f,
		decoders: decoders
	};
}

function andThen(callback, decoder)
{
	return {
		ctor: '<decoder>',
		tag: 'andThen',
		decoder: decoder,
		callback: callback
	};
}

function oneOf(decoders)
{
	return {
		ctor: '<decoder>',
		tag: 'oneOf',
		decoders: decoders
	};
}


// DECODING OBJECTS

function map1(f, d1)
{
	return mapMany(f, [d1]);
}

function map2(f, d1, d2)
{
	return mapMany(f, [d1, d2]);
}

function map3(f, d1, d2, d3)
{
	return mapMany(f, [d1, d2, d3]);
}

function map4(f, d1, d2, d3, d4)
{
	return mapMany(f, [d1, d2, d3, d4]);
}

function map5(f, d1, d2, d3, d4, d5)
{
	return mapMany(f, [d1, d2, d3, d4, d5]);
}

function map6(f, d1, d2, d3, d4, d5, d6)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6]);
}

function map7(f, d1, d2, d3, d4, d5, d6, d7)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7]);
}

function map8(f, d1, d2, d3, d4, d5, d6, d7, d8)
{
	return mapMany(f, [d1, d2, d3, d4, d5, d6, d7, d8]);
}


// DECODE HELPERS

function ok(value)
{
	return { tag: 'ok', value: value };
}

function badPrimitive(type, value)
{
	return { tag: 'primitive', type: type, value: value };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badField(field, nestedProblems)
{
	return { tag: 'field', field: field, rest: nestedProblems };
}

function badIndex(index, nestedProblems)
{
	return { tag: 'index', index: index, rest: nestedProblems };
}

function badOneOf(problems)
{
	return { tag: 'oneOf', problems: problems };
}

function bad(msg)
{
	return { tag: 'fail', msg: msg };
}

function badToString(problem)
{
	var context = '_';
	while (problem)
	{
		switch (problem.tag)
		{
			case 'primitive':
				return 'Expecting ' + problem.type
					+ (context === '_' ? '' : ' at ' + context)
					+ ' but instead got: ' + jsToString(problem.value);

			case 'index':
				context += '[' + problem.index + ']';
				problem = problem.rest;
				break;

			case 'field':
				context += '.' + problem.field;
				problem = problem.rest;
				break;

			case 'oneOf':
				var problems = problem.problems;
				for (var i = 0; i < problems.length; i++)
				{
					problems[i] = badToString(problems[i]);
				}
				return 'I ran into the following problems'
					+ (context === '_' ? '' : ' at ' + context)
					+ ':\n\n' + problems.join('\n');

			case 'fail':
				return 'I ran into a `fail` decoder'
					+ (context === '_' ? '' : ' at ' + context)
					+ ': ' + problem.msg;
		}
	}
}

function jsToString(value)
{
	return value === undefined
		? 'undefined'
		: JSON.stringify(value);
}


// DECODE

function runOnString(decoder, string)
{
	var json;
	try
	{
		json = JSON.parse(string);
	}
	catch (e)
	{
		return _elm_lang$core$Result$Err('Given an invalid JSON: ' + e.message);
	}
	return run(decoder, json);
}

function run(decoder, value)
{
	var result = runHelp(decoder, value);
	return (result.tag === 'ok')
		? _elm_lang$core$Result$Ok(result.value)
		: _elm_lang$core$Result$Err(badToString(result));
}

function runHelp(decoder, value)
{
	switch (decoder.tag)
	{
		case 'bool':
			return (typeof value === 'boolean')
				? ok(value)
				: badPrimitive('a Bool', value);

		case 'int':
			if (typeof value !== 'number') {
				return badPrimitive('an Int', value);
			}

			if (-2147483647 < value && value < 2147483647 && (value | 0) === value) {
				return ok(value);
			}

			if (isFinite(value) && !(value % 1)) {
				return ok(value);
			}

			return badPrimitive('an Int', value);

		case 'float':
			return (typeof value === 'number')
				? ok(value)
				: badPrimitive('a Float', value);

		case 'string':
			return (typeof value === 'string')
				? ok(value)
				: (value instanceof String)
					? ok(value + '')
					: badPrimitive('a String', value);

		case 'null':
			return (value === null)
				? ok(decoder.value)
				: badPrimitive('null', value);

		case 'value':
			return ok(value);

		case 'list':
			if (!(value instanceof Array))
			{
				return badPrimitive('a List', value);
			}

			var list = _elm_lang$core$Native_List.Nil;
			for (var i = value.length; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result)
				}
				list = _elm_lang$core$Native_List.Cons(result.value, list);
			}
			return ok(list);

		case 'array':
			if (!(value instanceof Array))
			{
				return badPrimitive('an Array', value);
			}

			var len = value.length;
			var array = new Array(len);
			for (var i = len; i--; )
			{
				var result = runHelp(decoder.decoder, value[i]);
				if (result.tag !== 'ok')
				{
					return badIndex(i, result);
				}
				array[i] = result.value;
			}
			return ok(_elm_lang$core$Native_Array.fromJSArray(array));

		case 'maybe':
			var result = runHelp(decoder.decoder, value);
			return (result.tag === 'ok')
				? ok(_elm_lang$core$Maybe$Just(result.value))
				: ok(_elm_lang$core$Maybe$Nothing);

		case 'field':
			var field = decoder.field;
			if (typeof value !== 'object' || value === null || !(field in value))
			{
				return badPrimitive('an object with a field named `' + field + '`', value);
			}

			var result = runHelp(decoder.decoder, value[field]);
			return (result.tag === 'ok') ? result : badField(field, result);

		case 'index':
			var index = decoder.index;
			if (!(value instanceof Array))
			{
				return badPrimitive('an array', value);
			}
			if (index >= value.length)
			{
				return badPrimitive('a longer array. Need index ' + index + ' but there are only ' + value.length + ' entries', value);
			}

			var result = runHelp(decoder.decoder, value[index]);
			return (result.tag === 'ok') ? result : badIndex(index, result);

		case 'key-value':
			if (typeof value !== 'object' || value === null || value instanceof Array)
			{
				return badPrimitive('an object', value);
			}

			var keyValuePairs = _elm_lang$core$Native_List.Nil;
			for (var key in value)
			{
				var result = runHelp(decoder.decoder, value[key]);
				if (result.tag !== 'ok')
				{
					return badField(key, result);
				}
				var pair = _elm_lang$core$Native_Utils.Tuple2(key, result.value);
				keyValuePairs = _elm_lang$core$Native_List.Cons(pair, keyValuePairs);
			}
			return ok(keyValuePairs);

		case 'map-many':
			var answer = decoder.func;
			var decoders = decoder.decoders;
			for (var i = 0; i < decoders.length; i++)
			{
				var result = runHelp(decoders[i], value);
				if (result.tag !== 'ok')
				{
					return result;
				}
				answer = answer(result.value);
			}
			return ok(answer);

		case 'andThen':
			var result = runHelp(decoder.decoder, value);
			return (result.tag !== 'ok')
				? result
				: runHelp(decoder.callback(result.value), value);

		case 'oneOf':
			var errors = [];
			var temp = decoder.decoders;
			while (temp.ctor !== '[]')
			{
				var result = runHelp(temp._0, value);

				if (result.tag === 'ok')
				{
					return result;
				}

				errors.push(result);

				temp = temp._1;
			}
			return badOneOf(errors);

		case 'fail':
			return bad(decoder.msg);

		case 'succeed':
			return ok(decoder.msg);
	}
}


// EQUALITY

function equality(a, b)
{
	if (a === b)
	{
		return true;
	}

	if (a.tag !== b.tag)
	{
		return false;
	}

	switch (a.tag)
	{
		case 'succeed':
		case 'fail':
			return a.msg === b.msg;

		case 'bool':
		case 'int':
		case 'float':
		case 'string':
		case 'value':
			return true;

		case 'null':
			return a.value === b.value;

		case 'list':
		case 'array':
		case 'maybe':
		case 'key-value':
			return equality(a.decoder, b.decoder);

		case 'field':
			return a.field === b.field && equality(a.decoder, b.decoder);

		case 'index':
			return a.index === b.index && equality(a.decoder, b.decoder);

		case 'map-many':
			if (a.func !== b.func)
			{
				return false;
			}
			return listEquality(a.decoders, b.decoders);

		case 'andThen':
			return a.callback === b.callback && equality(a.decoder, b.decoder);

		case 'oneOf':
			return listEquality(a.decoders, b.decoders);
	}
}

function listEquality(aDecoders, bDecoders)
{
	var len = aDecoders.length;
	if (len !== bDecoders.length)
	{
		return false;
	}
	for (var i = 0; i < len; i++)
	{
		if (!equality(aDecoders[i], bDecoders[i]))
		{
			return false;
		}
	}
	return true;
}


// ENCODE

function encode(indentLevel, value)
{
	return JSON.stringify(value, null, indentLevel);
}

function identity(value)
{
	return value;
}

function encodeObject(keyValuePairs)
{
	var obj = {};
	while (keyValuePairs.ctor !== '[]')
	{
		var pair = keyValuePairs._0;
		obj[pair._0] = pair._1;
		keyValuePairs = keyValuePairs._1;
	}
	return obj;
}

return {
	encode: F2(encode),
	runOnString: F2(runOnString),
	run: F2(run),

	decodeNull: decodeNull,
	decodePrimitive: decodePrimitive,
	decodeContainer: F2(decodeContainer),

	decodeField: F2(decodeField),
	decodeIndex: F2(decodeIndex),

	map1: F2(map1),
	map2: F3(map2),
	map3: F4(map3),
	map4: F5(map4),
	map5: F6(map5),
	map6: F7(map6),
	map7: F8(map7),
	map8: F9(map8),
	decodeKeyValuePairs: decodeKeyValuePairs,

	andThen: F2(andThen),
	fail: fail,
	succeed: succeed,
	oneOf: oneOf,

	identity: identity,
	encodeNull: null,
	encodeArray: _elm_lang$core$Native_Array.toJSArray,
	encodeList: _elm_lang$core$Native_List.toArray,
	encodeObject: encodeObject,

	equality: equality
};

}();

var _elm_lang$core$Json_Encode$list = _elm_lang$core$Native_Json.encodeList;
var _elm_lang$core$Json_Encode$array = _elm_lang$core$Native_Json.encodeArray;
var _elm_lang$core$Json_Encode$object = _elm_lang$core$Native_Json.encodeObject;
var _elm_lang$core$Json_Encode$null = _elm_lang$core$Native_Json.encodeNull;
var _elm_lang$core$Json_Encode$bool = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$float = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$int = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$string = _elm_lang$core$Native_Json.identity;
var _elm_lang$core$Json_Encode$encode = _elm_lang$core$Native_Json.encode;
var _elm_lang$core$Json_Encode$Value = {ctor: 'Value'};

var _elm_lang$core$Json_Decode$null = _elm_lang$core$Native_Json.decodeNull;
var _elm_lang$core$Json_Decode$value = _elm_lang$core$Native_Json.decodePrimitive('value');
var _elm_lang$core$Json_Decode$andThen = _elm_lang$core$Native_Json.andThen;
var _elm_lang$core$Json_Decode$fail = _elm_lang$core$Native_Json.fail;
var _elm_lang$core$Json_Decode$succeed = _elm_lang$core$Native_Json.succeed;
var _elm_lang$core$Json_Decode$lazy = function (thunk) {
	return A2(
		_elm_lang$core$Json_Decode$andThen,
		thunk,
		_elm_lang$core$Json_Decode$succeed(
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Json_Decode$decodeValue = _elm_lang$core$Native_Json.run;
var _elm_lang$core$Json_Decode$decodeString = _elm_lang$core$Native_Json.runOnString;
var _elm_lang$core$Json_Decode$map8 = _elm_lang$core$Native_Json.map8;
var _elm_lang$core$Json_Decode$map7 = _elm_lang$core$Native_Json.map7;
var _elm_lang$core$Json_Decode$map6 = _elm_lang$core$Native_Json.map6;
var _elm_lang$core$Json_Decode$map5 = _elm_lang$core$Native_Json.map5;
var _elm_lang$core$Json_Decode$map4 = _elm_lang$core$Native_Json.map4;
var _elm_lang$core$Json_Decode$map3 = _elm_lang$core$Native_Json.map3;
var _elm_lang$core$Json_Decode$map2 = _elm_lang$core$Native_Json.map2;
var _elm_lang$core$Json_Decode$map = _elm_lang$core$Native_Json.map1;
var _elm_lang$core$Json_Decode$oneOf = _elm_lang$core$Native_Json.oneOf;
var _elm_lang$core$Json_Decode$maybe = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'maybe', decoder);
};
var _elm_lang$core$Json_Decode$index = _elm_lang$core$Native_Json.decodeIndex;
var _elm_lang$core$Json_Decode$field = _elm_lang$core$Native_Json.decodeField;
var _elm_lang$core$Json_Decode$at = F2(
	function (fields, decoder) {
		return A3(_elm_lang$core$List$foldr, _elm_lang$core$Json_Decode$field, decoder, fields);
	});
var _elm_lang$core$Json_Decode$keyValuePairs = _elm_lang$core$Native_Json.decodeKeyValuePairs;
var _elm_lang$core$Json_Decode$dict = function (decoder) {
	return A2(
		_elm_lang$core$Json_Decode$map,
		_elm_lang$core$Dict$fromList,
		_elm_lang$core$Json_Decode$keyValuePairs(decoder));
};
var _elm_lang$core$Json_Decode$array = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'array', decoder);
};
var _elm_lang$core$Json_Decode$list = function (decoder) {
	return A2(_elm_lang$core$Native_Json.decodeContainer, 'list', decoder);
};
var _elm_lang$core$Json_Decode$nullable = function (decoder) {
	return _elm_lang$core$Json_Decode$oneOf(
		{
			ctor: '::',
			_0: _elm_lang$core$Json_Decode$null(_elm_lang$core$Maybe$Nothing),
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$core$Json_Decode$map, _elm_lang$core$Maybe$Just, decoder),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$core$Json_Decode$float = _elm_lang$core$Native_Json.decodePrimitive('float');
var _elm_lang$core$Json_Decode$int = _elm_lang$core$Native_Json.decodePrimitive('int');
var _elm_lang$core$Json_Decode$bool = _elm_lang$core$Native_Json.decodePrimitive('bool');
var _elm_lang$core$Json_Decode$string = _elm_lang$core$Native_Json.decodePrimitive('string');
var _elm_lang$core$Json_Decode$Decoder = {ctor: 'Decoder'};

//import Maybe, Native.List //

var _elm_lang$core$Native_Regex = function() {

function escape(str)
{
	return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}
function caseInsensitive(re)
{
	return new RegExp(re.source, 'gi');
}
function regex(raw)
{
	return new RegExp(raw, 'g');
}

function contains(re, string)
{
	return string.match(re) !== null;
}

function find(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var out = [];
	var number = 0;
	var string = str;
	var lastIndex = re.lastIndex;
	var prevLastIndex = -1;
	var result;
	while (number++ < n && (result = re.exec(string)))
	{
		if (prevLastIndex === re.lastIndex) break;
		var i = result.length - 1;
		var subs = new Array(i);
		while (i > 0)
		{
			var submatch = result[i];
			subs[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		out.push({
			match: result[0],
			submatches: _elm_lang$core$Native_List.fromArray(subs),
			index: result.index,
			number: number
		});
		prevLastIndex = re.lastIndex;
	}
	re.lastIndex = lastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

function replace(n, re, replacer, string)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	var count = 0;
	function jsReplacer(match)
	{
		if (count++ >= n)
		{
			return match;
		}
		var i = arguments.length - 3;
		var submatches = new Array(i);
		while (i > 0)
		{
			var submatch = arguments[i];
			submatches[--i] = submatch === undefined
				? _elm_lang$core$Maybe$Nothing
				: _elm_lang$core$Maybe$Just(submatch);
		}
		return replacer({
			match: match,
			submatches: _elm_lang$core$Native_List.fromArray(submatches),
			index: arguments[arguments.length - 2],
			number: count
		});
	}
	return string.replace(re, jsReplacer);
}

function split(n, re, str)
{
	n = n.ctor === 'All' ? Infinity : n._0;
	if (n === Infinity)
	{
		return _elm_lang$core$Native_List.fromArray(str.split(re));
	}
	var string = str;
	var result;
	var out = [];
	var start = re.lastIndex;
	var restoreLastIndex = re.lastIndex;
	while (n--)
	{
		if (!(result = re.exec(string))) break;
		out.push(string.slice(start, result.index));
		start = re.lastIndex;
	}
	out.push(string.slice(start));
	re.lastIndex = restoreLastIndex;
	return _elm_lang$core$Native_List.fromArray(out);
}

return {
	regex: regex,
	caseInsensitive: caseInsensitive,
	escape: escape,

	contains: F2(contains),
	find: F3(find),
	replace: F4(replace),
	split: F3(split)
};

}();

var _elm_lang$core$Process$kill = _elm_lang$core$Native_Scheduler.kill;
var _elm_lang$core$Process$sleep = _elm_lang$core$Native_Scheduler.sleep;
var _elm_lang$core$Process$spawn = _elm_lang$core$Native_Scheduler.spawn;

var _elm_lang$core$Tuple$mapSecond = F2(
	function (func, _p0) {
		var _p1 = _p0;
		return {
			ctor: '_Tuple2',
			_0: _p1._0,
			_1: func(_p1._1)
		};
	});
var _elm_lang$core$Tuple$mapFirst = F2(
	function (func, _p2) {
		var _p3 = _p2;
		return {
			ctor: '_Tuple2',
			_0: func(_p3._0),
			_1: _p3._1
		};
	});
var _elm_lang$core$Tuple$second = function (_p4) {
	var _p5 = _p4;
	return _p5._1;
};
var _elm_lang$core$Tuple$first = function (_p6) {
	var _p7 = _p6;
	return _p7._0;
};

var _elm_lang$core$Regex$split = _elm_lang$core$Native_Regex.split;
var _elm_lang$core$Regex$replace = _elm_lang$core$Native_Regex.replace;
var _elm_lang$core$Regex$find = _elm_lang$core$Native_Regex.find;
var _elm_lang$core$Regex$contains = _elm_lang$core$Native_Regex.contains;
var _elm_lang$core$Regex$caseInsensitive = _elm_lang$core$Native_Regex.caseInsensitive;
var _elm_lang$core$Regex$regex = _elm_lang$core$Native_Regex.regex;
var _elm_lang$core$Regex$escape = _elm_lang$core$Native_Regex.escape;
var _elm_lang$core$Regex$Match = F4(
	function (a, b, c, d) {
		return {match: a, submatches: b, index: c, number: d};
	});
var _elm_lang$core$Regex$Regex = {ctor: 'Regex'};
var _elm_lang$core$Regex$AtMost = function (a) {
	return {ctor: 'AtMost', _0: a};
};
var _elm_lang$core$Regex$All = {ctor: 'All'};

var _elm_lang$core$Set$foldr = F3(
	function (f, b, _p0) {
		var _p1 = _p0;
		return A3(
			_elm_lang$core$Dict$foldr,
			F3(
				function (k, _p2, b) {
					return A2(f, k, b);
				}),
			b,
			_p1._0);
	});
var _elm_lang$core$Set$foldl = F3(
	function (f, b, _p3) {
		var _p4 = _p3;
		return A3(
			_elm_lang$core$Dict$foldl,
			F3(
				function (k, _p5, b) {
					return A2(f, k, b);
				}),
			b,
			_p4._0);
	});
var _elm_lang$core$Set$toList = function (_p6) {
	var _p7 = _p6;
	return _elm_lang$core$Dict$keys(_p7._0);
};
var _elm_lang$core$Set$size = function (_p8) {
	var _p9 = _p8;
	return _elm_lang$core$Dict$size(_p9._0);
};
var _elm_lang$core$Set$member = F2(
	function (k, _p10) {
		var _p11 = _p10;
		return A2(_elm_lang$core$Dict$member, k, _p11._0);
	});
var _elm_lang$core$Set$isEmpty = function (_p12) {
	var _p13 = _p12;
	return _elm_lang$core$Dict$isEmpty(_p13._0);
};
var _elm_lang$core$Set$Set_elm_builtin = function (a) {
	return {ctor: 'Set_elm_builtin', _0: a};
};
var _elm_lang$core$Set$empty = _elm_lang$core$Set$Set_elm_builtin(_elm_lang$core$Dict$empty);
var _elm_lang$core$Set$singleton = function (k) {
	return _elm_lang$core$Set$Set_elm_builtin(
		A2(
			_elm_lang$core$Dict$singleton,
			k,
			{ctor: '_Tuple0'}));
};
var _elm_lang$core$Set$insert = F2(
	function (k, _p14) {
		var _p15 = _p14;
		return _elm_lang$core$Set$Set_elm_builtin(
			A3(
				_elm_lang$core$Dict$insert,
				k,
				{ctor: '_Tuple0'},
				_p15._0));
	});
var _elm_lang$core$Set$fromList = function (xs) {
	return A3(_elm_lang$core$List$foldl, _elm_lang$core$Set$insert, _elm_lang$core$Set$empty, xs);
};
var _elm_lang$core$Set$map = F2(
	function (f, s) {
		return _elm_lang$core$Set$fromList(
			A2(
				_elm_lang$core$List$map,
				f,
				_elm_lang$core$Set$toList(s)));
	});
var _elm_lang$core$Set$remove = F2(
	function (k, _p16) {
		var _p17 = _p16;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$remove, k, _p17._0));
	});
var _elm_lang$core$Set$union = F2(
	function (_p19, _p18) {
		var _p20 = _p19;
		var _p21 = _p18;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$union, _p20._0, _p21._0));
	});
var _elm_lang$core$Set$intersect = F2(
	function (_p23, _p22) {
		var _p24 = _p23;
		var _p25 = _p22;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$intersect, _p24._0, _p25._0));
	});
var _elm_lang$core$Set$diff = F2(
	function (_p27, _p26) {
		var _p28 = _p27;
		var _p29 = _p26;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(_elm_lang$core$Dict$diff, _p28._0, _p29._0));
	});
var _elm_lang$core$Set$filter = F2(
	function (p, _p30) {
		var _p31 = _p30;
		return _elm_lang$core$Set$Set_elm_builtin(
			A2(
				_elm_lang$core$Dict$filter,
				F2(
					function (k, _p32) {
						return p(k);
					}),
				_p31._0));
	});
var _elm_lang$core$Set$partition = F2(
	function (p, _p33) {
		var _p34 = _p33;
		var _p35 = A2(
			_elm_lang$core$Dict$partition,
			F2(
				function (k, _p36) {
					return p(k);
				}),
			_p34._0);
		var p1 = _p35._0;
		var p2 = _p35._1;
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Set$Set_elm_builtin(p1),
			_1: _elm_lang$core$Set$Set_elm_builtin(p2)
		};
	});

var _elm_lang$dom$Native_Dom = function() {

var fakeNode = {
	addEventListener: function() {},
	removeEventListener: function() {}
};

var onDocument = on(typeof document !== 'undefined' ? document : fakeNode);
var onWindow = on(typeof window !== 'undefined' ? window : fakeNode);

function on(node)
{
	return function(eventName, decoder, toTask)
	{
		return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback) {

			function performTask(event)
			{
				var result = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, event);
				if (result.ctor === 'Ok')
				{
					_elm_lang$core$Native_Scheduler.rawSpawn(toTask(result._0));
				}
			}

			node.addEventListener(eventName, performTask);

			return function()
			{
				node.removeEventListener(eventName, performTask);
			};
		});
	};
}

var rAF = typeof requestAnimationFrame !== 'undefined'
	? requestAnimationFrame
	: function(callback) { callback(); };

function withNode(id, doStuff)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		rAF(function()
		{
			var node = document.getElementById(id);
			if (node === null)
			{
				callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NotFound', _0: id }));
				return;
			}
			callback(_elm_lang$core$Native_Scheduler.succeed(doStuff(node)));
		});
	});
}


// FOCUS

function focus(id)
{
	return withNode(id, function(node) {
		node.focus();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function blur(id)
{
	return withNode(id, function(node) {
		node.blur();
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SCROLLING

function getScrollTop(id)
{
	return withNode(id, function(node) {
		return node.scrollTop;
	});
}

function setScrollTop(id, desiredScrollTop)
{
	return withNode(id, function(node) {
		node.scrollTop = desiredScrollTop;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toBottom(id)
{
	return withNode(id, function(node) {
		node.scrollTop = node.scrollHeight;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function getScrollLeft(id)
{
	return withNode(id, function(node) {
		return node.scrollLeft;
	});
}

function setScrollLeft(id, desiredScrollLeft)
{
	return withNode(id, function(node) {
		node.scrollLeft = desiredScrollLeft;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}

function toRight(id)
{
	return withNode(id, function(node) {
		node.scrollLeft = node.scrollWidth;
		return _elm_lang$core$Native_Utils.Tuple0;
	});
}


// SIZE

function width(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollWidth;
			case 'VisibleContent':
				return node.clientWidth;
			case 'VisibleContentWithBorders':
				return node.offsetWidth;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.right - rect.left;
		}
	});
}

function height(options, id)
{
	return withNode(id, function(node) {
		switch (options.ctor)
		{
			case 'Content':
				return node.scrollHeight;
			case 'VisibleContent':
				return node.clientHeight;
			case 'VisibleContentWithBorders':
				return node.offsetHeight;
			case 'VisibleContentWithBordersAndMargins':
				var rect = node.getBoundingClientRect();
				return rect.bottom - rect.top;
		}
	});
}

return {
	onDocument: F3(onDocument),
	onWindow: F3(onWindow),

	focus: focus,
	blur: blur,

	getScrollTop: getScrollTop,
	setScrollTop: F2(setScrollTop),
	getScrollLeft: getScrollLeft,
	setScrollLeft: F2(setScrollLeft),
	toBottom: toBottom,
	toRight: toRight,

	height: F2(height),
	width: F2(width)
};

}();

var _elm_lang$dom$Dom_LowLevel$onWindow = _elm_lang$dom$Native_Dom.onWindow;
var _elm_lang$dom$Dom_LowLevel$onDocument = _elm_lang$dom$Native_Dom.onDocument;

var _elm_lang$virtual_dom$VirtualDom_Debug$wrap;
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags;

var _elm_lang$virtual_dom$Native_VirtualDom = function() {

var STYLE_KEY = 'STYLE';
var EVENT_KEY = 'EVENT';
var ATTR_KEY = 'ATTR';
var ATTR_NS_KEY = 'ATTR_NS';

var localDoc = typeof document !== 'undefined' ? document : {};


////////////  VIRTUAL DOM NODES  ////////////


function text(string)
{
	return {
		type: 'text',
		text: string
	};
}


function node(tag)
{
	return F2(function(factList, kidList) {
		return nodeHelp(tag, factList, kidList);
	});
}


function nodeHelp(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function keyedNode(tag, factList, kidList)
{
	var organized = organizeFacts(factList);
	var namespace = organized.namespace;
	var facts = organized.facts;

	var children = [];
	var descendantsCount = 0;
	while (kidList.ctor !== '[]')
	{
		var kid = kidList._0;
		descendantsCount += (kid._1.descendantsCount || 0);
		children.push(kid);
		kidList = kidList._1;
	}
	descendantsCount += children.length;

	return {
		type: 'keyed-node',
		tag: tag,
		facts: facts,
		children: children,
		namespace: namespace,
		descendantsCount: descendantsCount
	};
}


function custom(factList, model, impl)
{
	var facts = organizeFacts(factList).facts;

	return {
		type: 'custom',
		facts: facts,
		model: model,
		impl: impl
	};
}


function map(tagger, node)
{
	return {
		type: 'tagger',
		tagger: tagger,
		node: node,
		descendantsCount: 1 + (node.descendantsCount || 0)
	};
}


function thunk(func, args, thunk)
{
	return {
		type: 'thunk',
		func: func,
		args: args,
		thunk: thunk,
		node: undefined
	};
}

function lazy(fn, a)
{
	return thunk(fn, [a], function() {
		return fn(a);
	});
}

function lazy2(fn, a, b)
{
	return thunk(fn, [a,b], function() {
		return A2(fn, a, b);
	});
}

function lazy3(fn, a, b, c)
{
	return thunk(fn, [a,b,c], function() {
		return A3(fn, a, b, c);
	});
}



// FACTS


function organizeFacts(factList)
{
	var namespace, facts = {};

	while (factList.ctor !== '[]')
	{
		var entry = factList._0;
		var key = entry.key;

		if (key === ATTR_KEY || key === ATTR_NS_KEY || key === EVENT_KEY)
		{
			var subFacts = facts[key] || {};
			subFacts[entry.realKey] = entry.value;
			facts[key] = subFacts;
		}
		else if (key === STYLE_KEY)
		{
			var styles = facts[key] || {};
			var styleList = entry.value;
			while (styleList.ctor !== '[]')
			{
				var style = styleList._0;
				styles[style._0] = style._1;
				styleList = styleList._1;
			}
			facts[key] = styles;
		}
		else if (key === 'namespace')
		{
			namespace = entry.value;
		}
		else if (key === 'className')
		{
			var classes = facts[key];
			facts[key] = typeof classes === 'undefined'
				? entry.value
				: classes + ' ' + entry.value;
		}
 		else
		{
			facts[key] = entry.value;
		}
		factList = factList._1;
	}

	return {
		facts: facts,
		namespace: namespace
	};
}



////////////  PROPERTIES AND ATTRIBUTES  ////////////


function style(value)
{
	return {
		key: STYLE_KEY,
		value: value
	};
}


function property(key, value)
{
	return {
		key: key,
		value: value
	};
}


function attribute(key, value)
{
	return {
		key: ATTR_KEY,
		realKey: key,
		value: value
	};
}


function attributeNS(namespace, key, value)
{
	return {
		key: ATTR_NS_KEY,
		realKey: key,
		value: {
			value: value,
			namespace: namespace
		}
	};
}


function on(name, options, decoder)
{
	return {
		key: EVENT_KEY,
		realKey: name,
		value: {
			options: options,
			decoder: decoder
		}
	};
}


function equalEvents(a, b)
{
	if (a.options !== b.options)
	{
		if (a.options.stopPropagation !== b.options.stopPropagation || a.options.preventDefault !== b.options.preventDefault)
		{
			return false;
		}
	}
	return _elm_lang$core$Native_Json.equality(a.decoder, b.decoder);
}


function mapProperty(func, property)
{
	if (property.key !== EVENT_KEY)
	{
		return property;
	}
	return on(
		property.realKey,
		property.value.options,
		A2(_elm_lang$core$Json_Decode$map, func, property.value.decoder)
	);
}


////////////  RENDER  ////////////


function render(vNode, eventNode)
{
	switch (vNode.type)
	{
		case 'thunk':
			if (!vNode.node)
			{
				vNode.node = vNode.thunk();
			}
			return render(vNode.node, eventNode);

		case 'tagger':
			var subNode = vNode.node;
			var tagger = vNode.tagger;

			while (subNode.type === 'tagger')
			{
				typeof tagger !== 'object'
					? tagger = [tagger, subNode.tagger]
					: tagger.push(subNode.tagger);

				subNode = subNode.node;
			}

			var subEventRoot = { tagger: tagger, parent: eventNode };
			var domNode = render(subNode, subEventRoot);
			domNode.elm_event_node_ref = subEventRoot;
			return domNode;

		case 'text':
			return localDoc.createTextNode(vNode.text);

		case 'node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i], eventNode));
			}

			return domNode;

		case 'keyed-node':
			var domNode = vNode.namespace
				? localDoc.createElementNS(vNode.namespace, vNode.tag)
				: localDoc.createElement(vNode.tag);

			applyFacts(domNode, eventNode, vNode.facts);

			var children = vNode.children;

			for (var i = 0; i < children.length; i++)
			{
				domNode.appendChild(render(children[i]._1, eventNode));
			}

			return domNode;

		case 'custom':
			var domNode = vNode.impl.render(vNode.model);
			applyFacts(domNode, eventNode, vNode.facts);
			return domNode;
	}
}



////////////  APPLY FACTS  ////////////


function applyFacts(domNode, eventNode, facts)
{
	for (var key in facts)
	{
		var value = facts[key];

		switch (key)
		{
			case STYLE_KEY:
				applyStyles(domNode, value);
				break;

			case EVENT_KEY:
				applyEvents(domNode, eventNode, value);
				break;

			case ATTR_KEY:
				applyAttrs(domNode, value);
				break;

			case ATTR_NS_KEY:
				applyAttrsNS(domNode, value);
				break;

			case 'value':
				if (domNode[key] !== value)
				{
					domNode[key] = value;
				}
				break;

			default:
				domNode[key] = value;
				break;
		}
	}
}

function applyStyles(domNode, styles)
{
	var domNodeStyle = domNode.style;

	for (var key in styles)
	{
		domNodeStyle[key] = styles[key];
	}
}

function applyEvents(domNode, eventNode, events)
{
	var allHandlers = domNode.elm_handlers || {};

	for (var key in events)
	{
		var handler = allHandlers[key];
		var value = events[key];

		if (typeof value === 'undefined')
		{
			domNode.removeEventListener(key, handler);
			allHandlers[key] = undefined;
		}
		else if (typeof handler === 'undefined')
		{
			var handler = makeEventHandler(eventNode, value);
			domNode.addEventListener(key, handler);
			allHandlers[key] = handler;
		}
		else
		{
			handler.info = value;
		}
	}

	domNode.elm_handlers = allHandlers;
}

function makeEventHandler(eventNode, info)
{
	function eventHandler(event)
	{
		var info = eventHandler.info;

		var value = A2(_elm_lang$core$Native_Json.run, info.decoder, event);

		if (value.ctor === 'Ok')
		{
			var options = info.options;
			if (options.stopPropagation)
			{
				event.stopPropagation();
			}
			if (options.preventDefault)
			{
				event.preventDefault();
			}

			var message = value._0;

			var currentEventNode = eventNode;
			while (currentEventNode)
			{
				var tagger = currentEventNode.tagger;
				if (typeof tagger === 'function')
				{
					message = tagger(message);
				}
				else
				{
					for (var i = tagger.length; i--; )
					{
						message = tagger[i](message);
					}
				}
				currentEventNode = currentEventNode.parent;
			}
		}
	};

	eventHandler.info = info;

	return eventHandler;
}

function applyAttrs(domNode, attrs)
{
	for (var key in attrs)
	{
		var value = attrs[key];
		if (typeof value === 'undefined')
		{
			domNode.removeAttribute(key);
		}
		else
		{
			domNode.setAttribute(key, value);
		}
	}
}

function applyAttrsNS(domNode, nsAttrs)
{
	for (var key in nsAttrs)
	{
		var pair = nsAttrs[key];
		var namespace = pair.namespace;
		var value = pair.value;

		if (typeof value === 'undefined')
		{
			domNode.removeAttributeNS(namespace, key);
		}
		else
		{
			domNode.setAttributeNS(namespace, key, value);
		}
	}
}



////////////  DIFF  ////////////


function diff(a, b)
{
	var patches = [];
	diffHelp(a, b, patches, 0);
	return patches;
}


function makePatch(type, index, data)
{
	return {
		index: index,
		type: type,
		data: data,
		domNode: undefined,
		eventNode: undefined
	};
}


function diffHelp(a, b, patches, index)
{
	if (a === b)
	{
		return;
	}

	var aType = a.type;
	var bType = b.type;

	// Bail if you run into different types of nodes. Implies that the
	// structure has changed significantly and it's not worth a diff.
	if (aType !== bType)
	{
		patches.push(makePatch('p-redraw', index, b));
		return;
	}

	// Now we know that both nodes are the same type.
	switch (bType)
	{
		case 'thunk':
			var aArgs = a.args;
			var bArgs = b.args;
			var i = aArgs.length;
			var same = a.func === b.func && i === bArgs.length;
			while (same && i--)
			{
				same = aArgs[i] === bArgs[i];
			}
			if (same)
			{
				b.node = a.node;
				return;
			}
			b.node = b.thunk();
			var subPatches = [];
			diffHelp(a.node, b.node, subPatches, 0);
			if (subPatches.length > 0)
			{
				patches.push(makePatch('p-thunk', index, subPatches));
			}
			return;

		case 'tagger':
			// gather nested taggers
			var aTaggers = a.tagger;
			var bTaggers = b.tagger;
			var nesting = false;

			var aSubNode = a.node;
			while (aSubNode.type === 'tagger')
			{
				nesting = true;

				typeof aTaggers !== 'object'
					? aTaggers = [aTaggers, aSubNode.tagger]
					: aTaggers.push(aSubNode.tagger);

				aSubNode = aSubNode.node;
			}

			var bSubNode = b.node;
			while (bSubNode.type === 'tagger')
			{
				nesting = true;

				typeof bTaggers !== 'object'
					? bTaggers = [bTaggers, bSubNode.tagger]
					: bTaggers.push(bSubNode.tagger);

				bSubNode = bSubNode.node;
			}

			// Just bail if different numbers of taggers. This implies the
			// structure of the virtual DOM has changed.
			if (nesting && aTaggers.length !== bTaggers.length)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			// check if taggers are "the same"
			if (nesting ? !pairwiseRefEqual(aTaggers, bTaggers) : aTaggers !== bTaggers)
			{
				patches.push(makePatch('p-tagger', index, bTaggers));
			}

			// diff everything below the taggers
			diffHelp(aSubNode, bSubNode, patches, index + 1);
			return;

		case 'text':
			if (a.text !== b.text)
			{
				patches.push(makePatch('p-text', index, b.text));
				return;
			}

			return;

		case 'node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffChildren(a, b, patches, index);
			return;

		case 'keyed-node':
			// Bail if obvious indicators have changed. Implies more serious
			// structural changes such that it's not worth it to diff.
			if (a.tag !== b.tag || a.namespace !== b.namespace)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);

			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			diffKeyedChildren(a, b, patches, index);
			return;

		case 'custom':
			if (a.impl !== b.impl)
			{
				patches.push(makePatch('p-redraw', index, b));
				return;
			}

			var factsDiff = diffFacts(a.facts, b.facts);
			if (typeof factsDiff !== 'undefined')
			{
				patches.push(makePatch('p-facts', index, factsDiff));
			}

			var patch = b.impl.diff(a,b);
			if (patch)
			{
				patches.push(makePatch('p-custom', index, patch));
				return;
			}

			return;
	}
}


// assumes the incoming arrays are the same length
function pairwiseRefEqual(as, bs)
{
	for (var i = 0; i < as.length; i++)
	{
		if (as[i] !== bs[i])
		{
			return false;
		}
	}

	return true;
}


// TODO Instead of creating a new diff object, it's possible to just test if
// there *is* a diff. During the actual patch, do the diff again and make the
// modifications directly. This way, there's no new allocations. Worth it?
function diffFacts(a, b, category)
{
	var diff;

	// look for changes and removals
	for (var aKey in a)
	{
		if (aKey === STYLE_KEY || aKey === EVENT_KEY || aKey === ATTR_KEY || aKey === ATTR_NS_KEY)
		{
			var subDiff = diffFacts(a[aKey], b[aKey] || {}, aKey);
			if (subDiff)
			{
				diff = diff || {};
				diff[aKey] = subDiff;
			}
			continue;
		}

		// remove if not in the new facts
		if (!(aKey in b))
		{
			diff = diff || {};
			diff[aKey] =
				(typeof category === 'undefined')
					? (typeof a[aKey] === 'string' ? '' : null)
					:
				(category === STYLE_KEY)
					? ''
					:
				(category === EVENT_KEY || category === ATTR_KEY)
					? undefined
					:
				{ namespace: a[aKey].namespace, value: undefined };

			continue;
		}

		var aValue = a[aKey];
		var bValue = b[aKey];

		// reference equal, so don't worry about it
		if (aValue === bValue && aKey !== 'value'
			|| category === EVENT_KEY && equalEvents(aValue, bValue))
		{
			continue;
		}

		diff = diff || {};
		diff[aKey] = bValue;
	}

	// add new stuff
	for (var bKey in b)
	{
		if (!(bKey in a))
		{
			diff = diff || {};
			diff[bKey] = b[bKey];
		}
	}

	return diff;
}


function diffChildren(aParent, bParent, patches, rootIndex)
{
	var aChildren = aParent.children;
	var bChildren = bParent.children;

	var aLen = aChildren.length;
	var bLen = bChildren.length;

	// FIGURE OUT IF THERE ARE INSERTS OR REMOVALS

	if (aLen > bLen)
	{
		patches.push(makePatch('p-remove-last', rootIndex, aLen - bLen));
	}
	else if (aLen < bLen)
	{
		patches.push(makePatch('p-append', rootIndex, bChildren.slice(aLen)));
	}

	// PAIRWISE DIFF EVERYTHING ELSE

	var index = rootIndex;
	var minLen = aLen < bLen ? aLen : bLen;
	for (var i = 0; i < minLen; i++)
	{
		index++;
		var aChild = aChildren[i];
		diffHelp(aChild, bChildren[i], patches, index);
		index += aChild.descendantsCount || 0;
	}
}



////////////  KEYED DIFF  ////////////


function diffKeyedChildren(aParent, bParent, patches, rootIndex)
{
	var localPatches = [];

	var changes = {}; // Dict String Entry
	var inserts = []; // Array { index : Int, entry : Entry }
	// type Entry = { tag : String, vnode : VNode, index : Int, data : _ }

	var aChildren = aParent.children;
	var bChildren = bParent.children;
	var aLen = aChildren.length;
	var bLen = bChildren.length;
	var aIndex = 0;
	var bIndex = 0;

	var index = rootIndex;

	while (aIndex < aLen && bIndex < bLen)
	{
		var a = aChildren[aIndex];
		var b = bChildren[bIndex];

		var aKey = a._0;
		var bKey = b._0;
		var aNode = a._1;
		var bNode = b._1;

		// check if keys match

		if (aKey === bKey)
		{
			index++;
			diffHelp(aNode, bNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex++;
			bIndex++;
			continue;
		}

		// look ahead 1 to detect insertions and removals.

		var aLookAhead = aIndex + 1 < aLen;
		var bLookAhead = bIndex + 1 < bLen;

		if (aLookAhead)
		{
			var aNext = aChildren[aIndex + 1];
			var aNextKey = aNext._0;
			var aNextNode = aNext._1;
			var oldMatch = bKey === aNextKey;
		}

		if (bLookAhead)
		{
			var bNext = bChildren[bIndex + 1];
			var bNextKey = bNext._0;
			var bNextNode = bNext._1;
			var newMatch = aKey === bNextKey;
		}


		// swap a and b
		if (aLookAhead && bLookAhead && newMatch && oldMatch)
		{
			index++;
			diffHelp(aNode, bNextNode, localPatches, index);
			insertNode(changes, localPatches, aKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			removeNode(changes, localPatches, aKey, aNextNode, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		// insert b
		if (bLookAhead && newMatch)
		{
			index++;
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			diffHelp(aNode, bNextNode, localPatches, index);
			index += aNode.descendantsCount || 0;

			aIndex += 1;
			bIndex += 2;
			continue;
		}

		// remove a
		if (aLookAhead && oldMatch)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 1;
			continue;
		}

		// remove a, insert b
		if (aLookAhead && bLookAhead && aNextKey === bNextKey)
		{
			index++;
			removeNode(changes, localPatches, aKey, aNode, index);
			insertNode(changes, localPatches, bKey, bNode, bIndex, inserts);
			index += aNode.descendantsCount || 0;

			index++;
			diffHelp(aNextNode, bNextNode, localPatches, index);
			index += aNextNode.descendantsCount || 0;

			aIndex += 2;
			bIndex += 2;
			continue;
		}

		break;
	}

	// eat up any remaining nodes with removeNode and insertNode

	while (aIndex < aLen)
	{
		index++;
		var a = aChildren[aIndex];
		var aNode = a._1;
		removeNode(changes, localPatches, a._0, aNode, index);
		index += aNode.descendantsCount || 0;
		aIndex++;
	}

	var endInserts;
	while (bIndex < bLen)
	{
		endInserts = endInserts || [];
		var b = bChildren[bIndex];
		insertNode(changes, localPatches, b._0, b._1, undefined, endInserts);
		bIndex++;
	}

	if (localPatches.length > 0 || inserts.length > 0 || typeof endInserts !== 'undefined')
	{
		patches.push(makePatch('p-reorder', rootIndex, {
			patches: localPatches,
			inserts: inserts,
			endInserts: endInserts
		}));
	}
}



////////////  CHANGES FROM KEYED DIFF  ////////////


var POSTFIX = '_elmW6BL';


function insertNode(changes, localPatches, key, vnode, bIndex, inserts)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		entry = {
			tag: 'insert',
			vnode: vnode,
			index: bIndex,
			data: undefined
		};

		inserts.push({ index: bIndex, entry: entry });
		changes[key] = entry;

		return;
	}

	// this key was removed earlier, a match!
	if (entry.tag === 'remove')
	{
		inserts.push({ index: bIndex, entry: entry });

		entry.tag = 'move';
		var subPatches = [];
		diffHelp(entry.vnode, vnode, subPatches, entry.index);
		entry.index = bIndex;
		entry.data.data = {
			patches: subPatches,
			entry: entry
		};

		return;
	}

	// this key has already been inserted or moved, a duplicate!
	insertNode(changes, localPatches, key + POSTFIX, vnode, bIndex, inserts);
}


function removeNode(changes, localPatches, key, vnode, index)
{
	var entry = changes[key];

	// never seen this key before
	if (typeof entry === 'undefined')
	{
		var patch = makePatch('p-remove', index, undefined);
		localPatches.push(patch);

		changes[key] = {
			tag: 'remove',
			vnode: vnode,
			index: index,
			data: patch
		};

		return;
	}

	// this key was inserted earlier, a match!
	if (entry.tag === 'insert')
	{
		entry.tag = 'move';
		var subPatches = [];
		diffHelp(vnode, entry.vnode, subPatches, index);

		var patch = makePatch('p-remove', index, {
			patches: subPatches,
			entry: entry
		});
		localPatches.push(patch);

		return;
	}

	// this key has already been removed or moved, a duplicate!
	removeNode(changes, localPatches, key + POSTFIX, vnode, index);
}



////////////  ADD DOM NODES  ////////////
//
// Each DOM node has an "index" assigned in order of traversal. It is important
// to minimize our crawl over the actual DOM, so these indexes (along with the
// descendantsCount of virtual nodes) let us skip touching entire subtrees of
// the DOM if we know there are no patches there.


function addDomNodes(domNode, vNode, patches, eventNode)
{
	addDomNodesHelp(domNode, vNode, patches, 0, 0, vNode.descendantsCount, eventNode);
}


// assumes `patches` is non-empty and indexes increase monotonically.
function addDomNodesHelp(domNode, vNode, patches, i, low, high, eventNode)
{
	var patch = patches[i];
	var index = patch.index;

	while (index === low)
	{
		var patchType = patch.type;

		if (patchType === 'p-thunk')
		{
			addDomNodes(domNode, vNode.node, patch.data, eventNode);
		}
		else if (patchType === 'p-reorder')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var subPatches = patch.data.patches;
			if (subPatches.length > 0)
			{
				addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
			}
		}
		else if (patchType === 'p-remove')
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;

			var data = patch.data;
			if (typeof data !== 'undefined')
			{
				data.entry.data = domNode;
				var subPatches = data.patches;
				if (subPatches.length > 0)
				{
					addDomNodesHelp(domNode, vNode, subPatches, 0, low, high, eventNode);
				}
			}
		}
		else
		{
			patch.domNode = domNode;
			patch.eventNode = eventNode;
		}

		i++;

		if (!(patch = patches[i]) || (index = patch.index) > high)
		{
			return i;
		}
	}

	switch (vNode.type)
	{
		case 'tagger':
			var subNode = vNode.node;

			while (subNode.type === "tagger")
			{
				subNode = subNode.node;
			}

			return addDomNodesHelp(domNode, subNode, patches, i, low + 1, high, domNode.elm_event_node_ref);

		case 'node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j];
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'keyed-node':
			var vChildren = vNode.children;
			var childNodes = domNode.childNodes;
			for (var j = 0; j < vChildren.length; j++)
			{
				low++;
				var vChild = vChildren[j]._1;
				var nextLow = low + (vChild.descendantsCount || 0);
				if (low <= index && index <= nextLow)
				{
					i = addDomNodesHelp(childNodes[j], vChild, patches, i, low, nextLow, eventNode);
					if (!(patch = patches[i]) || (index = patch.index) > high)
					{
						return i;
					}
				}
				low = nextLow;
			}
			return i;

		case 'text':
		case 'thunk':
			throw new Error('should never traverse `text` or `thunk` nodes like this');
	}
}



////////////  APPLY PATCHES  ////////////


function applyPatches(rootDomNode, oldVirtualNode, patches, eventNode)
{
	if (patches.length === 0)
	{
		return rootDomNode;
	}

	addDomNodes(rootDomNode, oldVirtualNode, patches, eventNode);
	return applyPatchesHelp(rootDomNode, patches);
}

function applyPatchesHelp(rootDomNode, patches)
{
	for (var i = 0; i < patches.length; i++)
	{
		var patch = patches[i];
		var localDomNode = patch.domNode
		var newNode = applyPatch(localDomNode, patch);
		if (localDomNode === rootDomNode)
		{
			rootDomNode = newNode;
		}
	}
	return rootDomNode;
}

function applyPatch(domNode, patch)
{
	switch (patch.type)
	{
		case 'p-redraw':
			return applyPatchRedraw(domNode, patch.data, patch.eventNode);

		case 'p-facts':
			applyFacts(domNode, patch.eventNode, patch.data);
			return domNode;

		case 'p-text':
			domNode.replaceData(0, domNode.length, patch.data);
			return domNode;

		case 'p-thunk':
			return applyPatchesHelp(domNode, patch.data);

		case 'p-tagger':
			if (typeof domNode.elm_event_node_ref !== 'undefined')
			{
				domNode.elm_event_node_ref.tagger = patch.data;
			}
			else
			{
				domNode.elm_event_node_ref = { tagger: patch.data, parent: patch.eventNode };
			}
			return domNode;

		case 'p-remove-last':
			var i = patch.data;
			while (i--)
			{
				domNode.removeChild(domNode.lastChild);
			}
			return domNode;

		case 'p-append':
			var newNodes = patch.data;
			for (var i = 0; i < newNodes.length; i++)
			{
				domNode.appendChild(render(newNodes[i], patch.eventNode));
			}
			return domNode;

		case 'p-remove':
			var data = patch.data;
			if (typeof data === 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
				return domNode;
			}
			var entry = data.entry;
			if (typeof entry.index !== 'undefined')
			{
				domNode.parentNode.removeChild(domNode);
			}
			entry.data = applyPatchesHelp(domNode, data.patches);
			return domNode;

		case 'p-reorder':
			return applyPatchReorder(domNode, patch);

		case 'p-custom':
			var impl = patch.data;
			return impl.applyPatch(domNode, impl.data);

		default:
			throw new Error('Ran into an unknown patch!');
	}
}


function applyPatchRedraw(domNode, vNode, eventNode)
{
	var parentNode = domNode.parentNode;
	var newNode = render(vNode, eventNode);

	if (typeof newNode.elm_event_node_ref === 'undefined')
	{
		newNode.elm_event_node_ref = domNode.elm_event_node_ref;
	}

	if (parentNode && newNode !== domNode)
	{
		parentNode.replaceChild(newNode, domNode);
	}
	return newNode;
}


function applyPatchReorder(domNode, patch)
{
	var data = patch.data;

	// remove end inserts
	var frag = applyPatchReorderEndInsertsHelp(data.endInserts, patch);

	// removals
	domNode = applyPatchesHelp(domNode, data.patches);

	// inserts
	var inserts = data.inserts;
	for (var i = 0; i < inserts.length; i++)
	{
		var insert = inserts[i];
		var entry = insert.entry;
		var node = entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode);
		domNode.insertBefore(node, domNode.childNodes[insert.index]);
	}

	// add end inserts
	if (typeof frag !== 'undefined')
	{
		domNode.appendChild(frag);
	}

	return domNode;
}


function applyPatchReorderEndInsertsHelp(endInserts, patch)
{
	if (typeof endInserts === 'undefined')
	{
		return;
	}

	var frag = localDoc.createDocumentFragment();
	for (var i = 0; i < endInserts.length; i++)
	{
		var insert = endInserts[i];
		var entry = insert.entry;
		frag.appendChild(entry.tag === 'move'
			? entry.data
			: render(entry.vnode, patch.eventNode)
		);
	}
	return frag;
}


// PROGRAMS

var program = makeProgram(checkNoFlags);
var programWithFlags = makeProgram(checkYesFlags);

function makeProgram(flagChecker)
{
	return F2(function(debugWrap, impl)
	{
		return function(flagDecoder)
		{
			return function(object, moduleName, debugMetadata)
			{
				var checker = flagChecker(flagDecoder, moduleName);
				if (typeof debugMetadata === 'undefined')
				{
					normalSetup(impl, object, moduleName, checker);
				}
				else
				{
					debugSetup(A2(debugWrap, debugMetadata, impl), object, moduleName, checker);
				}
			};
		};
	});
}

function staticProgram(vNode)
{
	var nothing = _elm_lang$core$Native_Utils.Tuple2(
		_elm_lang$core$Native_Utils.Tuple0,
		_elm_lang$core$Platform_Cmd$none
	);
	return A2(program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, {
		init: nothing,
		view: function() { return vNode; },
		update: F2(function() { return nothing; }),
		subscriptions: function() { return _elm_lang$core$Platform_Sub$none; }
	})();
}


// FLAG CHECKERS

function checkNoFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flags === 'undefined')
		{
			return init;
		}

		var errorMessage =
			'The `' + moduleName + '` module does not need flags.\n'
			+ 'Initialize it with no arguments and you should be all set!';

		crash(errorMessage, domNode);
	};
}

function checkYesFlags(flagDecoder, moduleName)
{
	return function(init, flags, domNode)
	{
		if (typeof flagDecoder === 'undefined')
		{
			var errorMessage =
				'Are you trying to sneak a Never value into Elm? Trickster!\n'
				+ 'It looks like ' + moduleName + '.main is defined with `programWithFlags` but has type `Program Never`.\n'
				+ 'Use `program` instead if you do not want flags.'

			crash(errorMessage, domNode);
		}

		var result = A2(_elm_lang$core$Native_Json.run, flagDecoder, flags);
		if (result.ctor === 'Ok')
		{
			return init(result._0);
		}

		var errorMessage =
			'Trying to initialize the `' + moduleName + '` module with an unexpected flag.\n'
			+ 'I tried to convert it to an Elm value, but ran into this problem:\n\n'
			+ result._0;

		crash(errorMessage, domNode);
	};
}

function crash(errorMessage, domNode)
{
	if (domNode)
	{
		domNode.innerHTML =
			'<div style="padding-left:1em;">'
			+ '<h2 style="font-weight:normal;"><b>Oops!</b> Something went wrong when starting your Elm program.</h2>'
			+ '<pre style="padding-left:1em;">' + errorMessage + '</pre>'
			+ '</div>';
	}

	throw new Error(errorMessage);
}


//  NORMAL SETUP

function normalSetup(impl, object, moduleName, flagChecker)
{
	object['embed'] = function embed(node, flags)
	{
		while (node.lastChild)
		{
			node.removeChild(node.lastChild);
		}

		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update,
			impl.subscriptions,
			normalRenderer(node, impl.view)
		);
	};

	object['fullscreen'] = function fullscreen(flags)
	{
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update,
			impl.subscriptions,
			normalRenderer(document.body, impl.view)
		);
	};
}

function normalRenderer(parentNode, view)
{
	return function(tagger, initialModel)
	{
		var eventNode = { tagger: tagger, parent: undefined };
		var initialVirtualNode = view(initialModel);
		var domNode = render(initialVirtualNode, eventNode);
		parentNode.appendChild(domNode);
		return makeStepper(domNode, view, initialVirtualNode, eventNode);
	};
}


// STEPPER

var rAF =
	typeof requestAnimationFrame !== 'undefined'
		? requestAnimationFrame
		: function(callback) { setTimeout(callback, 1000 / 60); };

function makeStepper(domNode, view, initialVirtualNode, eventNode)
{
	var state = 'NO_REQUEST';
	var currNode = initialVirtualNode;
	var nextModel;

	function updateIfNeeded()
	{
		switch (state)
		{
			case 'NO_REQUEST':
				throw new Error(
					'Unexpected draw callback.\n' +
					'Please report this to <https://github.com/elm-lang/virtual-dom/issues>.'
				);

			case 'PENDING_REQUEST':
				rAF(updateIfNeeded);
				state = 'EXTRA_REQUEST';

				var nextNode = view(nextModel);
				var patches = diff(currNode, nextNode);
				domNode = applyPatches(domNode, currNode, patches, eventNode);
				currNode = nextNode;

				return;

			case 'EXTRA_REQUEST':
				state = 'NO_REQUEST';
				return;
		}
	}

	return function stepper(model)
	{
		if (state === 'NO_REQUEST')
		{
			rAF(updateIfNeeded);
		}
		state = 'PENDING_REQUEST';
		nextModel = model;
	};
}


// DEBUG SETUP

function debugSetup(impl, object, moduleName, flagChecker)
{
	object['fullscreen'] = function fullscreen(flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, document.body),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, document.body, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};

	object['embed'] = function fullscreen(node, flags)
	{
		var popoutRef = { doc: undefined };
		return _elm_lang$core$Native_Platform.initialize(
			flagChecker(impl.init, flags, node),
			impl.update(scrollTask(popoutRef)),
			impl.subscriptions,
			debugRenderer(moduleName, node, popoutRef, impl.view, impl.viewIn, impl.viewOut)
		);
	};
}

function scrollTask(popoutRef)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var doc = popoutRef.doc;
		if (doc)
		{
			var msgs = doc.getElementsByClassName('debugger-sidebar-messages')[0];
			if (msgs)
			{
				msgs.scrollTop = msgs.scrollHeight;
			}
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


function debugRenderer(moduleName, parentNode, popoutRef, view, viewIn, viewOut)
{
	return function(tagger, initialModel)
	{
		var appEventNode = { tagger: tagger, parent: undefined };
		var eventNode = { tagger: tagger, parent: undefined };

		// make normal stepper
		var appVirtualNode = view(initialModel);
		var appNode = render(appVirtualNode, appEventNode);
		parentNode.appendChild(appNode);
		var appStepper = makeStepper(appNode, view, appVirtualNode, appEventNode);

		// make overlay stepper
		var overVirtualNode = viewIn(initialModel)._1;
		var overNode = render(overVirtualNode, eventNode);
		parentNode.appendChild(overNode);
		var wrappedViewIn = wrapViewIn(appEventNode, overNode, viewIn);
		var overStepper = makeStepper(overNode, wrappedViewIn, overVirtualNode, eventNode);

		// make debugger stepper
		var debugStepper = makeDebugStepper(initialModel, viewOut, eventNode, parentNode, moduleName, popoutRef);

		return function stepper(model)
		{
			appStepper(model);
			overStepper(model);
			debugStepper(model);
		}
	};
}

function makeDebugStepper(initialModel, view, eventNode, parentNode, moduleName, popoutRef)
{
	var curr;
	var domNode;

	return function stepper(model)
	{
		if (!model.isDebuggerOpen)
		{
			return;
		}

		if (!popoutRef.doc)
		{
			curr = view(model);
			domNode = openDebugWindow(moduleName, popoutRef, curr, eventNode);
			return;
		}

		// switch to document of popout
		localDoc = popoutRef.doc;

		var next = view(model);
		var patches = diff(curr, next);
		domNode = applyPatches(domNode, curr, patches, eventNode);
		curr = next;

		// switch back to normal document
		localDoc = document;
	};
}

function openDebugWindow(moduleName, popoutRef, virtualNode, eventNode)
{
	var w = 900;
	var h = 360;
	var x = screen.width - w;
	var y = screen.height - h;
	var debugWindow = window.open('', '', 'width=' + w + ',height=' + h + ',left=' + x + ',top=' + y);

	// switch to window document
	localDoc = debugWindow.document;

	popoutRef.doc = localDoc;
	localDoc.title = 'Debugger - ' + moduleName;
	localDoc.body.style.margin = '0';
	localDoc.body.style.padding = '0';
	var domNode = render(virtualNode, eventNode);
	localDoc.body.appendChild(domNode);

	localDoc.addEventListener('keydown', function(event) {
		if (event.metaKey && event.which === 82)
		{
			window.location.reload();
		}
		if (event.which === 38)
		{
			eventNode.tagger({ ctor: 'Up' });
			event.preventDefault();
		}
		if (event.which === 40)
		{
			eventNode.tagger({ ctor: 'Down' });
			event.preventDefault();
		}
	});

	function close()
	{
		popoutRef.doc = undefined;
		debugWindow.close();
	}
	window.addEventListener('unload', close);
	debugWindow.addEventListener('unload', function() {
		popoutRef.doc = undefined;
		window.removeEventListener('unload', close);
		eventNode.tagger({ ctor: 'Close' });
	});

	// switch back to the normal document
	localDoc = document;

	return domNode;
}


// BLOCK EVENTS

function wrapViewIn(appEventNode, overlayNode, viewIn)
{
	var ignorer = makeIgnorer(overlayNode);
	var blocking = 'Normal';
	var overflow;

	var normalTagger = appEventNode.tagger;
	var blockTagger = function() {};

	return function(model)
	{
		var tuple = viewIn(model);
		var newBlocking = tuple._0.ctor;
		appEventNode.tagger = newBlocking === 'Normal' ? normalTagger : blockTagger;
		if (blocking !== newBlocking)
		{
			traverse('removeEventListener', ignorer, blocking);
			traverse('addEventListener', ignorer, newBlocking);

			if (blocking === 'Normal')
			{
				overflow = document.body.style.overflow;
				document.body.style.overflow = 'hidden';
			}

			if (newBlocking === 'Normal')
			{
				document.body.style.overflow = overflow;
			}

			blocking = newBlocking;
		}
		return tuple._1;
	}
}

function traverse(verbEventListener, ignorer, blocking)
{
	switch(blocking)
	{
		case 'Normal':
			return;

		case 'Pause':
			return traverseHelp(verbEventListener, ignorer, mostEvents);

		case 'Message':
			return traverseHelp(verbEventListener, ignorer, allEvents);
	}
}

function traverseHelp(verbEventListener, handler, eventNames)
{
	for (var i = 0; i < eventNames.length; i++)
	{
		document.body[verbEventListener](eventNames[i], handler, true);
	}
}

function makeIgnorer(overlayNode)
{
	return function(event)
	{
		if (event.type === 'keydown' && event.metaKey && event.which === 82)
		{
			return;
		}

		var isScroll = event.type === 'scroll' || event.type === 'wheel';

		var node = event.target;
		while (node !== null)
		{
			if (node.className === 'elm-overlay-message-details' && isScroll)
			{
				return;
			}

			if (node === overlayNode && !isScroll)
			{
				return;
			}
			node = node.parentNode;
		}

		event.stopPropagation();
		event.preventDefault();
	}
}

var mostEvents = [
	'click', 'dblclick', 'mousemove',
	'mouseup', 'mousedown', 'mouseenter', 'mouseleave',
	'touchstart', 'touchend', 'touchcancel', 'touchmove',
	'pointerdown', 'pointerup', 'pointerover', 'pointerout',
	'pointerenter', 'pointerleave', 'pointermove', 'pointercancel',
	'dragstart', 'drag', 'dragend', 'dragenter', 'dragover', 'dragleave', 'drop',
	'keyup', 'keydown', 'keypress',
	'input', 'change',
	'focus', 'blur'
];

var allEvents = mostEvents.concat('wheel', 'scroll');


return {
	node: node,
	text: text,
	custom: custom,
	map: F2(map),

	on: F3(on),
	style: style,
	property: F2(property),
	attribute: F2(attribute),
	attributeNS: F3(attributeNS),
	mapProperty: F2(mapProperty),

	lazy: F2(lazy),
	lazy2: F3(lazy2),
	lazy3: F4(lazy3),
	keyedNode: F3(keyedNode),

	program: program,
	programWithFlags: programWithFlags,
	staticProgram: staticProgram
};

}();

var _elm_lang$virtual_dom$Native_Debug = function() {


// IMPORT / EXPORT

function unsafeCoerce(value)
{
	return value;
}

var upload = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
{
	var element = document.createElement('input');
	element.setAttribute('type', 'file');
	element.setAttribute('accept', 'text/json');
	element.style.display = 'none';
	element.addEventListener('change', function(event)
	{
		var fileReader = new FileReader();
		fileReader.onload = function(e)
		{
			callback(_elm_lang$core$Native_Scheduler.succeed(e.target.result));
		};
		fileReader.readAsText(event.target.files[0]);
		document.body.removeChild(element);
	});
	document.body.appendChild(element);
	element.click();
});

function download(historyLength, json)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var fileName = 'history-' + historyLength + '.txt';
		var jsonString = JSON.stringify(json);
		var mime = 'text/plain;charset=utf-8';
		var done = _elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0);

		// for IE10+
		if (navigator.msSaveBlob)
		{
			navigator.msSaveBlob(new Blob([jsonString], {type: mime}), fileName);
			return callback(done);
		}

		// for HTML5
		var element = document.createElement('a');
		element.setAttribute('href', 'data:' + mime + ',' + encodeURIComponent(jsonString));
		element.setAttribute('download', fileName);
		element.style.display = 'none';
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
		callback(done);
	});
}


// POPOUT

function messageToString(value)
{
	switch (typeof value)
	{
		case 'boolean':
			return value ? 'True' : 'False';
		case 'number':
			return value + '';
		case 'string':
			return '"' + addSlashes(value, false) + '"';
	}
	if (value instanceof String)
	{
		return '\'' + addSlashes(value, true) + '\'';
	}
	if (typeof value !== 'object' || value === null || !('ctor' in value))
	{
		return '…';
	}

	var ctorStarter = value.ctor.substring(0, 5);
	if (ctorStarter === '_Tupl' || ctorStarter === '_Task')
	{
		return '…'
	}
	if (['_Array', '<decoder>', '_Process', '::', '[]', 'Set_elm_builtin', 'RBNode_elm_builtin', 'RBEmpty_elm_builtin'].indexOf(value.ctor) >= 0)
	{
		return '…';
	}

	var keys = Object.keys(value);
	switch (keys.length)
	{
		case 1:
			return value.ctor;
		case 2:
			return value.ctor + ' ' + messageToString(value._0);
		default:
			return value.ctor + ' … ' + messageToString(value[keys[keys.length - 1]]);
	}
}


function primitive(str)
{
	return { ctor: 'Primitive', _0: str };
}


function init(value)
{
	var type = typeof value;

	if (type === 'boolean')
	{
		return {
			ctor: 'Constructor',
			_0: _elm_lang$core$Maybe$Just(value ? 'True' : 'False'),
			_1: true,
			_2: _elm_lang$core$Native_List.Nil
		};
	}

	if (type === 'number')
	{
		return primitive(value + '');
	}

	if (type === 'string')
	{
		return { ctor: 'S', _0: '"' + addSlashes(value, false) + '"' };
	}

	if (value instanceof String)
	{
		return { ctor: 'S', _0: "'" + addSlashes(value, true) + "'" };
	}

	if (value instanceof Date)
	{
		return primitive('<' + value.toString() + '>');
	}

	if (value === null)
	{
		return primitive('XXX');
	}

	if (type === 'object' && 'ctor' in value)
	{
		var ctor = value.ctor;

		if (ctor === '::' || ctor === '[]')
		{
			return {
				ctor: 'Sequence',
				_0: {ctor: 'ListSeq'},
				_1: true,
				_2: A2(_elm_lang$core$List$map, init, value)
			};
		}

		if (ctor === 'Set_elm_builtin')
		{
			return {
				ctor: 'Sequence',
				_0: {ctor: 'SetSeq'},
				_1: true,
				_2: A3(_elm_lang$core$Set$foldr, initCons, _elm_lang$core$Native_List.Nil, value)
			};
		}

		if (ctor === 'RBNode_elm_builtin' || ctor == 'RBEmpty_elm_builtin')
		{
			return {
				ctor: 'Dictionary',
				_0: true,
				_1: A3(_elm_lang$core$Dict$foldr, initKeyValueCons, _elm_lang$core$Native_List.Nil, value)
			};
		}

		if (ctor === '_Array')
		{
			return {
				ctor: 'Sequence',
				_0: {ctor: 'ArraySeq'},
				_1: true,
				_2: A3(_elm_lang$core$Array$foldr, initCons, _elm_lang$core$Native_List.Nil, value)
			};
		}

		var ctorStarter = value.ctor.substring(0, 5);
		if (ctorStarter === '_Task')
		{
			return primitive('<task>');
		}

		if (ctor === '<decoder>')
		{
			return primitive(ctor);
		}

		if (ctor === '_Process')
		{
			return primitive('<process>');
		}

		var list = _elm_lang$core$Native_List.Nil;
		for (var i in value)
		{
			if (i === 'ctor') continue;
			list = _elm_lang$core$Native_List.Cons(init(value[i]), list);
		}
		return {
			ctor: 'Constructor',
			_0: ctorStarter === '_Tupl' ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(ctor),
			_1: true,
			_2: _elm_lang$core$List$reverse(list)
		};
	}

	if (type === 'object')
	{
		var dict = _elm_lang$core$Dict$empty;
		for (var i in value)
		{
			dict = A3(_elm_lang$core$Dict$insert, i, init(value[i]), dict);
		}
		return { ctor: 'Record', _0: true, _1: dict };
	}

	return primitive('XXX');
}

var initCons = F2(initConsHelp);

function initConsHelp(value, list)
{
	return _elm_lang$core$Native_List.Cons(init(value), list);
}

var initKeyValueCons = F3(initKeyValueConsHelp);

function initKeyValueConsHelp(key, value, list)
{
	return _elm_lang$core$Native_List.Cons(
		_elm_lang$core$Native_Utils.Tuple2(init(key), init(value)),
		list
	);
}

function addSlashes(str, isChar)
{
	var s = str.replace(/\\/g, '\\\\')
			  .replace(/\n/g, '\\n')
			  .replace(/\t/g, '\\t')
			  .replace(/\r/g, '\\r')
			  .replace(/\v/g, '\\v')
			  .replace(/\0/g, '\\0');
	if (isChar)
	{
		return s.replace(/\'/g, '\\\'');
	}
	else
	{
		return s.replace(/\"/g, '\\"');
	}
}


return {
	upload: upload,
	download: F2(download),
	unsafeCoerce: unsafeCoerce,
	messageToString: messageToString,
	init: init
}

}();

var _elm_lang$virtual_dom$VirtualDom_Helpers$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom_Helpers$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom_Helpers$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom_Helpers$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom_Helpers$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom_Helpers$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom_Helpers$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom_Helpers$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom_Helpers$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom_Helpers$onClick = function (msg) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$on,
		'click',
		_elm_lang$core$Json_Decode$succeed(msg));
};
var _elm_lang$virtual_dom$VirtualDom_Helpers$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom_Helpers$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom_Helpers$id = _elm_lang$virtual_dom$VirtualDom_Helpers$attribute('id');
var _elm_lang$virtual_dom$VirtualDom_Helpers$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom_Helpers$class = function (name) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$property,
		'className',
		_elm_lang$core$Json_Encode$string(name));
};
var _elm_lang$virtual_dom$VirtualDom_Helpers$href = function (name) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$property,
		'href',
		_elm_lang$core$Json_Encode$string(name));
};
var _elm_lang$virtual_dom$VirtualDom_Helpers$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom_Helpers$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom_Helpers$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom_Helpers$div = _elm_lang$virtual_dom$VirtualDom_Helpers$node('div');
var _elm_lang$virtual_dom$VirtualDom_Helpers$span = _elm_lang$virtual_dom$VirtualDom_Helpers$node('span');
var _elm_lang$virtual_dom$VirtualDom_Helpers$a = _elm_lang$virtual_dom$VirtualDom_Helpers$node('a');
var _elm_lang$virtual_dom$VirtualDom_Helpers$h1 = _elm_lang$virtual_dom$VirtualDom_Helpers$node('h1');
var _elm_lang$virtual_dom$VirtualDom_Helpers$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Helpers$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom_Helpers$Property = {ctor: 'Property'};

var _elm_lang$virtual_dom$VirtualDom_Expando$purple = _elm_lang$virtual_dom$VirtualDom_Helpers$style(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'color', _1: 'rgb(136, 19, 145)'},
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$blue = _elm_lang$virtual_dom$VirtualDom_Helpers$style(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'color', _1: 'rgb(28, 0, 207)'},
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$red = _elm_lang$virtual_dom$VirtualDom_Helpers$style(
	{
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: 'color', _1: 'rgb(196, 26, 22)'},
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$leftPad = function (maybeKey) {
	var _p0 = maybeKey;
	if (_p0.ctor === 'Nothing') {
		return _elm_lang$virtual_dom$VirtualDom_Helpers$style(
			{ctor: '[]'});
	} else {
		return _elm_lang$virtual_dom$VirtualDom_Helpers$style(
			{
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: 'padding-left', _1: '4ch'},
				_1: {ctor: '[]'}
			});
	}
};
var _elm_lang$virtual_dom$VirtualDom_Expando$makeArrow = function (arrow) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$span,
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: 'color', _1: '#777'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: 'padding-left', _1: '2ch'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'width', _1: '2ch'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: 'display', _1: 'inline-block'},
								_1: {ctor: '[]'}
							}
						}
					}
				}),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(arrow),
			_1: {ctor: '[]'}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Expando$lineStarter = F3(
	function (maybeKey, maybeIsClosed, description) {
		var arrow = function () {
			var _p1 = maybeIsClosed;
			if (_p1.ctor === 'Nothing') {
				return _elm_lang$virtual_dom$VirtualDom_Expando$makeArrow('');
			} else {
				if (_p1._0 === true) {
					return _elm_lang$virtual_dom$VirtualDom_Expando$makeArrow('▸');
				} else {
					return _elm_lang$virtual_dom$VirtualDom_Expando$makeArrow('▾');
				}
			}
		}();
		var _p2 = maybeKey;
		if (_p2.ctor === 'Nothing') {
			return {ctor: '::', _0: arrow, _1: description};
		} else {
			return {
				ctor: '::',
				_0: arrow,
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Expando$purple,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p2._0),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' = '),
						_1: description
					}
				}
			};
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTinyRecord = F3(
	function (length, starter, entries) {
		var _p3 = entries;
		if (_p3.ctor === '[]') {
			return {
				ctor: '_Tuple2',
				_0: length + 1,
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('}'),
					_1: {ctor: '[]'}
				}
			};
		} else {
			var _p5 = _p3._0;
			var nextLength = (length + _elm_lang$core$String$length(_p5)) + 1;
			if (_elm_lang$core$Native_Utils.cmp(nextLength, 18) > 0) {
				return {
					ctor: '_Tuple2',
					_0: length + 2,
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('…}'),
						_1: {ctor: '[]'}
					}
				};
			} else {
				var _p4 = A3(_elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTinyRecord, nextLength, ',', _p3._1);
				var finalLength = _p4._0;
				var otherNodes = _p4._1;
				return {
					ctor: '_Tuple2',
					_0: finalLength,
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(starter),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Expando$purple,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p5),
									_1: {ctor: '[]'}
								}),
							_1: otherNodes
						}
					}
				};
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$elideMiddle = function (str) {
	return (_elm_lang$core$Native_Utils.cmp(
		_elm_lang$core$String$length(str),
		18) < 1) ? str : A2(
		_elm_lang$core$Basics_ops['++'],
		A2(_elm_lang$core$String$left, 8, str),
		A2(
			_elm_lang$core$Basics_ops['++'],
			'...',
			A2(_elm_lang$core$String$right, 8, str)));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyHelp = function (str) {
	return {
		ctor: '_Tuple2',
		_0: _elm_lang$core$String$length(str),
		_1: {
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(str),
			_1: {ctor: '[]'}
		}
	};
};
var _elm_lang$virtual_dom$VirtualDom_Expando$updateIndex = F3(
	function (n, func, list) {
		var _p6 = list;
		if (_p6.ctor === '[]') {
			return {ctor: '[]'};
		} else {
			var _p8 = _p6._1;
			var _p7 = _p6._0;
			return (_elm_lang$core$Native_Utils.cmp(n, 0) < 1) ? {
				ctor: '::',
				_0: func(_p7),
				_1: _p8
			} : {
				ctor: '::',
				_0: _p7,
				_1: A3(_elm_lang$virtual_dom$VirtualDom_Expando$updateIndex, n - 1, func, _p8)
			};
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$seqTypeToString = F2(
	function (n, seqType) {
		var _p9 = seqType;
		switch (_p9.ctor) {
			case 'ListSeq':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'List(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(n),
						')'));
			case 'SetSeq':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'Set(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(n),
						')'));
			default:
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'Array(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(n),
						')'));
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewTiny = function (value) {
	var _p10 = value;
	switch (_p10.ctor) {
		case 'S':
			var str = _elm_lang$virtual_dom$VirtualDom_Expando$elideMiddle(_p10._0);
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$String$length(str),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Expando$red,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(str),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			};
		case 'Primitive':
			var _p11 = _p10._0;
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$String$length(_p11),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Expando$blue,
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p11),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			};
		case 'Sequence':
			return _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyHelp(
				A2(
					_elm_lang$virtual_dom$VirtualDom_Expando$seqTypeToString,
					_elm_lang$core$List$length(_p10._2),
					_p10._0));
		case 'Dictionary':
			return _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyHelp(
				A2(
					_elm_lang$core$Basics_ops['++'],
					'Dict(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(
							_elm_lang$core$List$length(_p10._1)),
						')')));
		case 'Record':
			return _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecord(_p10._1);
		default:
			if (_p10._2.ctor === '[]') {
				return _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyHelp(
					A2(_elm_lang$core$Maybe$withDefault, 'Unit', _p10._0));
			} else {
				return _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyHelp(
					function () {
						var _p12 = _p10._0;
						if (_p12.ctor === 'Nothing') {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'Tuple(',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(
										_elm_lang$core$List$length(_p10._2)),
									')'));
						} else {
							return A2(_elm_lang$core$Basics_ops['++'], _p12._0, ' …');
						}
					}());
			}
	}
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecord = function (record) {
	return _elm_lang$core$Dict$isEmpty(record) ? {
		ctor: '_Tuple2',
		_0: 2,
		_1: {
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('{}'),
			_1: {ctor: '[]'}
		}
	} : A3(
		_elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecordHelp,
		0,
		'{ ',
		_elm_lang$core$Dict$toList(record));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecordHelp = F3(
	function (length, starter, entries) {
		var _p13 = entries;
		if (_p13.ctor === '[]') {
			return {
				ctor: '_Tuple2',
				_0: length + 2,
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' }'),
					_1: {ctor: '[]'}
				}
			};
		} else {
			var _p16 = _p13._0._0;
			var _p14 = _elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTiny(_p13._0._1);
			var valueLen = _p14._0;
			var valueNodes = _p14._1;
			var fieldLen = _elm_lang$core$String$length(_p16);
			var newLength = ((length + fieldLen) + valueLen) + 5;
			if (_elm_lang$core$Native_Utils.cmp(newLength, 60) > 0) {
				return {
					ctor: '_Tuple2',
					_0: length + 4,
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(', … }'),
						_1: {ctor: '[]'}
					}
				};
			} else {
				var _p15 = A3(_elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecordHelp, newLength, ', ', _p13._1);
				var finalLength = _p15._0;
				var otherNodes = _p15._1;
				return {
					ctor: '_Tuple2',
					_0: finalLength,
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(starter),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Expando$purple,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p16),
									_1: {ctor: '[]'}
								}),
							_1: {
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' = '),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$virtual_dom$VirtualDom_Helpers$span,
										{ctor: '[]'},
										valueNodes),
									_1: otherNodes
								}
							}
						}
					}
				};
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTiny = function (value) {
	var _p17 = value;
	if (_p17.ctor === 'Record') {
		return A3(
			_elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTinyRecord,
			0,
			'{',
			_elm_lang$core$Dict$keys(_p17._1));
	} else {
		return _elm_lang$virtual_dom$VirtualDom_Expando$viewTiny(value);
	}
};
var _elm_lang$virtual_dom$VirtualDom_Expando$Constructor = F3(
	function (a, b, c) {
		return {ctor: 'Constructor', _0: a, _1: b, _2: c};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Record = F2(
	function (a, b) {
		return {ctor: 'Record', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Dictionary = F2(
	function (a, b) {
		return {ctor: 'Dictionary', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Sequence = F3(
	function (a, b, c) {
		return {ctor: 'Sequence', _0: a, _1: b, _2: c};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$initHelp = F2(
	function (isOuter, expando) {
		var _p18 = expando;
		switch (_p18.ctor) {
			case 'S':
				return expando;
			case 'Primitive':
				return expando;
			case 'Sequence':
				var _p20 = _p18._0;
				var _p19 = _p18._2;
				return isOuter ? A3(
					_elm_lang$virtual_dom$VirtualDom_Expando$Sequence,
					_p20,
					false,
					A2(
						_elm_lang$core$List$map,
						_elm_lang$virtual_dom$VirtualDom_Expando$initHelp(false),
						_p19)) : ((_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$List$length(_p19),
					8) < 1) ? A3(_elm_lang$virtual_dom$VirtualDom_Expando$Sequence, _p20, false, _p19) : expando);
			case 'Dictionary':
				var _p23 = _p18._1;
				return isOuter ? A2(
					_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary,
					false,
					A2(
						_elm_lang$core$List$map,
						function (_p21) {
							var _p22 = _p21;
							return {
								ctor: '_Tuple2',
								_0: _p22._0,
								_1: A2(_elm_lang$virtual_dom$VirtualDom_Expando$initHelp, false, _p22._1)
							};
						},
						_p23)) : ((_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$List$length(_p23),
					8) < 1) ? A2(_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary, false, _p23) : expando);
			case 'Record':
				var _p25 = _p18._1;
				return isOuter ? A2(
					_elm_lang$virtual_dom$VirtualDom_Expando$Record,
					false,
					A2(
						_elm_lang$core$Dict$map,
						F2(
							function (_p24, v) {
								return A2(_elm_lang$virtual_dom$VirtualDom_Expando$initHelp, false, v);
							}),
						_p25)) : ((_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$Dict$size(_p25),
					4) < 1) ? A2(_elm_lang$virtual_dom$VirtualDom_Expando$Record, false, _p25) : expando);
			default:
				var _p27 = _p18._0;
				var _p26 = _p18._2;
				return isOuter ? A3(
					_elm_lang$virtual_dom$VirtualDom_Expando$Constructor,
					_p27,
					false,
					A2(
						_elm_lang$core$List$map,
						_elm_lang$virtual_dom$VirtualDom_Expando$initHelp(false),
						_p26)) : ((_elm_lang$core$Native_Utils.cmp(
					_elm_lang$core$List$length(_p26),
					4) < 1) ? A3(_elm_lang$virtual_dom$VirtualDom_Expando$Constructor, _p27, false, _p26) : expando);
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$init = function (value) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Expando$initHelp,
		true,
		_elm_lang$virtual_dom$Native_Debug.init(value));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$mergeHelp = F2(
	function (old, $new) {
		var _p28 = {ctor: '_Tuple2', _0: old, _1: $new};
		_v12_6:
		do {
			if (_p28.ctor === '_Tuple2') {
				switch (_p28._1.ctor) {
					case 'S':
						return $new;
					case 'Primitive':
						return $new;
					case 'Sequence':
						if (_p28._0.ctor === 'Sequence') {
							return A3(
								_elm_lang$virtual_dom$VirtualDom_Expando$Sequence,
								_p28._1._0,
								_p28._0._1,
								A2(_elm_lang$virtual_dom$VirtualDom_Expando$mergeListHelp, _p28._0._2, _p28._1._2));
						} else {
							break _v12_6;
						}
					case 'Dictionary':
						if (_p28._0.ctor === 'Dictionary') {
							return A2(_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary, _p28._0._0, _p28._1._1);
						} else {
							break _v12_6;
						}
					case 'Record':
						if (_p28._0.ctor === 'Record') {
							return A2(
								_elm_lang$virtual_dom$VirtualDom_Expando$Record,
								_p28._0._0,
								A2(
									_elm_lang$core$Dict$map,
									_elm_lang$virtual_dom$VirtualDom_Expando$mergeDictHelp(_p28._0._1),
									_p28._1._1));
						} else {
							break _v12_6;
						}
					default:
						if (_p28._0.ctor === 'Constructor') {
							return A3(
								_elm_lang$virtual_dom$VirtualDom_Expando$Constructor,
								_p28._1._0,
								_p28._0._1,
								A2(_elm_lang$virtual_dom$VirtualDom_Expando$mergeListHelp, _p28._0._2, _p28._1._2));
						} else {
							break _v12_6;
						}
				}
			} else {
				break _v12_6;
			}
		} while(false);
		return $new;
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$mergeDictHelp = F3(
	function (oldDict, key, value) {
		var _p29 = A2(_elm_lang$core$Dict$get, key, oldDict);
		if (_p29.ctor === 'Nothing') {
			return value;
		} else {
			return A2(_elm_lang$virtual_dom$VirtualDom_Expando$mergeHelp, _p29._0, value);
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$mergeListHelp = F2(
	function (olds, news) {
		var _p30 = {ctor: '_Tuple2', _0: olds, _1: news};
		if (_p30._0.ctor === '[]') {
			return news;
		} else {
			if (_p30._1.ctor === '[]') {
				return news;
			} else {
				return {
					ctor: '::',
					_0: A2(_elm_lang$virtual_dom$VirtualDom_Expando$mergeHelp, _p30._0._0, _p30._1._0),
					_1: A2(_elm_lang$virtual_dom$VirtualDom_Expando$mergeListHelp, _p30._0._1, _p30._1._1)
				};
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$merge = F2(
	function (value, expando) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Expando$mergeHelp,
			expando,
			_elm_lang$virtual_dom$Native_Debug.init(value));
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$update = F2(
	function (msg, value) {
		var _p31 = value;
		switch (_p31.ctor) {
			case 'S':
				return _elm_lang$core$Native_Utils.crashCase(
					'VirtualDom.Expando',
					{
						start: {line: 168, column: 3},
						end: {line: 235, column: 50}
					},
					_p31)('No messages for primitives');
			case 'Primitive':
				return _elm_lang$core$Native_Utils.crashCase(
					'VirtualDom.Expando',
					{
						start: {line: 168, column: 3},
						end: {line: 235, column: 50}
					},
					_p31)('No messages for primitives');
			case 'Sequence':
				var _p39 = _p31._2;
				var _p38 = _p31._0;
				var _p37 = _p31._1;
				var _p34 = msg;
				switch (_p34.ctor) {
					case 'Toggle':
						return A3(_elm_lang$virtual_dom$VirtualDom_Expando$Sequence, _p38, !_p37, _p39);
					case 'Index':
						if (_p34._0.ctor === 'None') {
							return A3(
								_elm_lang$virtual_dom$VirtualDom_Expando$Sequence,
								_p38,
								_p37,
								A3(
									_elm_lang$virtual_dom$VirtualDom_Expando$updateIndex,
									_p34._1,
									_elm_lang$virtual_dom$VirtualDom_Expando$update(_p34._2),
									_p39));
						} else {
							return _elm_lang$core$Native_Utils.crashCase(
								'VirtualDom.Expando',
								{
									start: {line: 176, column: 7},
									end: {line: 188, column: 46}
								},
								_p34)('No redirected indexes on sequences');
						}
					default:
						return _elm_lang$core$Native_Utils.crashCase(
							'VirtualDom.Expando',
							{
								start: {line: 176, column: 7},
								end: {line: 188, column: 46}
							},
							_p34)('No field on sequences');
				}
			case 'Dictionary':
				var _p51 = _p31._1;
				var _p50 = _p31._0;
				var _p40 = msg;
				switch (_p40.ctor) {
					case 'Toggle':
						return A2(_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary, !_p50, _p51);
					case 'Index':
						var _p48 = _p40._2;
						var _p47 = _p40._1;
						var _p41 = _p40._0;
						switch (_p41.ctor) {
							case 'None':
								return _elm_lang$core$Native_Utils.crashCase(
									'VirtualDom.Expando',
									{
										start: {line: 196, column: 11},
										end: {line: 206, column: 81}
									},
									_p41)('must have redirect for dictionaries');
							case 'Key':
								return A2(
									_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary,
									_p50,
									A3(
										_elm_lang$virtual_dom$VirtualDom_Expando$updateIndex,
										_p47,
										function (_p43) {
											var _p44 = _p43;
											return {
												ctor: '_Tuple2',
												_0: A2(_elm_lang$virtual_dom$VirtualDom_Expando$update, _p48, _p44._0),
												_1: _p44._1
											};
										},
										_p51));
							default:
								return A2(
									_elm_lang$virtual_dom$VirtualDom_Expando$Dictionary,
									_p50,
									A3(
										_elm_lang$virtual_dom$VirtualDom_Expando$updateIndex,
										_p47,
										function (_p45) {
											var _p46 = _p45;
											return {
												ctor: '_Tuple2',
												_0: _p46._0,
												_1: A2(_elm_lang$virtual_dom$VirtualDom_Expando$update, _p48, _p46._1)
											};
										},
										_p51));
						}
					default:
						return _elm_lang$core$Native_Utils.crashCase(
							'VirtualDom.Expando',
							{
								start: {line: 191, column: 7},
								end: {line: 209, column: 50}
							},
							_p40)('no field for dictionaries');
				}
			case 'Record':
				var _p55 = _p31._1;
				var _p54 = _p31._0;
				var _p52 = msg;
				switch (_p52.ctor) {
					case 'Toggle':
						return A2(_elm_lang$virtual_dom$VirtualDom_Expando$Record, !_p54, _p55);
					case 'Index':
						return _elm_lang$core$Native_Utils.crashCase(
							'VirtualDom.Expando',
							{
								start: {line: 212, column: 7},
								end: {line: 220, column: 77}
							},
							_p52)('No index for records');
					default:
						return A2(
							_elm_lang$virtual_dom$VirtualDom_Expando$Record,
							_p54,
							A3(
								_elm_lang$core$Dict$update,
								_p52._0,
								_elm_lang$virtual_dom$VirtualDom_Expando$updateField(_p52._1),
								_p55));
				}
			default:
				var _p61 = _p31._2;
				var _p60 = _p31._0;
				var _p59 = _p31._1;
				var _p56 = msg;
				switch (_p56.ctor) {
					case 'Toggle':
						return A3(_elm_lang$virtual_dom$VirtualDom_Expando$Constructor, _p60, !_p59, _p61);
					case 'Index':
						if (_p56._0.ctor === 'None') {
							return A3(
								_elm_lang$virtual_dom$VirtualDom_Expando$Constructor,
								_p60,
								_p59,
								A3(
									_elm_lang$virtual_dom$VirtualDom_Expando$updateIndex,
									_p56._1,
									_elm_lang$virtual_dom$VirtualDom_Expando$update(_p56._2),
									_p61));
						} else {
							return _elm_lang$core$Native_Utils.crashCase(
								'VirtualDom.Expando',
								{
									start: {line: 223, column: 7},
									end: {line: 235, column: 50}
								},
								_p56)('No redirected indexes on sequences');
						}
					default:
						return _elm_lang$core$Native_Utils.crashCase(
							'VirtualDom.Expando',
							{
								start: {line: 223, column: 7},
								end: {line: 235, column: 50}
							},
							_p56)('No field for constructors');
				}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$updateField = F2(
	function (msg, maybeExpando) {
		var _p62 = maybeExpando;
		if (_p62.ctor === 'Nothing') {
			return _elm_lang$core$Native_Utils.crashCase(
				'VirtualDom.Expando',
				{
					start: {line: 253, column: 3},
					end: {line: 258, column: 32}
				},
				_p62)('key does not exist');
		} else {
			return _elm_lang$core$Maybe$Just(
				A2(_elm_lang$virtual_dom$VirtualDom_Expando$update, msg, _p62._0));
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Primitive = function (a) {
	return {ctor: 'Primitive', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Expando$S = function (a) {
	return {ctor: 'S', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Expando$ArraySeq = {ctor: 'ArraySeq'};
var _elm_lang$virtual_dom$VirtualDom_Expando$SetSeq = {ctor: 'SetSeq'};
var _elm_lang$virtual_dom$VirtualDom_Expando$ListSeq = {ctor: 'ListSeq'};
var _elm_lang$virtual_dom$VirtualDom_Expando$Field = F2(
	function (a, b) {
		return {ctor: 'Field', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Index = F3(
	function (a, b, c) {
		return {ctor: 'Index', _0: a, _1: b, _2: c};
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$Toggle = {ctor: 'Toggle'};
var _elm_lang$virtual_dom$VirtualDom_Expando$Value = {ctor: 'Value'};
var _elm_lang$virtual_dom$VirtualDom_Expando$Key = {ctor: 'Key'};
var _elm_lang$virtual_dom$VirtualDom_Expando$None = {ctor: 'None'};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorEntry = F2(
	function (index, value) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$map,
			A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$None, index),
			A2(
				_elm_lang$virtual_dom$VirtualDom_Expando$view,
				_elm_lang$core$Maybe$Just(
					_elm_lang$core$Basics$toString(index)),
				value));
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$view = F2(
	function (maybeKey, expando) {
		var _p64 = expando;
		switch (_p64.ctor) {
			case 'S':
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
						_1: {ctor: '[]'}
					},
					A3(
						_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter,
						maybeKey,
						_elm_lang$core$Maybe$Nothing,
						{
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Expando$red,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p64._0),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}));
			case 'Primitive':
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
						_1: {ctor: '[]'}
					},
					A3(
						_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter,
						maybeKey,
						_elm_lang$core$Maybe$Nothing,
						{
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Expando$blue,
									_1: {ctor: '[]'}
								},
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p64._0),
									_1: {ctor: '[]'}
								}),
							_1: {ctor: '[]'}
						}));
			case 'Sequence':
				return A4(_elm_lang$virtual_dom$VirtualDom_Expando$viewSequence, maybeKey, _p64._0, _p64._1, _p64._2);
			case 'Dictionary':
				return A3(_elm_lang$virtual_dom$VirtualDom_Expando$viewDictionary, maybeKey, _p64._0, _p64._1);
			case 'Record':
				return A3(_elm_lang$virtual_dom$VirtualDom_Expando$viewRecord, maybeKey, _p64._0, _p64._1);
			default:
				return A4(_elm_lang$virtual_dom$VirtualDom_Expando$viewConstructor, maybeKey, _p64._0, _p64._1, _p64._2);
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructor = F4(
	function (maybeKey, maybeName, isClosed, valueList) {
		var _p65 = function () {
			var _p66 = valueList;
			if (_p66.ctor === '[]') {
				return {
					ctor: '_Tuple2',
					_0: _elm_lang$core$Maybe$Nothing,
					_1: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$div,
						{ctor: '[]'},
						{ctor: '[]'})
				};
			} else {
				if (_p66._1.ctor === '[]') {
					var _p67 = _p66._0;
					switch (_p67.ctor) {
						case 'S':
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Nothing,
								_1: A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'})
							};
						case 'Primitive':
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Nothing,
								_1: A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'})
							};
						case 'Sequence':
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(isClosed),
								_1: isClosed ? A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'}) : A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$map,
									A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$None, 0),
									_elm_lang$virtual_dom$VirtualDom_Expando$viewSequenceOpen(_p67._2))
							};
						case 'Dictionary':
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(isClosed),
								_1: isClosed ? A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'}) : A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$map,
									A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$None, 0),
									_elm_lang$virtual_dom$VirtualDom_Expando$viewDictionaryOpen(_p67._1))
							};
						case 'Record':
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(isClosed),
								_1: isClosed ? A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'}) : A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$map,
									A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$None, 0),
									_elm_lang$virtual_dom$VirtualDom_Expando$viewRecordOpen(_p67._1))
							};
						default:
							return {
								ctor: '_Tuple2',
								_0: _elm_lang$core$Maybe$Just(isClosed),
								_1: isClosed ? A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$div,
									{ctor: '[]'},
									{ctor: '[]'}) : A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$map,
									A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$None, 0),
									_elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorOpen(_p67._2))
							};
					}
				} else {
					return {
						ctor: '_Tuple2',
						_0: _elm_lang$core$Maybe$Just(isClosed),
						_1: isClosed ? A2(
							_elm_lang$virtual_dom$VirtualDom_Helpers$div,
							{ctor: '[]'},
							{ctor: '[]'}) : _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorOpen(valueList)
					};
				}
			}
		}();
		var maybeIsClosed = _p65._0;
		var openHtml = _p65._1;
		var tinyArgs = A2(
			_elm_lang$core$List$map,
			function (_p68) {
				return _elm_lang$core$Tuple$second(
					_elm_lang$virtual_dom$VirtualDom_Expando$viewExtraTiny(_p68));
			},
			valueList);
		var description = function () {
			var _p69 = {ctor: '_Tuple2', _0: maybeName, _1: tinyArgs};
			if (_p69._0.ctor === 'Nothing') {
				if (_p69._1.ctor === '[]') {
					return {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('()'),
						_1: {ctor: '[]'}
					};
				} else {
					return {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('( '),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{ctor: '[]'},
								_p69._1._0),
							_1: A3(
								_elm_lang$core$List$foldr,
								F2(
									function (args, rest) {
										return {
											ctor: '::',
											_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(', '),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$virtual_dom$VirtualDom_Helpers$span,
													{ctor: '[]'},
													args),
												_1: rest
											}
										};
									}),
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' )'),
									_1: {ctor: '[]'}
								},
								_p69._1._1)
						}
					};
				}
			} else {
				if (_p69._1.ctor === '[]') {
					return {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p69._0._0),
						_1: {ctor: '[]'}
					};
				} else {
					return {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
							A2(_elm_lang$core$Basics_ops['++'], _p69._0._0, ' ')),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$span,
								{ctor: '[]'},
								_p69._1._0),
							_1: A3(
								_elm_lang$core$List$foldr,
								F2(
									function (args, rest) {
										return {
											ctor: '::',
											_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' '),
											_1: {
												ctor: '::',
												_0: A2(
													_elm_lang$virtual_dom$VirtualDom_Helpers$span,
													{ctor: '[]'},
													args),
												_1: rest
											}
										};
									}),
								{ctor: '[]'},
								_p69._1._1)
						}
					};
				}
			}
		}();
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Expando$Toggle),
						_1: {ctor: '[]'}
					},
					A3(_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter, maybeKey, maybeIsClosed, description)),
				_1: {
					ctor: '::',
					_0: openHtml,
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorOpen = function (valueList) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{ctor: '[]'},
		A2(_elm_lang$core$List$indexedMap, _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorEntry, valueList));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewDictionaryOpen = function (keyValuePairs) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{ctor: '[]'},
		A2(_elm_lang$core$List$indexedMap, _elm_lang$virtual_dom$VirtualDom_Expando$viewDictionaryEntry, keyValuePairs));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewDictionaryEntry = F2(
	function (index, _p70) {
		var _p71 = _p70;
		var _p74 = _p71._1;
		var _p73 = _p71._0;
		var _p72 = _p73;
		switch (_p72.ctor) {
			case 'S':
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$map,
					A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$Value, index),
					A2(
						_elm_lang$virtual_dom$VirtualDom_Expando$view,
						_elm_lang$core$Maybe$Just(_p72._0),
						_p74));
			case 'Primitive':
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$map,
					A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$Value, index),
					A2(
						_elm_lang$virtual_dom$VirtualDom_Expando$view,
						_elm_lang$core$Maybe$Just(_p72._0),
						_p74));
			default:
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{ctor: '[]'},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$virtual_dom$VirtualDom_Helpers$map,
							A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$Key, index),
							A2(
								_elm_lang$virtual_dom$VirtualDom_Expando$view,
								_elm_lang$core$Maybe$Just('key'),
								_p73)),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$map,
								A2(_elm_lang$virtual_dom$VirtualDom_Expando$Index, _elm_lang$virtual_dom$VirtualDom_Expando$Value, index),
								A2(
									_elm_lang$virtual_dom$VirtualDom_Expando$view,
									_elm_lang$core$Maybe$Just('value'),
									_p74)),
							_1: {ctor: '[]'}
						}
					});
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewRecordOpen = function (record) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{ctor: '[]'},
		A2(
			_elm_lang$core$List$map,
			_elm_lang$virtual_dom$VirtualDom_Expando$viewRecordEntry,
			_elm_lang$core$Dict$toList(record)));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewRecordEntry = function (_p75) {
	var _p76 = _p75;
	var _p77 = _p76._0;
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$map,
		_elm_lang$virtual_dom$VirtualDom_Expando$Field(_p77),
		A2(
			_elm_lang$virtual_dom$VirtualDom_Expando$view,
			_elm_lang$core$Maybe$Just(_p77),
			_p76._1));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewSequenceOpen = function (values) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{ctor: '[]'},
		A2(_elm_lang$core$List$indexedMap, _elm_lang$virtual_dom$VirtualDom_Expando$viewConstructorEntry, values));
};
var _elm_lang$virtual_dom$VirtualDom_Expando$viewDictionary = F3(
	function (maybeKey, isClosed, keyValuePairs) {
		var starter = A2(
			_elm_lang$core$Basics_ops['++'],
			'Dict(',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(
					_elm_lang$core$List$length(keyValuePairs)),
				')'));
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Expando$Toggle),
						_1: {ctor: '[]'}
					},
					A3(
						_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter,
						maybeKey,
						_elm_lang$core$Maybe$Just(isClosed),
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(starter),
							_1: {ctor: '[]'}
						})),
				_1: {
					ctor: '::',
					_0: isClosed ? _elm_lang$virtual_dom$VirtualDom_Helpers$text('') : _elm_lang$virtual_dom$VirtualDom_Expando$viewDictionaryOpen(keyValuePairs),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewRecord = F3(
	function (maybeKey, isClosed, record) {
		var _p78 = isClosed ? {
			ctor: '_Tuple3',
			_0: _elm_lang$core$Tuple$second(
				_elm_lang$virtual_dom$VirtualDom_Expando$viewTinyRecord(record)),
			_1: _elm_lang$virtual_dom$VirtualDom_Helpers$text(''),
			_2: _elm_lang$virtual_dom$VirtualDom_Helpers$text('')
		} : {
			ctor: '_Tuple3',
			_0: {
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('{'),
				_1: {ctor: '[]'}
			},
			_1: _elm_lang$virtual_dom$VirtualDom_Expando$viewRecordOpen(record),
			_2: A2(
				_elm_lang$virtual_dom$VirtualDom_Helpers$div,
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(
						_elm_lang$core$Maybe$Just(
							{ctor: '_Tuple0'})),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('}'),
					_1: {ctor: '[]'}
				})
		};
		var start = _p78._0;
		var middle = _p78._1;
		var end = _p78._2;
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Expando$Toggle),
						_1: {ctor: '[]'}
					},
					A3(
						_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter,
						maybeKey,
						_elm_lang$core$Maybe$Just(isClosed),
						start)),
				_1: {
					ctor: '::',
					_0: middle,
					_1: {
						ctor: '::',
						_0: end,
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Expando$viewSequence = F4(
	function (maybeKey, seqType, isClosed, valueList) {
		var starter = A2(
			_elm_lang$virtual_dom$VirtualDom_Expando$seqTypeToString,
			_elm_lang$core$List$length(valueList),
			seqType);
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Expando$leftPad(maybeKey),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Expando$Toggle),
						_1: {ctor: '[]'}
					},
					A3(
						_elm_lang$virtual_dom$VirtualDom_Expando$lineStarter,
						maybeKey,
						_elm_lang$core$Maybe$Just(isClosed),
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(starter),
							_1: {ctor: '[]'}
						})),
				_1: {
					ctor: '::',
					_0: isClosed ? _elm_lang$virtual_dom$VirtualDom_Helpers$text('') : _elm_lang$virtual_dom$VirtualDom_Expando$viewSequenceOpen(valueList),
					_1: {ctor: '[]'}
				}
			});
	});

var _elm_lang$virtual_dom$VirtualDom_Report$some = function (list) {
	return !_elm_lang$core$List$isEmpty(list);
};
var _elm_lang$virtual_dom$VirtualDom_Report$TagChanges = F4(
	function (a, b, c, d) {
		return {removed: a, changed: b, added: c, argsMatch: d};
	});
var _elm_lang$virtual_dom$VirtualDom_Report$emptyTagChanges = function (argsMatch) {
	return A4(
		_elm_lang$virtual_dom$VirtualDom_Report$TagChanges,
		{ctor: '[]'},
		{ctor: '[]'},
		{ctor: '[]'},
		argsMatch);
};
var _elm_lang$virtual_dom$VirtualDom_Report$hasTagChanges = function (tagChanges) {
	return _elm_lang$core$Native_Utils.eq(
		tagChanges,
		A4(
			_elm_lang$virtual_dom$VirtualDom_Report$TagChanges,
			{ctor: '[]'},
			{ctor: '[]'},
			{ctor: '[]'},
			true));
};
var _elm_lang$virtual_dom$VirtualDom_Report$SomethingChanged = function (a) {
	return {ctor: 'SomethingChanged', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Report$MessageChanged = F2(
	function (a, b) {
		return {ctor: 'MessageChanged', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Report$VersionChanged = F2(
	function (a, b) {
		return {ctor: 'VersionChanged', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Report$CorruptHistory = {ctor: 'CorruptHistory'};
var _elm_lang$virtual_dom$VirtualDom_Report$UnionChange = F2(
	function (a, b) {
		return {ctor: 'UnionChange', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Report$AliasChange = function (a) {
	return {ctor: 'AliasChange', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Report$Fine = {ctor: 'Fine'};
var _elm_lang$virtual_dom$VirtualDom_Report$Risky = {ctor: 'Risky'};
var _elm_lang$virtual_dom$VirtualDom_Report$Impossible = {ctor: 'Impossible'};
var _elm_lang$virtual_dom$VirtualDom_Report$worstCase = F2(
	function (status, statusList) {
		worstCase:
		while (true) {
			var _p0 = statusList;
			if (_p0.ctor === '[]') {
				return status;
			} else {
				switch (_p0._0.ctor) {
					case 'Impossible':
						return _elm_lang$virtual_dom$VirtualDom_Report$Impossible;
					case 'Risky':
						var _v1 = _elm_lang$virtual_dom$VirtualDom_Report$Risky,
							_v2 = _p0._1;
						status = _v1;
						statusList = _v2;
						continue worstCase;
					default:
						var _v3 = status,
							_v4 = _p0._1;
						status = _v3;
						statusList = _v4;
						continue worstCase;
				}
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Report$evaluateChange = function (change) {
	var _p1 = change;
	if (_p1.ctor === 'AliasChange') {
		return _elm_lang$virtual_dom$VirtualDom_Report$Impossible;
	} else {
		return ((!_p1._1.argsMatch) || (_elm_lang$virtual_dom$VirtualDom_Report$some(_p1._1.changed) || _elm_lang$virtual_dom$VirtualDom_Report$some(_p1._1.removed))) ? _elm_lang$virtual_dom$VirtualDom_Report$Impossible : (_elm_lang$virtual_dom$VirtualDom_Report$some(_p1._1.added) ? _elm_lang$virtual_dom$VirtualDom_Report$Risky : _elm_lang$virtual_dom$VirtualDom_Report$Fine);
	}
};
var _elm_lang$virtual_dom$VirtualDom_Report$evaluate = function (report) {
	var _p2 = report;
	switch (_p2.ctor) {
		case 'CorruptHistory':
			return _elm_lang$virtual_dom$VirtualDom_Report$Impossible;
		case 'VersionChanged':
			return _elm_lang$virtual_dom$VirtualDom_Report$Impossible;
		case 'MessageChanged':
			return _elm_lang$virtual_dom$VirtualDom_Report$Impossible;
		default:
			return A2(
				_elm_lang$virtual_dom$VirtualDom_Report$worstCase,
				_elm_lang$virtual_dom$VirtualDom_Report$Fine,
				A2(_elm_lang$core$List$map, _elm_lang$virtual_dom$VirtualDom_Report$evaluateChange, _p2._0));
	}
};

var _elm_lang$virtual_dom$VirtualDom_Metadata$encodeDict = F2(
	function (f, dict) {
		return _elm_lang$core$Json_Encode$object(
			_elm_lang$core$Dict$toList(
				A2(
					_elm_lang$core$Dict$map,
					F2(
						function (key, value) {
							return f(value);
						}),
					dict)));
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$encodeUnion = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'args',
				_1: _elm_lang$core$Json_Encode$list(
					A2(_elm_lang$core$List$map, _elm_lang$core$Json_Encode$string, _p1.args))
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'tags',
					_1: A2(
						_elm_lang$virtual_dom$VirtualDom_Metadata$encodeDict,
						function (_p2) {
							return _elm_lang$core$Json_Encode$list(
								A2(_elm_lang$core$List$map, _elm_lang$core$Json_Encode$string, _p2));
						},
						_p1.tags)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$encodeAlias = function (_p3) {
	var _p4 = _p3;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'args',
				_1: _elm_lang$core$Json_Encode$list(
					A2(_elm_lang$core$List$map, _elm_lang$core$Json_Encode$string, _p4.args))
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'type',
					_1: _elm_lang$core$Json_Encode$string(_p4.tipe)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$encodeTypes = function (_p5) {
	var _p6 = _p5;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'message',
				_1: _elm_lang$core$Json_Encode$string(_p6.message)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'aliases',
					_1: A2(_elm_lang$virtual_dom$VirtualDom_Metadata$encodeDict, _elm_lang$virtual_dom$VirtualDom_Metadata$encodeAlias, _p6.aliases)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'unions',
						_1: A2(_elm_lang$virtual_dom$VirtualDom_Metadata$encodeDict, _elm_lang$virtual_dom$VirtualDom_Metadata$encodeUnion, _p6.unions)
					},
					_1: {ctor: '[]'}
				}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$encodeVersions = function (_p7) {
	var _p8 = _p7;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'elm',
				_1: _elm_lang$core$Json_Encode$string(_p8.elm)
			},
			_1: {ctor: '[]'}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$encode = function (_p9) {
	var _p10 = _p9;
	return _elm_lang$core$Json_Encode$object(
		{
			ctor: '::',
			_0: {
				ctor: '_Tuple2',
				_0: 'versions',
				_1: _elm_lang$virtual_dom$VirtualDom_Metadata$encodeVersions(_p10.versions)
			},
			_1: {
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'types',
					_1: _elm_lang$virtual_dom$VirtualDom_Metadata$encodeTypes(_p10.types)
				},
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$checkTag = F4(
	function (tag, old, $new, changes) {
		return _elm_lang$core$Native_Utils.eq(old, $new) ? changes : _elm_lang$core$Native_Utils.update(
			changes,
			{
				changed: {ctor: '::', _0: tag, _1: changes.changed}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$addTag = F3(
	function (tag, _p11, changes) {
		return _elm_lang$core$Native_Utils.update(
			changes,
			{
				added: {ctor: '::', _0: tag, _1: changes.added}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$removeTag = F3(
	function (tag, _p12, changes) {
		return _elm_lang$core$Native_Utils.update(
			changes,
			{
				removed: {ctor: '::', _0: tag, _1: changes.removed}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$checkUnion = F4(
	function (name, old, $new, changes) {
		var tagChanges = A6(
			_elm_lang$core$Dict$merge,
			_elm_lang$virtual_dom$VirtualDom_Metadata$removeTag,
			_elm_lang$virtual_dom$VirtualDom_Metadata$checkTag,
			_elm_lang$virtual_dom$VirtualDom_Metadata$addTag,
			old.tags,
			$new.tags,
			_elm_lang$virtual_dom$VirtualDom_Report$emptyTagChanges(
				_elm_lang$core$Native_Utils.eq(old.args, $new.args)));
		return _elm_lang$virtual_dom$VirtualDom_Report$hasTagChanges(tagChanges) ? changes : {
			ctor: '::',
			_0: A2(_elm_lang$virtual_dom$VirtualDom_Report$UnionChange, name, tagChanges),
			_1: changes
		};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$checkAlias = F4(
	function (name, old, $new, changes) {
		return (_elm_lang$core$Native_Utils.eq(old.tipe, $new.tipe) && _elm_lang$core$Native_Utils.eq(old.args, $new.args)) ? changes : {
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Report$AliasChange(name),
			_1: changes
		};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$ignore = F3(
	function (key, value, report) {
		return report;
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$checkTypes = F2(
	function (old, $new) {
		return (!_elm_lang$core$Native_Utils.eq(old.message, $new.message)) ? A2(_elm_lang$virtual_dom$VirtualDom_Report$MessageChanged, old.message, $new.message) : _elm_lang$virtual_dom$VirtualDom_Report$SomethingChanged(
			A6(
				_elm_lang$core$Dict$merge,
				_elm_lang$virtual_dom$VirtualDom_Metadata$ignore,
				_elm_lang$virtual_dom$VirtualDom_Metadata$checkUnion,
				_elm_lang$virtual_dom$VirtualDom_Metadata$ignore,
				old.unions,
				$new.unions,
				A6(
					_elm_lang$core$Dict$merge,
					_elm_lang$virtual_dom$VirtualDom_Metadata$ignore,
					_elm_lang$virtual_dom$VirtualDom_Metadata$checkAlias,
					_elm_lang$virtual_dom$VirtualDom_Metadata$ignore,
					old.aliases,
					$new.aliases,
					{ctor: '[]'})));
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$check = F2(
	function (old, $new) {
		return (!_elm_lang$core$Native_Utils.eq(old.versions.elm, $new.versions.elm)) ? A2(_elm_lang$virtual_dom$VirtualDom_Report$VersionChanged, old.versions.elm, $new.versions.elm) : A2(_elm_lang$virtual_dom$VirtualDom_Metadata$checkTypes, old.types, $new.types);
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$hasProblem = F2(
	function (tipe, _p13) {
		var _p14 = _p13;
		return A2(_elm_lang$core$String$contains, _p14._1, tipe) ? _elm_lang$core$Maybe$Just(_p14._0) : _elm_lang$core$Maybe$Nothing;
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$Metadata = F2(
	function (a, b) {
		return {versions: a, types: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$Versions = function (a) {
	return {elm: a};
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$decodeVersions = A2(
	_elm_lang$core$Json_Decode$map,
	_elm_lang$virtual_dom$VirtualDom_Metadata$Versions,
	A2(_elm_lang$core$Json_Decode$field, 'elm', _elm_lang$core$Json_Decode$string));
var _elm_lang$virtual_dom$VirtualDom_Metadata$Types = F3(
	function (a, b, c) {
		return {message: a, aliases: b, unions: c};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$Alias = F2(
	function (a, b) {
		return {args: a, tipe: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$decodeAlias = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$virtual_dom$VirtualDom_Metadata$Alias,
	A2(
		_elm_lang$core$Json_Decode$field,
		'args',
		_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)),
	A2(_elm_lang$core$Json_Decode$field, 'type', _elm_lang$core$Json_Decode$string));
var _elm_lang$virtual_dom$VirtualDom_Metadata$Union = F2(
	function (a, b) {
		return {args: a, tags: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$decodeUnion = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$virtual_dom$VirtualDom_Metadata$Union,
	A2(
		_elm_lang$core$Json_Decode$field,
		'args',
		_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string)),
	A2(
		_elm_lang$core$Json_Decode$field,
		'tags',
		_elm_lang$core$Json_Decode$dict(
			_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$string))));
var _elm_lang$virtual_dom$VirtualDom_Metadata$decodeTypes = A4(
	_elm_lang$core$Json_Decode$map3,
	_elm_lang$virtual_dom$VirtualDom_Metadata$Types,
	A2(_elm_lang$core$Json_Decode$field, 'message', _elm_lang$core$Json_Decode$string),
	A2(
		_elm_lang$core$Json_Decode$field,
		'aliases',
		_elm_lang$core$Json_Decode$dict(_elm_lang$virtual_dom$VirtualDom_Metadata$decodeAlias)),
	A2(
		_elm_lang$core$Json_Decode$field,
		'unions',
		_elm_lang$core$Json_Decode$dict(_elm_lang$virtual_dom$VirtualDom_Metadata$decodeUnion)));
var _elm_lang$virtual_dom$VirtualDom_Metadata$decoder = A3(
	_elm_lang$core$Json_Decode$map2,
	_elm_lang$virtual_dom$VirtualDom_Metadata$Metadata,
	A2(_elm_lang$core$Json_Decode$field, 'versions', _elm_lang$virtual_dom$VirtualDom_Metadata$decodeVersions),
	A2(_elm_lang$core$Json_Decode$field, 'types', _elm_lang$virtual_dom$VirtualDom_Metadata$decodeTypes));
var _elm_lang$virtual_dom$VirtualDom_Metadata$Error = F2(
	function (a, b) {
		return {message: a, problems: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$ProblemType = F2(
	function (a, b) {
		return {name: a, problems: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$VirtualDom = {ctor: 'VirtualDom'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Program = {ctor: 'Program'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Request = {ctor: 'Request'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Socket = {ctor: 'Socket'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Process = {ctor: 'Process'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Task = {ctor: 'Task'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Decoder = {ctor: 'Decoder'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$Function = {ctor: 'Function'};
var _elm_lang$virtual_dom$VirtualDom_Metadata$problemTable = {
	ctor: '::',
	_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Function, _1: '->'},
	_1: {
		ctor: '::',
		_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Decoder, _1: 'Json.Decode.Decoder'},
		_1: {
			ctor: '::',
			_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Task, _1: 'Task.Task'},
			_1: {
				ctor: '::',
				_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Process, _1: 'Process.Id'},
				_1: {
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Socket, _1: 'WebSocket.LowLevel.WebSocket'},
					_1: {
						ctor: '::',
						_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Request, _1: 'Http.Request'},
						_1: {
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$Program, _1: 'Platform.Program'},
							_1: {
								ctor: '::',
								_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$VirtualDom, _1: 'VirtualDom.Node'},
								_1: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: _elm_lang$virtual_dom$VirtualDom_Metadata$VirtualDom, _1: 'VirtualDom.Attribute'},
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}
		}
	}
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$findProblems = function (tipe) {
	return A2(
		_elm_lang$core$List$filterMap,
		_elm_lang$virtual_dom$VirtualDom_Metadata$hasProblem(tipe),
		_elm_lang$virtual_dom$VirtualDom_Metadata$problemTable);
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$collectBadAliases = F3(
	function (name, _p15, list) {
		var _p16 = _p15;
		var _p17 = _elm_lang$virtual_dom$VirtualDom_Metadata$findProblems(_p16.tipe);
		if (_p17.ctor === '[]') {
			return list;
		} else {
			return {
				ctor: '::',
				_0: A2(_elm_lang$virtual_dom$VirtualDom_Metadata$ProblemType, name, _p17),
				_1: list
			};
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$collectBadUnions = F3(
	function (name, _p18, list) {
		var _p19 = _p18;
		var _p20 = A2(
			_elm_lang$core$List$concatMap,
			_elm_lang$virtual_dom$VirtualDom_Metadata$findProblems,
			_elm_lang$core$List$concat(
				_elm_lang$core$Dict$values(_p19.tags)));
		if (_p20.ctor === '[]') {
			return list;
		} else {
			return {
				ctor: '::',
				_0: A2(_elm_lang$virtual_dom$VirtualDom_Metadata$ProblemType, name, _p20),
				_1: list
			};
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Metadata$isPortable = function (_p21) {
	var _p22 = _p21;
	var _p24 = _p22.types;
	var badAliases = A3(
		_elm_lang$core$Dict$foldl,
		_elm_lang$virtual_dom$VirtualDom_Metadata$collectBadAliases,
		{ctor: '[]'},
		_p24.aliases);
	var _p23 = A3(_elm_lang$core$Dict$foldl, _elm_lang$virtual_dom$VirtualDom_Metadata$collectBadUnions, badAliases, _p24.unions);
	if (_p23.ctor === '[]') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Maybe$Just(
			A2(_elm_lang$virtual_dom$VirtualDom_Metadata$Error, _p24.message, _p23));
	}
};
var _elm_lang$virtual_dom$VirtualDom_Metadata$decode = function (value) {
	var _p25 = A2(_elm_lang$core$Json_Decode$decodeValue, _elm_lang$virtual_dom$VirtualDom_Metadata$decoder, value);
	if (_p25.ctor === 'Err') {
		return _elm_lang$core$Native_Utils.crashCase(
			'VirtualDom.Metadata',
			{
				start: {line: 229, column: 3},
				end: {line: 239, column: 20}
			},
			_p25)('Compiler is generating bad metadata. Report this at <https://github.com/elm-lang/virtual-dom/issues>.');
	} else {
		var _p28 = _p25._0;
		var _p27 = _elm_lang$virtual_dom$VirtualDom_Metadata$isPortable(_p28);
		if (_p27.ctor === 'Nothing') {
			return _elm_lang$core$Result$Ok(_p28);
		} else {
			return _elm_lang$core$Result$Err(_p27._0);
		}
	}
};

var _elm_lang$virtual_dom$VirtualDom_History$viewMessage = F3(
	function (currentIndex, index, msg) {
		var messageName = _elm_lang$virtual_dom$Native_Debug.messageToString(msg);
		var className = _elm_lang$core$Native_Utils.eq(currentIndex, index) ? 'messages-entry messages-entry-selected' : 'messages-entry';
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class(className),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$on,
						'click',
						_elm_lang$core$Json_Decode$succeed(index)),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$span,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('messages-entry-content'),
						_1: {
							ctor: '::',
							_0: A2(_elm_lang$virtual_dom$VirtualDom_Helpers$attribute, 'title', messageName),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(messageName),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('messages-entry-index'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
								_elm_lang$core$Basics$toString(index)),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_History$consMsg = F3(
	function (currentIndex, msg, _p0) {
		var _p1 = _p0;
		var _p2 = _p1._0;
		return {
			ctor: '_Tuple2',
			_0: _p2 - 1,
			_1: {
				ctor: '::',
				_0: A4(_elm_lang$virtual_dom$VirtualDom_Helpers$lazy3, _elm_lang$virtual_dom$VirtualDom_History$viewMessage, currentIndex, _p2, msg),
				_1: _p1._1
			}
		};
	});
var _elm_lang$virtual_dom$VirtualDom_History$viewSnapshot = F3(
	function (currentIndex, index, _p3) {
		var _p4 = _p3;
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{ctor: '[]'},
			_elm_lang$core$Tuple$second(
				A3(
					_elm_lang$core$Array$foldl,
					_elm_lang$virtual_dom$VirtualDom_History$consMsg(currentIndex),
					{
						ctor: '_Tuple2',
						_0: index - 1,
						_1: {ctor: '[]'}
					},
					_p4.messages)));
	});
var _elm_lang$virtual_dom$VirtualDom_History$undone = function (getResult) {
	var _p5 = getResult;
	if (_p5.ctor === 'Done') {
		return {ctor: '_Tuple2', _0: _p5._1, _1: _p5._0};
	} else {
		return _elm_lang$core$Native_Utils.crashCase(
			'VirtualDom.History',
			{
				start: {line: 195, column: 3},
				end: {line: 200, column: 39}
			},
			_p5)('Bug in History.get');
	}
};
var _elm_lang$virtual_dom$VirtualDom_History$elmToJs = _elm_lang$virtual_dom$Native_Debug.unsafeCoerce;
var _elm_lang$virtual_dom$VirtualDom_History$encodeHelp = F2(
	function (snapshot, allMessages) {
		return A3(
			_elm_lang$core$Array$foldl,
			F2(
				function (elm, msgs) {
					return {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_History$elmToJs(elm),
						_1: msgs
					};
				}),
			allMessages,
			snapshot.messages);
	});
var _elm_lang$virtual_dom$VirtualDom_History$encode = function (_p7) {
	var _p8 = _p7;
	var recentJson = A2(
		_elm_lang$core$List$map,
		_elm_lang$virtual_dom$VirtualDom_History$elmToJs,
		_elm_lang$core$List$reverse(_p8.recent.messages));
	return _elm_lang$core$Json_Encode$list(
		A3(_elm_lang$core$Array$foldr, _elm_lang$virtual_dom$VirtualDom_History$encodeHelp, recentJson, _p8.snapshots));
};
var _elm_lang$virtual_dom$VirtualDom_History$jsToElm = _elm_lang$virtual_dom$Native_Debug.unsafeCoerce;
var _elm_lang$virtual_dom$VirtualDom_History$initialModel = function (_p9) {
	var _p10 = _p9;
	var _p11 = A2(_elm_lang$core$Array$get, 0, _p10.snapshots);
	if (_p11.ctor === 'Just') {
		return _p11._0.model;
	} else {
		return _p10.recent.model;
	}
};
var _elm_lang$virtual_dom$VirtualDom_History$size = function (history) {
	return history.numMessages;
};
var _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize = 64;
var _elm_lang$virtual_dom$VirtualDom_History$consSnapshot = F3(
	function (currentIndex, snapshot, _p12) {
		var _p13 = _p12;
		var _p14 = _p13._0;
		var nextIndex = _p14 - _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize;
		var currentIndexHelp = ((_elm_lang$core$Native_Utils.cmp(nextIndex, currentIndex) < 1) && (_elm_lang$core$Native_Utils.cmp(currentIndex, _p14) < 0)) ? currentIndex : -1;
		return {
			ctor: '_Tuple2',
			_0: _p14 - _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize,
			_1: {
				ctor: '::',
				_0: A4(_elm_lang$virtual_dom$VirtualDom_Helpers$lazy3, _elm_lang$virtual_dom$VirtualDom_History$viewSnapshot, currentIndexHelp, _p14, snapshot),
				_1: _p13._1
			}
		};
	});
var _elm_lang$virtual_dom$VirtualDom_History$viewSnapshots = F2(
	function (currentIndex, snapshots) {
		var highIndex = _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize * _elm_lang$core$Array$length(snapshots);
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{ctor: '[]'},
			_elm_lang$core$Tuple$second(
				A3(
					_elm_lang$core$Array$foldr,
					_elm_lang$virtual_dom$VirtualDom_History$consSnapshot(currentIndex),
					{
						ctor: '_Tuple2',
						_0: highIndex,
						_1: {ctor: '[]'}
					},
					snapshots)));
	});
var _elm_lang$virtual_dom$VirtualDom_History$view = F2(
	function (maybeIndex, _p15) {
		var _p16 = _p15;
		var _p17 = function () {
			var _p18 = maybeIndex;
			if (_p18.ctor === 'Nothing') {
				return {ctor: '_Tuple2', _0: -1, _1: 'debugger-sidebar-messages'};
			} else {
				return {ctor: '_Tuple2', _0: _p18._0, _1: 'debugger-sidebar-messages-paused'};
			}
		}();
		var index = _p17._0;
		var className = _p17._1;
		var oldStuff = A3(_elm_lang$virtual_dom$VirtualDom_Helpers$lazy2, _elm_lang$virtual_dom$VirtualDom_History$viewSnapshots, index, _p16.snapshots);
		var newStuff = _elm_lang$core$Tuple$second(
			A3(
				_elm_lang$core$List$foldl,
				_elm_lang$virtual_dom$VirtualDom_History$consMsg(index),
				{
					ctor: '_Tuple2',
					_0: _p16.numMessages - 1,
					_1: {ctor: '[]'}
				},
				_p16.recent.messages));
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class(className),
				_1: {ctor: '[]'}
			},
			{ctor: '::', _0: oldStuff, _1: newStuff});
	});
var _elm_lang$virtual_dom$VirtualDom_History$History = F3(
	function (a, b, c) {
		return {snapshots: a, recent: b, numMessages: c};
	});
var _elm_lang$virtual_dom$VirtualDom_History$RecentHistory = F3(
	function (a, b, c) {
		return {model: a, messages: b, numMessages: c};
	});
var _elm_lang$virtual_dom$VirtualDom_History$empty = function (model) {
	return A3(
		_elm_lang$virtual_dom$VirtualDom_History$History,
		_elm_lang$core$Array$empty,
		A3(
			_elm_lang$virtual_dom$VirtualDom_History$RecentHistory,
			model,
			{ctor: '[]'},
			0),
		0);
};
var _elm_lang$virtual_dom$VirtualDom_History$Snapshot = F2(
	function (a, b) {
		return {model: a, messages: b};
	});
var _elm_lang$virtual_dom$VirtualDom_History$addRecent = F3(
	function (msg, newModel, _p19) {
		var _p20 = _p19;
		var _p23 = _p20.numMessages;
		var _p22 = _p20.model;
		var _p21 = _p20.messages;
		return _elm_lang$core$Native_Utils.eq(_p23, _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize) ? {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Maybe$Just(
				A2(
					_elm_lang$virtual_dom$VirtualDom_History$Snapshot,
					_p22,
					_elm_lang$core$Array$fromList(_p21))),
			_1: A3(
				_elm_lang$virtual_dom$VirtualDom_History$RecentHistory,
				newModel,
				{
					ctor: '::',
					_0: msg,
					_1: {ctor: '[]'}
				},
				1)
		} : {
			ctor: '_Tuple2',
			_0: _elm_lang$core$Maybe$Nothing,
			_1: A3(
				_elm_lang$virtual_dom$VirtualDom_History$RecentHistory,
				_p22,
				{ctor: '::', _0: msg, _1: _p21},
				_p23 + 1)
		};
	});
var _elm_lang$virtual_dom$VirtualDom_History$add = F3(
	function (msg, model, _p24) {
		var _p25 = _p24;
		var _p28 = _p25.snapshots;
		var _p27 = _p25.numMessages;
		var _p26 = A3(_elm_lang$virtual_dom$VirtualDom_History$addRecent, msg, model, _p25.recent);
		if (_p26._0.ctor === 'Just') {
			return A3(
				_elm_lang$virtual_dom$VirtualDom_History$History,
				A2(_elm_lang$core$Array$push, _p26._0._0, _p28),
				_p26._1,
				_p27 + 1);
		} else {
			return A3(_elm_lang$virtual_dom$VirtualDom_History$History, _p28, _p26._1, _p27 + 1);
		}
	});
var _elm_lang$virtual_dom$VirtualDom_History$decoder = F2(
	function (initialModel, update) {
		var addMessage = F2(
			function (rawMsg, _p29) {
				var _p30 = _p29;
				var _p31 = _p30._0;
				var msg = _elm_lang$virtual_dom$VirtualDom_History$jsToElm(rawMsg);
				return {
					ctor: '_Tuple2',
					_0: A2(update, msg, _p31),
					_1: A3(_elm_lang$virtual_dom$VirtualDom_History$add, msg, _p31, _p30._1)
				};
			});
		var updateModel = function (rawMsgs) {
			return A3(
				_elm_lang$core$List$foldl,
				addMessage,
				{
					ctor: '_Tuple2',
					_0: initialModel,
					_1: _elm_lang$virtual_dom$VirtualDom_History$empty(initialModel)
				},
				rawMsgs);
		};
		return A2(
			_elm_lang$core$Json_Decode$map,
			updateModel,
			_elm_lang$core$Json_Decode$list(_elm_lang$core$Json_Decode$value));
	});
var _elm_lang$virtual_dom$VirtualDom_History$Done = F2(
	function (a, b) {
		return {ctor: 'Done', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_History$Stepping = F2(
	function (a, b) {
		return {ctor: 'Stepping', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_History$getHelp = F3(
	function (update, msg, getResult) {
		var _p32 = getResult;
		if (_p32.ctor === 'Done') {
			return getResult;
		} else {
			var _p34 = _p32._0;
			var _p33 = _p32._1;
			return _elm_lang$core$Native_Utils.eq(_p34, 0) ? A2(
				_elm_lang$virtual_dom$VirtualDom_History$Done,
				msg,
				_elm_lang$core$Tuple$first(
					A2(update, msg, _p33))) : A2(
				_elm_lang$virtual_dom$VirtualDom_History$Stepping,
				_p34 - 1,
				_elm_lang$core$Tuple$first(
					A2(update, msg, _p33)));
		}
	});
var _elm_lang$virtual_dom$VirtualDom_History$get = F3(
	function (update, index, _p35) {
		var _p36 = _p35;
		var _p39 = _p36.recent;
		var snapshotMax = _p36.numMessages - _p39.numMessages;
		if (_elm_lang$core$Native_Utils.cmp(index, snapshotMax) > -1) {
			return _elm_lang$virtual_dom$VirtualDom_History$undone(
				A3(
					_elm_lang$core$List$foldr,
					_elm_lang$virtual_dom$VirtualDom_History$getHelp(update),
					A2(_elm_lang$virtual_dom$VirtualDom_History$Stepping, index - snapshotMax, _p39.model),
					_p39.messages));
		} else {
			var _p37 = A2(_elm_lang$core$Array$get, (index / _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize) | 0, _p36.snapshots);
			if (_p37.ctor === 'Nothing') {
				return _elm_lang$core$Native_Utils.crashCase(
					'VirtualDom.History',
					{
						start: {line: 165, column: 7},
						end: {line: 171, column: 95}
					},
					_p37)('UI should only let you ask for real indexes!');
			} else {
				return _elm_lang$virtual_dom$VirtualDom_History$undone(
					A3(
						_elm_lang$core$Array$foldr,
						_elm_lang$virtual_dom$VirtualDom_History$getHelp(update),
						A2(
							_elm_lang$virtual_dom$VirtualDom_History$Stepping,
							A2(_elm_lang$core$Basics$rem, index, _elm_lang$virtual_dom$VirtualDom_History$maxSnapshotSize),
							_p37._0.model),
						_p37._0.messages));
			}
		}
	});

var _elm_lang$virtual_dom$VirtualDom_Overlay$styles = A3(
	_elm_lang$virtual_dom$VirtualDom_Helpers$node,
	'style',
	{ctor: '[]'},
	{
		ctor: '::',
		_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('\n\n.elm-overlay {\n  position: fixed;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  color: white;\n  pointer-events: none;\n  font-family: \'Trebuchet MS\', \'Lucida Grande\', \'Bitstream Vera Sans\', \'Helvetica Neue\', sans-serif;\n}\n\n.elm-overlay-resume {\n  width: 100%;\n  height: 100%;\n  cursor: pointer;\n  text-align: center;\n  pointer-events: auto;\n  background-color: rgba(200, 200, 200, 0.7);\n}\n\n.elm-overlay-resume-words {\n  position: absolute;\n  top: calc(50% - 40px);\n  font-size: 80px;\n  line-height: 80px;\n  height: 80px;\n  width: 100%;\n}\n\n.elm-mini-controls {\n  position: fixed;\n  bottom: 0;\n  right: 6px;\n  border-radius: 4px;\n  background-color: rgb(61, 61, 61);\n  font-family: monospace;\n  pointer-events: auto;\n}\n\n.elm-mini-controls-button {\n  padding: 6px;\n  cursor: pointer;\n  text-align: center;\n  min-width: 24ch;\n}\n\n.elm-mini-controls-import-export {\n  padding: 4px 0;\n  font-size: 0.8em;\n  text-align: center;\n  background-color: rgb(50, 50, 50);\n}\n\n.elm-overlay-message {\n  position: absolute;\n  width: 600px;\n  height: 100%;\n  padding-left: calc(50% - 300px);\n  padding-right: calc(50% - 300px);\n  background-color: rgba(200, 200, 200, 0.7);\n  pointer-events: auto;\n}\n\n.elm-overlay-message-title {\n  font-size: 36px;\n  height: 80px;\n  background-color: rgb(50, 50, 50);\n  padding-left: 22px;\n  vertical-align: middle;\n  line-height: 80px;\n}\n\n.elm-overlay-message-details {\n  padding: 8px 20px;\n  overflow-y: auto;\n  max-height: calc(100% - 156px);\n  background-color: rgb(61, 61, 61);\n}\n\n.elm-overlay-message-details-type {\n  font-size: 1.5em;\n}\n\n.elm-overlay-message-details ul {\n  list-style-type: none;\n  padding-left: 20px;\n}\n\n.elm-overlay-message-details ul ul {\n  list-style-type: disc;\n  padding-left: 2em;\n}\n\n.elm-overlay-message-details li {\n  margin: 8px 0;\n}\n\n.elm-overlay-message-buttons {\n  height: 60px;\n  line-height: 60px;\n  text-align: right;\n  background-color: rgb(50, 50, 50);\n}\n\n.elm-overlay-message-buttons button {\n  margin-right: 20px;\n}\n\n'),
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$button = F2(
	function (msg, label) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$span,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(msg),
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'cursor', _1: 'pointer'},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(label),
				_1: {ctor: '[]'}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewImportExport = F3(
	function (props, importMsg, exportMsg) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			props,
			{
				ctor: '::',
				_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$button, importMsg, 'Import'),
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' / '),
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$button, exportMsg, 'Export'),
						_1: {ctor: '[]'}
					}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewMiniControls = F2(
	function (config, numMsgs) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-mini-controls'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(config.open),
						_1: {
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-mini-controls-button'),
							_1: {ctor: '[]'}
						}
					},
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'Explore History (',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(numMsgs),
									')'))),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom_Overlay$viewImportExport,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-mini-controls-import-export'),
							_1: {ctor: '[]'}
						},
						config.importHistory,
						config.exportHistory),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$addCommas = function (items) {
	var _p0 = items;
	if (_p0.ctor === '[]') {
		return '';
	} else {
		if (_p0._1.ctor === '[]') {
			return _p0._0;
		} else {
			if (_p0._1._1.ctor === '[]') {
				return A2(
					_elm_lang$core$Basics_ops['++'],
					_p0._0,
					A2(_elm_lang$core$Basics_ops['++'], ' and ', _p0._1._0));
			} else {
				return A2(
					_elm_lang$core$String$join,
					', ',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_p0._1,
						{
							ctor: '::',
							_0: A2(_elm_lang$core$Basics_ops['++'], ' and ', _p0._0),
							_1: {ctor: '[]'}
						}));
			}
		}
	}
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$problemToString = function (problem) {
	var _p1 = problem;
	switch (_p1.ctor) {
		case 'Function':
			return 'functions';
		case 'Decoder':
			return 'JSON decoders';
		case 'Task':
			return 'tasks';
		case 'Process':
			return 'processes';
		case 'Socket':
			return 'web sockets';
		case 'Request':
			return 'HTTP requests';
		case 'Program':
			return 'programs';
		default:
			return 'virtual DOM values';
	}
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$goodNews2 = '\nfunction can pattern match on that data and call whatever functions, JSON\ndecoders, etc. you need. This makes the code much more explicit and easy to\nfollow for other readers (or you in a few months!)\n';
var _elm_lang$virtual_dom$VirtualDom_Overlay$goodNews1 = '\nThe good news is that having values like this in your message type is not\nso great in the long run. You are better off using simpler data, like\n';
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode = function (name) {
	return A3(
		_elm_lang$virtual_dom$VirtualDom_Helpers$node,
		'code',
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(name),
			_1: {ctor: '[]'}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewMention = F2(
	function (tags, verbed) {
		var _p2 = A2(
			_elm_lang$core$List$map,
			_elm_lang$virtual_dom$VirtualDom_Overlay$viewCode,
			_elm_lang$core$List$reverse(tags));
		if (_p2.ctor === '[]') {
			return _elm_lang$virtual_dom$VirtualDom_Helpers$text('');
		} else {
			if (_p2._1.ctor === '[]') {
				return A3(
					_elm_lang$virtual_dom$VirtualDom_Helpers$node,
					'li',
					{ctor: '[]'},
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(verbed),
						_1: {
							ctor: '::',
							_0: _p2._0,
							_1: {
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('.'),
								_1: {ctor: '[]'}
							}
						}
					});
			} else {
				if (_p2._1._1.ctor === '[]') {
					return A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'li',
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(verbed),
							_1: {
								ctor: '::',
								_0: _p2._1._0,
								_1: {
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' and '),
									_1: {
										ctor: '::',
										_0: _p2._0,
										_1: {
											ctor: '::',
											_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('.'),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						});
				} else {
					return A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'li',
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(verbed),
							_1: A2(
								_elm_lang$core$Basics_ops['++'],
								A2(
									_elm_lang$core$List$intersperse,
									_elm_lang$virtual_dom$VirtualDom_Helpers$text(', '),
									_elm_lang$core$List$reverse(_p2._1)),
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(', and '),
									_1: {
										ctor: '::',
										_0: _p2._0,
										_1: {
											ctor: '::',
											_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('.'),
											_1: {ctor: '[]'}
										}
									}
								})
						});
				}
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewChange = function (change) {
	return A3(
		_elm_lang$virtual_dom$VirtualDom_Helpers$node,
		'li',
		{ctor: '[]'},
		function () {
			var _p3 = change;
			if (_p3.ctor === 'AliasChange') {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message-details-type'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p3._0),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				};
			} else {
				return {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$span,
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message-details-type'),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p3._0),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_elm_lang$virtual_dom$VirtualDom_Helpers$node,
							'ul',
							{ctor: '[]'},
							{
								ctor: '::',
								_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewMention, _p3._1.removed, 'Removed '),
								_1: {
									ctor: '::',
									_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewMention, _p3._1.changed, 'Changed '),
									_1: {
										ctor: '::',
										_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewMention, _p3._1.added, 'Added '),
										_1: {ctor: '[]'}
									}
								}
							}),
						_1: {
							ctor: '::',
							_0: _p3._1.argsMatch ? _elm_lang$virtual_dom$VirtualDom_Helpers$text('') : _elm_lang$virtual_dom$VirtualDom_Helpers$text('This may be due to the fact that the type variable names changed.'),
							_1: {ctor: '[]'}
						}
					}
				};
			}
		}());
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewProblemType = function (_p4) {
	var _p5 = _p4;
	return A3(
		_elm_lang$virtual_dom$VirtualDom_Helpers$node,
		'li',
		{ctor: '[]'},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p5.name),
			_1: {
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
					A2(
						_elm_lang$core$Basics_ops['++'],
						' can contain ',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$virtual_dom$VirtualDom_Overlay$addCommas(
								A2(_elm_lang$core$List$map, _elm_lang$virtual_dom$VirtualDom_Overlay$problemToString, _p5.problems)),
							'.'))),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewBadMetadata = function (_p6) {
	var _p7 = _p6;
	return {
		ctor: '::',
		_0: A3(
			_elm_lang$virtual_dom$VirtualDom_Helpers$node,
			'p',
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('The '),
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p7.message),
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' type of your program cannot be reliably serialized for history files.'),
						_1: {ctor: '[]'}
					}
				}
			}),
		_1: {
			ctor: '::',
			_0: A3(
				_elm_lang$virtual_dom$VirtualDom_Helpers$node,
				'p',
				{ctor: '[]'},
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('Functions cannot be serialized, nor can values that contain functions. This is a problem in these places:'),
					_1: {ctor: '[]'}
				}),
			_1: {
				ctor: '::',
				_0: A3(
					_elm_lang$virtual_dom$VirtualDom_Helpers$node,
					'ul',
					{ctor: '[]'},
					A2(_elm_lang$core$List$map, _elm_lang$virtual_dom$VirtualDom_Overlay$viewProblemType, _p7.problems)),
				_1: {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'p',
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_elm_lang$virtual_dom$VirtualDom_Overlay$goodNews1),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$a,
									{
										ctor: '::',
										_0: _elm_lang$virtual_dom$VirtualDom_Helpers$href('https://guide.elm-lang.org/types/union_types.html'),
										_1: {ctor: '[]'}
									},
									{
										ctor: '::',
										_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('union types'),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(', in your messages. From there, your '),
									_1: {
										ctor: '::',
										_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode('update'),
										_1: {
											ctor: '::',
											_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_elm_lang$virtual_dom$VirtualDom_Overlay$goodNews2),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}),
					_1: {ctor: '[]'}
				}
			}
		}
	};
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$explanationRisky = '\nThis history seems old. It will work with this program, but some\nmessages have been added since the history was created:\n';
var _elm_lang$virtual_dom$VirtualDom_Overlay$explanationBad = '\nThe messages in this history do not match the messages handled by your\nprogram. I noticed changes in the following types:\n';
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewReport = F2(
	function (isBad, report) {
		var _p8 = report;
		switch (_p8.ctor) {
			case 'CorruptHistory':
				return {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('Looks like this history file is corrupt. I cannot understand it.'),
					_1: {ctor: '[]'}
				};
			case 'VersionChanged':
				return {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
						A2(
							_elm_lang$core$Basics_ops['++'],
							'This history was created with Elm ',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_p8._0,
								A2(
									_elm_lang$core$Basics_ops['++'],
									', but you are using Elm ',
									A2(_elm_lang$core$Basics_ops['++'], _p8._1, ' right now.'))))),
					_1: {ctor: '[]'}
				};
			case 'MessageChanged':
				return {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
						A2(_elm_lang$core$Basics_ops['++'], 'To import some other history, the overall message type must', ' be the same. The old history has ')),
					_1: {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p8._0),
						_1: {
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' messages, but the new program works with '),
							_1: {
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewCode(_p8._1),
								_1: {
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' messages.'),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				};
			default:
				return {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'p',
						{ctor: '[]'},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(
								isBad ? _elm_lang$virtual_dom$VirtualDom_Overlay$explanationBad : _elm_lang$virtual_dom$VirtualDom_Overlay$explanationRisky),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_elm_lang$virtual_dom$VirtualDom_Helpers$node,
							'ul',
							{ctor: '[]'},
							A2(_elm_lang$core$List$map, _elm_lang$virtual_dom$VirtualDom_Overlay$viewChange, _p8._0)),
						_1: {ctor: '[]'}
					}
				};
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewResume = function (config) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-resume'),
			_1: {
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(config.resume),
				_1: {ctor: '[]'}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_elm_lang$virtual_dom$VirtualDom_Helpers$div,
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-resume-words'),
					_1: {ctor: '[]'}
				},
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('Click to Resume'),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$uploadDecoder = A3(
	_elm_lang$core$Json_Decode$map2,
	F2(
		function (v0, v1) {
			return {ctor: '_Tuple2', _0: v0, _1: v1};
		}),
	A2(_elm_lang$core$Json_Decode$field, 'metadata', _elm_lang$virtual_dom$VirtualDom_Metadata$decoder),
	A2(_elm_lang$core$Json_Decode$field, 'history', _elm_lang$core$Json_Decode$value));
var _elm_lang$virtual_dom$VirtualDom_Overlay$close = F2(
	function (msg, state) {
		var _p9 = state;
		switch (_p9.ctor) {
			case 'None':
				return _elm_lang$core$Maybe$Nothing;
			case 'BadMetadata':
				return _elm_lang$core$Maybe$Nothing;
			case 'BadImport':
				return _elm_lang$core$Maybe$Nothing;
			default:
				var _p10 = msg;
				if (_p10.ctor === 'Cancel') {
					return _elm_lang$core$Maybe$Nothing;
				} else {
					return _elm_lang$core$Maybe$Just(_p9._1);
				}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$isBlocking = function (state) {
	var _p11 = state;
	if (_p11.ctor === 'None') {
		return false;
	} else {
		return true;
	}
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$Config = F5(
	function (a, b, c, d, e) {
		return {resume: a, open: b, importHistory: c, exportHistory: d, wrap: e};
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$RiskyImport = F2(
	function (a, b) {
		return {ctor: 'RiskyImport', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$BadImport = function (a) {
	return {ctor: 'BadImport', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$corruptImport = _elm_lang$virtual_dom$VirtualDom_Overlay$BadImport(_elm_lang$virtual_dom$VirtualDom_Report$CorruptHistory);
var _elm_lang$virtual_dom$VirtualDom_Overlay$assessImport = F2(
	function (metadata, jsonString) {
		var _p12 = A2(_elm_lang$core$Json_Decode$decodeString, _elm_lang$virtual_dom$VirtualDom_Overlay$uploadDecoder, jsonString);
		if (_p12.ctor === 'Err') {
			return _elm_lang$core$Result$Err(_elm_lang$virtual_dom$VirtualDom_Overlay$corruptImport);
		} else {
			var _p14 = _p12._0._1;
			var report = A2(_elm_lang$virtual_dom$VirtualDom_Metadata$check, _p12._0._0, metadata);
			var _p13 = _elm_lang$virtual_dom$VirtualDom_Report$evaluate(report);
			switch (_p13.ctor) {
				case 'Impossible':
					return _elm_lang$core$Result$Err(
						_elm_lang$virtual_dom$VirtualDom_Overlay$BadImport(report));
				case 'Risky':
					return _elm_lang$core$Result$Err(
						A2(_elm_lang$virtual_dom$VirtualDom_Overlay$RiskyImport, report, _p14));
				default:
					return _elm_lang$core$Result$Ok(_p14);
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$BadMetadata = function (a) {
	return {ctor: 'BadMetadata', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$badMetadata = _elm_lang$virtual_dom$VirtualDom_Overlay$BadMetadata;
var _elm_lang$virtual_dom$VirtualDom_Overlay$None = {ctor: 'None'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$none = _elm_lang$virtual_dom$VirtualDom_Overlay$None;
var _elm_lang$virtual_dom$VirtualDom_Overlay$Proceed = {ctor: 'Proceed'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$Cancel = {ctor: 'Cancel'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewButtons = function (buttons) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message-buttons'),
			_1: {ctor: '[]'}
		},
		function () {
			var _p15 = buttons;
			if (_p15.ctor === 'Accept') {
				return {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'button',
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Overlay$Proceed),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p15._0),
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				};
			} else {
				return {
					ctor: '::',
					_0: A3(
						_elm_lang$virtual_dom$VirtualDom_Helpers$node,
						'button',
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Overlay$Cancel),
							_1: {ctor: '[]'}
						},
						{
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p15._0),
							_1: {ctor: '[]'}
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_elm_lang$virtual_dom$VirtualDom_Helpers$node,
							'button',
							{
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Overlay$Proceed),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(_p15._1),
								_1: {ctor: '[]'}
							}),
						_1: {ctor: '[]'}
					}
				};
			}
		}());
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$Message = {ctor: 'Message'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewMessage = F4(
	function (config, title, details, buttons) {
		return {
			ctor: '_Tuple2',
			_0: _elm_lang$virtual_dom$VirtualDom_Overlay$Message,
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(
							_elm_lang$virtual_dom$VirtualDom_Helpers$div,
							{
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message-title'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(title),
								_1: {ctor: '[]'}
							}),
						_1: {
							ctor: '::',
							_0: A2(
								_elm_lang$virtual_dom$VirtualDom_Helpers$div,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay-message-details'),
									_1: {ctor: '[]'}
								},
								details),
							_1: {
								ctor: '::',
								_0: A2(
									_elm_lang$virtual_dom$VirtualDom_Helpers$map,
									config.wrap,
									_elm_lang$virtual_dom$VirtualDom_Overlay$viewButtons(buttons)),
								_1: {ctor: '[]'}
							}
						}
					}),
				_1: {ctor: '[]'}
			}
		};
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$Pause = {ctor: 'Pause'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$Normal = {ctor: 'Normal'};
var _elm_lang$virtual_dom$VirtualDom_Overlay$Choose = F2(
	function (a, b) {
		return {ctor: 'Choose', _0: a, _1: b};
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$Accept = function (a) {
	return {ctor: 'Accept', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Overlay$viewHelp = F5(
	function (config, isPaused, isOpen, numMsgs, state) {
		var _p16 = state;
		switch (_p16.ctor) {
			case 'None':
				var miniControls = isOpen ? {ctor: '[]'} : {
					ctor: '::',
					_0: A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewMiniControls, config, numMsgs),
					_1: {ctor: '[]'}
				};
				return {
					ctor: '_Tuple2',
					_0: isPaused ? _elm_lang$virtual_dom$VirtualDom_Overlay$Pause : _elm_lang$virtual_dom$VirtualDom_Overlay$Normal,
					_1: (isPaused && (!isOpen)) ? {
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Overlay$viewResume(config),
						_1: miniControls
					} : miniControls
				};
			case 'BadMetadata':
				return A4(
					_elm_lang$virtual_dom$VirtualDom_Overlay$viewMessage,
					config,
					'Cannot use Import or Export',
					_elm_lang$virtual_dom$VirtualDom_Overlay$viewBadMetadata(_p16._0),
					_elm_lang$virtual_dom$VirtualDom_Overlay$Accept('Ok'));
			case 'BadImport':
				return A4(
					_elm_lang$virtual_dom$VirtualDom_Overlay$viewMessage,
					config,
					'Cannot Import History',
					A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewReport, true, _p16._0),
					_elm_lang$virtual_dom$VirtualDom_Overlay$Accept('Ok'));
			default:
				return A4(
					_elm_lang$virtual_dom$VirtualDom_Overlay$viewMessage,
					config,
					'Warning',
					A2(_elm_lang$virtual_dom$VirtualDom_Overlay$viewReport, false, _p16._0),
					A2(_elm_lang$virtual_dom$VirtualDom_Overlay$Choose, 'Cancel', 'Import Anyway'));
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Overlay$view = F5(
	function (config, isPaused, isOpen, numMsgs, state) {
		var _p17 = A5(_elm_lang$virtual_dom$VirtualDom_Overlay$viewHelp, config, isPaused, isOpen, numMsgs, state);
		var block = _p17._0;
		var nodes = _p17._1;
		return {
			ctor: '_Tuple2',
			_0: block,
			_1: A2(
				_elm_lang$virtual_dom$VirtualDom_Helpers$div,
				{
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('elm-overlay'),
					_1: {ctor: '[]'}
				},
				{ctor: '::', _0: _elm_lang$virtual_dom$VirtualDom_Overlay$styles, _1: nodes})
		};
	});

var _elm_lang$virtual_dom$VirtualDom_Debug$styles = A3(
	_elm_lang$virtual_dom$VirtualDom_Helpers$node,
	'style',
	{ctor: '[]'},
	{
		ctor: '::',
		_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('\n\nhtml {\n    overflow: hidden;\n    height: 100%;\n}\n\nbody {\n    height: 100%;\n    overflow: auto;\n}\n\n#debugger {\n  width: 100%\n  height: 100%;\n  font-family: monospace;\n}\n\n#values {\n  display: block;\n  float: left;\n  height: 100%;\n  width: calc(100% - 30ch);\n  margin: 0;\n  overflow: auto;\n  cursor: default;\n}\n\n.debugger-sidebar {\n  display: block;\n  float: left;\n  width: 30ch;\n  height: 100%;\n  color: white;\n  background-color: rgb(61, 61, 61);\n}\n\n.debugger-sidebar-controls {\n  width: 100%;\n  text-align: center;\n  background-color: rgb(50, 50, 50);\n}\n\n.debugger-sidebar-controls-import-export {\n  width: 100%;\n  height: 24px;\n  line-height: 24px;\n  font-size: 12px;\n}\n\n.debugger-sidebar-controls-resume {\n  width: 100%;\n  height: 30px;\n  line-height: 30px;\n  cursor: pointer;\n}\n\n.debugger-sidebar-controls-resume:hover {\n  background-color: rgb(41, 41, 41);\n}\n\n.debugger-sidebar-messages {\n  width: 100%;\n  overflow-y: auto;\n  height: calc(100% - 24px);\n}\n\n.debugger-sidebar-messages-paused {\n  width: 100%;\n  overflow-y: auto;\n  height: calc(100% - 54px);\n}\n\n.messages-entry {\n  cursor: pointer;\n  width: 100%;\n}\n\n.messages-entry:hover {\n  background-color: rgb(41, 41, 41);\n}\n\n.messages-entry-selected, .messages-entry-selected:hover {\n  background-color: rgb(10, 10, 10);\n}\n\n.messages-entry-content {\n  width: calc(100% - 7ch);\n  padding-top: 4px;\n  padding-bottom: 4px;\n  padding-left: 1ch;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  overflow: hidden;\n  display: inline-block;\n}\n\n.messages-entry-index {\n  color: #666;\n  width: 5ch;\n  padding-top: 4px;\n  padding-bottom: 4px;\n  padding-right: 1ch;\n  text-align: right;\n  display: block;\n  float: right;\n}\n\n'),
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$button = F2(
	function (msg, label) {
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$span,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(msg),
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Helpers$style(
						{
							ctor: '::',
							_0: {ctor: '_Tuple2', _0: 'cursor', _1: 'pointer'},
							_1: {ctor: '[]'}
						}),
					_1: {ctor: '[]'}
				}
			},
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(label),
				_1: {ctor: '[]'}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$getLatestModel = function (state) {
	var _p0 = state;
	if (_p0.ctor === 'Running') {
		return _p0._0;
	} else {
		return _p0._2;
	}
};
var _elm_lang$virtual_dom$VirtualDom_Debug$withGoodMetadata = F2(
	function (model, func) {
		var _p1 = model.metadata;
		if (_p1.ctor === 'Ok') {
			return func(_p1._0);
		} else {
			return A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_elm_lang$core$Native_Utils.update(
					model,
					{
						overlay: _elm_lang$virtual_dom$VirtualDom_Overlay$badMetadata(_p1._0)
					}),
				{ctor: '[]'});
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$Model = F6(
	function (a, b, c, d, e, f) {
		return {history: a, state: b, expando: c, metadata: d, overlay: e, isDebuggerOpen: f};
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$Paused = F3(
	function (a, b, c) {
		return {ctor: 'Paused', _0: a, _1: b, _2: c};
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$Running = function (a) {
	return {ctor: 'Running', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$loadNewHistory = F3(
	function (rawHistory, userUpdate, model) {
		var pureUserUpdate = F2(
			function (msg, userModel) {
				return _elm_lang$core$Tuple$first(
					A2(userUpdate, msg, userModel));
			});
		var initialUserModel = _elm_lang$virtual_dom$VirtualDom_History$initialModel(model.history);
		var decoder = A2(_elm_lang$virtual_dom$VirtualDom_History$decoder, initialUserModel, pureUserUpdate);
		var _p2 = A2(_elm_lang$core$Json_Decode$decodeValue, decoder, rawHistory);
		if (_p2.ctor === 'Err') {
			return A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_elm_lang$core$Native_Utils.update(
					model,
					{overlay: _elm_lang$virtual_dom$VirtualDom_Overlay$corruptImport}),
				{ctor: '[]'});
		} else {
			var _p3 = _p2._0._0;
			return A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_elm_lang$core$Native_Utils.update(
					model,
					{
						history: _p2._0._1,
						state: _elm_lang$virtual_dom$VirtualDom_Debug$Running(_p3),
						expando: _elm_lang$virtual_dom$VirtualDom_Expando$init(_p3),
						overlay: _elm_lang$virtual_dom$VirtualDom_Overlay$none
					}),
				{ctor: '[]'});
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$OverlayMsg = function (a) {
	return {ctor: 'OverlayMsg', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$Upload = function (a) {
	return {ctor: 'Upload', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$upload = A2(_elm_lang$core$Task$perform, _elm_lang$virtual_dom$VirtualDom_Debug$Upload, _elm_lang$virtual_dom$Native_Debug.upload);
var _elm_lang$virtual_dom$VirtualDom_Debug$Export = {ctor: 'Export'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Import = {ctor: 'Import'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Down = {ctor: 'Down'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Up = {ctor: 'Up'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Close = {ctor: 'Close'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Open = {ctor: 'Open'};
var _elm_lang$virtual_dom$VirtualDom_Debug$Jump = function (a) {
	return {ctor: 'Jump', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$Resume = {ctor: 'Resume'};
var _elm_lang$virtual_dom$VirtualDom_Debug$overlayConfig = {resume: _elm_lang$virtual_dom$VirtualDom_Debug$Resume, open: _elm_lang$virtual_dom$VirtualDom_Debug$Open, importHistory: _elm_lang$virtual_dom$VirtualDom_Debug$Import, exportHistory: _elm_lang$virtual_dom$VirtualDom_Debug$Export, wrap: _elm_lang$virtual_dom$VirtualDom_Debug$OverlayMsg};
var _elm_lang$virtual_dom$VirtualDom_Debug$viewIn = function (_p4) {
	var _p5 = _p4;
	var isPaused = function () {
		var _p6 = _p5.state;
		if (_p6.ctor === 'Running') {
			return false;
		} else {
			return true;
		}
	}();
	return A5(
		_elm_lang$virtual_dom$VirtualDom_Overlay$view,
		_elm_lang$virtual_dom$VirtualDom_Debug$overlayConfig,
		isPaused,
		_p5.isDebuggerOpen,
		_elm_lang$virtual_dom$VirtualDom_History$size(_p5.history),
		_p5.overlay);
};
var _elm_lang$virtual_dom$VirtualDom_Debug$resumeButton = A2(
	_elm_lang$virtual_dom$VirtualDom_Helpers$div,
	{
		ctor: '::',
		_0: _elm_lang$virtual_dom$VirtualDom_Helpers$onClick(_elm_lang$virtual_dom$VirtualDom_Debug$Resume),
		_1: {
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('debugger-sidebar-controls-resume'),
			_1: {ctor: '[]'}
		}
	},
	{
		ctor: '::',
		_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text('Resume'),
		_1: {ctor: '[]'}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$viewResumeButton = function (maybeIndex) {
	var _p7 = maybeIndex;
	if (_p7.ctor === 'Nothing') {
		return _elm_lang$virtual_dom$VirtualDom_Helpers$text('');
	} else {
		return _elm_lang$virtual_dom$VirtualDom_Debug$resumeButton;
	}
};
var _elm_lang$virtual_dom$VirtualDom_Debug$playButton = function (maybeIndex) {
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('debugger-sidebar-controls'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Debug$viewResumeButton(maybeIndex),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$div,
					{
						ctor: '::',
						_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('debugger-sidebar-controls-import-export'),
						_1: {ctor: '[]'}
					},
					{
						ctor: '::',
						_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$button, _elm_lang$virtual_dom$VirtualDom_Debug$Import, 'Import'),
						_1: {
							ctor: '::',
							_0: _elm_lang$virtual_dom$VirtualDom_Helpers$text(' / '),
							_1: {
								ctor: '::',
								_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$button, _elm_lang$virtual_dom$VirtualDom_Debug$Export, 'Export'),
								_1: {ctor: '[]'}
							}
						}
					}),
				_1: {ctor: '[]'}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Debug$viewSidebar = F2(
	function (state, history) {
		var maybeIndex = function () {
			var _p8 = state;
			if (_p8.ctor === 'Running') {
				return _elm_lang$core$Maybe$Nothing;
			} else {
				return _elm_lang$core$Maybe$Just(_p8._0);
			}
		}();
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$div,
			{
				ctor: '::',
				_0: _elm_lang$virtual_dom$VirtualDom_Helpers$class('debugger-sidebar'),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: A2(
					_elm_lang$virtual_dom$VirtualDom_Helpers$map,
					_elm_lang$virtual_dom$VirtualDom_Debug$Jump,
					A2(_elm_lang$virtual_dom$VirtualDom_History$view, maybeIndex, history)),
				_1: {
					ctor: '::',
					_0: _elm_lang$virtual_dom$VirtualDom_Debug$playButton(maybeIndex),
					_1: {ctor: '[]'}
				}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$ExpandoMsg = function (a) {
	return {ctor: 'ExpandoMsg', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$viewOut = function (_p9) {
	var _p10 = _p9;
	return A2(
		_elm_lang$virtual_dom$VirtualDom_Helpers$div,
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Helpers$id('debugger'),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom_Debug$styles,
			_1: {
				ctor: '::',
				_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$viewSidebar, _p10.state, _p10.history),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$virtual_dom$VirtualDom_Helpers$map,
						_elm_lang$virtual_dom$VirtualDom_Debug$ExpandoMsg,
						A2(
							_elm_lang$virtual_dom$VirtualDom_Helpers$div,
							{
								ctor: '::',
								_0: _elm_lang$virtual_dom$VirtualDom_Helpers$id('values'),
								_1: {ctor: '[]'}
							},
							{
								ctor: '::',
								_0: A2(_elm_lang$virtual_dom$VirtualDom_Expando$view, _elm_lang$core$Maybe$Nothing, _p10.expando),
								_1: {ctor: '[]'}
							})),
					_1: {ctor: '[]'}
				}
			}
		});
};
var _elm_lang$virtual_dom$VirtualDom_Debug$UserMsg = function (a) {
	return {ctor: 'UserMsg', _0: a};
};
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapInit = F2(
	function (metadata, _p11) {
		var _p12 = _p11;
		var _p13 = _p12._0;
		return A2(
			_elm_lang$core$Platform_Cmd_ops['!'],
			{
				history: _elm_lang$virtual_dom$VirtualDom_History$empty(_p13),
				state: _elm_lang$virtual_dom$VirtualDom_Debug$Running(_p13),
				expando: _elm_lang$virtual_dom$VirtualDom_Expando$init(_p13),
				metadata: _elm_lang$virtual_dom$VirtualDom_Metadata$decode(metadata),
				overlay: _elm_lang$virtual_dom$VirtualDom_Overlay$none,
				isDebuggerOpen: false
			},
			{
				ctor: '::',
				_0: A2(_elm_lang$core$Platform_Cmd$map, _elm_lang$virtual_dom$VirtualDom_Debug$UserMsg, _p12._1),
				_1: {ctor: '[]'}
			});
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapSubs = F2(
	function (userSubscriptions, _p14) {
		var _p15 = _p14;
		return A2(
			_elm_lang$core$Platform_Sub$map,
			_elm_lang$virtual_dom$VirtualDom_Debug$UserMsg,
			userSubscriptions(
				_elm_lang$virtual_dom$VirtualDom_Debug$getLatestModel(_p15.state)));
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapView = F2(
	function (userView, _p16) {
		var _p17 = _p16;
		var currentModel = function () {
			var _p18 = _p17.state;
			if (_p18.ctor === 'Running') {
				return _p18._0;
			} else {
				return _p18._1;
			}
		}();
		return A2(
			_elm_lang$virtual_dom$VirtualDom_Helpers$map,
			_elm_lang$virtual_dom$VirtualDom_Debug$UserMsg,
			userView(currentModel));
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$NoOp = {ctor: 'NoOp'};
var _elm_lang$virtual_dom$VirtualDom_Debug$download = F2(
	function (metadata, history) {
		var json = _elm_lang$core$Json_Encode$object(
			{
				ctor: '::',
				_0: {
					ctor: '_Tuple2',
					_0: 'metadata',
					_1: _elm_lang$virtual_dom$VirtualDom_Metadata$encode(metadata)
				},
				_1: {
					ctor: '::',
					_0: {
						ctor: '_Tuple2',
						_0: 'history',
						_1: _elm_lang$virtual_dom$VirtualDom_History$encode(history)
					},
					_1: {ctor: '[]'}
				}
			});
		var historyLength = _elm_lang$virtual_dom$VirtualDom_History$size(history);
		return A2(
			_elm_lang$core$Task$perform,
			function (_p19) {
				return _elm_lang$virtual_dom$VirtualDom_Debug$NoOp;
			},
			A2(_elm_lang$virtual_dom$Native_Debug.download, historyLength, json));
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$runIf = F2(
	function (bool, task) {
		return bool ? A2(
			_elm_lang$core$Task$perform,
			_elm_lang$core$Basics$always(_elm_lang$virtual_dom$VirtualDom_Debug$NoOp),
			task) : _elm_lang$core$Platform_Cmd$none;
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$updateUserMsg = F4(
	function (userUpdate, scrollTask, userMsg, _p20) {
		var _p21 = _p20;
		var _p25 = _p21.state;
		var _p24 = _p21;
		var userModel = _elm_lang$virtual_dom$VirtualDom_Debug$getLatestModel(_p25);
		var newHistory = A3(_elm_lang$virtual_dom$VirtualDom_History$add, userMsg, userModel, _p21.history);
		var _p22 = A2(userUpdate, userMsg, userModel);
		var newUserModel = _p22._0;
		var userCmds = _p22._1;
		var commands = A2(_elm_lang$core$Platform_Cmd$map, _elm_lang$virtual_dom$VirtualDom_Debug$UserMsg, userCmds);
		var _p23 = _p25;
		if (_p23.ctor === 'Running') {
			return A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_elm_lang$core$Native_Utils.update(
					_p24,
					{
						history: newHistory,
						state: _elm_lang$virtual_dom$VirtualDom_Debug$Running(newUserModel),
						expando: A2(_elm_lang$virtual_dom$VirtualDom_Expando$merge, newUserModel, _p21.expando)
					}),
				{
					ctor: '::',
					_0: commands,
					_1: {
						ctor: '::',
						_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$runIf, _p24.isDebuggerOpen, scrollTask),
						_1: {ctor: '[]'}
					}
				});
		} else {
			return A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_elm_lang$core$Native_Utils.update(
					_p24,
					{
						history: newHistory,
						state: A3(_elm_lang$virtual_dom$VirtualDom_Debug$Paused, _p23._0, _p23._1, newUserModel)
					}),
				{
					ctor: '::',
					_0: commands,
					_1: {ctor: '[]'}
				});
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapUpdate = F4(
	function (userUpdate, scrollTask, msg, model) {
		wrapUpdate:
		while (true) {
			var _p26 = msg;
			switch (_p26.ctor) {
				case 'NoOp':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						model,
						{ctor: '[]'});
				case 'UserMsg':
					return A4(_elm_lang$virtual_dom$VirtualDom_Debug$updateUserMsg, userUpdate, scrollTask, _p26._0, model);
				case 'ExpandoMsg':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								expando: A2(_elm_lang$virtual_dom$VirtualDom_Expando$update, _p26._0, model.expando)
							}),
						{ctor: '[]'});
				case 'Resume':
					var _p27 = model.state;
					if (_p27.ctor === 'Running') {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							model,
							{ctor: '[]'});
					} else {
						var _p28 = _p27._2;
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								model,
								{
									state: _elm_lang$virtual_dom$VirtualDom_Debug$Running(_p28),
									expando: A2(_elm_lang$virtual_dom$VirtualDom_Expando$merge, _p28, model.expando)
								}),
							{
								ctor: '::',
								_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$runIf, model.isDebuggerOpen, scrollTask),
								_1: {ctor: '[]'}
							});
					}
				case 'Jump':
					var _p30 = _p26._0;
					var _p29 = A3(_elm_lang$virtual_dom$VirtualDom_History$get, userUpdate, _p30, model.history);
					var indexModel = _p29._0;
					var indexMsg = _p29._1;
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{
								state: A3(
									_elm_lang$virtual_dom$VirtualDom_Debug$Paused,
									_p30,
									indexModel,
									_elm_lang$virtual_dom$VirtualDom_Debug$getLatestModel(model.state)),
								expando: A2(_elm_lang$virtual_dom$VirtualDom_Expando$merge, indexModel, model.expando)
							}),
						{ctor: '[]'});
				case 'Open':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{isDebuggerOpen: true}),
						{ctor: '[]'});
				case 'Close':
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						_elm_lang$core$Native_Utils.update(
							model,
							{isDebuggerOpen: false}),
						{ctor: '[]'});
				case 'Up':
					var index = function () {
						var _p31 = model.state;
						if (_p31.ctor === 'Paused') {
							return _p31._0;
						} else {
							return _elm_lang$virtual_dom$VirtualDom_History$size(model.history);
						}
					}();
					if (_elm_lang$core$Native_Utils.cmp(index, 0) > 0) {
						var _v17 = userUpdate,
							_v18 = scrollTask,
							_v19 = _elm_lang$virtual_dom$VirtualDom_Debug$Jump(index - 1),
							_v20 = model;
						userUpdate = _v17;
						scrollTask = _v18;
						msg = _v19;
						model = _v20;
						continue wrapUpdate;
					} else {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							model,
							{ctor: '[]'});
					}
				case 'Down':
					var _p32 = model.state;
					if (_p32.ctor === 'Running') {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							model,
							{ctor: '[]'});
					} else {
						var _p33 = _p32._0;
						if (_elm_lang$core$Native_Utils.eq(
							_p33,
							_elm_lang$virtual_dom$VirtualDom_History$size(model.history) - 1)) {
							var _v22 = userUpdate,
								_v23 = scrollTask,
								_v24 = _elm_lang$virtual_dom$VirtualDom_Debug$Resume,
								_v25 = model;
							userUpdate = _v22;
							scrollTask = _v23;
							msg = _v24;
							model = _v25;
							continue wrapUpdate;
						} else {
							var _v26 = userUpdate,
								_v27 = scrollTask,
								_v28 = _elm_lang$virtual_dom$VirtualDom_Debug$Jump(_p33 + 1),
								_v29 = model;
							userUpdate = _v26;
							scrollTask = _v27;
							msg = _v28;
							model = _v29;
							continue wrapUpdate;
						}
					}
				case 'Import':
					return A2(
						_elm_lang$virtual_dom$VirtualDom_Debug$withGoodMetadata,
						model,
						function (_p34) {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								model,
								{
									ctor: '::',
									_0: _elm_lang$virtual_dom$VirtualDom_Debug$upload,
									_1: {ctor: '[]'}
								});
						});
				case 'Export':
					return A2(
						_elm_lang$virtual_dom$VirtualDom_Debug$withGoodMetadata,
						model,
						function (metadata) {
							return A2(
								_elm_lang$core$Platform_Cmd_ops['!'],
								model,
								{
									ctor: '::',
									_0: A2(_elm_lang$virtual_dom$VirtualDom_Debug$download, metadata, model.history),
									_1: {ctor: '[]'}
								});
						});
				case 'Upload':
					return A2(
						_elm_lang$virtual_dom$VirtualDom_Debug$withGoodMetadata,
						model,
						function (metadata) {
							var _p35 = A2(_elm_lang$virtual_dom$VirtualDom_Overlay$assessImport, metadata, _p26._0);
							if (_p35.ctor === 'Err') {
								return A2(
									_elm_lang$core$Platform_Cmd_ops['!'],
									_elm_lang$core$Native_Utils.update(
										model,
										{overlay: _p35._0}),
									{ctor: '[]'});
							} else {
								return A3(_elm_lang$virtual_dom$VirtualDom_Debug$loadNewHistory, _p35._0, userUpdate, model);
							}
						});
				default:
					var _p36 = A2(_elm_lang$virtual_dom$VirtualDom_Overlay$close, _p26._0, model.overlay);
					if (_p36.ctor === 'Nothing') {
						return A2(
							_elm_lang$core$Platform_Cmd_ops['!'],
							_elm_lang$core$Native_Utils.update(
								model,
								{overlay: _elm_lang$virtual_dom$VirtualDom_Overlay$none}),
							{ctor: '[]'});
					} else {
						return A3(_elm_lang$virtual_dom$VirtualDom_Debug$loadNewHistory, _p36._0, userUpdate, model);
					}
			}
		}
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$wrap = F2(
	function (metadata, _p37) {
		var _p38 = _p37;
		return {
			init: A2(_elm_lang$virtual_dom$VirtualDom_Debug$wrapInit, metadata, _p38.init),
			view: _elm_lang$virtual_dom$VirtualDom_Debug$wrapView(_p38.view),
			update: _elm_lang$virtual_dom$VirtualDom_Debug$wrapUpdate(_p38.update),
			viewIn: _elm_lang$virtual_dom$VirtualDom_Debug$viewIn,
			viewOut: _elm_lang$virtual_dom$VirtualDom_Debug$viewOut,
			subscriptions: _elm_lang$virtual_dom$VirtualDom_Debug$wrapSubs(_p38.subscriptions)
		};
	});
var _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags = F2(
	function (metadata, _p39) {
		var _p40 = _p39;
		return {
			init: function (flags) {
				return A2(
					_elm_lang$virtual_dom$VirtualDom_Debug$wrapInit,
					metadata,
					_p40.init(flags));
			},
			view: _elm_lang$virtual_dom$VirtualDom_Debug$wrapView(_p40.view),
			update: _elm_lang$virtual_dom$VirtualDom_Debug$wrapUpdate(_p40.update),
			viewIn: _elm_lang$virtual_dom$VirtualDom_Debug$viewIn,
			viewOut: _elm_lang$virtual_dom$VirtualDom_Debug$viewOut,
			subscriptions: _elm_lang$virtual_dom$VirtualDom_Debug$wrapSubs(_p40.subscriptions)
		};
	});

var _elm_lang$virtual_dom$VirtualDom$programWithFlags = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.programWithFlags, _elm_lang$virtual_dom$VirtualDom_Debug$wrapWithFlags, impl);
};
var _elm_lang$virtual_dom$VirtualDom$program = function (impl) {
	return A2(_elm_lang$virtual_dom$Native_VirtualDom.program, _elm_lang$virtual_dom$VirtualDom_Debug$wrap, impl);
};
var _elm_lang$virtual_dom$VirtualDom$keyedNode = _elm_lang$virtual_dom$Native_VirtualDom.keyedNode;
var _elm_lang$virtual_dom$VirtualDom$lazy3 = _elm_lang$virtual_dom$Native_VirtualDom.lazy3;
var _elm_lang$virtual_dom$VirtualDom$lazy2 = _elm_lang$virtual_dom$Native_VirtualDom.lazy2;
var _elm_lang$virtual_dom$VirtualDom$lazy = _elm_lang$virtual_dom$Native_VirtualDom.lazy;
var _elm_lang$virtual_dom$VirtualDom$defaultOptions = {stopPropagation: false, preventDefault: false};
var _elm_lang$virtual_dom$VirtualDom$onWithOptions = _elm_lang$virtual_dom$Native_VirtualDom.on;
var _elm_lang$virtual_dom$VirtualDom$on = F2(
	function (eventName, decoder) {
		return A3(_elm_lang$virtual_dom$VirtualDom$onWithOptions, eventName, _elm_lang$virtual_dom$VirtualDom$defaultOptions, decoder);
	});
var _elm_lang$virtual_dom$VirtualDom$style = _elm_lang$virtual_dom$Native_VirtualDom.style;
var _elm_lang$virtual_dom$VirtualDom$mapProperty = _elm_lang$virtual_dom$Native_VirtualDom.mapProperty;
var _elm_lang$virtual_dom$VirtualDom$attributeNS = _elm_lang$virtual_dom$Native_VirtualDom.attributeNS;
var _elm_lang$virtual_dom$VirtualDom$attribute = _elm_lang$virtual_dom$Native_VirtualDom.attribute;
var _elm_lang$virtual_dom$VirtualDom$property = _elm_lang$virtual_dom$Native_VirtualDom.property;
var _elm_lang$virtual_dom$VirtualDom$map = _elm_lang$virtual_dom$Native_VirtualDom.map;
var _elm_lang$virtual_dom$VirtualDom$text = _elm_lang$virtual_dom$Native_VirtualDom.text;
var _elm_lang$virtual_dom$VirtualDom$node = _elm_lang$virtual_dom$Native_VirtualDom.node;
var _elm_lang$virtual_dom$VirtualDom$Options = F2(
	function (a, b) {
		return {stopPropagation: a, preventDefault: b};
	});
var _elm_lang$virtual_dom$VirtualDom$Node = {ctor: 'Node'};
var _elm_lang$virtual_dom$VirtualDom$Property = {ctor: 'Property'};

var _elm_lang$html$Html$programWithFlags = _elm_lang$virtual_dom$VirtualDom$programWithFlags;
var _elm_lang$html$Html$program = _elm_lang$virtual_dom$VirtualDom$program;
var _elm_lang$html$Html$beginnerProgram = function (_p0) {
	var _p1 = _p0;
	return _elm_lang$html$Html$program(
		{
			init: A2(
				_elm_lang$core$Platform_Cmd_ops['!'],
				_p1.model,
				{ctor: '[]'}),
			update: F2(
				function (msg, model) {
					return A2(
						_elm_lang$core$Platform_Cmd_ops['!'],
						A2(_p1.update, msg, model),
						{ctor: '[]'});
				}),
			view: _p1.view,
			subscriptions: function (_p2) {
				return _elm_lang$core$Platform_Sub$none;
			}
		});
};
var _elm_lang$html$Html$map = _elm_lang$virtual_dom$VirtualDom$map;
var _elm_lang$html$Html$text = _elm_lang$virtual_dom$VirtualDom$text;
var _elm_lang$html$Html$node = _elm_lang$virtual_dom$VirtualDom$node;
var _elm_lang$html$Html$body = _elm_lang$html$Html$node('body');
var _elm_lang$html$Html$section = _elm_lang$html$Html$node('section');
var _elm_lang$html$Html$nav = _elm_lang$html$Html$node('nav');
var _elm_lang$html$Html$article = _elm_lang$html$Html$node('article');
var _elm_lang$html$Html$aside = _elm_lang$html$Html$node('aside');
var _elm_lang$html$Html$h1 = _elm_lang$html$Html$node('h1');
var _elm_lang$html$Html$h2 = _elm_lang$html$Html$node('h2');
var _elm_lang$html$Html$h3 = _elm_lang$html$Html$node('h3');
var _elm_lang$html$Html$h4 = _elm_lang$html$Html$node('h4');
var _elm_lang$html$Html$h5 = _elm_lang$html$Html$node('h5');
var _elm_lang$html$Html$h6 = _elm_lang$html$Html$node('h6');
var _elm_lang$html$Html$header = _elm_lang$html$Html$node('header');
var _elm_lang$html$Html$footer = _elm_lang$html$Html$node('footer');
var _elm_lang$html$Html$address = _elm_lang$html$Html$node('address');
var _elm_lang$html$Html$main_ = _elm_lang$html$Html$node('main');
var _elm_lang$html$Html$p = _elm_lang$html$Html$node('p');
var _elm_lang$html$Html$hr = _elm_lang$html$Html$node('hr');
var _elm_lang$html$Html$pre = _elm_lang$html$Html$node('pre');
var _elm_lang$html$Html$blockquote = _elm_lang$html$Html$node('blockquote');
var _elm_lang$html$Html$ol = _elm_lang$html$Html$node('ol');
var _elm_lang$html$Html$ul = _elm_lang$html$Html$node('ul');
var _elm_lang$html$Html$li = _elm_lang$html$Html$node('li');
var _elm_lang$html$Html$dl = _elm_lang$html$Html$node('dl');
var _elm_lang$html$Html$dt = _elm_lang$html$Html$node('dt');
var _elm_lang$html$Html$dd = _elm_lang$html$Html$node('dd');
var _elm_lang$html$Html$figure = _elm_lang$html$Html$node('figure');
var _elm_lang$html$Html$figcaption = _elm_lang$html$Html$node('figcaption');
var _elm_lang$html$Html$div = _elm_lang$html$Html$node('div');
var _elm_lang$html$Html$a = _elm_lang$html$Html$node('a');
var _elm_lang$html$Html$em = _elm_lang$html$Html$node('em');
var _elm_lang$html$Html$strong = _elm_lang$html$Html$node('strong');
var _elm_lang$html$Html$small = _elm_lang$html$Html$node('small');
var _elm_lang$html$Html$s = _elm_lang$html$Html$node('s');
var _elm_lang$html$Html$cite = _elm_lang$html$Html$node('cite');
var _elm_lang$html$Html$q = _elm_lang$html$Html$node('q');
var _elm_lang$html$Html$dfn = _elm_lang$html$Html$node('dfn');
var _elm_lang$html$Html$abbr = _elm_lang$html$Html$node('abbr');
var _elm_lang$html$Html$time = _elm_lang$html$Html$node('time');
var _elm_lang$html$Html$code = _elm_lang$html$Html$node('code');
var _elm_lang$html$Html$var = _elm_lang$html$Html$node('var');
var _elm_lang$html$Html$samp = _elm_lang$html$Html$node('samp');
var _elm_lang$html$Html$kbd = _elm_lang$html$Html$node('kbd');
var _elm_lang$html$Html$sub = _elm_lang$html$Html$node('sub');
var _elm_lang$html$Html$sup = _elm_lang$html$Html$node('sup');
var _elm_lang$html$Html$i = _elm_lang$html$Html$node('i');
var _elm_lang$html$Html$b = _elm_lang$html$Html$node('b');
var _elm_lang$html$Html$u = _elm_lang$html$Html$node('u');
var _elm_lang$html$Html$mark = _elm_lang$html$Html$node('mark');
var _elm_lang$html$Html$ruby = _elm_lang$html$Html$node('ruby');
var _elm_lang$html$Html$rt = _elm_lang$html$Html$node('rt');
var _elm_lang$html$Html$rp = _elm_lang$html$Html$node('rp');
var _elm_lang$html$Html$bdi = _elm_lang$html$Html$node('bdi');
var _elm_lang$html$Html$bdo = _elm_lang$html$Html$node('bdo');
var _elm_lang$html$Html$span = _elm_lang$html$Html$node('span');
var _elm_lang$html$Html$br = _elm_lang$html$Html$node('br');
var _elm_lang$html$Html$wbr = _elm_lang$html$Html$node('wbr');
var _elm_lang$html$Html$ins = _elm_lang$html$Html$node('ins');
var _elm_lang$html$Html$del = _elm_lang$html$Html$node('del');
var _elm_lang$html$Html$img = _elm_lang$html$Html$node('img');
var _elm_lang$html$Html$iframe = _elm_lang$html$Html$node('iframe');
var _elm_lang$html$Html$embed = _elm_lang$html$Html$node('embed');
var _elm_lang$html$Html$object = _elm_lang$html$Html$node('object');
var _elm_lang$html$Html$param = _elm_lang$html$Html$node('param');
var _elm_lang$html$Html$video = _elm_lang$html$Html$node('video');
var _elm_lang$html$Html$audio = _elm_lang$html$Html$node('audio');
var _elm_lang$html$Html$source = _elm_lang$html$Html$node('source');
var _elm_lang$html$Html$track = _elm_lang$html$Html$node('track');
var _elm_lang$html$Html$canvas = _elm_lang$html$Html$node('canvas');
var _elm_lang$html$Html$math = _elm_lang$html$Html$node('math');
var _elm_lang$html$Html$table = _elm_lang$html$Html$node('table');
var _elm_lang$html$Html$caption = _elm_lang$html$Html$node('caption');
var _elm_lang$html$Html$colgroup = _elm_lang$html$Html$node('colgroup');
var _elm_lang$html$Html$col = _elm_lang$html$Html$node('col');
var _elm_lang$html$Html$tbody = _elm_lang$html$Html$node('tbody');
var _elm_lang$html$Html$thead = _elm_lang$html$Html$node('thead');
var _elm_lang$html$Html$tfoot = _elm_lang$html$Html$node('tfoot');
var _elm_lang$html$Html$tr = _elm_lang$html$Html$node('tr');
var _elm_lang$html$Html$td = _elm_lang$html$Html$node('td');
var _elm_lang$html$Html$th = _elm_lang$html$Html$node('th');
var _elm_lang$html$Html$form = _elm_lang$html$Html$node('form');
var _elm_lang$html$Html$fieldset = _elm_lang$html$Html$node('fieldset');
var _elm_lang$html$Html$legend = _elm_lang$html$Html$node('legend');
var _elm_lang$html$Html$label = _elm_lang$html$Html$node('label');
var _elm_lang$html$Html$input = _elm_lang$html$Html$node('input');
var _elm_lang$html$Html$button = _elm_lang$html$Html$node('button');
var _elm_lang$html$Html$select = _elm_lang$html$Html$node('select');
var _elm_lang$html$Html$datalist = _elm_lang$html$Html$node('datalist');
var _elm_lang$html$Html$optgroup = _elm_lang$html$Html$node('optgroup');
var _elm_lang$html$Html$option = _elm_lang$html$Html$node('option');
var _elm_lang$html$Html$textarea = _elm_lang$html$Html$node('textarea');
var _elm_lang$html$Html$keygen = _elm_lang$html$Html$node('keygen');
var _elm_lang$html$Html$output = _elm_lang$html$Html$node('output');
var _elm_lang$html$Html$progress = _elm_lang$html$Html$node('progress');
var _elm_lang$html$Html$meter = _elm_lang$html$Html$node('meter');
var _elm_lang$html$Html$details = _elm_lang$html$Html$node('details');
var _elm_lang$html$Html$summary = _elm_lang$html$Html$node('summary');
var _elm_lang$html$Html$menuitem = _elm_lang$html$Html$node('menuitem');
var _elm_lang$html$Html$menu = _elm_lang$html$Html$node('menu');

var _elm_lang$html$Html_Attributes$map = _elm_lang$virtual_dom$VirtualDom$mapProperty;
var _elm_lang$html$Html_Attributes$attribute = _elm_lang$virtual_dom$VirtualDom$attribute;
var _elm_lang$html$Html_Attributes$contextmenu = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'contextmenu', value);
};
var _elm_lang$html$Html_Attributes$draggable = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'draggable', value);
};
var _elm_lang$html$Html_Attributes$itemprop = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'itemprop', value);
};
var _elm_lang$html$Html_Attributes$tabindex = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'tabIndex',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$charset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'charset', value);
};
var _elm_lang$html$Html_Attributes$height = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'height',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$width = function (value) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'width',
		_elm_lang$core$Basics$toString(value));
};
var _elm_lang$html$Html_Attributes$formaction = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'formAction', value);
};
var _elm_lang$html$Html_Attributes$list = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'list', value);
};
var _elm_lang$html$Html_Attributes$minlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'minLength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$maxlength = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'maxlength',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$size = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'size',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$form = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'form', value);
};
var _elm_lang$html$Html_Attributes$cols = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'cols',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rows = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rows',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$challenge = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'challenge', value);
};
var _elm_lang$html$Html_Attributes$media = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'media', value);
};
var _elm_lang$html$Html_Attributes$rel = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'rel', value);
};
var _elm_lang$html$Html_Attributes$datetime = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'datetime', value);
};
var _elm_lang$html$Html_Attributes$pubdate = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'pubdate', value);
};
var _elm_lang$html$Html_Attributes$colspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'colspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$rowspan = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$attribute,
		'rowspan',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$manifest = function (value) {
	return A2(_elm_lang$html$Html_Attributes$attribute, 'manifest', value);
};
var _elm_lang$html$Html_Attributes$property = _elm_lang$virtual_dom$VirtualDom$property;
var _elm_lang$html$Html_Attributes$stringProperty = F2(
	function (name, string) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$string(string));
	});
var _elm_lang$html$Html_Attributes$class = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'className', name);
};
var _elm_lang$html$Html_Attributes$id = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'id', name);
};
var _elm_lang$html$Html_Attributes$title = function (name) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'title', name);
};
var _elm_lang$html$Html_Attributes$accesskey = function ($char) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'accessKey',
		_elm_lang$core$String$fromChar($char));
};
var _elm_lang$html$Html_Attributes$dir = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dir', value);
};
var _elm_lang$html$Html_Attributes$dropzone = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'dropzone', value);
};
var _elm_lang$html$Html_Attributes$lang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'lang', value);
};
var _elm_lang$html$Html_Attributes$content = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'content', value);
};
var _elm_lang$html$Html_Attributes$httpEquiv = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'httpEquiv', value);
};
var _elm_lang$html$Html_Attributes$language = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'language', value);
};
var _elm_lang$html$Html_Attributes$src = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'src', value);
};
var _elm_lang$html$Html_Attributes$alt = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'alt', value);
};
var _elm_lang$html$Html_Attributes$preload = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'preload', value);
};
var _elm_lang$html$Html_Attributes$poster = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'poster', value);
};
var _elm_lang$html$Html_Attributes$kind = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'kind', value);
};
var _elm_lang$html$Html_Attributes$srclang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srclang', value);
};
var _elm_lang$html$Html_Attributes$sandbox = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'sandbox', value);
};
var _elm_lang$html$Html_Attributes$srcdoc = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'srcdoc', value);
};
var _elm_lang$html$Html_Attributes$type_ = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'type', value);
};
var _elm_lang$html$Html_Attributes$value = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'value', value);
};
var _elm_lang$html$Html_Attributes$defaultValue = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'defaultValue', value);
};
var _elm_lang$html$Html_Attributes$placeholder = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'placeholder', value);
};
var _elm_lang$html$Html_Attributes$accept = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'accept', value);
};
var _elm_lang$html$Html_Attributes$acceptCharset = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'acceptCharset', value);
};
var _elm_lang$html$Html_Attributes$action = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'action', value);
};
var _elm_lang$html$Html_Attributes$autocomplete = function (bool) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'autocomplete',
		bool ? 'on' : 'off');
};
var _elm_lang$html$Html_Attributes$enctype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'enctype', value);
};
var _elm_lang$html$Html_Attributes$method = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'method', value);
};
var _elm_lang$html$Html_Attributes$name = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'name', value);
};
var _elm_lang$html$Html_Attributes$pattern = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'pattern', value);
};
var _elm_lang$html$Html_Attributes$for = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'htmlFor', value);
};
var _elm_lang$html$Html_Attributes$max = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'max', value);
};
var _elm_lang$html$Html_Attributes$min = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'min', value);
};
var _elm_lang$html$Html_Attributes$step = function (n) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'step', n);
};
var _elm_lang$html$Html_Attributes$wrap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'wrap', value);
};
var _elm_lang$html$Html_Attributes$usemap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'useMap', value);
};
var _elm_lang$html$Html_Attributes$shape = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'shape', value);
};
var _elm_lang$html$Html_Attributes$coords = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'coords', value);
};
var _elm_lang$html$Html_Attributes$keytype = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'keytype', value);
};
var _elm_lang$html$Html_Attributes$align = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'align', value);
};
var _elm_lang$html$Html_Attributes$cite = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'cite', value);
};
var _elm_lang$html$Html_Attributes$href = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'href', value);
};
var _elm_lang$html$Html_Attributes$target = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'target', value);
};
var _elm_lang$html$Html_Attributes$downloadAs = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'download', value);
};
var _elm_lang$html$Html_Attributes$hreflang = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'hreflang', value);
};
var _elm_lang$html$Html_Attributes$ping = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'ping', value);
};
var _elm_lang$html$Html_Attributes$start = function (n) {
	return A2(
		_elm_lang$html$Html_Attributes$stringProperty,
		'start',
		_elm_lang$core$Basics$toString(n));
};
var _elm_lang$html$Html_Attributes$headers = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'headers', value);
};
var _elm_lang$html$Html_Attributes$scope = function (value) {
	return A2(_elm_lang$html$Html_Attributes$stringProperty, 'scope', value);
};
var _elm_lang$html$Html_Attributes$boolProperty = F2(
	function (name, bool) {
		return A2(
			_elm_lang$html$Html_Attributes$property,
			name,
			_elm_lang$core$Json_Encode$bool(bool));
	});
var _elm_lang$html$Html_Attributes$hidden = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'hidden', bool);
};
var _elm_lang$html$Html_Attributes$contenteditable = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'contentEditable', bool);
};
var _elm_lang$html$Html_Attributes$spellcheck = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'spellcheck', bool);
};
var _elm_lang$html$Html_Attributes$async = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'async', bool);
};
var _elm_lang$html$Html_Attributes$defer = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'defer', bool);
};
var _elm_lang$html$Html_Attributes$scoped = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'scoped', bool);
};
var _elm_lang$html$Html_Attributes$autoplay = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autoplay', bool);
};
var _elm_lang$html$Html_Attributes$controls = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'controls', bool);
};
var _elm_lang$html$Html_Attributes$loop = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'loop', bool);
};
var _elm_lang$html$Html_Attributes$default = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'default', bool);
};
var _elm_lang$html$Html_Attributes$seamless = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'seamless', bool);
};
var _elm_lang$html$Html_Attributes$checked = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'checked', bool);
};
var _elm_lang$html$Html_Attributes$selected = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'selected', bool);
};
var _elm_lang$html$Html_Attributes$autofocus = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'autofocus', bool);
};
var _elm_lang$html$Html_Attributes$disabled = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'disabled', bool);
};
var _elm_lang$html$Html_Attributes$multiple = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'multiple', bool);
};
var _elm_lang$html$Html_Attributes$novalidate = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'noValidate', bool);
};
var _elm_lang$html$Html_Attributes$readonly = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'readOnly', bool);
};
var _elm_lang$html$Html_Attributes$required = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'required', bool);
};
var _elm_lang$html$Html_Attributes$ismap = function (value) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'isMap', value);
};
var _elm_lang$html$Html_Attributes$download = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'download', bool);
};
var _elm_lang$html$Html_Attributes$reversed = function (bool) {
	return A2(_elm_lang$html$Html_Attributes$boolProperty, 'reversed', bool);
};
var _elm_lang$html$Html_Attributes$classList = function (list) {
	return _elm_lang$html$Html_Attributes$class(
		A2(
			_elm_lang$core$String$join,
			' ',
			A2(
				_elm_lang$core$List$map,
				_elm_lang$core$Tuple$first,
				A2(_elm_lang$core$List$filter, _elm_lang$core$Tuple$second, list))));
};
var _elm_lang$html$Html_Attributes$style = _elm_lang$virtual_dom$VirtualDom$style;

var _elm_lang$http$Native_Http = function() {


// ENCODING AND DECODING

function encodeUri(string)
{
	return encodeURIComponent(string);
}

function decodeUri(string)
{
	try
	{
		return _elm_lang$core$Maybe$Just(decodeURIComponent(string));
	}
	catch(e)
	{
		return _elm_lang$core$Maybe$Nothing;
	}
}


// SEND REQUEST

function toTask(request, maybeProgress)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		var xhr = new XMLHttpRequest();

		configureProgress(xhr, maybeProgress);

		xhr.addEventListener('error', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'NetworkError' }));
		});
		xhr.addEventListener('timeout', function() {
			callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'Timeout' }));
		});
		xhr.addEventListener('load', function() {
			callback(handleResponse(xhr, request.expect.responseToResult));
		});

		try
		{
			xhr.open(request.method, request.url, true);
		}
		catch (e)
		{
			return callback(_elm_lang$core$Native_Scheduler.fail({ ctor: 'BadUrl', _0: request.url }));
		}

		configureRequest(xhr, request);
		send(xhr, request.body);

		return function() { xhr.abort(); };
	});
}

function configureProgress(xhr, maybeProgress)
{
	if (maybeProgress.ctor === 'Nothing')
	{
		return;
	}

	xhr.addEventListener('progress', function(event) {
		if (!event.lengthComputable)
		{
			return;
		}
		_elm_lang$core$Native_Scheduler.rawSpawn(maybeProgress._0({
			bytes: event.loaded,
			bytesExpected: event.total
		}));
	});
}

function configureRequest(xhr, request)
{
	function setHeader(pair)
	{
		xhr.setRequestHeader(pair._0, pair._1);
	}

	A2(_elm_lang$core$List$map, setHeader, request.headers);
	xhr.responseType = request.expect.responseType;
	xhr.withCredentials = request.withCredentials;

	if (request.timeout.ctor === 'Just')
	{
		xhr.timeout = request.timeout._0;
	}
}

function send(xhr, body)
{
	switch (body.ctor)
	{
		case 'EmptyBody':
			xhr.send();
			return;

		case 'StringBody':
			xhr.setRequestHeader('Content-Type', body._0);
			xhr.send(body._1);
			return;

		case 'FormDataBody':
			xhr.send(body._0);
			return;
	}
}


// RESPONSES

function handleResponse(xhr, responseToResult)
{
	var response = toResponse(xhr);

	if (xhr.status < 200 || 300 <= xhr.status)
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadStatus',
			_0: response
		});
	}

	var result = responseToResult(response);

	if (result.ctor === 'Ok')
	{
		return _elm_lang$core$Native_Scheduler.succeed(result._0);
	}
	else
	{
		response.body = xhr.responseText;
		return _elm_lang$core$Native_Scheduler.fail({
			ctor: 'BadPayload',
			_0: result._0,
			_1: response
		});
	}
}

function toResponse(xhr)
{
	return {
		status: { code: xhr.status, message: xhr.statusText },
		headers: parseHeaders(xhr.getAllResponseHeaders()),
		url: xhr.responseURL,
		body: xhr.response
	};
}

function parseHeaders(rawHeaders)
{
	var headers = _elm_lang$core$Dict$empty;

	if (!rawHeaders)
	{
		return headers;
	}

	var headerPairs = rawHeaders.split('\u000d\u000a');
	for (var i = headerPairs.length; i--; )
	{
		var headerPair = headerPairs[i];
		var index = headerPair.indexOf('\u003a\u0020');
		if (index > 0)
		{
			var key = headerPair.substring(0, index);
			var value = headerPair.substring(index + 2);

			headers = A3(_elm_lang$core$Dict$update, key, function(oldValue) {
				if (oldValue.ctor === 'Just')
				{
					return _elm_lang$core$Maybe$Just(value + ', ' + oldValue._0);
				}
				return _elm_lang$core$Maybe$Just(value);
			}, headers);
		}
	}

	return headers;
}


// EXPECTORS

function expectStringResponse(responseToResult)
{
	return {
		responseType: 'text',
		responseToResult: responseToResult
	};
}

function mapExpect(func, expect)
{
	return {
		responseType: expect.responseType,
		responseToResult: function(response) {
			var convertedResponse = expect.responseToResult(response);
			return A2(_elm_lang$core$Result$map, func, convertedResponse);
		}
	};
}


// BODY

function multipart(parts)
{
	var formData = new FormData();

	while (parts.ctor !== '[]')
	{
		var part = parts._0;
		formData.append(part._0, part._1);
		parts = parts._1;
	}

	return { ctor: 'FormDataBody', _0: formData };
}

return {
	toTask: F2(toTask),
	expectStringResponse: expectStringResponse,
	mapExpect: F2(mapExpect),
	multipart: multipart,
	encodeUri: encodeUri,
	decodeUri: decodeUri
};

}();

var _elm_lang$http$Http_Internal$map = F2(
	function (func, request) {
		return _elm_lang$core$Native_Utils.update(
			request,
			{
				expect: A2(_elm_lang$http$Native_Http.mapExpect, func, request.expect)
			});
	});
var _elm_lang$http$Http_Internal$RawRequest = F7(
	function (a, b, c, d, e, f, g) {
		return {method: a, headers: b, url: c, body: d, expect: e, timeout: f, withCredentials: g};
	});
var _elm_lang$http$Http_Internal$Request = function (a) {
	return {ctor: 'Request', _0: a};
};
var _elm_lang$http$Http_Internal$Expect = {ctor: 'Expect'};
var _elm_lang$http$Http_Internal$FormDataBody = {ctor: 'FormDataBody'};
var _elm_lang$http$Http_Internal$StringBody = F2(
	function (a, b) {
		return {ctor: 'StringBody', _0: a, _1: b};
	});
var _elm_lang$http$Http_Internal$EmptyBody = {ctor: 'EmptyBody'};
var _elm_lang$http$Http_Internal$Header = F2(
	function (a, b) {
		return {ctor: 'Header', _0: a, _1: b};
	});

var _elm_lang$http$Http$decodeUri = _elm_lang$http$Native_Http.decodeUri;
var _elm_lang$http$Http$encodeUri = _elm_lang$http$Native_Http.encodeUri;
var _elm_lang$http$Http$expectStringResponse = _elm_lang$http$Native_Http.expectStringResponse;
var _elm_lang$http$Http$expectJson = function (decoder) {
	return _elm_lang$http$Http$expectStringResponse(
		function (response) {
			return A2(_elm_lang$core$Json_Decode$decodeString, decoder, response.body);
		});
};
var _elm_lang$http$Http$expectString = _elm_lang$http$Http$expectStringResponse(
	function (response) {
		return _elm_lang$core$Result$Ok(response.body);
	});
var _elm_lang$http$Http$multipartBody = _elm_lang$http$Native_Http.multipart;
var _elm_lang$http$Http$stringBody = _elm_lang$http$Http_Internal$StringBody;
var _elm_lang$http$Http$jsonBody = function (value) {
	return A2(
		_elm_lang$http$Http_Internal$StringBody,
		'application/json',
		A2(_elm_lang$core$Json_Encode$encode, 0, value));
};
var _elm_lang$http$Http$emptyBody = _elm_lang$http$Http_Internal$EmptyBody;
var _elm_lang$http$Http$header = _elm_lang$http$Http_Internal$Header;
var _elm_lang$http$Http$request = _elm_lang$http$Http_Internal$Request;
var _elm_lang$http$Http$post = F3(
	function (url, body, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'POST',
				headers: {ctor: '[]'},
				url: url,
				body: body,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$get = F2(
	function (url, decoder) {
		return _elm_lang$http$Http$request(
			{
				method: 'GET',
				headers: {ctor: '[]'},
				url: url,
				body: _elm_lang$http$Http$emptyBody,
				expect: _elm_lang$http$Http$expectJson(decoder),
				timeout: _elm_lang$core$Maybe$Nothing,
				withCredentials: false
			});
	});
var _elm_lang$http$Http$getString = function (url) {
	return _elm_lang$http$Http$request(
		{
			method: 'GET',
			headers: {ctor: '[]'},
			url: url,
			body: _elm_lang$http$Http$emptyBody,
			expect: _elm_lang$http$Http$expectString,
			timeout: _elm_lang$core$Maybe$Nothing,
			withCredentials: false
		});
};
var _elm_lang$http$Http$toTask = function (_p0) {
	var _p1 = _p0;
	return A2(_elm_lang$http$Native_Http.toTask, _p1._0, _elm_lang$core$Maybe$Nothing);
};
var _elm_lang$http$Http$send = F2(
	function (resultToMessage, request) {
		return A2(
			_elm_lang$core$Task$attempt,
			resultToMessage,
			_elm_lang$http$Http$toTask(request));
	});
var _elm_lang$http$Http$Response = F4(
	function (a, b, c, d) {
		return {url: a, status: b, headers: c, body: d};
	});
var _elm_lang$http$Http$BadPayload = F2(
	function (a, b) {
		return {ctor: 'BadPayload', _0: a, _1: b};
	});
var _elm_lang$http$Http$BadStatus = function (a) {
	return {ctor: 'BadStatus', _0: a};
};
var _elm_lang$http$Http$NetworkError = {ctor: 'NetworkError'};
var _elm_lang$http$Http$Timeout = {ctor: 'Timeout'};
var _elm_lang$http$Http$BadUrl = function (a) {
	return {ctor: 'BadUrl', _0: a};
};
var _elm_lang$http$Http$StringPart = F2(
	function (a, b) {
		return {ctor: 'StringPart', _0: a, _1: b};
	});
var _elm_lang$http$Http$stringPart = _elm_lang$http$Http$StringPart;

var _elm_lang$navigation$Native_Navigation = function() {


// FAKE NAVIGATION

function go(n)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		if (n !== 0)
		{
			history.go(n);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function pushState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.pushState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}

function replaceState(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		history.replaceState({}, '', url);
		callback(_elm_lang$core$Native_Scheduler.succeed(getLocation()));
	});
}


// REAL NAVIGATION

function reloadPage(skipCache)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		document.location.reload(skipCache);
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}

function setLocation(url)
{
	return _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)
	{
		try
		{
			window.location = url;
		}
		catch(err)
		{
			// Only Firefox can throw a NS_ERROR_MALFORMED_URI exception here.
			// Other browsers reload the page, so let's be consistent about that.
			document.location.reload(false);
		}
		callback(_elm_lang$core$Native_Scheduler.succeed(_elm_lang$core$Native_Utils.Tuple0));
	});
}


// GET LOCATION

function getLocation()
{
	var location = document.location;

	return {
		href: location.href,
		host: location.host,
		hostname: location.hostname,
		protocol: location.protocol,
		origin: location.origin,
		port_: location.port,
		pathname: location.pathname,
		search: location.search,
		hash: location.hash,
		username: location.username,
		password: location.password
	};
}


// DETECT IE11 PROBLEMS

function isInternetExplorer11()
{
	return window.navigator.userAgent.indexOf('Trident') !== -1;
}


return {
	go: go,
	setLocation: setLocation,
	reloadPage: reloadPage,
	pushState: pushState,
	replaceState: replaceState,
	getLocation: getLocation,
	isInternetExplorer11: isInternetExplorer11
};

}();

var _elm_lang$navigation$Navigation$replaceState = _elm_lang$navigation$Native_Navigation.replaceState;
var _elm_lang$navigation$Navigation$pushState = _elm_lang$navigation$Native_Navigation.pushState;
var _elm_lang$navigation$Navigation$go = _elm_lang$navigation$Native_Navigation.go;
var _elm_lang$navigation$Navigation$reloadPage = _elm_lang$navigation$Native_Navigation.reloadPage;
var _elm_lang$navigation$Navigation$setLocation = _elm_lang$navigation$Native_Navigation.setLocation;
var _elm_lang$navigation$Navigation_ops = _elm_lang$navigation$Navigation_ops || {};
_elm_lang$navigation$Navigation_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$navigation$Navigation$notify = F3(
	function (router, subs, location) {
		var send = function (_p1) {
			var _p2 = _p1;
			return A2(
				_elm_lang$core$Platform$sendToApp,
				router,
				_p2._0(location));
		};
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(_elm_lang$core$List$map, send, subs)),
			_elm_lang$core$Task$succeed(
				{ctor: '_Tuple0'}));
	});
var _elm_lang$navigation$Navigation$cmdHelp = F3(
	function (router, subs, cmd) {
		var _p3 = cmd;
		switch (_p3.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$go(_p3._0);
			case 'New':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$pushState(_p3._0));
			case 'Modify':
				return A2(
					_elm_lang$core$Task$andThen,
					A2(_elm_lang$navigation$Navigation$notify, router, subs),
					_elm_lang$navigation$Navigation$replaceState(_p3._0));
			case 'Visit':
				return _elm_lang$navigation$Navigation$setLocation(_p3._0);
			default:
				return _elm_lang$navigation$Navigation$reloadPage(_p3._0);
		}
	});
var _elm_lang$navigation$Navigation$killPopWatcher = function (popWatcher) {
	var _p4 = popWatcher;
	if (_p4.ctor === 'Normal') {
		return _elm_lang$core$Process$kill(_p4._0);
	} else {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Process$kill(_p4._0),
			_elm_lang$core$Process$kill(_p4._1));
	}
};
var _elm_lang$navigation$Navigation$onSelfMsg = F3(
	function (router, location, state) {
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			A3(_elm_lang$navigation$Navigation$notify, router, state.subs, location),
			_elm_lang$core$Task$succeed(state));
	});
var _elm_lang$navigation$Navigation$subscription = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$command = _elm_lang$core$Native_Platform.leaf('Navigation');
var _elm_lang$navigation$Navigation$Location = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return {href: a, host: b, hostname: c, protocol: d, origin: e, port_: f, pathname: g, search: h, hash: i, username: j, password: k};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _elm_lang$navigation$Navigation$State = F2(
	function (a, b) {
		return {subs: a, popWatcher: b};
	});
var _elm_lang$navigation$Navigation$init = _elm_lang$core$Task$succeed(
	A2(
		_elm_lang$navigation$Navigation$State,
		{ctor: '[]'},
		_elm_lang$core$Maybe$Nothing));
var _elm_lang$navigation$Navigation$Reload = function (a) {
	return {ctor: 'Reload', _0: a};
};
var _elm_lang$navigation$Navigation$reload = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(false));
var _elm_lang$navigation$Navigation$reloadAndSkipCache = _elm_lang$navigation$Navigation$command(
	_elm_lang$navigation$Navigation$Reload(true));
var _elm_lang$navigation$Navigation$Visit = function (a) {
	return {ctor: 'Visit', _0: a};
};
var _elm_lang$navigation$Navigation$load = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Visit(url));
};
var _elm_lang$navigation$Navigation$Modify = function (a) {
	return {ctor: 'Modify', _0: a};
};
var _elm_lang$navigation$Navigation$modifyUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Modify(url));
};
var _elm_lang$navigation$Navigation$New = function (a) {
	return {ctor: 'New', _0: a};
};
var _elm_lang$navigation$Navigation$newUrl = function (url) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$New(url));
};
var _elm_lang$navigation$Navigation$Jump = function (a) {
	return {ctor: 'Jump', _0: a};
};
var _elm_lang$navigation$Navigation$back = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(0 - n));
};
var _elm_lang$navigation$Navigation$forward = function (n) {
	return _elm_lang$navigation$Navigation$command(
		_elm_lang$navigation$Navigation$Jump(n));
};
var _elm_lang$navigation$Navigation$cmdMap = F2(
	function (_p5, myCmd) {
		var _p6 = myCmd;
		switch (_p6.ctor) {
			case 'Jump':
				return _elm_lang$navigation$Navigation$Jump(_p6._0);
			case 'New':
				return _elm_lang$navigation$Navigation$New(_p6._0);
			case 'Modify':
				return _elm_lang$navigation$Navigation$Modify(_p6._0);
			case 'Visit':
				return _elm_lang$navigation$Navigation$Visit(_p6._0);
			default:
				return _elm_lang$navigation$Navigation$Reload(_p6._0);
		}
	});
var _elm_lang$navigation$Navigation$Monitor = function (a) {
	return {ctor: 'Monitor', _0: a};
};
var _elm_lang$navigation$Navigation$program = F2(
	function (locationToMessage, stuff) {
		var init = stuff.init(
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$program(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$programWithFlags = F2(
	function (locationToMessage, stuff) {
		var init = function (flags) {
			return A2(
				stuff.init,
				flags,
				_elm_lang$navigation$Native_Navigation.getLocation(
					{ctor: '_Tuple0'}));
		};
		var subs = function (model) {
			return _elm_lang$core$Platform_Sub$batch(
				{
					ctor: '::',
					_0: _elm_lang$navigation$Navigation$subscription(
						_elm_lang$navigation$Navigation$Monitor(locationToMessage)),
					_1: {
						ctor: '::',
						_0: stuff.subscriptions(model),
						_1: {ctor: '[]'}
					}
				});
		};
		return _elm_lang$html$Html$programWithFlags(
			{init: init, view: stuff.view, update: stuff.update, subscriptions: subs});
	});
var _elm_lang$navigation$Navigation$subMap = F2(
	function (func, _p7) {
		var _p8 = _p7;
		return _elm_lang$navigation$Navigation$Monitor(
			function (_p9) {
				return func(
					_p8._0(_p9));
			});
	});
var _elm_lang$navigation$Navigation$InternetExplorer = F2(
	function (a, b) {
		return {ctor: 'InternetExplorer', _0: a, _1: b};
	});
var _elm_lang$navigation$Navigation$Normal = function (a) {
	return {ctor: 'Normal', _0: a};
};
var _elm_lang$navigation$Navigation$spawnPopWatcher = function (router) {
	var reportLocation = function (_p10) {
		return A2(
			_elm_lang$core$Platform$sendToSelf,
			router,
			_elm_lang$navigation$Native_Navigation.getLocation(
				{ctor: '_Tuple0'}));
	};
	return _elm_lang$navigation$Native_Navigation.isInternetExplorer11(
		{ctor: '_Tuple0'}) ? A3(
		_elm_lang$core$Task$map2,
		_elm_lang$navigation$Navigation$InternetExplorer,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)),
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'hashchange', _elm_lang$core$Json_Decode$value, reportLocation))) : A2(
		_elm_lang$core$Task$map,
		_elm_lang$navigation$Navigation$Normal,
		_elm_lang$core$Process$spawn(
			A3(_elm_lang$dom$Dom_LowLevel$onWindow, 'popstate', _elm_lang$core$Json_Decode$value, reportLocation)));
};
var _elm_lang$navigation$Navigation$onEffects = F4(
	function (router, cmds, subs, _p11) {
		var _p12 = _p11;
		var _p15 = _p12.popWatcher;
		var stepState = function () {
			var _p13 = {ctor: '_Tuple2', _0: subs, _1: _p15};
			_v6_2:
			do {
				if (_p13._0.ctor === '[]') {
					if (_p13._1.ctor === 'Just') {
						return A2(
							_elm_lang$navigation$Navigation_ops['&>'],
							_elm_lang$navigation$Navigation$killPopWatcher(_p13._1._0),
							_elm_lang$core$Task$succeed(
								A2(_elm_lang$navigation$Navigation$State, subs, _elm_lang$core$Maybe$Nothing)));
					} else {
						break _v6_2;
					}
				} else {
					if (_p13._1.ctor === 'Nothing') {
						return A2(
							_elm_lang$core$Task$map,
							function (_p14) {
								return A2(
									_elm_lang$navigation$Navigation$State,
									subs,
									_elm_lang$core$Maybe$Just(_p14));
							},
							_elm_lang$navigation$Navigation$spawnPopWatcher(router));
					} else {
						break _v6_2;
					}
				}
			} while(false);
			return _elm_lang$core$Task$succeed(
				A2(_elm_lang$navigation$Navigation$State, subs, _p15));
		}();
		return A2(
			_elm_lang$navigation$Navigation_ops['&>'],
			_elm_lang$core$Task$sequence(
				A2(
					_elm_lang$core$List$map,
					A2(_elm_lang$navigation$Navigation$cmdHelp, router, subs),
					cmds)),
			stepState);
	});
_elm_lang$core$Native_Platform.effectManagers['Navigation'] = {pkg: 'elm-lang/navigation', init: _elm_lang$navigation$Navigation$init, onEffects: _elm_lang$navigation$Navigation$onEffects, onSelfMsg: _elm_lang$navigation$Navigation$onSelfMsg, tag: 'fx', cmdMap: _elm_lang$navigation$Navigation$cmdMap, subMap: _elm_lang$navigation$Navigation$subMap};

var _elm_lang$window$Native_Window = function()
{

var size = _elm_lang$core$Native_Scheduler.nativeBinding(function(callback)	{
	callback(_elm_lang$core$Native_Scheduler.succeed({
		width: window.innerWidth,
		height: window.innerHeight
	}));
});

return {
	size: size
};

}();
var _elm_lang$window$Window_ops = _elm_lang$window$Window_ops || {};
_elm_lang$window$Window_ops['&>'] = F2(
	function (task1, task2) {
		return A2(
			_elm_lang$core$Task$andThen,
			function (_p0) {
				return task2;
			},
			task1);
	});
var _elm_lang$window$Window$onSelfMsg = F3(
	function (router, dimensions, state) {
		var _p1 = state;
		if (_p1.ctor === 'Nothing') {
			return _elm_lang$core$Task$succeed(state);
		} else {
			var send = function (_p2) {
				var _p3 = _p2;
				return A2(
					_elm_lang$core$Platform$sendToApp,
					router,
					_p3._0(dimensions));
			};
			return A2(
				_elm_lang$window$Window_ops['&>'],
				_elm_lang$core$Task$sequence(
					A2(_elm_lang$core$List$map, send, _p1._0.subs)),
				_elm_lang$core$Task$succeed(state));
		}
	});
var _elm_lang$window$Window$init = _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
var _elm_lang$window$Window$size = _elm_lang$window$Native_Window.size;
var _elm_lang$window$Window$width = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.width;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$height = A2(
	_elm_lang$core$Task$map,
	function (_) {
		return _.height;
	},
	_elm_lang$window$Window$size);
var _elm_lang$window$Window$onEffects = F3(
	function (router, newSubs, oldState) {
		var _p4 = {ctor: '_Tuple2', _0: oldState, _1: newSubs};
		if (_p4._0.ctor === 'Nothing') {
			if (_p4._1.ctor === '[]') {
				return _elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing);
			} else {
				return A2(
					_elm_lang$core$Task$andThen,
					function (pid) {
						return _elm_lang$core$Task$succeed(
							_elm_lang$core$Maybe$Just(
								{subs: newSubs, pid: pid}));
					},
					_elm_lang$core$Process$spawn(
						A3(
							_elm_lang$dom$Dom_LowLevel$onWindow,
							'resize',
							_elm_lang$core$Json_Decode$succeed(
								{ctor: '_Tuple0'}),
							function (_p5) {
								return A2(
									_elm_lang$core$Task$andThen,
									_elm_lang$core$Platform$sendToSelf(router),
									_elm_lang$window$Window$size);
							})));
			}
		} else {
			if (_p4._1.ctor === '[]') {
				return A2(
					_elm_lang$window$Window_ops['&>'],
					_elm_lang$core$Process$kill(_p4._0._0.pid),
					_elm_lang$core$Task$succeed(_elm_lang$core$Maybe$Nothing));
			} else {
				return _elm_lang$core$Task$succeed(
					_elm_lang$core$Maybe$Just(
						{subs: newSubs, pid: _p4._0._0.pid}));
			}
		}
	});
var _elm_lang$window$Window$subscription = _elm_lang$core$Native_Platform.leaf('Window');
var _elm_lang$window$Window$Size = F2(
	function (a, b) {
		return {width: a, height: b};
	});
var _elm_lang$window$Window$MySub = function (a) {
	return {ctor: 'MySub', _0: a};
};
var _elm_lang$window$Window$resizes = function (tagger) {
	return _elm_lang$window$Window$subscription(
		_elm_lang$window$Window$MySub(tagger));
};
var _elm_lang$window$Window$subMap = F2(
	function (func, _p6) {
		var _p7 = _p6;
		return _elm_lang$window$Window$MySub(
			function (_p8) {
				return func(
					_p7._0(_p8));
			});
	});
_elm_lang$core$Native_Platform.effectManagers['Window'] = {pkg: 'elm-lang/window', init: _elm_lang$window$Window$init, onEffects: _elm_lang$window$Window$onEffects, onSelfMsg: _elm_lang$window$Window$onSelfMsg, tag: 'sub', subMap: _elm_lang$window$Window$subMap};

var _evancz$url_parser$UrlParser$toKeyValuePair = function (segment) {
	var _p0 = A2(_elm_lang$core$String$split, '=', segment);
	if (((_p0.ctor === '::') && (_p0._1.ctor === '::')) && (_p0._1._1.ctor === '[]')) {
		return A3(
			_elm_lang$core$Maybe$map2,
			F2(
				function (v0, v1) {
					return {ctor: '_Tuple2', _0: v0, _1: v1};
				}),
			_elm_lang$http$Http$decodeUri(_p0._0),
			_elm_lang$http$Http$decodeUri(_p0._1._0));
	} else {
		return _elm_lang$core$Maybe$Nothing;
	}
};
var _evancz$url_parser$UrlParser$parseParams = function (queryString) {
	return _elm_lang$core$Dict$fromList(
		A2(
			_elm_lang$core$List$filterMap,
			_evancz$url_parser$UrlParser$toKeyValuePair,
			A2(
				_elm_lang$core$String$split,
				'&',
				A2(_elm_lang$core$String$dropLeft, 1, queryString))));
};
var _evancz$url_parser$UrlParser$splitUrl = function (url) {
	var _p1 = A2(_elm_lang$core$String$split, '/', url);
	if ((_p1.ctor === '::') && (_p1._0 === '')) {
		return _p1._1;
	} else {
		return _p1;
	}
};
var _evancz$url_parser$UrlParser$parseHelp = function (states) {
	parseHelp:
	while (true) {
		var _p2 = states;
		if (_p2.ctor === '[]') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var _p4 = _p2._0;
			var _p3 = _p4.unvisited;
			if (_p3.ctor === '[]') {
				return _elm_lang$core$Maybe$Just(_p4.value);
			} else {
				if ((_p3._0 === '') && (_p3._1.ctor === '[]')) {
					return _elm_lang$core$Maybe$Just(_p4.value);
				} else {
					var _v4 = _p2._1;
					states = _v4;
					continue parseHelp;
				}
			}
		}
	}
};
var _evancz$url_parser$UrlParser$parse = F3(
	function (_p5, url, params) {
		var _p6 = _p5;
		return _evancz$url_parser$UrlParser$parseHelp(
			_p6._0(
				{
					visited: {ctor: '[]'},
					unvisited: _evancz$url_parser$UrlParser$splitUrl(url),
					params: params,
					value: _elm_lang$core$Basics$identity
				}));
	});
var _evancz$url_parser$UrlParser$parseHash = F2(
	function (parser, location) {
		return A3(
			_evancz$url_parser$UrlParser$parse,
			parser,
			A2(_elm_lang$core$String$dropLeft, 1, location.hash),
			_evancz$url_parser$UrlParser$parseParams(location.search));
	});
var _evancz$url_parser$UrlParser$parsePath = F2(
	function (parser, location) {
		return A3(
			_evancz$url_parser$UrlParser$parse,
			parser,
			location.pathname,
			_evancz$url_parser$UrlParser$parseParams(location.search));
	});
var _evancz$url_parser$UrlParser$intParamHelp = function (maybeValue) {
	var _p7 = maybeValue;
	if (_p7.ctor === 'Nothing') {
		return _elm_lang$core$Maybe$Nothing;
	} else {
		return _elm_lang$core$Result$toMaybe(
			_elm_lang$core$String$toInt(_p7._0));
	}
};
var _evancz$url_parser$UrlParser$mapHelp = F2(
	function (func, _p8) {
		var _p9 = _p8;
		return {
			visited: _p9.visited,
			unvisited: _p9.unvisited,
			params: _p9.params,
			value: func(_p9.value)
		};
	});
var _evancz$url_parser$UrlParser$State = F4(
	function (a, b, c, d) {
		return {visited: a, unvisited: b, params: c, value: d};
	});
var _evancz$url_parser$UrlParser$Parser = function (a) {
	return {ctor: 'Parser', _0: a};
};
var _evancz$url_parser$UrlParser$s = function (str) {
	return _evancz$url_parser$UrlParser$Parser(
		function (_p10) {
			var _p11 = _p10;
			var _p12 = _p11.unvisited;
			if (_p12.ctor === '[]') {
				return {ctor: '[]'};
			} else {
				var _p13 = _p12._0;
				return _elm_lang$core$Native_Utils.eq(_p13, str) ? {
					ctor: '::',
					_0: A4(
						_evancz$url_parser$UrlParser$State,
						{ctor: '::', _0: _p13, _1: _p11.visited},
						_p12._1,
						_p11.params,
						_p11.value),
					_1: {ctor: '[]'}
				} : {ctor: '[]'};
			}
		});
};
var _evancz$url_parser$UrlParser$custom = F2(
	function (tipe, stringToSomething) {
		return _evancz$url_parser$UrlParser$Parser(
			function (_p14) {
				var _p15 = _p14;
				var _p16 = _p15.unvisited;
				if (_p16.ctor === '[]') {
					return {ctor: '[]'};
				} else {
					var _p18 = _p16._0;
					var _p17 = stringToSomething(_p18);
					if (_p17.ctor === 'Ok') {
						return {
							ctor: '::',
							_0: A4(
								_evancz$url_parser$UrlParser$State,
								{ctor: '::', _0: _p18, _1: _p15.visited},
								_p16._1,
								_p15.params,
								_p15.value(_p17._0)),
							_1: {ctor: '[]'}
						};
					} else {
						return {ctor: '[]'};
					}
				}
			});
	});
var _evancz$url_parser$UrlParser$string = A2(_evancz$url_parser$UrlParser$custom, 'STRING', _elm_lang$core$Result$Ok);
var _evancz$url_parser$UrlParser$int = A2(_evancz$url_parser$UrlParser$custom, 'NUMBER', _elm_lang$core$String$toInt);
var _evancz$url_parser$UrlParser_ops = _evancz$url_parser$UrlParser_ops || {};
_evancz$url_parser$UrlParser_ops['</>'] = F2(
	function (_p20, _p19) {
		var _p21 = _p20;
		var _p22 = _p19;
		return _evancz$url_parser$UrlParser$Parser(
			function (state) {
				return A2(
					_elm_lang$core$List$concatMap,
					_p22._0,
					_p21._0(state));
			});
	});
var _evancz$url_parser$UrlParser$map = F2(
	function (subValue, _p23) {
		var _p24 = _p23;
		return _evancz$url_parser$UrlParser$Parser(
			function (_p25) {
				var _p26 = _p25;
				return A2(
					_elm_lang$core$List$map,
					_evancz$url_parser$UrlParser$mapHelp(_p26.value),
					_p24._0(
						{visited: _p26.visited, unvisited: _p26.unvisited, params: _p26.params, value: subValue}));
			});
	});
var _evancz$url_parser$UrlParser$oneOf = function (parsers) {
	return _evancz$url_parser$UrlParser$Parser(
		function (state) {
			return A2(
				_elm_lang$core$List$concatMap,
				function (_p27) {
					var _p28 = _p27;
					return _p28._0(state);
				},
				parsers);
		});
};
var _evancz$url_parser$UrlParser$top = _evancz$url_parser$UrlParser$Parser(
	function (state) {
		return {
			ctor: '::',
			_0: state,
			_1: {ctor: '[]'}
		};
	});
var _evancz$url_parser$UrlParser_ops = _evancz$url_parser$UrlParser_ops || {};
_evancz$url_parser$UrlParser_ops['<?>'] = F2(
	function (_p30, _p29) {
		var _p31 = _p30;
		var _p32 = _p29;
		return _evancz$url_parser$UrlParser$Parser(
			function (state) {
				return A2(
					_elm_lang$core$List$concatMap,
					_p32._0,
					_p31._0(state));
			});
	});
var _evancz$url_parser$UrlParser$QueryParser = function (a) {
	return {ctor: 'QueryParser', _0: a};
};
var _evancz$url_parser$UrlParser$customParam = F2(
	function (key, func) {
		return _evancz$url_parser$UrlParser$QueryParser(
			function (_p33) {
				var _p34 = _p33;
				var _p35 = _p34.params;
				return {
					ctor: '::',
					_0: A4(
						_evancz$url_parser$UrlParser$State,
						_p34.visited,
						_p34.unvisited,
						_p35,
						_p34.value(
							func(
								A2(_elm_lang$core$Dict$get, key, _p35)))),
					_1: {ctor: '[]'}
				};
			});
	});
var _evancz$url_parser$UrlParser$stringParam = function (name) {
	return A2(_evancz$url_parser$UrlParser$customParam, name, _elm_lang$core$Basics$identity);
};
var _evancz$url_parser$UrlParser$intParam = function (name) {
	return A2(_evancz$url_parser$UrlParser$customParam, name, _evancz$url_parser$UrlParser$intParamHelp);
};

var _mdgriffith$stylish_elephants$Internal_Style$overrides = '@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {\n  .se.row > .se { flex-basis: auto !important; }\n  .se.row > .se.container { flex-basis: auto !important; }\n}';
var _mdgriffith$stylish_elephants$Internal_Style$dot = function (c) {
	return A2(_elm_lang$core$Basics_ops['++'], '.', c);
};
var _mdgriffith$stylish_elephants$Internal_Style$lenToString = function (len) {
	var _p0 = len;
	if (_p0.ctor === 'Shrink') {
		return 'content';
	} else {
		return 'fill';
	}
};
var _mdgriffith$stylish_elephants$Internal_Style$dimensionToString = function (x) {
	var _p1 = x;
	if (_p1.ctor === 'Width') {
		return 'width';
	} else {
		return 'height';
	}
};
var _mdgriffith$stylish_elephants$Internal_Style$single = {root: 'z', any: 's', single: 'e', row: 'r', column: 'c', page: 'l', paragraph: 'p', text: 't', grid: 'g', widthFill: '↔', widthContent: 'wc', widthExact: 'w', heightFill: '↕', heightContent: 'hc', heightExact: 'h', above: 'o', below: 'u', onRight: 'r', onLeft: 'l', inFront: 'f', behind: 'b', alignTop: '⤒', alignBottom: '⤓', alignRight: '⇥', alignLeft: '⇤', alignCenterX: 'self-center-x', alignCenterY: 'self-center-y', spaceEvenly: 'space-evenly', container: 'container', contentTop: 'c⤒', contentBottom: 'c⤓', contentRight: 'c⇥', contentLeft: 'c⇤', contentCenterX: 'content-center-x', contentCenterY: 'content-center-y', noTextSelection: 'no-text-selection', cursorPointer: 'cursor-pointer', cursorText: 'cursor-text', passPointerEvents: 'pass-pointer-events', capturePointerEvents: 'capture-pointer-events', transparent: 'transparent', opaque: 'opaque', overflowHidden: 'overflow-hidden', scrollbars: 'scrollbars', scrollbarsX: 'scrollbars-x', scrollbarsY: 'scrollbars-y', clip: '✂', clipX: '✂x', clipY: '✂y', borderNone: 'border-none', borderDashed: 'border-dashed', borderDotted: 'border-dotted', borderSolid: 'border-solid', textThin: 'text-thin', textExtraLight: 'text-extra-light', textLight: 'text-light', textNormalWeight: 'text-normal-weight', textMedium: 'text-medium', textSemiBold: 'text-semi-bold', bold: 'b', textExtraBold: 'text-extra-bold', textHeavy: 'text-heavy', italic: 'i', strike: '-', underline: 'u', textUnitalicized: 'text-unitalicized', textJustify: 'text-justify', textJustifyAll: 'text-justify-all', textCenter: 'text-center', textRight: 'text-right', textLeft: 'text-left'};
var _mdgriffith$stylish_elephants$Internal_Style$unicode = {root: 'style-elements', any: 's', single: 'e', row: '⋯', column: '⋮', page: '🗏', paragraph: 'p', text: 'text', grid: '▦', widthFill: '↔', widthContent: 'width-content', widthExact: 'width-exact', heightFill: '↕', heightContent: 'height-content', heightExact: 'height-exact', above: 'above', below: 'below', onRight: 'on-right', onLeft: 'on-left', inFront: 'infront', behind: 'behind', alignTop: '⤒', alignBottom: '⤓', alignRight: '⇥', alignLeft: '⇤', alignCenterX: 'self-center-x', alignCenterY: 'self-center-y', spaceEvenly: 'space-evenly', container: 'container', contentTop: 'content-top', contentBottom: 'content-bottom', contentRight: 'content-right', contentLeft: 'content-left', contentCenterX: 'content-center-x', contentCenterY: 'content-center-y', noTextSelection: 'no-text-selection', cursorPointer: 'cursor-pointer', cursorText: 'cursor-text', passPointerEvents: 'pass-pointer-events', capturePointerEvents: 'capture-pointer-events', transparent: 'transparent', opaque: 'opaque', overflowHidden: 'overflow-hidden', scrollbars: 'scrollbars', scrollbarsX: 'scrollbars-x', scrollbarsY: 'scrollbars-y', clip: '✂', clipX: '✂x', clipY: '✂y', borderNone: 'border-none', borderDashed: 'border-dashed', borderDotted: 'border-dotted', borderSolid: 'border-solid', textThin: 'text-thin', textExtraLight: 'text-extra-light', textLight: 'text-light', textNormalWeight: 'text-normal-weight', textMedium: 'text-medium', textSemiBold: 'text-semi-bold', bold: 'bold', textExtraBold: 'text-extra-bold', textHeavy: 'text-heavy', italic: 'italic', strike: 'strike', underline: 'underline', textUnitalicized: 'text-unitalicized', textJustify: 'text-justify', textJustifyAll: 'text-justify-all', textCenter: 'text-center', textRight: 'text-right', textLeft: 'text-left'};
var _mdgriffith$stylish_elephants$Internal_Style$classes = {root: 'style-elements', any: 'se', single: 'el', row: 'row', column: 'column', page: 'page', paragraph: 'paragraph', text: 'text', grid: 'grid', widthFill: 'width-fill', widthContent: 'width-content', widthExact: 'width-exact', heightFill: 'height-fill', heightContent: 'height-content', heightExact: 'height-exact', above: 'above', below: 'below', onRight: 'on-right', onLeft: 'on-left', inFront: 'infront', behind: 'behind', alignTop: 'self-top', alignBottom: 'self-bottom', alignRight: 'self-right', alignLeft: 'self-left', alignCenterX: 'self-center-x', alignCenterY: 'self-center-y', spaceEvenly: 'space-evenly', container: 'container', contentTop: 'content-top', contentBottom: 'content-bottom', contentRight: 'content-right', contentLeft: 'content-left', contentCenterX: 'content-center-x', contentCenterY: 'content-center-y', noTextSelection: 'no-text-selection', cursorPointer: 'cursor-pointer', cursorText: 'cursor-text', passPointerEvents: 'pass-pointer-events', capturePointerEvents: 'capture-pointer-events', transparent: 'transparent', opaque: 'opaque', overflowHidden: 'overflow-hidden', scrollbars: 'scrollbars', scrollbarsX: 'scrollbars-x', scrollbarsY: 'scrollbars-y', clip: 'clip', clipX: 'clip-x', clipY: 'clip-y', borderNone: 'border-none', borderDashed: 'border-dashed', borderDotted: 'border-dotted', borderSolid: 'border-solid', textThin: 'text-thin', textExtraLight: 'text-extra-light', textLight: 'text-light', textNormalWeight: 'text-normal-weight', textMedium: 'text-medium', textSemiBold: 'text-semi-bold', bold: 'bold', textExtraBold: 'text-extra-bold', textHeavy: 'text-heavy', italic: 'italic', strike: 'strike', underline: 'underline', textUnitalicized: 'text-unitalicized', textJustify: 'text-justify', textJustifyAll: 'text-justify-all', textCenter: 'text-center', textRight: 'text-right', textLeft: 'text-left'};
var _mdgriffith$stylish_elephants$Internal_Style$contentName = function (desc) {
	var _p2 = desc;
	switch (_p2._0.ctor) {
		case 'Top':
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.contentTop);
		case 'Bottom':
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.contentBottom);
		case 'Right':
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.contentRight);
		case 'Left':
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.contentLeft);
		case 'CenterX':
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterX);
		default:
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterY);
	}
};
var _mdgriffith$stylish_elephants$Internal_Style$selfName = function (desc) {
	var _p3 = desc;
	switch (_p3._0.ctor) {
		case 'Top':
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignTop);
		case 'Bottom':
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignBottom);
		case 'Right':
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignRight);
		case 'Left':
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignLeft);
		case 'CenterX':
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignCenterX);
		default:
			return _mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignCenterY);
	}
};
var _mdgriffith$stylish_elephants$Internal_Style$Class = F2(
	function (a, b) {
		return {ctor: 'Class', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Style$Batch = function (a) {
	return {ctor: 'Batch', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Style$Adjacent = F2(
	function (a, b) {
		return {ctor: 'Adjacent', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Style$Descriptor = F2(
	function (a, b) {
		return {ctor: 'Descriptor', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Style$Supports = F2(
	function (a, b) {
		return {ctor: 'Supports', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Style$Child = F2(
	function (a, b) {
		return {ctor: 'Child', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Style$Prop = F2(
	function (a, b) {
		return {ctor: 'Prop', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Style$makeImportant = function (rule) {
	var _p4 = rule;
	if (_p4.ctor === 'Prop') {
		return A2(
			_mdgriffith$stylish_elephants$Internal_Style$Prop,
			_p4._0,
			A2(_elm_lang$core$Basics_ops['++'], _p4._1, ' !important'));
	} else {
		return rule;
	}
};
var _mdgriffith$stylish_elephants$Internal_Style$describeText = F2(
	function (cls, props) {
		return A2(
			_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
			cls,
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(_elm_lang$core$List$map, _mdgriffith$stylish_elephants$Internal_Style$makeImportant, props),
				{
					ctor: '::',
					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Child, '.text', props),
					_1: {
						ctor: '::',
						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Child, '.el', props),
						_1: {
							ctor: '::',
							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Child, '.el > .text', props),
							_1: {ctor: '[]'}
						}
					}
				}));
	});
var _mdgriffith$stylish_elephants$Internal_Style$Spacer = {ctor: 'Spacer'};
var _mdgriffith$stylish_elephants$Internal_Style$Grid = {ctor: 'Grid'};
var _mdgriffith$stylish_elephants$Internal_Style$Text = {ctor: 'Text'};
var _mdgriffith$stylish_elephants$Internal_Style$Page = {ctor: 'Page'};
var _mdgriffith$stylish_elephants$Internal_Style$Paragraph = {ctor: 'Paragraph'};
var _mdgriffith$stylish_elephants$Internal_Style$Column = {ctor: 'Column'};
var _mdgriffith$stylish_elephants$Internal_Style$Row = {ctor: 'Row'};
var _mdgriffith$stylish_elephants$Internal_Style$Single = {ctor: 'Single'};
var _mdgriffith$stylish_elephants$Internal_Style$Any = {ctor: 'Any'};
var _mdgriffith$stylish_elephants$Internal_Style$Root = {ctor: 'Root'};
var _mdgriffith$stylish_elephants$Internal_Style$Behind = {ctor: 'Behind'};
var _mdgriffith$stylish_elephants$Internal_Style$Within = {ctor: 'Within'};
var _mdgriffith$stylish_elephants$Internal_Style$OnLeft = {ctor: 'OnLeft'};
var _mdgriffith$stylish_elephants$Internal_Style$OnRight = {ctor: 'OnRight'};
var _mdgriffith$stylish_elephants$Internal_Style$Below = {ctor: 'Below'};
var _mdgriffith$stylish_elephants$Internal_Style$Above = {ctor: 'Above'};
var _mdgriffith$stylish_elephants$Internal_Style$locations = function () {
	var loc = _mdgriffith$stylish_elephants$Internal_Style$Above;
	var _p5 = function () {
		var _p6 = loc;
		switch (_p6.ctor) {
			case 'Above':
				return {ctor: '_Tuple0'};
			case 'Below':
				return {ctor: '_Tuple0'};
			case 'OnRight':
				return {ctor: '_Tuple0'};
			case 'OnLeft':
				return {ctor: '_Tuple0'};
			case 'Within':
				return {ctor: '_Tuple0'};
			default:
				return {ctor: '_Tuple0'};
		}
	}();
	return {
		ctor: '::',
		_0: _mdgriffith$stylish_elephants$Internal_Style$Above,
		_1: {
			ctor: '::',
			_0: _mdgriffith$stylish_elephants$Internal_Style$Below,
			_1: {
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Internal_Style$OnRight,
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Internal_Style$OnLeft,
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Internal_Style$Within,
						_1: {
							ctor: '::',
							_0: _mdgriffith$stylish_elephants$Internal_Style$Behind,
							_1: {ctor: '[]'}
						}
					}
				}
			}
		}
	};
}();
var _mdgriffith$stylish_elephants$Internal_Style$Fill = {ctor: 'Fill'};
var _mdgriffith$stylish_elephants$Internal_Style$Shrink = {ctor: 'Shrink'};
var _mdgriffith$stylish_elephants$Internal_Style$lengths = {
	ctor: '::',
	_0: _mdgriffith$stylish_elephants$Internal_Style$Shrink,
	_1: {
		ctor: '::',
		_0: _mdgriffith$stylish_elephants$Internal_Style$Fill,
		_1: {ctor: '[]'}
	}
};
var _mdgriffith$stylish_elephants$Internal_Style$describeLength = F2(
	function (dimension, lenValue) {
		var name = _mdgriffith$stylish_elephants$Internal_Style$dimensionToString(dimension);
		var renderLengthRule = function (len) {
			return A2(
				_mdgriffith$stylish_elephants$Internal_Style$Child,
				A2(
					_elm_lang$core$Basics_ops['++'],
					'.',
					A2(
						_elm_lang$core$Basics_ops['++'],
						name,
						A2(
							_elm_lang$core$Basics_ops['++'],
							'-',
							_mdgriffith$stylish_elephants$Internal_Style$lenToString(len)))),
				{
					ctor: '::',
					_0: lenValue(len),
					_1: {ctor: '[]'}
				});
		};
		return _mdgriffith$stylish_elephants$Internal_Style$Batch(
			A2(_elm_lang$core$List$map, renderLengthRule, _mdgriffith$stylish_elephants$Internal_Style$lengths));
	});
var _mdgriffith$stylish_elephants$Internal_Style$Height = {ctor: 'Height'};
var _mdgriffith$stylish_elephants$Internal_Style$Width = {ctor: 'Width'};
var _mdgriffith$stylish_elephants$Internal_Style$Self = function (a) {
	return {ctor: 'Self', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Style$Content = function (a) {
	return {ctor: 'Content', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Style$CenterY = {ctor: 'CenterY'};
var _mdgriffith$stylish_elephants$Internal_Style$CenterX = {ctor: 'CenterX'};
var _mdgriffith$stylish_elephants$Internal_Style$Left = {ctor: 'Left'};
var _mdgriffith$stylish_elephants$Internal_Style$Right = {ctor: 'Right'};
var _mdgriffith$stylish_elephants$Internal_Style$Bottom = {ctor: 'Bottom'};
var _mdgriffith$stylish_elephants$Internal_Style$Top = {ctor: 'Top'};
var _mdgriffith$stylish_elephants$Internal_Style$alignments = {
	ctor: '::',
	_0: _mdgriffith$stylish_elephants$Internal_Style$Top,
	_1: {
		ctor: '::',
		_0: _mdgriffith$stylish_elephants$Internal_Style$Bottom,
		_1: {
			ctor: '::',
			_0: _mdgriffith$stylish_elephants$Internal_Style$Right,
			_1: {
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Internal_Style$Left,
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Internal_Style$CenterX,
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Internal_Style$CenterY,
						_1: {ctor: '[]'}
					}
				}
			}
		}
	}
};
var _mdgriffith$stylish_elephants$Internal_Style$describeAlignment = function (values) {
	var createDescription = function (alignment) {
		var _p7 = values(alignment);
		var content = _p7._0;
		var indiv = _p7._1;
		return {
			ctor: '::',
			_0: A2(
				_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
				_mdgriffith$stylish_elephants$Internal_Style$contentName(
					_mdgriffith$stylish_elephants$Internal_Style$Content(alignment)),
				content),
			_1: {
				ctor: '::',
				_0: A2(
					_mdgriffith$stylish_elephants$Internal_Style$Child,
					_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.any),
					{
						ctor: '::',
						_0: A2(
							_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
							_mdgriffith$stylish_elephants$Internal_Style$selfName(
								_mdgriffith$stylish_elephants$Internal_Style$Self(alignment)),
							indiv),
						_1: {ctor: '[]'}
					}),
				_1: {ctor: '[]'}
			}
		};
	};
	return _mdgriffith$stylish_elephants$Internal_Style$Batch(
		A2(_elm_lang$core$List$concatMap, createDescription, _mdgriffith$stylish_elephants$Internal_Style$alignments));
};
var _mdgriffith$stylish_elephants$Internal_Style$gridAlignments = function (values) {
	var createDescription = function (alignment) {
		return {
			ctor: '::',
			_0: A2(
				_mdgriffith$stylish_elephants$Internal_Style$Child,
				_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.any),
				{
					ctor: '::',
					_0: A2(
						_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
						_mdgriffith$stylish_elephants$Internal_Style$selfName(
							_mdgriffith$stylish_elephants$Internal_Style$Self(alignment)),
						values(alignment)),
					_1: {ctor: '[]'}
				}),
			_1: {ctor: '[]'}
		};
	};
	return _mdgriffith$stylish_elephants$Internal_Style$Batch(
		A2(_elm_lang$core$List$concatMap, createDescription, _mdgriffith$stylish_elephants$Internal_Style$alignments));
};
var _mdgriffith$stylish_elephants$Internal_Style$Intermediate = function (a) {
	return {ctor: 'Intermediate', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Style$emptyIntermediate = F2(
	function (selector, closing) {
		return _mdgriffith$stylish_elephants$Internal_Style$Intermediate(
			{
				selector: selector,
				props: {ctor: '[]'},
				closing: closing,
				others: {ctor: '[]'}
			});
	});
var _mdgriffith$stylish_elephants$Internal_Style$renderRules = F2(
	function (_p8, rules) {
		var _p9 = _p8;
		var _p11 = _p9._0;
		var generateIntermediates = F2(
			function (rule, rendered) {
				var _p10 = rule;
				switch (_p10.ctor) {
					case 'Prop':
						return _elm_lang$core$Native_Utils.update(
							rendered,
							{
								props: {
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: _p10._0, _1: _p10._1},
									_1: rendered.props
								}
							});
					case 'Supports':
						return _elm_lang$core$Native_Utils.update(
							rendered,
							{
								others: {
									ctor: '::',
									_0: _mdgriffith$stylish_elephants$Internal_Style$Intermediate(
										{
											selector: A2(
												_elm_lang$core$Basics_ops['++'],
												'@supports (',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_p10._0._0,
													A2(
														_elm_lang$core$Basics_ops['++'],
														':',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_p10._0._1,
															A2(_elm_lang$core$Basics_ops['++'], ') {', _p11.selector))))),
											props: _p10._1,
											closing: '\n}',
											others: {ctor: '[]'}
										}),
									_1: rendered.others
								}
							});
					case 'Adjacent':
						return _elm_lang$core$Native_Utils.update(
							rendered,
							{
								others: {
									ctor: '::',
									_0: A2(
										_mdgriffith$stylish_elephants$Internal_Style$renderRules,
										A2(
											_mdgriffith$stylish_elephants$Internal_Style$emptyIntermediate,
											A2(
												_elm_lang$core$Basics_ops['++'],
												_p11.selector,
												A2(_elm_lang$core$Basics_ops['++'], ' + ', _p10._0)),
											''),
										_p10._1),
									_1: rendered.others
								}
							});
					case 'Child':
						return _elm_lang$core$Native_Utils.update(
							rendered,
							{
								others: {
									ctor: '::',
									_0: A2(
										_mdgriffith$stylish_elephants$Internal_Style$renderRules,
										A2(
											_mdgriffith$stylish_elephants$Internal_Style$emptyIntermediate,
											A2(
												_elm_lang$core$Basics_ops['++'],
												_p11.selector,
												A2(_elm_lang$core$Basics_ops['++'], ' > ', _p10._0)),
											''),
										_p10._1),
									_1: rendered.others
								}
							});
					case 'Descriptor':
						return _elm_lang$core$Native_Utils.update(
							rendered,
							{
								others: {
									ctor: '::',
									_0: A2(
										_mdgriffith$stylish_elephants$Internal_Style$renderRules,
										A2(
											_mdgriffith$stylish_elephants$Internal_Style$emptyIntermediate,
											A2(_elm_lang$core$Basics_ops['++'], _p11.selector, _p10._0),
											''),
										_p10._1),
									_1: rendered.others
								}
							});
					default:
						return _elm_lang$core$Native_Utils.update(
							rendered,
							{
								others: {
									ctor: '::',
									_0: A2(
										_mdgriffith$stylish_elephants$Internal_Style$renderRules,
										A2(_mdgriffith$stylish_elephants$Internal_Style$emptyIntermediate, _p11.selector, ''),
										_p10._0),
									_1: rendered.others
								}
							});
				}
			});
		return _mdgriffith$stylish_elephants$Internal_Style$Intermediate(
			A3(_elm_lang$core$List$foldr, generateIntermediates, _p11, rules));
	});
var _mdgriffith$stylish_elephants$Internal_Style$render = function (classes) {
	var renderValues = function (values) {
		return A2(
			_elm_lang$core$String$join,
			'\n',
			A2(
				_elm_lang$core$List$map,
				function (_p12) {
					var _p13 = _p12;
					return A2(
						_elm_lang$core$Basics_ops['++'],
						'  ',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_p13._0,
							A2(
								_elm_lang$core$Basics_ops['++'],
								': ',
								A2(_elm_lang$core$Basics_ops['++'], _p13._1, ';'))));
				},
				values));
	};
	var renderClass = function (rule) {
		var _p14 = rule.props;
		if (_p14.ctor === '[]') {
			return '';
		} else {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				rule.selector,
				A2(
					_elm_lang$core$Basics_ops['++'],
					' {\n',
					A2(
						_elm_lang$core$Basics_ops['++'],
						renderValues(rule.props),
						A2(_elm_lang$core$Basics_ops['++'], rule.closing, '\n}'))));
		}
	};
	var renderIntermediate = function (_p15) {
		var _p16 = _p15;
		var _p17 = _p16._0;
		return A2(
			_elm_lang$core$Basics_ops['++'],
			renderClass(_p17),
			A2(
				_elm_lang$core$String$join,
				'\n',
				A2(_elm_lang$core$List$map, renderIntermediate, _p17.others)));
	};
	return A2(
		_elm_lang$core$String$join,
		'\n',
		A2(
			_elm_lang$core$List$map,
			renderIntermediate,
			A3(
				_elm_lang$core$List$foldr,
				F2(
					function (_p18, existing) {
						var _p19 = _p18;
						return {
							ctor: '::',
							_0: A2(
								_mdgriffith$stylish_elephants$Internal_Style$renderRules,
								A2(_mdgriffith$stylish_elephants$Internal_Style$emptyIntermediate, _p19._0, ''),
								_p19._1),
							_1: existing
						};
					}),
				{ctor: '[]'},
				classes)));
};
var _mdgriffith$stylish_elephants$Internal_Style$renderCompact = function (classes) {
	var renderValues = function (values) {
		return A2(
			_elm_lang$core$String$join,
			'',
			A2(
				_elm_lang$core$List$map,
				function (_p20) {
					var _p21 = _p20;
					return A2(
						_elm_lang$core$Basics_ops['++'],
						'',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_p21._0,
							A2(
								_elm_lang$core$Basics_ops['++'],
								':',
								A2(_elm_lang$core$Basics_ops['++'], _p21._1, ';'))));
				},
				values));
	};
	var renderClass = function (rule) {
		var _p22 = rule.props;
		if (_p22.ctor === '[]') {
			return '';
		} else {
			return A2(
				_elm_lang$core$Basics_ops['++'],
				rule.selector,
				A2(
					_elm_lang$core$Basics_ops['++'],
					'{',
					A2(
						_elm_lang$core$Basics_ops['++'],
						renderValues(rule.props),
						A2(_elm_lang$core$Basics_ops['++'], rule.closing, '}'))));
		}
	};
	var renderIntermediate = function (_p23) {
		var _p24 = _p23;
		var _p25 = _p24._0;
		return A2(
			_elm_lang$core$Basics_ops['++'],
			renderClass(_p25),
			A2(
				_elm_lang$core$String$join,
				'',
				A2(_elm_lang$core$List$map, renderIntermediate, _p25.others)));
	};
	return A2(
		_elm_lang$core$String$join,
		'',
		A2(
			_elm_lang$core$List$map,
			renderIntermediate,
			A3(
				_elm_lang$core$List$foldr,
				F2(
					function (_p26, existing) {
						var _p27 = _p26;
						return {
							ctor: '::',
							_0: A2(
								_mdgriffith$stylish_elephants$Internal_Style$renderRules,
								A2(_mdgriffith$stylish_elephants$Internal_Style$emptyIntermediate, _p27._0, ''),
								_p27._1),
							_1: existing
						};
					}),
				{ctor: '[]'},
				classes)));
};
var _mdgriffith$stylish_elephants$Internal_Style$rules = A2(
	_elm_lang$core$Basics_ops['++'],
	_mdgriffith$stylish_elephants$Internal_Style$overrides,
	_mdgriffith$stylish_elephants$Internal_Style$renderCompact(
		{
			ctor: '::',
			_0: A2(
				_mdgriffith$stylish_elephants$Internal_Style$Class,
				'html,body',
				{
					ctor: '::',
					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', '100%'),
					_1: {
						ctor: '::',
						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'padding', '0'),
						_1: {
							ctor: '::',
							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin', '0'),
							_1: {ctor: '[]'}
						}
					}
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_mdgriffith$stylish_elephants$Internal_Style$Class,
					A2(
						_elm_lang$core$Basics_ops['++'],
						_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.any),
						':focus'),
					{
						ctor: '::',
						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'outline', 'none'),
						_1: {ctor: '[]'}
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_mdgriffith$stylish_elephants$Internal_Style$Class,
						_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.root),
						{
							ctor: '::',
							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'width', '100%'),
							_1: {
								ctor: '::',
								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', 'auto'),
								_1: {
									ctor: '::',
									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'min-height', '100%'),
									_1: {
										ctor: '::',
										_0: A2(
											_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
											'.se.el.height-content',
											{
												ctor: '::',
												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', '100%'),
												_1: {
													ctor: '::',
													_0: A2(
														_mdgriffith$stylish_elephants$Internal_Style$Child,
														_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.heightFill),
														{
															ctor: '::',
															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', '100%'),
															_1: {ctor: '[]'}
														}),
													_1: {ctor: '[]'}
												}
											}),
										_1: {
											ctor: '::',
											_0: A2(
												_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
												A2(_elm_lang$core$Basics_ops['++'], '.wireframe .', _mdgriffith$stylish_elephants$Internal_Style$classes.any),
												{
													ctor: '::',
													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'outline', '2px dashed black'),
													_1: {ctor: '[]'}
												}),
											_1: {ctor: '[]'}
										}
									}
								}
							}
						}),
					_1: {
						ctor: '::',
						_0: A2(
							_mdgriffith$stylish_elephants$Internal_Style$Class,
							_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.any),
							{
								ctor: '::',
								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'position', 'relative'),
								_1: {
									ctor: '::',
									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'border', 'none'),
									_1: {
										ctor: '::',
										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-shrink', '0'),
										_1: {
											ctor: '::',
											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'flex'),
											_1: {
												ctor: '::',
												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-direction', 'row'),
												_1: {
													ctor: '::',
													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-basis', 'auto'),
													_1: {
														ctor: '::',
														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'resize', 'none'),
														_1: {
															ctor: '::',
															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'box-sizing', 'border-box'),
															_1: {
																ctor: '::',
																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin', '0'),
																_1: {
																	ctor: '::',
																	_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'padding', '0'),
																	_1: {
																		ctor: '::',
																		_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'border-width', '0'),
																		_1: {
																			ctor: '::',
																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'border-style', 'solid'),
																			_1: {
																				ctor: '::',
																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-size', 'inherit'),
																				_1: {
																					ctor: '::',
																					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'color', 'inherit'),
																					_1: {
																						ctor: '::',
																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-family', 'inherit'),
																						_1: {
																							ctor: '::',
																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'line-height', '1'),
																							_1: {
																								ctor: '::',
																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-weight', 'inherit'),
																								_1: {
																									ctor: '::',
																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'text-decoration', 'none'),
																									_1: {
																										ctor: '::',
																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-style', 'inherit'),
																										_1: {
																											ctor: '::',
																											_0: A2(
																												_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																												_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.noTextSelection),
																												{
																													ctor: '::',
																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'user-select', 'none'),
																													_1: {
																														ctor: '::',
																														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, '-ms-user-select', 'none'),
																														_1: {ctor: '[]'}
																													}
																												}),
																											_1: {
																												ctor: '::',
																												_0: A2(
																													_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																													_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.cursorPointer),
																													{
																														ctor: '::',
																														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'cursor', 'pointer'),
																														_1: {ctor: '[]'}
																													}),
																												_1: {
																													ctor: '::',
																													_0: A2(
																														_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																														_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.cursorText),
																														{
																															ctor: '::',
																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'cursor', 'text'),
																															_1: {ctor: '[]'}
																														}),
																													_1: {
																														ctor: '::',
																														_0: A2(
																															_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																															_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.passPointerEvents),
																															{
																																ctor: '::',
																																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'none'),
																																_1: {ctor: '[]'}
																															}),
																														_1: {
																															ctor: '::',
																															_0: A2(
																																_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.capturePointerEvents),
																																{
																																	ctor: '::',
																																	_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'nauto'),
																																	_1: {ctor: '[]'}
																																}),
																															_1: {
																																ctor: '::',
																																_0: A2(
																																	_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																	_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.transparent),
																																	{
																																		ctor: '::',
																																		_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'opacity', '0'),
																																		_1: {ctor: '[]'}
																																	}),
																																_1: {
																																	ctor: '::',
																																	_0: A2(
																																		_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																		_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.opaque),
																																		{
																																			ctor: '::',
																																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'opacity', '1'),
																																			_1: {ctor: '[]'}
																																		}),
																																	_1: {
																																		ctor: '::',
																																		_0: A2(
																																			_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																			'.hover-transparent:hover',
																																			{
																																				ctor: '::',
																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'opacity', '0'),
																																				_1: {ctor: '[]'}
																																			}),
																																		_1: {
																																			ctor: '::',
																																			_0: A2(
																																				_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																				'.hover-opaque:hover',
																																				{
																																					ctor: '::',
																																					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'opacity', '1'),
																																					_1: {ctor: '[]'}
																																				}),
																																			_1: {
																																				ctor: '::',
																																				_0: A2(
																																					_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																					'.hover-transparent:hover',
																																					{
																																						ctor: '::',
																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'opacity', '0'),
																																						_1: {ctor: '[]'}
																																					}),
																																				_1: {
																																					ctor: '::',
																																					_0: A2(
																																						_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																						'.hover-opaque:hover',
																																						{
																																							ctor: '::',
																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'opacity', '1'),
																																							_1: {ctor: '[]'}
																																						}),
																																					_1: {
																																						ctor: '::',
																																						_0: A2(
																																							_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																							'.focus-transparent:focus',
																																							{
																																								ctor: '::',
																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'opacity', '0'),
																																								_1: {ctor: '[]'}
																																							}),
																																						_1: {
																																							ctor: '::',
																																							_0: A2(
																																								_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																								'.focus-opaque:focus',
																																								{
																																									ctor: '::',
																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'opacity', '1'),
																																									_1: {ctor: '[]'}
																																								}),
																																							_1: {
																																								ctor: '::',
																																								_0: A2(
																																									_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																									'.active-transparent:active',
																																									{
																																										ctor: '::',
																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'opacity', '0'),
																																										_1: {ctor: '[]'}
																																									}),
																																								_1: {
																																									ctor: '::',
																																									_0: A2(
																																										_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																										'.active-opaque:active',
																																										{
																																											ctor: '::',
																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'opacity', '1'),
																																											_1: {ctor: '[]'}
																																										}),
																																									_1: {
																																										ctor: '::',
																																										_0: A2(
																																											_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																											'.transition',
																																											{
																																												ctor: '::',
																																												_0: A2(
																																													_mdgriffith$stylish_elephants$Internal_Style$Prop,
																																													'transition',
																																													A2(
																																														_elm_lang$core$String$join,
																																														', ',
																																														A2(
																																															_elm_lang$core$List$map,
																																															function (x) {
																																																return A2(_elm_lang$core$Basics_ops['++'], x, ' 160ms');
																																															},
																																															{
																																																ctor: '::',
																																																_0: 'transform',
																																																_1: {
																																																	ctor: '::',
																																																	_0: 'opacity',
																																																	_1: {
																																																		ctor: '::',
																																																		_0: 'filter',
																																																		_1: {
																																																			ctor: '::',
																																																			_0: 'background-color',
																																																			_1: {
																																																				ctor: '::',
																																																				_0: 'color',
																																																				_1: {
																																																					ctor: '::',
																																																					_0: 'font-size',
																																																					_1: {ctor: '[]'}
																																																				}
																																																			}
																																																		}
																																																	}
																																																}
																																															}))),
																																												_1: {ctor: '[]'}
																																											}),
																																										_1: {
																																											ctor: '::',
																																											_0: A2(
																																												_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																												_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.overflowHidden),
																																												{
																																													ctor: '::',
																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'overflow', 'hidden'),
																																													_1: {
																																														ctor: '::',
																																														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, '-ms-overflow-style', 'none'),
																																														_1: {ctor: '[]'}
																																													}
																																												}),
																																											_1: {
																																												ctor: '::',
																																												_0: A2(
																																													_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																													_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.scrollbars),
																																													{
																																														ctor: '::',
																																														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'overflow', 'auto'),
																																														_1: {
																																															ctor: '::',
																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-shrink', '1'),
																																															_1: {ctor: '[]'}
																																														}
																																													}),
																																												_1: {
																																													ctor: '::',
																																													_0: A2(
																																														_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																														_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.scrollbarsX),
																																														{
																																															ctor: '::',
																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'overflow-x', 'auto'),
																																															_1: {
																																																ctor: '::',
																																																_0: A2(
																																																	_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																	_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.row),
																																																	{
																																																		ctor: '::',
																																																		_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-shrink', '1'),
																																																		_1: {ctor: '[]'}
																																																	}),
																																																_1: {ctor: '[]'}
																																															}
																																														}),
																																													_1: {
																																														ctor: '::',
																																														_0: A2(
																																															_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																															_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.scrollbarsY),
																																															{
																																																ctor: '::',
																																																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'overflow-y', 'auto'),
																																																_1: {
																																																	ctor: '::',
																																																	_0: A2(
																																																		_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																		_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.column),
																																																		{
																																																			ctor: '::',
																																																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-shrink', '1'),
																																																			_1: {ctor: '[]'}
																																																		}),
																																																	_1: {ctor: '[]'}
																																																}
																																															}),
																																														_1: {
																																															ctor: '::',
																																															_0: A2(
																																																_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.clip),
																																																{
																																																	ctor: '::',
																																																	_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'overflow', 'hidden'),
																																																	_1: {ctor: '[]'}
																																																}),
																																															_1: {
																																																ctor: '::',
																																																_0: A2(
																																																	_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																	_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.clipX),
																																																	{
																																																		ctor: '::',
																																																		_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'overflow-x', 'hidden'),
																																																		_1: {ctor: '[]'}
																																																	}),
																																																_1: {
																																																	ctor: '::',
																																																	_0: A2(
																																																		_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																		_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.clipY),
																																																		{
																																																			ctor: '::',
																																																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'overflow-y', 'hidden'),
																																																			_1: {ctor: '[]'}
																																																		}),
																																																	_1: {
																																																		ctor: '::',
																																																		_0: A2(
																																																			_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																			_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.widthContent),
																																																			{
																																																				ctor: '::',
																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'width', 'auto'),
																																																				_1: {ctor: '[]'}
																																																			}),
																																																		_1: {
																																																			ctor: '::',
																																																			_0: A2(
																																																				_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																				_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.borderNone),
																																																				{
																																																					ctor: '::',
																																																					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'border-width', '0'),
																																																					_1: {ctor: '[]'}
																																																				}),
																																																			_1: {
																																																				ctor: '::',
																																																				_0: A2(
																																																					_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																					_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.borderDashed),
																																																					{
																																																						ctor: '::',
																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'border-style', 'dashed'),
																																																						_1: {ctor: '[]'}
																																																					}),
																																																				_1: {
																																																					ctor: '::',
																																																					_0: A2(
																																																						_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																						_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.borderDotted),
																																																						{
																																																							ctor: '::',
																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'border-style', 'dotted'),
																																																							_1: {ctor: '[]'}
																																																						}),
																																																					_1: {
																																																						ctor: '::',
																																																						_0: A2(
																																																							_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																							_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.borderSolid),
																																																							{
																																																								ctor: '::',
																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'border-style', 'solid'),
																																																								_1: {ctor: '[]'}
																																																							}),
																																																						_1: {
																																																							ctor: '::',
																																																							_0: A2(
																																																								_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																								_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.text),
																																																								{
																																																									ctor: '::',
																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'white-space', 'pre'),
																																																									_1: {
																																																										ctor: '::',
																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'inline-block'),
																																																										_1: {ctor: '[]'}
																																																									}
																																																								}),
																																																							_1: {
																																																								ctor: '::',
																																																								_0: A2(
																																																									_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																									_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.single),
																																																									{
																																																										ctor: '::',
																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'flex'),
																																																										_1: {
																																																											ctor: '::',
																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-direction', 'column'),
																																																											_1: {
																																																												ctor: '::',
																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'white-space', 'pre'),
																																																												_1: {
																																																													ctor: '::',
																																																													_0: A2(
																																																														_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																														'.se-button',
																																																														{
																																																															ctor: '::',
																																																															_0: A2(
																																																																_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.text),
																																																																{
																																																																	ctor: '::',
																																																																	_0: A2(
																																																																		_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																		_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.heightFill),
																																																																		{
																																																																			ctor: '::',
																																																																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '0'),
																																																																			_1: {ctor: '[]'}
																																																																		}),
																																																																	_1: {
																																																																		ctor: '::',
																																																																		_0: A2(
																																																																			_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																			_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.widthFill),
																																																																			{
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'auto !important'),
																																																																				_1: {ctor: '[]'}
																																																																			}),
																																																																		_1: {ctor: '[]'}
																																																																	}
																																																																}),
																																																															_1: {ctor: '[]'}
																																																														}),
																																																													_1: {
																																																														ctor: '::',
																																																														_0: A2(
																																																															_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																															_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.heightContent),
																																																															{
																																																																ctor: '::',
																																																																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', 'auto'),
																																																																_1: {ctor: '[]'}
																																																															}),
																																																														_1: {
																																																															ctor: '::',
																																																															_0: A2(
																																																																_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.heightFill),
																																																																{
																																																																	ctor: '::',
																																																																	_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '100000'),
																																																																	_1: {ctor: '[]'}
																																																																}),
																																																															_1: {
																																																																ctor: '::',
																																																																_0: A2(
																																																																	_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																	_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.widthFill),
																																																																	{
																																																																		ctor: '::',
																																																																		_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'stretch !important'),
																																																																		_1: {ctor: '[]'}
																																																																	}),
																																																																_1: {
																																																																	ctor: '::',
																																																																	_0: A2(
																																																																		_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																		_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.widthContent),
																																																																		{
																																																																			ctor: '::',
																																																																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'left'),
																																																																			_1: {ctor: '[]'}
																																																																		}),
																																																																	_1: {
																																																																		ctor: '::',
																																																																		_0: _mdgriffith$stylish_elephants$Internal_Style$describeAlignment(
																																																																			function (alignment) {
																																																																				var _p28 = alignment;
																																																																				switch (_p28.ctor) {
																																																																					case 'Top':
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'flex-start'),
																																																																								_1: {ctor: '[]'}
																																																																							},
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-bottom', 'auto !important'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-top', '0 !important'),
																																																																									_1: {ctor: '[]'}
																																																																								}
																																																																							}
																																																																						};
																																																																					case 'Bottom':
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'flex-end'),
																																																																								_1: {ctor: '[]'}
																																																																							},
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-top', 'auto !important'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-bottom', '0 !important'),
																																																																									_1: {ctor: '[]'}
																																																																								}
																																																																							}
																																																																						};
																																																																					case 'Right':
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'flex-end'),
																																																																								_1: {ctor: '[]'}
																																																																							},
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'flex-end'),
																																																																								_1: {ctor: '[]'}
																																																																							}
																																																																						};
																																																																					case 'Left':
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'flex-start'),
																																																																								_1: {ctor: '[]'}
																																																																							},
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'flex-start'),
																																																																								_1: {ctor: '[]'}
																																																																							}
																																																																						};
																																																																					case 'CenterX':
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'center'),
																																																																								_1: {ctor: '[]'}
																																																																							},
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'center'),
																																																																								_1: {ctor: '[]'}
																																																																							}
																																																																						};
																																																																					default:
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {
																																																																								ctor: '::',
																																																																								_0: A2(
																																																																									_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																									_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.any),
																																																																									{
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-top', 'auto'),
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-bottom', 'auto'),
																																																																											_1: {ctor: '[]'}
																																																																										}
																																																																									}),
																																																																								_1: {ctor: '[]'}
																																																																							},
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-top', 'auto !important'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-bottom', 'auto !important'),
																																																																									_1: {ctor: '[]'}
																																																																								}
																																																																							}
																																																																						};
																																																																				}
																																																																			}),
																																																																		_1: {ctor: '[]'}
																																																																	}
																																																																}
																																																															}
																																																														}
																																																													}
																																																												}
																																																											}
																																																										}
																																																									}),
																																																								_1: {
																																																									ctor: '::',
																																																									_0: A2(
																																																										_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																										_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.row),
																																																										{
																																																											ctor: '::',
																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'flex'),
																																																											_1: {
																																																												ctor: '::',
																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-direction', 'row'),
																																																												_1: {
																																																													ctor: '::',
																																																													_0: A2(
																																																														_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																														_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.any),
																																																														{
																																																															ctor: '::',
																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-basis', '0%'),
																																																															_1: {
																																																																ctor: '::',
																																																																_0: A2(
																																																																	_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																	_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.widthExact),
																																																																	{
																																																																		ctor: '::',
																																																																		_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-basis', 'auto'),
																																																																		_1: {ctor: '[]'}
																																																																	}),
																																																																_1: {ctor: '[]'}
																																																															}
																																																														}),
																																																													_1: {
																																																														ctor: '::',
																																																														_0: A2(
																																																															_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																															_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.heightFill),
																																																															{
																																																																ctor: '::',
																																																																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'stretch !important'),
																																																																_1: {ctor: '[]'}
																																																															}),
																																																														_1: {
																																																															ctor: '::',
																																																															_0: A2(
																																																																_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																'.height-fill-portion',
																																																																{
																																																																	ctor: '::',
																																																																	_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'stretch !important'),
																																																																	_1: {ctor: '[]'}
																																																																}),
																																																															_1: {
																																																																ctor: '::',
																																																																_0: A2(
																																																																	_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																	'.height-fill-between',
																																																																	{
																																																																		ctor: '::',
																																																																		_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'stretch'),
																																																																		_1: {
																																																																			ctor: '::',
																																																																			_0: A2(
																																																																				_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																				'.aligned-vertically',
																																																																				{
																																																																					ctor: '::',
																																																																					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', '100%'),
																																																																					_1: {ctor: '[]'}
																																																																				}),
																																																																			_1: {ctor: '[]'}
																																																																		}
																																																																	}),
																																																																_1: {
																																																																	ctor: '::',
																																																																	_0: A2(
																																																																		_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																		_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.widthFill),
																																																																		{
																																																																			ctor: '::',
																																																																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '100000'),
																																																																			_1: {ctor: '[]'}
																																																																		}),
																																																																	_1: {
																																																																		ctor: '::',
																																																																		_0: A2(
																																																																			_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																			_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.container),
																																																																			{
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '0'),
																																																																				_1: {
																																																																					ctor: '::',
																																																																					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-basis', 'auto'),
																																																																					_1: {
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'stretch'),
																																																																						_1: {ctor: '[]'}
																																																																					}
																																																																				}
																																																																			}),
																																																																		_1: {
																																																																			ctor: '::',
																																																																			_0: A2(
																																																																				_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																				'u:first-of-type.align-container-right',
																																																																				{
																																																																					ctor: '::',
																																																																					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '1'),
																																																																					_1: {ctor: '[]'}
																																																																				}),
																																																																			_1: {
																																																																				ctor: '::',
																																																																				_0: A2(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																					's:first-of-type.align-container-center-x',
																																																																					{
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '1'),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(
																																																																								_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																								_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignCenterX),
																																																																								{
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-left', 'auto !important'),
																																																																									_1: {ctor: '[]'}
																																																																								}),
																																																																							_1: {ctor: '[]'}
																																																																						}
																																																																					}),
																																																																				_1: {
																																																																					ctor: '::',
																																																																					_0: A2(
																																																																						_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																						's:last-of-type.align-container-center-x',
																																																																						{
																																																																							ctor: '::',
																																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '1'),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(
																																																																									_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																									_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignCenterX),
																																																																									{
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-right', 'auto !important'),
																																																																										_1: {ctor: '[]'}
																																																																									}),
																																																																								_1: {ctor: '[]'}
																																																																							}
																																																																						}),
																																																																					_1: {
																																																																						ctor: '::',
																																																																						_0: A2(
																																																																							_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																							's:only-of-type.align-container-center-x',
																																																																							{
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '1'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(
																																																																										_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																										_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignCenterY),
																																																																										{
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-top', 'auto !important'),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-bottom', 'auto !important'),
																																																																												_1: {ctor: '[]'}
																																																																											}
																																																																										}),
																																																																									_1: {ctor: '[]'}
																																																																								}
																																																																							}),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(
																																																																								_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																								's:last-of-type.align-container-center-x ~ u',
																																																																								{
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '0'),
																																																																									_1: {ctor: '[]'}
																																																																								}),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(
																																																																									_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																									'u:first-of-type.align-container-right ~ s.align-container-center-x',
																																																																									{
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '0'),
																																																																										_1: {ctor: '[]'}
																																																																									}),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: _mdgriffith$stylish_elephants$Internal_Style$describeAlignment(
																																																																										function (alignment) {
																																																																											var _p29 = alignment;
																																																																											switch (_p29.ctor) {
																																																																												case 'Top':
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'flex-start'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'flex-start'),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													};
																																																																												case 'Bottom':
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'flex-end'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'flex-end'),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													};
																																																																												case 'Right':
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'flex-end'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {ctor: '[]'}
																																																																													};
																																																																												case 'Left':
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'flex-start'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {ctor: '[]'}
																																																																													};
																																																																												case 'CenterX':
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'center'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {ctor: '[]'}
																																																																													};
																																																																												default:
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'center'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'center'),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													};
																																																																											}
																																																																										}),
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: A2(
																																																																											_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																											_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.spaceEvenly),
																																																																											{
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'space-between'),
																																																																												_1: {ctor: '[]'}
																																																																											}),
																																																																										_1: {ctor: '[]'}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					}
																																																																				}
																																																																			}
																																																																		}
																																																																	}
																																																																}
																																																															}
																																																														}
																																																													}
																																																												}
																																																											}
																																																										}),
																																																									_1: {
																																																										ctor: '::',
																																																										_0: A2(
																																																											_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																											_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.column),
																																																											{
																																																												ctor: '::',
																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'flex'),
																																																												_1: {
																																																													ctor: '::',
																																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-direction', 'column'),
																																																													_1: {
																																																														ctor: '::',
																																																														_0: A2(
																																																															_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																															_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.heightFill),
																																																															{
																																																																ctor: '::',
																																																																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '100000'),
																																																																_1: {ctor: '[]'}
																																																															}),
																																																														_1: {
																																																															ctor: '::',
																																																															_0: A2(
																																																																_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.widthFill),
																																																																{
																																																																	ctor: '::',
																																																																	_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'stretch !important'),
																																																																	_1: {ctor: '[]'}
																																																																}),
																																																															_1: {
																																																																ctor: '::',
																																																																_0: A2(
																																																																	_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																	'.width-fill-portion',
																																																																	{
																																																																		ctor: '::',
																																																																		_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'stretch !important'),
																																																																		_1: {ctor: '[]'}
																																																																	}),
																																																																_1: {
																																																																	ctor: '::',
																																																																	_0: A2(
																																																																		_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																		'.width-fill-between',
																																																																		{
																																																																			ctor: '::',
																																																																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'stretch'),
																																																																			_1: {
																																																																				ctor: '::',
																																																																				_0: A2(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																					'.aligned-horizontally',
																																																																					{
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'width', '100%'),
																																																																						_1: {ctor: '[]'}
																																																																					}),
																																																																				_1: {ctor: '[]'}
																																																																			}
																																																																		}),
																																																																	_1: {
																																																																		ctor: '::',
																																																																		_0: A2(
																																																																			_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																			_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.widthContent),
																																																																			{
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'left'),
																																																																				_1: {ctor: '[]'}
																																																																			}),
																																																																		_1: {
																																																																			ctor: '::',
																																																																			_0: A2(
																																																																				_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																				'u:first-of-type.align-container-bottom',
																																																																				{
																																																																					ctor: '::',
																																																																					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '1'),
																																																																					_1: {ctor: '[]'}
																																																																				}),
																																																																			_1: {
																																																																				ctor: '::',
																																																																				_0: A2(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																					's:first-of-type.align-container-center-y',
																																																																					{
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '1'),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(
																																																																								_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																								_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignCenterY),
																																																																								{
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-top', 'auto !important'),
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-bottom', '0 !important'),
																																																																										_1: {ctor: '[]'}
																																																																									}
																																																																								}),
																																																																							_1: {ctor: '[]'}
																																																																						}
																																																																					}),
																																																																				_1: {
																																																																					ctor: '::',
																																																																					_0: A2(
																																																																						_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																						's:last-of-type.align-container-center-y',
																																																																						{
																																																																							ctor: '::',
																																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '1'),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(
																																																																									_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																									_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignCenterY),
																																																																									{
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-bottom', 'auto !important'),
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-top', '0 !important'),
																																																																											_1: {ctor: '[]'}
																																																																										}
																																																																									}),
																																																																								_1: {ctor: '[]'}
																																																																							}
																																																																						}),
																																																																					_1: {
																																																																						ctor: '::',
																																																																						_0: A2(
																																																																							_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																							's:only-of-type.align-container-center-y',
																																																																							{
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '1'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(
																																																																										_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																										_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.alignCenterY),
																																																																										{
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-top', 'auto !important'),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-bottom', 'auto !important'),
																																																																												_1: {ctor: '[]'}
																																																																											}
																																																																										}),
																																																																									_1: {ctor: '[]'}
																																																																								}
																																																																							}),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(
																																																																								_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																								's:last-of-type.align-container-center-y ~ u',
																																																																								{
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '0'),
																																																																									_1: {ctor: '[]'}
																																																																								}),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(
																																																																									_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																									'u:first-of-type.align-container-bottom ~ s.align-container-center-y',
																																																																									{
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '0'),
																																																																										_1: {ctor: '[]'}
																																																																									}),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: _mdgriffith$stylish_elephants$Internal_Style$describeAlignment(
																																																																										function (alignment) {
																																																																											var _p30 = alignment;
																																																																											switch (_p30.ctor) {
																																																																												case 'Top':
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'flex-start'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-bottom', 'auto'),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													};
																																																																												case 'Bottom':
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'flex-end'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin-top', 'auto'),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													};
																																																																												case 'Right':
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'flex-end'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'flex-end'),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													};
																																																																												case 'Left':
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'flex-start'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'flex-start'),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													};
																																																																												case 'CenterX':
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'center'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'center'),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													};
																																																																												default:
																																																																													return {
																																																																														ctor: '_Tuple2',
																																																																														_0: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'center'),
																																																																															_1: {ctor: '[]'}
																																																																														},
																																																																														_1: {ctor: '[]'}
																																																																													};
																																																																											}
																																																																										}),
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: A2(
																																																																											_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																											_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.container),
																																																																											{
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-grow', '0'),
																																																																												_1: {
																																																																													ctor: '::',
																																																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'flex-basis', 'auto'),
																																																																													_1: {
																																																																														ctor: '::',
																																																																														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'width', '100%'),
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-self', 'stretch !important'),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													}
																																																																												}
																																																																											}),
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: A2(
																																																																												_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																												_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.spaceEvenly),
																																																																												{
																																																																													ctor: '::',
																																																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'space-between'),
																																																																													_1: {ctor: '[]'}
																																																																												}),
																																																																											_1: {ctor: '[]'}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					}
																																																																				}
																																																																			}
																																																																		}
																																																																	}
																																																																}
																																																															}
																																																														}
																																																													}
																																																												}
																																																											}),
																																																										_1: {
																																																											ctor: '::',
																																																											_0: A2(
																																																												_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																												_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.grid),
																																																												{
																																																													ctor: '::',
																																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', '-ms-grid'),
																																																													_1: {
																																																														ctor: '::',
																																																														_0: A2(
																																																															_mdgriffith$stylish_elephants$Internal_Style$Supports,
																																																															{ctor: '_Tuple2', _0: 'display', _1: 'grid'},
																																																															{
																																																																ctor: '::',
																																																																_0: {ctor: '_Tuple2', _0: 'display', _1: 'grid'},
																																																																_1: {ctor: '[]'}
																																																															}),
																																																														_1: {
																																																															ctor: '::',
																																																															_0: _mdgriffith$stylish_elephants$Internal_Style$gridAlignments(
																																																																function (alignment) {
																																																																	var _p31 = alignment;
																																																																	switch (_p31.ctor) {
																																																																		case 'Top':
																																																																			return {
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'flex-start'),
																																																																				_1: {ctor: '[]'}
																																																																			};
																																																																		case 'Bottom':
																																																																			return {
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'flex-end'),
																																																																				_1: {ctor: '[]'}
																																																																			};
																																																																		case 'Right':
																																																																			return {
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'flex-end'),
																																																																				_1: {ctor: '[]'}
																																																																			};
																																																																		case 'Left':
																																																																			return {
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'flex-start'),
																																																																				_1: {ctor: '[]'}
																																																																			};
																																																																		case 'CenterX':
																																																																			return {
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'align-items', 'center'),
																																																																				_1: {ctor: '[]'}
																																																																			};
																																																																		default:
																																																																			return {
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'justify-content', 'center'),
																																																																				_1: {ctor: '[]'}
																																																																			};
																																																																	}
																																																																}),
																																																															_1: {ctor: '[]'}
																																																														}
																																																													}
																																																												}),
																																																											_1: {
																																																												ctor: '::',
																																																												_0: A2(
																																																													_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																													_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.page),
																																																													{
																																																														ctor: '::',
																																																														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'block'),
																																																														_1: {
																																																															ctor: '::',
																																																															_0: A2(
																																																																_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																_mdgriffith$stylish_elephants$Internal_Style$dot(
																																																																	A2(_elm_lang$core$Basics_ops['++'], _mdgriffith$stylish_elephants$Internal_Style$classes.any, ':first-child')),
																																																																{
																																																																	ctor: '::',
																																																																	_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin', '0 !important'),
																																																																	_1: {ctor: '[]'}
																																																																}),
																																																															_1: {
																																																																ctor: '::',
																																																																_0: A2(
																																																																	_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																	_mdgriffith$stylish_elephants$Internal_Style$dot(
																																																																		A2(
																																																																			_elm_lang$core$Basics_ops['++'],
																																																																			_mdgriffith$stylish_elephants$Internal_Style$classes.any,
																																																																			A2(
																																																																				_elm_lang$core$Basics_ops['++'],
																																																																				_mdgriffith$stylish_elephants$Internal_Style$selfName(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Self(_mdgriffith$stylish_elephants$Internal_Style$Left)),
																																																																				':first-child + .se'))),
																																																																	{
																																																																		ctor: '::',
																																																																		_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin', '0 !important'),
																																																																		_1: {ctor: '[]'}
																																																																	}),
																																																																_1: {
																																																																	ctor: '::',
																																																																	_0: A2(
																																																																		_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																		_mdgriffith$stylish_elephants$Internal_Style$dot(
																																																																			A2(
																																																																				_elm_lang$core$Basics_ops['++'],
																																																																				_mdgriffith$stylish_elephants$Internal_Style$classes.any,
																																																																				A2(
																																																																					_elm_lang$core$Basics_ops['++'],
																																																																					_mdgriffith$stylish_elephants$Internal_Style$selfName(
																																																																						_mdgriffith$stylish_elephants$Internal_Style$Self(_mdgriffith$stylish_elephants$Internal_Style$Right)),
																																																																					':first-child + .se'))),
																																																																		{
																																																																			ctor: '::',
																																																																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin', '0 !important'),
																																																																			_1: {ctor: '[]'}
																																																																		}),
																																																																	_1: {
																																																																		ctor: '::',
																																																																		_0: _mdgriffith$stylish_elephants$Internal_Style$describeAlignment(
																																																																			function (alignment) {
																																																																				var _p32 = alignment;
																																																																				switch (_p32.ctor) {
																																																																					case 'Top':
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {ctor: '[]'},
																																																																							_1: {ctor: '[]'}
																																																																						};
																																																																					case 'Bottom':
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {ctor: '[]'},
																																																																							_1: {ctor: '[]'}
																																																																						};
																																																																					case 'Right':
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {ctor: '[]'},
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'float', 'right'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(
																																																																										_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																										':after:',
																																																																										{
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'content', '\"\"'),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'table'),
																																																																												_1: {
																																																																													ctor: '::',
																																																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'clear', 'both'),
																																																																													_1: {ctor: '[]'}
																																																																												}
																																																																											}
																																																																										}),
																																																																									_1: {ctor: '[]'}
																																																																								}
																																																																							}
																																																																						};
																																																																					case 'Left':
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {ctor: '[]'},
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'float', 'left'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(
																																																																										_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																										':after:',
																																																																										{
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'content', '\"\"'),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'table'),
																																																																												_1: {
																																																																													ctor: '::',
																																																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'clear', 'both'),
																																																																													_1: {ctor: '[]'}
																																																																												}
																																																																											}
																																																																										}),
																																																																									_1: {ctor: '[]'}
																																																																								}
																																																																							}
																																																																						};
																																																																					case 'CenterX':
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {ctor: '[]'},
																																																																							_1: {ctor: '[]'}
																																																																						};
																																																																					default:
																																																																						return {
																																																																							ctor: '_Tuple2',
																																																																							_0: {ctor: '[]'},
																																																																							_1: {ctor: '[]'}
																																																																						};
																																																																				}
																																																																			}),
																																																																		_1: {ctor: '[]'}
																																																																	}
																																																																}
																																																															}
																																																														}
																																																													}),
																																																												_1: {
																																																													ctor: '::',
																																																													_0: A2(
																																																														_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																														_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.paragraph),
																																																														{
																																																															ctor: '::',
																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'block'),
																																																															_1: {
																																																																ctor: '::',
																																																																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'white-space', 'normal'),
																																																																_1: {
																																																																	ctor: '::',
																																																																	_0: A2(
																																																																		_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																		_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.text),
																																																																		{
																																																																			ctor: '::',
																																																																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'inline'),
																																																																			_1: {
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'white-space', 'normal'),
																																																																				_1: {ctor: '[]'}
																																																																			}
																																																																		}),
																																																																	_1: {
																																																																		ctor: '::',
																																																																		_0: A2(
																																																																			_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																			_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.single),
																																																																			{
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'inline'),
																																																																				_1: {
																																																																					ctor: '::',
																																																																					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'white-space', 'normal'),
																																																																					_1: {
																																																																						ctor: '::',
																																																																						_0: A2(
																																																																							_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																							_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.inFront),
																																																																							{
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'flex'),
																																																																								_1: {ctor: '[]'}
																																																																							}),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(
																																																																								_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																								_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.behind),
																																																																								{
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'flex'),
																																																																									_1: {ctor: '[]'}
																																																																								}),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(
																																																																									_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																									_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.above),
																																																																									{
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'flex'),
																																																																										_1: {ctor: '[]'}
																																																																									}),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(
																																																																										_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																										_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.below),
																																																																										{
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'flex'),
																																																																											_1: {ctor: '[]'}
																																																																										}),
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: A2(
																																																																											_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																											_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.onRight),
																																																																											{
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'flex'),
																																																																												_1: {ctor: '[]'}
																																																																											}),
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: A2(
																																																																												_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																												_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.onLeft),
																																																																												{
																																																																													ctor: '::',
																																																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'flex'),
																																																																													_1: {ctor: '[]'}
																																																																												}),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(
																																																																													_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																													_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.text),
																																																																													{
																																																																														ctor: '::',
																																																																														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'inline'),
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'white-space', 'normal'),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													}),
																																																																												_1: {ctor: '[]'}
																																																																											}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					}
																																																																				}
																																																																			}),
																																																																		_1: {
																																																																			ctor: '::',
																																																																			_0: A2(
																																																																				_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																				_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.row),
																																																																				{
																																																																					ctor: '::',
																																																																					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'inline-flex'),
																																																																					_1: {ctor: '[]'}
																																																																				}),
																																																																			_1: {
																																																																				ctor: '::',
																																																																				_0: A2(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																					_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.column),
																																																																					{
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'inline-flex'),
																																																																						_1: {ctor: '[]'}
																																																																					}),
																																																																				_1: {
																																																																					ctor: '::',
																																																																					_0: A2(
																																																																						_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																						_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.grid),
																																																																						{
																																																																							ctor: '::',
																																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'inline-grid'),
																																																																							_1: {ctor: '[]'}
																																																																						}),
																																																																					_1: {
																																																																						ctor: '::',
																																																																						_0: _mdgriffith$stylish_elephants$Internal_Style$describeAlignment(
																																																																							function (alignment) {
																																																																								var _p33 = alignment;
																																																																								switch (_p33.ctor) {
																																																																									case 'Top':
																																																																										return {
																																																																											ctor: '_Tuple2',
																																																																											_0: {ctor: '[]'},
																																																																											_1: {ctor: '[]'}
																																																																										};
																																																																									case 'Bottom':
																																																																										return {
																																																																											ctor: '_Tuple2',
																																																																											_0: {ctor: '[]'},
																																																																											_1: {ctor: '[]'}
																																																																										};
																																																																									case 'Right':
																																																																										return {
																																																																											ctor: '_Tuple2',
																																																																											_0: {ctor: '[]'},
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'float', 'right'),
																																																																												_1: {ctor: '[]'}
																																																																											}
																																																																										};
																																																																									case 'Left':
																																																																										return {
																																																																											ctor: '_Tuple2',
																																																																											_0: {ctor: '[]'},
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'float', 'left'),
																																																																												_1: {ctor: '[]'}
																																																																											}
																																																																										};
																																																																									case 'CenterX':
																																																																										return {
																																																																											ctor: '_Tuple2',
																																																																											_0: {ctor: '[]'},
																																																																											_1: {ctor: '[]'}
																																																																										};
																																																																									default:
																																																																										return {
																																																																											ctor: '_Tuple2',
																																																																											_0: {ctor: '[]'},
																																																																											_1: {ctor: '[]'}
																																																																										};
																																																																								}
																																																																							}),
																																																																						_1: {ctor: '[]'}
																																																																					}
																																																																				}
																																																																			}
																																																																		}
																																																																	}
																																																																}
																																																															}
																																																														}),
																																																													_1: {
																																																														ctor: '::',
																																																														_0: A2(
																																																															_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																															'.hidden',
																																																															{
																																																																ctor: '::',
																																																																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'display', 'none'),
																																																																_1: {ctor: '[]'}
																																																															}),
																																																														_1: {
																																																															ctor: '::',
																																																															_0: _mdgriffith$stylish_elephants$Internal_Style$Batch(
																																																																A3(
																																																																	_elm_lang$core$Basics$flip,
																																																																	_elm_lang$core$List$map,
																																																																	_mdgriffith$stylish_elephants$Internal_Style$locations,
																																																																	function (loc) {
																																																																		var _p34 = loc;
																																																																		switch (_p34.ctor) {
																																																																			case 'Above':
																																																																				return A2(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																					_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.above),
																																																																					{
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'position', 'absolute'),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'bottom', '100%'),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'left', '0'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'width', '100%'),
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'z-index', '10'),
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin', '0 !important'),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(
																																																																													_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																													_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.heightFill),
																																																																													{
																																																																														ctor: '::',
																																																																														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', 'auto'),
																																																																														_1: {ctor: '[]'}
																																																																													}),
																																																																												_1: {
																																																																													ctor: '::',
																																																																													_0: A2(
																																																																														_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																														_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.widthFill),
																																																																														{
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'width', '100%'),
																																																																															_1: {ctor: '[]'}
																																																																														}),
																																																																													_1: {
																																																																														ctor: '::',
																																																																														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'none'),
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(
																																																																																_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																																_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.any),
																																																																																{
																																																																																	ctor: '::',
																																																																																	_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'auto'),
																																																																																	_1: {ctor: '[]'}
																																																																																}),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													}
																																																																												}
																																																																											}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					});
																																																																			case 'Below':
																																																																				return A2(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																					_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.below),
																																																																					{
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'position', 'absolute'),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'bottom', '0'),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'left', '0'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', '0'),
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'width', '100%'),
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'z-index', '10'),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin', '0 !important'),
																																																																												_1: {
																																																																													ctor: '::',
																																																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'auto'),
																																																																													_1: {
																																																																														ctor: '::',
																																																																														_0: A2(
																																																																															_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																															_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.heightFill),
																																																																															{
																																																																																ctor: '::',
																																																																																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', 'auto'),
																																																																																_1: {ctor: '[]'}
																																																																															}),
																																																																														_1: {ctor: '[]'}
																																																																													}
																																																																												}
																																																																											}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					});
																																																																			case 'OnRight':
																																																																				return A2(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																					_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.onRight),
																																																																					{
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'position', 'absolute'),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'left', '100%'),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'top', '0'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', '100%'),
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin', '0 !important'),
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'z-index', '10'),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'auto'),
																																																																												_1: {ctor: '[]'}
																																																																											}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					});
																																																																			case 'OnLeft':
																																																																				return A2(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																					_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.onLeft),
																																																																					{
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'position', 'absolute'),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'right', '100%'),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'top', '0'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', '100%'),
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin', '0 !important'),
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'z-index', '10'),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'auto'),
																																																																												_1: {ctor: '[]'}
																																																																											}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					});
																																																																			case 'Within':
																																																																				return A2(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																					_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.inFront),
																																																																					{
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'position', 'absolute'),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'width', '100%'),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', '100%'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'left', '0'),
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'top', '0'),
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin', '0 !important'),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'z-index', '10'),
																																																																												_1: {
																																																																													ctor: '::',
																																																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'none'),
																																																																													_1: {
																																																																														ctor: '::',
																																																																														_0: A2(
																																																																															_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																															_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.any),
																																																																															{
																																																																																ctor: '::',
																																																																																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'auto'),
																																																																																_1: {ctor: '[]'}
																																																																															}),
																																																																														_1: {ctor: '[]'}
																																																																													}
																																																																												}
																																																																											}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					});
																																																																			default:
																																																																				return A2(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																					_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.behind),
																																																																					{
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'position', 'absolute'),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'width', '100%'),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', '100%'),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'left', '0'),
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'top', '0'),
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'margin', '0 !important'),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'z-index', '0'),
																																																																												_1: {
																																																																													ctor: '::',
																																																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'none'),
																																																																													_1: {
																																																																														ctor: '::',
																																																																														_0: A2(
																																																																															_mdgriffith$stylish_elephants$Internal_Style$Child,
																																																																															'.se',
																																																																															{
																																																																																ctor: '::',
																																																																																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'auto'),
																																																																																_1: {ctor: '[]'}
																																																																															}),
																																																																														_1: {ctor: '[]'}
																																																																													}
																																																																												}
																																																																											}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					});
																																																																		}
																																																																	})),
																																																															_1: {
																																																																ctor: '::',
																																																																_0: A2(
																																																																	_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																	_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textThin),
																																																																	{
																																																																		ctor: '::',
																																																																		_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-weight', '100'),
																																																																		_1: {ctor: '[]'}
																																																																	}),
																																																																_1: {
																																																																	ctor: '::',
																																																																	_0: A2(
																																																																		_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																		_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textExtraLight),
																																																																		{
																																																																			ctor: '::',
																																																																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-weight', '200'),
																																																																			_1: {ctor: '[]'}
																																																																		}),
																																																																	_1: {
																																																																		ctor: '::',
																																																																		_0: A2(
																																																																			_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																			_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textLight),
																																																																			{
																																																																				ctor: '::',
																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-weight', '300'),
																																																																				_1: {ctor: '[]'}
																																																																			}),
																																																																		_1: {
																																																																			ctor: '::',
																																																																			_0: A2(
																																																																				_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																				_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textNormalWeight),
																																																																				{
																																																																					ctor: '::',
																																																																					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-weight', '400'),
																																																																					_1: {ctor: '[]'}
																																																																				}),
																																																																			_1: {
																																																																				ctor: '::',
																																																																				_0: A2(
																																																																					_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																					_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textMedium),
																																																																					{
																																																																						ctor: '::',
																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-weight', '500'),
																																																																						_1: {ctor: '[]'}
																																																																					}),
																																																																				_1: {
																																																																					ctor: '::',
																																																																					_0: A2(
																																																																						_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																						_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textSemiBold),
																																																																						{
																																																																							ctor: '::',
																																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-weight', '600'),
																																																																							_1: {ctor: '[]'}
																																																																						}),
																																																																					_1: {
																																																																						ctor: '::',
																																																																						_0: A2(
																																																																							_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																							_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.bold),
																																																																							{
																																																																								ctor: '::',
																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-weight', '700'),
																																																																								_1: {ctor: '[]'}
																																																																							}),
																																																																						_1: {
																																																																							ctor: '::',
																																																																							_0: A2(
																																																																								_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																								_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textExtraBold),
																																																																								{
																																																																									ctor: '::',
																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-weight', '800'),
																																																																									_1: {ctor: '[]'}
																																																																								}),
																																																																							_1: {
																																																																								ctor: '::',
																																																																								_0: A2(
																																																																									_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																									_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textHeavy),
																																																																									{
																																																																										ctor: '::',
																																																																										_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-weight', '900'),
																																																																										_1: {ctor: '[]'}
																																																																									}),
																																																																								_1: {
																																																																									ctor: '::',
																																																																									_0: A2(
																																																																										_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																										_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.italic),
																																																																										{
																																																																											ctor: '::',
																																																																											_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-style', 'italic'),
																																																																											_1: {ctor: '[]'}
																																																																										}),
																																																																									_1: {
																																																																										ctor: '::',
																																																																										_0: A2(
																																																																											_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																											_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.strike),
																																																																											{
																																																																												ctor: '::',
																																																																												_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'text-decoration', 'line-through'),
																																																																												_1: {ctor: '[]'}
																																																																											}),
																																																																										_1: {
																																																																											ctor: '::',
																																																																											_0: A2(
																																																																												_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																												_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.underline),
																																																																												{
																																																																													ctor: '::',
																																																																													_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'text-decoration', 'underline'),
																																																																													_1: {
																																																																														ctor: '::',
																																																																														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'text-decoration-skip-ink', 'auto'),
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'text-decoration-skip', 'ink'),
																																																																															_1: {ctor: '[]'}
																																																																														}
																																																																													}
																																																																												}),
																																																																											_1: {
																																																																												ctor: '::',
																																																																												_0: A2(
																																																																													_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																													_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textUnitalicized),
																																																																													{
																																																																														ctor: '::',
																																																																														_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'font-style', 'normal'),
																																																																														_1: {ctor: '[]'}
																																																																													}),
																																																																												_1: {
																																																																													ctor: '::',
																																																																													_0: A2(
																																																																														_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																														_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textJustify),
																																																																														{
																																																																															ctor: '::',
																																																																															_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'text-align', 'justify'),
																																																																															_1: {ctor: '[]'}
																																																																														}),
																																																																													_1: {
																																																																														ctor: '::',
																																																																														_0: A2(
																																																																															_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																															_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textJustifyAll),
																																																																															{
																																																																																ctor: '::',
																																																																																_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'text-align', 'justify-all'),
																																																																																_1: {ctor: '[]'}
																																																																															}),
																																																																														_1: {
																																																																															ctor: '::',
																																																																															_0: A2(
																																																																																_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																																_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textCenter),
																																																																																{
																																																																																	ctor: '::',
																																																																																	_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'text-align', 'center'),
																																																																																	_1: {ctor: '[]'}
																																																																																}),
																																																																															_1: {
																																																																																ctor: '::',
																																																																																_0: A2(
																																																																																	_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																																	_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textRight),
																																																																																	{
																																																																																		ctor: '::',
																																																																																		_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'text-align', 'right'),
																																																																																		_1: {ctor: '[]'}
																																																																																	}),
																																																																																_1: {
																																																																																	ctor: '::',
																																																																																	_0: A2(
																																																																																		_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																																		_mdgriffith$stylish_elephants$Internal_Style$dot(_mdgriffith$stylish_elephants$Internal_Style$classes.textLeft),
																																																																																		{
																																																																																			ctor: '::',
																																																																																			_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'text-align', 'left'),
																																																																																			_1: {ctor: '[]'}
																																																																																		}),
																																																																																	_1: {
																																																																																		ctor: '::',
																																																																																		_0: A2(
																																																																																			_mdgriffith$stylish_elephants$Internal_Style$Descriptor,
																																																																																			'.modal',
																																																																																			{
																																																																																				ctor: '::',
																																																																																				_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'position', 'fixed'),
																																																																																				_1: {
																																																																																					ctor: '::',
																																																																																					_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'left', '0'),
																																																																																					_1: {
																																																																																						ctor: '::',
																																																																																						_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'top', '0'),
																																																																																						_1: {
																																																																																							ctor: '::',
																																																																																							_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'width', '100%'),
																																																																																							_1: {
																																																																																								ctor: '::',
																																																																																								_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'height', '100%'),
																																																																																								_1: {
																																																																																									ctor: '::',
																																																																																									_0: A2(_mdgriffith$stylish_elephants$Internal_Style$Prop, 'pointer-events', 'none'),
																																																																																									_1: {ctor: '[]'}
																																																																																								}
																																																																																							}
																																																																																						}
																																																																																					}
																																																																																				}
																																																																																			}),
																																																																																		_1: {ctor: '[]'}
																																																																																	}
																																																																																}
																																																																															}
																																																																														}
																																																																													}
																																																																												}
																																																																											}
																																																																										}
																																																																									}
																																																																								}
																																																																							}
																																																																						}
																																																																					}
																																																																				}
																																																																			}
																																																																		}
																																																																	}
																																																																}
																																																															}
																																																														}
																																																													}
																																																												}
																																																											}
																																																										}
																																																									}
																																																								}
																																																							}
																																																						}
																																																					}
																																																				}
																																																			}
																																																		}
																																																	}
																																																}
																																															}
																																														}
																																													}
																																												}
																																											}
																																										}
																																									}
																																								}
																																							}
																																						}
																																					}
																																				}
																																			}
																																		}
																																	}
																																}
																															}
																														}
																													}
																												}
																											}
																										}
																									}
																								}
																							}
																						}
																					}
																				}
																			}
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}),
						_1: {ctor: '[]'}
					}
				}
			}
		}));
var _mdgriffith$stylish_elephants$Internal_Style$viewportRules = A2(_elm_lang$core$Basics_ops['++'], 'html, body {\n    height: 100%;\n    width: 100%;\n} ', _mdgriffith$stylish_elephants$Internal_Style$rules);
var _mdgriffith$stylish_elephants$Internal_Style$viewportRulesElement = A3(
	_elm_lang$html$Html$node,
	'style',
	{ctor: '[]'},
	{
		ctor: '::',
		_0: _elm_lang$html$Html$text(_mdgriffith$stylish_elephants$Internal_Style$viewportRules),
		_1: {ctor: '[]'}
	});
var _mdgriffith$stylish_elephants$Internal_Style$rulesElement = A3(
	_elm_lang$html$Html$node,
	'style',
	{ctor: '[]'},
	{
		ctor: '::',
		_0: _elm_lang$html$Html$text(_mdgriffith$stylish_elephants$Internal_Style$rules),
		_1: {ctor: '[]'}
	});

var _mdgriffith$stylish_elephants$Internal_Model$locationClass = function (location) {
	var _p0 = location;
	switch (_p0.ctor) {
		case 'Above':
			return 'se el above';
		case 'Below':
			return 'se el below';
		case 'OnRight':
			return 'se el on-right';
		case 'OnLeft':
			return 'se el on-left';
		case 'InFront':
			return 'se el infront';
		default:
			return 'se el behind';
	}
};
var _mdgriffith$stylish_elephants$Internal_Model$isInt = function (x) {
	return x;
};
var _mdgriffith$stylish_elephants$Internal_Model$psuedoClassName = function ($class) {
	var _p1 = $class;
	switch (_p1.ctor) {
		case 'Focus':
			return 'focus';
		case 'Hover':
			return 'hover';
		default:
			return 'active';
	}
};
var _mdgriffith$stylish_elephants$Internal_Model$styleKey = function (style) {
	var _p2 = style;
	switch (_p2.ctor) {
		case 'Shadows':
			return 'shadows';
		case 'Transparency':
			return 'transparency';
		case 'Style':
			return _p2._0;
		case 'FontSize':
			return 'fontsize';
		case 'FontFamily':
			return 'fontfamily';
		case 'Single':
			return _p2._1;
		case 'Colored':
			return _p2._1;
		case 'SpacingStyle':
			return 'spacing';
		case 'PaddingStyle':
			return 'padding';
		case 'GridTemplateStyle':
			return 'grid-template';
		case 'GridPosition':
			return 'grid-position';
		case 'PseudoSelector':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_mdgriffith$stylish_elephants$Internal_Model$psuedoClassName(_p2._0),
				A2(
					_elm_lang$core$String$join,
					'',
					A2(_elm_lang$core$List$map, _mdgriffith$stylish_elephants$Internal_Model$styleKey, _p2._1)));
		default:
			return 'transform';
	}
};
var _mdgriffith$stylish_elephants$Internal_Model$intToString = function (i) {
	var _p3 = i;
	switch (_p3) {
		case 0:
			return '0';
		case 1:
			return '1';
		case 2:
			return '2';
		case 3:
			return '3';
		case 4:
			return '4';
		case 5:
			return '5';
		case 100:
			return '100';
		case 255:
			return '255';
		default:
			return _elm_lang$core$Basics$toString(i);
	}
};
var _mdgriffith$stylish_elephants$Internal_Model$formatColor = function (color) {
	var _p4 = _elm_lang$core$Color$toRgb(color);
	var red = _p4.red;
	var green = _p4.green;
	var blue = _p4.blue;
	var alpha = _p4.alpha;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		A2(
			_elm_lang$core$Basics_ops['++'],
			'rgba(',
			_mdgriffith$stylish_elephants$Internal_Model$intToString(red)),
		A2(
			_elm_lang$core$Basics_ops['++'],
			A2(
				_elm_lang$core$Basics_ops['++'],
				',',
				_mdgriffith$stylish_elephants$Internal_Model$intToString(green)),
			A2(
				_elm_lang$core$Basics_ops['++'],
				A2(
					_elm_lang$core$Basics_ops['++'],
					',',
					_mdgriffith$stylish_elephants$Internal_Model$intToString(blue)),
				A2(
					_elm_lang$core$Basics_ops['++'],
					',',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(alpha),
						')')))));
};
var _mdgriffith$stylish_elephants$Internal_Model$floatClass = function (x) {
	return _mdgriffith$stylish_elephants$Internal_Model$intToString(
		_elm_lang$core$Basics$round(x * 100));
};
var _mdgriffith$stylish_elephants$Internal_Model$formatColorClass = function (color) {
	var _p5 = _elm_lang$core$Color$toRgb(color);
	var red = _p5.red;
	var green = _p5.green;
	var blue = _p5.blue;
	var alpha = _p5.alpha;
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_mdgriffith$stylish_elephants$Internal_Model$intToString(red),
		A2(
			_elm_lang$core$Basics_ops['++'],
			'-',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_mdgriffith$stylish_elephants$Internal_Model$intToString(green),
				A2(
					_elm_lang$core$Basics_ops['++'],
					'-',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_mdgriffith$stylish_elephants$Internal_Model$intToString(blue),
						A2(
							_elm_lang$core$Basics_ops['++'],
							'-',
							_mdgriffith$stylish_elephants$Internal_Model$floatClass(alpha)))))));
};
var _mdgriffith$stylish_elephants$Internal_Model$formatBoxShadow = function (shadow) {
	return A2(
		_elm_lang$core$String$join,
		' ',
		A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			{
				ctor: '::',
				_0: shadow.inset ? _elm_lang$core$Maybe$Just('inset') : _elm_lang$core$Maybe$Nothing,
				_1: {
					ctor: '::',
					_0: _elm_lang$core$Maybe$Just(
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(
								_elm_lang$core$Tuple$first(shadow.offset)),
							'px')),
					_1: {
						ctor: '::',
						_0: _elm_lang$core$Maybe$Just(
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(
									_elm_lang$core$Tuple$second(shadow.offset)),
								'px')),
						_1: {
							ctor: '::',
							_0: _elm_lang$core$Maybe$Just(
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(shadow.blur),
									'px')),
							_1: {
								ctor: '::',
								_0: _elm_lang$core$Maybe$Just(
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(shadow.size),
										'px')),
								_1: {
									ctor: '::',
									_0: _elm_lang$core$Maybe$Just(
										_mdgriffith$stylish_elephants$Internal_Model$formatColor(shadow.color)),
									_1: {ctor: '[]'}
								}
							}
						}
					}
				}
			}));
};
var _mdgriffith$stylish_elephants$Internal_Model$formatTextShadow = function (shadow) {
	return A2(
		_elm_lang$core$String$join,
		' ',
		{
			ctor: '::',
			_0: A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(
					_elm_lang$core$Tuple$first(shadow.offset)),
				'px'),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(
						_elm_lang$core$Tuple$second(shadow.offset)),
					'px'),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(shadow.blur),
						'px'),
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Internal_Model$formatColor(shadow.color),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _mdgriffith$stylish_elephants$Internal_Model$formatDropShadow = function (shadow) {
	return A2(
		_elm_lang$core$String$join,
		' ',
		{
			ctor: '::',
			_0: A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(
					_elm_lang$core$Tuple$first(shadow.offset)),
				'px'),
			_1: {
				ctor: '::',
				_0: A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(
						_elm_lang$core$Tuple$second(shadow.offset)),
					'px'),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(shadow.blur),
						'px'),
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Internal_Model$formatColor(shadow.color),
						_1: {ctor: '[]'}
					}
				}
			}
		});
};
var _mdgriffith$stylish_elephants$Internal_Model$filterName = function (filtr) {
	var _p6 = filtr;
	switch (_p6.ctor) {
		case 'FilterUrl':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'url(',
				A2(_elm_lang$core$Basics_ops['++'], _p6._0, ')'));
		case 'Blur':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'blur(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p6._0),
					'px)'));
		case 'Brightness':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'brightness(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p6._0),
					'%)'));
		case 'Contrast':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'contrast(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p6._0),
					'%)'));
		case 'Grayscale':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'grayscale(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p6._0),
					'%)'));
		case 'HueRotate':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'hueRotate(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p6._0),
					'deg)'));
		case 'Invert':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'invert(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p6._0),
					'%)'));
		case 'OpacityFilter':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'opacity(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p6._0),
					'%)'));
		case 'Saturate':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'saturate(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p6._0),
					'%)'));
		case 'Sepia':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'sepia(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p6._0),
					'%)'));
		default:
			var _p7 = _p6._0;
			var shadowModel = {offset: _p7.offset, size: _p7.size, blur: _p7.blur, color: _p7.color};
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'drop-shadow(',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_mdgriffith$stylish_elephants$Internal_Model$formatDropShadow(shadowModel),
					')'));
	}
};
var _mdgriffith$stylish_elephants$Internal_Model$lengthClassName = function (x) {
	var _p8 = x;
	switch (_p8.ctor) {
		case 'Px':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_mdgriffith$stylish_elephants$Internal_Model$intToString(_p8._0),
				'px');
		case 'Content':
			return 'auto';
		case 'Fill':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				_mdgriffith$stylish_elephants$Internal_Model$intToString(_p8._0),
				'fr');
		case 'Min':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'min',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p8._0),
					_mdgriffith$stylish_elephants$Internal_Model$lengthClassName(_p8._1)));
		default:
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'max',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p8._0),
					_mdgriffith$stylish_elephants$Internal_Model$lengthClassName(_p8._1)));
	}
};
var _mdgriffith$stylish_elephants$Internal_Model$getStyleName = function (style) {
	var _p9 = style;
	switch (_p9.ctor) {
		case 'Shadows':
			return _p9._0;
		case 'Transparency':
			return _p9._0;
		case 'Style':
			return _p9._0;
		case 'FontFamily':
			return _p9._0;
		case 'FontSize':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'font-size-',
				_elm_lang$core$Basics$toString(
					_mdgriffith$stylish_elephants$Internal_Model$isInt(_p9._0)));
		case 'Single':
			return _p9._0;
		case 'Colored':
			return _p9._0;
		case 'SpacingStyle':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'spacing-',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(
						_mdgriffith$stylish_elephants$Internal_Model$isInt(_p9._0)),
					A2(
						_elm_lang$core$Basics_ops['++'],
						'-',
						_elm_lang$core$Basics$toString(
							_mdgriffith$stylish_elephants$Internal_Model$isInt(_p9._1)))));
		case 'PaddingStyle':
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'pad-',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p9._0),
					A2(
						_elm_lang$core$Basics_ops['++'],
						'-',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(_p9._1),
							A2(
								_elm_lang$core$Basics_ops['++'],
								'-',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(_p9._2),
									A2(
										_elm_lang$core$Basics_ops['++'],
										'-',
										_elm_lang$core$Basics$toString(_p9._3))))))));
		case 'GridTemplateStyle':
			var _p10 = _p9._0;
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'grid-rows-',
				A2(
					_elm_lang$core$Basics_ops['++'],
					A2(
						_elm_lang$core$String$join,
						'-',
						A2(_elm_lang$core$List$map, _mdgriffith$stylish_elephants$Internal_Model$lengthClassName, _p10.rows)),
					A2(
						_elm_lang$core$Basics_ops['++'],
						'-cols-',
						A2(
							_elm_lang$core$Basics_ops['++'],
							A2(
								_elm_lang$core$String$join,
								'-',
								A2(_elm_lang$core$List$map, _mdgriffith$stylish_elephants$Internal_Model$lengthClassName, _p10.columns)),
							A2(
								_elm_lang$core$Basics_ops['++'],
								'-space-x-',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_mdgriffith$stylish_elephants$Internal_Model$lengthClassName(
										_elm_lang$core$Tuple$first(_p10.spacing)),
									A2(
										_elm_lang$core$Basics_ops['++'],
										'-space-y-',
										_mdgriffith$stylish_elephants$Internal_Model$lengthClassName(
											_elm_lang$core$Tuple$second(_p10.spacing)))))))));
		case 'GridPosition':
			var _p11 = _p9._0;
			return A2(
				_elm_lang$core$Basics_ops['++'],
				'grid-pos-',
				A2(
					_elm_lang$core$Basics_ops['++'],
					_elm_lang$core$Basics$toString(_p11.row),
					A2(
						_elm_lang$core$Basics_ops['++'],
						'-',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(_p11.col),
							A2(
								_elm_lang$core$Basics_ops['++'],
								'-',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(_p11.width),
									A2(
										_elm_lang$core$Basics_ops['++'],
										'-',
										_elm_lang$core$Basics$toString(_p11.height))))))));
		case 'PseudoSelector':
			return A2(
				_elm_lang$core$String$join,
				' ',
				{
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Internal_Model$psuedoClassName(_p9._0),
					_1: A2(_elm_lang$core$List$map, _mdgriffith$stylish_elephants$Internal_Model$getStyleName, _p9._1)
				});
		default:
			return 'transformation';
	}
};
var _mdgriffith$stylish_elephants$Internal_Model$reduceStyles = F2(
	function (style, _p12) {
		var _p13 = _p12;
		var _p15 = _p13._1;
		var _p14 = _p13._0;
		var styleName = _mdgriffith$stylish_elephants$Internal_Model$getStyleName(style);
		return A2(_elm_lang$core$Set$member, styleName, _p14) ? {ctor: '_Tuple2', _0: _p14, _1: _p15} : {
			ctor: '_Tuple2',
			_0: A2(_elm_lang$core$Set$insert, styleName, _p14),
			_1: {ctor: '::', _0: style, _1: _p15}
		};
	});
var _mdgriffith$stylish_elephants$Internal_Model$renderFont = function (families) {
	var fontName = function (font) {
		var _p16 = font;
		switch (_p16.ctor) {
			case 'Serif':
				return 'serif';
			case 'SansSerif':
				return 'sans-serif';
			case 'Monospace':
				return 'monospace';
			case 'Typeface':
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'\"',
					A2(_elm_lang$core$Basics_ops['++'], _p16._0, '\"'));
			default:
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'\"',
					A2(_elm_lang$core$Basics_ops['++'], _p16._0, '\"'));
		}
	};
	return A2(
		_elm_lang$core$String$join,
		', ',
		A2(_elm_lang$core$List$map, fontName, families));
};
var _mdgriffith$stylish_elephants$Internal_Model$focusDefaultStyle = {
	backgroundColor: _elm_lang$core$Maybe$Nothing,
	borderColor: _elm_lang$core$Maybe$Nothing,
	shadow: _elm_lang$core$Maybe$Just(
		{
			color: A3(_elm_lang$core$Color$rgb, 155, 203, 255),
			offset: {ctor: '_Tuple2', _0: 0, _1: 0},
			blur: 3,
			size: 3
		})
};
var _mdgriffith$stylish_elephants$Internal_Model$renderFontClassName = F2(
	function (font, current) {
		return A2(
			_elm_lang$core$Basics_ops['++'],
			current,
			function () {
				var _p17 = font;
				switch (_p17.ctor) {
					case 'Serif':
						return 'serif';
					case 'SansSerif':
						return 'sans-serif';
					case 'Monospace':
						return 'monospace';
					case 'Typeface':
						return A2(
							_elm_lang$core$String$join,
							'-',
							_elm_lang$core$String$words(
								_elm_lang$core$String$toLower(_p17._0)));
					default:
						return A2(
							_elm_lang$core$String$join,
							'-',
							_elm_lang$core$String$words(
								_elm_lang$core$String$toLower(_p17._0)));
				}
			}());
	});
var _mdgriffith$stylish_elephants$Internal_Model$textElementFill = function (str) {
	return A3(
		_elm_lang$virtual_dom$VirtualDom$node,
		'div',
		{
			ctor: '::',
			_0: A2(
				_elm_lang$virtual_dom$VirtualDom$property,
				'className',
				_elm_lang$core$Json_Encode$string('se text width-fill height-fill')),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom$text(str),
			_1: {ctor: '[]'}
		});
};
var _mdgriffith$stylish_elephants$Internal_Model$textElement = function (str) {
	return A3(
		_elm_lang$virtual_dom$VirtualDom$node,
		'div',
		{
			ctor: '::',
			_0: A2(
				_elm_lang$virtual_dom$VirtualDom$property,
				'className',
				_elm_lang$core$Json_Encode$string('se text width-content height-content')),
			_1: {ctor: '[]'}
		},
		{
			ctor: '::',
			_0: _elm_lang$virtual_dom$VirtualDom$text(str),
			_1: {ctor: '[]'}
		});
};
var _mdgriffith$stylish_elephants$Internal_Model$getSpacing = F2(
	function (attrs, $default) {
		return A2(
			_elm_lang$core$Maybe$withDefault,
			$default,
			A3(
				_elm_lang$core$List$foldr,
				F2(
					function (x, acc) {
						var _p18 = acc;
						if (_p18.ctor === 'Just') {
							return _elm_lang$core$Maybe$Just(_p18._0);
						} else {
							var _p19 = x;
							if ((_p19.ctor === 'StyleClass') && (_p19._0.ctor === 'SpacingStyle')) {
								return _elm_lang$core$Maybe$Just(
									{ctor: '_Tuple2', _0: _p19._0._0, _1: _p19._0._1});
							} else {
								return _elm_lang$core$Maybe$Nothing;
							}
						}
					}),
				_elm_lang$core$Maybe$Nothing,
				attrs));
	});
var _mdgriffith$stylish_elephants$Internal_Model$filter = function (attrs) {
	return _elm_lang$core$Tuple$first(
		A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, _p20) {
					var _p21 = _p20;
					var _p24 = _p21._1;
					var _p23 = _p21._0;
					var _p22 = x;
					switch (_p22.ctor) {
						case 'NoAttribute':
							return {ctor: '_Tuple2', _0: _p23, _1: _p24};
						case 'Class':
							return {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: _p24
							};
						case 'Attr':
							return {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: _p24
							};
						case 'StyleClass':
							return {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: _p24
							};
						case 'Width':
							return A2(_elm_lang$core$Set$member, 'width', _p24) ? {ctor: '_Tuple2', _0: _p23, _1: _p24} : {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: A2(_elm_lang$core$Set$insert, 'width', _p24)
							};
						case 'Height':
							return A2(_elm_lang$core$Set$member, 'height', _p24) ? {ctor: '_Tuple2', _0: _p23, _1: _p24} : {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: A2(_elm_lang$core$Set$insert, 'height', _p24)
							};
						case 'Describe':
							return A2(_elm_lang$core$Set$member, 'described', _p24) ? {ctor: '_Tuple2', _0: _p23, _1: _p24} : {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: A2(_elm_lang$core$Set$insert, 'described', _p24)
							};
						case 'Nearby':
							return {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: _p24
							};
						case 'AlignX':
							return A2(_elm_lang$core$Set$member, 'align-x', _p24) ? {ctor: '_Tuple2', _0: _p23, _1: _p24} : {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: A2(_elm_lang$core$Set$insert, 'align-x', _p24)
							};
						case 'AlignY':
							return A2(_elm_lang$core$Set$member, 'align-y', _p24) ? {ctor: '_Tuple2', _0: _p23, _1: _p24} : {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: A2(_elm_lang$core$Set$insert, 'align-y', _p24)
							};
						case 'Filter':
							return {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: _p24
							};
						case 'BoxShadow':
							return {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: _p24
							};
						default:
							return {
								ctor: '_Tuple2',
								_0: {ctor: '::', _0: x, _1: _p23},
								_1: _p24
							};
					}
				}),
			{
				ctor: '_Tuple2',
				_0: {ctor: '[]'},
				_1: _elm_lang$core$Set$empty
			},
			attrs));
};
var _mdgriffith$stylish_elephants$Internal_Model$get = F2(
	function (attrs, isAttr) {
		return A3(
			_elm_lang$core$List$foldr,
			F2(
				function (x, found) {
					return isAttr(x) ? {ctor: '::', _0: x, _1: found} : found;
				}),
			{ctor: '[]'},
			_mdgriffith$stylish_elephants$Internal_Model$filter(attrs));
	});
var _mdgriffith$stylish_elephants$Internal_Model$uncapitalize = function (str) {
	var tail = A2(_elm_lang$core$String$dropLeft, 1, str);
	var head = _elm_lang$core$String$toLower(
		A2(_elm_lang$core$String$left, 1, str));
	return A2(_elm_lang$core$Basics_ops['++'], head, tail);
};
var _mdgriffith$stylish_elephants$Internal_Model$className = function (x) {
	return A4(
		_elm_lang$core$Regex$replace,
		_elm_lang$core$Regex$All,
		_elm_lang$core$Regex$regex('[\\s+]'),
		function (_p25) {
			return '';
		},
		A4(
			_elm_lang$core$Regex$replace,
			_elm_lang$core$Regex$All,
			_elm_lang$core$Regex$regex('[A-Z0-9]+'),
			function (_p26) {
				var _p27 = _p26;
				return A2(
					_elm_lang$core$Basics_ops['++'],
					' ',
					_elm_lang$core$String$toLower(_p27.match));
			},
			A4(
				_elm_lang$core$Regex$replace,
				_elm_lang$core$Regex$All,
				_elm_lang$core$Regex$regex('[^a-zA-Z0-9_-]'),
				function (_p28) {
					return '';
				},
				_mdgriffith$stylish_elephants$Internal_Model$uncapitalize(x))));
};
var _mdgriffith$stylish_elephants$Internal_Model$floorAtZero = function (x) {
	return (_elm_lang$core$Native_Utils.cmp(x, 0) > 0) ? x : 0;
};
var _mdgriffith$stylish_elephants$Internal_Model$emptyTransformGroup = {translate: _elm_lang$core$Maybe$Nothing, rotate: _elm_lang$core$Maybe$Nothing, scale: _elm_lang$core$Maybe$Nothing};
var _mdgriffith$stylish_elephants$Internal_Model$emptyTransformationStates = {focus: _elm_lang$core$Maybe$Nothing, hover: _elm_lang$core$Maybe$Nothing, normal: _elm_lang$core$Maybe$Nothing, active: _elm_lang$core$Maybe$Nothing};
var _mdgriffith$stylish_elephants$Internal_Model$addIfNothing = F2(
	function (val, existing) {
		var _p29 = existing;
		if (_p29.ctor === 'Nothing') {
			return val;
		} else {
			return _p29;
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$stackTransforms = F2(
	function (transform, group) {
		var _p30 = transform;
		switch (_p30.ctor) {
			case 'Move':
				var _p34 = _p30._2;
				var _p33 = _p30._1;
				var _p32 = _p30._0;
				var _p31 = group.translate;
				if (_p31.ctor === 'Nothing') {
					return _elm_lang$core$Native_Utils.update(
						group,
						{
							translate: _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple3', _0: _p32, _1: _p33, _2: _p34})
						});
				} else {
					return _elm_lang$core$Native_Utils.update(
						group,
						{
							translate: _elm_lang$core$Maybe$Just(
								{
									ctor: '_Tuple3',
									_0: A2(_mdgriffith$stylish_elephants$Internal_Model$addIfNothing, _p32, _p31._0._0),
									_1: A2(_mdgriffith$stylish_elephants$Internal_Model$addIfNothing, _p33, _p31._0._1),
									_2: A2(_mdgriffith$stylish_elephants$Internal_Model$addIfNothing, _p34, _p31._0._2)
								})
						});
				}
			case 'Rotate':
				return _elm_lang$core$Native_Utils.update(
					group,
					{
						rotate: A2(
							_mdgriffith$stylish_elephants$Internal_Model$addIfNothing,
							_elm_lang$core$Maybe$Just(
								{ctor: '_Tuple4', _0: _p30._0, _1: _p30._1, _2: _p30._2, _3: _p30._3}),
							group.rotate)
					});
			default:
				return _elm_lang$core$Native_Utils.update(
					group,
					{
						scale: A2(
							_mdgriffith$stylish_elephants$Internal_Model$addIfNothing,
							_elm_lang$core$Maybe$Just(
								{ctor: '_Tuple3', _0: _p30._0, _1: _p30._1, _2: _p30._2}),
							group.scale)
					});
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$stackOn = F3(
	function (maybePseudo, transform, gathered) {
		var states = A2(_elm_lang$core$Maybe$withDefault, _mdgriffith$stylish_elephants$Internal_Model$emptyTransformationStates, gathered.transform);
		var _p35 = maybePseudo;
		if (_p35.ctor === 'Nothing') {
			var normal = states.normal;
			return _elm_lang$core$Native_Utils.update(
				gathered,
				{
					transform: _elm_lang$core$Maybe$Just(
						_elm_lang$core$Native_Utils.update(
							states,
							{
								normal: _elm_lang$core$Maybe$Just(
									A2(
										_mdgriffith$stylish_elephants$Internal_Model$stackTransforms,
										transform,
										A2(_elm_lang$core$Maybe$withDefault, _mdgriffith$stylish_elephants$Internal_Model$emptyTransformGroup, normal)))
							}))
				});
		} else {
			switch (_p35._0.ctor) {
				case 'Hover':
					var hover = states.hover;
					return _elm_lang$core$Native_Utils.update(
						gathered,
						{
							transform: _elm_lang$core$Maybe$Just(
								_elm_lang$core$Native_Utils.update(
									states,
									{
										hover: _elm_lang$core$Maybe$Just(
											A2(
												_mdgriffith$stylish_elephants$Internal_Model$stackTransforms,
												transform,
												A2(_elm_lang$core$Maybe$withDefault, _mdgriffith$stylish_elephants$Internal_Model$emptyTransformGroup, hover)))
									}))
						});
				case 'Active':
					var active = states.active;
					return _elm_lang$core$Native_Utils.update(
						gathered,
						{
							transform: _elm_lang$core$Maybe$Just(
								_elm_lang$core$Native_Utils.update(
									states,
									{
										active: _elm_lang$core$Maybe$Just(
											A2(
												_mdgriffith$stylish_elephants$Internal_Model$stackTransforms,
												transform,
												A2(_elm_lang$core$Maybe$withDefault, _mdgriffith$stylish_elephants$Internal_Model$emptyTransformGroup, active)))
									}))
						});
				default:
					var focus = states.focus;
					return _elm_lang$core$Native_Utils.update(
						gathered,
						{
							transform: _elm_lang$core$Maybe$Just(
								_elm_lang$core$Native_Utils.update(
									states,
									{
										focus: _elm_lang$core$Maybe$Just(
											A2(
												_mdgriffith$stylish_elephants$Internal_Model$stackTransforms,
												transform,
												A2(_elm_lang$core$Maybe$withDefault, _mdgriffith$stylish_elephants$Internal_Model$emptyTransformGroup, focus)))
									}))
						});
			}
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$noAreas = function (attrs) {
	var notAnArea = function (a) {
		var _p36 = a;
		if (_p36.ctor === 'Describe') {
			return false;
		} else {
			return true;
		}
	};
	return A2(_elm_lang$core$List$filter, notAnArea, attrs);
};
var _mdgriffith$stylish_elephants$Internal_Model$alignYName = function (align) {
	var _p37 = align;
	switch (_p37.ctor) {
		case 'Top':
			return A2(_elm_lang$core$Basics_ops['++'], 'aligned-vertically ', _mdgriffith$stylish_elephants$Internal_Style$classes.alignTop);
		case 'Bottom':
			return A2(_elm_lang$core$Basics_ops['++'], 'aligned-vertically ', _mdgriffith$stylish_elephants$Internal_Style$classes.alignBottom);
		default:
			return A2(_elm_lang$core$Basics_ops['++'], 'aligned-vertically ', _mdgriffith$stylish_elephants$Internal_Style$classes.alignCenterY);
	}
};
var _mdgriffith$stylish_elephants$Internal_Model$alignXName = function (align) {
	var _p38 = align;
	switch (_p38.ctor) {
		case 'Left':
			return A2(_elm_lang$core$Basics_ops['++'], 'aligned-horizontally ', _mdgriffith$stylish_elephants$Internal_Style$classes.alignLeft);
		case 'Right':
			return A2(_elm_lang$core$Basics_ops['++'], 'aligned-horizontally ', _mdgriffith$stylish_elephants$Internal_Style$classes.alignRight);
		default:
			return A2(_elm_lang$core$Basics_ops['++'], 'aligned-horizontally ', _mdgriffith$stylish_elephants$Internal_Style$classes.alignCenterX);
	}
};
var _mdgriffith$stylish_elephants$Internal_Model$renderNode = F4(
	function (_p39, children, styles, context) {
		var _p40 = _p39;
		var _p53 = _p40.attributes;
		var _p52 = _p40.alignment;
		var createNode = F3(
			function (node, attrs, styles) {
				var _p41 = children;
				if (_p41.ctor === 'Keyed') {
					var _p43 = _p41._0;
					return A3(
						_elm_lang$virtual_dom$VirtualDom$keyedNode,
						node,
						attrs,
						function () {
							var _p42 = styles;
							if (_p42.ctor === 'Nothing') {
								return _p43;
							} else {
								return {
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'stylesheet',
										_1: A3(
											_elm_lang$virtual_dom$VirtualDom$node,
											'style',
											{
												ctor: '::',
												_0: _elm_lang$html$Html_Attributes$class('stylesheet'),
												_1: {ctor: '[]'}
											},
											{
												ctor: '::',
												_0: _elm_lang$html$Html$text(_p42._0),
												_1: {ctor: '[]'}
											})
									},
									_1: _p43
								};
							}
						}());
				} else {
					var _p45 = _p41._0;
					return A3(
						_elm_lang$virtual_dom$VirtualDom$node,
						node,
						attrs,
						function () {
							var _p44 = styles;
							if (_p44.ctor === 'Nothing') {
								return _p45;
							} else {
								return {
									ctor: '::',
									_0: A3(
										_elm_lang$virtual_dom$VirtualDom$node,
										'style',
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('stylesheet'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: _elm_lang$html$Html$text(_p44._0),
											_1: {ctor: '[]'}
										}),
									_1: _p45
								};
							}
						}());
				}
			});
		var html = function () {
			var _p46 = _p40.node;
			switch (_p46.ctor) {
				case 'Generic':
					return A3(createNode, 'div', _p53, styles);
				case 'NodeName':
					return A3(createNode, _p46._0, _p53, styles);
				default:
					return A3(
						_elm_lang$virtual_dom$VirtualDom$node,
						_p46._0,
						_p53,
						{
							ctor: '::',
							_0: A3(
								createNode,
								_p46._1,
								{
									ctor: '::',
									_0: _elm_lang$html$Html_Attributes$class('se el'),
									_1: {ctor: '[]'}
								},
								styles),
							_1: {ctor: '[]'}
						});
			}
		}();
		var _p47 = context;
		switch (_p47.ctor) {
			case 'AsRow':
				var _p48 = _p40.width;
				if ((_p48.ctor === 'Just') && (_p48._0.ctor === 'Fill')) {
					return html;
				} else {
					var _p49 = _p52;
					_v29_2:
					do {
						if ((_p49.ctor === 'Aligned') && (_p49._0.ctor === 'Just')) {
							switch (_p49._0._0.ctor) {
								case 'Right':
									return A3(
										_elm_lang$virtual_dom$VirtualDom$node,
										'u',
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('se el container align-container-right content-center-y'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: html,
											_1: {ctor: '[]'}
										});
								case 'CenterX':
									return A3(
										_elm_lang$virtual_dom$VirtualDom$node,
										's',
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('se el container align-container-center-x content-center-y'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: html,
											_1: {ctor: '[]'}
										});
								default:
									break _v29_2;
							}
						} else {
							break _v29_2;
						}
					} while(false);
					return html;
				}
			case 'AsColumn':
				var _p50 = _p40.height;
				if ((_p50.ctor === 'Just') && (_p50._0.ctor === 'Fill')) {
					return html;
				} else {
					var _p51 = _p52;
					_v31_2:
					do {
						if ((_p51.ctor === 'Aligned') && (_p51._1.ctor === 'Just')) {
							switch (_p51._1._0.ctor) {
								case 'CenterY':
									return A3(
										_elm_lang$virtual_dom$VirtualDom$node,
										's',
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('se el container align-container-center-y'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: html,
											_1: {ctor: '[]'}
										});
								case 'Bottom':
									return A3(
										_elm_lang$virtual_dom$VirtualDom$node,
										'u',
										{
											ctor: '::',
											_0: _elm_lang$html$Html_Attributes$class('se el container align-container-bottom'),
											_1: {ctor: '[]'}
										},
										{
											ctor: '::',
											_0: html,
											_1: {ctor: '[]'}
										});
								default:
									break _v31_2;
							}
						} else {
							break _v31_2;
						}
					} while(false);
					return html;
				}
			default:
				return html;
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$Gathered = function (a) {
	return function (b) {
		return function (c) {
			return function (d) {
				return function (e) {
					return function (f) {
						return function (g) {
							return function (h) {
								return function (i) {
									return function (j) {
										return function (k) {
											return function (l) {
												return {node: a, attributes: b, styles: c, alignment: d, width: e, height: f, nearbys: g, filters: h, boxShadows: i, textShadows: j, transform: k, has: l};
											};
										};
									};
								};
							};
						};
					};
				};
			};
		};
	};
};
var _mdgriffith$stylish_elephants$Internal_Model$Decorated = F4(
	function (a, b, c, d) {
		return {focus: a, hover: b, normal: c, active: d};
	});
var _mdgriffith$stylish_elephants$Internal_Model$TransformationGroup = F3(
	function (a, b, c) {
		return {rotate: a, translate: b, scale: c};
	});
var _mdgriffith$stylish_elephants$Internal_Model$OptionRecord = F3(
	function (a, b, c) {
		return {hover: a, focus: b, mode: c};
	});
var _mdgriffith$stylish_elephants$Internal_Model$FocusStyle = F3(
	function (a, b, c) {
		return {borderColor: a, shadow: b, backgroundColor: c};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Shadow = F4(
	function (a, b, c, d) {
		return {color: a, offset: b, blur: c, size: d};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Empty = {ctor: 'Empty'};
var _mdgriffith$stylish_elephants$Internal_Model$Text = function (a) {
	return {ctor: 'Text', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Styled = function (a) {
	return {ctor: 'Styled', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Unstyled = function (a) {
	return {ctor: 'Unstyled', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$unstyled = function (_p54) {
	return _mdgriffith$stylish_elephants$Internal_Model$Unstyled(
		_elm_lang$core$Basics$always(_p54));
};
var _mdgriffith$stylish_elephants$Internal_Model$map = F2(
	function (fn, el) {
		var _p55 = el;
		switch (_p55.ctor) {
			case 'Styled':
				var _p56 = _p55._0;
				return _mdgriffith$stylish_elephants$Internal_Model$Styled(
					{
						styles: _p56.styles,
						html: F2(
							function (add, context) {
								return A2(
									_elm_lang$html$Html$map,
									fn,
									A2(_p56.html, add, context));
							})
					});
			case 'Unstyled':
				return _mdgriffith$stylish_elephants$Internal_Model$Unstyled(
					function (_p57) {
						return A2(
							_elm_lang$html$Html$map,
							fn,
							_p55._0(_p57));
					});
			case 'Text':
				return _mdgriffith$stylish_elephants$Internal_Model$Text(_p55._0);
			default:
				return _mdgriffith$stylish_elephants$Internal_Model$Empty;
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$AsTextColumn = {ctor: 'AsTextColumn'};
var _mdgriffith$stylish_elephants$Internal_Model$asTextColumn = _mdgriffith$stylish_elephants$Internal_Model$AsTextColumn;
var _mdgriffith$stylish_elephants$Internal_Model$AsParagraph = {ctor: 'AsParagraph'};
var _mdgriffith$stylish_elephants$Internal_Model$asParagraph = _mdgriffith$stylish_elephants$Internal_Model$AsParagraph;
var _mdgriffith$stylish_elephants$Internal_Model$AsGrid = {ctor: 'AsGrid'};
var _mdgriffith$stylish_elephants$Internal_Model$asGrid = _mdgriffith$stylish_elephants$Internal_Model$AsGrid;
var _mdgriffith$stylish_elephants$Internal_Model$AsEl = {ctor: 'AsEl'};
var _mdgriffith$stylish_elephants$Internal_Model$asEl = _mdgriffith$stylish_elephants$Internal_Model$AsEl;
var _mdgriffith$stylish_elephants$Internal_Model$renderNearbyGroupAbsolute = function (nearbys) {
	var create = function (_p58) {
		var _p59 = _p58;
		return A2(
			_elm_lang$html$Html$div,
			{
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class(
					_mdgriffith$stylish_elephants$Internal_Model$locationClass(_p59._0)),
				_1: {ctor: '[]'}
			},
			{
				ctor: '::',
				_0: function () {
					var _p60 = _p59._1;
					switch (_p60.ctor) {
						case 'Empty':
							return _elm_lang$html$Html$text('');
						case 'Text':
							return _mdgriffith$stylish_elephants$Internal_Model$textElement(_p60._0);
						case 'Unstyled':
							return _p60._0(_mdgriffith$stylish_elephants$Internal_Model$asEl);
						default:
							return A2(_p60._0.html, _elm_lang$core$Maybe$Nothing, _mdgriffith$stylish_elephants$Internal_Model$asEl);
					}
				}(),
				_1: {ctor: '[]'}
			});
	};
	return A2(_elm_lang$core$List$map, create, nearbys);
};
var _mdgriffith$stylish_elephants$Internal_Model$AsColumn = {ctor: 'AsColumn'};
var _mdgriffith$stylish_elephants$Internal_Model$asColumn = _mdgriffith$stylish_elephants$Internal_Model$AsColumn;
var _mdgriffith$stylish_elephants$Internal_Model$AsRow = {ctor: 'AsRow'};
var _mdgriffith$stylish_elephants$Internal_Model$asRow = _mdgriffith$stylish_elephants$Internal_Model$AsRow;
var _mdgriffith$stylish_elephants$Internal_Model$Aligned = F2(
	function (a, b) {
		return {ctor: 'Aligned', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Unaligned = {ctor: 'Unaligned'};
var _mdgriffith$stylish_elephants$Internal_Model$Right = {ctor: 'Right'};
var _mdgriffith$stylish_elephants$Internal_Model$CenterX = {ctor: 'CenterX'};
var _mdgriffith$stylish_elephants$Internal_Model$Left = {ctor: 'Left'};
var _mdgriffith$stylish_elephants$Internal_Model$Bottom = {ctor: 'Bottom'};
var _mdgriffith$stylish_elephants$Internal_Model$CenterY = {ctor: 'CenterY'};
var _mdgriffith$stylish_elephants$Internal_Model$Top = {ctor: 'Top'};
var _mdgriffith$stylish_elephants$Internal_Model$Shadows = F2(
	function (a, b) {
		return {ctor: 'Shadows', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$onlyStyles = function (attr) {
	var _p61 = attr;
	switch (_p61.ctor) {
		case 'StyleClass':
			return _elm_lang$core$Maybe$Just(_p61._0);
		case 'TextShadow':
			var stringName = _mdgriffith$stylish_elephants$Internal_Model$formatTextShadow(_p61._0);
			return _elm_lang$core$Maybe$Just(
				A2(
					_mdgriffith$stylish_elephants$Internal_Model$Shadows,
					A2(
						_elm_lang$core$Basics_ops['++'],
						'txt-shadow-',
						_mdgriffith$stylish_elephants$Internal_Model$className(stringName)),
					stringName));
		case 'BoxShadow':
			var stringName = _mdgriffith$stylish_elephants$Internal_Model$formatBoxShadow(_p61._0);
			return _elm_lang$core$Maybe$Just(
				A2(
					_mdgriffith$stylish_elephants$Internal_Model$Shadows,
					A2(
						_elm_lang$core$Basics_ops['++'],
						'box-shadow-',
						_mdgriffith$stylish_elephants$Internal_Model$className(stringName)),
					stringName));
		default:
			return _elm_lang$core$Maybe$Nothing;
	}
};
var _mdgriffith$stylish_elephants$Internal_Model$Transparency = F2(
	function (a, b) {
		return {ctor: 'Transparency', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$PseudoSelector = F2(
	function (a, b) {
		return {ctor: 'PseudoSelector', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Transform = function (a) {
	return {ctor: 'Transform', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$GridPosition = function (a) {
	return {ctor: 'GridPosition', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$GridTemplateStyle = function (a) {
	return {ctor: 'GridTemplateStyle', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$PaddingStyle = F4(
	function (a, b, c, d) {
		return {ctor: 'PaddingStyle', _0: a, _1: b, _2: c, _3: d};
	});
var _mdgriffith$stylish_elephants$Internal_Model$SpacingStyle = F2(
	function (a, b) {
		return {ctor: 'SpacingStyle', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Colored = F3(
	function (a, b, c) {
		return {ctor: 'Colored', _0: a, _1: b, _2: c};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Single = F3(
	function (a, b, c) {
		return {ctor: 'Single', _0: a, _1: b, _2: c};
	});
var _mdgriffith$stylish_elephants$Internal_Model$renderTransformationGroup = F2(
	function (maybePseudo, group) {
		var name = A2(
			_elm_lang$core$String$join,
			'-',
			A2(
				_elm_lang$core$List$filterMap,
				_elm_lang$core$Basics$identity,
				{
					ctor: '::',
					_0: A3(
						_elm_lang$core$Basics$flip,
						_elm_lang$core$Maybe$map,
						group.translate,
						function (_p62) {
							var _p63 = _p62;
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'move-',
								A2(
									_elm_lang$core$Basics_ops['++'],
									_mdgriffith$stylish_elephants$Internal_Model$floatClass(
										A2(_elm_lang$core$Maybe$withDefault, 0, _p63._0)),
									A2(
										_elm_lang$core$Basics_ops['++'],
										'-',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_mdgriffith$stylish_elephants$Internal_Model$floatClass(
												A2(_elm_lang$core$Maybe$withDefault, 0, _p63._1)),
											A2(
												_elm_lang$core$Basics_ops['++'],
												'-',
												_mdgriffith$stylish_elephants$Internal_Model$floatClass(
													A2(_elm_lang$core$Maybe$withDefault, 0, _p63._2)))))));
						}),
					_1: {
						ctor: '::',
						_0: A3(
							_elm_lang$core$Basics$flip,
							_elm_lang$core$Maybe$map,
							group.scale,
							function (_p64) {
								var _p65 = _p64;
								return A2(
									_elm_lang$core$Basics_ops['++'],
									'scale',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_mdgriffith$stylish_elephants$Internal_Model$floatClass(_p65._0),
										A2(
											_elm_lang$core$Basics_ops['++'],
											'-',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_mdgriffith$stylish_elephants$Internal_Model$floatClass(_p65._1),
												A2(
													_elm_lang$core$Basics_ops['++'],
													'-',
													_mdgriffith$stylish_elephants$Internal_Model$floatClass(_p65._2))))));
							}),
						_1: {
							ctor: '::',
							_0: A3(
								_elm_lang$core$Basics$flip,
								_elm_lang$core$Maybe$map,
								group.rotate,
								function (_p66) {
									var _p67 = _p66;
									return A2(
										_elm_lang$core$Basics_ops['++'],
										'rotate-',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_mdgriffith$stylish_elephants$Internal_Model$floatClass(_p67._0),
											A2(
												_elm_lang$core$Basics_ops['++'],
												'-',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_mdgriffith$stylish_elephants$Internal_Model$floatClass(_p67._1),
													A2(
														_elm_lang$core$Basics_ops['++'],
														'-',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_mdgriffith$stylish_elephants$Internal_Model$floatClass(_p67._2),
															A2(
																_elm_lang$core$Basics_ops['++'],
																'-',
																_mdgriffith$stylish_elephants$Internal_Model$floatClass(_p67._3))))))));
								}),
							_1: {ctor: '[]'}
						}
					}
				}));
		var rotate = A3(
			_elm_lang$core$Basics$flip,
			_elm_lang$core$Maybe$map,
			group.rotate,
			function (_p68) {
				var _p69 = _p68;
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'rotate3d(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(_p69._0),
						A2(
							_elm_lang$core$Basics_ops['++'],
							',',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(_p69._1),
								A2(
									_elm_lang$core$Basics_ops['++'],
									',',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(_p69._2),
										A2(
											_elm_lang$core$Basics_ops['++'],
											',',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(_p69._3),
												'rad)'))))))));
			});
		var scale = A3(
			_elm_lang$core$Basics$flip,
			_elm_lang$core$Maybe$map,
			group.scale,
			function (_p70) {
				var _p71 = _p70;
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'scale3d(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(_p71._0),
						A2(
							_elm_lang$core$Basics_ops['++'],
							', ',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(_p71._1),
								A2(
									_elm_lang$core$Basics_ops['++'],
									', ',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(_p71._2),
										')'))))));
			});
		var translate = A3(
			_elm_lang$core$Basics$flip,
			_elm_lang$core$Maybe$map,
			group.translate,
			function (_p72) {
				var _p73 = _p72;
				return A2(
					_elm_lang$core$Basics_ops['++'],
					'translate3d(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						_elm_lang$core$Basics$toString(
							A2(_elm_lang$core$Maybe$withDefault, 0, _p73._0)),
						A2(
							_elm_lang$core$Basics_ops['++'],
							'px, ',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(
									A2(_elm_lang$core$Maybe$withDefault, 0, _p73._1)),
								A2(
									_elm_lang$core$Basics_ops['++'],
									'px, ',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(
											A2(_elm_lang$core$Maybe$withDefault, 0, _p73._2)),
										'px)'))))));
			});
		var transformations = A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			{
				ctor: '::',
				_0: scale,
				_1: {
					ctor: '::',
					_0: translate,
					_1: {
						ctor: '::',
						_0: rotate,
						_1: {ctor: '[]'}
					}
				}
			});
		var _p74 = transformations;
		if (_p74.ctor === '[]') {
			return _elm_lang$core$Maybe$Nothing;
		} else {
			var _p75 = function () {
				var _p76 = maybePseudo;
				if (_p76.ctor === 'Nothing') {
					return {
						ctor: '_Tuple2',
						_0: A2(_elm_lang$core$Basics_ops['++'], 'transform-', name),
						_1: A2(_elm_lang$core$Basics_ops['++'], '.transform-', name)
					};
				} else {
					var _p77 = _p76._0;
					switch (_p77.ctor) {
						case 'Hover':
							return {
								ctor: '_Tuple2',
								_0: A2(
									_elm_lang$core$Basics_ops['++'],
									'transform-',
									A2(_elm_lang$core$Basics_ops['++'], name, '-hover')),
								_1: A2(
									_elm_lang$core$Basics_ops['++'],
									'.transform-',
									A2(_elm_lang$core$Basics_ops['++'], name, '-hover:hover'))
							};
						case 'Focus':
							return {
								ctor: '_Tuple2',
								_0: A2(
									_elm_lang$core$Basics_ops['++'],
									'transform-',
									A2(_elm_lang$core$Basics_ops['++'], name, '-focus')),
								_1: A2(
									_elm_lang$core$Basics_ops['++'],
									'.transform-',
									A2(
										_elm_lang$core$Basics_ops['++'],
										name,
										A2(
											_elm_lang$core$Basics_ops['++'],
											'-focus:focus, .se:focus ~ .transform-',
											A2(_elm_lang$core$Basics_ops['++'], name, '-focus'))))
							};
						default:
							return {
								ctor: '_Tuple2',
								_0: A2(
									_elm_lang$core$Basics_ops['++'],
									'transform-',
									A2(_elm_lang$core$Basics_ops['++'], name, '-active')),
								_1: A2(
									_elm_lang$core$Basics_ops['++'],
									'.transform-',
									A2(_elm_lang$core$Basics_ops['++'], name, '-active:active'))
							};
					}
				}
			}();
			var classOnElement = _p75._0;
			var classInStylesheet = _p75._1;
			var transforms = A2(_elm_lang$core$String$join, ' ', _p74);
			return _elm_lang$core$Maybe$Just(
				{
					ctor: '_Tuple2',
					_0: classOnElement,
					_1: A3(_mdgriffith$stylish_elephants$Internal_Model$Single, classInStylesheet, 'transform', transforms)
				});
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$FontSize = function (a) {
	return {ctor: 'FontSize', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$FontFamily = F2(
	function (a, b) {
		return {ctor: 'FontFamily', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Style = F2(
	function (a, b) {
		return {ctor: 'Style', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$tag = F2(
	function (label, style) {
		var _p78 = style;
		switch (_p78.ctor) {
			case 'Single':
				return A3(
					_mdgriffith$stylish_elephants$Internal_Model$Single,
					A2(
						_elm_lang$core$Basics_ops['++'],
						label,
						A2(_elm_lang$core$Basics_ops['++'], '-', _p78._0)),
					_p78._1,
					_p78._2);
			case 'Colored':
				return A3(
					_mdgriffith$stylish_elephants$Internal_Model$Colored,
					A2(
						_elm_lang$core$Basics_ops['++'],
						label,
						A2(_elm_lang$core$Basics_ops['++'], '-', _p78._0)),
					_p78._1,
					_p78._2);
			case 'Style':
				return A2(
					_mdgriffith$stylish_elephants$Internal_Model$Style,
					A2(
						_elm_lang$core$Basics_ops['++'],
						label,
						A2(_elm_lang$core$Basics_ops['++'], '-', _p78._0)),
					_p78._1);
			case 'Transparency':
				return A2(
					_mdgriffith$stylish_elephants$Internal_Model$Transparency,
					A2(
						_elm_lang$core$Basics_ops['++'],
						label,
						A2(_elm_lang$core$Basics_ops['++'], '-', _p78._0)),
					_p78._1);
			default:
				return _p78;
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$Active = {ctor: 'Active'};
var _mdgriffith$stylish_elephants$Internal_Model$Hover = {ctor: 'Hover'};
var _mdgriffith$stylish_elephants$Internal_Model$Focus = {ctor: 'Focus'};
var _mdgriffith$stylish_elephants$Internal_Model$finalize = function (gathered) {
	var addTextShadows = function (_p79) {
		var _p80 = _p79;
		var _p84 = _p80._1;
		var _p83 = _p80._0;
		var _p81 = gathered.textShadows;
		if (_p81.ctor === 'Nothing') {
			return {ctor: '_Tuple2', _0: _p83, _1: _p84};
		} else {
			var _p82 = _p81._0;
			var name = A2(
				_elm_lang$core$Basics_ops['++'],
				'text-shadow-',
				_mdgriffith$stylish_elephants$Internal_Model$className(_p82));
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: name, _1: _p83},
				_1: {
					ctor: '::',
					_0: A3(
						_mdgriffith$stylish_elephants$Internal_Model$Single,
						A2(_elm_lang$core$Basics_ops['++'], '.', name),
						'text-shadow',
						_p82),
					_1: _p84
				}
			};
		}
	};
	var addBoxShadows = function (_p85) {
		var _p86 = _p85;
		var _p90 = _p86._1;
		var _p89 = _p86._0;
		var _p87 = gathered.boxShadows;
		if (_p87.ctor === 'Nothing') {
			return {ctor: '_Tuple2', _0: _p89, _1: _p90};
		} else {
			var _p88 = _p87._0;
			var name = A2(
				_elm_lang$core$Basics_ops['++'],
				'box-shadow-',
				_mdgriffith$stylish_elephants$Internal_Model$className(_p88));
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: name, _1: _p89},
				_1: {
					ctor: '::',
					_0: A3(
						_mdgriffith$stylish_elephants$Internal_Model$Single,
						A2(_elm_lang$core$Basics_ops['++'], '.', name),
						'box-shadow',
						_p88),
					_1: _p90
				}
			};
		}
	};
	var addFilters = function (_p91) {
		var _p92 = _p91;
		var _p96 = _p92._1;
		var _p95 = _p92._0;
		var _p93 = gathered.filters;
		if (_p93.ctor === 'Nothing') {
			return {ctor: '_Tuple2', _0: _p95, _1: _p96};
		} else {
			var _p94 = _p93._0;
			var name = A2(
				_elm_lang$core$Basics_ops['++'],
				'filter-',
				_mdgriffith$stylish_elephants$Internal_Model$className(_p94));
			return {
				ctor: '_Tuple2',
				_0: {ctor: '::', _0: name, _1: _p95},
				_1: {
					ctor: '::',
					_0: A3(
						_mdgriffith$stylish_elephants$Internal_Model$Single,
						A2(_elm_lang$core$Basics_ops['++'], '.', name),
						'filter',
						_p94),
					_1: _p96
				}
			};
		}
	};
	var add = F2(
		function ($new, _p97) {
			var _p98 = _p97;
			var _p101 = _p98._1;
			var _p100 = _p98._0;
			var _p99 = $new;
			if (_p99.ctor === 'Nothing') {
				return {ctor: '_Tuple2', _0: _p100, _1: _p101};
			} else {
				return {
					ctor: '_Tuple2',
					_0: {ctor: '::', _0: _p99._0._0, _1: _p100},
					_1: {ctor: '::', _0: _p99._0._1, _1: _p101}
				};
			}
		});
	var addTransform = function (_p102) {
		var _p103 = _p102;
		var _p107 = _p103._1;
		var _p106 = _p103._0;
		var _p104 = gathered.transform;
		if (_p104.ctor === 'Nothing') {
			return {ctor: '_Tuple2', _0: _p106, _1: _p107};
		} else {
			var _p105 = _p104._0;
			return A2(
				add,
				A2(
					_elm_lang$core$Maybe$andThen,
					_mdgriffith$stylish_elephants$Internal_Model$renderTransformationGroup(
						_elm_lang$core$Maybe$Just(_mdgriffith$stylish_elephants$Internal_Model$Active)),
					_p105.active),
				A2(
					add,
					A2(
						_elm_lang$core$Maybe$andThen,
						_mdgriffith$stylish_elephants$Internal_Model$renderTransformationGroup(
							_elm_lang$core$Maybe$Just(_mdgriffith$stylish_elephants$Internal_Model$Hover)),
						_p105.hover),
					A2(
						add,
						A2(
							_elm_lang$core$Maybe$andThen,
							_mdgriffith$stylish_elephants$Internal_Model$renderTransformationGroup(
								_elm_lang$core$Maybe$Just(_mdgriffith$stylish_elephants$Internal_Model$Focus)),
							_p105.focus),
						A2(
							add,
							A2(
								_elm_lang$core$Maybe$andThen,
								_mdgriffith$stylish_elephants$Internal_Model$renderTransformationGroup(_elm_lang$core$Maybe$Nothing),
								_p105.normal),
							{ctor: '_Tuple2', _0: _p106, _1: _p107}))));
		}
	};
	var _p108 = addTransform(
		addTextShadows(
			addBoxShadows(
				addFilters(
					{
						ctor: '_Tuple2',
						_0: {ctor: '[]'},
						_1: gathered.styles
					}))));
	var classes = _p108._0;
	var styles = _p108._1;
	return _elm_lang$core$Native_Utils.update(
		gathered,
		{
			styles: styles,
			attributes: {
				ctor: '::',
				_0: _elm_lang$html$Html_Attributes$class(
					A2(_elm_lang$core$String$join, ' ', classes)),
				_1: gathered.attributes
			}
		});
};
var _mdgriffith$stylish_elephants$Internal_Model$ImportFont = F2(
	function (a, b) {
		return {ctor: 'ImportFont', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Typeface = function (a) {
	return {ctor: 'Typeface', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Monospace = {ctor: 'Monospace'};
var _mdgriffith$stylish_elephants$Internal_Model$SansSerif = {ctor: 'SansSerif'};
var _mdgriffith$stylish_elephants$Internal_Model$Serif = {ctor: 'Serif'};
var _mdgriffith$stylish_elephants$Internal_Model$Property = F2(
	function (a, b) {
		return {ctor: 'Property', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$renderFocusStyle = function (focus) {
	return A2(
		_mdgriffith$stylish_elephants$Internal_Model$Style,
		'.se:focus .focusable, .se.focusable:focus',
		A2(
			_elm_lang$core$List$filterMap,
			_elm_lang$core$Basics$identity,
			{
				ctor: '::',
				_0: A2(
					_elm_lang$core$Maybe$map,
					function (color) {
						return A2(
							_mdgriffith$stylish_elephants$Internal_Model$Property,
							'border-color',
							_mdgriffith$stylish_elephants$Internal_Model$formatColor(color));
					},
					focus.borderColor),
				_1: {
					ctor: '::',
					_0: A2(
						_elm_lang$core$Maybe$map,
						function (color) {
							return A2(
								_mdgriffith$stylish_elephants$Internal_Model$Property,
								'background-color',
								_mdgriffith$stylish_elephants$Internal_Model$formatColor(color));
						},
						focus.backgroundColor),
					_1: {
						ctor: '::',
						_0: A2(
							_elm_lang$core$Maybe$map,
							function (shadow) {
								return A2(
									_mdgriffith$stylish_elephants$Internal_Model$Property,
									'box-shadow',
									_mdgriffith$stylish_elephants$Internal_Model$formatBoxShadow(
										{color: shadow.color, offset: shadow.offset, inset: false, blur: shadow.blur, size: shadow.size}));
							},
							focus.shadow),
						_1: {
							ctor: '::',
							_0: _elm_lang$core$Maybe$Just(
								A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'outline', 'none')),
							_1: {ctor: '[]'}
						}
					}
				}
			}));
};
var _mdgriffith$stylish_elephants$Internal_Model$toStyleSheetString = F2(
	function (options, stylesheet) {
		var renderTopLevels = function (rule) {
			var _p109 = rule;
			if (_p109.ctor === 'FontFamily') {
				var getImports = function (font) {
					var _p110 = font;
					if (_p110.ctor === 'ImportFont') {
						return _elm_lang$core$Maybe$Just(
							A2(
								_elm_lang$core$Basics_ops['++'],
								'@import url(\'',
								A2(_elm_lang$core$Basics_ops['++'], _p110._1, '\');')));
					} else {
						return _elm_lang$core$Maybe$Nothing;
					}
				};
				return _elm_lang$core$Maybe$Just(
					A2(
						_elm_lang$core$String$join,
						'\n',
						A2(_elm_lang$core$List$filterMap, getImports, _p109._1)));
			} else {
				return _elm_lang$core$Maybe$Nothing;
			}
		};
		var renderProps = F3(
			function (force, _p111, existing) {
				var _p112 = _p111;
				var _p114 = _p112._1;
				var _p113 = _p112._0;
				return force ? A2(
					_elm_lang$core$Basics_ops['++'],
					existing,
					A2(
						_elm_lang$core$Basics_ops['++'],
						'\n  ',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_p113,
							A2(
								_elm_lang$core$Basics_ops['++'],
								': ',
								A2(_elm_lang$core$Basics_ops['++'], _p114, ' !important;'))))) : A2(
					_elm_lang$core$Basics_ops['++'],
					existing,
					A2(
						_elm_lang$core$Basics_ops['++'],
						'\n  ',
						A2(
							_elm_lang$core$Basics_ops['++'],
							_p113,
							A2(
								_elm_lang$core$Basics_ops['++'],
								': ',
								A2(_elm_lang$core$Basics_ops['++'], _p114, ';')))));
			});
		var renderStyle = F4(
			function (force, maybePseudo, selector, props) {
				var _p115 = maybePseudo;
				if (_p115.ctor === 'Nothing') {
					return A2(
						_elm_lang$core$Basics_ops['++'],
						selector,
						A2(
							_elm_lang$core$Basics_ops['++'],
							'{',
							A2(
								_elm_lang$core$Basics_ops['++'],
								A3(
									_elm_lang$core$List$foldl,
									renderProps(force),
									'',
									props),
								'\n}')));
				} else {
					var _p116 = _p115._0;
					switch (_p116.ctor) {
						case 'Hover':
							return A2(
								_elm_lang$core$Basics_ops['++'],
								selector,
								A2(
									_elm_lang$core$Basics_ops['++'],
									':hover {',
									A2(
										_elm_lang$core$Basics_ops['++'],
										A3(
											_elm_lang$core$List$foldl,
											renderProps(force),
											'',
											props),
										'\n}')));
						case 'Focus':
							var renderedProps = A3(
								_elm_lang$core$List$foldl,
								renderProps(force),
								'',
								props);
							return A2(
								_elm_lang$core$String$join,
								'\n',
								{
									ctor: '::',
									_0: A2(
										_elm_lang$core$Basics_ops['++'],
										selector,
										A2(
											_elm_lang$core$Basics_ops['++'],
											':focus {',
											A2(_elm_lang$core$Basics_ops['++'], renderedProps, '\n}'))),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$core$Basics_ops['++'],
											'.se:focus ~ ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												selector,
												A2(
													_elm_lang$core$Basics_ops['++'],
													':not(.focus)  {',
													A2(_elm_lang$core$Basics_ops['++'], renderedProps, '\n}')))),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$core$Basics_ops['++'],
												'.se:focus ',
												A2(
													_elm_lang$core$Basics_ops['++'],
													selector,
													A2(
														_elm_lang$core$Basics_ops['++'],
														'  {',
														A2(_elm_lang$core$Basics_ops['++'], renderedProps, '\n}')))),
											_1: {ctor: '[]'}
										}
									}
								});
						default:
							return A2(
								_elm_lang$core$Basics_ops['++'],
								selector,
								A2(
									_elm_lang$core$Basics_ops['++'],
									':active {',
									A2(
										_elm_lang$core$Basics_ops['++'],
										A3(
											_elm_lang$core$List$foldl,
											renderProps(force),
											'',
											props),
										'\n}')));
					}
				}
			});
		var renderStyleRule = F3(
			function (rule, maybePseudo, force) {
				var _p117 = rule;
				switch (_p117.ctor) {
					case 'Style':
						return A4(renderStyle, force, maybePseudo, _p117._0, _p117._1);
					case 'Shadows':
						return A4(
							renderStyle,
							force,
							maybePseudo,
							A2(_elm_lang$core$Basics_ops['++'], '.', _p117._0),
							{
								ctor: '::',
								_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'box-shadow', _p117._1),
								_1: {ctor: '[]'}
							});
					case 'Transparency':
						var _p118 = _p117._0;
						var opacity = A2(
							_elm_lang$core$Basics$max,
							0,
							A2(_elm_lang$core$Basics$min, 1, 1 - _p117._1));
						return (_elm_lang$core$Native_Utils.cmp(opacity, 0) < 1) ? A4(
							renderStyle,
							force,
							maybePseudo,
							A2(_elm_lang$core$Basics_ops['++'], '.', _p118),
							{
								ctor: '::',
								_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'opacity', '0'),
								_1: {
									ctor: '::',
									_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'pointer-events', 'none'),
									_1: {ctor: '[]'}
								}
							}) : A4(
							renderStyle,
							force,
							maybePseudo,
							A2(_elm_lang$core$Basics_ops['++'], '.', _p118),
							{
								ctor: '::',
								_0: A2(
									_mdgriffith$stylish_elephants$Internal_Model$Property,
									'opacity',
									_elm_lang$core$Basics$toString(opacity)),
								_1: {
									ctor: '::',
									_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'pointer-events', 'auto'),
									_1: {ctor: '[]'}
								}
							});
					case 'FontSize':
						var _p119 = _p117._0;
						return A4(
							renderStyle,
							force,
							maybePseudo,
							A2(
								_elm_lang$core$Basics_ops['++'],
								'.font-size-',
								_mdgriffith$stylish_elephants$Internal_Model$intToString(_p119)),
							{
								ctor: '::',
								_0: A2(
									_mdgriffith$stylish_elephants$Internal_Model$Property,
									'font-size',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_mdgriffith$stylish_elephants$Internal_Model$intToString(_p119),
										'px')),
								_1: {ctor: '[]'}
							});
					case 'FontFamily':
						return A4(
							renderStyle,
							force,
							maybePseudo,
							A2(_elm_lang$core$Basics_ops['++'], '.', _p117._0),
							{
								ctor: '::',
								_0: A2(
									_mdgriffith$stylish_elephants$Internal_Model$Property,
									'font-family',
									_mdgriffith$stylish_elephants$Internal_Model$renderFont(_p117._1)),
								_1: {ctor: '[]'}
							});
					case 'Single':
						return A4(
							renderStyle,
							force,
							maybePseudo,
							_p117._0,
							{
								ctor: '::',
								_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, _p117._1, _p117._2),
								_1: {ctor: '[]'}
							});
					case 'Colored':
						return A4(
							renderStyle,
							force,
							maybePseudo,
							_p117._0,
							{
								ctor: '::',
								_0: A2(
									_mdgriffith$stylish_elephants$Internal_Model$Property,
									_p117._1,
									_mdgriffith$stylish_elephants$Internal_Model$formatColor(_p117._2)),
								_1: {ctor: '[]'}
							});
					case 'SpacingStyle':
						var _p121 = _p117._1;
						var _p120 = _p117._0;
						var any = _mdgriffith$stylish_elephants$Internal_Style$dot(
							function (_) {
								return _.any;
							}(_mdgriffith$stylish_elephants$Internal_Style$classes));
						var right = _mdgriffith$stylish_elephants$Internal_Style$dot(
							function (_) {
								return _.alignRight;
							}(_mdgriffith$stylish_elephants$Internal_Style$classes));
						var left = _mdgriffith$stylish_elephants$Internal_Style$dot(
							function (_) {
								return _.alignLeft;
							}(_mdgriffith$stylish_elephants$Internal_Style$classes));
						var paragraph = _mdgriffith$stylish_elephants$Internal_Style$dot(
							function (_) {
								return _.paragraph;
							}(_mdgriffith$stylish_elephants$Internal_Style$classes));
						var page = _mdgriffith$stylish_elephants$Internal_Style$dot(
							function (_) {
								return _.page;
							}(_mdgriffith$stylish_elephants$Internal_Style$classes));
						var column = _mdgriffith$stylish_elephants$Internal_Style$dot(
							function (_) {
								return _.column;
							}(_mdgriffith$stylish_elephants$Internal_Style$classes));
						var row = _mdgriffith$stylish_elephants$Internal_Style$dot(
							function (_) {
								return _.row;
							}(_mdgriffith$stylish_elephants$Internal_Style$classes));
						var yPx = A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(_p121),
							'px');
						var xPx = A2(
							_elm_lang$core$Basics_ops['++'],
							_elm_lang$core$Basics$toString(_p120),
							'px');
						var $class = A2(
							_elm_lang$core$Basics_ops['++'],
							'.spacing-',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(_p120),
								A2(
									_elm_lang$core$Basics_ops['++'],
									'-',
									_elm_lang$core$Basics$toString(_p121))));
						return A3(
							_elm_lang$core$List$foldl,
							F2(
								function (x, y) {
									return A2(_elm_lang$core$Basics_ops['++'], x, y);
								}),
							'',
							{
								ctor: '::',
								_0: A4(
									renderStyle,
									force,
									maybePseudo,
									A2(
										_elm_lang$core$Basics_ops['++'],
										$class,
										A2(
											_elm_lang$core$Basics_ops['++'],
											row,
											A2(
												_elm_lang$core$Basics_ops['++'],
												' > ',
												A2(
													_elm_lang$core$Basics_ops['++'],
													any,
													A2(_elm_lang$core$Basics_ops['++'], ' + ', any))))),
									{
										ctor: '::',
										_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'margin-left', xPx),
										_1: {ctor: '[]'}
									}),
								_1: {
									ctor: '::',
									_0: A4(
										renderStyle,
										force,
										maybePseudo,
										A2(
											_elm_lang$core$Basics_ops['++'],
											$class,
											A2(
												_elm_lang$core$Basics_ops['++'],
												column,
												A2(
													_elm_lang$core$Basics_ops['++'],
													' > ',
													A2(
														_elm_lang$core$Basics_ops['++'],
														any,
														A2(_elm_lang$core$Basics_ops['++'], ' + ', any))))),
										{
											ctor: '::',
											_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'margin-top', yPx),
											_1: {ctor: '[]'}
										}),
									_1: {
										ctor: '::',
										_0: A4(
											renderStyle,
											force,
											maybePseudo,
											A2(
												_elm_lang$core$Basics_ops['++'],
												$class,
												A2(
													_elm_lang$core$Basics_ops['++'],
													page,
													A2(
														_elm_lang$core$Basics_ops['++'],
														' > ',
														A2(
															_elm_lang$core$Basics_ops['++'],
															any,
															A2(_elm_lang$core$Basics_ops['++'], ' + ', any))))),
											{
												ctor: '::',
												_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'margin-top', yPx),
												_1: {ctor: '[]'}
											}),
										_1: {
											ctor: '::',
											_0: A4(
												renderStyle,
												force,
												maybePseudo,
												A2(
													_elm_lang$core$Basics_ops['++'],
													$class,
													A2(
														_elm_lang$core$Basics_ops['++'],
														page,
														A2(_elm_lang$core$Basics_ops['++'], ' > ', left))),
												{
													ctor: '::',
													_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'margin-right', xPx),
													_1: {ctor: '[]'}
												}),
											_1: {
												ctor: '::',
												_0: A4(
													renderStyle,
													force,
													maybePseudo,
													A2(
														_elm_lang$core$Basics_ops['++'],
														$class,
														A2(
															_elm_lang$core$Basics_ops['++'],
															page,
															A2(_elm_lang$core$Basics_ops['++'], ' > ', right))),
													{
														ctor: '::',
														_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'margin-left', xPx),
														_1: {ctor: '[]'}
													}),
												_1: {
													ctor: '::',
													_0: A4(
														renderStyle,
														force,
														maybePseudo,
														A2(_elm_lang$core$Basics_ops['++'], $class, paragraph),
														{
															ctor: '::',
															_0: A2(
																_mdgriffith$stylish_elephants$Internal_Model$Property,
																'line-height',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	'calc(1em + ',
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		_elm_lang$core$Basics$toString(_p121),
																		'px)'))),
															_1: {ctor: '[]'}
														}),
													_1: {
														ctor: '::',
														_0: A4(
															renderStyle,
															force,
															maybePseudo,
															A2(_elm_lang$core$Basics_ops['++'], 'textarea', $class),
															{
																ctor: '::',
																_0: A2(
																	_mdgriffith$stylish_elephants$Internal_Model$Property,
																	'line-height',
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		'calc(1em + ',
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			_elm_lang$core$Basics$toString(_p121),
																			'px)'))),
																_1: {ctor: '[]'}
															}),
														_1: {
															ctor: '::',
															_0: A4(
																renderStyle,
																force,
																maybePseudo,
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	$class,
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		paragraph,
																		A2(_elm_lang$core$Basics_ops['++'], ' > ', left))),
																{
																	ctor: '::',
																	_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'margin-right', xPx),
																	_1: {ctor: '[]'}
																}),
															_1: {
																ctor: '::',
																_0: A4(
																	renderStyle,
																	force,
																	maybePseudo,
																	A2(
																		_elm_lang$core$Basics_ops['++'],
																		$class,
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			paragraph,
																			A2(_elm_lang$core$Basics_ops['++'], ' > ', right))),
																	{
																		ctor: '::',
																		_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'margin-left', xPx),
																		_1: {ctor: '[]'}
																	}),
																_1: {
																	ctor: '::',
																	_0: A4(
																		renderStyle,
																		force,
																		maybePseudo,
																		A2(
																			_elm_lang$core$Basics_ops['++'],
																			$class,
																			A2(_elm_lang$core$Basics_ops['++'], paragraph, '::after')),
																		{
																			ctor: '::',
																			_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'content', '\'\''),
																			_1: {
																				ctor: '::',
																				_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'display', 'block'),
																				_1: {
																					ctor: '::',
																					_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'height', '0'),
																					_1: {
																						ctor: '::',
																						_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'width', '0'),
																						_1: {
																							ctor: '::',
																							_0: A2(
																								_mdgriffith$stylish_elephants$Internal_Model$Property,
																								'margin-top',
																								A2(
																									_elm_lang$core$Basics_ops['++'],
																									_elm_lang$core$Basics$toString(-1 * ((_p121 / 2) | 0)),
																									'px')),
																							_1: {ctor: '[]'}
																						}
																					}
																				}
																			}
																		}),
																	_1: {
																		ctor: '::',
																		_0: A4(
																			renderStyle,
																			force,
																			maybePseudo,
																			A2(
																				_elm_lang$core$Basics_ops['++'],
																				$class,
																				A2(_elm_lang$core$Basics_ops['++'], paragraph, '::before')),
																			{
																				ctor: '::',
																				_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'content', '\'\''),
																				_1: {
																					ctor: '::',
																					_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'display', 'block'),
																					_1: {
																						ctor: '::',
																						_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'height', '0'),
																						_1: {
																							ctor: '::',
																							_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Property, 'width', '0'),
																							_1: {
																								ctor: '::',
																								_0: A2(
																									_mdgriffith$stylish_elephants$Internal_Model$Property,
																									'margin-bottom',
																									A2(
																										_elm_lang$core$Basics_ops['++'],
																										_elm_lang$core$Basics$toString(-1 * ((_p121 / 2) | 0)),
																										'px')),
																								_1: {ctor: '[]'}
																							}
																						}
																					}
																				}
																			}),
																		_1: {ctor: '[]'}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							});
					case 'PaddingStyle':
						var _p125 = _p117._0;
						var _p124 = _p117._1;
						var _p123 = _p117._3;
						var _p122 = _p117._2;
						var $class = A2(
							_elm_lang$core$Basics_ops['++'],
							'.pad-',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_elm_lang$core$Basics$toString(_p125),
								A2(
									_elm_lang$core$Basics_ops['++'],
									'-',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(_p124),
										A2(
											_elm_lang$core$Basics_ops['++'],
											'-',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(_p122),
												A2(
													_elm_lang$core$Basics_ops['++'],
													'-',
													_elm_lang$core$Basics$toString(_p123))))))));
						return A4(
							renderStyle,
							force,
							maybePseudo,
							$class,
							{
								ctor: '::',
								_0: A2(
									_mdgriffith$stylish_elephants$Internal_Model$Property,
									'padding',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_elm_lang$core$Basics$toString(_p125),
										A2(
											_elm_lang$core$Basics_ops['++'],
											'px ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(_p124),
												A2(
													_elm_lang$core$Basics_ops['++'],
													'px ',
													A2(
														_elm_lang$core$Basics_ops['++'],
														_elm_lang$core$Basics$toString(_p122),
														A2(
															_elm_lang$core$Basics_ops['++'],
															'px ',
															A2(
																_elm_lang$core$Basics_ops['++'],
																_elm_lang$core$Basics$toString(_p123),
																'px')))))))),
								_1: {ctor: '[]'}
							});
					case 'GridTemplateStyle':
						var _p130 = _p117._0;
						var toGridLengthHelper = F3(
							function (minimum, maximum, x) {
								toGridLengthHelper:
								while (true) {
									var _p126 = x;
									switch (_p126.ctor) {
										case 'Px':
											return A2(
												_elm_lang$core$Basics_ops['++'],
												_elm_lang$core$Basics$toString(_p126._0),
												'px');
										case 'Content':
											var _p127 = {ctor: '_Tuple2', _0: minimum, _1: maximum};
											if (_p127._0.ctor === 'Nothing') {
												if (_p127._1.ctor === 'Nothing') {
													return 'max-content';
												} else {
													return A2(
														_elm_lang$core$Basics_ops['++'],
														'minmax(max-content, ',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_mdgriffith$stylish_elephants$Internal_Model$intToString(_p127._1._0),
															'px)'));
												}
											} else {
												if (_p127._1.ctor === 'Nothing') {
													return A2(
														_elm_lang$core$Basics_ops['++'],
														'minmax(',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_mdgriffith$stylish_elephants$Internal_Model$intToString(_p127._0._0),
															A2(_elm_lang$core$Basics_ops['++'], 'px, ', 'max-content)')));
												} else {
													return A2(
														_elm_lang$core$Basics_ops['++'],
														'minmax(',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_mdgriffith$stylish_elephants$Internal_Model$intToString(_p127._0._0),
															A2(
																_elm_lang$core$Basics_ops['++'],
																'px, ',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	_mdgriffith$stylish_elephants$Internal_Model$intToString(_p127._1._0),
																	'px)'))));
												}
											}
										case 'Fill':
											var _p129 = _p126._0;
											var _p128 = {ctor: '_Tuple2', _0: minimum, _1: maximum};
											if (_p128._0.ctor === 'Nothing') {
												if (_p128._1.ctor === 'Nothing') {
													return A2(
														_elm_lang$core$Basics_ops['++'],
														_mdgriffith$stylish_elephants$Internal_Model$intToString(_p129),
														'fr');
												} else {
													return A2(
														_elm_lang$core$Basics_ops['++'],
														'minmax(max-content, ',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_mdgriffith$stylish_elephants$Internal_Model$intToString(_p128._1._0),
															'px)'));
												}
											} else {
												if (_p128._1.ctor === 'Nothing') {
													return A2(
														_elm_lang$core$Basics_ops['++'],
														'minmax(',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_mdgriffith$stylish_elephants$Internal_Model$intToString(_p128._0._0),
															A2(
																_elm_lang$core$Basics_ops['++'],
																'px, ',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	_mdgriffith$stylish_elephants$Internal_Model$intToString(_p129),
																	A2(_elm_lang$core$Basics_ops['++'], 'fr', 'fr)')))));
												} else {
													return A2(
														_elm_lang$core$Basics_ops['++'],
														'minmax(',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_mdgriffith$stylish_elephants$Internal_Model$intToString(_p128._0._0),
															A2(
																_elm_lang$core$Basics_ops['++'],
																'px, ',
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	_mdgriffith$stylish_elephants$Internal_Model$intToString(_p128._1._0),
																	'px)'))));
												}
											}
										case 'Min':
											var _v65 = _elm_lang$core$Maybe$Just(_p126._0),
												_v66 = maximum,
												_v67 = _p126._1;
											minimum = _v65;
											maximum = _v66;
											x = _v67;
											continue toGridLengthHelper;
										default:
											var _v68 = minimum,
												_v69 = _elm_lang$core$Maybe$Just(_p126._0),
												_v70 = _p126._1;
											minimum = _v68;
											maximum = _v69;
											x = _v70;
											continue toGridLengthHelper;
									}
								}
							});
						var toGridLength = function (x) {
							return A3(toGridLengthHelper, _elm_lang$core$Maybe$Nothing, _elm_lang$core$Maybe$Nothing, x);
						};
						var columns = function (x) {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'grid-template-columns: ',
								A2(_elm_lang$core$Basics_ops['++'], x, ';'));
						}(
							A2(
								_elm_lang$core$String$join,
								' ',
								A2(_elm_lang$core$List$map, toGridLength, _p130.columns)));
						var rows = function (x) {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'grid-template-rows: ',
								A2(_elm_lang$core$Basics_ops['++'], x, ';'));
						}(
							A2(
								_elm_lang$core$String$join,
								' ',
								A2(_elm_lang$core$List$map, toGridLength, _p130.rows)));
						var gapX = A2(
							_elm_lang$core$Basics_ops['++'],
							'grid-column-gap:',
							A2(
								_elm_lang$core$Basics_ops['++'],
								toGridLength(
									_elm_lang$core$Tuple$first(_p130.spacing)),
								';'));
						var gapY = A2(
							_elm_lang$core$Basics_ops['++'],
							'grid-row-gap:',
							A2(
								_elm_lang$core$Basics_ops['++'],
								toGridLength(
									_elm_lang$core$Tuple$second(_p130.spacing)),
								';'));
						var xSpacing = toGridLength(
							_elm_lang$core$Tuple$first(_p130.spacing));
						var ySpacing = toGridLength(
							_elm_lang$core$Tuple$second(_p130.spacing));
						var msColumns = function (x) {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'-ms-grid-columns: ',
								A2(_elm_lang$core$Basics_ops['++'], x, ';'));
						}(
							A2(
								_elm_lang$core$String$join,
								ySpacing,
								A2(_elm_lang$core$List$map, toGridLength, _p130.columns)));
						var msRows = function (x) {
							return A2(
								_elm_lang$core$Basics_ops['++'],
								'-ms-grid-rows: ',
								A2(_elm_lang$core$Basics_ops['++'], x, ';'));
						}(
							A2(
								_elm_lang$core$String$join,
								ySpacing,
								A2(_elm_lang$core$List$map, toGridLength, _p130.columns)));
						var $class = A2(
							_elm_lang$core$Basics_ops['++'],
							'.grid-rows-',
							A2(
								_elm_lang$core$Basics_ops['++'],
								A2(
									_elm_lang$core$String$join,
									'-',
									A2(_elm_lang$core$List$map, _mdgriffith$stylish_elephants$Internal_Model$lengthClassName, _p130.rows)),
								A2(
									_elm_lang$core$Basics_ops['++'],
									'-cols-',
									A2(
										_elm_lang$core$Basics_ops['++'],
										A2(
											_elm_lang$core$String$join,
											'-',
											A2(_elm_lang$core$List$map, _mdgriffith$stylish_elephants$Internal_Model$lengthClassName, _p130.columns)),
										A2(
											_elm_lang$core$Basics_ops['++'],
											'-space-x-',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_mdgriffith$stylish_elephants$Internal_Model$lengthClassName(
													_elm_lang$core$Tuple$first(_p130.spacing)),
												A2(
													_elm_lang$core$Basics_ops['++'],
													'-space-y-',
													_mdgriffith$stylish_elephants$Internal_Model$lengthClassName(
														_elm_lang$core$Tuple$second(_p130.spacing)))))))));
						var base = A2(
							_elm_lang$core$Basics_ops['++'],
							$class,
							A2(
								_elm_lang$core$Basics_ops['++'],
								'{',
								A2(
									_elm_lang$core$Basics_ops['++'],
									msColumns,
									A2(_elm_lang$core$Basics_ops['++'], msRows, '}'))));
						var modernGrid = A2(
							_elm_lang$core$Basics_ops['++'],
							$class,
							A2(
								_elm_lang$core$Basics_ops['++'],
								'{',
								A2(
									_elm_lang$core$Basics_ops['++'],
									columns,
									A2(
										_elm_lang$core$Basics_ops['++'],
										rows,
										A2(
											_elm_lang$core$Basics_ops['++'],
											gapX,
											A2(_elm_lang$core$Basics_ops['++'], gapY, '}'))))));
						var supports = A2(
							_elm_lang$core$Basics_ops['++'],
							'@supports (display:grid) {',
							A2(_elm_lang$core$Basics_ops['++'], modernGrid, '}'));
						return A2(_elm_lang$core$Basics_ops['++'], base, supports);
					case 'GridPosition':
						var _p131 = _p117._0;
						var modernPosition = A2(
							_elm_lang$core$String$join,
							' ',
							{
								ctor: '::',
								_0: A2(
									_elm_lang$core$Basics_ops['++'],
									'grid-row: ',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.row),
										A2(
											_elm_lang$core$Basics_ops['++'],
											' / ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.row + _p131.height),
												';')))),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$core$Basics_ops['++'],
										'grid-column: ',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.col),
											A2(
												_elm_lang$core$Basics_ops['++'],
												' / ',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.col + _p131.width),
													';')))),
									_1: {ctor: '[]'}
								}
							});
						var msPosition = A2(
							_elm_lang$core$String$join,
							' ',
							{
								ctor: '::',
								_0: A2(
									_elm_lang$core$Basics_ops['++'],
									'-ms-grid-row: ',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.row),
										';')),
								_1: {
									ctor: '::',
									_0: A2(
										_elm_lang$core$Basics_ops['++'],
										'-ms-grid-row-span: ',
										A2(
											_elm_lang$core$Basics_ops['++'],
											_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.height),
											';')),
									_1: {
										ctor: '::',
										_0: A2(
											_elm_lang$core$Basics_ops['++'],
											'-ms-grid-column: ',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.col),
												';')),
										_1: {
											ctor: '::',
											_0: A2(
												_elm_lang$core$Basics_ops['++'],
												'-ms-grid-column-span: ',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.width),
													';')),
											_1: {ctor: '[]'}
										}
									}
								}
							});
						var $class = A2(
							_elm_lang$core$Basics_ops['++'],
							'.grid-pos-',
							A2(
								_elm_lang$core$Basics_ops['++'],
								_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.row),
								A2(
									_elm_lang$core$Basics_ops['++'],
									'-',
									A2(
										_elm_lang$core$Basics_ops['++'],
										_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.col),
										A2(
											_elm_lang$core$Basics_ops['++'],
											'-',
											A2(
												_elm_lang$core$Basics_ops['++'],
												_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.width),
												A2(
													_elm_lang$core$Basics_ops['++'],
													'-',
													_mdgriffith$stylish_elephants$Internal_Model$intToString(_p131.height))))))));
						var base = A2(
							_elm_lang$core$Basics_ops['++'],
							$class,
							A2(
								_elm_lang$core$Basics_ops['++'],
								'{',
								A2(_elm_lang$core$Basics_ops['++'], msPosition, '}')));
						var modernGrid = A2(
							_elm_lang$core$Basics_ops['++'],
							$class,
							A2(
								_elm_lang$core$Basics_ops['++'],
								'{',
								A2(_elm_lang$core$Basics_ops['++'], modernPosition, '}')));
						var supports = A2(
							_elm_lang$core$Basics_ops['++'],
							'@supports (display:grid) {',
							A2(_elm_lang$core$Basics_ops['++'], modernGrid, '}'));
						return A2(_elm_lang$core$Basics_ops['++'], base, supports);
					case 'PseudoSelector':
						var renderPseudoRule = function (style) {
							var _p132 = _p117._0;
							switch (_p132.ctor) {
								case 'Focus':
									return A3(
										renderStyleRule,
										style,
										_elm_lang$core$Maybe$Just(_mdgriffith$stylish_elephants$Internal_Model$Focus),
										false);
								case 'Active':
									return A3(
										renderStyleRule,
										style,
										_elm_lang$core$Maybe$Just(_mdgriffith$stylish_elephants$Internal_Model$Active),
										false);
								default:
									var _p133 = options.hover;
									switch (_p133.ctor) {
										case 'NoHover':
											return '';
										case 'AllowHover':
											return A3(
												renderStyleRule,
												style,
												_elm_lang$core$Maybe$Just(_mdgriffith$stylish_elephants$Internal_Model$Hover),
												false);
										default:
											return A3(renderStyleRule, style, _elm_lang$core$Maybe$Nothing, true);
									}
							}
						};
						return A2(
							_elm_lang$core$String$join,
							' ',
							A2(_elm_lang$core$List$map, renderPseudoRule, _p117._1));
					default:
						return '';
				}
			});
		var combine = F2(
			function (style, rendered) {
				return _elm_lang$core$Native_Utils.update(
					rendered,
					{
						rules: A2(
							_elm_lang$core$Basics_ops['++'],
							rendered.rules,
							A3(renderStyleRule, style, _elm_lang$core$Maybe$Nothing, false)),
						topLevel: function () {
							var _p134 = renderTopLevels(style);
							if (_p134.ctor === 'Nothing') {
								return rendered.topLevel;
							} else {
								return A2(_elm_lang$core$Basics_ops['++'], rendered.topLevel, _p134._0);
							}
						}()
					});
			});
		return function (_p135) {
			var _p136 = _p135;
			return A2(_elm_lang$core$Basics_ops['++'], _p136.topLevel, _p136.rules);
		}(
			A3(
				_elm_lang$core$List$foldl,
				combine,
				{rules: '', topLevel: ''},
				stylesheet));
	});
var _mdgriffith$stylish_elephants$Internal_Model$toHtml = F2(
	function (options, el) {
		var _p137 = el;
		switch (_p137.ctor) {
			case 'Unstyled':
				return _p137._0(_mdgriffith$stylish_elephants$Internal_Model$asEl);
			case 'Styled':
				var styleSheet = A2(
					_mdgriffith$stylish_elephants$Internal_Model$toStyleSheetString,
					options,
					_elm_lang$core$Tuple$second(
						A3(
							_elm_lang$core$List$foldr,
							_mdgriffith$stylish_elephants$Internal_Model$reduceStyles,
							{
								ctor: '_Tuple2',
								_0: _elm_lang$core$Set$empty,
								_1: {
									ctor: '::',
									_0: _mdgriffith$stylish_elephants$Internal_Model$renderFocusStyle(options.focus),
									_1: {ctor: '[]'}
								}
							},
							_p137._0.styles)));
				return A2(
					_p137._0.html,
					_elm_lang$core$Maybe$Just(styleSheet),
					_mdgriffith$stylish_elephants$Internal_Model$asEl);
			case 'Text':
				return _mdgriffith$stylish_elephants$Internal_Model$textElement(_p137._0);
			default:
				return _mdgriffith$stylish_elephants$Internal_Model$textElement('');
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$toStyleSheet = F2(
	function (options, styleSheet) {
		return A3(
			_elm_lang$virtual_dom$VirtualDom$node,
			'style',
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _elm_lang$html$Html$text(
					A2(_mdgriffith$stylish_elephants$Internal_Model$toStyleSheetString, options, styleSheet)),
				_1: {ctor: '[]'}
			});
	});
var _mdgriffith$stylish_elephants$Internal_Model$Scale = F3(
	function (a, b, c) {
		return {ctor: 'Scale', _0: a, _1: b, _2: c};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Rotate = F4(
	function (a, b, c, d) {
		return {ctor: 'Rotate', _0: a, _1: b, _2: c, _3: d};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Move = F3(
	function (a, b, c) {
		return {ctor: 'Move', _0: a, _1: b, _2: c};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Filter = function (a) {
	return {ctor: 'Filter', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$BoxShadow = function (a) {
	return {ctor: 'BoxShadow', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$TextShadow = function (a) {
	return {ctor: 'TextShadow', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Nearby = F2(
	function (a, b) {
		return {ctor: 'Nearby', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Height = function (a) {
	return {ctor: 'Height', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Width = function (a) {
	return {ctor: 'Width', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$AlignX = function (a) {
	return {ctor: 'AlignX', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$AlignY = function (a) {
	return {ctor: 'AlignY', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$StyleClass = function (a) {
	return {ctor: 'StyleClass', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$getSpacingAttribute = F2(
	function (attrs, $default) {
		return function (_p138) {
			var _p139 = _p138;
			return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
				A2(_mdgriffith$stylish_elephants$Internal_Model$SpacingStyle, _p139._0, _p139._1));
		}(
			A2(
				_elm_lang$core$Maybe$withDefault,
				$default,
				A3(
					_elm_lang$core$List$foldr,
					F2(
						function (x, acc) {
							var _p140 = acc;
							if (_p140.ctor === 'Just') {
								return _elm_lang$core$Maybe$Just(_p140._0);
							} else {
								var _p141 = x;
								if ((_p141.ctor === 'StyleClass') && (_p141._0.ctor === 'SpacingStyle')) {
									return _elm_lang$core$Maybe$Just(
										{ctor: '_Tuple2', _0: _p141._0._0, _1: _p141._0._1});
								} else {
									return _elm_lang$core$Maybe$Nothing;
								}
							}
						}),
					_elm_lang$core$Maybe$Nothing,
					attrs)));
	});
var _mdgriffith$stylish_elephants$Internal_Model$rootStyle = function () {
	var families = {
		ctor: '::',
		_0: _mdgriffith$stylish_elephants$Internal_Model$Typeface('Open Sans'),
		_1: {
			ctor: '::',
			_0: _mdgriffith$stylish_elephants$Internal_Model$Typeface('Helvetica'),
			_1: {
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Internal_Model$Typeface('Verdana'),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Internal_Model$SansSerif,
					_1: {ctor: '[]'}
				}
			}
		}
	};
	return {
		ctor: '::',
		_0: _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
			A3(
				_mdgriffith$stylish_elephants$Internal_Model$Colored,
				A2(
					_elm_lang$core$Basics_ops['++'],
					'bg-color-',
					_mdgriffith$stylish_elephants$Internal_Model$formatColorClass(
						A4(_elm_lang$core$Color$rgba, 255, 255, 255, 0))),
				'background-color',
				A4(_elm_lang$core$Color$rgba, 255, 255, 255, 0))),
		_1: {
			ctor: '::',
			_0: _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
				A3(
					_mdgriffith$stylish_elephants$Internal_Model$Colored,
					A2(
						_elm_lang$core$Basics_ops['++'],
						'font-color-',
						_mdgriffith$stylish_elephants$Internal_Model$formatColorClass(_elm_lang$core$Color$darkCharcoal)),
					'color',
					_elm_lang$core$Color$darkCharcoal)),
			_1: {
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
					A3(_mdgriffith$stylish_elephants$Internal_Model$Single, 'font-size-20', 'font-size', '20px')),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
						A2(
							_mdgriffith$stylish_elephants$Internal_Model$FontFamily,
							A3(_elm_lang$core$List$foldl, _mdgriffith$stylish_elephants$Internal_Model$renderFontClassName, 'font-', families),
							families)),
					_1: {ctor: '[]'}
				}
			}
		}
	};
}();
var _mdgriffith$stylish_elephants$Internal_Model$Class = F2(
	function (a, b) {
		return {ctor: 'Class', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$class = function (x) {
	return A2(_mdgriffith$stylish_elephants$Internal_Model$Class, x, x);
};
var _mdgriffith$stylish_elephants$Internal_Model$Describe = function (a) {
	return {ctor: 'Describe', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Attr = function (a) {
	return {ctor: 'Attr', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$htmlClass = function (cls) {
	return _mdgriffith$stylish_elephants$Internal_Model$Attr(
		A2(
			_elm_lang$virtual_dom$VirtualDom$property,
			'className',
			_elm_lang$core$Json_Encode$string(cls)));
};
var _mdgriffith$stylish_elephants$Internal_Model$contextClasses = function (context) {
	var _p142 = context;
	switch (_p142.ctor) {
		case 'AsRow':
			return _mdgriffith$stylish_elephants$Internal_Model$htmlClass(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_mdgriffith$stylish_elephants$Internal_Style$classes.any,
					A2(_elm_lang$core$Basics_ops['++'], ' ', _mdgriffith$stylish_elephants$Internal_Style$classes.row)));
		case 'AsColumn':
			return _mdgriffith$stylish_elephants$Internal_Model$htmlClass(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_mdgriffith$stylish_elephants$Internal_Style$classes.any,
					A2(_elm_lang$core$Basics_ops['++'], ' ', _mdgriffith$stylish_elephants$Internal_Style$classes.column)));
		case 'AsEl':
			return _mdgriffith$stylish_elephants$Internal_Model$htmlClass(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_mdgriffith$stylish_elephants$Internal_Style$classes.any,
					A2(_elm_lang$core$Basics_ops['++'], ' ', _mdgriffith$stylish_elephants$Internal_Style$classes.single)));
		case 'AsGrid':
			return _mdgriffith$stylish_elephants$Internal_Model$htmlClass(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_mdgriffith$stylish_elephants$Internal_Style$classes.any,
					A2(_elm_lang$core$Basics_ops['++'], ' ', _mdgriffith$stylish_elephants$Internal_Style$classes.grid)));
		case 'AsParagraph':
			return _mdgriffith$stylish_elephants$Internal_Model$htmlClass(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_mdgriffith$stylish_elephants$Internal_Style$classes.any,
					A2(_elm_lang$core$Basics_ops['++'], ' ', _mdgriffith$stylish_elephants$Internal_Style$classes.paragraph)));
		default:
			return _mdgriffith$stylish_elephants$Internal_Model$htmlClass(
				A2(
					_elm_lang$core$Basics_ops['++'],
					_mdgriffith$stylish_elephants$Internal_Style$classes.any,
					A2(_elm_lang$core$Basics_ops['++'], ' ', _mdgriffith$stylish_elephants$Internal_Style$classes.page)));
	}
};
var _mdgriffith$stylish_elephants$Internal_Model$NoAttribute = {ctor: 'NoAttribute'};
var _mdgriffith$stylish_elephants$Internal_Model$mapAttr = F2(
	function (fn, attr) {
		var _p143 = attr;
		switch (_p143.ctor) {
			case 'NoAttribute':
				return _mdgriffith$stylish_elephants$Internal_Model$NoAttribute;
			case 'Describe':
				return _mdgriffith$stylish_elephants$Internal_Model$Describe(_p143._0);
			case 'AlignX':
				return _mdgriffith$stylish_elephants$Internal_Model$AlignX(_p143._0);
			case 'AlignY':
				return _mdgriffith$stylish_elephants$Internal_Model$AlignY(_p143._0);
			case 'Width':
				return _mdgriffith$stylish_elephants$Internal_Model$Width(_p143._0);
			case 'Height':
				return _mdgriffith$stylish_elephants$Internal_Model$Height(_p143._0);
			case 'Class':
				return A2(_mdgriffith$stylish_elephants$Internal_Model$Class, _p143._0, _p143._1);
			case 'StyleClass':
				return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(_p143._0);
			case 'Nearby':
				return A2(
					_mdgriffith$stylish_elephants$Internal_Model$Nearby,
					_p143._0,
					A2(_mdgriffith$stylish_elephants$Internal_Model$map, fn, _p143._1));
			case 'Attr':
				return _mdgriffith$stylish_elephants$Internal_Model$Attr(
					A2(_elm_lang$html$Html_Attributes$map, fn, _p143._0));
			case 'TextShadow':
				return _mdgriffith$stylish_elephants$Internal_Model$TextShadow(_p143._0);
			case 'BoxShadow':
				return _mdgriffith$stylish_elephants$Internal_Model$BoxShadow(_p143._0);
			default:
				return _mdgriffith$stylish_elephants$Internal_Model$Filter(_p143._0);
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$mapAttrFromStyle = F2(
	function (fn, attr) {
		var _p144 = attr;
		switch (_p144.ctor) {
			case 'NoAttribute':
				return _mdgriffith$stylish_elephants$Internal_Model$NoAttribute;
			case 'Describe':
				return _mdgriffith$stylish_elephants$Internal_Model$Describe(_p144._0);
			case 'AlignX':
				return _mdgriffith$stylish_elephants$Internal_Model$AlignX(_p144._0);
			case 'AlignY':
				return _mdgriffith$stylish_elephants$Internal_Model$AlignY(_p144._0);
			case 'Width':
				return _mdgriffith$stylish_elephants$Internal_Model$Width(_p144._0);
			case 'Height':
				return _mdgriffith$stylish_elephants$Internal_Model$Height(_p144._0);
			case 'Class':
				return A2(_mdgriffith$stylish_elephants$Internal_Model$Class, _p144._0, _p144._1);
			case 'StyleClass':
				return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(_p144._0);
			case 'Nearby':
				return A2(
					_mdgriffith$stylish_elephants$Internal_Model$Nearby,
					_p144._0,
					A2(_mdgriffith$stylish_elephants$Internal_Model$map, fn, _p144._1));
			case 'Attr':
				return _mdgriffith$stylish_elephants$Internal_Model$Attr(
					A2(_elm_lang$html$Html_Attributes$map, fn, _p144._0));
			case 'TextShadow':
				return _mdgriffith$stylish_elephants$Internal_Model$TextShadow(_p144._0);
			case 'BoxShadow':
				return _mdgriffith$stylish_elephants$Internal_Model$BoxShadow(_p144._0);
			default:
				return _mdgriffith$stylish_elephants$Internal_Model$Filter(_p144._0);
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$removeNever = function (style) {
	return A2(_mdgriffith$stylish_elephants$Internal_Model$mapAttrFromStyle, _elm_lang$core$Basics$never, style);
};
var _mdgriffith$stylish_elephants$Internal_Model$unwrapDecorations = function (attrs) {
	var addShadow = function (styles) {
		var _p145 = styles.shadows;
		if (_p145.ctor === 'Nothing') {
			return styles.styles;
		} else {
			return {
				ctor: '::',
				_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Shadows, _p145._0._0, _p145._0._1),
				_1: styles.styles
			};
		}
	};
	var joinShadows = F2(
		function (x, styles) {
			var _p146 = x;
			if (_p146.ctor === 'Shadows') {
				var _p149 = _p146._1;
				var _p148 = _p146._0;
				var _p147 = styles.shadows;
				if (_p147.ctor === 'Nothing') {
					return _elm_lang$core$Native_Utils.update(
						styles,
						{
							shadows: _elm_lang$core$Maybe$Just(
								{ctor: '_Tuple2', _0: _p148, _1: _p149})
						});
				} else {
					return _elm_lang$core$Native_Utils.update(
						styles,
						{
							shadows: _elm_lang$core$Maybe$Just(
								{
									ctor: '_Tuple2',
									_0: A2(_elm_lang$core$Basics_ops['++'], _p147._0._0, _p148),
									_1: A2(
										_elm_lang$core$Basics_ops['++'],
										_p147._0._1,
										A2(_elm_lang$core$Basics_ops['++'], ', ', _p149))
								})
						});
				}
			} else {
				return _elm_lang$core$Native_Utils.update(
					styles,
					{
						styles: {ctor: '::', _0: x, _1: styles.styles}
					});
			}
		});
	return addShadow(
		A3(
			_elm_lang$core$List$foldr,
			joinShadows,
			{
				shadows: _elm_lang$core$Maybe$Nothing,
				styles: {ctor: '[]'}
			},
			A2(
				_elm_lang$core$List$filterMap,
				function (_p150) {
					return _mdgriffith$stylish_elephants$Internal_Model$onlyStyles(
						_mdgriffith$stylish_elephants$Internal_Model$removeNever(_p150));
				},
				attrs)));
};
var _mdgriffith$stylish_elephants$Internal_Model$Button = {ctor: 'Button'};
var _mdgriffith$stylish_elephants$Internal_Model$LiveAssertive = {ctor: 'LiveAssertive'};
var _mdgriffith$stylish_elephants$Internal_Model$LivePolite = {ctor: 'LivePolite'};
var _mdgriffith$stylish_elephants$Internal_Model$Label = function (a) {
	return {ctor: 'Label', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Heading = function (a) {
	return {ctor: 'Heading', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Complementary = {ctor: 'Complementary'};
var _mdgriffith$stylish_elephants$Internal_Model$ContentInfo = {ctor: 'ContentInfo'};
var _mdgriffith$stylish_elephants$Internal_Model$Navigation = {ctor: 'Navigation'};
var _mdgriffith$stylish_elephants$Internal_Model$Main = {ctor: 'Main'};
var _mdgriffith$stylish_elephants$Internal_Model$DropShadow = function (a) {
	return {ctor: 'DropShadow', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Sepia = function (a) {
	return {ctor: 'Sepia', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Saturate = function (a) {
	return {ctor: 'Saturate', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$OpacityFilter = function (a) {
	return {ctor: 'OpacityFilter', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Invert = function (a) {
	return {ctor: 'Invert', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$HueRotate = function (a) {
	return {ctor: 'HueRotate', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Grayscale = function (a) {
	return {ctor: 'Grayscale', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Contrast = function (a) {
	return {ctor: 'Contrast', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Brightness = function (a) {
	return {ctor: 'Brightness', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Blur = function (a) {
	return {ctor: 'Blur', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$FilterUrl = function (a) {
	return {ctor: 'FilterUrl', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Max = F2(
	function (a, b) {
		return {ctor: 'Max', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Min = F2(
	function (a, b) {
		return {ctor: 'Min', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$Fill = function (a) {
	return {ctor: 'Fill', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Content = {ctor: 'Content'};
var _mdgriffith$stylish_elephants$Internal_Model$Px = function (a) {
	return {ctor: 'Px', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$AllAxis = {ctor: 'AllAxis'};
var _mdgriffith$stylish_elephants$Internal_Model$YAxis = {ctor: 'YAxis'};
var _mdgriffith$stylish_elephants$Internal_Model$XAxis = {ctor: 'XAxis'};
var _mdgriffith$stylish_elephants$Internal_Model$Behind = {ctor: 'Behind'};
var _mdgriffith$stylish_elephants$Internal_Model$InFront = {ctor: 'InFront'};
var _mdgriffith$stylish_elephants$Internal_Model$OnLeft = {ctor: 'OnLeft'};
var _mdgriffith$stylish_elephants$Internal_Model$OnRight = {ctor: 'OnRight'};
var _mdgriffith$stylish_elephants$Internal_Model$Below = {ctor: 'Below'};
var _mdgriffith$stylish_elephants$Internal_Model$Above = {ctor: 'Above'};
var _mdgriffith$stylish_elephants$Internal_Model$Embedded = F2(
	function (a, b) {
		return {ctor: 'Embedded', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Internal_Model$NodeName = function (a) {
	return {ctor: 'NodeName', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$addNodeName = F2(
	function (newNode, old) {
		var _p151 = old;
		switch (_p151.ctor) {
			case 'Generic':
				return _mdgriffith$stylish_elephants$Internal_Model$NodeName(newNode);
			case 'NodeName':
				return A2(_mdgriffith$stylish_elephants$Internal_Model$Embedded, _p151._0, newNode);
			default:
				return A2(_mdgriffith$stylish_elephants$Internal_Model$Embedded, _p151._0, _p151._1);
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$gatherAttributes = F2(
	function (attr, gathered) {
		var styleName = function (name) {
			return A2(_elm_lang$core$Basics_ops['++'], '.', name);
		};
		var formatStyleClass = function (style) {
			var _p152 = style;
			switch (_p152.ctor) {
				case 'Transform':
					return _mdgriffith$stylish_elephants$Internal_Model$Transform(_p152._0);
				case 'Shadows':
					return A2(_mdgriffith$stylish_elephants$Internal_Model$Shadows, _p152._0, _p152._1);
				case 'PseudoSelector':
					return A2(
						_mdgriffith$stylish_elephants$Internal_Model$PseudoSelector,
						_p152._0,
						A2(_elm_lang$core$List$map, formatStyleClass, _p152._1));
				case 'Style':
					return A2(
						_mdgriffith$stylish_elephants$Internal_Model$Style,
						styleName(_p152._0),
						_p152._1);
				case 'Single':
					return A3(
						_mdgriffith$stylish_elephants$Internal_Model$Single,
						styleName(_p152._0),
						_p152._1,
						_p152._2);
				case 'Colored':
					return A3(
						_mdgriffith$stylish_elephants$Internal_Model$Colored,
						styleName(_p152._0),
						_p152._1,
						_p152._2);
				case 'SpacingStyle':
					return A2(_mdgriffith$stylish_elephants$Internal_Model$SpacingStyle, _p152._0, _p152._1);
				case 'PaddingStyle':
					return A4(_mdgriffith$stylish_elephants$Internal_Model$PaddingStyle, _p152._0, _p152._1, _p152._2, _p152._3);
				case 'GridTemplateStyle':
					return _mdgriffith$stylish_elephants$Internal_Model$GridTemplateStyle(_p152._0);
				case 'GridPosition':
					return _mdgriffith$stylish_elephants$Internal_Model$GridPosition(_p152._0);
				case 'FontFamily':
					return A2(_mdgriffith$stylish_elephants$Internal_Model$FontFamily, _p152._0, _p152._1);
				case 'FontSize':
					return _mdgriffith$stylish_elephants$Internal_Model$FontSize(_p152._0);
				default:
					return A2(_mdgriffith$stylish_elephants$Internal_Model$Transparency, _p152._0, _p152._1);
			}
		};
		var className = function (name) {
			return A2(
				_elm_lang$virtual_dom$VirtualDom$property,
				'className',
				_elm_lang$core$Json_Encode$string(name));
		};
		var _p153 = attr;
		switch (_p153.ctor) {
			case 'NoAttribute':
				return gathered;
			case 'Class':
				var _p154 = _p153._0;
				return A2(_elm_lang$core$Set$member, _p154, gathered.has) ? gathered : _elm_lang$core$Native_Utils.update(
					gathered,
					{
						attributes: {
							ctor: '::',
							_0: className(_p153._1),
							_1: gathered.attributes
						},
						has: A2(_elm_lang$core$Set$insert, _p154, gathered.has)
					});
			case 'Attr':
				return _elm_lang$core$Native_Utils.update(
					gathered,
					{
						attributes: {ctor: '::', _0: _p153._0, _1: gathered.attributes}
					});
			case 'StyleClass':
				var _p160 = _p153._0;
				var addNormalStyle = F2(
					function (styleProp, gatheredProps) {
						var key = _mdgriffith$stylish_elephants$Internal_Model$styleKey(styleProp);
						return A2(_elm_lang$core$Set$member, key, gatheredProps.has) ? gatheredProps : _elm_lang$core$Native_Utils.update(
							gatheredProps,
							{
								attributes: function () {
									var _p155 = styleProp;
									if (_p155.ctor === 'PseudoSelector') {
										return {
											ctor: '::',
											_0: A2(
												_elm_lang$virtual_dom$VirtualDom$property,
												'className',
												_elm_lang$core$Json_Encode$string('transition')),
											_1: {
												ctor: '::',
												_0: className(
													_mdgriffith$stylish_elephants$Internal_Model$getStyleName(styleProp)),
												_1: gatheredProps.attributes
											}
										};
									} else {
										return {
											ctor: '::',
											_0: className(
												_mdgriffith$stylish_elephants$Internal_Model$getStyleName(styleProp)),
											_1: gatheredProps.attributes
										};
									}
								}(),
								styles: {
									ctor: '::',
									_0: formatStyleClass(styleProp),
									_1: gatheredProps.styles
								},
								has: A2(_elm_lang$core$Set$insert, key, gatheredProps.has)
							});
					});
				var _p156 = _p160;
				switch (_p156.ctor) {
					case 'Transform':
						return A3(_mdgriffith$stylish_elephants$Internal_Model$stackOn, _elm_lang$core$Maybe$Nothing, _p156._0, gathered);
					case 'PseudoSelector':
						var _p159 = _p156._0;
						var forTransforms = function (attr) {
							var _p157 = attr;
							if (_p157.ctor === 'Transform') {
								return _elm_lang$core$Maybe$Just(_p157._0);
							} else {
								return _elm_lang$core$Maybe$Nothing;
							}
						};
						var _p158 = A2(
							_elm_lang$core$List$partition,
							function (x) {
								return !_elm_lang$core$Native_Utils.eq(
									forTransforms(x),
									_elm_lang$core$Maybe$Nothing);
							},
							_p156._1);
						var transformationProps = _p158._0;
						var otherProps = _p158._1;
						var withTransforms = A3(
							_elm_lang$core$List$foldr,
							_mdgriffith$stylish_elephants$Internal_Model$stackOn(
								_elm_lang$core$Maybe$Just(_p159)),
							gathered,
							A2(_elm_lang$core$List$filterMap, forTransforms, transformationProps));
						return A2(
							addNormalStyle,
							A2(_mdgriffith$stylish_elephants$Internal_Model$PseudoSelector, _p159, otherProps),
							withTransforms);
					default:
						return A2(addNormalStyle, _p160, gathered);
				}
			case 'Width':
				var _p168 = _p153._0;
				if (_elm_lang$core$Native_Utils.eq(gathered.width, _elm_lang$core$Maybe$Nothing)) {
					var widthHelper = F2(
						function (w, gath) {
							widthHelper:
							while (true) {
								var _p161 = w;
								switch (_p161.ctor) {
									case 'Px':
										var _p162 = _p161._0;
										return _elm_lang$core$Native_Utils.update(
											gath,
											{
												attributes: {
													ctor: '::',
													_0: className(
														A2(
															_elm_lang$core$Basics_ops['++'],
															'width-exact width-px-',
															_elm_lang$core$Basics$toString(_p162))),
													_1: gath.attributes
												},
												styles: {
													ctor: '::',
													_0: A3(
														_mdgriffith$stylish_elephants$Internal_Model$Single,
														styleName(
															A2(
																_elm_lang$core$Basics_ops['++'],
																'width-px-',
																_elm_lang$core$Basics$toString(_p162))),
														'width',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_elm_lang$core$Basics$toString(_p162),
															'px')),
													_1: gath.styles
												}
											});
									case 'Content':
										return _elm_lang$core$Native_Utils.update(
											gath,
											{
												attributes: {
													ctor: '::',
													_0: className(
														function (_) {
															return _.widthContent;
														}(_mdgriffith$stylish_elephants$Internal_Style$classes)),
													_1: gath.attributes
												}
											});
									case 'Fill':
										var _p163 = _p161._0;
										return _elm_lang$core$Native_Utils.eq(_p163, 1) ? _elm_lang$core$Native_Utils.update(
											gath,
											{
												attributes: {
													ctor: '::',
													_0: className(
														function (_) {
															return _.widthFill;
														}(_mdgriffith$stylish_elephants$Internal_Style$classes)),
													_1: gath.attributes
												}
											}) : _elm_lang$core$Native_Utils.update(
											gath,
											{
												width: _elm_lang$core$Maybe$Just(_p168),
												attributes: {
													ctor: '::',
													_0: className(
														A2(
															_elm_lang$core$Basics_ops['++'],
															'width-fill-portion width-fill-',
															_elm_lang$core$Basics$toString(_p163))),
													_1: gath.attributes
												},
												styles: {
													ctor: '::',
													_0: A3(
														_mdgriffith$stylish_elephants$Internal_Model$Single,
														A2(
															_elm_lang$core$Basics_ops['++'],
															'.se.row > ',
															styleName(
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	'width-fill-',
																	_elm_lang$core$Basics$toString(_p163)))),
														'flex-grow',
														_elm_lang$core$Basics$toString(_p163 * 100000)),
													_1: gath.styles
												}
											});
									case 'Min':
										var _p165 = _p161._0;
										var _p164 = {
											ctor: '_Tuple2',
											_0: A2(
												_elm_lang$core$Basics_ops['++'],
												'min-width-',
												_mdgriffith$stylish_elephants$Internal_Model$intToString(_p165)),
											_1: A3(
												_mdgriffith$stylish_elephants$Internal_Model$Single,
												A2(
													_elm_lang$core$Basics_ops['++'],
													'.min-width-',
													_mdgriffith$stylish_elephants$Internal_Model$intToString(_p165)),
												'min-width',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_mdgriffith$stylish_elephants$Internal_Model$intToString(_p165),
													'px'))
										};
										var cls = _p164._0;
										var style = _p164._1;
										var newGathered = _elm_lang$core$Native_Utils.update(
											gath,
											{
												attributes: {
													ctor: '::',
													_0: className(cls),
													_1: gath.attributes
												},
												styles: {ctor: '::', _0: style, _1: gath.styles}
											});
										var _v92 = _p161._1,
											_v93 = newGathered;
										w = _v92;
										gath = _v93;
										continue widthHelper;
									default:
										var _p167 = _p161._0;
										var _p166 = {
											ctor: '_Tuple2',
											_0: A2(
												_elm_lang$core$Basics_ops['++'],
												'max-width-',
												_mdgriffith$stylish_elephants$Internal_Model$intToString(_p167)),
											_1: A3(
												_mdgriffith$stylish_elephants$Internal_Model$Single,
												A2(
													_elm_lang$core$Basics_ops['++'],
													'.max-width-',
													_mdgriffith$stylish_elephants$Internal_Model$intToString(_p167)),
												'max-width',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_mdgriffith$stylish_elephants$Internal_Model$intToString(_p167),
													'px'))
										};
										var cls = _p166._0;
										var style = _p166._1;
										var newGathered = _elm_lang$core$Native_Utils.update(
											gath,
											{
												attributes: {
													ctor: '::',
													_0: className(cls),
													_1: gath.attributes
												},
												styles: {ctor: '::', _0: style, _1: gath.styles}
											});
										var _v94 = _p161._1,
											_v95 = newGathered;
										w = _v94;
										gath = _v95;
										continue widthHelper;
								}
							}
						});
					return A2(
						widthHelper,
						_p168,
						_elm_lang$core$Native_Utils.update(
							gathered,
							{
								width: _elm_lang$core$Maybe$Just(_p168)
							}));
				} else {
					return gathered;
				}
			case 'Height':
				var _p176 = _p153._0;
				if (_elm_lang$core$Native_Utils.eq(gathered.height, _elm_lang$core$Maybe$Nothing)) {
					var heightHelper = F2(
						function (h, gath) {
							heightHelper:
							while (true) {
								var _p169 = h;
								switch (_p169.ctor) {
									case 'Px':
										var _p170 = _p169._0;
										return _elm_lang$core$Native_Utils.update(
											gath,
											{
												attributes: {
													ctor: '::',
													_0: className(
														A2(
															_elm_lang$core$Basics_ops['++'],
															'height-px-',
															_elm_lang$core$Basics$toString(_p170))),
													_1: gath.attributes
												},
												styles: {
													ctor: '::',
													_0: A3(
														_mdgriffith$stylish_elephants$Internal_Model$Single,
														styleName(
															A2(
																_elm_lang$core$Basics_ops['++'],
																'height-px-',
																_elm_lang$core$Basics$toString(_p170))),
														'height',
														A2(
															_elm_lang$core$Basics_ops['++'],
															_elm_lang$core$Basics$toString(_p170),
															'px')),
													_1: gath.styles
												}
											});
									case 'Content':
										return _elm_lang$core$Native_Utils.update(
											gath,
											{
												attributes: {
													ctor: '::',
													_0: className(
														function (_) {
															return _.heightContent;
														}(_mdgriffith$stylish_elephants$Internal_Style$classes)),
													_1: gath.attributes
												}
											});
									case 'Fill':
										var _p171 = _p169._0;
										return _elm_lang$core$Native_Utils.eq(_p171, 1) ? _elm_lang$core$Native_Utils.update(
											gath,
											{
												attributes: {
													ctor: '::',
													_0: className(
														function (_) {
															return _.heightFill;
														}(_mdgriffith$stylish_elephants$Internal_Style$classes)),
													_1: gath.attributes
												}
											}) : _elm_lang$core$Native_Utils.update(
											gath,
											{
												attributes: {
													ctor: '::',
													_0: className(
														A2(
															_elm_lang$core$Basics_ops['++'],
															'height-fill-portion height-fill-',
															_elm_lang$core$Basics$toString(_p171))),
													_1: gath.attributes
												},
												styles: {
													ctor: '::',
													_0: A3(
														_mdgriffith$stylish_elephants$Internal_Model$Single,
														A2(
															_elm_lang$core$Basics_ops['++'],
															'.se.column > ',
															styleName(
																A2(
																	_elm_lang$core$Basics_ops['++'],
																	'height-fill-',
																	_elm_lang$core$Basics$toString(_p171)))),
														'flex-grow',
														_elm_lang$core$Basics$toString(_p171 * 100000)),
													_1: gath.styles
												}
											});
									case 'Min':
										var _p173 = _p169._0;
										var _p172 = {
											ctor: '_Tuple2',
											_0: A2(
												_elm_lang$core$Basics_ops['++'],
												'min-height-',
												_mdgriffith$stylish_elephants$Internal_Model$intToString(_p173)),
											_1: A3(
												_mdgriffith$stylish_elephants$Internal_Model$Single,
												A2(
													_elm_lang$core$Basics_ops['++'],
													'.min-height-',
													_mdgriffith$stylish_elephants$Internal_Model$intToString(_p173)),
												'min-height',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_mdgriffith$stylish_elephants$Internal_Model$intToString(_p173),
													'px'))
										};
										var cls = _p172._0;
										var style = _p172._1;
										var newGathered = _elm_lang$core$Native_Utils.update(
											gath,
											{
												attributes: {
													ctor: '::',
													_0: className(cls),
													_1: gath.attributes
												},
												styles: {ctor: '::', _0: style, _1: gath.styles}
											});
										var _v97 = _p169._1,
											_v98 = newGathered;
										h = _v97;
										gath = _v98;
										continue heightHelper;
									default:
										var _p175 = _p169._0;
										var _p174 = {
											ctor: '_Tuple2',
											_0: A2(
												_elm_lang$core$Basics_ops['++'],
												'max-height-',
												_mdgriffith$stylish_elephants$Internal_Model$intToString(_p175)),
											_1: A3(
												_mdgriffith$stylish_elephants$Internal_Model$Single,
												A2(
													_elm_lang$core$Basics_ops['++'],
													'.max-height-',
													_mdgriffith$stylish_elephants$Internal_Model$intToString(_p175)),
												'max-height',
												A2(
													_elm_lang$core$Basics_ops['++'],
													_mdgriffith$stylish_elephants$Internal_Model$intToString(_p175),
													'px'))
										};
										var cls = _p174._0;
										var style = _p174._1;
										var newGathered = _elm_lang$core$Native_Utils.update(
											gath,
											{
												attributes: {
													ctor: '::',
													_0: className(cls),
													_1: gath.attributes
												},
												styles: {ctor: '::', _0: style, _1: gath.styles}
											});
										var _v99 = _p169._1,
											_v100 = newGathered;
										h = _v99;
										gath = _v100;
										continue heightHelper;
								}
							}
						});
					return A2(
						heightHelper,
						_p176,
						_elm_lang$core$Native_Utils.update(
							gathered,
							{
								height: _elm_lang$core$Maybe$Just(_p176)
							}));
				} else {
					return gathered;
				}
			case 'Describe':
				var _p177 = _p153._0;
				switch (_p177.ctor) {
					case 'Main':
						return _elm_lang$core$Native_Utils.update(
							gathered,
							{
								node: A2(_mdgriffith$stylish_elephants$Internal_Model$addNodeName, 'main', gathered.node)
							});
					case 'Navigation':
						return _elm_lang$core$Native_Utils.update(
							gathered,
							{
								node: A2(_mdgriffith$stylish_elephants$Internal_Model$addNodeName, 'nav', gathered.node)
							});
					case 'ContentInfo':
						return _elm_lang$core$Native_Utils.update(
							gathered,
							{
								node: A2(_mdgriffith$stylish_elephants$Internal_Model$addNodeName, 'footer', gathered.node)
							});
					case 'Complementary':
						return _elm_lang$core$Native_Utils.update(
							gathered,
							{
								node: A2(_mdgriffith$stylish_elephants$Internal_Model$addNodeName, 'aside', gathered.node)
							});
					case 'Heading':
						var _p178 = _p177._0;
						return (_elm_lang$core$Native_Utils.cmp(_p178, 1) < 1) ? _elm_lang$core$Native_Utils.update(
							gathered,
							{
								node: A2(_mdgriffith$stylish_elephants$Internal_Model$addNodeName, 'h1', gathered.node)
							}) : ((_elm_lang$core$Native_Utils.cmp(_p178, 7) < 0) ? _elm_lang$core$Native_Utils.update(
							gathered,
							{
								node: A2(
									_mdgriffith$stylish_elephants$Internal_Model$addNodeName,
									A2(
										_elm_lang$core$Basics_ops['++'],
										'h',
										_elm_lang$core$Basics$toString(_p178)),
									gathered.node)
							}) : _elm_lang$core$Native_Utils.update(
							gathered,
							{
								node: A2(_mdgriffith$stylish_elephants$Internal_Model$addNodeName, 'h6', gathered.node)
							}));
					case 'Button':
						return _elm_lang$core$Native_Utils.update(
							gathered,
							{
								attributes: {
									ctor: '::',
									_0: A2(_elm_lang$html$Html_Attributes$attribute, 'role', 'button'),
									_1: gathered.attributes
								}
							});
					case 'Label':
						return _elm_lang$core$Native_Utils.update(
							gathered,
							{
								attributes: {
									ctor: '::',
									_0: A2(_elm_lang$html$Html_Attributes$attribute, 'aria-label', _p177._0),
									_1: gathered.attributes
								}
							});
					case 'LivePolite':
						return _elm_lang$core$Native_Utils.update(
							gathered,
							{
								attributes: {
									ctor: '::',
									_0: A2(_elm_lang$html$Html_Attributes$attribute, 'aria-live', 'polite'),
									_1: gathered.attributes
								}
							});
					default:
						return _elm_lang$core$Native_Utils.update(
							gathered,
							{
								attributes: {
									ctor: '::',
									_0: A2(_elm_lang$html$Html_Attributes$attribute, 'aria-live', 'assertive'),
									_1: gathered.attributes
								}
							});
				}
			case 'Nearby':
				var _p183 = _p153._0;
				var _p182 = _p153._1;
				var styles = function () {
					var _p179 = _p182;
					switch (_p179.ctor) {
						case 'Empty':
							return _elm_lang$core$Maybe$Nothing;
						case 'Text':
							return _elm_lang$core$Maybe$Nothing;
						case 'Unstyled':
							return _elm_lang$core$Maybe$Nothing;
						default:
							return _elm_lang$core$Maybe$Just(
								A2(_elm_lang$core$Basics_ops['++'], gathered.styles, _p179._0.styles));
					}
				}();
				return _elm_lang$core$Native_Utils.update(
					gathered,
					{
						styles: function () {
							var _p180 = styles;
							if (_p180.ctor === 'Nothing') {
								return gathered.styles;
							} else {
								return _p180._0;
							}
						}(),
						nearbys: function () {
							var _p181 = gathered.nearbys;
							if (_p181.ctor === 'Nothing') {
								return _elm_lang$core$Maybe$Just(
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: _p183, _1: _p182},
										_1: {ctor: '[]'}
									});
							} else {
								return _elm_lang$core$Maybe$Just(
									{
										ctor: '::',
										_0: {ctor: '_Tuple2', _0: _p183, _1: _p182},
										_1: _p181._0
									});
							}
						}()
					});
			case 'AlignX':
				var _p185 = _p153._0;
				var _p184 = gathered.alignment;
				if (_p184.ctor === 'Unaligned') {
					return _elm_lang$core$Native_Utils.update(
						gathered,
						{
							attributes: {
								ctor: '::',
								_0: className(
									_mdgriffith$stylish_elephants$Internal_Model$alignXName(_p185)),
								_1: gathered.attributes
							},
							alignment: A2(
								_mdgriffith$stylish_elephants$Internal_Model$Aligned,
								_elm_lang$core$Maybe$Just(_p185),
								_elm_lang$core$Maybe$Nothing)
						});
				} else {
					if (_p184._0.ctor === 'Just') {
						return gathered;
					} else {
						return _elm_lang$core$Native_Utils.update(
							gathered,
							{
								attributes: {
									ctor: '::',
									_0: className(
										_mdgriffith$stylish_elephants$Internal_Model$alignXName(_p185)),
									_1: gathered.attributes
								},
								alignment: A2(
									_mdgriffith$stylish_elephants$Internal_Model$Aligned,
									_elm_lang$core$Maybe$Just(_p185),
									_p184._1)
							});
					}
				}
			case 'AlignY':
				var _p187 = _p153._0;
				var _p186 = gathered.alignment;
				if (_p186.ctor === 'Unaligned') {
					return _elm_lang$core$Native_Utils.update(
						gathered,
						{
							attributes: {
								ctor: '::',
								_0: className(
									_mdgriffith$stylish_elephants$Internal_Model$alignYName(_p187)),
								_1: gathered.attributes
							},
							alignment: A2(
								_mdgriffith$stylish_elephants$Internal_Model$Aligned,
								_elm_lang$core$Maybe$Nothing,
								_elm_lang$core$Maybe$Just(_p187))
						});
				} else {
					if (_p186._1.ctor === 'Just') {
						return gathered;
					} else {
						return _elm_lang$core$Native_Utils.update(
							gathered,
							{
								attributes: {
									ctor: '::',
									_0: className(
										_mdgriffith$stylish_elephants$Internal_Model$alignYName(_p187)),
									_1: gathered.attributes
								},
								alignment: A2(
									_mdgriffith$stylish_elephants$Internal_Model$Aligned,
									_p186._0,
									_elm_lang$core$Maybe$Just(_p187))
							});
					}
				}
			case 'Filter':
				var _p189 = _p153._0;
				var _p188 = gathered.filters;
				if (_p188.ctor === 'Nothing') {
					return _elm_lang$core$Native_Utils.update(
						gathered,
						{
							filters: _elm_lang$core$Maybe$Just(
								_mdgriffith$stylish_elephants$Internal_Model$filterName(_p189))
						});
				} else {
					return _elm_lang$core$Native_Utils.update(
						gathered,
						{
							filters: _elm_lang$core$Maybe$Just(
								A2(
									_elm_lang$core$Basics_ops['++'],
									_mdgriffith$stylish_elephants$Internal_Model$filterName(_p189),
									A2(_elm_lang$core$Basics_ops['++'], ' ', _p188._0)))
						});
				}
			case 'BoxShadow':
				var _p191 = _p153._0;
				var _p190 = gathered.boxShadows;
				if (_p190.ctor === 'Nothing') {
					return _elm_lang$core$Native_Utils.update(
						gathered,
						{
							boxShadows: _elm_lang$core$Maybe$Just(
								_mdgriffith$stylish_elephants$Internal_Model$formatBoxShadow(_p191))
						});
				} else {
					return _elm_lang$core$Native_Utils.update(
						gathered,
						{
							boxShadows: _elm_lang$core$Maybe$Just(
								A2(
									_elm_lang$core$Basics_ops['++'],
									_mdgriffith$stylish_elephants$Internal_Model$formatBoxShadow(_p191),
									A2(_elm_lang$core$Basics_ops['++'], ', ', _p190._0)))
						});
				}
			default:
				var _p193 = _p153._0;
				var _p192 = gathered.textShadows;
				if (_p192.ctor === 'Nothing') {
					return _elm_lang$core$Native_Utils.update(
						gathered,
						{
							textShadows: _elm_lang$core$Maybe$Just(
								_mdgriffith$stylish_elephants$Internal_Model$formatTextShadow(_p193))
						});
				} else {
					return _elm_lang$core$Native_Utils.update(
						gathered,
						{
							textShadows: _elm_lang$core$Maybe$Just(
								A2(
									_elm_lang$core$Basics_ops['++'],
									_mdgriffith$stylish_elephants$Internal_Model$formatTextShadow(_p193),
									A2(_elm_lang$core$Basics_ops['++'], ', ', _p192._0)))
						});
				}
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$Generic = {ctor: 'Generic'};
var _mdgriffith$stylish_elephants$Internal_Model$initGathered = function (maybeNodeName) {
	return {
		attributes: {ctor: '[]'},
		styles: {ctor: '[]'},
		width: _elm_lang$core$Maybe$Nothing,
		height: _elm_lang$core$Maybe$Nothing,
		alignment: _mdgriffith$stylish_elephants$Internal_Model$Unaligned,
		node: function () {
			var _p194 = maybeNodeName;
			if (_p194.ctor === 'Nothing') {
				return _mdgriffith$stylish_elephants$Internal_Model$Generic;
			} else {
				return _mdgriffith$stylish_elephants$Internal_Model$NodeName(_p194._0);
			}
		}(),
		nearbys: _elm_lang$core$Maybe$Nothing,
		transform: _elm_lang$core$Maybe$Nothing,
		filters: _elm_lang$core$Maybe$Nothing,
		boxShadows: _elm_lang$core$Maybe$Nothing,
		textShadows: _elm_lang$core$Maybe$Nothing,
		has: _elm_lang$core$Set$empty
	};
};
var _mdgriffith$stylish_elephants$Internal_Model$OnlyDynamic = function (a) {
	return {ctor: 'OnlyDynamic', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$StaticRootAndDynamic = function (a) {
	return {ctor: 'StaticRootAndDynamic', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$NoStyleSheet = {ctor: 'NoStyleSheet'};
var _mdgriffith$stylish_elephants$Internal_Model$noStyleSheet = _mdgriffith$stylish_elephants$Internal_Model$NoStyleSheet;
var _mdgriffith$stylish_elephants$Internal_Model$Keyed = function (a) {
	return {ctor: 'Keyed', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$Unkeyed = function (a) {
	return {ctor: 'Unkeyed', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$asElement = F4(
	function (embedMode, children, context, rendered) {
		var gatherKeyed = F2(
			function (_p196, _p195) {
				var _p197 = _p196;
				var _p204 = _p197._0;
				var _p198 = _p195;
				var _p203 = _p198._0;
				var _p202 = _p198._1;
				var _p199 = _p197._1;
				switch (_p199.ctor) {
					case 'Unstyled':
						return {
							ctor: '_Tuple2',
							_0: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: _p204,
									_1: _p199._0(context)
								},
								_1: _p203
							},
							_1: _p202
						};
					case 'Styled':
						var _p200 = _p199._0;
						return {
							ctor: '_Tuple2',
							_0: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: _p204,
									_1: A2(_p200.html, _elm_lang$core$Maybe$Nothing, context)
								},
								_1: _p203
							},
							_1: A2(_elm_lang$core$Basics_ops['++'], _p200.styles, _p202)
						};
					case 'Text':
						var _p201 = _p199._0;
						return (_elm_lang$core$Native_Utils.eq(
							rendered.width,
							_elm_lang$core$Maybe$Just(_mdgriffith$stylish_elephants$Internal_Model$Content)) && (_elm_lang$core$Native_Utils.eq(
							rendered.height,
							_elm_lang$core$Maybe$Just(_mdgriffith$stylish_elephants$Internal_Model$Content)) && _elm_lang$core$Native_Utils.eq(context, _mdgriffith$stylish_elephants$Internal_Model$asEl))) ? {
							ctor: '_Tuple2',
							_0: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: _p204,
									_1: _elm_lang$html$Html$text(_p201)
								},
								_1: _p203
							},
							_1: _p202
						} : {
							ctor: '_Tuple2',
							_0: {
								ctor: '::',
								_0: {
									ctor: '_Tuple2',
									_0: _p204,
									_1: _mdgriffith$stylish_elephants$Internal_Model$textElement(_p201)
								},
								_1: _p203
							},
							_1: _p202
						};
					default:
						return {ctor: '_Tuple2', _0: _p203, _1: _p202};
				}
			});
		var gather = F2(
			function (child, _p205) {
				var _p206 = _p205;
				var _p211 = _p206._0;
				var _p210 = _p206._1;
				var _p207 = child;
				switch (_p207.ctor) {
					case 'Unstyled':
						return {
							ctor: '_Tuple2',
							_0: {
								ctor: '::',
								_0: _p207._0(context),
								_1: _p211
							},
							_1: _p210
						};
					case 'Styled':
						var _p208 = _p207._0;
						return {
							ctor: '_Tuple2',
							_0: {
								ctor: '::',
								_0: A2(_p208.html, _elm_lang$core$Maybe$Nothing, context),
								_1: _p211
							},
							_1: A2(_elm_lang$core$Basics_ops['++'], _p208.styles, _p210)
						};
					case 'Text':
						var _p209 = _p207._0;
						return _elm_lang$core$Native_Utils.eq(context, _mdgriffith$stylish_elephants$Internal_Model$asEl) ? {
							ctor: '_Tuple2',
							_0: {
								ctor: '::',
								_0: _mdgriffith$stylish_elephants$Internal_Model$textElementFill(_p209),
								_1: _p211
							},
							_1: _p210
						} : {
							ctor: '_Tuple2',
							_0: {
								ctor: '::',
								_0: _mdgriffith$stylish_elephants$Internal_Model$textElement(_p209),
								_1: _p211
							},
							_1: _p210
						};
					default:
						return {ctor: '_Tuple2', _0: _p211, _1: _p210};
				}
			});
		var _p212 = function () {
			var _p213 = children;
			if (_p213.ctor === 'Keyed') {
				return A2(
					_elm_lang$core$Tuple$mapFirst,
					_mdgriffith$stylish_elephants$Internal_Model$Keyed,
					A3(
						_elm_lang$core$List$foldr,
						gatherKeyed,
						{
							ctor: '_Tuple2',
							_0: {ctor: '[]'},
							_1: rendered.styles
						},
						_p213._0));
			} else {
				return A2(
					_elm_lang$core$Tuple$mapFirst,
					_mdgriffith$stylish_elephants$Internal_Model$Unkeyed,
					A3(
						_elm_lang$core$List$foldr,
						gather,
						{
							ctor: '_Tuple2',
							_0: {ctor: '[]'},
							_1: rendered.styles
						},
						_p213._0));
			}
		}();
		var htmlChildren = _p212._0;
		var styleChildren = _p212._1;
		var _p214 = embedMode;
		switch (_p214.ctor) {
			case 'NoStyleSheet':
				var renderedChildren = function () {
					var _p215 = A2(_elm_lang$core$Maybe$map, _mdgriffith$stylish_elephants$Internal_Model$renderNearbyGroupAbsolute, rendered.nearbys);
					if (_p215.ctor === 'Nothing') {
						return htmlChildren;
					} else {
						var _p217 = _p215._0;
						var _p216 = htmlChildren;
						if (_p216.ctor === 'Keyed') {
							return _mdgriffith$stylish_elephants$Internal_Model$Keyed(
								A2(
									_elm_lang$core$Basics_ops['++'],
									_p216._0,
									A2(
										_elm_lang$core$List$map,
										function (x) {
											return {ctor: '_Tuple2', _0: 'nearby-elements-pls', _1: x};
										},
										_p217)));
						} else {
							return _mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
								A2(_elm_lang$core$Basics_ops['++'], _p216._0, _p217));
						}
					}
				}();
				var _p218 = styleChildren;
				if (_p218.ctor === '[]') {
					return _mdgriffith$stylish_elephants$Internal_Model$Unstyled(
						A3(_mdgriffith$stylish_elephants$Internal_Model$renderNode, rendered, renderedChildren, _elm_lang$core$Maybe$Nothing));
				} else {
					return _mdgriffith$stylish_elephants$Internal_Model$Styled(
						{
							styles: styleChildren,
							html: A2(_mdgriffith$stylish_elephants$Internal_Model$renderNode, rendered, renderedChildren)
						});
				}
			case 'StaticRootAndDynamic':
				var _p223 = _p214._0;
				var styles = _elm_lang$core$Tuple$second(
					A3(
						_elm_lang$core$List$foldr,
						_mdgriffith$stylish_elephants$Internal_Model$reduceStyles,
						{
							ctor: '_Tuple2',
							_0: _elm_lang$core$Set$empty,
							_1: {
								ctor: '::',
								_0: _mdgriffith$stylish_elephants$Internal_Model$renderFocusStyle(_p223.focus),
								_1: {ctor: '[]'}
							}
						},
						styleChildren));
				var renderedChildren = function () {
					var _p219 = A2(_elm_lang$core$Maybe$map, _mdgriffith$stylish_elephants$Internal_Model$renderNearbyGroupAbsolute, rendered.nearbys);
					if (_p219.ctor === 'Nothing') {
						var _p220 = htmlChildren;
						if (_p220.ctor === 'Keyed') {
							return _mdgriffith$stylish_elephants$Internal_Model$Keyed(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'static-stylesheet', _1: _mdgriffith$stylish_elephants$Internal_Style$rulesElement},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'dynamic-stylesheet',
											_1: A2(_mdgriffith$stylish_elephants$Internal_Model$toStyleSheet, _p223, styles)
										},
										_1: _p220._0
									}
								});
						} else {
							return _mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
								{
									ctor: '::',
									_0: _mdgriffith$stylish_elephants$Internal_Style$rulesElement,
									_1: {
										ctor: '::',
										_0: A2(_mdgriffith$stylish_elephants$Internal_Model$toStyleSheet, _p223, styles),
										_1: _p220._0
									}
								});
						}
					} else {
						var _p222 = _p219._0;
						var _p221 = htmlChildren;
						if (_p221.ctor === 'Keyed') {
							return _mdgriffith$stylish_elephants$Internal_Model$Keyed(
								{
									ctor: '::',
									_0: {ctor: '_Tuple2', _0: 'static-stylesheet', _1: _mdgriffith$stylish_elephants$Internal_Style$rulesElement},
									_1: {
										ctor: '::',
										_0: {
											ctor: '_Tuple2',
											_0: 'dynamic-stylesheet',
											_1: A2(_mdgriffith$stylish_elephants$Internal_Model$toStyleSheet, _p223, styles)
										},
										_1: A2(
											_elm_lang$core$Basics_ops['++'],
											_p221._0,
											A2(
												_elm_lang$core$List$map,
												function (x) {
													return {ctor: '_Tuple2', _0: 'nearby-elements-pls', _1: x};
												},
												_p222))
									}
								});
						} else {
							return _mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
								{
									ctor: '::',
									_0: _mdgriffith$stylish_elephants$Internal_Style$rulesElement,
									_1: {
										ctor: '::',
										_0: A2(_mdgriffith$stylish_elephants$Internal_Model$toStyleSheet, _p223, styles),
										_1: A2(_elm_lang$core$Basics_ops['++'], _p221._0, _p222)
									}
								});
						}
					}
				}();
				return _mdgriffith$stylish_elephants$Internal_Model$Unstyled(
					A3(_mdgriffith$stylish_elephants$Internal_Model$renderNode, rendered, renderedChildren, _elm_lang$core$Maybe$Nothing));
			default:
				var _p228 = _p214._0;
				var styles = _elm_lang$core$Tuple$second(
					A3(
						_elm_lang$core$List$foldr,
						_mdgriffith$stylish_elephants$Internal_Model$reduceStyles,
						{
							ctor: '_Tuple2',
							_0: _elm_lang$core$Set$empty,
							_1: {
								ctor: '::',
								_0: _mdgriffith$stylish_elephants$Internal_Model$renderFocusStyle(_p228.focus),
								_1: {ctor: '[]'}
							}
						},
						styleChildren));
				var renderedChildren = function () {
					var _p224 = A2(_elm_lang$core$Maybe$map, _mdgriffith$stylish_elephants$Internal_Model$renderNearbyGroupAbsolute, rendered.nearbys);
					if (_p224.ctor === 'Nothing') {
						var _p225 = htmlChildren;
						if (_p225.ctor === 'Keyed') {
							return _mdgriffith$stylish_elephants$Internal_Model$Keyed(
								{
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'dynamic-stylesheet',
										_1: A2(_mdgriffith$stylish_elephants$Internal_Model$toStyleSheet, _p228, styles)
									},
									_1: _p225._0
								});
						} else {
							return _mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
								{
									ctor: '::',
									_0: A2(_mdgriffith$stylish_elephants$Internal_Model$toStyleSheet, _p228, styles),
									_1: _p225._0
								});
						}
					} else {
						var _p227 = _p224._0;
						var _p226 = htmlChildren;
						if (_p226.ctor === 'Keyed') {
							return _mdgriffith$stylish_elephants$Internal_Model$Keyed(
								{
									ctor: '::',
									_0: {
										ctor: '_Tuple2',
										_0: 'dynamic-stylesheet',
										_1: A2(_mdgriffith$stylish_elephants$Internal_Model$toStyleSheet, _p228, styles)
									},
									_1: A2(
										_elm_lang$core$Basics_ops['++'],
										_p226._0,
										A2(
											_elm_lang$core$List$map,
											function (x) {
												return {ctor: '_Tuple2', _0: 'nearby-elements-pls', _1: x};
											},
											_p227))
								});
						} else {
							return _mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
								{
									ctor: '::',
									_0: A2(_mdgriffith$stylish_elephants$Internal_Model$toStyleSheet, _p228, styles),
									_1: A2(_elm_lang$core$Basics_ops['++'], _p226._0, _p227)
								});
						}
					}
				}();
				return _mdgriffith$stylish_elephants$Internal_Model$Unstyled(
					A3(_mdgriffith$stylish_elephants$Internal_Model$renderNode, rendered, renderedChildren, _elm_lang$core$Maybe$Nothing));
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$element = F5(
	function (embedMode, context, node, attributes, children) {
		return A4(
			_mdgriffith$stylish_elephants$Internal_Model$asElement,
			embedMode,
			children,
			context,
			_mdgriffith$stylish_elephants$Internal_Model$finalize(
				A3(
					_elm_lang$core$List$foldr,
					_mdgriffith$stylish_elephants$Internal_Model$gatherAttributes,
					_mdgriffith$stylish_elephants$Internal_Model$initGathered(node),
					{
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Internal_Model$contextClasses(context),
						_1: attributes
					})));
	});
var _mdgriffith$stylish_elephants$Internal_Model$WithVirtualCss = {ctor: 'WithVirtualCss'};
var _mdgriffith$stylish_elephants$Internal_Model$NoStaticStyleSheet = {ctor: 'NoStaticStyleSheet'};
var _mdgriffith$stylish_elephants$Internal_Model$Layout = {ctor: 'Layout'};
var _mdgriffith$stylish_elephants$Internal_Model$Viewport = {ctor: 'Viewport'};
var _mdgriffith$stylish_elephants$Internal_Model$ForceHover = {ctor: 'ForceHover'};
var _mdgriffith$stylish_elephants$Internal_Model$AllowHover = {ctor: 'AllowHover'};
var _mdgriffith$stylish_elephants$Internal_Model$embed = F2(
	function (fn, a) {
		var _p229 = fn(a);
		switch (_p229.ctor) {
			case 'Unstyled':
				return _p229._0;
			case 'Styled':
				var _p230 = _p229._0;
				return _p230.html(
					_elm_lang$core$Maybe$Just(
						A2(
							_mdgriffith$stylish_elephants$Internal_Model$toStyleSheetString,
							{
								hover: _mdgriffith$stylish_elephants$Internal_Model$AllowHover,
								focus: {borderColor: _elm_lang$core$Maybe$Nothing, shadow: _elm_lang$core$Maybe$Nothing, backgroundColor: _elm_lang$core$Maybe$Nothing},
								mode: _mdgriffith$stylish_elephants$Internal_Model$Layout
							},
							_p230.styles)));
			case 'Text':
				return _elm_lang$core$Basics$always(
					_elm_lang$html$Html$text(_p229._0));
			default:
				return _elm_lang$core$Basics$always(
					_elm_lang$html$Html$text(''));
		}
	});
var _mdgriffith$stylish_elephants$Internal_Model$optionsToRecord = function (options) {
	var finalize = function (record) {
		return {
			hover: function () {
				var _p231 = record.hover;
				if (_p231.ctor === 'Nothing') {
					return _mdgriffith$stylish_elephants$Internal_Model$AllowHover;
				} else {
					return _p231._0;
				}
			}(),
			focus: function () {
				var _p232 = record.focus;
				if (_p232.ctor === 'Nothing') {
					return _mdgriffith$stylish_elephants$Internal_Model$focusDefaultStyle;
				} else {
					return _p232._0;
				}
			}(),
			mode: function () {
				var _p233 = record.mode;
				if (_p233.ctor === 'Nothing') {
					return _mdgriffith$stylish_elephants$Internal_Model$Layout;
				} else {
					return _p233._0;
				}
			}()
		};
	};
	var combine = F2(
		function (opt, record) {
			var _p234 = opt;
			switch (_p234.ctor) {
				case 'HoverOption':
					var _p235 = record.hover;
					if (_p235.ctor === 'Nothing') {
						return _elm_lang$core$Native_Utils.update(
							record,
							{
								hover: _elm_lang$core$Maybe$Just(_p234._0)
							});
					} else {
						return record;
					}
				case 'FocusStyleOption':
					var _p236 = record.focus;
					if (_p236.ctor === 'Nothing') {
						return _elm_lang$core$Native_Utils.update(
							record,
							{
								focus: _elm_lang$core$Maybe$Just(_p234._0)
							});
					} else {
						return record;
					}
				default:
					var _p237 = record.mode;
					if (_p237.ctor === 'Nothing') {
						return _elm_lang$core$Native_Utils.update(
							record,
							{
								mode: _elm_lang$core$Maybe$Just(_p234._0)
							});
					} else {
						return record;
					}
			}
		});
	return finalize(
		A3(
			_elm_lang$core$List$foldr,
			combine,
			{hover: _elm_lang$core$Maybe$Nothing, focus: _elm_lang$core$Maybe$Nothing, mode: _elm_lang$core$Maybe$Nothing},
			options));
};
var _mdgriffith$stylish_elephants$Internal_Model$renderRoot = F3(
	function (optionList, attributes, child) {
		var options = _mdgriffith$stylish_elephants$Internal_Model$optionsToRecord(optionList);
		var embedStyle = function () {
			var _p238 = options.mode;
			if (_p238.ctor === 'NoStaticStyleSheet') {
				return _mdgriffith$stylish_elephants$Internal_Model$OnlyDynamic(options);
			} else {
				return _mdgriffith$stylish_elephants$Internal_Model$StaticRootAndDynamic(options);
			}
		}();
		return A2(
			_mdgriffith$stylish_elephants$Internal_Model$toHtml,
			options,
			A5(
				_mdgriffith$stylish_elephants$Internal_Model$element,
				embedStyle,
				_mdgriffith$stylish_elephants$Internal_Model$asEl,
				_elm_lang$core$Maybe$Nothing,
				attributes,
				_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
					{
						ctor: '::',
						_0: child,
						_1: {ctor: '[]'}
					})));
	});
var _mdgriffith$stylish_elephants$Internal_Model$NoHover = {ctor: 'NoHover'};
var _mdgriffith$stylish_elephants$Internal_Model$RenderModeOption = function (a) {
	return {ctor: 'RenderModeOption', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$FocusStyleOption = function (a) {
	return {ctor: 'FocusStyleOption', _0: a};
};
var _mdgriffith$stylish_elephants$Internal_Model$HoverOption = function (a) {
	return {ctor: 'HoverOption', _0: a};
};

var _mdgriffith$stylish_elephants$Element$focused = function (decs) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A2(
			_mdgriffith$stylish_elephants$Internal_Model$PseudoSelector,
			_mdgriffith$stylish_elephants$Internal_Model$Focus,
			A2(
				_elm_lang$core$List$map,
				_mdgriffith$stylish_elephants$Internal_Model$tag('focus'),
				_mdgriffith$stylish_elephants$Internal_Model$unwrapDecorations(decs))));
};
var _mdgriffith$stylish_elephants$Element$mouseDown = function (decs) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A2(
			_mdgriffith$stylish_elephants$Internal_Model$PseudoSelector,
			_mdgriffith$stylish_elephants$Internal_Model$Active,
			A2(
				_elm_lang$core$List$map,
				_mdgriffith$stylish_elephants$Internal_Model$tag('active'),
				_mdgriffith$stylish_elephants$Internal_Model$unwrapDecorations(decs))));
};
var _mdgriffith$stylish_elephants$Element$mouseOver = function (decs) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A2(
			_mdgriffith$stylish_elephants$Internal_Model$PseudoSelector,
			_mdgriffith$stylish_elephants$Internal_Model$Hover,
			A2(
				_elm_lang$core$List$map,
				_mdgriffith$stylish_elephants$Internal_Model$tag('hover'),
				_mdgriffith$stylish_elephants$Internal_Model$unwrapDecorations(decs))));
};
var _mdgriffith$stylish_elephants$Element$modular = F3(
	function (normal, ratio, scale) {
		return _elm_lang$core$Native_Utils.eq(scale, 0) ? normal : ((_elm_lang$core$Native_Utils.cmp(scale, 0) < 0) ? (normal * Math.pow(
			ratio,
			_elm_lang$core$Basics$toFloat(scale))) : (normal * Math.pow(
			ratio,
			_elm_lang$core$Basics$toFloat(scale) - 1)));
	});
var _mdgriffith$stylish_elephants$Element$classifyDevice = function (_p0) {
	var _p1 = _p0;
	var _p2 = _p1.width;
	return {
		phone: _elm_lang$core$Native_Utils.cmp(_p2, 600) < 1,
		tablet: (_elm_lang$core$Native_Utils.cmp(_p2, 600) > 0) && (_elm_lang$core$Native_Utils.cmp(_p2, 1200) < 1),
		desktop: (_elm_lang$core$Native_Utils.cmp(_p2, 1200) > 0) && (_elm_lang$core$Native_Utils.cmp(_p2, 1800) < 1),
		bigDesktop: _elm_lang$core$Native_Utils.cmp(_p2, 1800) > 0,
		portrait: _elm_lang$core$Native_Utils.cmp(_p2, _p1.height) < 0
	};
};
var _mdgriffith$stylish_elephants$Element$pointer = A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'cursor', _mdgriffith$stylish_elephants$Internal_Style$classes.cursorPointer);
var _mdgriffith$stylish_elephants$Element$clipX = A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'overflow', _mdgriffith$stylish_elephants$Internal_Style$classes.clipX);
var _mdgriffith$stylish_elephants$Element$clipY = A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'overflow', _mdgriffith$stylish_elephants$Internal_Style$classes.clipY);
var _mdgriffith$stylish_elephants$Element$clip = A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'overflow', _mdgriffith$stylish_elephants$Internal_Style$classes.clip);
var _mdgriffith$stylish_elephants$Element$scrollbarX = A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'overflow', _mdgriffith$stylish_elephants$Internal_Style$classes.scrollbarsX);
var _mdgriffith$stylish_elephants$Element$scrollbarY = A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'overflow', _mdgriffith$stylish_elephants$Internal_Style$classes.scrollbarsY);
var _mdgriffith$stylish_elephants$Element$scrollbars = A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'overflow', _mdgriffith$stylish_elephants$Internal_Style$classes.scrollbars);
var _mdgriffith$stylish_elephants$Element$alpha = function (o) {
	var transparency = function (x) {
		return 1 - x;
	}(
		A2(
			_elm_lang$core$Basics$min,
			1.0,
			A2(_elm_lang$core$Basics$max, 0.0, o)));
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A2(
			_mdgriffith$stylish_elephants$Internal_Model$Transparency,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'transparency-',
				_mdgriffith$stylish_elephants$Internal_Model$floatClass(transparency)),
			transparency));
};
var _mdgriffith$stylish_elephants$Element$transparent = function (on) {
	return on ? _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A2(_mdgriffith$stylish_elephants$Internal_Model$Transparency, 'transparent', 1.0)) : _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A2(_mdgriffith$stylish_elephants$Internal_Model$Transparency, 'visible', 0.0));
};
var _mdgriffith$stylish_elephants$Element$spacingXY = F2(
	function (x, y) {
		return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
			A2(_mdgriffith$stylish_elephants$Internal_Model$SpacingStyle, x, y));
	});
var _mdgriffith$stylish_elephants$Element$spacing = function (x) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A2(_mdgriffith$stylish_elephants$Internal_Model$SpacingStyle, x, x));
};
var _mdgriffith$stylish_elephants$Element$spaceEvenly = A2(
	_mdgriffith$stylish_elephants$Internal_Model$Class,
	'x-align',
	function (_) {
		return _.spaceEvenly;
	}(_mdgriffith$stylish_elephants$Internal_Style$classes));
var _mdgriffith$stylish_elephants$Element$alignRight = _mdgriffith$stylish_elephants$Internal_Model$AlignX(_mdgriffith$stylish_elephants$Internal_Model$Right);
var _mdgriffith$stylish_elephants$Element$alignLeft = _mdgriffith$stylish_elephants$Internal_Model$AlignX(_mdgriffith$stylish_elephants$Internal_Model$Left);
var _mdgriffith$stylish_elephants$Element$alignBottom = _mdgriffith$stylish_elephants$Internal_Model$AlignY(_mdgriffith$stylish_elephants$Internal_Model$Bottom);
var _mdgriffith$stylish_elephants$Element$alignTop = _mdgriffith$stylish_elephants$Internal_Model$AlignY(_mdgriffith$stylish_elephants$Internal_Model$Top);
var _mdgriffith$stylish_elephants$Element$centerY = _mdgriffith$stylish_elephants$Internal_Model$AlignY(_mdgriffith$stylish_elephants$Internal_Model$CenterY);
var _mdgriffith$stylish_elephants$Element$centerX = _mdgriffith$stylish_elephants$Internal_Model$AlignX(_mdgriffith$stylish_elephants$Internal_Model$CenterX);
var _mdgriffith$stylish_elephants$Element$paddingEach = function (_p3) {
	var _p4 = _p3;
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A4(_mdgriffith$stylish_elephants$Internal_Model$PaddingStyle, _p4.top, _p4.right, _p4.bottom, _p4.left));
};
var _mdgriffith$stylish_elephants$Element$paddingXY = F2(
	function (x, y) {
		return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
			A4(_mdgriffith$stylish_elephants$Internal_Model$PaddingStyle, y, x, y, x));
	});
var _mdgriffith$stylish_elephants$Element$padding = function (x) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A4(_mdgriffith$stylish_elephants$Internal_Model$PaddingStyle, x, x, x, x));
};
var _mdgriffith$stylish_elephants$Element$moveLeft = function (x) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		_mdgriffith$stylish_elephants$Internal_Model$Transform(
			A3(
				_mdgriffith$stylish_elephants$Internal_Model$Move,
				_elm_lang$core$Maybe$Just(
					_elm_lang$core$Basics$negate(x)),
				_elm_lang$core$Maybe$Nothing,
				_elm_lang$core$Maybe$Nothing)));
};
var _mdgriffith$stylish_elephants$Element$moveRight = function (x) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		_mdgriffith$stylish_elephants$Internal_Model$Transform(
			A3(
				_mdgriffith$stylish_elephants$Internal_Model$Move,
				_elm_lang$core$Maybe$Just(x),
				_elm_lang$core$Maybe$Nothing,
				_elm_lang$core$Maybe$Nothing)));
};
var _mdgriffith$stylish_elephants$Element$moveDown = function (y) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		_mdgriffith$stylish_elephants$Internal_Model$Transform(
			A3(
				_mdgriffith$stylish_elephants$Internal_Model$Move,
				_elm_lang$core$Maybe$Nothing,
				_elm_lang$core$Maybe$Just(y),
				_elm_lang$core$Maybe$Nothing)));
};
var _mdgriffith$stylish_elephants$Element$moveUp = function (y) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		_mdgriffith$stylish_elephants$Internal_Model$Transform(
			A3(
				_mdgriffith$stylish_elephants$Internal_Model$Move,
				_elm_lang$core$Maybe$Nothing,
				_elm_lang$core$Maybe$Just(
					_elm_lang$core$Basics$negate(y)),
				_elm_lang$core$Maybe$Nothing)));
};
var _mdgriffith$stylish_elephants$Element$rotate = function (angle) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		_mdgriffith$stylish_elephants$Internal_Model$Transform(
			A4(_mdgriffith$stylish_elephants$Internal_Model$Rotate, 0, 0, 1, angle)));
};
var _mdgriffith$stylish_elephants$Element$scale = function (n) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		_mdgriffith$stylish_elephants$Internal_Model$Transform(
			A3(_mdgriffith$stylish_elephants$Internal_Model$Scale, n, n, 1)));
};
var _mdgriffith$stylish_elephants$Element$height = _mdgriffith$stylish_elephants$Internal_Model$Height;
var _mdgriffith$stylish_elephants$Element$width = _mdgriffith$stylish_elephants$Internal_Model$Width;
var _mdgriffith$stylish_elephants$Element$behind = function (element) {
	return A2(_mdgriffith$stylish_elephants$Internal_Model$Nearby, _mdgriffith$stylish_elephants$Internal_Model$Behind, element);
};
var _mdgriffith$stylish_elephants$Element$inFront = function (element) {
	return A2(_mdgriffith$stylish_elephants$Internal_Model$Nearby, _mdgriffith$stylish_elephants$Internal_Model$InFront, element);
};
var _mdgriffith$stylish_elephants$Element$onLeft = function (element) {
	return A2(_mdgriffith$stylish_elephants$Internal_Model$Nearby, _mdgriffith$stylish_elephants$Internal_Model$OnLeft, element);
};
var _mdgriffith$stylish_elephants$Element$onRight = function (element) {
	return A2(_mdgriffith$stylish_elephants$Internal_Model$Nearby, _mdgriffith$stylish_elephants$Internal_Model$OnRight, element);
};
var _mdgriffith$stylish_elephants$Element$above = function (element) {
	return A2(_mdgriffith$stylish_elephants$Internal_Model$Nearby, _mdgriffith$stylish_elephants$Internal_Model$Above, element);
};
var _mdgriffith$stylish_elephants$Element$below = function (element) {
	return A2(_mdgriffith$stylish_elephants$Internal_Model$Nearby, _mdgriffith$stylish_elephants$Internal_Model$Below, element);
};
var _mdgriffith$stylish_elephants$Element$decorativeImage = F2(
	function (attrs, _p5) {
		var _p6 = _p5;
		var imageAttributes = A2(
			_elm_lang$core$List$filter,
			function (a) {
				var _p7 = a;
				switch (_p7.ctor) {
					case 'Width':
						return true;
					case 'Height':
						return true;
					default:
						return false;
				}
			},
			attrs);
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asEl,
			_elm_lang$core$Maybe$Nothing,
			{ctor: '::', _0: _mdgriffith$stylish_elephants$Element$clip, _1: attrs},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
				{
					ctor: '::',
					_0: A5(
						_mdgriffith$stylish_elephants$Internal_Model$element,
						_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
						_mdgriffith$stylish_elephants$Internal_Model$asEl,
						_elm_lang$core$Maybe$Just('img'),
						A2(
							_elm_lang$core$Basics_ops['++'],
							imageAttributes,
							{
								ctor: '::',
								_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
									_elm_lang$html$Html_Attributes$src(_p6.src)),
								_1: {
									ctor: '::',
									_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
										_elm_lang$html$Html_Attributes$alt('')),
									_1: {ctor: '[]'}
								}
							}),
						_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
							{ctor: '[]'})),
					_1: {ctor: '[]'}
				}));
	});
var _mdgriffith$stylish_elephants$Element$image = F2(
	function (attrs, _p8) {
		var _p9 = _p8;
		var imageAttributes = A2(
			_elm_lang$core$List$filter,
			function (a) {
				var _p10 = a;
				switch (_p10.ctor) {
					case 'Width':
						return true;
					case 'Height':
						return true;
					default:
						return false;
				}
			},
			attrs);
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asEl,
			_elm_lang$core$Maybe$Nothing,
			{ctor: '::', _0: _mdgriffith$stylish_elephants$Element$clip, _1: attrs},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
				{
					ctor: '::',
					_0: A5(
						_mdgriffith$stylish_elephants$Internal_Model$element,
						_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
						_mdgriffith$stylish_elephants$Internal_Model$asEl,
						_elm_lang$core$Maybe$Just('img'),
						A2(
							_elm_lang$core$Basics_ops['++'],
							imageAttributes,
							{
								ctor: '::',
								_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
									_elm_lang$html$Html_Attributes$src(_p9.src)),
								_1: {
									ctor: '::',
									_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
										_elm_lang$html$Html_Attributes$alt(_p9.description)),
									_1: {ctor: '[]'}
								}
							}),
						_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
							{ctor: '[]'})),
					_1: {ctor: '[]'}
				}));
	});
var _mdgriffith$stylish_elephants$Element$text = function (content) {
	return _mdgriffith$stylish_elephants$Internal_Model$Text(content);
};
var _mdgriffith$stylish_elephants$Element$none = _mdgriffith$stylish_elephants$Internal_Model$Empty;
var _mdgriffith$stylish_elephants$Element$forceHover = _mdgriffith$stylish_elephants$Internal_Model$HoverOption(_mdgriffith$stylish_elephants$Internal_Model$ForceHover);
var _mdgriffith$stylish_elephants$Element$noHover = _mdgriffith$stylish_elephants$Internal_Model$HoverOption(_mdgriffith$stylish_elephants$Internal_Model$NoHover);
var _mdgriffith$stylish_elephants$Element$focusStyle = _mdgriffith$stylish_elephants$Internal_Model$FocusStyleOption;
var _mdgriffith$stylish_elephants$Element$defaultFocus = _mdgriffith$stylish_elephants$Internal_Model$focusDefaultStyle;
var _mdgriffith$stylish_elephants$Element$noStaticStyleSheet = _mdgriffith$stylish_elephants$Internal_Model$RenderModeOption(_mdgriffith$stylish_elephants$Internal_Model$NoStaticStyleSheet);
var _mdgriffith$stylish_elephants$Element$layoutWith = F3(
	function (_p11, attrs, child) {
		var _p12 = _p11;
		return A3(
			_mdgriffith$stylish_elephants$Internal_Model$renderRoot,
			_p12.options,
			{
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Internal_Model$htmlClass('style-elements se el'),
				_1: {
					ctor: '::',
					_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'x-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterX),
					_1: {
						ctor: '::',
						_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'y-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterY),
						_1: A2(_elm_lang$core$Basics_ops['++'], _mdgriffith$stylish_elephants$Internal_Model$rootStyle, attrs)
					}
				}
			},
			child);
	});
var _mdgriffith$stylish_elephants$Element$layout = _mdgriffith$stylish_elephants$Element$layoutWith(
	{
		options: {ctor: '[]'}
	});
var _mdgriffith$stylish_elephants$Element$fillPortion = _mdgriffith$stylish_elephants$Internal_Model$Fill;
var _mdgriffith$stylish_elephants$Element$maximum = F2(
	function (i, l) {
		return A2(_mdgriffith$stylish_elephants$Internal_Model$Max, i, l);
	});
var _mdgriffith$stylish_elephants$Element$minimum = F2(
	function (i, l) {
		return A2(_mdgriffith$stylish_elephants$Internal_Model$Min, i, l);
	});
var _mdgriffith$stylish_elephants$Element$fill = _mdgriffith$stylish_elephants$Internal_Model$Fill(1);
var _mdgriffith$stylish_elephants$Element$column = F2(
	function (attrs, children) {
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asColumn,
			_elm_lang$core$Maybe$Nothing,
			{
				ctor: '::',
				_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'y-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentTop),
				_1: {
					ctor: '::',
					_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'x-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentLeft),
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Element$height(_mdgriffith$stylish_elephants$Element$fill),
						_1: {
							ctor: '::',
							_0: _mdgriffith$stylish_elephants$Element$width(_mdgriffith$stylish_elephants$Element$fill),
							_1: attrs
						}
					}
				}
			},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(children));
	});
var _mdgriffith$stylish_elephants$Element$paragraph = F2(
	function (attrs, children) {
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asParagraph,
			_elm_lang$core$Maybe$Just('p'),
			{
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Element$width(
					A2(
						_mdgriffith$stylish_elephants$Element$maximum,
						750,
						A2(_mdgriffith$stylish_elephants$Element$minimum, 500, _mdgriffith$stylish_elephants$Element$fill))),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Element$spacing(5),
					_1: attrs
				}
			},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(children));
	});
var _mdgriffith$stylish_elephants$Element$textColumn = F2(
	function (attrs, children) {
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asTextColumn,
			_elm_lang$core$Maybe$Nothing,
			{
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Element$width(
					A2(
						_mdgriffith$stylish_elephants$Element$maximum,
						750,
						A2(_mdgriffith$stylish_elephants$Element$minimum, 500, _mdgriffith$stylish_elephants$Element$fill))),
				_1: attrs
			},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(children));
	});
var _mdgriffith$stylish_elephants$Element$shrink = _mdgriffith$stylish_elephants$Internal_Model$Content;
var _mdgriffith$stylish_elephants$Element$el = F2(
	function (attrs, child) {
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asEl,
			_elm_lang$core$Maybe$Nothing,
			{
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Element$width(_mdgriffith$stylish_elephants$Element$shrink),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Element$height(_mdgriffith$stylish_elephants$Element$shrink),
					_1: attrs
				}
			},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
				{
					ctor: '::',
					_0: child,
					_1: {ctor: '[]'}
				}));
	});
var _mdgriffith$stylish_elephants$Element$row = F2(
	function (attrs, children) {
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asRow,
			_elm_lang$core$Maybe$Nothing,
			{
				ctor: '::',
				_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'x-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentLeft),
				_1: {
					ctor: '::',
					_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'y-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterY),
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Element$width(_mdgriffith$stylish_elephants$Element$fill),
						_1: {
							ctor: '::',
							_0: _mdgriffith$stylish_elephants$Element$height(_mdgriffith$stylish_elephants$Element$shrink),
							_1: attrs
						}
					}
				}
			},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(children));
	});
var _mdgriffith$stylish_elephants$Element$link = F2(
	function (attrs, _p13) {
		var _p14 = _p13;
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asEl,
			_elm_lang$core$Maybe$Just('a'),
			{
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
					_elm_lang$html$Html_Attributes$href(_p14.url)),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
						_elm_lang$html$Html_Attributes$rel('noopener noreferrer')),
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Element$width(_mdgriffith$stylish_elephants$Element$shrink),
						_1: {
							ctor: '::',
							_0: _mdgriffith$stylish_elephants$Element$height(_mdgriffith$stylish_elephants$Element$shrink),
							_1: {
								ctor: '::',
								_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'x-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterX),
								_1: {
									ctor: '::',
									_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'y-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterY),
									_1: attrs
								}
							}
						}
					}
				}
			},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
				{
					ctor: '::',
					_0: _p14.label,
					_1: {ctor: '[]'}
				}));
	});
var _mdgriffith$stylish_elephants$Element$newTabLink = F2(
	function (attrs, _p15) {
		var _p16 = _p15;
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asEl,
			_elm_lang$core$Maybe$Just('a'),
			{
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
					_elm_lang$html$Html_Attributes$href(_p16.url)),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
						_elm_lang$html$Html_Attributes$rel('noopener noreferrer')),
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
							_elm_lang$html$Html_Attributes$target('_blank')),
						_1: {
							ctor: '::',
							_0: _mdgriffith$stylish_elephants$Element$width(_mdgriffith$stylish_elephants$Element$shrink),
							_1: {
								ctor: '::',
								_0: _mdgriffith$stylish_elephants$Element$height(_mdgriffith$stylish_elephants$Element$shrink),
								_1: {
									ctor: '::',
									_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'x-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterX),
									_1: {
										ctor: '::',
										_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'y-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterY),
										_1: attrs
									}
								}
							}
						}
					}
				}
			},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
				{
					ctor: '::',
					_0: _p16.label,
					_1: {ctor: '[]'}
				}));
	});
var _mdgriffith$stylish_elephants$Element$download = F2(
	function (attrs, _p17) {
		var _p18 = _p17;
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asEl,
			_elm_lang$core$Maybe$Just('a'),
			{
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
					_elm_lang$html$Html_Attributes$href(_p18.url)),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
						_elm_lang$html$Html_Attributes$download(true)),
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Element$width(_mdgriffith$stylish_elephants$Element$shrink),
						_1: {
							ctor: '::',
							_0: _mdgriffith$stylish_elephants$Element$height(_mdgriffith$stylish_elephants$Element$shrink),
							_1: {
								ctor: '::',
								_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'x-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterX),
								_1: {
									ctor: '::',
									_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'y-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterY),
									_1: attrs
								}
							}
						}
					}
				}
			},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
				{
					ctor: '::',
					_0: _p18.label,
					_1: {ctor: '[]'}
				}));
	});
var _mdgriffith$stylish_elephants$Element$downloadAs = F2(
	function (attrs, _p19) {
		var _p20 = _p19;
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asEl,
			_elm_lang$core$Maybe$Just('a'),
			{
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
					_elm_lang$html$Html_Attributes$href(_p20.url)),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Internal_Model$Attr(
						_elm_lang$html$Html_Attributes$downloadAs(_p20.filename)),
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Element$width(_mdgriffith$stylish_elephants$Element$shrink),
						_1: {
							ctor: '::',
							_0: _mdgriffith$stylish_elephants$Element$height(_mdgriffith$stylish_elephants$Element$shrink),
							_1: {
								ctor: '::',
								_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'x-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterX),
								_1: {
									ctor: '::',
									_0: A2(_mdgriffith$stylish_elephants$Internal_Model$Class, 'y-content-align', _mdgriffith$stylish_elephants$Internal_Style$classes.contentCenterY),
									_1: attrs
								}
							}
						}
					}
				}
			},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
				{
					ctor: '::',
					_0: _p20.label,
					_1: {ctor: '[]'}
				}));
	});
var _mdgriffith$stylish_elephants$Element$px = _mdgriffith$stylish_elephants$Internal_Model$Px;
var _mdgriffith$stylish_elephants$Element$tableHelper = F2(
	function (attrs, config) {
		var onGrid = F3(
			function (row, column, el) {
				return A5(
					_mdgriffith$stylish_elephants$Internal_Model$element,
					_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
					_mdgriffith$stylish_elephants$Internal_Model$asEl,
					_elm_lang$core$Maybe$Nothing,
					{
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
							_mdgriffith$stylish_elephants$Internal_Model$GridPosition(
								{row: row, col: column, width: 1, height: 1})),
						_1: {ctor: '[]'}
					},
					_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
						{
							ctor: '::',
							_0: el,
							_1: {ctor: '[]'}
						}));
			});
		var columnHeader = function (col) {
			var _p21 = col;
			if (_p21.ctor === 'InternalIndexedColumn') {
				return _p21._0.header;
			} else {
				return _p21._0.header;
			}
		};
		var maybeHeaders = function (headers) {
			return A2(
				_elm_lang$core$List$all,
				F2(
					function (x, y) {
						return _elm_lang$core$Native_Utils.eq(x, y);
					})(_mdgriffith$stylish_elephants$Internal_Model$Empty),
				headers) ? _elm_lang$core$Maybe$Nothing : _elm_lang$core$Maybe$Just(
				A2(
					_elm_lang$core$List$indexedMap,
					F2(
						function (col, header) {
							return A3(onGrid, 1, col + 1, header);
						}),
					headers));
		}(
			A2(_elm_lang$core$List$map, columnHeader, config.columns));
		var add = F3(
			function (cell, columnConfig, cursor) {
				var _p22 = columnConfig;
				if (_p22.ctor === 'InternalIndexedColumn') {
					return _elm_lang$core$Native_Utils.update(
						cursor,
						{
							elements: {
								ctor: '::',
								_0: A3(
									onGrid,
									cursor.row,
									cursor.column,
									A2(
										_p22._0.view,
										_elm_lang$core$Native_Utils.eq(maybeHeaders, _elm_lang$core$Maybe$Nothing) ? (cursor.row - 1) : (cursor.row - 2),
										cell)),
								_1: cursor.elements
							},
							column: cursor.column + 1
						});
				} else {
					return _elm_lang$core$Native_Utils.update(
						cursor,
						{
							elements: {
								ctor: '::',
								_0: A3(
									onGrid,
									cursor.row,
									cursor.column,
									_p22._0.view(cell)),
								_1: cursor.elements
							},
							column: cursor.column + 1
						});
				}
			});
		var build = F3(
			function (columns, rowData, cursor) {
				var newCursor = A3(
					_elm_lang$core$List$foldl,
					add(rowData),
					cursor,
					columns);
				return _elm_lang$core$Native_Utils.update(
					newCursor,
					{row: cursor.row + 1, column: 1});
			});
		var children = A3(
			_elm_lang$core$List$foldl,
			build(config.columns),
			{
				elements: {ctor: '[]'},
				row: _elm_lang$core$Native_Utils.eq(maybeHeaders, _elm_lang$core$Maybe$Nothing) ? 1 : 2,
				column: 1
			},
			config.data);
		var _p23 = A2(
			_mdgriffith$stylish_elephants$Internal_Model$getSpacing,
			attrs,
			{ctor: '_Tuple2', _0: 0, _1: 0});
		var sX = _p23._0;
		var sY = _p23._1;
		var template = _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
			_mdgriffith$stylish_elephants$Internal_Model$GridTemplateStyle(
				{
					spacing: {
						ctor: '_Tuple2',
						_0: _mdgriffith$stylish_elephants$Element$px(sX),
						_1: _mdgriffith$stylish_elephants$Element$px(sY)
					},
					columns: A2(
						_elm_lang$core$List$repeat,
						_elm_lang$core$List$length(config.columns),
						_mdgriffith$stylish_elephants$Internal_Model$Fill(1)),
					rows: A2(
						_elm_lang$core$List$repeat,
						_elm_lang$core$List$length(config.data),
						_mdgriffith$stylish_elephants$Internal_Model$Content)
				}));
		return A5(
			_mdgriffith$stylish_elephants$Internal_Model$element,
			_mdgriffith$stylish_elephants$Internal_Model$noStyleSheet,
			_mdgriffith$stylish_elephants$Internal_Model$asGrid,
			_elm_lang$core$Maybe$Nothing,
			{
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Element$width(_mdgriffith$stylish_elephants$Element$fill),
				_1: {ctor: '::', _0: template, _1: attrs}
			},
			_mdgriffith$stylish_elephants$Internal_Model$Unkeyed(
				function () {
					var _p24 = maybeHeaders;
					if (_p24.ctor === 'Nothing') {
						return children.elements;
					} else {
						return A2(_elm_lang$core$Basics_ops['++'], _p24._0, children.elements);
					}
				}()));
	});
var _mdgriffith$stylish_elephants$Element$mapAttribute = _mdgriffith$stylish_elephants$Internal_Model$mapAttr;
var _mdgriffith$stylish_elephants$Element$map = _mdgriffith$stylish_elephants$Internal_Model$map;
var _mdgriffith$stylish_elephants$Element$htmlAttribute = _mdgriffith$stylish_elephants$Internal_Model$Attr;
var _mdgriffith$stylish_elephants$Element$html = _mdgriffith$stylish_elephants$Internal_Model$unstyled;
var _mdgriffith$stylish_elephants$Element$FocusStyle = F3(
	function (a, b, c) {
		return {borderColor: a, backgroundColor: b, shadow: c};
	});
var _mdgriffith$stylish_elephants$Element$Table = F2(
	function (a, b) {
		return {data: a, columns: b};
	});
var _mdgriffith$stylish_elephants$Element$Column = F2(
	function (a, b) {
		return {header: a, view: b};
	});
var _mdgriffith$stylish_elephants$Element$IndexedTable = F2(
	function (a, b) {
		return {data: a, columns: b};
	});
var _mdgriffith$stylish_elephants$Element$IndexedColumn = F2(
	function (a, b) {
		return {header: a, view: b};
	});
var _mdgriffith$stylish_elephants$Element$InternalTable = F2(
	function (a, b) {
		return {data: a, columns: b};
	});
var _mdgriffith$stylish_elephants$Element$Link = F2(
	function (a, b) {
		return {url: a, label: b};
	});
var _mdgriffith$stylish_elephants$Element$Device = F5(
	function (a, b, c, d, e) {
		return {phone: a, tablet: b, desktop: c, bigDesktop: d, portrait: e};
	});
var _mdgriffith$stylish_elephants$Element$InternalColumn = function (a) {
	return {ctor: 'InternalColumn', _0: a};
};
var _mdgriffith$stylish_elephants$Element$table = F2(
	function (attrs, config) {
		return A2(
			_mdgriffith$stylish_elephants$Element$tableHelper,
			attrs,
			{
				data: config.data,
				columns: A2(_elm_lang$core$List$map, _mdgriffith$stylish_elephants$Element$InternalColumn, config.columns)
			});
	});
var _mdgriffith$stylish_elephants$Element$InternalIndexedColumn = function (a) {
	return {ctor: 'InternalIndexedColumn', _0: a};
};
var _mdgriffith$stylish_elephants$Element$indexedTable = F2(
	function (attrs, config) {
		return A2(
			_mdgriffith$stylish_elephants$Element$tableHelper,
			attrs,
			{
				data: config.data,
				columns: A2(_elm_lang$core$List$map, _mdgriffith$stylish_elephants$Element$InternalIndexedColumn, config.columns)
			});
	});

var _mdgriffith$stylish_elephants$Element_Background$gradient = F2(
	function (angle, colors) {
		return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
			A3(
				_mdgriffith$stylish_elephants$Internal_Model$Single,
				A2(
					_elm_lang$core$Basics_ops['++'],
					'bg-gradient-',
					A2(
						_elm_lang$core$String$join,
						'-',
						{
							ctor: '::',
							_0: _mdgriffith$stylish_elephants$Internal_Model$floatClass(angle),
							_1: A2(_elm_lang$core$List$map, _mdgriffith$stylish_elephants$Internal_Model$formatColorClass, colors)
						})),
				'background',
				A2(
					_elm_lang$core$Basics_ops['++'],
					'linear-gradient(',
					A2(
						_elm_lang$core$Basics_ops['++'],
						A2(
							_elm_lang$core$String$join,
							', ',
							{
								ctor: '::',
								_0: A2(
									_elm_lang$core$Basics_ops['++'],
									_elm_lang$core$Basics$toString(angle),
									'rad'),
								_1: A2(_elm_lang$core$List$map, _mdgriffith$stylish_elephants$Internal_Model$formatColor, colors)
							}),
						')'))));
	});
var _mdgriffith$stylish_elephants$Element_Background$tiledY = function (src) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A3(
			_mdgriffith$stylish_elephants$Internal_Model$Single,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'bg-image-',
				_mdgriffith$stylish_elephants$Internal_Model$className(src)),
			'background',
			A2(
				_elm_lang$core$Basics_ops['++'],
				'url(\"',
				A2(_elm_lang$core$Basics_ops['++'], src, '\") repeat-y'))));
};
var _mdgriffith$stylish_elephants$Element_Background$tiledX = function (src) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A3(
			_mdgriffith$stylish_elephants$Internal_Model$Single,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'bg-image-',
				_mdgriffith$stylish_elephants$Internal_Model$className(src)),
			'background',
			A2(
				_elm_lang$core$Basics_ops['++'],
				'url(\"',
				A2(_elm_lang$core$Basics_ops['++'], src, '\") repeat-x'))));
};
var _mdgriffith$stylish_elephants$Element_Background$tiled = function (src) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A3(
			_mdgriffith$stylish_elephants$Internal_Model$Single,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'bg-image-',
				_mdgriffith$stylish_elephants$Internal_Model$className(src)),
			'background',
			A2(
				_elm_lang$core$Basics_ops['++'],
				'url(\"',
				A2(_elm_lang$core$Basics_ops['++'], src, '\") repeat'))));
};
var _mdgriffith$stylish_elephants$Element_Background$uncropped = function (src) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A3(
			_mdgriffith$stylish_elephants$Internal_Model$Single,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'bg-fitted-image-',
				_mdgriffith$stylish_elephants$Internal_Model$className(src)),
			'background',
			A2(
				_elm_lang$core$Basics_ops['++'],
				'url(\"',
				A2(_elm_lang$core$Basics_ops['++'], src, '\") center / contain no-repeat'))));
};
var _mdgriffith$stylish_elephants$Element_Background$image = function (src) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A3(
			_mdgriffith$stylish_elephants$Internal_Model$Single,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'bg-image-',
				_mdgriffith$stylish_elephants$Internal_Model$className(src)),
			'background',
			A2(
				_elm_lang$core$Basics_ops['++'],
				'url(\"',
				A2(_elm_lang$core$Basics_ops['++'], src, '\") center / cover no-repeat'))));
};
var _mdgriffith$stylish_elephants$Element_Background$color = function (clr) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A3(
			_mdgriffith$stylish_elephants$Internal_Model$Colored,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'bg-',
				_mdgriffith$stylish_elephants$Internal_Model$formatColorClass(clr)),
			'background-color',
			clr));
};
var _mdgriffith$stylish_elephants$Element_Background$ToAngle = function (a) {
	return {ctor: 'ToAngle', _0: a};
};
var _mdgriffith$stylish_elephants$Element_Background$ToBottomLeft = {ctor: 'ToBottomLeft'};
var _mdgriffith$stylish_elephants$Element_Background$ToTopLeft = {ctor: 'ToTopLeft'};
var _mdgriffith$stylish_elephants$Element_Background$ToLeft = {ctor: 'ToLeft'};
var _mdgriffith$stylish_elephants$Element_Background$ToBottomRight = {ctor: 'ToBottomRight'};
var _mdgriffith$stylish_elephants$Element_Background$ToTopRight = {ctor: 'ToTopRight'};
var _mdgriffith$stylish_elephants$Element_Background$ToRight = {ctor: 'ToRight'};
var _mdgriffith$stylish_elephants$Element_Background$ToDown = {ctor: 'ToDown'};
var _mdgriffith$stylish_elephants$Element_Background$ToUp = {ctor: 'ToUp'};
var _mdgriffith$stylish_elephants$Element_Background$PxStep = F2(
	function (a, b) {
		return {ctor: 'PxStep', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Element_Background$px = _mdgriffith$stylish_elephants$Element_Background$PxStep;
var _mdgriffith$stylish_elephants$Element_Background$PercentStep = F2(
	function (a, b) {
		return {ctor: 'PercentStep', _0: a, _1: b};
	});
var _mdgriffith$stylish_elephants$Element_Background$ColorStep = function (a) {
	return {ctor: 'ColorStep', _0: a};
};
var _mdgriffith$stylish_elephants$Element_Background$step = _mdgriffith$stylish_elephants$Element_Background$ColorStep;

var _mdgriffith$stylish_elephants$Element_Font$glow = F2(
	function (color, size) {
		return _mdgriffith$stylish_elephants$Internal_Model$TextShadow(
			{
				offset: {ctor: '_Tuple2', _0: 0, _1: 0},
				blur: size * 2,
				color: color
			});
	});
var _mdgriffith$stylish_elephants$Element_Font$shadow = function (_p0) {
	var _p1 = _p0;
	return _mdgriffith$stylish_elephants$Internal_Model$TextShadow(
		{offset: _p1.offset, blur: _p1.blur, color: _p1.color});
};
var _mdgriffith$stylish_elephants$Element_Font$unitalicized = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textUnitalicized);
var _mdgriffith$stylish_elephants$Element_Font$heavy = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textHeavy);
var _mdgriffith$stylish_elephants$Element_Font$extraBold = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textExtraBold);
var _mdgriffith$stylish_elephants$Element_Font$medium = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textMedium);
var _mdgriffith$stylish_elephants$Element_Font$semiBold = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textSemiBold);
var _mdgriffith$stylish_elephants$Element_Font$regular = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textNormalWeight);
var _mdgriffith$stylish_elephants$Element_Font$extraLight = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textExtraLight);
var _mdgriffith$stylish_elephants$Element_Font$hairline = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textThin);
var _mdgriffith$stylish_elephants$Element_Font$light = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textLight);
var _mdgriffith$stylish_elephants$Element_Font$bold = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.bold);
var _mdgriffith$stylish_elephants$Element_Font$italic = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.italic);
var _mdgriffith$stylish_elephants$Element_Font$strike = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.strike);
var _mdgriffith$stylish_elephants$Element_Font$underline = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.underline);
var _mdgriffith$stylish_elephants$Element_Font$justify = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textJustify);
var _mdgriffith$stylish_elephants$Element_Font$center = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textCenter);
var _mdgriffith$stylish_elephants$Element_Font$alignRight = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textRight);
var _mdgriffith$stylish_elephants$Element_Font$alignLeft = _mdgriffith$stylish_elephants$Internal_Model$class(_mdgriffith$stylish_elephants$Internal_Style$classes.textLeft);
var _mdgriffith$stylish_elephants$Element_Font$wordSpacing = function (offset) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A3(
			_mdgriffith$stylish_elephants$Internal_Model$Single,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'word-spacing-',
				_mdgriffith$stylish_elephants$Internal_Model$floatClass(offset)),
			'word-spacing',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(offset),
				'px')));
};
var _mdgriffith$stylish_elephants$Element_Font$letterSpacing = function (offset) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A3(
			_mdgriffith$stylish_elephants$Internal_Model$Single,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'letter-spacing-',
				_mdgriffith$stylish_elephants$Internal_Model$floatClass(offset)),
			'letter-spacing',
			A2(
				_elm_lang$core$Basics_ops['++'],
				_elm_lang$core$Basics$toString(offset),
				'px')));
};
var _mdgriffith$stylish_elephants$Element_Font$size = function (size) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		_mdgriffith$stylish_elephants$Internal_Model$FontSize(size));
};
var _mdgriffith$stylish_elephants$Element_Font$external = function (_p2) {
	var _p3 = _p2;
	return A2(_mdgriffith$stylish_elephants$Internal_Model$ImportFont, _p3.name, _p3.url);
};
var _mdgriffith$stylish_elephants$Element_Font$typeface = _mdgriffith$stylish_elephants$Internal_Model$Typeface;
var _mdgriffith$stylish_elephants$Element_Font$monospace = _mdgriffith$stylish_elephants$Internal_Model$Monospace;
var _mdgriffith$stylish_elephants$Element_Font$sansSerif = _mdgriffith$stylish_elephants$Internal_Model$SansSerif;
var _mdgriffith$stylish_elephants$Element_Font$serif = _mdgriffith$stylish_elephants$Internal_Model$Serif;
var _mdgriffith$stylish_elephants$Element_Font$family = function (families) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A2(
			_mdgriffith$stylish_elephants$Internal_Model$FontFamily,
			A3(_elm_lang$core$List$foldl, _mdgriffith$stylish_elephants$Internal_Model$renderFontClassName, 'font-', families),
			families));
};
var _mdgriffith$stylish_elephants$Element_Font$color = function (fontColor) {
	return _mdgriffith$stylish_elephants$Internal_Model$StyleClass(
		A3(
			_mdgriffith$stylish_elephants$Internal_Model$Colored,
			A2(
				_elm_lang$core$Basics_ops['++'],
				'font-color-',
				_mdgriffith$stylish_elephants$Internal_Model$formatColorClass(fontColor)),
			'color',
			fontColor));
};

var _user$project$ExampleSPA$routeRoot = '#/';
var _user$project$ExampleSPA$path = {about: 'about', contact: 'contat'};
var _user$project$ExampleSPA$routeToString = function (page) {
	var pieces = function () {
		var _p0 = page;
		switch (_p0.ctor) {
			case 'RouteHome':
				return {ctor: '[]'};
			case 'RouteAbout':
				return {
					ctor: '::',
					_0: _user$project$ExampleSPA$path.about,
					_1: {ctor: '[]'}
				};
			default:
				return {
					ctor: '::',
					_0: _user$project$ExampleSPA$path.contact,
					_1: {ctor: '[]'}
				};
		}
	}();
	return A2(
		_elm_lang$core$Basics_ops['++'],
		_user$project$ExampleSPA$routeRoot,
		A2(_elm_lang$core$String$join, '/', pieces));
};
var _user$project$ExampleSPA$inLineStyle = F2(
	function (name, value) {
		return _mdgriffith$stylish_elephants$Element$htmlAttribute(
			_elm_lang$html$Html_Attributes$style(
				{
					ctor: '::',
					_0: {ctor: '_Tuple2', _0: name, _1: value},
					_1: {ctor: '[]'}
				}));
	});
var _user$project$ExampleSPA$init = F2(
	function (flag, location) {
		return {
			ctor: '_Tuple2',
			_0: {
				location: location,
				mode: flag.mode,
				windowSize: {width: flag.width, height: flag.height}
			},
			_1: _elm_lang$core$Platform_Cmd$none
		};
	});
var _user$project$ExampleSPA$update = F2(
	function (msg, model) {
		var _p1 = msg;
		if (_p1.ctor === 'MsgChangeWindowSize') {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{windowSize: _p1._0}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		} else {
			return {
				ctor: '_Tuple2',
				_0: _elm_lang$core$Native_Utils.update(
					model,
					{location: _p1._0}),
				_1: _elm_lang$core$Platform_Cmd$none
			};
		}
	});
var _user$project$ExampleSPA$viewPageAbout = function (_p2) {
	return A2(
		_mdgriffith$stylish_elephants$Element$el,
		{
			ctor: '::',
			_0: _mdgriffith$stylish_elephants$Element$width(_mdgriffith$stylish_elephants$Element$fill),
			_1: {
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Element$height(_mdgriffith$stylish_elephants$Element$fill),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Element_Background$image('images/back-couple.jpg'),
					_1: {ctor: '[]'}
				}
			}
		},
		_mdgriffith$stylish_elephants$Element$none);
};
var _user$project$ExampleSPA$viewPageContact = function (_p3) {
	return A2(
		_mdgriffith$stylish_elephants$Element$el,
		{
			ctor: '::',
			_0: _mdgriffith$stylish_elephants$Element$width(_mdgriffith$stylish_elephants$Element$fill),
			_1: {
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Element$height(_mdgriffith$stylish_elephants$Element$fill),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Element_Background$image('images/back-bridge.jpg'),
					_1: {ctor: '[]'}
				}
			}
		},
		_mdgriffith$stylish_elephants$Element$none);
};
var _user$project$ExampleSPA$viewPageHome = function (_p4) {
	return A2(
		_mdgriffith$stylish_elephants$Element$el,
		{
			ctor: '::',
			_0: _mdgriffith$stylish_elephants$Element$width(_mdgriffith$stylish_elephants$Element$fill),
			_1: {
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Element$height(_mdgriffith$stylish_elephants$Element$fill),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Element_Background$image('images/back-foliage.jpg'),
					_1: {ctor: '[]'}
				}
			}
		},
		_mdgriffith$stylish_elephants$Element$none);
};
var _user$project$ExampleSPA$Flag = F3(
	function (a, b, c) {
		return {width: a, height: b, mode: c};
	});
var _user$project$ExampleSPA$Model = F3(
	function (a, b, c) {
		return {location: a, windowSize: b, mode: c};
	});
var _user$project$ExampleSPA$MsgChangeWindowSize = function (a) {
	return {ctor: 'MsgChangeWindowSize', _0: a};
};
var _user$project$ExampleSPA$subscriptions = function (_p5) {
	return _elm_lang$core$Platform_Sub$batch(
		{
			ctor: '::',
			_0: _elm_lang$window$Window$resizes(_user$project$ExampleSPA$MsgChangeWindowSize),
			_1: {ctor: '[]'}
		});
};
var _user$project$ExampleSPA$MsgChangeLocation = function (a) {
	return {ctor: 'MsgChangeLocation', _0: a};
};
var _user$project$ExampleSPA$RouteContact = {ctor: 'RouteContact'};
var _user$project$ExampleSPA$RouteAbout = {ctor: 'RouteAbout'};
var _user$project$ExampleSPA$RouteHome = {ctor: 'RouteHome'};
var _user$project$ExampleSPA$viewMenu = function (model) {
	return A2(
		_mdgriffith$stylish_elephants$Element$row,
		{
			ctor: '::',
			_0: _mdgriffith$stylish_elephants$Element$alpha(0.5),
			_1: {
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Element$spacing(10),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Element$padding(10),
					_1: {ctor: '[]'}
				}
			}
		},
		{
			ctor: '::',
			_0: A2(
				_mdgriffith$stylish_elephants$Element$link,
				{ctor: '[]'},
				{
					url: _user$project$ExampleSPA$routeToString(_user$project$ExampleSPA$RouteHome),
					label: _mdgriffith$stylish_elephants$Element$text('Home')
				}),
			_1: {
				ctor: '::',
				_0: A2(
					_mdgriffith$stylish_elephants$Element$link,
					{ctor: '[]'},
					{
						url: _user$project$ExampleSPA$routeToString(_user$project$ExampleSPA$RouteAbout),
						label: _mdgriffith$stylish_elephants$Element$text('About')
					}),
				_1: {
					ctor: '::',
					_0: A2(
						_mdgriffith$stylish_elephants$Element$link,
						{ctor: '[]'},
						{
							url: _user$project$ExampleSPA$routeToString(_user$project$ExampleSPA$RouteContact),
							label: _mdgriffith$stylish_elephants$Element$text('Contact')
						}),
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Element$text(
							_elm_lang$core$Basics$toString(model.windowSize.width)),
						_1: {
							ctor: '::',
							_0: _mdgriffith$stylish_elephants$Element$text(
								_elm_lang$core$Basics$toString(model.windowSize.height)),
							_1: {
								ctor: '::',
								_0: _mdgriffith$stylish_elephants$Element$text(model.mode),
								_1: {ctor: '[]'}
							}
						}
					}
				}
			}
		});
};
var _user$project$ExampleSPA$route = _evancz$url_parser$UrlParser$oneOf(
	{
		ctor: '::',
		_0: A2(
			_evancz$url_parser$UrlParser$map,
			_user$project$ExampleSPA$RouteHome,
			_evancz$url_parser$UrlParser$s('')),
		_1: {
			ctor: '::',
			_0: A2(
				_evancz$url_parser$UrlParser$map,
				_user$project$ExampleSPA$RouteAbout,
				_evancz$url_parser$UrlParser$s(_user$project$ExampleSPA$path.about)),
			_1: {
				ctor: '::',
				_0: A2(
					_evancz$url_parser$UrlParser$map,
					_user$project$ExampleSPA$RouteContact,
					_evancz$url_parser$UrlParser$s(_user$project$ExampleSPA$path.contact)),
				_1: {ctor: '[]'}
			}
		}
	});
var _user$project$ExampleSPA$maybeRoute = function (location) {
	return _elm_lang$core$String$isEmpty(location.hash) ? _elm_lang$core$Maybe$Just(_user$project$ExampleSPA$RouteHome) : A2(_evancz$url_parser$UrlParser$parseHash, _user$project$ExampleSPA$route, location);
};
var _user$project$ExampleSPA$viewBody = function (model) {
	var _p6 = _user$project$ExampleSPA$maybeRoute(model.location);
	if (_p6.ctor === 'Just') {
		var _p7 = _p6._0;
		switch (_p7.ctor) {
			case 'RouteAbout':
				return _user$project$ExampleSPA$viewPageAbout(model);
			case 'RouteContact':
				return _user$project$ExampleSPA$viewPageContact(model);
			default:
				return _user$project$ExampleSPA$viewPageHome(model);
		}
	} else {
		return _user$project$ExampleSPA$viewPageHome(model);
	}
};
var _user$project$ExampleSPA$view = function (model) {
	return A2(
		_mdgriffith$stylish_elephants$Element$layout,
		{
			ctor: '::',
			_0: _mdgriffith$stylish_elephants$Element_Font$family(
				{
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Element_Font$external(
						{name: 'Space Mono', url: 'https://fonts.googleapis.com/css?family=Space+Mono'}),
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Element_Font$sansSerif,
						_1: {ctor: '[]'}
					}
				}),
			_1: {
				ctor: '::',
				_0: _mdgriffith$stylish_elephants$Element_Font$size(16),
				_1: {
					ctor: '::',
					_0: _mdgriffith$stylish_elephants$Element_Font$color(
						A3(_elm_lang$core$Color$rgb, 51, 51, 51)),
					_1: {
						ctor: '::',
						_0: _mdgriffith$stylish_elephants$Element_Background$color(_elm_lang$core$Color$white),
						_1: {ctor: '[]'}
					}
				}
			}
		},
		A2(
			_mdgriffith$stylish_elephants$Element$column,
			{ctor: '[]'},
			{
				ctor: '::',
				_0: _user$project$ExampleSPA$viewMenu(model),
				_1: {
					ctor: '::',
					_0: _user$project$ExampleSPA$viewBody(model),
					_1: {ctor: '[]'}
				}
			}));
};
var _user$project$ExampleSPA$main = A2(
	_elm_lang$navigation$Navigation$programWithFlags,
	_user$project$ExampleSPA$MsgChangeLocation,
	{init: _user$project$ExampleSPA$init, view: _user$project$ExampleSPA$view, update: _user$project$ExampleSPA$update, subscriptions: _user$project$ExampleSPA$subscriptions})(
	A2(
		_elm_lang$core$Json_Decode$andThen,
		function (height) {
			return A2(
				_elm_lang$core$Json_Decode$andThen,
				function (mode) {
					return A2(
						_elm_lang$core$Json_Decode$andThen,
						function (width) {
							return _elm_lang$core$Json_Decode$succeed(
								{height: height, mode: mode, width: width});
						},
						A2(_elm_lang$core$Json_Decode$field, 'width', _elm_lang$core$Json_Decode$int));
				},
				A2(_elm_lang$core$Json_Decode$field, 'mode', _elm_lang$core$Json_Decode$string));
		},
		A2(_elm_lang$core$Json_Decode$field, 'height', _elm_lang$core$Json_Decode$int)));

var Elm = {};
Elm['ExampleSPA'] = Elm['ExampleSPA'] || {};
if (typeof _user$project$ExampleSPA$main !== 'undefined') {
    _user$project$ExampleSPA$main(Elm['ExampleSPA'], 'ExampleSPA', {"types":{"unions":{"ExampleSPA.Msg":{"args":[],"tags":{"MsgChangeWindowSize":["{ width : Int, height : Int }"],"MsgChangeLocation":["Navigation.Location"]}}},"aliases":{"Navigation.Location":{"args":[],"type":"{ href : String , host : String , hostname : String , protocol : String , origin : String , port_ : String , pathname : String , search : String , hash : String , username : String , password : String }"}},"message":"ExampleSPA.Msg"},"versions":{"elm":"0.18.0"}});
}

if (typeof define === "function" && define['amd'])
{
  define([], function() { return Elm; });
  return;
}

if (typeof module === "object")
{
  module['exports'] = Elm;
  return;
}

var globalElm = this['Elm'];
if (typeof globalElm === "undefined")
{
  this['Elm'] = Elm;
  return;
}

for (var publicModule in Elm)
{
  if (publicModule in globalElm)
  {
    throw new Error('There are two Elm modules called `' + publicModule + '` on this page! Rename one of them.');
  }
  globalElm[publicModule] = Elm[publicModule];
}

}).call(this);

