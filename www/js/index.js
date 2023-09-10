document.addEventListener('deviceready', onDeviceReady, false);

// Function called when the device is ready for Cordova interactions
function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    // Log Cordova platform and version information
    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    localStorage.clear();

    // Initialize the app by calling the 'load' function
    load();
}

// Initialize the 'events' array from local storage or as an empty object
const storedList = localStorage.getItem('lists') ? JSON.parse(localStorage.getItem('lists')) : {};

// DOM element references
const calendar = document.getElementById('calendar');
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const popup = document.getElementById('popup');
const closePopupButton = document.getElementById('closePopup');
const popupContent = document.querySelector('.popup-content');
var yearOffset = 0;
var monthOffset = 0;
var dayOffset = 0;
let initialX = 0;
let initialY = 0;
let activeElement = null;

// Base date for the calendar
const baseDate = new Date();

// Initial function call to load the calendar
function load() {
    generateCalendar(baseDate);
}

// Function to calculate the number of days in a month
function monthLength(year, month) {
    const numberOfDaysInMonth = new Date(year, month + 1, 0).getDate();
    return numberOfDaysInMonth;
}

// Function to calculate the day of the week on which a month starts
function firstDayOfMonth(year, month) {
    const firstDateOfMonth = new Date(year, month, 1);
    const firstDayOfWeek = firstDateOfMonth.getDay();
    return firstDayOfWeek;
}

// Event listeners for navigating to the previous month and next month
document.getElementById('lastMonth').addEventListener('click', function () {
    monthOffset--;
    document.getElementById('calendar').innerHTML = "";
    generateCalendar(baseDate);
});

document.getElementById('nextMonth').addEventListener('click', function () {
    monthOffset++;
    document.getElementById('calendar').innerHTML = "";
    generateCalendar(baseDate);
});


// Event listener for adding a positive custom word
document.getElementById('addPositiveButton').addEventListener('click', function () {
    const columnId = 'positive'; 
    const content = document.getElementById('customWord').value;

    if (content.trim() !== '') {
        appendItemToColumn(columnId, content);
        document.getElementById('customWord').value = '';
    }
});

// Event listener for adding a negative custom word
document.getElementById('addNegativeButton').addEventListener('click', function () {
    const columnId = 'negative'; 
    const content = document.getElementById('customWord').value;

    if (content.trim() !== '') {
        appendItemToColumn(columnId, content);
        document.getElementById('customWord').value = '';
    }
});

// Function to generate the calendar for a given month
function generateCalendar(baseDate) {
    document.getElementById('month').innerHTML = "";
    const targetMonth = baseDate.getMonth() + monthOffset;
    const adjustedMonth = ((targetMonth % 12) + 12) % 12;
    const yearChange = Math.floor(targetMonth / 12);
    const adjustedYear = baseDate.getFullYear() + yearChange;
    document.getElementById('month').innerHTML = months[adjustedMonth] + ' ' + adjustedYear;
    const ukDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Add weekday labels to the calendar
    for (let x of ukDays) {
        addCalendarSquare(x, 'weekday');
    }

    // Add padding for the days of the previous month
    frontPadding(baseDate);

    // Add the days of the current month
    for (let i = 1; i <= monthLength(baseDate.getFullYear(), baseDate.getMonth() + monthOffset); i++) {
        addCalendarSquare(i, 'day');
    }

    // Add padding for the days of the next month
    backPadding(baseDate);

    // Event listener for clicking on a day in the calendar
    calendar.addEventListener('click', function (event) {
        const clickedElement = event.target;

        // Check if the clicked element has the 'day' class
        if (clickedElement.classList.contains('day')) {
            // Handle the click on a day element

            const dayValue = clickedElement.textContent;
            openPopup(dayValue);
        }
    });

}

// Function to add a square (day or weekday) to the calendar
function addCalendarSquare(content, style) {
    var newItem = document.createElement('div');
    newItem.textContent = content
    newItem.className = 'grid-item ' + style;

    // Get the container div and append the new item to it
    var container = document.getElementById('calendar');
    container.appendChild(newItem);
}

// Function to add front padding to the calendar
function frontPadding(baseDate) {
    let padding = 0;
    if (firstDayOfMonth(baseDate.getFullYear() + yearOffset, baseDate.getMonth() + monthOffset) != 1) {
        padding = firstDayOfMonth(baseDate.getFullYear() + yearOffset, baseDate.getMonth() + monthOffset) - 1;
    }
    if (firstDayOfMonth(baseDate.getFullYear() + yearOffset, baseDate.getMonth() + monthOffset) == 0) {
        padding = 6;
    }
    for (let i = 0; i < padding; i++) {
        addCalendarSquare("", 'padding');
    }
}

// Function to add back padding to the calendar
function backPadding(baseDate) {
    let nd = new Date(baseDate.getFullYear() + yearOffset, baseDate.getMonth() + monthOffset, 1)
    let padding = 0;
    let lastDay = monthLength(nd.getFullYear(), nd.getMonth())
    lastDay = new Date(nd.getFullYear(), nd.getMonth(), lastDay)
    if (lastDay.getDay() != 0) {
        padding = 7 - lastDay.getDay()
    }

    for (let i = 0; i < padding; i++) {
        addCalendarSquare("", 'padding');
    }
}

