/**
 * Created by Stefano on 08/04/2014.
 */

function BNode() {
	/**
	 * The keys stored it the node.
	 * @type {Array<*>}
	 */
	this.keys = [];
	/**
	 * The items stored in the node.
	 * @type {Array<*>}
	 */
	this.items = [];
	/**
	 * The nodes child of the node.
	 * @type {Array<BNode>}
	 */
	this.childs = [];
}

/**
 * Class for managing a b-tree.
 * @param minimumDegree {number} The minimum number of keys of a node.
 * @constructor
 */
function BTree(minimumDegree) {
	/**
	 * The root of the tree.
	 * @type {BNode}
	 */
	this.root = new BNode();

	/**
	 * The minimum number of the keys of a node.
	 * @type {number}
	 */
	this.t = minimumDegree;
}

/**
 * Insert the item relatives to the key value in the tree.
 * @param key {number} The key to store.
 * @param item {*} The item to store.
 * @return {void}
 */
BTree.prototype.insert = function (key, item) {
	var node = this.root;
	if (node.keys.length === 2 * this.t - 1) {
		var newNode = new BNode();
		newNode.childs.push(node);
		this.root = newNode;
		this.splitChild(newNode, 0);
		node = newNode;
	}
	this.insertNonFull(node, key, item);
};

/**
 * Insert the new node in the right position if the node is not full.
 * @param node {BNode} The node from which start to check the insertion.
 * @param key {number} The key to store.
 * @param item {*} The item to store.
 * @return {void}
 */
BTree.prototype.insertNonFull = function (node, key, item) {
	while (node) {
		var i = node.keys.length - 1;
		if (!node.childs.length) {
			for (; i > -1 && key < node.keys[i]; i--) {
				node.keys[i + 1] = node.keys[i];
				node.items[i + 1] = node.items[i];
			}
			node.keys[i + 1] = key;
			node.items[i + 1] = item;
			return;
		} else {
			var j = 0;
			i++;
			while (j < i) {
				var m = Math.floor((j + i) / 2);
				if (key <= node.keys[m])
					i = m;
				else
					j = m + 1;
			}
			if (node.childs[j].keys.length === 2 * this.t - 1) {
				this.splitChild(node, j);
				if (key > node.keys[j])
					j++;
			}
			node = node.childs[j];
		}
	}
};

/**
 * Search the item relatives to the key.
 * @param key {Number} The key to find.
 * @param [node = root] {RBNode} The node from which start the search.
 * @return {*} The item found or undefined if there isn't the key in the tree.
 */
BTree.prototype.search = function (key, node) {
	node = node || this.root;
	while (node) {
		var n = node.keys.length;
		var i = 0, j = n;
		while (i < j) {
			var m = Math.floor((i + j) / 2);
			if (key <= node.keys[m])
				j = m;
			else
				i = m + 1;
		}
		if (i < n && key === node.keys[i])
			return node.items[i];
		else if (!node.childs.length)
			return undefined;
		else
			node = node.childs[i];
	}
};

/**
 * Split the child of the node at the position index.
 * @param node {BNode} The parent of the child to split.
 * @param index {number} The position of the child to split.
 * @return {void}
 */
BTree.prototype.splitChild = function (node, index) {
	var newNode = new BNode();
	var child = node.childs[index];
	//copy of the last t - 1 keys and items in the new node
	for (var i = 0; i < this.t - 1; i++) {
		newNode.keys[i] = child.keys[i + this.t];
		newNode.items[i] = child.items[i + this.t];
	}
	if (child.childs.length)
	//copy of the last t child in the new node
		for (var j = 0; j < this.t; j++)
			newNode.childs[j] = child.childs[j + this.t];
	//shift the children from index + 1 position
	for (var l = node.keys.length; l > index; l--)
		node.childs[l + 1] = node.childs[l];
	//set the index position as the position t of the child
	node.childs[index + 1] = newNode;
	//shift the keys and the items from index position
	for (var k = node.keys.length - 1; k > index - 1; k--) {
		node.keys[k + 1] = node.keys[k];
		node.items[k + 1] = node.items[k];
	}
	node.keys[index] = child.keys[this.t - 1];
	node.items[index] = child.items[this.t - 1];
	//remove keys, items and child in the old node.
	child.keys.splice(child.keys.length - this.t);
	child.items.splice(child.items.length - this.t);
	child.childs.splice(child.childs.length - this.t);
};

/**
 * Delete the key from the tree.
 * @param key {*} The key to delete.
 * @return {void}
 */
BTree.prototype.deleteKey = function (key) {
	if (this.root.keys.length) {
		this.deleteNonMin(this.root, key);
		if (!this.root.keys.length && this.root.childs.length)
			this.root = this.root.childs[0];
	}
};

