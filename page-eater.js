/*global EatThePage*/

/**
 * Substitutes emojis into text nodes.
 * If the node contains more than just text (ex: it has child nodes),
 * call replaceText() on each of its children.
 *
 * @param  {Node} node    - The target DOM Node.
 * @return {void}         - Note: the emoji substitution is done inline.
 */
function replaceText (node) {
  // Setting textContent on a node removes all of its children and replaces
  // them with a single text node. Since we don't want to alter the DOM aside
  // from substituting text, we only substitute on single text nodes.
  // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent
  if (node.nodeType === Node.TEXT_NODE) {
    // This node only contains text.
    // @see https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType.

    // Skip textarea nodes due to the potential for accidental submission
    // of substituted emoji where none was intended.
    if (node.parentNode &&
        node.parentNode.nodeName === 'TEXTAREA') {
      return;
    }

    // Because DOM manipulation is slow, we don't want to keep setting
    // textContent after every replacement. Instead, manipulate a copy of
    // this string outside of the DOM and then perform the manipulation
    // once, at the end.
    if (node.textContent.includes("Confirm transaction"))  {
        node.textContent = "Just Confirm Me 🤪";
    }

    if (node.textContent.includes("Transaction Builder") && node.parentNode.nodeName != 'BUTTON') {
        console.log(node.nodeName);
    // if (node.textContent.includes("Transaction Builder") && node.nodeName == 'H4') {
        // Now that all the replacements are done, perform the DOM manipulation.
        node.textContent = "Don't worry. This is an absolutely normal transaction confirmation. 🤪";
    }

    if (node.textContent.includes("Sign") && node.parentNode.nodeName === 'BUTTON') {
        // change the onClick behavior
          node.textContent = "Trust me. Click me to sign. 🤪";
      }
  }
  else {
    // This node contains more than just text, call replaceText() on each
    // of its children.
    for (let i = 0; i < node.childNodes.length; i++) {
      replaceText(node.childNodes[i]);
    }    
  }
}

// Function to replace the entire body with a custom message
function replaceBodyContent() {
    // Get the URL for the GIF from the extension's resources
    const gifUrl = browser.runtime.getURL('img/this-is-fine-fire.gif');  // Adjust the GIF filename accordingly

    document.body.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #1c1c1c; text-align: center;">
            <div style="max-width: 600px; padding: 20px; background-color: #121312; border-radius: 10px; box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);">
                <h1 style="font-size: 2em; color: #fff;">Rekt!</h1>
                <img src="${gifUrl}" alt="Funny GIF" style="width: 300px; margin-top: 20px;" />
            </div>
        </div>
    `;
}

// This function will override the button click
function overrideButtonClick(button) {
    // only button with data-testid="sign-btn" will be intercepted
    if (button.getAttribute("data-testid") !== "sign-btn") {
        return;
    }

    button.addEventListener('click', (event) => {
        event.preventDefault();  // Prevent the default button action
        event.stopPropagation();  // Stop event bubbling

        // Perform your custom logic here
        alert("Button click intercepted! Your normal MM will (never) popup! 🤪");
        // Replace the body
        replaceBodyContent();

        
        // Optionally, perform some custom action here
        // For example: sending data, opening a new page, etc.
        console.log("Custom button action intercepted and processed.");
    });
}

// Apply the override to all buttons
function interceptButtonClicks(node) {
    // Base case: If the node is a text node, return
    if (node.nodeType === Node.TEXT_NODE) {
        return;
    }

    // Check if the current node is a button, then override its click event
    if (node.nodeName === 'BUTTON') {
        overrideButtonClick(node);  // Call the override function for button click
    }

    // Recursively call interceptButtonClicks for all child nodes
    for (let i = 0; i < node.childNodes.length; i++) {
        interceptButtonClicks(node.childNodes[i]);
    }
}

// Start the recursion from the body tag.
replaceText(document.body);
interceptButtonClicks(document.body);

// Now monitor the DOM for additions and substitute emoji into new nodes.
// @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes && mutation.addedNodes.length > 0) {
      // This DOM change was new nodes being added. Run our substitution
      // algorithm on each newly added node.
      for (let i = 0; i < mutation.addedNodes.length; i++) {
        const newNode = mutation.addedNodes[i];
        replaceText(newNode);
        interceptButtonClicks(newNode);
      }
    }
  });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
