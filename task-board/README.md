# Task Board

A polished, responsive task management board built with vanilla HTML, CSS, and JavaScript.

## Features

- Four workflow columns: Backlog, To Do, In Progress, Done
- Create, edit, delete, and drag-and-drop task cards
- Search and filter by priority and category
- Live dashboard stats: total, completed, high-priority, overdue
- Light and dark theme toggle
- Data persistence with localStorage (tasks + theme)
- Responsive layout for desktop and mobile

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6)

## Project Structure

```text
.
├── task-board.html
├── style.css
└── app.js
```

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/your-username/task-board.git
```

2. Open the project folder.
3. Launch task-board.html in your browser.

No build tools or dependencies are required.

## Usage

- Click + New Task to add a task.
- Use Edit/Delete actions on each card.
- Drag cards between columns to update status.
- Use the search bar and dropdown filters to narrow tasks.
- Toggle the theme with the moon/sun button.

## Notes

- Tasks and theme preference are saved in your browser localStorage.
- Clearing browser storage will reset saved tasks.

## Suggested Improvements

- Add due-date formatting based on locale
- Add keyboard-first drag/drop alternatives
- Add export/import for task data
- Add unit tests for filtering and date logic

## License

This project is available under the MIT License.