BTree.prototype.deleteNonMin = function (node, key) {
	var i = 0, j = node.keys.length;
	while (i < j) {
		var m = Math.floor((i + j) / 2);
		if (key <= node.keys[m])
			j = m;
		else
			i = m + 1;
	}
	//key is in the node
	if (i < node.keys.length && key === node.keys[i]) {
		//the node is a leaf
		if (!node.childs.length) {
			//remove the key
			for (j = i + 1; j < node.keys.length; j++) {
				node.keys[j - 1] = node.keys[j];
				node.items[j - 1] = node.items[j];
			}
			node.keys.pop();
			node.items.pop();
		} else {
			//the node is not a leaf
			//the node has the minimum number of keys
			if (node.childs[i].length === this.t - 1) {
				//increase the number of the keys of the node
				this.augmentChild(node, i);
				if (i === node.keys.length + 1)
					i--;
			}
			//check if the key is moved in the child
			if (node.keys[i] !== key)
				this.deleteNonMin(node.childs[i], key);
			else
				this.deleteMax(node, i);
		}
		//the key is not in the node
	} else {
		//check if the child i has the minimum number of keys
		if (node.childs[i].keys.length === this.t - 1) {
			this.augmentChild(node, i);
			if (i === node.keys.length + 2)
				i--;
		}
		this.deleteNonMin(node.childs[i], key);
	}
};

BTree.prototype.deleteMax = function (node, index) {
	var child = node.childs[index];
	var goAhead = true;
	while (goAhead) {
		if (!child.childs.length) {
			node.keys[index] = child.keys[child.keys.length - 1];
			node.items[index] = child.items[child.items.length - 1];
			child.keys.pop();
			child.items.pop();
			goAhead = false;
		} else {
			var last = child.childs[child.keys.length];
			if (last.keys.length === this.t - 1)
				this.augmentChild(child, child.keys.length);
			child = child.childs[child.keys.length];
		}
	}
};

BTree.prototype.augmentChild = function (node, index) {
	var child = node.childs[index];
	var brother;
	if (index)
		brother = node.childs[index - 1];
	if (index && brother.keys.length > this.t - 1) {
		if (child.childs.length) {
			for (var j = this.keys.length + 1; j > 0; j--)
				child.childs[j] = child.childs[j - 1];
			child.childs[0] = brother.childs[brother.keys.length];
			for (var i = child.keys.length; i > 0; i--) {
				child.keys[i] = child.keys[i - 1];
				child.items[i] = child.items[i - 1];
			}
			child.keys[0] = node.keys[index - 1];
			child.items[0] = node.items[index - 1];
			node.keys[index - 1] = brother.keys[brother.keys.length - 1];
			node.items[index - 1] = brother.items[brother.items.length - 1];
		}
	} else {
		if (index < node.keys.length)
			brother = node.childs[index + 1];
		if (index < node.keys.length && brother.keys.length > this.t - 1) {
			if (brother.childs.length) {
				child.childs[child.keys.length + 1] = brother.childs[0];
				for (var l = 1; l < brother.keys.length + 1; l++)
					brother.childs[l - 1] = brother.childs[l];
				brother.childs.pop();
			}
			child.keys[child.keys.length] = node.keys[index];
			child.items[child.items.length] = node.items[index];
			node.keys[index] = brother.keys[0];
			node.items[index] = brother.items[0];
			for (var k = 1; k < brother.keys.length; k++) {
				brother.keys[k - 1] = brother.keys[k];
				brother.items[k - 1] = brother.items[k];
			}
			brother.keys.pop();
			brother.items.pop();
		} else {
			if (index < node.keys.length) {
				child.keys[this.t - 1] = node.keys[index];
				child.items[this.t - 1] = node.items[index];
				for (var m = index + 2; m < node.keys.length + 1; m++)
					node.childs[m - 1] = node.childs[m];
				node.childs.pop();
				for (var n = index + 1; n < node.keys.length; n++) {
					node.keys[n - 1] = node.keys[n];
					node.items[n - 1] = node.items[n];
				}
				node.keys.pop();
				node.items.pop();
				if (brother.childs.length)
					for (var y = 0; y < brother.keys.length + 1; y++)
						child.childs[this.t + y] = brother.childs[y];
				for (var x = 0; x < brother.keys.length; x++) {
					child.keys[x + this.t] = brother.keys[x];
					child.items[x + this.t] = brother.items[x];
				}
			} else {
				if (brother.childs.length)
					for (var w = 0; w < child.keys.length + 1; w++)
						brother.childs[this.t + w] = child.childs[w];
				brother.keys[this.t - 1] = node.keys[node.keys.length - 1];
				brother.items[this.t - 1] = node.items[node.keys.length - 1];
				for (var z = 0; z < child.keys.length; z++) {
					brother.keys[z + this.t] = child.keys[z];
					brother.items[z + this.t] = child.items[z];
				}
			}
		}
	}
};