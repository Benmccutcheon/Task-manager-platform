const taskModal = document.getElementById("taskModal");
const openModalBtn = document.getElementById("openModalBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelBtn = document.getElementById("cancelBtn");
const taskForm = document.getElementById("taskForm");
const modalTitle = document.getElementById("modalTitle");

const taskIdInput = document.getElementById("taskId");
const taskTitleInput = document.getElementById("taskTitle");
const taskDescriptionInput = document.getElementById("taskDescription");
const taskPriorityInput = document.getElementById("taskPriority");
const taskCategoryInput = document.getElementById("taskCategory");
const taskDueDateInput = document.getElementById("taskDueDate");
const taskAssigneeInput = document.getElementById("taskAssignee");
const taskStatusInput = document.getElementById("taskStatus");

const searchInput = document.getElementById("searchInput");
const priorityFilter = document.getElementById("priorityFilter");
const categoryFilter = document.getElementById("categoryFilter");
const themeToggle = document.getElementById("themeToggle");

const MAX_VISIBLE_TASKS = 2;
const viewAllModal = document.getElementById("viewAllModal");
const closeViewAllBtn = document.getElementById("closeViewAllBtn");
const viewAllTitle = document.getElementById("viewAllTitle");
const viewAllList = document.getElementById("viewAllList");

let draggedTaskId = null;
const TASKS_STORAGE_KEY = "taskBoard.tasks.v1";
const THEME_STORAGE_KEY = "taskBoard.theme.v1";

const defaultTasks = [
	{
		id: 1,
		title: "Design hero section",
		description: "Create the polished layout and card styling for the project shell.",
		priority: "high",
		category: "Design",
		dueDate: "2026-07-21",
		assignee: "Ben",
		status: "backlog"
	},
	{
		id: 2,
		title: "Build modal form",
		description: "Add create and edit flows with clean form validation.",
		priority: "medium",
		category: "Frontend",
		dueDate: "2026-07-22",
		assignee: "Ben",
		status: "todo"
	},
	{
		id: 3,
		title: "Implement drag and drop",
		description: "Allow users to move cards between board columns.",
		priority: "high",
		category: "JavaScript",
		dueDate: "2026-07-20",
		assignee: "Ben",
		status: "progress"
	},
	{
		id: 4,
		title: "Prepare GitHub README",
		description: "Write features, screenshots, stack, and future improvements.",
		priority: "low",
		category: "Portfolio",
		dueDate: "2026-07-25",
		assignee: "Ben",
		status: "done"
	}
];

let tasks = loadTasks();

function saveTasks() {
	localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
}

function loadTasks() {
	try {
		const savedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
		if (!savedTasks) {
			return [...defaultTasks];
		}

		const parsedTasks = JSON.parse(savedTasks);
		if (!Array.isArray(parsedTasks)) {
			return [...defaultTasks];
		}

		return parsedTasks;
	} catch {
		return [...defaultTasks];
	}
}

function applySavedTheme() {
	const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
	if (savedTheme === "light") {
		document.body.classList.add("light");
	}
	updateThemeButtonIcon();
}

function updateThemeButtonIcon() {
	themeToggle.textContent = document.body.classList.contains("light") ? "☀️" : "🌙";
}

function createMetaRow(label, value) {
	const row = document.createElement("span");
	const labelStrong = document.createElement("strong");
	labelStrong.textContent = `${label}:`;
	row.appendChild(labelStrong);
	row.append(` ${value}`);
	return row;
}

function parseLocalDate(dateString) {
	if (!dateString || typeof dateString !== "string") {
		return null;
	}

	const dateParts = dateString.split("-");
	if (dateParts.length !== 3) {
		return null;
	}

	const year = Number(dateParts[0]);
	const month = Number(dateParts[1]);
	const day = Number(dateParts[2]);

	if ([year, month, day].some(Number.isNaN)) {
		return null;
	}

	return new Date(year, month - 1, day);
}

function openModal(editMode = false, task = null) {
	taskModal.classList.remove("hidden");

	if (editMode && task) {
		modalTitle.textContent = "Edit Task";
		taskIdInput.value = task.id;
		taskTitleInput.value = task.title;
		taskDescriptionInput.value = task.description;
		taskPriorityInput.value = task.priority;
		taskCategoryInput.value = task.category;
		taskDueDateInput.value = task.dueDate;
		taskAssigneeInput.value = task.assignee;
		taskStatusInput.value = task.status;
	} else {
		modalTitle.textContent = "Create Task";
		taskForm.reset();
		taskIdInput.value = "";
		taskStatusInput.value = "backlog";
	}
}

function closeModal() {
	taskModal.classList.add("hidden");
	taskForm.reset();
	taskIdInput.value = "";
}

function formatStatusLabel(status) {
    const labels = {
        backlog: "Backlog",
        todo: "To Do",
        progress: "In Progress",
        done: "Done"
    };
    return labels[status] || status;
}

function openViewAllModal(status, columnTasks) {
    viewAllTitle.textContent = `${formatStatusLabel(status)} Tasks (${columnTasks.length})`;
    viewAllList.innerHTML = "";

    columnTasks.forEach((task) => {
        const card = createTaskCard(task);
        card.draggable = false;
        viewAllList.appendChild(card);
    });

    attachCardActionEvents();
    viewAllModal.classList.remove("hidden");
}

function closeViewAllModal() {
    viewAllModal.classList.add("hidden");
    viewAllList.innerHTML = "";
}

openModalBtn.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);

