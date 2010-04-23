$(begin);

var gameover = false;
var start = 0;
var mines = 10;

function begin(){
  //vars
  var size = 10;
  var d = new Date();
  start = d.getTime();

  //initializing internal matrix
  var matrix = new Array(size);
  for(var i=0; i<matrix.length; i++){
    matrix[i] = new Array(size);
    for(var j=0; j<matrix[i].length; j++){
      matrix[i][j] = {'elem':null, 'n':0};
    }
  }
  setupBombs(mines, matrix);
  calcNumbers(matrix);

  var field = setupField(size,matrix);
  field.appendTo("#field");

  //binding events
  $("td").bind("click", reveal);
  $("#flagpile").draggable({ opacity: 0.7, helper: 'clone' });
  $("td.notRevealed").droppable({
    hoverClass: 'flaghover',
    drop: flag
  });
};

/* puts a flag on cell in question.
 * renders the flag draggable
 * disables clicking
 * returns: void
 */
function flag(e){
  if($(e.target).hasClass("notRevealed") && !$(e.target).hasClass("flagged")){
      $(e.target).addClass("flagged");
      $(e.target).empty().append($("<img src='images/ItsyFlag.png'/>").css("display","hidden").fadeIn("fast"));
      var flaggedCell = e.target;
      $(e.target).unbind("click");
      $($(e.target).children().get(0)).draggable({ revert: false, helper: 'original',
        stop: function() {
          $(this).remove();
          $(flaggedCell).bind("click", reveal);
          $(flaggedCell).removeClass("flagged");
          $(flaggedCell).text("");
        } });
  }
}

/* reveals the tile and takes appropriate action
 * returns: void
 */
function reveal(e){
  $(e.target).unbind("click");
  $(e.target).removeClass("notRevealed");
  $(e.target).addClass("revealed");

  var matrix = $(e.target).data('m');
  var i = $(e.target).data('x');
  var j = $(e.target).data('y');

  if(i && j && matrix){
    var num = matrix[i][j]['n'];
    flipCell(e, num);
    if(num == 9 && !gameover){
      lose();
    } else if(num == 0){
      flipNeighbor(matrix,i-1,j-1);
      flipNeighbor(matrix,i,j-1);
      flipNeighbor(matrix,i+1,j-1);
      flipNeighbor(matrix,i-1,j);
      flipNeighbor(matrix,i+1,j);
      flipNeighbor(matrix,i-1,j+1);
      flipNeighbor(matrix,i,j+1);
      flipNeighbor(matrix,i+1,j+1);
    } else if(isWin(mines) && !gameover){
      win();
    }
  }
}

function lose(){
  gameover = true;
  $("td").unbind("click");
  $("<p> Game Over (click to reset) </p>").bind("click", reset).appendTo("#field");
  //revealing all hidden tiles
  var arr = jQuery.makeArray($("td.notRevealed"));
  for(var i=0; i<arr.length; i++){
    if($(arr[i]).hasClass("notRevealed"))
      reveal({'target':arr[i]});
  }
}

function win(){
  gameover = true;
  var d = new Date();
  var timer = d.getTime() - start;
  $("td").unbind("click");
  $("<p> You Won in "+(Math.round(timer*0.001))+" seconds! (click to reset) </p>").bind("click", reset).appendTo("#field");
  //flagging any remaining mines
  var arr = jQuery.makeArray($("td.notRevealed:not(.flagged)"));
  for(var i=0; i<arr.length; i++){
    flag({'target':$(arr[i])});
  }
}

/* called when user clicks on a 0 cell.
 * checks to make sure a neighbor is valid before revealing it
 * returns: void
 */
function flipNeighbor(matrix,i,j){
  if(matrix[i][j]['elem'] && matrix[i][j]['elem'].hasClass("notRevealed")) 
    reveal({'target':matrix[i][j]['elem']});
}

/* UI calls for revealing a cell
 * returns: void
 */
function flipCell(e, num){
  //cell value
  if(num != 9)
    $(e.target).text(num);
  else
    $(e.target).empty().append("<img src='images/Mine.png'/>");
  //animation sequence
  var pos = $(e.target).position();
  var drop = $("<img src='images/Block.png'/>");
  drop.css("position","absolute").css("top",pos.top).css("left",pos.left).css("z-index","10");
  $(e.target).append(drop);
  drop.fadeOut("fast");
}

/* uses # of mines to determine whether or not a win condition has been met
 * returns: boolean
 */
function isWin(mines){
  var arr = jQuery.makeArray($("td.notRevealed"));
  return arr.length == mines;
}

/* randomly generates mines on the playing field
 * returns: void
 */
function setupBombs(mines, matrix){
  for(var i = 0; i<mines; i++){
    var coords = [Math.round(Math.random()*(matrix.length-3)),
                  Math.round(Math.random()*(matrix.length-3))];

    //prevents bombs from choosing the same coords
    while(matrix[coords[0]+1][coords[1]+1]['n'] == 9){
      coords[0] += Math.round(Math.random()*2-1);
      coords[1] += Math.round(Math.random()*2-1);
      coords[0] = coords[0] % (matrix.length-3);
      coords[1] = coords[1] % (matrix.length-3);
    }
    matrix[coords[0]+1][coords[1]+1]['n'] = 9;
  }
}

/* precalculates the numbers next to the bombs
 * returns: void
 */
function calcNumbers(matrix){
  for(var i = 1; i<matrix.length-1; i++){
    for(var j = 1; j<matrix[i].length-1; j++){
      if(matrix[i][j]['n'] != 9){
        if(matrix[i-1][j-1]['n'] == 9) matrix[i][j]['n']++;
        if(matrix[i][j-1]['n'] == 9) matrix[i][j]['n']++;
        if(matrix[i+1][j-1]['n'] == 9) matrix[i][j]['n']++;
        if(matrix[i-1][j]['n'] == 9) matrix[i][j]['n']++;
        if(matrix[i+1][j]['n'] == 9) matrix[i][j]['n']++;
        if(matrix[i-1][j+1]['n'] == 9) matrix[i][j]['n']++;
        if(matrix[i][j+1]['n'] == 9) matrix[i][j]['n']++;
        if(matrix[i+1][j+1]['n'] == 9) matrix[i][j]['n']++;
      }
    }
  }
}

/* sets up the table on which the game is played
 * returns: Object HTML Table
 */
function setupField(size,matrix){
  var table = $("<table></table>");
  for(var i = 0; i<size; i++){
    var row = $("<tr></tr>");
    table.append(row);
    for(var j = 0; j<size; j++){
      //outer edges are omitted
      if(!j || !i || j == size-1 || i == size-1){
        row.append("<th></th>");
      } else {
        var cell = $("<td></td>").data('x', i).data('y', j);
        cell.data('m', matrix).addClass("notRevealed").addClass("n"+matrix[i][j]['n']);
        matrix[i][j]['elem'] = cell;
        cell.appendTo(row);
      }
    }
  }
  return table;
}

function reset(){
  $("#field").empty();
  gameover = false;
  begin();
}