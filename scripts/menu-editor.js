document.addEvent('domready', initializeMenuEditor);

function initializeMenuEditor() {

    // listen for mouse events on the cells
    $$('table.lunch-calendar tbody td').each(function (td) {

        // edit button events
        var editButton = td.getElement('.calendar-cell-edit');
        td.addEvent('mouseenter', function () {
            editButton.setStyle('display', 'block');
        });
        td.addEvent('mouseleave', function () {
            editButton.setStyle('display', 'none');
        });

        // fake day
        if (!td.data('year')) {
            td.addEvent('click', function (e) {
                e.preventDefault();
                showCellNotesEditor(td);
            });
            return;
        }

        // real day
        var menuDay = td.retrieve('menuDay');
        td.addEvent('click', function (e) {
            e.preventDefault();
            showMenuEditor(menuDay);
        });

    });
}

function showMenuEditor (menuDay) {

    // find the window
    var win = document.getElement('.admin-window.editor');
    if (win)
        saveMenu();
    else
        win = createEditorWindow();

    win.beforeClose = saveMenu;

    // find inputs
    var saladInput = win.getElement('input');
    var textareas  = win.getElements('textarea');
    var breakArea  = textareas[0], lunchArea = textareas[1];

    // set title and store day
    win.getElement('h2 span').setProperty('text', menuDay.prettyName());
    win.store('menuDay', menuDay);

    // add the data
    breakArea.value = menuDay.breakfast;
    lunchArea.value = menuDay.lunch;
    saladInput.value = menuDay.salad;
    win.getElements('.day-number').each(function (el) {
        el.setProperty('text', menuDay.day);
    });

    /* arrows */

    // this is the first presentation (not a switch of days w/ the arrows)
    var larr, rarr;
    if (presentAnyWindow(win)) {

        larr = new Element('div', { id: 'menu-left-arrow' });
        rarr = new Element('div', { id: 'menu-right-arrow' });
        win.parentElement.adopt(larr, rarr);

        // left arrow click
        larr.addEvent('click', function (e) {
            e.preventDefault();
            var menuDay = win.retrieve('menuDay');
            if (menuDay && menuDay.previousDay)
                showMenuEditor(menuDay.previousDay);
        });

        // right arrow click
        rarr.addEvent('click', function (e) {
            e.preventDefault();
            var menuDay = win.retrieve('menuDay');
            if (menuDay && menuDay.nextDay)
                showMenuEditor(menuDay.nextDay);
        });

    }

    // update the previews. we have to do this down here after
    // presentAnyWindow() because, if this is the initial presentation of the
    // window, the heights would not yet be available for overflow calculation.
    win.updatePreviews();

    larr = $('menu-left-arrow');
    rarr = $('menu-right-arrow');

    // back arrow
    if (menuDay.previousDay) {
        larr.innerHTML = '<i class="fa fa-chevron-left"></i>' +
            menuDay.previousDay.shortName();
        larr.setStyle('display', 'block');
    }
    else {
        larr.setStyle('display', 'none');
    }

    // forward arrow
    if (menuDay.nextDay) {
        rarr.innerHTML = menuDay.nextDay.shortName() +
            '<i class="fa fa-chevron-right right"></i>';
        rarr.setStyle('display', 'block');
    }
    else {
        rarr.setStyle('display', 'none');
    }

    // if breakfast is empty, probably adding a new day; focus it
    if (!breakArea.value.length)
        breakArea.focus();

    return win;
}

function saveMenu() {
    var win = document.getElement('.admin-window.editor');
    if (!win) return;

    var menuDay = win.retrieve('menuDay');
    if (!menuDay) return;

    // find inputs
    var saladInput = win.getElement('input');
    var textareas  = win.getElements('textarea');
    var breakArea  = textareas[0], lunchArea = textareas[1];

    var newBreak = breakArea.value.trim(),
        newLunch = lunchArea.value.trim(),
        newSalad = saladInput.value.trim();

    // nothing has changed
    if (newBreak == menuDay.breakfast &&
        newLunch == menuDay.lunch && newSalad == menuDay.salad)
        return false;

    // update the menu day object
    menuDay.breakfast = newBreak;
    menuDay.lunch = newLunch;
    menuDay.salad = newSalad;

    // update in database
    if (menuDay)
        menuDay.update();

    // update calendar
    menuDay.menuItems.setProperty('html',
        replaceNewlines(menuDay.displayText()));

    return true;
}

