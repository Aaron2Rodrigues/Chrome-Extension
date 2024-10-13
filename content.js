// content.js

const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = chrome.runtime.getURL('styles.css');
document.head.appendChild(link);

let isSelecting = false;
let selectionBox;
let startX, startY;

// Function to start selection
function startSelection(e) {
    isSelecting = true;
    startX = e.clientX;
    startY = e.clientY;

    selectionBox = document.createElement('div');
    selectionBox.style.position = 'absolute';
    selectionBox.style.border = '2px dashed rgba(0, 0, 255, 0.5)';
    selectionBox.style.pointerEvents = 'none'; // Prevent interference with mouse events
    document.body.appendChild(selectionBox);
}

// Function to update the selection box
function updateSelectionBox(e) {
    if (!isSelecting) return;

    const x = Math.min(e.clientX, startX);
    const y = Math.min(e.clientY, startY);
    const width = Math.abs(e.clientX - startX);
    const height = Math.abs(e.clientY - startY);

    selectionBox.style.left = `${x}px`;
    selectionBox.style.top = `${y}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;
}

// Function to end selection
function endSelection() {
    isSelecting = false;
    document.body.removeChild(selectionBox);

    // Get the selected area
    const rect = selectionBox.getBoundingClientRect();
    const elements = document.elementsFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);

    let fontFamilies = new Set();

    elements.forEach(element => {
        const computedStyle = window.getComputedStyle(element);
        fontFamilies.add(computedStyle.fontFamily);
    });

    alert(`Fonts in selected area: ${Array.from(fontFamilies).join(', ')}`);
}

// Event listeners for mouse actions
document.addEventListener('mousedown', startSelection);
document.addEventListener('mousemove', updateSelectionBox);
document.addEventListener('mouseup', endSelection);

// Change cursor to crosshair when the extension is active
document.body.style.cursor = 'crosshair';

// Reset cursor when the extension is deactivated
document.addEventListener('mouseleave', () => {
    document.body.style.cursor = 'default';
});

// Function to identify the font of the selected text
function identifyFont() {
    const selection = window.getSelection();

    // Check if there is a selection
    if (selection.rangeCount > 0) {
        const selectedText = selection.toString();

        // If text is selected, get the font information
        if (selectedText) {
            const range = selection.getRangeAt(0);
            const selectedElement = range.startContainer.parentNode;

            // Get the computed style of the selected element
            const computedStyle = window.getComputedStyle(selectedElement);
            const fontFamily = computedStyle.fontFamily;

            // Display the font information
            alert(`Selected Text: "${selectedText}"\nFont Family: ${fontFamily}`);
        }
    }
}

// Add an event listener for the mouseup event to detect text selection
document.addEventListener('mouseup', identifyFont);

let isActive = false;
let tooltip;

// Function to toggle the font identifier
function toggleFontIdentifier() {
    isActive = !isActive;
    if (isActive) {
        document.body.style.cursor = 'crosshair';
        document.addEventListener('mouseover', showFontInfo);
        document.addEventListener('mouseout', hideFontInfo);
    } else {
        document.body.style.cursor = 'default';
        document.removeEventListener('mouseover', showFontInfo);
        document.removeEventListener('mouseout', hideFontInfo);
        hideFontInfo(); // Hide tooltip when deactivating
    }
}

// Function to show font information
function showFontInfo(event) {
    const element = event.target;
    const computedStyle = window.getComputedStyle(element);
    const fontFamily = computedStyle.fontFamily;

    // Create a tooltip to display font information if it doesn't exist
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'font-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'white'; // White background
        tooltip.style.color = 'black'; // Black text
        tooltip.style.padding = '10px'; // Padding for the tooltip
        tooltip.style.border = '1px solid rgba(0, 0, 0, 0.5)'; // Border for the tooltip
        tooltip.style.borderRadius = '5px'; // Rounded corners
        tooltip.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)'; // Shadow for depth
        tooltip.style.pointerEvents = 'none'; // Prevent interference with mouse events
        document.body.appendChild(tooltip);
    }

    // Update the tooltip text to include "Chris is saying"
    tooltip.innerText = `Chris is saying: ${fontFamily}`;
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.top = `${event.pageY + 10}px`;
    tooltip.style.display = 'block';

    console.log("Mouse over detected on:", event.target);
}

// Function to hide font information
function hideFontInfo() {
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Listen for messages from the popup to toggle the font identifier
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'toggle') {
        toggleFontIdentifier();
    }
});