if (closeViewAllBtn) {
	closeViewAllBtn.addEventListener("click", closeViewAllModal);
}

if (viewAllModal) {
	viewAllModal.addEventListener("click", (e) => {
		if (e.target === viewAllModal) {
			closeViewAllModal();
		}
	});
}

taskModal.addEventListener("click", (e) => {
	if (e.target === taskModal) {
		closeModal();
	}
});

function isOverdue(dateString, status) {
	if (status === "done") {
		return false;
	}

	const due = parseLocalDate(dateString);
	if (!due) {
		return false;
	}

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	return due < today;
}

function createTaskCard(task) {
	const card = document.createElement("article");
	card.className = "task-card";
	card.draggable = true;
	card.dataset.id = task.id;

	const taskTop = document.createElement("div");
	taskTop.className = "task-top";

	const priorityPill = document.createElement("span");
	priorityPill.className = `priority-pill priority-${task.priority}`;
	priorityPill.textContent = task.priority;

	const cardMenu = document.createElement("div");
	cardMenu.className = "card-menu";

	const editButton = document.createElement("button");
	editButton.className = "edit-btn";
	editButton.dataset.id = task.id;
	editButton.setAttribute("aria-label", `Edit task ${task.title}`);
	editButton.textContent = "Edit";

	const deleteButton = document.createElement("button");
	deleteButton.className = "delete-btn";
	deleteButton.dataset.id = task.id;
	deleteButton.setAttribute("aria-label", `Delete task ${task.title}`);
	deleteButton.textContent = "Delete";

	cardMenu.append(editButton, deleteButton);
	taskTop.append(priorityPill, cardMenu);

	const title = document.createElement("h3");
	title.textContent = task.title;

	const description = document.createElement("p");
	description.textContent = task.description;

	const meta = document.createElement("div");
	meta.className = "meta";
	meta.append(
		createMetaRow("Category", task.category),
		createMetaRow("Assignee", task.assignee),
		createMetaRow("Due", task.dueDate)
	);

	const statusText = document.createElement("span");
	if (isOverdue(task.dueDate, task.status)) {
		statusText.className = "overdue";
		statusText.textContent = "Overdue";
	} else {
		statusText.textContent = "On track";
	}
	meta.appendChild(statusText);

	card.append(taskTop, title, description, meta);

	card.addEventListener("dragstart", () => {
		draggedTaskId = Number(task.id);
		card.classList.add("dragging");
	});

	card.addEventListener("dragend", () => {
		card.classList.remove("dragging");
	});

	return card;
}

function getFilteredTasks() {
	const searchValue = searchInput.value.toLowerCase().trim();
	const priorityValue = priorityFilter.value;
	const categoryValue = categoryFilter.value;

	return tasks.filter((task) => {
		const matchesSearch =
			task.title.toLowerCase().includes(searchValue) ||
			task.description.toLowerCase().includes(searchValue) ||
			task.assignee.toLowerCase().includes(searchValue);

		const matchesPriority = priorityValue === "all" || task.priority === priorityValue;
		const matchesCategory = categoryValue === "all" || task.category === categoryValue;

		return matchesSearch && matchesPriority && matchesCategory;
	});
}

function updateCategoryFilter() {
	const currentSelection = categoryFilter.value;
	const categories = [...new Set(tasks.map((task) => task.category))].sort();
	categoryFilter.innerHTML = "";

	const allOption = document.createElement("option");
	allOption.value = "all";
	allOption.textContent = "All categories";
	categoryFilter.appendChild(allOption);

	categories.forEach((category) => {
		const option = document.createElement("option");
		option.value = category;
		option.textContent = category;
		categoryFilter.appendChild(option);
	});

	if (categories.includes(currentSelection) || currentSelection === "all") {
		categoryFilter.value = currentSelection;
	} else {
		categoryFilter.value = "all";
	}
}

