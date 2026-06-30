/* ==========================================
   TASKFLOW - PART 3A
   Variables & Initialization
========================================== */

const taskInput = document.getElementById("taskInput");
const dueDate = document.getElementById("dueDate");
const priority = document.getElementById("priority");
const addTaskBtn = document.getElementById("addTask");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("search");
const sortBtn = document.getElementById("sortDate");
const clearCompletedBtn = document.getElementById("clearCompleted");
const filters = document.querySelectorAll(".filter");
const emptyState = document.getElementById("emptyState");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

/* ==========================================
   SAVE TASKS
========================================== */

function saveTasks() {

    localStorage.setItem("tasks", JSON.stringify(tasks));

}

/* ==========================================
   CREATE TASK
========================================== */

function createTask() {

    const text = taskInput.value.trim();

    if (text === "") {

        showToast("Please enter a task.");

        return;

    }

    const task = {

        id: Date.now(),

        text: text,

        date: dueDate.value,

        priority: priority.value,

        completed: false

    };

    tasks.push(task);

    saveTasks();

    renderTasks();

    taskInput.value = "";

    dueDate.value = "";

    priority.value = "Low";

    showToast("Task Added Successfully");

}

/* ==========================================
   RENDER TASKS
========================================== */

function renderTasks() {

    taskList.innerHTML = "";

    let filteredTasks = [...tasks];

    /* Search */

    const keyword = searchInput.value.toLowerCase();

    filteredTasks = filteredTasks.filter(task =>

        task.text.toLowerCase().includes(keyword)

    );

    /* Filters */

    if (currentFilter === "active") {

        filteredTasks = filteredTasks.filter(task => !task.completed);

    }

    if (currentFilter === "completed") {

        filteredTasks = filteredTasks.filter(task => task.completed);

    }

    if (filteredTasks.length === 0) {

        emptyState.style.display = "flex";

    }

    else {

        emptyState.style.display = "none";

    }

    filteredTasks.forEach(task => {

        const card = document.createElement("div");

        card.className = "task-card";

        if (task.completed) {

            card.classList.add("completed");

        }

        card.innerHTML = `

<div class="task-left">

<input
type="checkbox"
${task.completed ? "checked" : ""}
onclick="toggleTask(${task.id})">

<div class="task-details">

<h3>${task.text}</h3>

<p>

📅 ${task.date || "No Due Date"}

</p>

<span class="priority ${task.priority.toLowerCase()}">

${task.priority}

</span>

</div>

</div>

<div class="task-actions">

<button
class="edit-btn"
onclick="editTask(${task.id})">

<i class="fa-solid fa-pen"></i>

</button>

<button
class="delete-btn"
onclick="deleteTask(${task.id})">

<i class="fa-solid fa-trash"></i>

</button>

</div>

`;

        taskList.appendChild(card);

    });

    updateStatistics();

}

/* ==========================================
   EVENT LISTENERS
========================================== */

addTaskBtn.addEventListener("click", createTask);

taskInput.addEventListener("keypress", function(e){

    if(e.key === "Enter"){

        createTask();

    }

});

searchInput.addEventListener("input", renderTasks);

/* ==========================================
   INITIAL LOAD
========================================== */

renderTasks();
/* ==========================================
   PART 3B
   Toggle • Edit • Delete • Filters • Sort
========================================== */

/* Toggle Complete */

function toggleTask(id){

    tasks = tasks.map(task => {

        if(task.id === id){

            task.completed = !task.completed;

        }

        return task;

    });

    saveTasks();

    renderTasks();

    showToast("Task Updated");

}

/* Delete Task */

function deleteTask(id){

    const confirmDelete = confirm("Delete this task?");

    if(!confirmDelete) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();

    showToast("Task Deleted");

}

/* Edit Task */

function editTask(id){

    const task = tasks.find(t => t.id === id);

    if(!task) return;

    const newTask = prompt("Edit Task", task.text);

    if(newTask === null) return;

    if(newTask.trim() === ""){

        showToast("Task cannot be empty");

        return;

    }

    task.text = newTask.trim();

    saveTasks();

    renderTasks();

    showToast("Task Updated");

}

/* ==========================================
   FILTERS
========================================== */

filters.forEach(button=>{

    button.addEventListener("click",()=>{

        filters.forEach(btn=>btn.classList.remove("active"));

        button.classList.add("active");

        currentFilter = button.dataset.filter;

        renderTasks();

    });

});

/* ==========================================
   SORT TASKS
========================================== */

sortBtn.addEventListener("click",()=>{

    tasks.sort((a,b)=>{

        if(a.date==="" && b.date==="") return 0;

        if(a.date==="") return 1;

        if(b.date==="") return -1;

        return new Date(a.date)-new Date(b.date);

    });

    saveTasks();

    renderTasks();

    showToast("Sorted by Due Date");

});

/* ==========================================
   CLEAR COMPLETED
========================================== */

clearCompletedBtn.addEventListener("click",()=>{

    const completed = tasks.filter(task=>task.completed);

    if(completed.length===0){

        showToast("No completed tasks");

        return;

    }

    if(confirm("Clear all completed tasks?")){

        tasks = tasks.filter(task=>!task.completed);

        saveTasks();

        renderTasks();

        showToast("Completed Tasks Cleared");

    }

});
/* ==========================================
   PART 3C
   Statistics • Progress • Toast • Theme
========================================== */

/* ---------- DOM Elements ---------- */

const totalTasks = document.getElementById("totalTasks");
const activeTasks = document.getElementById("activeTasks");
const completedTasks = document.getElementById("completedTasks");
const completionRate = document.getElementById("completionRate");

const allCount = document.getElementById("allCount");
const activeCount = document.getElementById("activeCount");
const completedCount = document.getElementById("completedCount");

const progressCircle = document.getElementById("progressCircle");
const progressValue = document.getElementById("progressValue");

const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");

const themeBtn = document.getElementById("themeBtn");

/* ==========================================
   UPDATE STATISTICS
========================================== */

function updateStatistics(){

    const total = tasks.length;

    const completed = tasks.filter(task=>task.completed).length;

    const active = total - completed;

    totalTasks.textContent = total;
    activeTasks.textContent = active;
    completedTasks.textContent = completed;

    allCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;

    const percent = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    completionRate.textContent = percent + "%";
    progressValue.textContent = percent + "%";

    updateProgressCircle(percent);

}

/* ==========================================
   PROGRESS RING
========================================== */

function updateProgressCircle(percent){

    const radius = 70;

    const circumference = 2 * Math.PI * radius;

    progressCircle.style.strokeDasharray = circumference;

    const offset =
        circumference -
        (percent / 100) * circumference;

    progressCircle.style.strokeDashoffset = offset;

}

/* ==========================================
   TOAST MESSAGE
========================================== */

let toastTimer;

function showToast(message){

    toastText.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(()=>{

        toast.classList.remove("show");

    },2500);

}

/* ==========================================
   DARK MODE
========================================== */

const savedTheme =
    localStorage.getItem("theme");

if(savedTheme==="dark"){

    document.body.classList.add("dark");

    themeBtn.innerHTML =
    '<i class="fa-solid fa-sun"></i>';

}

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){

        localStorage.setItem("theme","dark");

        themeBtn.innerHTML =
        '<i class="fa-solid fa-sun"></i>';

        showToast("Dark Mode Enabled");

    }

    else{

        localStorage.setItem("theme","light");

        themeBtn.innerHTML =
        '<i class="fa-solid fa-moon"></i>';

        showToast("Light Mode Enabled");

    }

});

/* ==========================================
   START APP
========================================== */

updateStatistics();

renderTasks();