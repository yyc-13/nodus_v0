var element = document.querySelector("trix-editor");
element.editor; // is a Trix.Editor instance
element.editor.getDocument(); // is a Trix.Document instance
var document = element.editor.getDocument();
document.toString(); // is a JavaScript string
var document = element.editor.getDocument();
// document.isEqualTo(element.editor.getDocument()); // true
// element.editor.getSelectedRange(); // [0, 0]
// // Select the first character in the document
// element.editor.setSelectedRange([0, 1]);
// element.editor.setSelectedRange(1);
// element.editor.setSelectedRange([1]);
// element.editor.setSelectedRange([1, 1]);
// // Move the cursor backward one character
// element.editor.moveCursorInDirection("backward");

// // Expand the end of the selection forward by one character
// element.editor.expandSelectionInDirection("forward");
// var rect = element.editor.getClientRectAtPosition(0)[(rect.left, rect.top)]; // [17, 49]
// // Insert “Hello” at the beginning of the document
// element.editor.setSelectedRange([0, 0]);
// element.editor.insertString("Hello");
// // Insert a bold “Hello” at the beginning of the document
// element.editor.setSelectedRange([0, 0]);
// element.editor.insertHTML("<strong>Hello</strong>");
// // Insert the selected file from the first file input element
// var file = document.querySelector("input[type=file]").file;
// element.editor.insertFile(file);
// var attachment = new Trix.Attachment({
//   content: '<span class="mention">@trix</span>',
// });
// element.editor.insertAttachment(attachment);
// // Insert “Hello\n”
// element.editor.insertString("Hello");
// element.editor.insertLineBreak();
// // “Backspace” the first character in the document
// element.editor.setSelectedRange([1, 1]);
// element.editor.deleteInDirection("backward");

// // Delete the second character in the document
// element.editor.setSelectedRange([1, 1]);
// element.editor.deleteInDirection("forward");
// element.editor.insertString("Hello");
// element.editor.setSelectedRange([0, 5]);
// element.editor.activateAttribute("bold");
// element.editor.insertString("Trix");
// element.editor.setSelectedRange([0, 4]);
// element.editor.activateAttribute("href", "https://trix-editor.org/");
// element.editor.setSelectedRange([2, 4]);
// element.editor.deactivateAttribute("bold");

const form = document.querySelector("#send");
const trixForm = document.querySelector("#trixForm");
form.addEventListener("click", (e) => {
  e.preventDefault();
  let formInput = trixForm.editor.getDocument();
  console.log("formInput", formInput);
  formInput = formInput.toString();
  console.log("fo/rmInput", formInput);

  console.log(JSON.stringify(element.editor));
  fetch("get", () => {})
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      console.log(json);
    });
});
// Save editor state to local storage

// Restore editor state from local storage