// Function to open the popup for a selected day
function openPopup(dayValue) {
    // Get the popup element
    const popup = document.getElementById('popup');
    document.getElementById('positiveColumn').innerHTML='';
    document.getElementById('positiveColumn').innerHTML='';

    // Check if the popup element exists before displaying it
    if (!popup) {
        return;
    }

    // Function to handle the close button click
    function closePopup() {
        // Get references to the positive and negative columns
        const positiveColumn = document.getElementById('positiveColumn');
        const negativeColumn = document.getElementById('negativeColumn');

        // Clear the positive and negative columns by removing child elements (span elements)
        while (positiveColumn.firstChild) {
            positiveColumn.removeChild(positiveColumn.firstChild);
        }
        while (negativeColumn.firstChild) {
            negativeColumn.removeChild(negativeColumn.firstChild);
        }

        // Initialize arrays for positive and negative lists
        const positiveList = [];
        const negativeList = [];

        // Populate the positive list by iterating through positive items
        positiveColumn.querySelectorAll('span').forEach(item => {
            positiveList.push(item.textContent);
        });

        // Populate the negative list by iterating through negative items
        negativeColumn.querySelectorAll('span').forEach(item => {
            negativeList.push(item.textContent);
        });

        // Construct an object to store the lists keyed by the clicked date
        const clickedDate = new Date(currentYear, currentMonth, dayValue);
        const eventData = {
            positiveList,
            negativeList,
        };

        // Store or update the eventData for the clicked date in the storedList
        storedList[clickedDate.toDateString()] = eventData;

        // Save the updated storedList back to localStorage
        localStorage.setItem('lists', JSON.stringify(storedList));

        // Close the popup
        popup.style.display = 'none';

        // Remove the event listener to prevent memory leaks
        dynamicCloseButton.removeEventListener('click', closePopup);
    }

    // Get the close button dynamically
    const dynamicCloseButton = document.querySelector('#popup .close-button');

    // Check if the dynamicCloseButton element exists before adding the event listener
    if (dynamicCloseButton) {
        dynamicCloseButton.addEventListener('click', closePopup);
    }

    // Get the container for draggable words
    const wordContainer = document.querySelector('#popup .draggable-words');

    // Check if the wordContainer element exists before adding the event listener
    if (wordContainer) {
        wordContainer.addEventListener('touchstart', handleTouchStart);
        wordContainer.addEventListener('touchmove', handleTouchMove);
        wordContainer.addEventListener('touchend', handleTouchEnd);
    }

    // Get the current month and year
    const currentDate = new Date(); // Get the current date
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    // Construct a Date object for the clicked day using the current month and year
    const clickedDate = new Date(currentYear, currentMonth, dayValue);

    // Display the popup
    popup.style.display = 'block';
}

// Function to handle drag start
function drag(event) {
    event.dataTransfer.setData("text", event.target.innerText);
}

// Function to allow dropping into the columns
function allowDrop(event) {
    event.preventDefault();
}

// Function to handle dropping an item into a column
function drop(event, target) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");

    // Check if the event target is a valid drop target (column)
    if (target === 'positive' || target === 'negative') {
        appendItemToColumn(target, data);
    }
}

// Function to handle the start of a touch event
function handleTouchStart(event) {
    // Prevent default behavior to avoid scrolling while dragging
    event.preventDefault();

    // Store the initial touch position and the active element
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
    activeElement = event.target;

    // Add a CSS class to highlight the active element
    activeElement.classList.add('active');

    // Set a flag to indicate dragging has started
    isDragging = true;
}

// Function to handle the move of a touch event
function handleTouchMove(event) {
    event.preventDefault();
    if (isDragging) {
        // Calculate the distance moved from the initial touch position
        const deltaX = event.touches[0].clientX - touchStartX;
        const deltaY = event.touches[0].clientY - touchStartY;

        // Update the active element's position based on deltaX and deltaY
        activeElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }
}

// Function to handle the end of a touch event
function handleTouchEnd(event) {
    if (isDragging) {
        // Remove the CSS class and reset the active element
        activeElement.classList.remove('active');
        activeElement.style.transform = '';

        // Call the drop function with the appropriate target
        if (dropTarget) {
            drop(event, dropTarget.id);
        }

        // Reset the active element and the drag flag
        activeElement = null;
        isDragging = false;
    }
}

// Function to find the drop target for a touch event
function findDropTarget() {

    return null; 
}

// Function to append an item to a column
function appendItemToColumn(columnId, content) {
    const columnContainer = document.querySelector(`#${columnId}Column`);

    // Create a new span element and set its text and attributes
    const newItem = document.createElement('span');
    newItem.textContent = content;

    // Check if the column is positive or negative
    if (columnId === 'positive' || columnId === 'negative') {
        // Disable dragging for items in positive and negative lists
        newItem.draggable = false;

        // Add a click event listener to remove the item when clicked
        newItem.addEventListener('click', function () {
            // Remove the item from the list
            columnContainer.removeChild(newItem);
        });
    } else {
        // Enable dragging for other items
        newItem.draggable = true;
        newItem.ondragstart = drag;
    }

    // Apply styles to the dropped element for flexible sizing
    newItem.classList.add('dropped-word');
    newItem.style.flexGrow = '1'; // Allow it to grow and fill available space
    newItem.style.margin = '4px'; // Adjust the margin as needed
    newItem.style.maxWidth = '150px'; // Adjust the maximum width as needed

    // Append the new item to the column's container
    columnContainer.appendChild(newItem);
}
