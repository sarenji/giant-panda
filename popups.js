(function(global) {

var urls = {};

function loadImage(url) {
  var image, $image;
  image = new Image();
  $image = $(image);
  $image.load(function() {
    $image.hide();
    $image.appendTo($("body"));
    $image.addClass("tooltip");
    urls[url] = $image;
  });
  image.src = url;
}

function getImage(url, callback) {
  if (!(url in urls)) {
    return;
  }

  callback(urls[url]);
}

loadImage("images/icons/bass.png");
loadImage("images/icons/drums.png");
loadImage("images/icons/gtr.png");
loadImage("images/icons/keys.png");
loadImage("images/icons/vol.png");
loadImage("images/icons/vox.png");

global.showImageTooltip = function(event, url) {
  var topPadding = 10;
  getImage(url, function($image) {
    $image.css({
      top: event.clientY - $image.height() - topPadding,
      left: event.clientX - $image.width() / 2
    }).show();
  });
};

global.showTextTooltip = function(event, text) {
  var $tooltip = $("#text_tooltip");
  var topPadding = 20;
  $tooltip.css({
    top: event.clientY - $tooltip.height() - topPadding,
    left: event.clientX - $tooltip.width() / 2 - 10
  }).text(text).show();
};

global.hideTooltips = function() {
  $(".tooltip").hide();
  $("#text_tooltip").hide();
}

})(this);
