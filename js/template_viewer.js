W = W || {};
W.App = W.App || {};

W.App.VIEW_PARAM_NAME = 'viewMode';
W.App.VIEW_MODE_DESKTOP = 'desktop'
W.App.VIEW_MODE_MOBILE = 'mobile';
W.App.DEFAULT_VIEW_MODE = W.App.VIEW_MODE_DESKTOP;
W.App.Bi = W.App.Bi || {};
W.App.Bi.EDIT_TEMPLATE_EVENT_ID = 15;
W.App.Bi.TOGGLE_TO_MOBILE_VIEW_EVENT_ID = 27;
W.App.Bi.TOGGLE_TO_DESKTOP_VIEW_EVENT_ID = 28;
W.App.SCROLLBAR_DELAYED_ACTION_TIMEOUT = 500;

document.body.style.overflow = 'hidden';

$(document).ready(function () {

    //Storing Parameters in headerTxt
    StoringParams();

    // Set the selected tab according to the view param
    setSelectedViewModeTab();

    // Set the same document domain as the editor preview
    fixDocumentDomain();

    // Change iFrame Height
    changeFrameHeight();

    // Change main navigation margin
    /*changeMainNavigationLeftMargin();*/

    //Change Header Text For Small Screens
    ChangeHeaderTextForSmallScreens();

    //Read More on Click
    $('#readMore').click(function (e) {
        e.preventDefault();
        DisplayPopUp();
        reportReadMoreClick();
    });

    //Close Pop Up Dialog Box
    $('#close-pop-up-button').click(function () {
        var duration;
        if ($.browser.msie) {
            duration = 0;
        } else {
            duration = 350;
        }
        $('#dialog-overlay').animate({opacity:0}, duration, function () {
            $(this).hide()
        });
        $('#dialog-box').animate({opacity:0}, duration, function () {
            $(this).hide()
        });
    });

    //Add Class for Go Back link
    $('#backLink').hover(
        function () {
            $(this).addClass("onHover");

        },
        function () {
            $(this).removeClass("onHover");

        });

    // assign Links To Edit And Back
    assignLinksToEditAndBack();

    $(window).resize(function () {

        // Change iFrame Height
        changeFrameHeight();

        // Change main navigation margin
        /*changeMainNavigationLeftMargin();*/

        //Change Header Text For Small Screens
        ChangeHeaderTextForSmallScreens();

    });

    //Small Social Buttons For SmallS creens
    SmallSocialButtonsForSmallScreens();

    //ABtest
    /*InitAbTest();*/

    bindModeToggleButtons();

    initMobileScrollbar();
});

function fixDocumentDomain() {
    var domainComponents =  document.domain.split('.');
    if (domainComponents.length >= 2) {
//        document.domain = domainComponents[domainComponents.length - 2] + '.' + domainComponents[domainComponents.length -1];
    }
}

function reportReadMoreClick(){
    var params = [];
    params.push('evid=19');
    var url = W.App.CLIENT_CONFIG.biServerUrl + '&' + params.join('&');
    new Image(0, 0).src = url;
}

//Storing Parameters in headerTxt
function StoringParams() {
    headerTxt.mainHeader = $('#templatesName').html();
    headerTxt.editButton = $('#editButton').html();
}

// Small Social Buttons For SmallS creens
function SmallSocialButtonsForSmallScreens() {
    if ($(document).width() <= 1024) {
        $('.addthis_toolbox').removeClass('addthis_32x32_style');
        $('.addthis_button_google_plusone_badge').find('img').addClass('.smallIcon');
    }
};

function DisplayPopUp() {

    // get the screen height and width
    var maskHeight = $(document).height();
    var maskWidth = $(window).width();

    // calculate the values for center alignment
    var dialogTop = (maskHeight / 2) - ($('#dialog-box').height() / 2);
    var dialogLeft = (maskWidth / 2) - ($('#dialog-box').width() / 2);

    // assign values to the overlay and dialog box
    $('#dialog-overlay').css({height:maskHeight, width:maskWidth, margin:'50px 0 0 0', opacity:'0'}).show().animate({opacity:0.8}, 350);
    $('#dialog-box').css({top:dialogTop, left:dialogLeft, opacity:'0'}).show().animate({opacity:1}, 350);
}

// Change main navigation margin
function changeMainNavigationLeftMargin() {
    $('#header .templatesButtons').css('margin-left', ((($(document).width() - $('#header .templatesButtons').width()) / 2)) + 'px');
}

function setSelectedViewModeTab() {
  $('.view-mode-toggle-button').removeClass('selected');
  $('.view-mode-toggle-button-' + W.App.currentViewMode).addClass('selected');
}

// Change iFrame Height
function changeFrameHeight() {
    var contentHeight = $(window).height() - $('div#header').height() - 2;
    $('.contentWrapper .preview-tab:visible').css('height', contentHeight + "px");
}

// assign Links To Edit And Back
function assignLinksToEditAndBack() {
    $('#backButton').click(function (e) {
        e.preventDefault();
        window.location.href = backUrl;
    });

    $('#dialog-edit-now, #editButton').click(function (e) {
        e.preventDefault();
        var senderId = $(this).attr('id');
        var origin = 'viewer_top';
        if(senderId == 'dialog-edit-now'){
            origin = 'viewer_more';
        }
        var uuid = randomUUID();
        reportBiTemplateEdit(editUrl, uuid, origin);
        var fullEditUrl = editUrl + "&editorSessionId=" + uuid;

        if (openAsTab) {
            openUrlInTab(fullEditUrl);
        } else {
            openUrlNoMenu(fullEditUrl);
        }

    });

}

