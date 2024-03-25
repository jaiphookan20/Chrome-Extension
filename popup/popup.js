let tasks = [];

function updateTime() {
  chrome.storage.local.get(["timer", "timeOption", "isRunning"], (res) => {
    const time = document.getElementById("time");
    const minutes = `${res.timeOption - Math.ceil(res.timer / 60)}`.padStart(
      2,
      "0"
    );
    let seconds = "00";
    if (res.timer % 60 != 0) {
      seconds = `${60 - (res.timer % 60)}`.padStart(2, "0");
    }
    time.textContent = `${minutes}:${seconds}`;
    startTimerBtn.textContent = res.isRunning ? "Pause Timer" : "Start Timer";
  });
}
d;
updateTime();
setInterval(updateTime, 1000);

const startTimerBtn = document.getElementById("start-timer-btn");
startTimerBtn.addEventListener("click", () => {
  chrome.storage.local.get(["isRunning"], (res) => {
    chrome.storage.local.set(
      {
        isRunning: !res.isRunning,
      },
      () => {
        startTimerBtn.textContent = !res.isRunning
          ? "Pause Timer"
          : "Start Timer";
      }
    );
  });
});

const resetTimerBtn = document.getElementById("reset-timer-btn");
resetTimerBtn.addEventListener("click", () => {
  chrome.storage.local.set(
    {
      timer: 0,
      isRunning: false,
    },
    () => {
      startTimerBtn.textContent = "Start Timer";
    }
  );
});

const addTaskRowBtn = document.getElementById("add-task-row-btn");
addTaskRowBtn.addEventListener("click", addTaskRow);

const saveTaskBtn = document.getElementById("save-task-btn");
saveTaskBtn.addEventListener("click", saveTask);

chrome.storage.sync.get(["tasks"], (res) => {
  tasks = res.tasks ? res.tasks : [];
  renderTasks();
});

function saveTasks() {
  chrome.storage.sync.set({
    tasks,
  });
}

function renderTask(taskNum) {
  const taskRow = document.createElement("div");
  taskRow.className = "task-row";

  const text = document.createElement("input");
  text.type = "text";
  text.placeholder = "Enter a task...";
  text.value = tasks[taskNum].text;
  text.className = "task-input";
  text.addEventListener("change", () => {
    tasks[taskNum].text = text.value;
    saveTasks();
  });

  const priority = document.createElement("select");
  priority.className = "task-priority";
  const priorityOptions = ["Standard", "Essential", "Immediate"];
  priorityOptions.forEach((option) => {
    const priorityOption = document.createElement("option");
    priorityOption.value = option;
    priorityOption.textContent = option;
    if (tasks[taskNum].priority === option) {
      priorityOption.selected = true;
    }
    priority.appendChild(priorityOption);
  });
  priority.addEventListener("change", () => {
    tasks[taskNum].priority = priority.value;
    saveTasks();
  });

  const dueDate = document.createElement("input");
  dueDate.type = "date";
  dueDate.value = tasks[taskNum].dueDate;
  dueDate.className = "task-due-date";
  dueDate.addEventListener("change", () => {
    tasks[taskNum].dueDate = dueDate.value;
    saveTasks();
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "task-delete";
  deleteBtn.addEventListener("click", () => {
    deleteTask(taskNum);
  });

  const subtasksContainer = document.createElement("div");
  subtasksContainer.className = "subtasks-container";

  tasks[taskNum].subtasks.forEach((subtask, subtaskNum) => {
    const subtaskRow = document.createElement("div");
    subtaskRow.className = "subtask-row";

    const subtaskText = document.createElement("input");
    subtaskText.type = "text";
    subtaskText.placeholder = "Enter a subtask...";
    subtaskText.value = subtask;
    subtaskText.className = "subtask-input";
    subtaskText.addEventListener("change", () => {
      tasks[taskNum].subtasks[subtaskNum] = subtaskText.value;
      saveTasks();
    });

    const subtaskDeleteBtn = document.createElement("button");
    subtaskDeleteBtn.textContent = "Delete";
    subtaskDeleteBtn.className = "subtask-delete";
    subtaskDeleteBtn.addEventListener("click", () => {
      tasks[taskNum].subtasks.splice(subtaskNum, 1);
      saveTasks();
      renderTasks();
    });

    subtaskRow.appendChild(subtaskText);
    subtaskRow.appendChild(subtaskDeleteBtn);
    subtasksContainer.appendChild(subtaskRow);
  });

  const addSubtaskBtn = document.createElement("button");
  addSubtaskBtn.textContent = "Add Subtask";
  addSubtaskBtn.className = "add-subtask-btn";
  addSubtaskBtn.addEventListener("click", () => {
    tasks[taskNum].subtasks.push("");
    saveTasks();
    renderTasks();
  });

  taskRow.appendChild(text);
  taskRow.appendChild(priority);
  taskRow.appendChild(dueDate);
  taskRow.appendChild(deleteBtn);
  taskRow.appendChild(subtasksContainer);
  taskRow.appendChild(addSubtaskBtn);

  const taskContainer = document.getElementById("task-container");
  taskContainer.appendChild(taskRow);
}

function addTaskRow() {
  const taskContainer = document.getElementById("task-container");

  const taskRow = document.createElement("div");
  taskRow.className = "task-row";

  const text = document.createElement("input");
  text.type = "text";
  text.placeholder = "Enter a task...";
  text.className = "task-input";

  const priority = document.createElement("select");
  priority.className = "task-priority";
  const priorityOptions = ["Standard", "Essential", "Immediate"];
  priorityOptions.forEach((option) => {
    const priorityOption = document.createElement("option");
    priorityOption.value = option;
    priorityOption.textContent = option;
    priority.appendChild(priorityOption);
  });

  const dueDate = document.createElement("input");
  dueDate.type = "date";
  dueDate.className = "task-due-date";

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.className = "task-delete";
  deleteBtn.addEventListener("click", () => {
    taskContainer.removeChild(taskRow);
  });

  taskRow.appendChild(text);
  taskRow.appendChild(priority);
  taskRow.appendChild(dueDate);
  taskRow.appendChild(deleteBtn);

  taskContainer.appendChild(taskRow);
}

function saveTask() {
  const taskRows = document.querySelectorAll(".task-row");
  tasks = [];

  taskRows.forEach((taskRow) => {
    const text = taskRow.querySelector(".task-input").value.trim();
    const priority = taskRow.querySelector(".task-priority").value;
    const dueDate = taskRow.querySelector(".task-due-date").value;

    if (text !== "") {
      tasks.push({
        text,
        priority,
        dueDate,
        subtasks: [],
      });
    }
  });

  saveTasks();
  renderTasks();
}

function deleteTask(taskNum) {
  tasks.splice(taskNum, 1);
  renderTasks();
  saveTasks();
}

function renderTasks() {
  const taskContainer = document.getElementById("task-container");
  taskContainer.textContent = "";

  const sortSelect = document.getElementById("sort-select");
  const sortOption = sortSelect.value;

  if (sortOption === "priority") {
    tasks.sort((a, b) => {
      const priorityOrder = ["Standard", "Essential", "Immediate"];
      return (
        priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority)
      );
    });
  } else if (sortOption === "dueDate") {
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  }

  tasks.forEach((_, taskNum) => {
    renderTask(taskNum);
  });
}

document.getElementById("sort-select").addEventListener("change", renderTasks);