function createEditorWindow () {
    var win = createWindow('Menu editor');
    win.addClass('editor');

    var clear = new Element('div', { styles: { clear: 'both' } });

    // headings
    var lunchHead = new Element('h3', { text: 'Lunch' })
    var breakHead = new Element('h3', { text: 'Breakfast' });
    var prevHead1 = new Element('span', { text: 'Preview' });
    var prevHead2 = prevHead1.clone();
    lunchHead.adopt(prevHead1);
    breakHead.adopt(prevHead2);
    breakHead.setStyle('margin-top', '0');

    // input
    var inputWrap = new Element('div', { class: 'input-wrap' });
    var inputSpan = new Element('span', { text: ' salad' });
    var input = new Element('input', { type: 'text' });
    inputWrap.adopt(input, inputSpan);

    // textareas
    var lunchLeft = new Element('div', { class: 'left-side' });
    var breakLeft = new Element('div', { class: 'left-side' });
    var lunchArea = new Element('textarea');
    var breakArea = new Element('textarea');
    lunchLeft.adopt(lunchArea, inputWrap);
    breakLeft.adopt(breakArea);


    // previews
    var cell  = new Element('div',  { class: 'preview-cell'             });
    var inner = new Element('div',  { class: 'inner'                    });
    var num   = new Element('span', { class: 'day-number', text: '1'    });
    var items = new Element('span', { class: 'menu-items'               });
    var warn  = new Element('span', { class: 'warn', text: 'Overflow'   });
    var prev1 = new Element('div',  { class: 'preview'                  });
                inner.adopt(num, items);
                cell.adopt(inner);
                prev1.adopt(cell, warn);
    var prev2 = prev1.clone();

    // wrappers
    var lunchWrap = new Element('div', { class: 'wrap' });
    var breakWrap = new Element('div', { class: 'wrap' });
    lunchWrap.adopt(lunchLeft, prev1, clear.clone());
    breakWrap.adopt(breakLeft, prev2, clear.clone());

    win.adopt(breakHead, breakWrap, lunchHead, lunchWrap, clear);

    /* typing events */

    var updatePreviews = function () {
        var lunchItem = prev1.getElement('.menu-items'),
            breakItem = prev2.getElement('.menu-items'),
            lunchWarn = prev1.getElement('.warn'),
            breakWarn = prev2.getElement('.warn'),
            lunchText = lunchArea.value.trim(),
            breakText = breakArea.value.trim(),
            saladText = input.value.trim();

        // update text
        if (saladText.length)
            lunchText += '\n' + saladText + ' salad';
        breakItem.setProperty('html', replaceNewlines(breakText));
        lunchItem.setProperty('html', replaceNewlines(lunchText));

        // lunch too long
        if (lunchItem.offsetHeight > lunchItem.parentElement.clientHeight)
            lunchWarn.setStyle('display', 'inline-block');
        else
            lunchWarn.setStyle('display', 'none');

        // breakfast too long
        if (breakItem.offsetHeight > breakItem.parentElement.clientHeight)
            breakWarn.setStyle('display', 'inline-block');
        else
            breakWarn.setStyle('display', 'none');
    };
    win.updatePreviews = updatePreviews;

    Object.each({
        lunch: lunchArea,
        breakfast: breakArea,
        salad: input
    }, function (el, name) {
        el.addEvent('input', updatePreviews);
    });

    return win;
}

/*#########################
### NON-MENU CELL NOTES ###
#########################*/

function showCellNotesEditor (td) {
    var win = createCellEditorWindow();
    win.beforeClose = saveCellNotes;
    win.td = td;

    // find inputs
    var notesArea = win.getElement('textarea');
    var notes = td.retrieve('cellNotes');
    if (typeof notes == 'string' && notes.length)
        notesArea.setProperty('value', notes);

    // update the previews
    win.updatePreviews();

    presentAnyWindow(win);
    notesArea.focus();
    return win;
}

function createCellEditorWindow () {
    var win = createWindow('Cell notes');
    win.addClass('editor');

    var clear = new Element('div', { styles: { clear: 'both' } });

    // headings
    var notesHead = new Element('h3',   { text: 'Notes'     });
    var prevHead1 = new Element('span', { text: 'Preview'   });
    notesHead.adopt(prevHead1);
    notesHead.setStyle('margin-top', '0');

    // textarea
    var notesLeft = new Element('div', { class: 'left-side' });
    var notesArea = new Element('textarea');
    notesLeft.adopt(notesArea);

    // previews
    var cell  = new Element('div',  { class: 'preview-cell'                 });
    var inner = new Element('div',  { class: 'inner'                        });
    var items = new Element('span', { class: 'notes-items'                  });
    var prev1 = new Element('div',  { class: 'preview'                      });
    var warn  = new Element('span', { class: 'warn', text: 'Overflow'       });
        inner.adopt(items);
        cell.adopt(inner);
        prev1.adopt(cell, warn);

    // wrappers
    var notesWrap = new Element('div', { class: 'wrap' });
    notesWrap.adopt(notesLeft, prev1, clear.clone());
    notesWrap.setStyle('margin-bottom', '10px');

    win.adopt(notesHead, notesWrap, clear);

    // typing events
    var updatePreviews = function () {
        var notesText = notesArea.value, // do NOT trim
            notesItem = prev1.getElement('.notes-items'),
            notesWarn = prev1.getElement('.warn');

        // set text
        notesItem.setProperty('html', replaceNewlines(notesText));

        // notes too long
        if (notesItem.offsetHeight > notesItem.parentElement.clientHeight)
            notesWarn.setStyle('display', 'inline-block');
        else
            notesWarn.setStyle('display', 'none');
    };
    win.updatePreviews = updatePreviews;
    notesArea.addEvent('input', updatePreviews);

    return win;
}

function saveCellNotes () {
    var win = document.getElement('.admin-window.editor');
    var td  = win.td;
    if (!win || !td) return;

    // find inputs
    var area = win.getElement('textarea');
    var newNotes = area.value;

    // nothing has changed
    var old = td.retrieve('cellNotes');
    if (typeof old != 'string') old = '';
    if (old == newNotes)
        return;

    // update database
    statusLoading();
    var request = new Request.JSON({
        url: 'functions/update-cell-notes.php',
        onSuccess: function (data) {
            if (data.error) {
                statusError(data.error);
                presentAlert('Error',
                    'Failed to save recent changes. Please reload the page. ' +
                    'Error: ' + data.error
                );
            }
            else {
                statusSuccess();
            }
        },
        onError: function (text, error) {
            statusError(error);
            presentAlert('Error',
                'Failed to save recent changes. Please reload the page. ' +
                'Error: ' + error
            );
        }
    }).post({
        year:       getCurrentYear(),
        month:      getCurrentMonth(),
        cellID:     td.data('cell'),
        notes:      newNotes
    });

    // update calendar
    td.getElement('.notes-items').setProperty('html',
        replaceNewlines(newNotes));
    td.store('cellNotes', newNotes);

    return true;
}
