/**
* Tooltip and Popover Control
*/

/* start-amd-strip-block */
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module
    define(['jquery'], factory);
  } else if (typeof exports === 'object') {
    // Node/CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(jQuery);
  }
}(function($) {
/* end-amd-strip-block */

  $.fn.tooltip = function(options, args) {
    'use strict';

    // Settings and Options
    var pluginName = 'tooltip',
      defaults = {
        content: null, //Takes title attribute or feed content. Can be a function or jQuery markup
        offset: {top: 10, left: 0}, //how much room to leave
        placement: 'top',  //can be top/left/bottom/right/offset
        trigger: 'hover', //supports click and immediate and hover (and maybe in future focus)
        title: null, //Title for Infor Tips
        beforeShow: null, //Call back for ajax tooltip
        popover: null , //force it to be a popover (no content)
        closebutton: null, //Show X close button next to title in popover
        isError: false, //Add error classes
        isErrorColor: false, //Add error color only not description
        tooltipElement: null, // ID selector for an alternate element to use to contain the tooltip classes
        keepOpen: false, // Forces the tooltip to stay open in situations where it would normally close.
        extraClass: null, // Extra css class
        maxWidth: null // Toolip max width
      },
      settings = $.extend({}, defaults, options);

    // Plugin Constructor
    function Tooltip(element) {
      this.settings = $.extend({}, settings);
      this.element = $(element);
      Soho.logTimeStart(pluginName);
      this.init();
      Soho.logTimeEnd(pluginName);
    }

    // Plugin Object
    Tooltip.prototype = {
      init: function() {
        this.setup();
        this.appendTooltip();
        this.handleEvents();
        this.addAria();
        this.isPopover = (settings.content !== null && typeof settings.content === 'object') || settings.popover;
      },

      setup: function() {
        // this.activeElement is the element that the tooltip displays and positions against
        this.activeElement = this.element;

        this.descriptionId = $('.tooltip-description').length + 1;
        this.description = this.element.parent().find('.tooltip-description');
        if (!this.description.length && settings.isError) {
          this.description = $('<span id="tooltip-description-'+ this.descriptionId +'" class="tooltip-description audible"></span>').insertAfter(this.element);
        }

        if (this.element.is('.dropdown, .multiselect')) {
          this.activeElement = this.element.nextAll('.dropdown-wrapper:first').find('>.dropdown');
        }

        settings.closebutton = (settings.closebutton || this.element.data('closebutton')) ? true : false;

        if (this.element.data('extraClass') && this.element.data('extraClass').length) {
          settings.extraClass = this.element.data('extraClass');
        }

        this.isRTL = Locale.isRTL();
      },

      addAria: function() {
        this.content = this.element.attr('title') || settings.content;
        this.description.text(this.content);
        this.content = this.addClassToLinks(this.content, 'links-clickable');

        if (!this.isPopover) {
          this.element.removeAttr('title').attr('aria-describedby', this.description.attr('id'));
        }

        if (this.isPopover && settings.trigger === 'click') {
          this.element.attr('aria-haspopup', true);
        }
      },

      addClassToLinks: function(content, thisClass) {
        var d = $('<div/>').html(content);
        $('a', d).addClass(thisClass);
        return d.html();
      },

      appendTooltip: function() {
        this.tooltip = settings.tooltipElement ? $(settings.tooltipElement) : $('#tooltip');
        if (!this.tooltip.length) {
          var name = (settings.tooltipElement ? settings.tooltipElement.substring(1, settings.tooltipElement.length) : 'tooltip');
          this.tooltip = $('<div class="' + (this.isPopover ? 'popover' : 'tooltip') + ' bottom is-hidden" role="tooltip" id="' + name + '"><div class="arrow"></div><div class="tooltip-content"></div></div>');
        }

        this.tooltip.place({
          container: this.scrollparent,
          parent: this.element,
          placement: this.settings.placement,
          strategy: 'flip'
        });

        this.setTargetContainer();
      },

      handleEvents: function() {
        var self = this, timer, delay = 400;

        if (settings.trigger === 'hover' && !settings.isError) {
          this.element
            .on('mouseenter.tooltip', function() {
              timer = setTimeout(function() {
                self.show();
              }, delay);
            })
            .on('mouseleave.tooltip mousedown.tooltip click.tooltip mouseup.tooltip', function() {
                clearTimeout(timer);
                setTimeout(function() {
                  self.hide();
                }, delay);
            })
            .on('updated.tooltip', function() {
              self.updated();
            });
        }

        if (settings.trigger === 'click') {
          this.element.on('click.tooltip', function() {
            if (self.tooltip.hasClass('is-hidden')) {
              self.show();
            } else {
              self.hide();
            }
          });
        }

        if (settings.trigger === 'immediate') {
          timer = setTimeout(function() {
            if (self.tooltip.hasClass('is-hidden')) {
              self.show();
            } else {
              self.hide();
            }
          }, 1);
        }

        if (settings.trigger === 'focus') {
          this.element.on('focus.tooltip', function() {
            self.show();
          })
          .on('blur.tooltip', function() {
            self.hide();
          });
        }

        this.element.filter('button, a').on('focus.tooltip', function() {
          self.setContent(self.content);
        });

      },

      setContent: function(content) {
        if ((!content || !content.length) && typeof settings.content !== 'function') {
          return false;
        }

        var self = this,
          contentArea,
          specified = false,
          closeBtnX = $('<button type="button" class="btn-icon l-pull-right"><span>Close</span></button>')
                        .prepend($.createIconElement({ classes: ['icon-close'], icon: 'close' }))
                        .css({'margin-top':'-9px'})
                        .on('click', function() {
                          self.hide();
                        });

        content = Locale.translate(content) || content;

        if (content.indexOf('#') === 0) {
          content = $(content).html();
          specified = true;
        }

        if (settings.extraClass && typeof settings.extraClass === 'string') {
          this.tooltip.addClass(settings.extraClass);
        } else {
          this.tooltip.removeAttr('class').addClass('tooltip bottom is-hidden');
        }

        if (this.isPopover) {
          contentArea = this.tooltip.find('.tooltip-content').html(settings.content).removeClass('hidden');
          settings.content.removeClass('hidden');
          this.tooltip.removeClass('tooltip').addClass('popover');

          if (settings.title !== null) {
            var title = this.tooltip.find('.tooltip-title');
            if (title.length === 0) {
              title = $('<div class="tooltip-title"></div>').prependTo(this.tooltip);
            }
            title.html(settings.title).show();
          } else {
            this.tooltip.find('.tooltip-title').hide();
          }

          if (settings.closebutton) {
            $('.tooltip-title', this.tooltip).append(closeBtnX);
          }

          contentArea.initialize();
          return true;

        } else {
          this.tooltip.find('.tooltip-title').hide();
        }

        this.tooltip.removeClass('popover').addClass('tooltip');
        if (typeof settings.content === 'function') {
          content = this.content = settings.content.call(this.element);
          if (!content) {
            return false;
          }
        }

        contentArea = this.tooltip.find('.tooltip-content');

        if (contentArea.prev('.arrow').length === 0) {
          contentArea.before('<div class="arrow"></div>');
        }

        if (specified) {
          contentArea.html(content);
        }
        else {
          contentArea.html('<p>' + (content === undefined ? '(Content)' : content) + '</p>');
        }
        return true;
      },

      // Alias for _show()_.
      open: function() {
        return this.show();
      },

      show: function(newSettings, ajaxReturn) {
        var self = this;
        this.isInPopup = false;

        if (newSettings) {
          settings = newSettings;
        }

        if (settings.beforeShow && !ajaxReturn) {
          var response = function (content) {
            self.content = content;
            self.show(settings, true);
          };

          if (typeof settings.beforeShow === 'string') {
            window[settings.beforeShow](response);
            return;
          }

          settings.beforeShow(response);
          return;
        }

        var okToShow = true;
        okToShow = this.setContent(this.content);
        if (okToShow  === false) {
          return;
        }

        okToShow = this.element.triggerHandler('beforeshow', [this.tooltip]);
        if (okToShow  === false) {
          return;
        }

        this.tooltip.removeAttr('style');
        this.tooltip.removeClass('bottom right left top offset is-error').addClass(settings.placement);

        if (settings.isError || settings.isErrorColor) {
          this.tooltip.addClass('is-error');
        }

        this.position();
        this.element.trigger('show', [this.tooltip]);

        setTimeout(function () {
          $(document).on('mouseup.tooltip', function (e) {

            if (settings.isError || settings.trigger === 'focus') {
             return;
            }

            if ($(e.target).is(self.element) && $(e.target).is('svg.icon')) {
              return;
            }

            if ($(e.target).closest('.popover').length === 0 &&
                $(e.target).closest('.dropdown-list').length === 0) {
              self.hide(e);
            }
          })
          .on('keydown.tooltip', function (e) {
            if (e.which === 27 || settings.isError) {
              self.hide();
            }
          });

          if (settings.isError && !self.element.is(':visible') && !self.element.is('.dropdown')) {
            self.hide();
          }

          if (window.orientation === undefined) {
            $(window).on('resize.tooltip', function() {
              self.hide();
            });
          }

          // Click to close
          if (settings.isError) {
            self.tooltip.on('click.tooltip', function () {
              self.hide();
            });
          }

          self.element.trigger('aftershow', [self.tooltip]);

        }, 400);

      },

      // Places the tooltip element itself in the correct DOM element.
      // If the current element is inside a scrollable container, the tooltip element goes as high as possible in the DOM structure.
      setTargetContainer: function() {
        var targetContainer = $('body');

        // adjust the tooltip if the element is being scrolled inside a scrollable DIV
        this.scrollparent = this.element.closest('.page-container.scrollable');
        if (this.scrollparent.length) {
          targetContainer = this.scrollparent;
        }

        this.tooltip.detach().appendTo(targetContainer);
      },

      // Placement behavior's "afterplace" handler.
      // DO NOT USE FOR ADDITONAL POSITIONING.
      handleAfterPlace: function(e, placementObj) {
        this.tooltip.data('place').setArrowPosition(e, placementObj);
        this.tooltip.triggerHandler('tooltipafterplace', [placementObj]);
      },

      position: function () {
        this.setTargetContainer();
        this.tooltip.removeClass('is-hidden');

        var self = this,
          distance = this.isPopover ? 20 : 10,
          tooltipPlacementOpts = this.settings.placementOpts || {},
          opts = $.extend({}, tooltipPlacementOpts, {
            x: 0,
            y: distance,
            container: this.scrollparent,
            containerOffsetX: 10,
            containerOffsetY: 10,
            parent: this.element,
            placement: this.settings.placement,
            strategies: ['flip', 'nudge']
          });

        if (opts.placement === 'left' || opts.placement === 'right') {
          opts.x = distance;
          opts.y = 0;
        }

        this.tooltip.one('afterplace.tooltip', function(e, placementObj) {
          self.handleAfterPlace(e, placementObj);
        });

        this.tooltip.data('place').place(opts);
        return this;
      },

      // Alias for _hide()_ that works with the global _closeChildren()_ method.
      close: function() {
        return this.hide();
      },

      hide: function() {
        if (settings.keepOpen) {
          return;
        }

        if (this.isInPopup) {
          settings.content.addClass('hidden');
          return;
        }

        this.tooltip.addClass('is-hidden').css({'left': '', 'top': ''});
        this.tooltip.find('.arrow').removeAttr('style');

        this.tooltip.off('click.tooltip');

        if ($('.popover').not('.is-hidden').length === 0) {
          $(document).off('mouseup.tooltip keydown.tooltip');
          $(window).off('resize.tooltip');
        }

        this.element.trigger('hide', [this.tooltip]);
      },

      updated: function() {
        return this
          .teardown()
          .init();
      },

      teardown: function() {
        this.description.remove();
        this.descriptionId = undefined;
        this.element.removeAttr('aria-describedby').removeAttr('aria-haspopup');
        if (!this.tooltip.hasClass('is-hidden')) {
          this.hide();
        }
        this.element.removeData(pluginName);
        this.element.off('mouseenter.tooltip mouseleave.tooltip mousedown.tooltip click.tooltip focus.tooltip blur.tooltip');

        return this;
      },

      destroy: function() {
        this.teardown();
        $.removeData(this.element[0], pluginName);
      }
    };

    // Initializing the Control Once or Call Methods.
    return this.each(function() {

      var instance = $.data(this, pluginName);

      //Allow one tooltip and one popover
      if (instance && (instance.settings.popover == null || instance.settings.popover !== settings.popover)) {
        if (typeof instance[options] === 'function') {
          instance[options](args);
        }

        instance.settings = $.extend(instance.settings, options);

        if (settings.trigger === 'immediate') {
         setTimeout(function() {
            instance.show(settings);
          }, 100);
        }
      } else {
        instance = $.data(this, pluginName, new Tooltip(this, settings));
        instance.settings = settings;
      }
    });
  };

  // Popover & Tooltip are the same control
  $.fn.popover = $.fn.tooltip;

/* start-amd-strip-block */
}));
/* end-amd-strip-block */
