/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

/*var UI = require('ui');
var Vector2 = require('vector2');

var main = new UI.Card({
  title: 'Pebble.js',
  icon: 'images/menu_icon.png',
  subtitle: 'Hello World!',
  body: 'Press any button.'
});

main.show();

main.on('click', 'up', function(e) {
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Pebble.js',
        icon: 'images/menu_icon.png',
        subtitle: 'Can do Menus'
      }, {
        title: 'Second Item',
        subtitle: 'Subtitle Text'
      }]
    }]
  });
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
  menu.show();
});

main.on('click', 'select', function(e) {
  var wind = new UI.Window({
    fullscreen: true,
  });
  var textfield = new UI.Text({
    position: new Vector2(0, 65),
    size: new Vector2(144, 30),
    font: 'gothic-24-bold',
    text: 'Text Anywhere!',
    textAlign: 'center'
  });
  wind.add(textfield);
  wind.show();
});

main.on('click', 'down', function(e) {
  var card = new UI.Card();
  card.title('A Card');
  card.subtitle('Is a Window');
  card.body('The simplest window type in Pebble.js.');
  card.show();
});*/

var UI = require('ui');
var ajax = require('ajax');

var dsnDataURL = "http://mdupapis.azurewebsites.net/api/dsn.php";
var dsnData = {};
var uiData = {};

function populateXML(url , async) {
  var returnData;
  ajax( { url: url , type: 'json' , async: async},
    function(data, status, request) {
      console.log('I just updated some data');
      console.log(JSON.stringify(data));
      if ('DSN' in data) {
        dsnData = data;
        populateUIData(data);
        buildAndDisplayUI();
      } else if ('Error' in data) {
        displayError(data.Error);
      } else {
        displayError('Unknown Error');
      }
    },
    function(error, status, request) {
      console.log('The ajax request failed: ' + status.toString());
    }
  );
  return returnData;
}

function displayError(errtxt) {
  var card = new UI.Card({
    title: 'Error',
    body: errtxt
  });
  card.show();
}

function isActiveSignal(link , target) {
  //console.log('Checking signal for "' + target + '" with link: ' + JSON.stringify(link));
  if( Object.prototype.toString.call( link ) === '[object Array]' ) {
    for (var linkI=0 ; linkI < link.length ; linkI++) {
      var curRate = link[linkI];
      //console.log(JSON.stringify(curRate));
      if ((curRate.spacecraft == target) && (!isNaN(curRate.dataRate)) && (parseFloat(curRate.dataRate) > 0)) { return true; }
    }
  } else {
    //console.log(JSON.stringify(link));
    if ((link.spacecraft == target) && (!isNaN(link.dataRate)) && (parseFloat(link.dataRate) > 0)) { return true; }
  }
  return false;
}

function formatDishTarget(dish , target) {
  var retDish = {};
  var uplink = isActiveSignal(dish.upSignal , target.name);
  var downlink = isActiveSignal(dish.downSignal , target.name);
  if ((uplink) || (downlink)) {
    retDish = {
      'name': dish.name,
      'craft': target.name,
      'uplink': uplink,
      'downlink': downlink
    };
  }
  console.log('NEW DISH:  ' + JSON.stringify(retDish));
  return retDish;
}

function formatDish(dish) {
  var retList = [];
  var curDish;
  if( Object.prototype.toString.call( dish.target ) === '[object Array]' ) {
    for (var craftI=0 ; craftI < dish.target.length ; craftI++) {
      curDish = formatDishTarget(dish , dish.target[craftI]);
      if (Object.keys(curDish).length !== 0) { retList.push(curDish); }
    }
  } else {
    curDish = formatDishTarget(dish , dish.target);
    if (Object.keys(curDish).length !== 0) { retList.push(curDish); }
  }
  return retList;
}

function populateUIData(data) {
  var headers = [];
  var dishes = [];
  for (var stationI=0 ; stationI < data.DSN.length ; stationI++) {
    var curLocation = data.DSN[stationI];
    console.log(JSON.stringify(curLocation));
    headers.push(curLocation.station.friendlyName + ' - ' + curLocation.station.name);
    var curDishes = [];
    for (var dishI=0 ; dishI < curLocation.dish.length ; dishI++) {
      console.log('Now looking at dish: ' + JSON.stringify(curLocation.dish[dishI]));
      curDishes = curDishes.concat(formatDish(curLocation.dish[dishI]));
    }
    dishes.push(curDishes);
  }
  //console.log(JSON.stringify(headers));
  //console.log(JSON.stringify(dishes));
  uiData = {
    'headers': headers,
    'dishes': dishes
  };
  console.log('uiDATA: ' + JSON.stringify(uiData));
}

function formatDishList(dishes) {
  var retList = [];
  for (var dishI=0 ; dishI < dishes.length ; dishI++) {
    var curDish = dishes[dishI];
    var itemString = curDish.craft + ' : ';
    if (curDish.uplink) { itemString += 'Up'; }
    if (curDish.downlink) { itemString += 'Dn'; }
    var item = {
      title: itemString,
      subtitle: curDish.name
    };
    retList.push(item);
  }
  return retList;
}

function buildAndDisplayUI() {
  var sectionList = [];
  for (var stationI=0 ; stationI < uiData.headers.length ; stationI++) {
    var section = {
      'title': uiData.headers[stationI],
      'items': formatDishList(uiData.dishes[stationI])
    };
    sectionList.push(section);
    //console.log('SECTION ' + JSON.stringify(section));
  }
  console.log('SECTIONS ' + JSON.stringify(sectionList));
  var dsnMenu = new UI.Menu({
    sections: sectionList
  });
  dsnMenu.show();
}

populateXML(dsnDataURL , true);