/*
* Placeholder plugin for jQuery
* ---
* Copyright 2010, Daniel Stocks (http://webcloud.se)
* Released under the MIT, BSD, and GPL Licenses.
*/
(function($) {
    function Placeholder(input) {
        this.input = input;
        if (input.attr('type') == 'password') {
            this.handlePassword();
        }
        // Prevent placeholder values from submitting
        $(input[0].form).submit(function() {
            if (input.hasClass('placeholder') && input[0].value == input.attr('placeholder')) {
                input[0].value = '';
            }
        });
    }
    Placeholder.prototype = {
        show : function(loading) {
            // FF and IE saves values when you refresh the page. If the user refreshes the page with
            // the placeholders showing they will be the default values and the input fields won't be empty.
            if (this.input[0].value === '' || (loading && this.valueIsPlaceholder())) {
                if (this.isPassword) {
                    if ( !this.msie_old ) {
                        this.input[0].setAttribute('type', 'text');
                    } else {
                        this.input.before(this.fakePassword.show()).hide();
                    }
                }
                this.input.addClass('placeholder');
                this.input[0].value = this.input.attr('placeholder');
            }
        },
        hide : function() {
            if (this.valueIsPlaceholder() && this.input.hasClass('placeholder')) {
                this.input.removeClass('placeholder');
                if ( !this.isPassword || !this.msie_old ) {
                    /* if it is password and is an old IE version, then the
                     * original input value must not be reset, since if its
                     * value isn't empty, the fake input will not be visible */
                    this.input[0].value = '';
                }

                if ( this.isPassword  ) {
                    if ( !this.msie_old ) {
                        this.input[0].setAttribute('type', 'password');
                    } else {
                        this.fakePassword.hide();
                    }
                    // Restore focus for Opera and IE
                    this.input.show();
                    this.input[0].focus();
                }
            }
        },
        valueIsPlaceholder : function() {
            var element = this.msie_old ? this.fakePassword[0] : this.input[0];
            return element.value == this.input.attr('placeholder');
        },
        handlePassword: function() {
            var input = this.input;
            this.isPassword = true;

            // IE < 9 doesn't allow changing the type of password inputs
            this.msie_old = ($.browser.msie && $.browser.version < 9);
            if ( this.msie_old ) {
                var fakeHTML = $(input[0].outerHTML.replace(/type=(['"])?password\1/gi, 'type=$1text$1'));
                fakeHTML.removeAttr('name');//.removeAttr('id');
                this.fakePassword = fakeHTML.val(input.attr('placeholder')).addClass('placeholder').focus(function() {
                    input.trigger('focus');
                });
                $(input[0].form).submit(function() {
                    fakeHTML.remove();
                    input.show()
                });
            }
        }
    };
    var NATIVE_SUPPORT = !!("placeholder" in document.createElement( "input" ));
    $.fn.placeholder = function() {
        return NATIVE_SUPPORT ? this : this.each(function() {
            var input = $(this);
            var placeholder = new Placeholder(input);
            placeholder.show(true);
            input.focus(function() {
                placeholder.hide();
            });
            input.blur(function() {
                placeholder.show(false);
            });

            // On page refresh, IE doesn't re-populate user input
            // until the window.onload event is fired.
            if ($.browser.msie) {
                $(window).load(function() {
                    if(input.val()) {
                        input.removeClass("placeholder");
                    }
                    placeholder.show(true);
                });
                // What's even worse, the text cursor disappears
                // when tabbing between text inputs, here's a fix
                input.focus(function() {
                    if(this.value == "") {
                        var range = this.createTextRange();
                        range.collapse(true);
                        range.moveStart('character', 0);
                        range.select();
                    }
                });
            }
        });
    }
})(jQuery);
