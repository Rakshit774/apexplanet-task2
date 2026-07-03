# Daybook - Contact Form & To-Do List

This is my submission for Task 2 (Intermediate HTML, CSS and JavaScript). It's a small web app with two parts on one page - a contact form with validation, and a to-do list that you can add/delete/complete tasks in. Built with plain HTML, CSS and JavaScript, no libraries or frameworks.

## Files

- `index.html` - the markup for both the form and the todo list
- `style.css` - all the styling
- `script.js` - form validation + todo list logic

Just open `index.html` in any browser, nothing needs to be installed or built.

## What it does

**Contact form**
- Name, Email, Subject and Message fields, all required
- Checks the email is in a valid format before letting you submit
- Shows an error message right under the field if something's wrong, and clears it once you fix it
- If everything's filled in correctly, it shows a "message sent" confirmation and resets the form (there's no backend so it doesn't actually send anywhere, it's just simulating a successful submit)

**To-do list**
- Type a task and hit Add task (or press enter)
- Click the circle next to a task to mark it done / undone
- Click the x to delete a task
- Filter buttons at the top to switch between All / Active / Completed
- Small ring in the corner fills up based on how many tasks are done
- Starts with two example tasks already in the list just so it's not empty when you first open it

## Notes on how it's built

- Layout uses CSS Grid for the overall two-column page (form on the left, todo on the right) and Flexbox for things like the form fields stacking and the todo item rows
- Everything is responsive - on narrower screens the two columns stack on top of each other
- Form validation happens on blur (when you click away from a field) and again on submit, so you get feedback without it being annoying while typing
- Task data is just kept in a JS array in memory, so refreshing the page will reset it back to the two sample tasks

## Possible improvements

If I had more time I'd probably add localStorage so tasks persist after a refresh, and maybe drag-to-reorder for the list.
