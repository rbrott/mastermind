// a lil' polyfill
Array.prototype.equals = function(other) {
  if (!(other instanceof Array)) return false;
  if (other.length !== this.length) return false;
  for (var i = 0; i < this.length; i++) {
    var a = this[i],
        b = other[i];
    if (a instanceof Array && b instanceof Array) {
      if (!a.equals(b)) {
        return false;
      }
    } else if (a !== b) {
      return false;
    }
  }
  return true;
};
Array.prototype.contains = function(item) {
  for (var i = 0; i < this.length; i++) {
    var a = this[i];
    if (a instanceof Array && item instanceof Array && a.equals(item)) {
      return true;
    } else if (a === item) {
      return true;
    }
  }
  return false;
};
Array.prototype.remove = function(item) {
  for (var i = 0; i < this.length; i++) {
    if (item instanceof Array && this[i].equals(item)) {
      this.splice(i, 1);
      return;
    } else if (item === this[i]) {
      this.splice(i, 1);
      return;
    }
  }
};
Array.prototype.clone = function() {
  var a = Array(this.length);
  for (var i = 0; i < this.length; i++) {
    var item = this[i];
    if (item instanceof Array) {
      a[i] = item.clone();
    } else {
      a[i] = item;
    }
  }
  return a;
};

function avg(nums) {
  var total = 0;
  for (var i = 0; i < nums.length; i++) {
    total += nums[i];
  }
  return total / nums.length;
}

function max(list, fn) {
  var dup = false;
  fn = fn || function(x) { return x; };
  var max_ = Number.NEGATIVE_INFINITY, maxIndex = 0;
  for (var i = 0; i < list.length; i++) {
    var val = fn(list[i]);
    if (val > max_) {
      max_ = val;
      maxIndex = i;
      dup = false;
    } else if (val == max_) {
      dup = true;
    }
  }
  if (dup) console.log(list);
  return maxIndex;
}

function min(list, fn) {
  fn = fn || function(x) { return x; };
  return max(list, function(a) {
    return -fn(a);
  });
}

function powInt(a, b) {
  var result = 1;
  for (var i = 0; i < b; i++) {
    result *= a;
  }
  return result;
}

function generatePermutations(numColors, numSlots) {
  var arr = [];
  var len = powInt(numColors, numSlots);
  for (var i = 0; i < len; i++) {
    arr.push([]);
  }
  var inc = len;
  while (inc > 1) {
    inc /= numColors;
    var color = -1;
    for (i = 0; i < len; i++) {
      if (i % inc === 0) {
        color = (color + 1) % numColors;
      }
      arr[i].push(color);
    }
  }
  return arr;
}

function checkSequences(a, b) {
  // check for blacks
  var blackIndices = [];
  for (var i = 0; i < a.length; i++) {
    if (a[i] === b[i]) {
      blackIndices.push(i);
    }
  }
  // check for whites
  var whiteIndices = [];
  for (var j = 0; j < a.length; j++) {
    for (var k = 0; k < a.length; k++) {
      if (blackIndices.contains(j) || blackIndices.contains(k)) continue;
      if (a[j] === b[k] && !whiteIndices.contains(k)) {
        whiteIndices.push(k);
        break;
      }
    }
  }
  return [blackIndices.length, whiteIndices.length];
}

function randomSequence(numColors, numSlots) {
  var temp = [];
  for (var i = 0; i < numSlots; i++) {
    temp.push(Math.floor(Math.random() * numColors));
  }
  return temp;
}

function filterPossibilities(poss, seq, result) {
  var i = 0;
  while (i < poss.length) {
    if (checkSequences(seq, poss[i]).equals(result)) {
      i++;
    } else {
      poss.splice(i, 1);
    }
  }
}