function updateStats() {
	document.getElementById("totalTasks").textContent = tasks.length;
	document.getElementById("completedTasks").textContent = tasks.filter((task) => task.status === "done").length;
	document.getElementById("highPriorityTasks").textContent = tasks.filter((task) => task.priority === "high").length;
	document.getElementById("overdueTasks").textContent = tasks.filter((task) => isOverdue(task.dueDate, task.status)).length;
}

function updateColumnCounts(filteredTasks) {
	const statuses = ["backlog", "todo", "progress", "done"];
	statuses.forEach((status) => {
		const count = filteredTasks.filter((task) => task.status === status).length;
		document.getElementById(`count-${status}`).textContent = count;
	});
}

function renderTasks() {
	const filteredTasks = getFilteredTasks();
	const columns = {
		backlog: document.getElementById("backlog"),
		todo: document.getElementById("todo"),
		progress: document.getElementById("progress"),
		done: document.getElementById("done")
	};

	Object.values(columns).forEach((column) => {
		column.innerHTML = "";
	});

	Object.entries(columns).forEach(([status, column]) => {
		const columnTasks = filteredTasks.filter((task) => task.status === status);

		if (columnTasks.length === 0) {
			const emptyState = document.createElement("div");
			emptyState.className = "empty-state";
			emptyState.textContent = "No tasks here yet.";
			column.appendChild(emptyState);
			return;
		}

		const visibleTasks = columnTasks.slice(0, MAX_VISIBLE_TASKS);

		visibleTasks.forEach((task) => {
			column.appendChild(createTaskCard(task));
		});

		if (columnTasks.length > MAX_VISIBLE_TASKS) {
			const viewMoreBtn = document.createElement("button");
			viewMoreBtn.className = "view-more-btn";
			viewMoreBtn.textContent = `View more (${columnTasks.length - MAX_VISIBLE_TASKS})`;
			viewMoreBtn.addEventListener("click", () => openViewAllModal(status, columnTasks));
			column.appendChild(viewMoreBtn);
		}
	});

	updateColumnCounts(filteredTasks);
	updateStats();
	attachCardActionEvents();
}

function attachCardActionEvents() {
	document.querySelectorAll(".edit-btn").forEach((button) => {
		button.addEventListener("click", () => {
			const taskId = Number(button.dataset.id);
			const task = tasks.find((item) => item.id === taskId);
			openModal(true, task);
		});
	});

	document.querySelectorAll(".delete-btn").forEach((button) => {
		button.addEventListener("click", () => {
			const taskId = Number(button.dataset.id);
			tasks = tasks.filter((task) => task.id !== taskId);
			saveTasks();
			updateCategoryFilter();
			renderTasks();
		});
	});
}

taskForm.addEventListener("submit", (e) => {
	e.preventDefault();

	const taskData = {
		id: taskIdInput.value ? Number(taskIdInput.value) : Date.now(),
		title: taskTitleInput.value.trim(),
		description: taskDescriptionInput.value.trim(),
		priority: taskPriorityInput.value,
		category: taskCategoryInput.value.trim(),
		dueDate: taskDueDateInput.value,
		assignee: taskAssigneeInput.value.trim(),
		status: taskStatusInput.value
	};

	if (taskIdInput.value) {
		tasks = tasks.map((task) => (task.id === taskData.id ? taskData : task));
	} else {
		tasks.unshift(taskData);
	}

	saveTasks();
	updateCategoryFilter();
	renderTasks();
	closeModal();
});

searchInput.addEventListener("input", renderTasks);
priorityFilter.addEventListener("change", renderTasks);
categoryFilter.addEventListener("change", renderTasks);

document.querySelectorAll(".column").forEach((column) => {
	column.addEventListener("dragover", (e) => {
		e.preventDefault();
		column.classList.add("drag-over");
	});

	column.addEventListener("dragleave", () => {
		column.classList.remove("drag-over");
	});

	column.addEventListener("drop", () => {
		column.classList.remove("drag-over");
		const newStatus = column.dataset.status;

		tasks = tasks.map((task) =>
			task.id === draggedTaskId ? { ...task, status: newStatus } : task
		);

		saveTasks();
		renderTasks();
	});
});

themeToggle.addEventListener("click", () => {
	document.body.classList.toggle("light");
	localStorage.setItem(
		THEME_STORAGE_KEY,
		document.body.classList.contains("light") ? "light" : "dark"
	);
	updateThemeButtonIcon();
});

applySavedTheme();
updateCategoryFilter();
renderTasks();