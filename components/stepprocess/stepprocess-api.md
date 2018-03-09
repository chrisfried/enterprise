<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [STEPPROCESS_DEFAULTS][1]
-   [Stepprocess][2]
    -   [updated][3]
    -   [destroy][4]
-   [selected][5]

## STEPPROCESS_DEFAULTS

Default Stepprocess Options

## Stepprocess

A Stepprocess/wizard control

**Parameters**

-   `element` **[String][6]** The component element.
-   `settings` **[String][6]** The component settings.
-   `linearProgression` **[boolean][7]** The Main Application Name to display
    in the header. (Defaults to false)
-   `folderIconOpen` **[string][6]** A specific folder open icon. (Defaults to 'caret-up')
-   `folderIconClosed` **[string][6]** A specific folder close icon. (Defaults to 'caret-down')
-   `stepList` **[boolean][7]** Determines whether or not to display device
    information (Browser, Platform, Locale, Cookies Enabled).
-   `stepLi` **[string][6]** jQuery selector for the step elements.
-   `stepLink` **[boolean][7]** jQuery selector for the step link elements.
-   `stepFolder` **[string][6]** jQuery selector for the step folder elements.
-   `btnPrev` **[string][6]** jQuery selector for the previous step button.
-   `btnNext` **[string][6]** jQuery selector for the next step button.
-   `beforeSelectStep` **[Function][8]** A callback (function or promise)
    that gives args: stepLink (the step link element) and isStepping
    (whether we are prev/next'ing or not).

### updated

Resync the UI and Settings.

**Parameters**

-   `settings` **[Object][9]** The settings to apply.

Returns **[Object][9]** The api

### destroy

Destroy this component instance and remove the link from its base element.

Returns **void** 

## selected

Fires when selected step link.

**Properties**

-   `event` **[Object][9]** The jquery event object
-   `stepLink` **[Object][9]** element

[1]: #stepprocess_defaults

[2]: #stepprocess

[3]: #updated

[4]: #destroy

[5]: #selected

[6]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[7]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[8]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[9]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object