var Game = function(opts) {
  // options
  opts = opts || {};
  this.opts = {
    numColors: 6,
    numSlots: 4,
    numSequences: 10,
    wellRadius: 20,
    buttonRadius: 10,
    padding: 10,
    borderRadius: 15,
    bgColor: "#efefef",
    circleColor: "#dedede",
    colors: [
      "rgb(204, 41, 41)",
      "rgb(249, 147, 12)",
      "rgb(231, 216, 15)",
      "rgb(63, 190, 47)",
      "rgb(64, 92, 241)",
      "rgb(171, 60, 204)"
    ]
  };
  for (var key in opts) {
    if (opts.hasOwnProperty(key)) {
      this.opts[key] = opts[key];
    }
  }
  // instance variables
  this.sequences = [];
  this.currentSequence = [];
  this.currentIndex = 0;
  // actual sequence
  this.generateSequence();
  // snap
  this.initRender();
};
Game.prototype.generateSequence = function() {
  this.actualSeq = randomSequence(this.opts.numColors, this.opts.numSlots);
};
Game.prototype.initRender = function() {
  var o = this.opts,
      sqWidth = 2 * (o.padding + o.wellRadius),
      totalSeqWidth = o.numSlots * sqWidth,
      buttonWidth = o.padding + 2 * o.buttonRadius,
      totalButtonWidth = o.numSlots * buttonWidth,
      totalColorsWidth = sqWidth,
      totalWidth = totalSeqWidth + totalButtonWidth + totalColorsWidth,
      totalHeight = o.numSequences * sqWidth,
      offX = o.padding,
      offY = o.padding,
      width = totalWidth + 2 * o.padding,
      height = totalHeight + 2 * o.padding;
  this.width = width;
  this.height = height;
  // <svg> element; note the createElementNS line
  this.el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  this.el.setAttribute("width", width);
  this.el.setAttribute("height", height);
  // paper
  this.paper = Snap(this.el);
  // background rect
  this.bgRect = this.paper.rect(o.padding, o.padding, totalWidth, totalHeight, o.borderRadius, o.borderRadius);
  this.bgRect.attr({
    fill: o.bgColor
  });
  // wells and buttons
  this.wells = [];
  this.buttons = [];
  for (var i = 0; i < o.numSequences; i++) {
    var wellSeq = [],
        buttonSeq = [];
    for (var j = 0; j < o.numSlots; j++) {
      var well = this.paper.circle(offX + sqWidth * (j + 0.5), offY + sqWidth * (i + 0.5), o.wellRadius);
      well.click(Game.prototype.onWellClick.bind(this, i, j));
      wellSeq.push(well);
      var button = this.paper.circle(offX + totalSeqWidth + buttonWidth * (j + 0.5), offY + sqWidth * (i + 0.5), o.buttonRadius);
      buttonSeq.push(button);
    }
    this.wells.push(wellSeq);
    this.buttons.push(buttonSeq);
  }
  // colors
  offX += totalSeqWidth + totalButtonWidth;
  this.colors = [];
  for (i = 0; i < o.numColors; i++) {
    var color = this.paper.circle(offX + sqWidth / 2, offY + (i + 0.5) * sqWidth, o.wellRadius);
    color.attr({
      fill: o.colors[i]
    });
    color.click(Game.prototype.onColorClick.bind(this, i));
    this.colors.push(color);
  }
  this.clear();
};
Game.prototype.attach = function(el) {
  el.appendChild(this.el);
};
Game.prototype.onWellClick = function(i, j, evt) {
  if (i == this.sequences.length) {
    for (var k = 0; k < this.wells[i].length; k++) {
      this.wells[i][k].attr({
        fill: this.opts.circleColor
      });
    }
    this.currentSequence.splice(j, 1);
    var temp = this.currentSequence;
    this.currentSequence = [];
    this.playSequence(temp);
  }
};
Game.prototype.onColorClick = function(index, evt) {
  if (this.finished) return;
  // if ((this.currentIndex) === this.opts.numSequences && this.currentSequence.length === 0) {
  //   this.clear();
  // }
  if (evt) {
    evt.preventDefault();
    evt.stopPropagation();
  }
  this.wells[this.currentIndex][this.currentSequence.length].attr({
    fill: this.opts.colors[index]
  });
  this.currentSequence.push(index);
  if (this.currentSequence.length === this.opts.numSlots) {
    var seq = this.currentSequence;
    this.sequences.push(seq);
    var result = checkSequences(this.actualSeq, seq);
        blacks = result[0],
        total = blacks + result[1];
    for (var i = 0; i < total; i++) {
      if (i < blacks) {
        this.buttons[this.currentIndex][i].attr({
          fill: "#000000"
        });
      } else {
        this.buttons[this.currentIndex][i].attr({
          fill: "#ffffff"
        });
      }
    }
    if (blacks === 4) this.finished = true;
    this.currentIndex++;
    this.currentSequence = [];
    if (this.currentIndex === this.opts.numSequences) {
      var tempSeqs = this.sequences.clone();
      tempSeqs.splice(0, 1);
      var this_ = this;
      setTimeout(function() {
        this_.clear();
        for (var i = 0; i < tempSeqs.length; i++) {
          this_.playSequence(tempSeqs[i]);
        }
      }, 500);
    }
    return result;
  }
  return null;
};
Game.prototype.restart = function() {
  this.clear();
  this.generateSequence();
};
Game.prototype.reveal = function() {
  this.playSequence(this.actualSeq);
};
Game.prototype.playSequence = function(seq) {
  while (this.currentSequence.length !== 0) {
    this.onColorClick(0);
  }
  var ret;
  for (var i = 0; i < seq.length; i++) {
    ret = this.onColorClick(seq[i]);
  }
  return ret;
};
Game.prototype.clear = function() {
  var o = this.opts;
  this.currentIndex = 0;
  this.currentSequence = [];
  this.sequences = [];
  this.finished = false;
  for (var i = 0; i < this.wells.length; i++) {
    for (var j = 0; j < this.wells[0].length; j++) {
      this.wells[i][j].attr({
        fill: o.circleColor
      });
      this.buttons[i][j].attr({
        fill: o.circleColor
      });
    }
  }
};
Game.prototype.solve = function() {
  this.clear();
  // permutations
  var poss = generatePermutations(this.opts.numColors, this.opts.numSlots),
      guess = [0, 0, 1, 1],
      results = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [0, 3], [1, 3], [0, 4]];
  while (!this.finished) {
    var result = this.playSequence(guess),
        nums = [];
    filterPossibilities(poss, guess, result);
    for (var i = 0; i < poss.length; i++) {
      var p = poss[i],
          vals = [];
      for (var j = 0; j < results.length; j++) {
        var tempList = poss.clone();
        filterPossibilities(tempList, p, results[j]);
        vals.push(tempList.length);
      }
      nums.push(vals[max(vals)]);
    }
    guess = poss[min(nums)];
  }
};