function reportBiTemplateEdit(editUrl, uuid, origin) {
    var params = [];

    var urlParams = getQueryParams(document.location.search);

    params.push('esi=' + uuid);
    params.push('galleryDocIndex=' + galleryDocIndex);
    params.push('origin=' + origin);
    params.push('book=' + urlParams.bookName);

    reportBiEvent(W.App.Bi.EDIT_TEMPLATE_EVENT_ID, params);
}

function reportBiEvent(eventId, params) {
    params = params || [];
    params.push('eventID=' + eventId);

    var url = W.App.CLIENT_CONFIG.biServerUrl + '&' + params.join('&');
    new Image(0, 0).src = url;
}

function openUrlNoMenu(url) {
    try {
        var popupBlocked = false;
        var screenSize = getPhysicalScreenDimensions();
        var win = window.open(url, '_blank', "resizable=yes,menubar=no,status=no,titlebar=no,toolbar=no,scrollbars=1,channelmode=yes,width=" + screenSize.width + ",height=" + screenSize.height);
        if (!win || win.closed || typeof win.closed == 'undefined') {
            popupBlocked = true;
        } else {
            win.focus();
        }
        if (popupBlocked) {
            win = window.open(url, '_blank');
        }
        return true;
    } catch (e) {
        //logError("VIEWER", "openUrlNoMenu", e.message, url, "basic.js");
        return false;
    }
}

function openUrlInTab(url) {
    var win = window.open(url, '_blank');
    return true;
}

function getPhysicalScreenDimensions() {
    var winW = 1024, winH = 768;
    try {
        winW = screen.availWidth;
        winH = screen.availHeight;
        if (typeof winW == "undefined") {
            winW = 1024;
        }
        if (typeof winH == "undefined") {
            winH = 768;
        }
    } catch (e) {
        winW = 1024;
        winH = 768;
    }
    return {width:(winW ), height:(winH )};
}

//Change Header Text For Small Screens
function ChangeHeaderTextForSmallScreens() {
    var HEADER_TEXT_SHORTEN_WIDTH = 990,
      HEADER_BUTTON_SHORTEN_WIDTH = 1275;

    if (W.Globals.lang === 'ru' || W.Globals.lang === 'ja') {
      HEADER_TEXT_SHORTEN_WIDTH = 1225;
      HEADER_BUTTON_SHORTEN_WIDTH = 1410;
    }

    if ($(document).width() <= HEADER_TEXT_SHORTEN_WIDTH) {
        $('#templatesName').html(headerTxt.mainHeaderSmall);
    } else {
        $('#templatesName').html(headerTxt.mainHeader);
    }
    if ($(document).width() <= HEADER_BUTTON_SHORTEN_WIDTH) {
        $('#editButton').html(headerTxt.editButtonSmall).append('<span></span>');
    } else {
        $('#editButton').html(headerTxt.editButton);
    }
}

function getQueryParams(qs) {
    qs = qs.split("+").join(" ");

    var params = {}, tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])]
            = decodeURIComponent(tokens[2]);
    }

    return params;
}

//ABtest
function InitAbTest() {
    if (getParameterByName('abTest') == 'b') {
        $('.templatesButtons').addClass('abTest');
    }
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.search);
    if (results == null)
        return "";
    else
        return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function setLocationQueryParameter(key, val) {
  var encodedVal = encodeURIComponent(val);
  if (getParameterByName(key)) {
    window.location.search = window.location.search.replace(new RegExp(key + '=\\w+'), key + '=' + encodedVal);
  } else {
    window.location.search += '&' + key + '=' + encodedVal;
  }
}

function bindModeToggleButtons() {
    $('.view-mode-toggle-button').click(function() {
        var toMode = $(this).attr('data');
        if (toMode !== W.App.currentViewMode) {
          reportBiEvent(W.App.Bi['TOGGLE_TO_' + toMode.toUpperCase() + '_VIEW_EVENT_ID']);
          // timeout so that the bi event will be sent before the navigation to the new URL
          setTimeout(function() {
            setLocationQueryParameter(W.App.VIEW_PARAM_NAME, toMode);
          }, 100);
        }
    });
}

function initMobileScrollbar() {
  if (W.App.currentViewMode === W.App.VIEW_MODE_MOBILE && CustomScrollbar) {
    var iframeSelector = '.mobile-view-container iframe';
    var iframeElement = $(iframeSelector);
    var isScrollbarInit = false;
    var delayedAction, actionTimeout;

    window.addEventListener("message", function(event) {
      // init the scrollbar only after the preview has loaded
      // we can't tell exactly when that happens so we wait for a burst of post messages
      // and init the scrollbar/update it only after the burst ends
      if (event.origin.indexOf(document.domain) >-1) {
        // new message arrived, clear the timeout
        if (actionTimeout) {
          clearTimeout(actionTimeout);
        };

        // decide which action needs to be done (init/reset)
        if (!isScrollbarInit) {
          delayedAction = function() {
            var styleOverrides = {
              'height'     : iframeElement.height(),
              'top'        : iframeElement.position().top + 17,
              'left'       : '50%',
              'margin-left': iframeElement.width() / 2 + 24
            };
            CustomScrollbar.initialize({
              scrollbarElement: '#mobile-scrollbar'
            });
            CustomScrollbar.setScrollingElement(iframeSelector);
            CustomScrollbar.setStyleOverrides(styleOverrides);
            isScrollbarInit = true;
          };
        } else {
          delayedAction = function() {
            CustomScrollbar._resetScrollSizeAndPosition();
          };
        }

        // set the timeout with the next action
        actionTimeout = setTimeout(delayedAction, W.App.SCROLLBAR_DELAYED_ACTION_TIMEOUT);
      }
    }, false);

  }
}